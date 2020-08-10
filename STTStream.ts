import { appendFile, createReadStream, writeFileSync } from "fs";
import { SpeechClient } from "@google-cloud/speech";
import * as ora from "ora";
import { useSpinner } from "./helpers";

// Define constants
const SPINNER_START_TEXT = "STT stream running...";
const SUCCESS_TEXT = "STT stream done";
const FAIL_TEXT = "STT stream failed";
const FAQ_URL = "https://cloud.google.com/speech-to-text/docs/error-messages";

// Classes
/**
 * Wrapper for an STT stream
 */
class STTStream {
  audioFilename: string;
  textFilename: string;
  sampleRateHertz: number;
  append: boolean;
  results: string[];
  /**
   * @param audioFilename Path to audio file
   * @param textFilename Path to text file
   * @param sampleRateHertz Sample rate of audio file in Hertz
   * @param append When true, text is appended to the existing file. When false, text file is emptied first. Default true.
   */
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
    this.results = [];
  }
  /**
   * Start STT stream
   * @param showSpinner Whether to show a loading spinner in the console during STT stream
   */
  async start(showSpinner = true): Promise<string[]> {
    // Initialise results
    let results: string[] = [];
    // If user wants to show spinner
    if (showSpinner) {
      // Run function with spinner wrapper
      results = await useSpinner(
        this.inner(),
        ora(SPINNER_START_TEXT),
        SUCCESS_TEXT,
        FAIL_TEXT
      );
    } else {
      // Run function normally
      results = await this.inner();
    }
    // Return results
    return results;
  }
  private inner(): Promise<string[]> {
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
            `An error occurred running the STT stream. ${err}`,
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
          appendFile(this.textFilename, `${result}\n`, err =>
            console.error(`Append error: ${err}`)
          );
        })
        .on("end", () => resolve(this.results));

      // Pipe audio file through read/write stream
      audioReadStream.pipe(recogniseStream);
    });
  }
}

export default STTStream;
