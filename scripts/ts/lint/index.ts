import glob from "glob";
import { argv } from "yargs";
import lintExports from "./exports";

const dir = argv._[0];
const pattern = `./${dir}/**/*.ts`;
const excludePattern = `${dir}/index.ts`;
const fix = argv.fix as boolean;

glob(pattern, (err, tsFiles) => {
  if (err) throw err;

  const promise = Promise.all([lintExports(tsFiles, fix, excludePattern)]);

  promise
    .then(() => console.log("All linting checks passed"))
    .catch(err => console.error(`Error linting: ${err}`));
});
