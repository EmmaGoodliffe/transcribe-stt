import { resolve } from "path";
import { argv } from "yargs";
import findUnused from "./findUnused";

const arg = argv._[0];
const baseDirname = resolve(arg);
const fixing = argv.fix;

const main = async () => {
  const unused = (await findUnused(baseDirname)).nonIndexUnused;
  if (!unused.length) {
    console.log("No unused exports");
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
  const suffixedReasons = fixing ? [...reasons, suffix] : reasons;
  const reason = suffixedReasons.join("\n");
  throw reason;
};

main().catch(console.error);
