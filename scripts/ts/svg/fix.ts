import { resolve } from "path";
import { argv } from "yargs";
import { format } from "./format";

const arg = argv._[0];
const dirname = resolve(arg);

const filesChanged = format(dirname);

if (filesChanged) {
  console.log("Formatted SVG files");
} else {
  console.log("All SVG files are formatted");
}
