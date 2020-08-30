import glob from "glob";
import { resolve } from "path";
import { argv } from "yargs";
import lintExports from "./exports";

const dir = argv._[0];
const pattern = `./${dir}/**/*.ts`;
const excludePattern = resolve(".", `${dir}/index.ts`);
const fix = argv.fix as boolean;

glob(pattern, (err, matches) => {
  if (err) throw err;

  const tsFiles = matches.map(fn => resolve(".", fn));
  const promise = Promise.all([lintExports(tsFiles, fix, excludePattern)]);

  promise
    .then(() => console.log("All linting checks passed"))
    .catch(err => {
      console.error(`Error linting: ${err}`);
      process.exit(1);
    });
});
