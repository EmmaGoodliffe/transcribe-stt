import { dirname, resolve } from "path";
import { createReadStream, appendFile, writeFileSync } from "fs";
import { SpeechClient } from "@google-cloud/speech";
import * as ora from "ora";

// Helpers
const relPathToAbs = (path: string) => resolve(dirname(""), path);

// Prepare environment
const relGoogleKeyFilename = "./lgim-stt-key.json";
const absGoogleKeyFilename = relPathToAbs(relGoogleKeyFilename);
process.env.GOOGLE_APPLICATION_CREDENTIALS = absGoogleKeyFilename;

// Define constants
const SPINNER_START_TEXT = "STT stream running...";
const SPINNER_SUCCESS_STOP_TEXT = "STT stream done";
const SPINNER_FAIL_STOP_TEXT = "STT stream failed";
const FAQ_URL = "https://cloud.google.com/speech-to-text/docs/error-messages";

const useSpinner = async <T>(promise: Promise<T>, spinner: ora.Ora) => {
  spinner.start();
  try {
    const result = await promise;
    spinner.succeed(SPINNER_SUCCESS_STOP_TEXT);
    return result;
  } catch (err) {
    spinner.fail(SPINNER_FAIL_STOP_TEXT);
    throw err;
  }
};

class STTStream {
  audioFilename: string;
  textFilename: string;
  sampleRateHertz: number;
  append: boolean;
  spinner: ora.Ora;
  results: string[];
  constructor(
    audioFilename: STTStream["audioFilename"],
    textFilename: STTStream["textFilename"],
    sampleRateHertz: STTStream["sampleRateHertz"],
    append = false
  ) {
    this.audioFilename = audioFilename;
    this.textFilename = textFilename;
    this.sampleRateHertz = sampleRateHertz;
    this.append = append;
    this.spinner = ora(SPINNER_START_TEXT);
    this.results = [];
  }
  async start(showSpinner = true) {
    let results: string[] = [];
    if (showSpinner) {
      results = await useSpinner(this.inner(), this.spinner);
    } else {
      results = await this.inner();
    }
    return results;
  }
  inner(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      // If not appending
      if (!this.append) {
        // Empty file
        writeFileSync(this.textFilename, "");
      }

      // Initialise client
      const client = new SpeechClient();

      // Define request
      const request = {
        config: {
          encoding: "LINEAR16" as const,
          sampleRateHertz: this.sampleRateHertz,
          languageCode: "en-GB",
        },
        // interimResults: true,
      };

      // Create read stream for audio file
      const audioReadStream = createReadStream(this.audioFilename);

      // Define a read/write stream to handle audio file
      const recogniseStream = client
        .streamingRecognize(request)
        .on("error", err => {
          // Handle errors
          const reason = [
            `An error occurred running the STT stream: ${err}`, // TODO: change `:` to `.`
            `See ${FAQ_URL} for help on common error messages`,
          ].join("\n");
          reject(reason);
        })
        .on("data", data => {
          // Get result
          const result = data.results[0].alternatives[0].transcript as string;
          // Save result
          this.results.push(result);
          // Append result to text file
          appendFile(this.textFilename, `${result}\n`, () => {});
        })
        .on("end", () => resolve(this.results));

      // Pipe audio file through read/write stream
      audioReadStream.pipe(recogniseStream);
    });
  }
}

// Define filenames
const shortAudioFilename = "test mono";
const shortTextFilename = "text";
const audioFilename = `audio/${shortAudioFilename}.wav`;
const textFilename = `${shortTextFilename}.txt`;

// Initialise STT stream
const sttStream = new STTStream(audioFilename, textFilename, 48000);
// Start STT stream
sttStream.start(false).catch(console.error);
