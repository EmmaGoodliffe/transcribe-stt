import { resolve } from "path";
import { Arguments } from "yargs";
import findUnused from "./findUnused";

const main = async (argv: Arguments): Promise<void> => {
  const arg = argv._[0];
  const baseDirname = resolve(arg);
  const fix = argv.fix as boolean;

  const unused = (await findUnused(baseDirname)).nonIndexUnused;
  if (!unused.length) {
    return;
  }

  const reasons: string[] = [];
  for (const exp of unused) {
    const name = exp.isDefault ? "default export" : `export ${exp.name}`;
    const file = exp.exportedFrom;
    const reason = `Unused ${name} from ${file}`;
    reasons.push(reason);
  }

  const suffix = "No fixes available";
  fix && reasons.push(suffix);
  const reason = reasons.join("\n");
  throw reason;
};

export default main;
