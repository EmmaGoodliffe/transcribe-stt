import { mkdirSync, readFileSync, rmdirSync } from "fs";
import { dirname, resolve } from "path";
import { STTStream, DistributedSTTStream } from "../src";

// Prepare environment
const relGoogleKeyFilename = "./key.json";
const absGoogleKeyFilename = resolve(dirname(""), relGoogleKeyFilename);
process.env.GOOGLE_APPLICATION_CREDENTIALS = absGoogleKeyFilename;

// Constants
const AUDIO_FILENAME = "./test/input.wav";
const AUDIO_DIRNAME = "./test/audio_dist";
const TEXT_DIRNAME = "./test/text_dist";
const ENCODING = "LINEAR16";
const SAMPLE_RATE_HERTZ = 48000;
const LANGUAGE_CODE = "en-GB";
const TIME_LIMIT = 60 * 1000;

// Helpers
const createTextFilename = () =>
  resolve(dirname(""), `./${TEXT_DIRNAME}/stream${Date.now()}.txt`);

const clean = (s: string) =>
  s
    .replace(/\r/g, "")
    .split("\n")
    .map(val => val.trim())
    .filter(val => val.length)
    .join("\n");

const delay = (time: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, time));

// Empty output text folder
rmdirSync(TEXT_DIRNAME, { recursive: true });
mkdirSync(TEXT_DIRNAME);

// Tests
test(
  "normal stream",
  async () => {
    expect.assertions(1);
    const textFilename = createTextFilename();
    const stream = new STTStream(AUDIO_FILENAME, textFilename, {
      encoding: ENCODING,
      sampleRateHertz: SAMPLE_RATE_HERTZ,
      languageCode: LANGUAGE_CODE,
    });
    const lines = (await stream.start(false)).join("\n");
    await delay(100);
    const transcript = readFileSync(textFilename).toString();
    expect(clean(lines)).toBe(clean(transcript));
  },
  TIME_LIMIT,
);

test(
  "distributed stream",
  async () => {
    expect.assertions(1);
    const textFilename = createTextFilename();
    const stream = new DistributedSTTStream(
      AUDIO_FILENAME,
      AUDIO_DIRNAME,
      textFilename,
      {
        encoding: ENCODING,
        sampleRateHertz: SAMPLE_RATE_HERTZ,
        languageCode: LANGUAGE_CODE,
        append: true,
      },
    );
    stream.emptyTextFile();
    const results = await stream.start(false);
    const lines = results.join("\n");
    await delay(100);
    const transcript = readFileSync(textFilename).toString();
    expect(clean(lines)).toBe(clean(transcript));
  },
  TIME_LIMIT,
);
