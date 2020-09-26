import { resolve } from "path";
import { DistributedSTTStream, STTStream } from "../src";
import {
  AUDIO_DIRNAME,
  AUDIO_FILENAME,
  CONFIG,
  createTextFilename,
  googleKeyFilename,
  pause,
  TIME_LIMIT,
} from "./index.test";

// Constants
const CREDENTIALS_PATTERN = /GOOGLE_APPLICATION_CREDENTIALS/;
const ENOENT_PATTERN = /not all files exist/i;

// Tests
describe("Errors", () => {
  test("nothing", () => {
    expect(0).toBe(0);
  });

  test(
    "no credentials rejects",
    async () => {
      expect.assertions(2);
      process.env.GOOGLE_APPLICATION_CREDENTIALS = "";
      const stream = new STTStream(AUDIO_FILENAME, null, CONFIG);
      const dStream = new DistributedSTTStream(
        AUDIO_FILENAME,
        AUDIO_DIRNAME,
        null,
        CONFIG,
      );
      await expect(stream.start(false)).rejects.toMatch(CREDENTIALS_PATTERN);
      await expect(dStream.start(false)).rejects.toMatch(CREDENTIALS_PATTERN);
      await pause();
    },
    TIME_LIMIT,
  );

  test(
    "bad credentials rejects",
    async () => {
      expect.assertions(2);
      process.env.GOOGLE_APPLICATION_CREDENTIALS = resolve(
        __dirname,
        "./wrong.json",
      );
      const stream = new STTStream(AUDIO_FILENAME, null, CONFIG);
      const dStream = new DistributedSTTStream(
        AUDIO_FILENAME,
        AUDIO_DIRNAME,
        null,
        CONFIG,
      );
      await expect(stream.start(false)).rejects.toMatch(CREDENTIALS_PATTERN);
      await expect(dStream.start(false)).rejects.toMatch(CREDENTIALS_PATTERN);
      await pause();
    },
    TIME_LIMIT,
  );

  test(
    "bad audio filename",
    async () => {
      expect.assertions(4);
      const wrongWavFilename = "./test/wrong.wav";
      process.env.GOOGLE_APPLICATION_CREDENTIALS = googleKeyFilename;
      const stream = new STTStream(wrongWavFilename, null, CONFIG);
      const dStream = new DistributedSTTStream(
        wrongWavFilename,
        AUDIO_DIRNAME,
        null,
        CONFIG,
      );
      await expect(stream.start(false)).rejects.toMatch(ENOENT_PATTERN);
      expect(() => stream.checkFiles()).toThrow(ENOENT_PATTERN);
      await expect(dStream.start(false)).rejects.toMatch(ENOENT_PATTERN);
      expect(() => dStream.checkFiles()).toThrow(ENOENT_PATTERN);
      await pause();
    },
    TIME_LIMIT,
  );

  test(
    "bad text directory",
    async () => {
      expect.assertions(4);
      process.env.GOOGLE_APPLICATION_CREDENTIALS = googleKeyFilename;
      const wrongTextFilename = "./test/wrong/wrong.txt";
      const stream = new STTStream(AUDIO_FILENAME, wrongTextFilename, CONFIG);
      const dStream = new DistributedSTTStream(
        AUDIO_FILENAME,
        AUDIO_DIRNAME,
        wrongTextFilename,
        CONFIG,
      );
      await expect(stream.start(false)).rejects.toMatch(ENOENT_PATTERN);
      expect(() => stream.checkFiles()).toThrow(ENOENT_PATTERN);
      await expect(dStream.start(false)).rejects.toMatch(ENOENT_PATTERN);
      expect(() => dStream.checkFiles()).toThrow(ENOENT_PATTERN);
      await pause();
    },
    TIME_LIMIT,
  );

  test(
    "bad audio directory",
    async () => {
      expect.assertions(2);
      const textFilename = createTextFilename();
      process.env.GOOGLE_APPLICATION_CREDENTIALS = googleKeyFilename;
      const wrongAudioDirname = "./test/wrong";
      const dStream = new DistributedSTTStream(
        AUDIO_FILENAME,
        wrongAudioDirname,
        textFilename,
        CONFIG,
      );
      await expect(dStream.start(false)).rejects.toMatch(ENOENT_PATTERN);
      expect(() => dStream.checkFiles()).toThrow(ENOENT_PATTERN);
      await pause();
    },
    TIME_LIMIT,
  );
});
