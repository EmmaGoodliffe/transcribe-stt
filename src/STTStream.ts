import { SpeechClient } from "@google-cloud/speech";
import { appendFileSync, createReadStream, existsSync } from "fs";
import ora from "ora";
import { dirname } from "path";
import { useSpinner } from "./helpers";
import { STTStreamOptions } from "./types";

// Define constants
const SPINNER_START_TEXT = "STT stream running...";
const SUCCESS_TEXT = "STT stream done";
const FAIL_TEXT = "STT stream failed";
const FAQ_URL = "https://cloud.google.com/speech-to-text/docs/error-messages";

// Classes
/**
 * An STT stream (for audio files shorter than 305 seconds)
 * @example
 * This example writes the transcript of a short LINEAR16 16000Hz WAV file to a text file.
 * You can customise the functionality of the stream with the {@link STTStreamOptions}.
 *
 * If you don't know the encoding or sample rate of your WAV file, find out how to check it <a href="https://github.com/EmmaGoodliffe/transcribe-stt/blob/master/README.md#checking-encoding-and-sample-rate">here</a>
 *
 * ```ts
 * import { STTStream } form "transcribe-stt";
 *
 * // TODO: Authenticate with Google. See https://github.com/EmmaGoodliffe/transcribe-stt/blob/master/README.md#google-authentication
 *
 * const audioFilename = "./<input audio file>.wav";
 * const textFilename = "./<output text file>.txt";
 * const options = {
 *  encoding: "LINEAR16",
 *  sampleRateHertz: 16000,
 * };
 *
 * // Initialise stream
 * const stream = new STTStream(audioFilename, textFilename, options);
 *
 * // Start stream and write output to text file
 * stream.start();
 * ```
 * @public
 */
class STTStream {
  neededFiles: string[];
  options: STTStreamOptions;
  /**
   * @param audioFilename - Path to audio file
   * @param textFilename - Path to text file or null
   * @param options - Options
   */
  constructor(
    public audioFilename: string,
    public textFilename: string | null,
    options: STTStreamOptions,
  ) {
    this.options = {
      ...options,
      languageCode: options.languageCode || "en-US",
    };
    // Define needed files
    this.neededFiles = [audioFilename];
    // If a text file was passed, append its directory to the needed files
    textFilename && this.neededFiles.push(dirname(textFilename));
  }
  /**
   * Check that all needed files exist
   * @returns Whether files exist
   */
  checkFiles(): boolean {
    // Find which files exist
    const existStatuses = this.neededFiles.map(file => existsSync(file));
    // Find number of files which don't exist
    const falseN = existStatuses.filter(val => !val).length;
    // If some files don't exist
    if (falseN) {
      // Find bad file
      const badFileIndex = existStatuses.indexOf(false);
      const badFile = this.neededFiles[badFileIndex];
      // Throw error
      const reason = ["Not all files exist.", `No file: ${badFile}`].join("\n");
      throw reason;
    }
    // Otherwise, return true
    return true;
  }
  /**
   * Main inner method (automatically called by {@link STTStream.start})
   * @internal
   */
  private inner(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      // Check if GOOGLE_APPLICATION_CREDENTIALS is defined
      const gac = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      const goodCredentials = gac && typeof gac === "string" && existsSync(gac);
      // If it is not defined
      if (!goodCredentials) {
        // Throw error
        const reason = [
          "Environment variable GOOGLE_APPLICATION_CREDENTIALS is not set to a real file.",
          `No file: ${gac}`,
        ].join("\n");
        throw reason;
      }
      // Check if files exist
      this.checkFiles();
      // Initialise results
      const results: string[] = [];
      // Initialise client
      const client = new SpeechClient();
      // Define request
      const request = {
        config: {
          encoding: this.options.encoding,
          sampleRateHertz: this.options.sampleRateHertz,
          languageCode: this.options.languageCode,
        },
      };
      // Create read stream for audio file
      const audioReadStream = createReadStream(this.audioFilename);
      // Define a read/write stream to handle audio file
      const recogniseStream = client
        .streamingRecognize(request)
        .on("error", err => {
          // Handle errors
          const reason = [
            `Error running the STT stream. ${err}`,
            `See ${FAQ_URL} for help on common error messages`,
          ].join("\n");
          reject(reason);
        })
        .on("data", data => {
          // Get result
          const result = data.results[0].alternatives[0].transcript as string;
          // Save result
          results.push(result);
          // If a text file was passed
          if (this.textFilename) {
            // Append result to text file
            try {
              appendFileSync(this.textFilename, `${result}\n`);
            } catch (err) {
              // Handle errors
              if (!err) return;
              const reason = `Error writing to text file. ${err}`;
              reject(reason);
            }
          }
        })
        .on("end", () => resolve(results));
      // Pipe audio file through read/write stream
      audioReadStream.pipe(recogniseStream);
    });
  }
  /**
   * Start stream
   * @example
   * See {@link STTStream} for an example
   * @param useConsole - Whether to show a loading spinner and deliver warnings in the console during STT stream. Default `true`
   * @returns Lines of the transcript
   */
  async start(useConsole = true): Promise<string[]> {
    // Initialise results
    let results: string[] = [];
    // If user wants to show spinner
    if (useConsole) {
      // Run function with spinner wrapper
      results = await useSpinner(
        this.inner(),
        ora(SPINNER_START_TEXT),
        SUCCESS_TEXT,
        FAIL_TEXT,
      );
    } else {
      // Run function normally
      results = await this.inner();
    }
    // Return results
    return results;
  }
}

export default STTStream;
