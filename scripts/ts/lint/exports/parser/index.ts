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

/** An import statement using a relative path */
interface RelativeImport {
  /** File being imported from */
  file: string;
  /** Variables being imported */
  specifiers: string[];
  /** Whether import statement includes the default import */
  hasDefault: boolean;
}

/**
 * Resolve path of import statement
 * @param importFrom File import statement is executed from
 * @param importTo File import statement points to
 * @returns Resolve path
 */
const resolveImportFilename = (importFrom: string, importTo: string) => {
  const dir = dirname(importTo);
  let resolvedFilename = resolve(dir, importFrom);
  if (extname(resolvedFilename) === "") {
    resolvedFilename += ".ts";
  }
  return resolvedFilename;
};

/**
 * Parse relative imports from AST
 * @param ast AST
 * @param filename Path to file being parsed
 * @return Relative import statements
 */
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

/**
 * Parse exported variables from AST
 * @param ast AST
 * @return Exported variables
 */
const parseExportedVariables = (ast: AST) => {
  const exportableDeclarations = ast.declarations.filter(dec =>
    isExportableDeclaration(dec),
  ) as ExportableDeclaration[];
  return exportableDeclarations
    .filter(exp => exp.isExported)
    .filter(dec => !(dec instanceof DefaultDeclaration))
    .map(exp => exp.name);
};

/**
 * Parse export statements from AST
 * @param ast AST
 * @param filename Path to file being parsed
 * @returns Export statements
 */
const parseExportStatements = (ast: AST, filename: string) => {
  const namedExportStatements: string[] = [];
  const starExportStatementsFrom: string[] = [];
  const reExportDefaultsFrom: string[] = [];
  for (const exp of ast.exports) {
    if (exp instanceof NamedExport) {
      const { specifiers } = exp;
      const names = specifiers ? specifiers.map(spec => spec.specifier) : [];
      namedExportStatements.push(...names);
      if (names.includes("default")) {
        const file = resolveImportFilename(exp.from, filename);
        reExportDefaultsFrom.push(file);
      }
    } else if (exp instanceof AllExport) {
      const file = resolveImportFilename(exp.from, filename);
      starExportStatementsFrom.push(file);
    } else {
      throw "Unknown export command";
    }
  }
  return {
    named: namedExportStatements,
    starsFrom: starExportStatementsFrom,
    reExportDefaultsFrom,
  };
};

/**
 * Parse default export from AST
 * @param ast AST
 * @returns Default export
 */
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

/** Import and export statements */
interface ImportsAndExports {
  /** Import statements */
  imports: RelativeImport[];
  /** Files in export statements in the form `export * from "..."` */
  starExportsFrom: string[];
  /** Names of variables being exported from export statements in the form `export const ... = ...` or `export { ... }` */
  namedExports: string[];
  /** Name of default export, or null if there is none */
  defaultExport: string | null;
  /** Files in export statements in the form `export { default as ... } from "..."` */
  reExportDefaultExportsFrom: string[];
}

/**
 * Parse imports and exports from file
 * @param filename Path to file being parsed
 */
const parseImportsAndExports = async (
  filename: string,
): Promise<ImportsAndExports> => {
  const source = readFileSync(filename).toString();
  const ast = await parser.parseSource(source);
  const imports = parseImports(ast, filename);
  const exportedVariables = parseExportedVariables(ast);
  const exportStatements = parseExportStatements(ast, filename);
  const defaultExport = getDefaultExport(ast);
  const namedExports = [...exportedVariables, ...exportStatements.named];
  const starExportsFrom = exportStatements.starsFrom;
  const reExportDefaultExportsFrom = exportStatements.reExportDefaultsFrom;
  return {
    imports,
    namedExports,
    defaultExport,
    starExportsFrom,
    reExportDefaultExportsFrom,
  };
};

export default parseImportsAndExports;
