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
  // Check
  const dirExists = existsSync(dirname);
  if (!dirExists) {
    const reason = `${dirname} doesn't exist`;
    throw reason;
  }
  // Read
  const filenames = readdirSync(dirname);
  // Extract
  const svgFilenames = filenames
    .filter(fn => extname(fn) === ".svg")
    .map(fn => resolve(__dirname, dirname, fn));
  // Return
  if (!svgFilenames.length) {
    throw `No SVG files in ${dirname}`;
  }
  return svgFilenames;
};

/**
 * Get formatted SVG file
 * @param filename - File to format
 * @returns Text of file before formatting, and after
 */
const getFormattedFile = (filename: string): [string, string] => {
  // Read
  const before = readFileSync(filename).toString();
  // Define
  const options = {
    indentation: spaces(2),
    lineSeparator: "\n",
    whiteSpaceAtEndOfSelfclosingTag: true,
  };
  // Format
  const after = `${xmlFormat(before, options)}\n`;
  // Return
  return [before, after];
};

// Functions
/**
 * Check which SVG files in directory need to be formatted
 * @param dirname - Path to directory
 * @returns Files which need formatting
 */
export const check = (dirname: string): string[] => {
  // Read
  const filenames = getSvgFilenames(dirname);
  // Extract
  const filesToFormat = filenames.filter(fn => {
    const [before, after] = getFormattedFile(fn);
    const isFormatted = before === after;
    return !isFormatted;
  });
  // Return
  return filesToFormat;
};

/**
 * Format SVG files in directory
 * @param dirname - Path to directory
 * @returns Whether any files changed
 */
export const format = (dirname: string): boolean => {
  // Read
  const filesToFormat = check(dirname);
  // Write
  for (const fn of filesToFormat) {
    const [, after] = getFormattedFile(fn);
    writeFileSync(fn, after);
  }
  // Return
  const filesChanged = filesToFormat.length > 0;
  return filesChanged;
};
