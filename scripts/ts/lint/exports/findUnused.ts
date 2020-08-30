import { readdirSync } from "fs";
import { basename, dirname, extname, resolve } from "path";
import parseImportsAndExports from "./parser";

/** Export statement */
interface ExpStatement {
  /** File being exported from */
  exportedFrom: string;
  /** Whether export is used by another file */
  used: boolean;
  /** Whether export is default export */
  isDefault: boolean;
  /** Name of exported variable */
  name: string;
}

/** Result of finding unused exports */
interface UnusedResult {
  /** Unused exports */
  unused: ExpStatement[];
  /** Unused exports from files other than the `index.ts` in the base directory (so this file can export the module) */
  nonIndexUnused: ExpStatement[];
}

/**
 * Find any unused exports in `.ts` files
 * @param baseDirname Diretory `.ts` files are in
 */
const findUnused = async (baseDirname: string): Promise<UnusedResult> => {
  /**
   * Checks whether file is the `index.ts` in the base directory
   * @param filename Path of file to check
   * @return Whether file is base `index.ts`
   */
  const isIndex = (filename: string) => {
    const filenameIsIndex = basename(filename, ".ts") === "index";
    const dirnameIsBase = dirname(filename) === resolve(baseDirname);
    return filenameIsIndex && dirnameIsBase;
  };

  const tsFiles = readdirSync(baseDirname)
    .map(fn => resolve(".", baseDirname, fn))
    .filter(fn => extname(fn) === ".ts");

  const expStatements: ExpStatement[] = [];

  // Exports
  for (const fn of tsFiles) {
    const importsAndExports = await parseImportsAndExports(fn);
    const { defaultExport, namedExports, starExportsFrom } = importsAndExports;
    // Named exports
    for (const exp of namedExports) {
      const expStatement: ExpStatement = {
        exportedFrom: fn,
        isDefault: false,
        name: exp,
        used: false,
      };
      expStatements.push(expStatement);
    }
    // Default export
    defaultExport &&
      expStatements.push({
        exportedFrom: fn,
        isDefault: true,
        name: defaultExport,
        used: false,
      });
    // Star exports
    if (starExportsFrom.length && !isIndex(fn)) {
      throw 'export * from "..." is not supported in files other than the base index.ts';
    }
  }

  // Imports
  for (const fn of tsFiles) {
    const {
      imports,
      reExportDefaultExportsFrom,
      starExportsFrom,
    } = await parseImportsAndExports(fn);
    for (const expStatement of expStatements) {
      // Named imports
      for (const imp of imports) {
        const sameFile = expStatement.exportedFrom === imp.file;
        const bothDefault = expStatement.isDefault && imp.hasDefault;
        const sameName =
          !bothDefault && imp.specifiers.includes(expStatement.name);
        const usedByImport = sameFile && (bothDefault || sameName);
        if (usedByImport) {
          expStatement.used = true;
        }
      }
      // Star exports
      const usedByStarExport = starExportsFrom.includes(
        expStatement.exportedFrom,
      );
      if (usedByStarExport) {
        expStatement.used = true;
      }
      // Default re-exports
      const usedByDefaultReExport = reExportDefaultExportsFrom.includes(
        expStatement.exportedFrom,
      );
      if (usedByDefaultReExport) {
        expStatement.used = true;
      }
    }
  }

  const unused = expStatements.filter(exp => !exp.used);
  const nonIndexUnused = unused.filter(exp => !isIndex(exp.exportedFrom));
  return {
    unused,
    nonIndexUnused,
  };
};

export default findUnused;
