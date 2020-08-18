import { mkdirSync, readFileSync, rmdirSync } from "fs";
import { STTStream, DistributedSTTStream } from "../src";
import { relPathToAbs } from "../src/helpers";

// Prepare environment
const relGoogleKeyFilename = "./key.json";
const absGoogleKeyFilename = relPathToAbs(relGoogleKeyFilename);
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
  relPathToAbs(`./${TEXT_DIRNAME}/stream${Date.now()}.txt`);

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
    const results = await stream.start(false);
    const lines = results.map(result => result.join("\n")).join("\n");
    await delay(100);
    const transcript = readFileSync(textFilename).toString();
    expect(clean(lines)).toBe(clean(transcript));
  },
  TIME_LIMIT,
);
