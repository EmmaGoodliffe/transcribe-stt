import findUnused from "./findUnused";

// Helpers
/**
 * Check whether error should be included
 * @param error - Error
 * @param exclude - Exclude pattern
 * @returns Whether error should be included
 */
const isIncluded = (error: string, exclude: string | RegExp | undefined) => {
  if (!exclude) return true;
  if (typeof exclude === "string") {
    return !error.includes(exclude);
  } else if (typeof exclude === "object") {
    return !exclude.test(error);
  } else {
    throw "Unknown type of exclude pattern";
  }
};

// Functions
/**
 * Lint exports of TS files
 * @param tsFiles - TS files to check
 * @param fix - Whether `--fix` was passed to CLI
 * @param exclude - A pattern used to exclude any errors which match it
 */
const main = async (
  tsFiles: string[],
  fix: boolean,
  exclude?: string | RegExp,
): Promise<void> => {
  // Initialise
  const reasons: string[] = [];
  // Extract
  const unused = await findUnused(tsFiles);
  if (!unused.length) {
    return;
  }
  // Handle
  for (const exp of unused) {
    const name = exp.isDefault ? "default export" : `export ${exp.name}`;
    const file = exp.exportedFrom;
    const reason = `Unused ${name} from ${file}`;
    reasons.push(reason);
  }
  // Filter
  const includedReasons = reasons.filter(err => isIncluded(err, exclude));
  // Return
  if (includedReasons.length) {
    const suffix = "No fixes available";
    fix && reasons.push(suffix);
    throw includedReasons.join("\n");
  }
  return;
};

export default main;
