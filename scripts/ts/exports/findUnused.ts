import { readdirSync } from "fs";
import { basename, dirname, extname, resolve } from "path";
import parseImportsAndExports from "./parser";

interface ExportSummary {
  exportedFrom: string;
  used: boolean;
  isDefault: boolean;
  name: string;
}

interface UnusedResult {
  unused: ExportSummary[];
  nonIndexUnused: ExportSummary[];
}

const findUnused = async (baseDirname: string): Promise<UnusedResult> => {
  const filenames = readdirSync(baseDirname)
    .map(fn => resolve(".", baseDirname, fn))
    .filter(fn => extname(fn) === ".ts");

  const isIndex = (filename: string) => {
    const filenameIsIndex = basename(filename, ".ts") === "index";
    const dirnameIsBase = dirname(filename) === resolve(baseDirname);
    return filenameIsIndex && dirnameIsBase;
  };

  const summaries: ExportSummary[] = [];

  // Exports
  for (const fn of filenames) {
    const importsAndExports = await parseImportsAndExports(fn);
    const { defaultExport, namedExports, starExportsFrom } = importsAndExports;
    // Named exports
    for (const exp of namedExports) {
      const summary: ExportSummary = {
        exportedFrom: fn,
        isDefault: false,
        name: exp,
        used: false,
      };
      summaries.push(summary);
    }
    // Default export
    defaultExport &&
      summaries.push({
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
  for (const fn of filenames) {
    const {
      imports,
      reExportDefaultExportsFrom,
      starExportsFrom,
    } = await parseImportsAndExports(fn);
    for (const summary of summaries) {
      // Named imports
      for (const imp of imports) {
        const sameFile = summary.exportedFrom === imp.file;
        const bothDefault = summary.isDefault && imp.hasDefault;
        const sameName = !bothDefault && imp.specifiers.includes(summary.name);
        const usedByImport = sameFile && (bothDefault || sameName);
        if (usedByImport) {
          summary.used = true;
        }
      }
      // Star exports
      const usedByStarExport = starExportsFrom.includes(summary.exportedFrom);
      if (usedByStarExport) {
        summary.used = true;
      }
      // Default re-exports
      const usedByDefaultReExport = reExportDefaultExportsFrom.includes(
        summary.exportedFrom,
      );
      if (usedByDefaultReExport) {
        summary.used = true;
      }
    }
  }

  const unused = summaries.filter(sum => !sum.used);
  const nonIndexUnused = unused.filter(sum => !isIndex(sum.exportedFrom));
  return {
    unused,
    nonIndexUnused,
  };
};

export default findUnused;
