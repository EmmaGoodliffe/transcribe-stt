import { mkdirSync, readFileSync, rmdirSync } from "fs";
import { STTStream, DistributedSTTStream } from "../src/ts";
import { relPathToAbs } from "../src/ts/helpers";

// Prepare environment
const relGoogleKeyFilename = "./lgim-stt-key.json";
const absGoogleKeyFilename = relPathToAbs(relGoogleKeyFilename);
process.env.GOOGLE_APPLICATION_CREDENTIALS = absGoogleKeyFilename;

// Constants
const TIME_LIMIT = 60 * 1000;
const AUDIO_FILENAME = "./test/input.wav";
const AUDIO_DIRNAME = "./test/audio_dist";
const TEXT_DIRNAME = "./test/text_dist";
const SAMPLE_RATE_HERTZ = 48000;

// Helpers
const createTextFilename = () =>
  relPathToAbs(`./${TEXT_DIRNAME}/stream${Date.now()}.txt`);

const clean = (s: string) =>
  s
    .replace("\r", "")
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
  "bad encoding stream",
  async () => {
    expect.assertions(2);
    const stream = new STTStream(AUDIO_FILENAME, createTextFilename(), {
      sampleRateHertz: SAMPLE_RATE_HERTZ,
      encoding: "ENCODING_UNSPECIFIED",
    });
    const [goodEncoding] = await stream.testHeaders();
    expect(goodEncoding).toBeFalsy();
    await expect(stream.start(false)).rejects.toMatch(/encoding/i);
  },
  TIME_LIMIT
);

test(
  "bad sample rate stream",
  async () => {
    expect.assertions(2);
    const stream = new STTStream(AUDIO_FILENAME, createTextFilename(), {
      sampleRateHertz: 0,
    });
    const [, goodSampleRate] = await stream.testHeaders();
    expect(goodSampleRate).toBeFalsy();
    await expect(stream.start(false)).rejects.toMatch(/sample rate/i);
  },
  TIME_LIMIT
);

test(
  "normal stream",
  async () => {
    expect.assertions(1);
    const textFilename = createTextFilename();
    const stream = new STTStream(AUDIO_FILENAME, textFilename, {
      sampleRateHertz: SAMPLE_RATE_HERTZ,
      languageCode: "en-GB",
    });
    const lines = (await stream.start(false)).join("\n");
    await delay(100);
    const transcript = readFileSync(textFilename).toString();
    expect(clean(lines)).toBe(clean(transcript));
  },
  TIME_LIMIT
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
        append: true,
        sampleRateHertz: SAMPLE_RATE_HERTZ,
        languageCode: "en-GB",
      }
    );
    const lines = (await stream.start(false)).join("\n");
    await delay(100);
    const transcript = readFileSync(textFilename).toString();
    expect(clean(lines)).toBe(clean(transcript));
  },
  TIME_LIMIT
);
