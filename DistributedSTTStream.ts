import { promises, writeFileSync } from "fs";
import { resolve } from "path";
import { exec } from "child_process";
import STTStream, { STTStreamOptions } from "./STTStream";

const { readdir } = promises;

interface STTStreamOptionsAppend extends STTStreamOptions {
  append: true;
}

type ProgressListener = (percentage: number) => void | Promise<void>;

class DistributedSTTStream {
  audioFilename: string;
  audioDirname: string;
  textFilename: string;
  options: STTStreamOptionsAppend;
  progress: number;
  progressListeners: ProgressListener[];
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
  on(event: "progress", callback: ProgressListener): void {
    this.progressListeners.push(callback);
  }
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
  emptyTextFile(): void {
    writeFileSync(this.textFilename, "");
  }
}

export default DistributedSTTStream;
