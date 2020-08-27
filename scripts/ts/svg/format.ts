import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { extname, resolve } from "path";
import xmlFormat from "xml-formatter";

// Helpers
/**
 * Get string of some number of spaces
 * @param n - Number of spaces
 * @returns String of spaces
 */
const spaces = (n: number) => " ".repeat(n);

/**
 * Get all SVG files from directory
 * @param dirname - Path to directory
 * @return SVG files
 */
const getSvgFilenames = (dirname: string) => {
  // If directory doesn't exist, throw error
  const dirExists = existsSync(dirname);
  if (!dirExists) {
    const reason = `${dirname} doesn't exist`;
    throw reason;
  }
  // Get all SVG filenames in directory
  const filenames = readdirSync(dirname);
  const svgFilenames = filenames
    .filter(fn => extname(fn) === ".svg")
    .map(fn => resolve(__dirname, dirname, fn));
  // If there are no SVG files, throw error
  if (!svgFilenames.length) {
    throw `No SVG files in ${dirname}`;
  }
  // Return SVG filenames
  return svgFilenames;
};

/**
 * Get formatted SVG file
 * @param filename - File to format
 * @returns Text of file before formatting, and after
 */
const getFormattedFile = (filename: string): [string, string] => {
  // Read file
  const before = readFileSync(filename).toString();
  // Define options
  const options = {
    indentation: spaces(2),
    lineSeparator: "\n",
    whiteSpaceAtEndOfSelfclosingTag: true,
  };
  // Format
  const after = `${xmlFormat(before, options)}\n`;
  // Return before, and after
  return [before, after];
};

// Exports
/**
 * Check which SVG files in directory need to be formatted
 * @param dirname - Path to directory
 * @returns Files that need formatting
 */
export const check = (dirname: string): string[] => {
  // Get SVG filenames
  const filenames = getSvgFilenames(dirname);
  // Find which files need formatting
  const filesToFormat = filenames.filter(fn => {
    const [before, after] = getFormattedFile(fn);
    const isFormatted = before === after;
    return !isFormatted;
  });
  // Return files to format
  return filesToFormat;
};

/**
 * Format SVG files in directory
 * @param dirname - Path to directory
 * @returns Whether any files changed
 */
export const format = (dirname: string): boolean => {
  // Get files to format
  const filesToFormat = check(dirname);
  // Override each file
  for (const fn of filesToFormat) {
    const [, after] = getFormattedFile(fn);
    writeFileSync(fn, after);
  }
  // Check if files changed
  const filesChanged = filesToFormat.length > 0;
  // Return if files changed
  return filesChanged;
};
