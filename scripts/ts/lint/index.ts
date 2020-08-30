import { argv } from "yargs";
import lintExports from "./exports";

const promise = Promise.all([lintExports(argv)]);

promise
  .then(() => console.log("All linting checks passed"))
  .catch(err => console.error(`Error linting: ${err}`));
