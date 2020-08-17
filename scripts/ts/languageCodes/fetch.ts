import fetch from "node-fetch";
import { writeFileSync } from "fs";

const LANG_CODE_URL =
  "https://cloud.google.com/speech-to-text/docs/common/languages.json";

type FixedArray<T, L extends number> = [T, ...T[]] & { length: L };

type ColumnLength = 8;

type Titles = FixedArray<Title, ColumnLength>;

type Record = FixedArray<string, ColumnLength>;

type Data = [Titles, ...Record[]];

interface Title {
  label: string;
  value: string;
}

const writeCsv = (path: string, titles: string[], records_: string[][]) => {
  let text = `${titles.join(",")}\n`;
  const records = records_.map(record =>
    record.map(field => field.replace(/,/g, "_")).join(",")
  );
  text += records.join("\n");
  writeFileSync(path, text);
};

const firstN = <T>(arr: T[], n: number) => arr.slice(0, n);

const main = async () => {
  const response = await fetch(LANG_CODE_URL);
  const data = (await response.json()) as Data;
  const [titles] = data;
  const titleLabels = titles.map(title => title.label);
  const records = data.slice(1) as Record[];
  const colNum = 2;
  const shortRecords = records.map(record => firstN(record, colNum));
  writeCsv(
    "./scripts/ts/languageCodes/output/data.csv",
    firstN(titleLabels, colNum),
    shortRecords
  );
};

main().catch(console.error);
