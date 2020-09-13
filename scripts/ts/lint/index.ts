import glob from "glob";
import { resolve } from "path";
import { argv } from "yargs";
import lintDependencies from "./dependencies";
import lintExports from "./exports";

// Arguments
const dirname = argv._[0];
const devDirname = argv._[1];
const fix = argv.fix as boolean;

const getGlobMatches = (pattern: string): Promise<string[]> =>
  new Promise((resolve, reject) => {
    glob(pattern, (err, matches) => {
      err && reject(err);
      resolve(matches);
    });
  });

const wrapPattern = (dirname: string) => `./${dirname}/**/*.ts`;

const pattern = wrapPattern(dirname);
const devPattern = wrapPattern(devDirname);
const excludePattern = resolve(".", `${dirname}/index.ts`);

// Run
const main = async () => {
  // Extract
  const matches = await getGlobMatches(pattern);
  const devMatches = await getGlobMatches(devPattern);
  // Resolve
  const tsFiles = matches.map(fn => resolve(".", fn));
  const devTsFiles = devMatches.map(fn => resolve(".", fn));
  // Lint
  return Promise.all([
    lintDependencies("./package.json", tsFiles, devTsFiles, "./.eslintrc.json"),
    lintExports(tsFiles, fix, excludePattern),
  ]);
};

main()
  .then(() => console.log("All linting checks passed"))
  .catch(err => {
    console.error(`Error linting: ${err}`);
    process.exit(1);
  });
