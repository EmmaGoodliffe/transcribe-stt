import { dirname, resolve } from "path";

export const relPathToAbs = (path: string): string =>
  resolve(dirname(""), path);
