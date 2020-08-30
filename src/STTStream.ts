import { SpeechClient } from "@google-cloud/speech";
import { appendFileSync, createReadStream, existsSync } from "fs";
import ora from "ora";
import { dirname } from "path";
import { useSpinner } from "./helpers";
import { STTStreamOptions } from "./types";

// Constants
const SPINNER_TEXT = {
  START: "STT stream running...",
  SUCCESS: "STT stream done",
  FAIL: "STT stream failed",
};
const FAQ_URL = "https://cloud.google.com/speech-to-text/docs/error-messages";
const GAC_URL =
  "https://github.com/EmmaGoodliffe/transcribe-stt/blob/master/README.md#google-authentication";

// Classes
/**
 * An STT stream (for audio files shorter than 305 seconds)
 * @example
 * This example writes the transcript of a short WAV file to a text file.
 *
 * See {@link https://github.com/EmmaGoodliffe/transcribe-stt/blob/master/README.md#google-authentication | guide} for help authenticating
 *
 * ```ts
 * import { STTStream } form "transcribe-stt";
 *
 * // Define arguments
 * const audioFilename = "./<input audio file>.wav";
 * const textFilename = "./<output text file>.txt";
 * const options = {};
 *
 * // Initialise stream
 * const stream = new STTStream(audioFilename, textFilename, options);
 *
 * // Start stream
 * stream.start().catch(console.error);
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
    // Save
    this.options = {
      ...options,
      languageCode: options.languageCode || "en-US",
    };
    // Initialise
    this.neededFiles = [audioFilename];
    // Update
    textFilename && this.neededFiles.push(dirname(textFilename));
  }
  /**
   * Check that all needed files exist
   * @returns Whether files exist
   */
  checkFiles(): boolean {
    // Read
    const existStatuses = this.neededFiles.map(file => existsSync(file));
    // Extract
    const hasFalse = existStatuses.includes(false);
    // Check
    if (hasFalse) {
      const badFileIndex = existStatuses.indexOf(false);
      const badFile = this.neededFiles[badFileIndex];
      const reason = ["Not all files exist.", `No file: ${badFile}`].join(" ");
      throw reason;
    }
    // Return
    return true;
  }
  /**
   * Main inner method (automatically called by {@link STTStream.start})
   * @returns Lines of transcript
   * @internal
   */
  private inner(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      // Check
      const gac = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      const goodCredentials = gac && typeof gac === "string" && existsSync(gac);
      if (!goodCredentials) {
        const reason = [
          "Environment variable GOOGLE_APPLICATION_CREDENTIALS is not set to a real file.",
          `No file: ${gac}.`,
          `See ${GAC_URL}`,
        ].join(" ");
        throw reason;
      }
      this.checkFiles();
      // Initialise
      const results: string[] = [];
      const client = new SpeechClient();
      // Define
      const request = {
        config: {
          encoding: this.options.encoding,
          sampleRateHertz: this.options.sampleRateHertz,
          languageCode: this.options.languageCode,
        },
      };
      const recogniseStream = client
        .streamingRecognize(request)
        .on("error", err => {
          // Handle
          const reason = [
            `Error running the STT stream. ${err}`,
            `See ${FAQ_URL} for help on common error messages`,
          ].join(" ");
          reject(reason);
        })
        .on("data", data => {
          // Extract
          const result = data.results[0].alternatives[0].transcript as string;
          // Save
          results.push(result);
          if (this.textFilename) {
            try {
              // Write
              appendFileSync(this.textFilename, `${result}\n`);
            } catch (err) {
              // Handle
              if (!err) return;
              const reason = `Error writing to text file. ${err}`;
              reject(reason);
            }
          }
        })
        // Resolve
        .on("end", () => resolve(results));
      // Read
      const audioReadStream = createReadStream(this.audioFilename);
      // Start
      audioReadStream.pipe(recogniseStream);
    });
  }
  /**
   * Start stream
   * @example
   * See {@link STTStream} for an example
   * @param useConsole - Whether to show a loading spinner and deliver warnings in the console during STT stream. Default `true`
   * @returns Lines of transcript
   */
  async start(useConsole = true): Promise<string[]> {
    // Initialise
    let results: string[] = [];
    if (useConsole) {
      // Wrap
      results = await useSpinner(
        this.inner(),
        ora(SPINNER_TEXT.START),
        SPINNER_TEXT.SUCCESS,
        SPINNER_TEXT.FAIL,
      );
    } else {
      // Start
      results = await this.inner();
    }
    // Return
    return results;
  }
}

export default STTStream;
