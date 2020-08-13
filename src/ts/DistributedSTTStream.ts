import { promises, writeFileSync } from "fs";
import { resolve } from "path";
import { runBashScript } from "./helpers";
import STTStream, { STTStreamOptions } from "./STTStream";

const { readdir } = promises;

// Constants
const SHARD_LENGTH = 300;

/** Options for an STT stream but `append` must be set to `true` */
export interface STTStreamOptionsAppend extends STTStreamOptions {
  append: true;
}

/** Listener for the progress value */
type ProgressListener = (
  /** Progress percentage */
  progress: number
) => void | Promise<void>;

/** Listener for the distribute value */
type DistributeListener = () => void | Promise<void>;

/** Listener for any property */
type Listener = ProgressListener | DistributeListener;

/** A distributed STT stream */
class DistributedSTTStream {
  audioFilename: string;
  audioDirname: string;
  textFilename: string;
  options: STTStreamOptionsAppend;
  progress: number;
  progressListeners: ProgressListener[];
  distributeListeners: DistributeListener[];
  /**
   * @param audioFilename Path to original audio file
   * @param audioDirname Path to output distributed audio directory
   * @param textFilename Path to text file
   * @param options Options
   */
  constructor(
    audioFilename: DistributedSTTStream["audioFilename"],
    audioDirname: DistributedSTTStream["audioDirname"],
    textFilename: DistributedSTTStream["textFilename"],
    options: DistributedSTTStream["options"]
  ) {
    this.audioFilename = audioFilename;
    this.audioDirname = audioDirname;
    this.textFilename = textFilename;
    this.options = options;
    this.progress = 0;
    this.progressListeners = [];
    this.distributeListeners = [];
  }
  private async setProgress(progress: number): Promise<void> {
    // Set progress
    this.progress = progress;
    // Call every listener
    for (const listener of this.progressListeners) {
      await listener(progress);
    }
  }
  /**
   * Listen to events and run callback functions
   * @param event Event to listen to
   * @param callback Function to run when event fires
   */
  on(event: "distribute", callback: DistributeListener): void;
  /**
   * Listen to events and run callback functions
   * @param event Event to listen to
   * @param callback Function to run when event fires
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
   * Distribute audio into separate files. (`.distribute` is automatically called by `.start`)
   * @returns STD output
   */
  async distribute(): Promise<string> {
    const command = `./distribute.sh ${this.audioFilename} ${this.audioDirname} ${SHARD_LENGTH}`;
    let stdout = "";
    try {
      stdout = await runBashScript(command);
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
   * @param showSpinner Whether to show a loading spinner in the console during STT stream. Default `true`.
   */
  async start(showSpinner?: boolean): Promise<void> {
    try {
      // Distribute audio file
      const stdout = await this.distribute();
      // Log any STD output
      stdout.length && console.log(`Distribute script: ${stdout}`);
    } catch (err) {
      throw `An error occurred distributing the audio file. ${err}`;
    }

    // Read audio directory
    const filenames = await readdir(this.audioDirname);

    // Define wav pattern
    const pattern = /\.wav$/;
    const wavFilenames = filenames.filter(fn => pattern.test(fn));
    const wavFileNum = wavFilenames.length;

    // For every wav path
    for (const i in wavFilenames) {
      const index = parseInt(i);
      const wavFilename = wavFilenames[i];
      // Get the full wav path
      const fullWavFn = resolve(this.audioDirname, wavFilename);
      // Initialise an STT stream
      const stream = new STTStream(fullWavFn, this.textFilename, this.options);
      // Calculate progress percentage
      const percentage = ~~((index / wavFileNum) * 100);
      // Set progress
      await this.setProgress(percentage);
      // Start the stream
      await stream.start(showSpinner);
    }
    // Set progress to 100%
    await this.setProgress(100);
  }
  /** Empty text file */
  emptyTextFile(): void {
    writeFileSync(this.textFilename, "");
  }
}

export default DistributedSTTStream;
