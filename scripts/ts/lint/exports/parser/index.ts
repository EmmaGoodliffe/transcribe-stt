import { readFileSync } from "fs";
import { dirname, extname, resolve } from "path";
import {
  AllExport,
  File as AST,
  DefaultDeclaration,
  ExportableDeclaration,
  isExportableDeclaration,
  NamedExport,
  NamedImport,
  TypescriptParser,
} from "typescript-parser";

// Clients
const parser = new TypescriptParser();

// Interfaces
/** An import statement using a relative path */
interface RelativeImport {
  /** File being imported from */
  file: string;
  /** Variables being imported */
  specifiers: string[];
  /** Whether import statement includes the default import */
  hasDefault: boolean;
}

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

// Helpers
/**
 * Resolve path of import statement
 * @param importFrom - File import statement is executed from
 * @param importTo - File import statement points to
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
 * @param ast - AST
 * @param filename - Path to file being parsed
 * @returns Relative import statements
 */
const parseImports = (ast: AST, filename: string) => {
  // Extract
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
  // Filter
  const relImports: RelativeImport[] = miniImports.filter(imp =>
    imp.file.includes("./"),
  );
  // Resolve
  const resolvedRelImports: RelativeImport[] = relImports.map(imp => {
    return {
      ...imp,
      file: resolveImportFilename(imp.file, filename),
    };
  });
  // Return
  return resolvedRelImports;
};

/**
 * Parse exported variables from AST
 * @param ast - AST
 * @returns Exported variables
 */
const parseExportedVariables = (ast: AST) => {
  // Extract
  const exportableDeclarations = ast.declarations.filter(dec =>
    isExportableDeclaration(dec),
  ) as ExportableDeclaration[];
  // Return
  return exportableDeclarations
    .filter(exp => exp.isExported)
    .filter(exp => !(exp instanceof DefaultDeclaration))
    .map(exp => exp.name);
};

/**
 * Parse export statements from AST
 * @param ast - AST
 * @param filename - Path to file being parsed
 * @returns Export statements
 */
const parseExportStatements = (ast: AST, filename: string) => {
  // Initialise
  const namedExportStatements: string[] = [];
  const starExportStatementsFrom: string[] = [];
  const reExportDefaultsFrom: string[] = [];
  for (const exp of ast.exports) {
    if (exp instanceof NamedExport) {
      // Named exports
      const { specifiers } = exp;
      const names = specifiers ? specifiers.map(spec => spec.specifier) : [];
      namedExportStatements.push(...names);
      // Default exports
      if (names.includes("default")) {
        const file = resolveImportFilename(exp.from, filename);
        reExportDefaultsFrom.push(file);
      }
    } else if (exp instanceof AllExport) {
      // All exports
      const file = resolveImportFilename(exp.from, filename);
      starExportStatementsFrom.push(file);
    } else {
      // Other exports
      throw "Unknown export statement";
    }
  }
  // Return
  return {
    named: namedExportStatements,
    starsFrom: starExportStatementsFrom,
    reExportDefaultsFrom,
  };
};

/**
 * Parse default export from AST
 * @param ast - AST
 * @returns Default export
 */
const parseDefaultExport = (ast: AST) => {
  // Extract
  const defaultDeclarations = ast.declarations.filter(
    dec => dec instanceof DefaultDeclaration,
  ) as DefaultDeclaration[];
  // Check
  if (defaultDeclarations.length > 1) {
    throw "More than 1 default export in declarations";
  }
  // Return
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

// Functions
/**
 * Parse imports and exports from file
 * @param filename - Path to file being parsed
 * @returns Imports and exports
 */
const parseImportsAndExports = async (
  filename: string,
): Promise<ImportsAndExports> => {
  // Read
  const source = readFileSync(filename).toString();
  // Parse
  const ast = await parser.parseSource(source);
  const imports = parseImports(ast, filename);
  const exportedVariables = parseExportedVariables(ast);
  const exportStatements = parseExportStatements(ast, filename);
  const defaultExport = parseDefaultExport(ast);
  // Extract
  const namedExports = [...exportedVariables, ...exportStatements.named];
  const starExportsFrom = exportStatements.starsFrom;
  const reExportDefaultExportsFrom = exportStatements.reExportDefaultsFrom;
  // Return
  return {
    imports,
    namedExports,
    defaultExport,
    starExportsFrom,
    reExportDefaultExportsFrom,
  };
};

export default parseImportsAndExports;
