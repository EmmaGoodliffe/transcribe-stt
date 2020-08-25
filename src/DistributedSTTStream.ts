import { readdirSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { runBashScript } from "./helpers";
import STTStream from "./STTStream";
import {
  DistributeListener,
  Listener,
  ProgressListener,
  STTStreamOptions,
} from "./types";

// TODO: add comments

// Constants
const SHARD_LENGTH = 300;

/**
 * A distributed STT stream (for audio files longer than 305 seconds)
 * @example
 * This example writes the transcript of a long LINEAR16 16000Hz WAV file to a text file.
 * You can customise the functionality of the stream with the {@link STTStreamOptions}
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
 * @remarks
 * See {@link STTStream} for other properties and methods
 * @public
 */
class DistributedSTTStream extends STTStream {
  private progress: number;
  private progressListeners: ProgressListener[];
  private distributeListeners: DistributeListener[];
  /**
   * @param audioFilename - Path to original audio file
   * @param audioDirname - Path to output distributed audio directory
   * @param textFilename - Path to text file
   * @param options - Options
   */
  constructor(
    audioFilename: string,
    public audioDirname: string,
    textFilename: string | null,
    public options: STTStreamOptions,
  ) {
    super(audioFilename, textFilename, options);
    this.neededFiles = [audioFilename, audioDirname];
    textFilename && this.neededFiles.push(dirname(textFilename));
    this.progress = 0;
    this.progressListeners = [];
    this.distributeListeners = [];
  }
  /**
   * Set progress
   * @param progress - Progress percentage
   * @internal
   */
  private setProgress(progress: number): void {
    if (progress === 0 || progress > this.progress) {
      // Save progress
      this.progress = progress;
      // Call every listener
      for (const listener of this.progressListeners) {
        listener(progress);
      }
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
   * @returns standard output of bash script
   */
  async distribute(): Promise<string> {
    let stdout = "";
    try {
      // Run distribute script
      stdout = await runBashScript(
        "distribute.sh",
        `"${this.audioFilename}" "${this.audioDirname}" ${SHARD_LENGTH}`,
      );
    } catch (error_) {
      const error = `${error_}`;
      // Define known warnings patterns
      const knownWarningPatterns = [
        /End position is after expected end of audio/i,
        /Last 1 position\(s\) not reached/i,
      ];
      // Handle standard errors
      if (error) {
        const errors = error.split("\n");
        for (const errorLine of errors) {
          // Check if every error is a known warning
          let isKnownWarning = false;
          for (const pattern of knownWarningPatterns) {
            isKnownWarning = isKnownWarning || pattern.test(errorLine);
          }
          // If error is not a known warning and it is full
          if (!isKnownWarning && errorLine.length) {
            // Throw it
            throw errorLine;
          }
        }
      }
    }

    // Call every listener
    for (const listener of this.distributeListeners) {
      listener();
    }

    // Return standard output
    return stdout;
  }
  /** {@inheritdoc STTStream.start} */
  async start(useConsole?: boolean): Promise<string[]> {
    // Check if files exists
    this.checkFiles();

    // Initialise results
    const promises: Promise<string[]>[] = [];

    try {
      // Distribute audio file
      const stdout = await this.distribute();
      // Log any standard output
      stdout.length && console.warn(`Distribute bash script output: ${stdout}`);
    } catch (err) {
      throw `Error distributing audio file. ${err}`;
    }

    // Read audio directory
    const filenames = readdirSync(this.audioDirname);

    // Define WAV pattern
    const pattern = /\.wav$/;
    const wavFilenames = filenames.filter(fn => pattern.test(fn));
    const totalN = wavFilenames.length;

    // Initialise n
    let n = 0;

    // For every WAV path
    wavFilenames.forEach(wavFilename => {
      // Get the full WAV path
      const fullWavFn = resolve(this.audioDirname, wavFilename);
      // Initialise an STT stream
      const stream = new STTStream(fullWavFn, null, this.options);
      // Start the stream
      const promise = stream.start(useConsole);
      // After promise
      promise
        .then(() => {
          // Define percentage
          const percentage = ~~((n / totalN) * 100);
          // Set progress to percentage
          this.setProgress(percentage);
          // Increase n
          n++;
        })
        .catch(() => {});
      // Save promise
      promises.push(promise);
    });
    // Get results
    const results = await Promise.all(promises);
    // Set progress to 100%
    this.setProgress(100);
    // Flatten results
    const flattenedResults = results.flat();
    // Join results
    const joinedResults = flattenedResults.join("\n");
    // Write joined results to text file
    this.textFilename && writeFileSync(this.textFilename, joinedResults);
    // Return flattened results
    return flattenedResults;
  }
}

export default DistributedSTTStream;
