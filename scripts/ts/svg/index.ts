import { resolve } from "path";
import { argv } from "yargs";
import { check, format } from "./format";

// Constants
const FORMATTED_ALL_MESSAGE = "All SVG files are formatted";

// Arguments
const arg = argv._[0];
const dirname = resolve(arg);
const fixing = argv.fix;

// Run
if (fixing) {
  // Write
  const filesChanged = format(dirname);
  // Output
  if (filesChanged) {
    console.log("Formatted SVG files");
  } else {
    console.log(FORMATTED_ALL_MESSAGE);
  }
} else {
  // Read
  const filesToFormat = check(dirname);
  // Output
  if (filesToFormat.length > 0) {
    const reason = [
      "Not all SVG files were formatted.",
      `Unformatted files: ${filesToFormat.join(" ")}`,
    ].join(" ");
    throw reason;
  }
  console.log(FORMATTED_ALL_MESSAGE);
}
