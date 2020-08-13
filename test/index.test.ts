import { DistributedSTTStream, STTStream } from "../src/ts";
import { relPathToAbs } from "../src/ts/helpers";

// Prepare environment
const relGoogleKeyFilename = "./lgim-stt-key.json";
const absGoogleKeyFilename = relPathToAbs(relGoogleKeyFilename);
process.env.GOOGLE_APPLICATION_CREDENTIALS = absGoogleKeyFilename;

const TIME_LIMIT = 30 * 1000;

const AUDIO_FILENAME = "./input.wav";
const TEXT_FILENAME = "./stream.output.txt";

it(
  "bad sample rate stream",
  async () => {
    expect.assertions(2);
    const badSampleRateStream = new STTStream(AUDIO_FILENAME, TEXT_FILENAME, {
      sampleRateHertz: 0,
    });
    const [, goodSampleRate] = await badSampleRateStream.testHeaders();
    expect(goodSampleRate).toBeFalsy();
    await expect(badSampleRateStream.start(false)).rejects.toMatch(
      "sample rate"
    );
  },
  TIME_LIMIT
);
