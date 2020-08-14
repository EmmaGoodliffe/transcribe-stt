import { mkdirSync, readFileSync, rmdirSync } from "fs";
import { STTStream } from "../src/ts";
import { relPathToAbs } from "../src/ts/helpers";

// Prepare environment
const relGoogleKeyFilename = "./lgim-stt-key.json";
const absGoogleKeyFilename = relPathToAbs(relGoogleKeyFilename);
process.env.GOOGLE_APPLICATION_CREDENTIALS = absGoogleKeyFilename;

// Constants
const TIME_LIMIT = 60 * 1000;
const AUDIO_FILENAME = "./input.wav";
const SAMPLE_RATE_HERTZ = 48000;
const TEXT_DIR = "./test/text";

// Helpers
const createTextFilename = () => `./${TEXT_DIR}/stream${Date.now()}.output.txt`;

const clean = (s: string) =>
  s
    .replace("\r", "")
    .split("\n")
    .map(val => val.trim())
    .join("\n");

// Empty output text folder
rmdirSync(TEXT_DIR, { recursive: true });
mkdirSync(TEXT_DIR);

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
    const textFilename = createTextFilename();
    const stream = new STTStream(AUDIO_FILENAME, textFilename, {
      sampleRateHertz: SAMPLE_RATE_HERTZ,
      languageCode: "en-GB",
    });
    const lines = (await stream.start(false)).join("\n");
    const transcript = readFileSync(textFilename).toString();
    console.log(lines, transcript, clean(lines), clean(transcript));
    expect(clean(lines)).toBe(clean(transcript));
  },
  TIME_LIMIT
);
