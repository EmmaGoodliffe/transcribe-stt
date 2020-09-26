import { readdirSync, writeFileSync } from "fs";
import { extname, resolve } from "path";
import { runBashScript } from "./helpers";
import STTStream from "./STTStream";
import { Listeners, STTStreamOptions } from "./types";

// Constants
const SHARD_LENGTH = 300;

// Classes
/**
 * A distributed STT stream (for audio files longer than 305 seconds)
 * @example
 * This example writes the transcript of a long WAV file to a text file.
 * The audio files is split up into smaller files saved in the audio directory passed to the constructor.
 * See {@link DistributedSTTStream.distribute} for more details
 *
 * See {@link https://github.com/EmmaGoodliffe/transcribe-stt/blob/master/README.md#google-authentication | guide} for help authenticating
 *
 * ```ts
 * import { DistributedSTTStream } from "transcribe-stt";
 *
 * // Define arguments
 * const audioFilename = "./<input audio file>.wav";
 * const audioDirname = "./<output audio directory>";
 * const textFilename = "./<output text file>.txt";
 * const options = {};
 *
 * // Initialise stream
 * const stream = new DistributedSTTStream(audioFilename, audioDirname, textFilename, options);
 *
 * // Start stream
 * stream.start().catch(console.error);
 * ```
 * @remarks
 * See {@link STTStream} for other properties and methods
 * @public
 */
class DistributedSTTStream extends STTStream {
  private progress: number;
  private progressListeners: Listeners.ProgressListener[];
  private distributeListeners: Listeners.DistributeListener[];
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
    // Super
    super(audioFilename, textFilename, options);
    // Update
    this.neededFiles.push(audioDirname);
    // Initialise
    this.progress = -1;
    this.progressListeners = [];
    this.distributeListeners = [];
  }
  /**
   * Distribute audio into separate files (automatically called by {@link DistributedSTTStream.start})
   * @remarks
   * Single audio file is split up into smaller files of 300 seconds so they can be used with Google's streaming API.
   * Each file is separately streamed and written to the text file when {@link DistributedSTTStream.start} is called
   * @returns Standard output of bash script
   */
  async distribute(): Promise<string> {
    // Initiate
    let stdout = "";
    try {
      // Distribute
      stdout = await runBashScript(
        "distribute.sh",
        `"${this.audioFilename}" "${this.audioDirname}" ${SHARD_LENGTH}`,
      );
    } catch (error_) {
      // Handle
      const error = `${error_}`;
      // Define
      const knownWarningPatterns = [
        /End position is after expected end of audio/i,
        /Last 1 position\(s\) not reached/i,
      ];
      // Check
      if (error) {
        const errorLines = error.split("\n");
        for (const errorLine of errorLines) {
          let isKnownWarning = false;
          for (const pattern of knownWarningPatterns) {
            isKnownWarning = isKnownWarning || pattern.test(errorLine);
          }
          if (!isKnownWarning && errorLine.length) {
            throw errorLine;
          }
        }
      }
    }
    // Call
    for (const listener of this.distributeListeners) {
      listener();
    }
    // Return
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
  on(event: "distribute", callback: Listeners.DistributeListener): void;
  /**
   * Listen to `"progress"` event and run callback functions
   * @remarks
   * The callback function is run whenever a distributed audio file is transcribed.
   * The progress percentage of audio files transcribed is passed as the parameter of the callback.
   * For example, if 2 of 4 audio files have been transcribed, `50` will be passed, representing 50%
   * @param event - Event to listen to
   * @param callback - Function to run when event fires
   */
  on(event: "progress", callback: Listeners.ProgressListener): void;
  on(event: string, callback: Listeners.All): void {
    if (event === "progress") {
      // Progress
      this.progressListeners.push(callback as Listeners.ProgressListener);
    } else if (event === "distribute") {
      // Distribute
      this.distributeListeners.push(callback as Listeners.DistributeListener);
    } else {
      // Other
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
    // Check
    if (progress > this.progress) {
      // Save
      this.progress = progress;
      // Call
      for (const listener of this.progressListeners) {
        listener(progress);
      }
    }
  }
  /** {@inheritdoc STTStream.start} */
  async start(useConsole?: boolean): Promise<string[]> {
    // Check
    this.checkFiles();
    // Initialise
    const promises: Promise<string[]>[] = [];
    try {
      // Distribute
      const stdout = await this.distribute();
      // Output
      stdout.length && console.warn(`Distribute bash script output: ${stdout}`);
    } catch (err) {
      // Handle
      throw `Error distributing audio file. ${err}`;
    }
    // Read
    const filenames = readdirSync(this.audioDirname);
    // Extract
    const wavFilenames = filenames.filter(fn => extname(fn) === ".wav");
    const totalN = wavFilenames.length;
    // Initialise
    let n = 0;
    this.setProgress(n);
    // Start
    wavFilenames.forEach(wavFilename => {
      const fullWavFn = resolve(this.audioDirname, wavFilename);
      const stream = new STTStream(fullWavFn, null, this.options);
      const promise = stream.start(useConsole);
      promise
        .then(() => {
          n++;
          const percentage = ~~((n / totalN) * 100);
          this.setProgress(percentage);
        })
        .catch(() => {});
      // Save
      promises.push(promise);
    });
    // Combine
    const results = await Promise.all(promises);
    // Parse
    const flattenedResults = results.flat();
    // Join
    const joinedResults = flattenedResults.join("\n");
    // Write
    this.textFilename && writeFileSync(this.textFilename, joinedResults);
    // Return
    return flattenedResults;
  }
}

export default DistributedSTTStream;
