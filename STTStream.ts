import { SpeechClient } from "@google-cloud/speech";
import { google } from "@google-cloud/speech/build/protos/protos";
import { appendFile, createReadStream, writeFileSync } from "fs";
import * as ora from "ora";
import { useSpinner } from "./helpers";

type AudioEncoding = keyof typeof google.cloud.speech.v1.RecognitionConfig.AudioEncoding;

// Define constants
const SPINNER_START_TEXT = "STT stream running...";
const SUCCESS_TEXT = "STT stream done";
const FAIL_TEXT = "STT stream failed";
const FAQ_URL = "https://cloud.google.com/speech-to-text/docs/error-messages";

/** Options for an STT stream */
interface STTStreamOptions {
  /** When true, results are appended to the text file. When false, the text file is emptied first. Default `false`. */
  append?: boolean;
  /** Audio encoding. See https://cloud.google.com/speech-to-text/docs/encoding. Default `"LINEAR16"`. */
  encoding?: AudioEncoding;
  /** Audio sample rate in Hertz */
  sampleRateHertz: number;
  /** BCP-47 language code. Default `"en-GB"`. */
  languageCode?: string;
}

// Classes
/** An STT stream */
class STTStream {
  audioFilename: string;
  textFilename: string;
  append: boolean;
  encoding: AudioEncoding;
  sampleRateHertz: number;
  languageCode: string;
  results: string[];
  /**
   * @param audioFilename Path to audio file
   * @param textFilename Path to text file
   * @param options Options
   */
  constructor(
    audioFilename: STTStream["audioFilename"],
    textFilename: STTStream["textFilename"],
    options: STTStreamOptions
  ) {
    this.audioFilename = audioFilename;
    this.textFilename = textFilename;
    this.append = options.append || false;
    this.encoding = options.encoding || "LINEAR16";
    this.sampleRateHertz = options.sampleRateHertz;
    this.languageCode = options.languageCode || "en-GB";
    this.results = [];
  }
  /**
   * Start STT stream
   * @param showSpinner Whether to show a loading spinner in the console during STT stream. Default `true`.
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
          encoding: this.encoding,
          sampleRateHertz: this.sampleRateHertz,
          languageCode: this.languageCode,
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
          appendFile(this.textFilename, `${result}\n`, err => {
            // Handle errors
            if (!err) return;
            const reason = `An error occurred writing to the text file. ${err}`;
            reject(reason);
          });
        })
        .on("end", () => resolve(this.results));

      // Pipe audio file through read/write stream
      audioReadStream.pipe(recogniseStream);
    });
  }
}

export default STTStream;
