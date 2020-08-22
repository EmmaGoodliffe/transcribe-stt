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
    "bad audio filename",
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
        CONFIG,
      );
      await expect(stream.start(false)).rejects.toMatch(ENOENT_PATTERN);
      await expect(dStream.start(false)).rejects.toMatch(ENOENT_PATTERN);
    },
    TIME_LIMIT,
  );

  test("bad text directory", async () => {
    expect.assertions(1);
    process.env.GOOGLE_APPLICATION_CREDENTIALS = absGoogleKeyFilename;
    const stream = new DistributedSTTStream(
      AUDIO_FILENAME,
      AUDIO_DIRNAME,
      "./test/wrong/wrong.txt",
      CONFIG,
    );
    await expect(stream.start(false)).rejects.toMatch(ENOENT_PATTERN);
  });

  test(
    "bad audio directory",
    async () => {
      expect.assertions(1);
      const textFilename = createTextFilename();
      process.env.GOOGLE_APPLICATION_CREDENTIALS = absGoogleKeyFilename;
      const stream = new DistributedSTTStream(
        AUDIO_FILENAME,
        "./test/wrong",
        textFilename,
        CONFIG,
      );
      await expect(stream.start(false)).rejects.toMatch(ENOENT_PATTERN);
    },
    TIME_LIMIT,
  );
});
