import glob from "glob";
import { resolve } from "path";
import { argv } from "yargs";
import lintExports from "./exports";

// Arguments
const dir = argv._[0];
const pattern = `./${dir}/**/*.ts`;
const excludePattern = resolve(".", `${dir}/index.ts`);
const fix = argv.fix as boolean;

// Run
glob(pattern, (err, matches) => {
  // Handle
  if (err) throw err;
  // Resolve
  const tsFiles = matches.map(fn => resolve(".", fn));
  // Lint
  const promise = Promise.all([lintExports(tsFiles, fix, excludePattern)]);
  // Output
  promise
    .then(() => console.log("All linting checks passed"))
    .catch(err => {
      console.error(`Error linting: ${err}`);
      process.exit(1);
    });
});
