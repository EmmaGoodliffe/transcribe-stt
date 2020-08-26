import { readdirSync, writeFileSync } from "fs";
import { resolve } from "path";
import { runBashScript } from "./helpers";
import STTStream from "./STTStream";
import {
  DistributeListener,
  ProgressListener,
  STTStreamOptions,
} from "./types";

// Constants
const SHARD_LENGTH = 300;

/**
 * A distributed STT stream (for audio files longer than 305 seconds)
 * @example
 * This example writes the transcript of a long LINEAR16 16000Hz WAV file to a text file.
 * The audio files is split up into smaller files saved in the audio directory passed to the constructor.
 * You can customise the functionality of the stream with the {@link STTStreamOptions}
 *
 * ```ts
 * import { DistributedSTTStream } from "transcribe-stt";
 *
 * // TODO: Authenticate with Google. See https://github.com/EmmaGoodliffe/transcribe-stt/blob/master/README.md#google-authentication
 *
 * const audioFilename = "./<input audio file>.wav";
 * const audioDirname = "./<output audio directory>";
 * const textFilename = "./<output text file>.txt";
 * const options = {};
 *
 * // Initialise stream
 * const stream = new DistributedSTTStream(audioFilename, audioDirname, textFilename, options);
 *
 * // Start stream and write output to text file
 * stream.start().catch(console.error);
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
   * @param audioFilename - Path to audio file
   * @param audioDirname - Path to output distributed audio directory
   * @param textFilename - Path to text file or null
   * @param options - Options
   */
  constructor(
    audioFilename: string,
    public audioDirname: string,
    textFilename: string | null,
    public options: STTStreamOptions,
  ) {
    // Run super constructor
    super(audioFilename, textFilename, options);
    // Append audio directory to needed files
    this.neededFiles.push(audioDirname);
    // Initialise progress
    this.progress = -1;
    // Initialise listeners
    this.progressListeners = [];
    this.distributeListeners = [];
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
        // Check if every error is a known warning
        const errors = error.split("\n");
        for (const errorLine of errors) {
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
    // Call every distribute listener
    for (const listener of this.distributeListeners) {
      listener();
    }
    // Return standard output
    return stdout;
  }
  /**
   * Listen to `"distribute"` event and run callback functions
   * @remarks
   * The callback function is run whenever the {@link DistributedSTTStream.distribute} method finishes.
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
  on(event: string, callback: ProgressListener | DistributeListener): void {
    if (event === "progress") {
      // Add callback to progress listeners
      this.progressListeners.push(callback as ProgressListener);
    } else if (event === "distribute") {
      // Add callback to distribute listeners
      this.distributeListeners.push(callback as DistributeListener);
    } else {
      // Throw error
      const reason = `No event ${event}`;
      throw reason;
    }
  }
  /**
   * Set progress
   * @param progress - Progress percentage
   * @internal
   */
  private setProgress(progress: number): void {
    // If new progress is larger than previous progress
    if (progress > this.progress) {
      // Save progress
      this.progress = progress;
      // Call every progress listener
      for (const listener of this.progressListeners) {
        listener(progress);
      }
    }
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
    // Initialise progress
    this.setProgress(n);
    // For every WAV path
    wavFilenames.forEach(wavFilename => {
      // Get the full WAV path
      const fullWavFn = resolve(this.audioDirname, wavFilename);
      // Initialise an STT stream
      const stream = new STTStream(fullWavFn, null, this.options);
      // Start the stream
      const promise = stream.start(useConsole);
      promise
        .then(() => {
          // Increase n
          n++;
          // Define percentage
          const percentage = ~~((n / totalN) * 100);
          // Set progress to percentage
          this.setProgress(percentage);
        })
        // Ignore errors in single promise (caught later in Promise.all)
        .catch(() => {});
      // Save promise
      promises.push(promise);
    });
    // Get results
    const results = await Promise.all(promises);
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
