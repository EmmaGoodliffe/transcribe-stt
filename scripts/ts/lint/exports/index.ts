import findUnused from "./findUnused";

const main = async (
  tsFiles: string[],
  fix: boolean,
  exclude?: string | RegExp,
): Promise<void> => {
  const isIncluded = (error: string) => {
    if (!exclude) return true;
    if (typeof exclude === "string") {
      return !error.includes(exclude);
    } else if (typeof exclude === "object") {
      return !exclude.test(error);
    } else {
      throw "Unknown type of exclude pattern";
    }
  };

  const reasons: string[] = [];

  try {
    const unused = await findUnused(tsFiles);
    if (!unused.length) {
      return;
    }

    for (const exp of unused) {
      const name = exp.isDefault ? "default export" : `export ${exp.name}`;
      const file = exp.exportedFrom;
      const reason = `Unused ${name} from ${file}`;
      reasons.push(reason);
    }
  } catch (err) {
    if (isIncluded(`${err}`)) {
      throw err;
    }
  }

  const includedReasons = reasons.filter(err => isIncluded(err));
  if (includedReasons.length) {
    const suffix = "No fixes available";
    fix && reasons.push(suffix);
    throw includedReasons.join("\n");
  }
};

export default main;
