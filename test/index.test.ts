import { existsSync, mkdirSync, readFileSync, rmdirSync } from "fs";
import fetch from "node-fetch";
import { resolve } from "path";
import { DistributedSTTStream, STTStream, STTStreamOptions } from "../src";

// Prepare environment
const relGoogleKeyFilename = "../key.json";
export const googleKeyFilename = resolve(__dirname, relGoogleKeyFilename);
process.env.GOOGLE_APPLICATION_CREDENTIALS = googleKeyFilename;

// Constants
export const AUDIO_FILENAME = "./test/input.wav";
export const AUDIO_DIRNAME = "./test/audio_dist";
const TEXT_DIRNAME = "./test/text_dist";
const JSON_URL = "https://jsonplaceholder.typicode.com/users/1/todos";
export const TIME_LIMIT = 60 * 1000;
const ENCODING = "LINEAR16";
const SAMPLE_RATE_HERTZ = 48000;
const LANGUAGE_CODE = "en-GB";
export const CONFIG: STTStreamOptions = {
  encoding: ENCODING,
  sampleRateHertz: SAMPLE_RATE_HERTZ,
  languageCode: LANGUAGE_CODE,
};

// Helpers
export const createTextFilename = (): string =>
  resolve(__dirname, `../${TEXT_DIRNAME}/stream${Date.now()}.txt`);

const normalise = (s: string) =>
  s
    .replace(/\r/g, "")
    .split("\n")
    .map(val => val.trim())
    .filter(val => val.length)
    .join("\n");

const delay = (time: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, time));

const update = () => delay(100);

beforeAll(async () => {
  rmdirSync(TEXT_DIRNAME, { recursive: true });
  mkdirSync(TEXT_DIRNAME);
  await update();
});

// Tests
describe("Environment", () => {
  test("tests work", () => {
    expect.assertions(2);
    expect(0).toBe(0);
    expect(0).not.toBe(1);
  });

  test(
    "async tests work",
    async () => {
      expect.assertions(1);
      await delay(5000);
      expect(0).toBe(0);
    },
    TIME_LIMIT,
  );

  test(
    "tests have access to internet",
    async () => {
      expect.assertions(1);
      const response = await fetch(JSON_URL);
      const json: unknown[] = await response.json();
      expect(json.length).toBeTruthy();
    },
    TIME_LIMIT,
  );

  test(
    "credentials are good",
    async () => {
      expect.assertions(2);
      const gac = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      expect(gac).toBeTruthy();
      expect(existsSync(gac as string)).toBeTruthy();
    },
    TIME_LIMIT,
  );
});

describe("STTStream", () => {
  test(".checkFiles", async () => {
    expect.assertions(1);
    const stream = new STTStream(AUDIO_FILENAME, null, CONFIG);
    const passed = stream.checkFiles();
    expect(passed).toBeTruthy();
  });

  test(
    ".start",
    async () => {
      expect.assertions(1);
      const textFilename = createTextFilename();
      const stream = new STTStream(AUDIO_FILENAME, textFilename, CONFIG);
      const lines = (await stream.start(false)).join("\n");
      await update();
      const transcript = readFileSync(textFilename).toString();
      expect(normalise(lines)).toBe(normalise(transcript));
    },
    TIME_LIMIT,
  );
});

describe("DistributedSTTStream", () => {
  test(
    '.on("distribute")',
    async () => {
      expect.assertions(1);
      const textFilename = createTextFilename();
      const stream = new DistributedSTTStream(
        AUDIO_FILENAME,
        AUDIO_DIRNAME,
        textFilename,
        CONFIG,
      );
      const promise = stream.start(false);
      // let eventFiredN = 0;
      // stream.on("distribute", () => {
      //   eventFiredN++;
      // });
      // await promise;
      // expect(eventFiredN).toBe(1);
      const listener = jest.fn();
      stream.on("distribute", listener);
      await promise;
      expect(listener).toBeCalledTimes(1);
    },
    TIME_LIMIT,
  );

  test(
    '.on("progress")',
    async () => {
      expect.assertions(5);
      const textFilename = createTextFilename();
      const stream = new DistributedSTTStream(
        AUDIO_FILENAME,
        AUDIO_DIRNAME,
        textFilename,
        CONFIG,
      );
      const promise = stream.start(false);
      const progressPercentages: number[] = [];
      stream.on("progress", progress => {
        progressPercentages.push(progress);
      });
      await promise;
      expect(progressPercentages.length).toBeGreaterThanOrEqual(2);
      expect(progressPercentages[0]).toBe(0);
      const sortedPercentages = [...progressPercentages].sort();
      expect(progressPercentages).toEqual(sortedPercentages);
      const uniquePercentages = Array.from(new Set(progressPercentages));
      expect(progressPercentages).toEqual(uniquePercentages);
      const lastValue = progressPercentages.slice(-1)[0];
      expect(lastValue).toBe(100);
    },
    TIME_LIMIT,
  );

  test(
    ".start",
    async () => {
      expect.assertions(1);
      const textFilename = createTextFilename();
      const stream = new DistributedSTTStream(
        AUDIO_FILENAME,
        AUDIO_DIRNAME,
        textFilename,
        CONFIG,
      );
      const lines = (await stream.start(false)).join("\n");
      await update();
      const transcript = readFileSync(textFilename).toString();
      expect(normalise(lines)).toBe(normalise(transcript));
    },
    TIME_LIMIT,
  );
});
