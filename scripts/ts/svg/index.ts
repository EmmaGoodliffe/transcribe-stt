import { resolve } from "path";
import { argv } from "yargs";
import { check } from "./format";

const arg = argv._[0];
const dirname = resolve(arg);

const filesToFormat = check(dirname);

if (filesToFormat.length > 0) {
  const reason = [
    "Not all SVG files were formatted.",
    `Unformatted files: ${filesToFormat.join(" ")}`,
  ].join(" ");
  throw reason;
}

console.log("All SVG files are formatted");
