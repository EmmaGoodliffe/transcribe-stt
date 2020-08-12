import { promises, writeFileSync } from "fs";
import { resolve } from "path";
import { exec } from "child_process";
import STTStream, { STTStreamOptions } from "./STTStream";

const { readdir } = promises;

/** Options for an STT stream but `append` must be set to `true` */
export interface STTStreamOptionsAppend extends STTStreamOptions {
  append: true;
}

/** Listener for the progress value */
export type ProgressListener = (percentage: number) => void | Promise<void>;

/** A distributed STT stream */
class DistributedSTTStream {
  audioFilename: string;
  audioDirname: string;
  textFilename: string;
  options: STTStreamOptionsAppend;
  progress: number;
  progressListeners: ProgressListener[];
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
  }
  private async setProgress(progress: number): Promise<void> {
    // Set progress
    this.progress = progress;
    // For every listener callback
    for (const callback of this.progressListeners) {
      await callback(progress);
    }
  }
  /**
   * Listen to events and run callback functions. (If called multiple times, all functions will run)
   * @param event Event to listen to
   * @param callback Function to run when event fires
   */
  on(event: "progress", callback: ProgressListener): void {
    // Add callback to progress listeners
    this.progressListeners.push(callback);
  }
  /**
   * Distribute audio into separate files
   * @returns STD output
   */
  distribute(): Promise<string> {
    return new Promise((resolve, reject) => {
      // Run shell script
      exec(`./run.sh ${this.audioFilename}`, (error, stdout, stderr) => {
        // Handle errors
        error && reject(error);

        // Define known warnings patterns
        const knownWarningPatterns = [
          /End position is after expected end of audio/i,
          /Last 1 position\(s\) not reached/i,
        ];
        // Handle STD errors
        if (stderr) {
          // Split up errors
          const errors = stderr.split("\n");
          // For every error
          for (const err of errors) {
            // Check if it is a known warning for every known warning pattern
            let isKnownWarning = false;
            for (const pattern of knownWarningPatterns) {
              isKnownWarning = isKnownWarning || pattern.test(err);
            }
            // If error is not a know warning and it is full, reject it
            !isKnownWarning && err.length && reject(`STDERR: ${err}`);
          }
        }

        // Resolve STD output
        resolve(stdout);
      });
    });
  }
  /**
   * Start distributed STT stream
   * @param showSpinner Whether to show a loading spinner in the console during STT stream. Default `true`.
   */
  async start(showSpinner?: boolean): Promise<void> {
    // Distribute audio file
    const stdout = await this.distribute();
    // Log any STD output
    stdout.length && console.log(`Distribute script: ${stdout}`);

    // Read audio directory
    const filenames = await readdir(this.audioDirname);

    // Define wav pattern
    const pattern = /\.wav$/;
    // Get wav paths
    const wavFilenames = filenames.filter(fn => pattern.test(fn));
    // Get number of wav files
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
