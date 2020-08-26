import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import xmlFormat from "xml-formatter";

const SVG_PATTERN = /\.svg$/;

/**
 * Get string of some number of spaces
 * @param n Number of spaces
 * @returns String of spaces
 */
const spaces = (n: number) => " ".repeat(n);

/**
 * Get all SVG files from directory
 * @param dirname Path to directory
 * @return SVG files
 */
const getSvgFilenames = (dirname: string) => {
  const dirExists = existsSync(dirname);
  if (!dirExists) {
    const reason = `${dirname} doesn't exist`;
    throw reason;
  }
  const filenames = readdirSync(dirname);
  const svgFilenames = filenames
    .filter(fn => SVG_PATTERN.test(fn))
    .map(fn => resolve(__dirname, dirname, fn));
  if (!svgFilenames.length) {
    throw `No SVG files in ${dirname}`;
  }
  return svgFilenames;
};

/**
 * Get formatted SVG file
 * @param filename File to format
 * @returns Text of file before formatting, and after
 */
const getFormattedFile = (filename: string): [string, string] => {
  const before = readFileSync(filename).toString();
  const options = {
    indentation: spaces(2),
    lineSeparator: "\n",
    whiteSpaceAtEndOfSelfclosingTag: true,
  };
  const after = `${xmlFormat(before, options)}\n`;
  return [before, after];
};

/**
 * Check if all SVG files in directory are formatted
 * @param dirname Path to directory
 * @returns Whether files were formatted
 */
export const check = (dirname: string): string[] => {
  const filenames = getSvgFilenames(dirname);
  const filesAreFormatted = filenames.map(fn => {
    const [before, after] = getFormattedFile(fn);
    return before === after;
  });
  const filesToFormat = filenames.filter((fn, i) => {
    const isFormatted = filesAreFormatted[i];
    return !isFormatted;
  });
  return filesToFormat;
};

/**
 * Format SVG files in directory
 * @param dirname Path to directory
 * @returns Whether any files changed
 */
export const format = (dirname: string): boolean => {
  const filesToFormat = check(dirname);
  const alreadyFormatted = filesToFormat.length === 0;
  if (!alreadyFormatted) {
    filesToFormat.forEach(fn => {
      const [, after] = getFormattedFile(fn);
      writeFileSync(fn, after);
    });
  }
  return !alreadyFormatted;
};
