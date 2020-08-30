import { relative } from "path";
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

/**
 * Find any unused exports in `.ts` files
 * @param tsFiles `.ts` files to check
 * @returns Unused export statements
 */
const findUnused = async (tsFiles: string[]): Promise<ExpStatement[]> => {
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
    for (const exp of starExportsFrom) {
      const from_ = relative(".", exp);
      const relFn = relative(".", fn);
      console.log(`Skipping export * from "${from_}" in ${relFn}`);
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
  return unused;
};

export default findUnused;
