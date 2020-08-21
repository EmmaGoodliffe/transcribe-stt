import { dirname, resolve } from "path";
import {
  absGoogleKeyFilename,
  AUDIO_DIRNAME,
  AUDIO_FILENAME,
  CONFIG,
  createTextFilename,
  TIME_LIMIT,
} from "./index.test";
import { DistributedSTTStream, STTStream } from "../src";

const ENOENT_PATTERN = /not all files exist/i;

describe("Errors", () => {
  test(
    "no credentials rejects",
    async () => {
      expect.assertions(1);
      const textFilename = createTextFilename();
      process.env.GOOGLE_APPLICATION_CREDENTIALS = "";
      const stream = new STTStream(AUDIO_FILENAME, textFilename, CONFIG);
      await expect(stream.start(false)).rejects.toMatch(
        /GOOGLE_APPLICATION_CREDENTIALS/,
      );
    },
    TIME_LIMIT,
  );

  test(
    "bad credentials rejects",
    async () => {
      expect.assertions(1);
      const textFilename = createTextFilename();
      process.env.GOOGLE_APPLICATION_CREDENTIALS = resolve(
        dirname(""),
        "./wrong.json",
      );
      const stream = new STTStream(AUDIO_FILENAME, textFilename, CONFIG);
      await expect(stream.start(false)).rejects.toMatch(
        /GOOGLE_APPLICATION_CREDENTIALS/,
      );
    },
    TIME_LIMIT,
  );

  test(
    "bad filename",
    async () => {
      expect.assertions(2);
      const wrongWavFilename = "./test/wrong.wav";
      process.env.GOOGLE_APPLICATION_CREDENTIALS = absGoogleKeyFilename;
      const stream = new STTStream(
        wrongWavFilename,
        createTextFilename(),
        CONFIG,
      );
      const dStream = new DistributedSTTStream(
        wrongWavFilename,
        AUDIO_DIRNAME,
        createTextFilename(),
        {
          ...CONFIG,
          append: true,
        },
      );
      await expect(stream.start(false)).rejects.toMatch(ENOENT_PATTERN);
      await expect(dStream.start(false)).rejects.toMatch(ENOENT_PATTERN);
    },
    TIME_LIMIT,
  );

  test(
    "bad directory",
    async () => {
      expect.assertions(1);
      const textFilename = createTextFilename();
      process.env.GOOGLE_APPLICATION_CREDENTIALS = absGoogleKeyFilename;
      const stream = new DistributedSTTStream(
        AUDIO_FILENAME,
        "./test/wrong",
        textFilename,
        {
          ...CONFIG,
          append: true,
        },
      );
      await expect(stream.start(false)).rejects.toMatch(ENOENT_PATTERN);
    },
    TIME_LIMIT,
  );
});
