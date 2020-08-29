import { readFileSync } from "fs";
import { dirname, extname, resolve } from "path";
import {
  AllExport,
  DefaultDeclaration,
  ExportableDeclaration,
  File as AST,
  isExportableDeclaration,
  NamedExport,
  NamedImport,
  TypescriptParser,
} from "typescript-parser";

const parser = new TypescriptParser();

interface RelativeImport {
  file: string;
  specifiers: string[];
  hasDefault: boolean;
}

const resolveImportFilename = (importFrom: string, importTo: string) => {
  const dir = dirname(importTo);
  let resolvedFilename = resolve(dir, importFrom);
  if (extname(resolvedFilename) === "") {
    resolvedFilename += ".ts";
  }
  return resolvedFilename;
};

const parseImports = (ast: AST, filename: string) => {
  const miniImports = ast.imports.map(imp => {
    if (imp instanceof NamedImport) {
      const { libraryName, specifiers, defaultAlias } = imp;
      return {
        file: libraryName,
        specifiers: specifiers.map(spec => spec.specifier),
        hasDefault: defaultAlias !== undefined,
      };
    } else {
      throw "Unknown import";
    }
  });
  const relImports: RelativeImport[] = miniImports.filter(imp =>
    imp.file.includes("./"),
  );
  const resolvedRelImports: RelativeImport[] = relImports.map(imp => {
    const resolvedFilename = resolveImportFilename(imp.file, filename);
    return {
      ...imp,
      file: resolvedFilename,
    };
  });
  return resolvedRelImports;
};

const parseExportedVariables = (ast: AST) => {
  const exportableDeclarations = ast.declarations.filter(dec =>
    isExportableDeclaration(dec),
  ) as ExportableDeclaration[];
  return exportableDeclarations
    .filter(exp => exp.isExported)
    .filter(dec => !(dec instanceof DefaultDeclaration))
    .map(exp => exp.name);
};

const parseExportCommands = (ast: AST, filename: string) => {
  const namedExportCommands: string[] = [];
  const starExportCommandsFrom: string[] = [];
  const reExportDefaultsFrom: string[] = [];
  for (const exp of ast.exports) {
    if (exp instanceof NamedExport) {
      const { specifiers } = exp;
      const names = specifiers ? specifiers.map(spec => spec.specifier) : [];
      namedExportCommands.push(...names);
      if (names.includes("default")) {
        const file = resolveImportFilename(exp.from, filename);
        reExportDefaultsFrom.push(file);
      }
    } else if (exp instanceof AllExport) {
      const file = resolveImportFilename(exp.from, filename);
      starExportCommandsFrom.push(file);
    } else {
      throw "Unknown export command";
    }
  }
  return {
    named: namedExportCommands,
    starsFrom: starExportCommandsFrom,
    reExportDefaultsFrom,
  };
};

const getDefaultExport = (ast: AST) => {
  const defaultDeclarations = ast.declarations.filter(
    dec => dec instanceof DefaultDeclaration,
  ) as DefaultDeclaration[];
  if (defaultDeclarations.length > 1) {
    throw "More than 1 default export in declarations";
  }
  if (defaultDeclarations.length) {
    const defaultExport = defaultDeclarations[0];
    if (!defaultExport.isExported) {
      throw "Default export is not exported";
    }
    return defaultExport.name;
  } else {
    return null;
  }
};

interface ImportsAndExports {
  imports: RelativeImport[];
  starExportsFrom: string[];
  namedExports: string[];
  defaultExport: string | null;
  reExportDefaultExportsFrom: string[];
}

const parseImportsAndExports = async (
  filename: string,
): Promise<ImportsAndExports> => {
  const source = readFileSync(filename).toString();
  const ast = await parser.parseSource(source);
  const imports = parseImports(ast, filename);
  const exportedVariables = parseExportedVariables(ast);
  const exportCommands = parseExportCommands(ast, filename);
  const defaultExport = getDefaultExport(ast);
  const namedExports = [...exportedVariables, ...exportCommands.named];
  const starExportsFrom = exportCommands.starsFrom;
  const reExportDefaultExportsFrom = exportCommands.reExportDefaultsFrom;
  return {
    imports,
    namedExports,
    defaultExport,
    starExportsFrom,
    reExportDefaultExportsFrom,
  };
};

export default parseImportsAndExports;
