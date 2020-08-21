import { dirname, resolve } from "path";
import {
  AUDIO_FILENAME,
  CONFIG,
  createTextFilename,
  TIME_LIMIT,
} from "./index.test";
import { STTStream } from "../src";

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
});
