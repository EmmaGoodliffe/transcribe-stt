import { readFileSync } from "fs";
import { TypescriptParser } from "typescript-parser";

const parser = new TypescriptParser();

interface DependencyList {
  [dependency: string]: string;
}

interface ScriptList {
  [script: string]: string;
}

const parsePackageJson = (filename: string) => {
  const raw = readFileSync(filename).toString();
  const json = JSON.parse(raw);
  const dependencies = (json.dependencies || {}) as DependencyList;
  const devDependencies = (json.devDependencies || {}) as DependencyList;
  const scriptList = (json.scripts || {}) as ScriptList;
  const deps = dependencies ? Object.keys(dependencies) : [];
  const devDeps = devDependencies ? Object.keys(devDependencies) : [];
  const scripts = scriptList ? Object.values(scriptList) : [];
  return { deps, devDeps, scripts };
};

const remove = <T extends string | number>(arr: T[], items: T[]) => {
  return arr.filter(el => !items.includes(el));
};

const getDepsFromTs = async (filename: string) => {
  const raw = readFileSync(filename).toString();
  const { imports } = await parser.parseSource(raw);
  const importedFiles = imports.map(imp => imp.libraryName);
  const importedDeps = importedFiles.filter(dep => !dep.includes("./"));
  return importedDeps;
};

const getDepsFromManyTs = async (filenames: string[]) => {
  const allImportedDeps: string[] = [];
  for (const fn of filenames) {
    const importedDeps = await getDepsFromTs(fn);
    allImportedDeps.push(...importedDeps);
  }
  const allUniqueDeps = Array.from(new Set(allImportedDeps));
  return allUniqueDeps;
};

const aliases = {
  cpy: "cpy-cli",
  tsc: "typescript",
  jest: "ts-jest",
};

const parseDepAlias = (dep: string) => {
  const alias = aliases[dep as keyof typeof aliases] || dep;
  return alias;
};

const getDepsFromScripts = (scripts: string[]) => {
  const allDeps = scripts
    .map(script => {
      const commands = script.split("&&").map(command => command.trim());
      const deps = commands.map(command => command.split(" ")[0]);
      return deps;
    })
    .flat();
  const aliasDeps = allDeps.map(dep => parseDepAlias(dep));
  const uniqueDeps = Array.from(new Set([...allDeps, ...aliasDeps]));
  return uniqueDeps;
};

const getRawEslintRcJson = (filename: string | null) => {
  if (!filename) return "";
  const raw = readFileSync(filename).toString();
  return raw;
};

const main = async (
  packageJsonFilename: string,
  tsFiles: string[],
  devTsFiles: string[],
  eslintRcJsonFilename: string | null,
  ignorePattern?: RegExp,
): Promise<void> => {
  const { deps, devDeps, scripts } = parsePackageJson(packageJsonFilename);
  const usedDeps = await getDepsFromManyTs(tsFiles);
  const unusedDeps = remove(deps, usedDeps);
  const usedDevDeps = await getDepsFromManyTs(devTsFiles);
  const shortDevDeps = devDeps.map(dep =>
    dep.includes("/") && !dep.includes("eslint") ? dep.split("/")[1] : dep,
  );
  const scriptDevDeps = getDepsFromScripts(scripts);
  const rawEslintRcJson = getRawEslintRcJson(eslintRcJsonFilename);
  const unusedDevDeps = remove(shortDevDeps, [
    "node",
    ...usedDevDeps,
    ...scriptDevDeps,
  ]);
  const allUnusedDeps = [...unusedDeps, ...unusedDevDeps];
  const isIgnored = (
    dep: string,
    pattern: RegExp | undefined,
    rawEslintRcJson: string,
  ) => {
    const matchesIgnorePattern = pattern && pattern.test(dep);
    const eslintDep = dep
      .replace(/\/eslint-plugin/, "")
      .replace(/eslint-\w+-/, "");
    const usedByEslint = rawEslintRcJson.includes(eslintDep);
    const result = matchesIgnorePattern || usedByEslint;
    return result;
  };
  const ignoredUnusedDeps = allUnusedDeps.filter(dep =>
    isIgnored(dep, ignorePattern, rawEslintRcJson),
  );
  const notIgnoredUnusedDeps = allUnusedDeps.filter(
    dep => !isIgnored(dep, ignorePattern, rawEslintRcJson),
  );
  if (ignoredUnusedDeps.length) {
    console.log(`Ignoring dependencies: ${ignoredUnusedDeps.join(" ")}`);
  }
  if (notIgnoredUnusedDeps.length) {
    const reason = `Unused dependencies: ${notIgnoredUnusedDeps.join(" ")}`;
    throw reason;
  }
};

export default main;
