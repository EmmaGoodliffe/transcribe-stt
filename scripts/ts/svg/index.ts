import { resolve } from "path";
import { argv } from "yargs";
import { check, format } from "./format";

// Constants
const FORMATTED_ALL_MESSAGE = "All SVG files are formatted";

// Handle arguments
const arg = argv._[0];
const dirname = resolve(arg);
const fixing = argv.fix;

// If fixing
if (fixing) {
  // Format directory
  const filesChanged = format(dirname);
  // Log whether files changed
  if (filesChanged) {
    console.log("Formatted SVG files");
  } else {
    console.log(FORMATTED_ALL_MESSAGE);
  }
} else {
  // Otherwise, find which files need to be formatted
  const filesToFormat = check(dirname);
  // If there are files to format, throw error
  if (filesToFormat.length > 0) {
    const reason = [
      "Not all SVG files were formatted.",
      `Unformatted files: ${filesToFormat.join(" ")}`,
    ].join(" ");
    throw reason;
  }
  // Otherwise, log that files were formatted
  console.log(FORMATTED_ALL_MESSAGE);
}
