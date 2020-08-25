import { dirname, resolve } from "path";
import {
  absGoogleKeyFilename,
  AUDIO_DIRNAME,
  AUDIO_FILENAME,
  createTextFilename,
  CONFIG,
  TIME_LIMIT,
} from "./index.test";
import { DistributedSTTStream, STTStream } from "../src";

// TODO: add comments

// Constants
const CREDENTIALS_PATTERN = /GOOGLE_APPLICATION_CREDENTIALS/;
const ENOENT_PATTERN = /not all files exist/i;

// Errors tests
describe("Errors", () => {
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
    },
    TIME_LIMIT,
  );

  test(
    "bad credentials rejects",
    async () => {
      expect.assertions(2);
      process.env.GOOGLE_APPLICATION_CREDENTIALS = resolve(
        dirname(""),
        "./test/wrong.json",
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
    },
    TIME_LIMIT,
  );

  test(
    "bad audio filename",
    async () => {
      expect.assertions(2);
      const wrongWavFilename = "./test/wrong.wav";
      process.env.GOOGLE_APPLICATION_CREDENTIALS = absGoogleKeyFilename;
      const stream = new STTStream(wrongWavFilename, null, CONFIG);
      const dStream = new DistributedSTTStream(
        wrongWavFilename,
        AUDIO_DIRNAME,
        null,
        CONFIG,
      );
      await expect(stream.start(false)).rejects.toMatch(ENOENT_PATTERN);
      await expect(dStream.start(false)).rejects.toMatch(ENOENT_PATTERN);
    },
    TIME_LIMIT,
  );

  test("bad text directory", async () => {
    expect.assertions(2);
    process.env.GOOGLE_APPLICATION_CREDENTIALS = absGoogleKeyFilename;
    const wrongTextFilename = "./test/wrong/wrong.txt";
    const stream = new STTStream(AUDIO_FILENAME, wrongTextFilename, CONFIG);
    const dStream = new DistributedSTTStream(
      AUDIO_FILENAME,
      AUDIO_DIRNAME,
      wrongTextFilename,
      CONFIG,
    );
    await expect(stream.start(false)).rejects.toMatch(ENOENT_PATTERN);
    await expect(dStream.start(false)).rejects.toMatch(ENOENT_PATTERN);
  });

  test(
    "bad audio directory",
    async () => {
      expect.assertions(1);
      const textFilename = createTextFilename();
      process.env.GOOGLE_APPLICATION_CREDENTIALS = absGoogleKeyFilename;
      const wrongAudioDirname = "./test/wrong";
      const dStream = new DistributedSTTStream(
        AUDIO_FILENAME,
        wrongAudioDirname,
        textFilename,
        CONFIG,
      );
      await expect(dStream.start(false)).rejects.toMatch(ENOENT_PATTERN);
    },
    TIME_LIMIT,
  );
});
