import { resolve } from "path";
import { argv } from "yargs";
import { check, format } from "./format";

// Constants
const ALREADY_MESSAGE = "All SVG files are formatted";

// Handle arguments
const arg = argv._[0];
const dirname = resolve(arg);
const fixing = argv.fix;

if (fixing) {
  const filesChanged = format(dirname);
  if (filesChanged) {
    console.log("Formatted SVG files");
  } else {
    console.log(ALREADY_MESSAGE);
  }
} else {
  const filesToFormat = check(dirname);
  if (filesToFormat.length > 0) {
    const reason = [
      "Not all SVG files were formatted.",
      `Unformatted files: ${filesToFormat.join(" ")}`,
    ].join(" ");
    throw reason;
  }
  console.log(ALREADY_MESSAGE);
}
