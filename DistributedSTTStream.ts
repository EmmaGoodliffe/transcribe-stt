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
    this.progress = progress;
    const funcs = this.progressListeners;
    for (const func of funcs) {
      await func(progress);
    }
  }
  /**
   * Listen to events and run callback functions. (If called multiple times, all functions will run)
   * @param event Event to listen to
   * @param callback Function to run when event fires
   */
  on(event: "progress", callback: ProgressListener): void {
    this.progressListeners.push(callback);
  }
  /** Distribute audio into separate files */
  distribute(): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(`./run.sh ${this.audioFilename}`, (error, stdout, stderr) => {
        const knownWarningPatterns = [
          /End position is after expected end of audio/i,
          /Last 1 position\(s\) not reached/i,
        ];
        error && reject(error);
        if (stderr) {
          const errors = stderr.split("\n");
          for (const err of errors) {
            let isKnownWarning = false;
            for (const pattern of knownWarningPatterns) {
              isKnownWarning = isKnownWarning || pattern.test(err);
            }
            !isKnownWarning && err.length && reject(`STDERR: ${err}`);
          }
        }
        resolve(stdout);
      });
    });
  }
  /**
   * Start distributed STT stream
   * @param showSpinner Whether to show a loading spinner in the console during STT stream. Default `true`.
   */
  async start(showSpinner?: boolean): Promise<void> {
    const stdout = await this.distribute();
    stdout.length && console.log(`Distribute script: ${stdout}`);

    const dir = this.audioDirname;
    const filenames = await readdir(dir);
    const pattern = /\.wav$/;
    const wavFilenames = filenames.filter(fn => pattern.test(fn));
    const wavFileNum = wavFilenames.length;
    for (const i in wavFilenames) {
      const index = parseInt(i);
      const wavFilename = wavFilenames[i];
      const fullWavFn = resolve(dir, wavFilename);
      const stream = new STTStream(fullWavFn, this.textFilename, this.options);
      const percentage = ~~((index / wavFileNum) * 100);
      await this.setProgress(percentage);
      await stream.start(showSpinner);
    }
    await this.setProgress(100);
  }
  /** Empty text file */
  emptyTextFile(): void {
    writeFileSync(this.textFilename, "");
  }
}

export default DistributedSTTStream;
