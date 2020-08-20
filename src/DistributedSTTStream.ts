import { readdirSync, writeFileSync } from "fs";
import { resolve } from "path";
import { runBashScript } from "./helpers";
import STTStream from "./STTStream";
import {
  DistributeListener,
  Listener,
  ProgressListener,
  STTStreamOptionsAppend,
} from "./types";

// Constants
const SHARD_LENGTH = 300;

/**
 * A distributed STT stream (for audio files longer than 305 seconds)
 * @example
 * This example writes the transcript of a long LINEAR16 16000Hz WAV file to a text file.
 * You can customise the functionality of the stream with the {@link STTStreamOptionsAppend}
 *
 * If you don't know the encoding or sample rate of your WAV file, find out how to check it <a href="https://github.com/EmmaGoodliffe/transcribe-stt/blob/master/README.md#checking-encoding-and-sample-rate">here</a>
 *
 * ```ts
 * import { DistributedSTTStream } from "transcribe-stt";
 *
 * // TODO: Authenticate with Google. See https://github.com/EmmaGoodliffe/transcribe-stt/blob/master/README.md#google-authentication
 *
 * const audioFilename = "./<input audio file>.wav";
 * const audioDirname = "./<output audio directory>";
 * const textFilename = "./<output text file>.txt";
 * const options = {
 *  encoding: "LINEAR16",
 *  sampleRateHertz: 16000,
 *  append: true,
 * };
 *
 * // Initialise stream
 * const stream = new DistributedSTTStream(audioFilename, audioDirname, textFilename, options);
 *
 * // Empty text file
 * stream.emptyTextFile();
 *
 * // Start stream and write output to text file
 * stream.start();
 * ```
 * @public
 */
class DistributedSTTStream {
  audioFilename: string;
  audioDirname: string;
  textFilename: string;
  options: STTStreamOptionsAppend;
  progress: number;
  progressListeners: ProgressListener[];
  distributeListeners: DistributeListener[];
  /**
   * @param audioFilename - Path to original audio file
   * @param audioDirname - Path to output distributed audio directory
   * @param textFilename - Path to text file
   * @param options - Options
   */
  constructor(
    audioFilename: string,
    audioDirname: string,
    textFilename: string,
    options: STTStreamOptionsAppend,
  ) {
    this.audioFilename = audioFilename;
    this.audioDirname = audioDirname;
    this.textFilename = textFilename;
    this.options = options;
    this.progress = 0;
    this.progressListeners = [];
    this.distributeListeners = [];
  }
  /**
   * Set progress
   * @param progress - Progress percentage
   * @internal
   */
  private async setProgress(progress: number): Promise<void> {
    // Set progress
    this.progress = progress;
    // Call every listener
    for (const listener of this.progressListeners) {
      await listener(progress);
    }
  }
  /**
   * Listen to `"distribute"` event and run callback functions
   * @remarks
   * The callback function is run whenever the {@link DistributedSTTStream.distribute} method finishes.
   *
   * This can be helpful if you are using a very large audio file and want to know when it has been split up by the {@link DistributedSTTStream.start} method.
   *
   * ({@link DistributedSTTStream.distribute} returns a promise which resolves when the distribution completes.
   * So if you are using the method on its own, this event is obsolete)
   * @param event - Event to listen to
   * @param callback - Function to run when event fires
   */
  on(event: "distribute", callback: DistributeListener): void;
  /**
   * Listen to `"progress"` event and run callback functions
   * @remarks
   * The callback function is run whenever a distributed audio file is transcribed.
   * The progress percentage of audio files transcribed is passed as the parameter of the callback.
   * For example, if 2 of 4 audio files have been transcribed, `50` will be passed, representing 50%
   * @param event - Event to listen to
   * @param callback - Function to run when event fires
   */
  on(event: "progress", callback: ProgressListener): void;
  on(event: string, callback: Listener): void {
    if (event === "progress") {
      // Add callback to progress listeners
      this.progressListeners.push(callback);
    } else if (event === "distribute") {
      // Add callback to distribute listeners
      this.distributeListeners.push(callback as DistributeListener);
    }
  }
  /**
   * Distribute audio into separate files (automatically called by {@link DistributedSTTStream.start})
   * @remarks
   * Single audio file is split up into smaller files of 300 seconds so they can be used with Google's streaming API.
   * Each file is separately streamed and written to the text file when {@link DistributedSTTStream.start} is called
   * @returns STD output of bash script
   */
  async distribute(): Promise<string> {
    let stdout = "";
    try {
      stdout = await runBashScript(
        "distribute.sh",
        `${this.audioFilename} ${this.audioDirname} ${SHARD_LENGTH}`,
      );
    } catch (error_) {
      const error = `${error_}`;
      // Define known warnings patterns
      const knownWarningPatterns = [
        /End position is after expected end of audio/i,
        /Last 1 position\(s\) not reached/i,
      ];
      // Handle STD errors
      if (error) {
        const errors = error.split("\n");
        for (const errorMessage of errors) {
          // Check if every error is a known warning
          let isKnownWarning = false;
          for (const pattern of knownWarningPatterns) {
            isKnownWarning = isKnownWarning || pattern.test(errorMessage);
          }
          // If error is not a known warning and it is full, throw it
          if (!isKnownWarning && errorMessage.length) {
            throw errorMessage;
          }
        }
      }
    }

    // Call every listener
    for (const listener of this.distributeListeners) {
      await listener();
    }

    // Return STD output
    return stdout;
  }
  /**
   * Start distributed STT stream
   * @example
   * See {@link DistributedSTTStream} for an example
   * @param useConsole - See {@link STTStream.start}
   * @returns Lines of the transcript of each audio file
   */
  async start(useConsole?: boolean): Promise<string[][]> {
    const results: string[][] = [];

    try {
      // Distribute audio file
      const stdout = await this.distribute();
      // Log any STD output
      stdout.length && console.log(`Distribute script: ${stdout}`);
    } catch (err) {
      throw `An error occurred distributing the audio file. ${err}`;
    }

    // Read audio directory
    const filenames = readdirSync(this.audioDirname);

    // Define WAV pattern
    const pattern = /\.wav$/;
    const wavFilenames = filenames.filter(fn => pattern.test(fn));
    const wavFileNum = wavFilenames.length;

    // For every WAV path
    for (const i in wavFilenames) {
      const index = parseInt(i);
      const wavFilename = wavFilenames[i];
      // Get the full WAV path
      const fullWavFn = resolve(this.audioDirname, wavFilename);
      // Initialise an STT stream
      const stream = new STTStream(fullWavFn, this.textFilename, this.options);
      // Calculate progress percentage
      const percentage = ~~((index / wavFileNum) * 100);
      // Set progress
      await this.setProgress(percentage);
      // Start the stream
      const result = await stream.start(useConsole);
      // Save result
      results.push(result);
    }
    // Set progress to 100%
    await this.setProgress(100);
    // Return result
    return results;
  }
  /** {@inheritdoc STTStream.emptyTextFile} */
  emptyTextFile(): void {
    writeFileSync(this.textFilename, "");
  }
}

export default DistributedSTTStream;
