import { SpeechClient } from "@google-cloud/speech";
import { appendFile, createReadStream, existsSync } from "fs";
import ora from "ora";
import { dirname } from "path";
import { allTrue, useSpinner } from "./helpers";
import { STTStreamOptions } from "./types";

// TODO: add comments

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
   * @param textFilename - Path to text file
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
    this.neededFiles = [audioFilename];
    textFilename && this.neededFiles.push(dirname(textFilename));
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
  /**
   * Main inner method (automatically called by {@link STTStream.start})
   * @internal
   */
  private inner(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      // Check if GOOGLE_APPLICATION_CREDENTIALS is defined
      const gac = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      const goodCredentials =
        gac && typeof gac === "string" && gac.length && existsSync(gac);
      if (!goodCredentials) {
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
            appendFile(this.textFilename, `${result}\n`, err => {
              // Handle errors
              if (!err) return;
              const reason = `Error writing to the text file. ${err}`;
              reject(reason);
            });
          }
        })
        .on("end", () => resolve(results));

      // Pipe audio file through read/write stream
      audioReadStream.pipe(recogniseStream);
    });
  }
  checkFiles(): boolean {
    const filesExist = this.neededFiles.map(file => existsSync(file));
    if (!allTrue(filesExist)) {
      const problemIndex = filesExist.indexOf(false);
      const problemFile = this.neededFiles[problemIndex];
      const reason = ["Not all files exist.", `No file: ${problemFile}`].join(
        "\n",
      );
      throw reason;
    }
    return true;
  }
}

export default STTStream;
