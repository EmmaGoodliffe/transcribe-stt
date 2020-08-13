import { Ora } from "ora";
import { dirname, resolve } from "path";
import { exec } from "child_process";
import { STTStreamOptions } from "./STTStream";

/**
 * Converts a relative path to an absolute path using the directory the function is run from
 * @param path Relative path
 * @returns Absolute path
 */
export const relPathToAbs = (path: string): string =>
  resolve(dirname(""), path);

/**
 * Show spinner while a promise is running
 * @param promise Promise to base spinner on
 * @param spinner Spinner instance
 * @param successText Text to show if promise succeeds
 * @param failText Text to show if promise fails
 * @returns Whatever the promise returns
 */
export const useSpinner = async <T>(
  promise: Promise<T>,
  spinner: Ora,
  successText = "Done",
  failText = "Failed"
): Promise<T> => {
  // Start spinner
  spinner.start();
  try {
    // Await promise
    const result = await promise;
    // Stop spinner with success
    spinner.succeed(successText);
    // Return result of promise
    return result;
  } catch (err) {
    // Stop spinner with failure
    spinner.fail(failText);
    // Throw error
    throw err;
  }
};

export const getWavHeaders = (wavFilename: string): Promise<STTStreamOptions> =>
  new Promise((resolve, reject) => {
    const command = `./headers.sh ${wavFilename}`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }

      if (stderr && stderr.length) {
        reject(stderr);
      }

      const [encodingString, sampleRateString] = stdout
        .replace("\n", "")
        .toUpperCase()
        .split(",");
      const encoding = encodingString as STTStreamOptions["encoding"];
      const sampleRateHertz = parseInt(sampleRateString);
      resolve({ encoding, sampleRateHertz });
    });
  });

export const recExp = <T>(description: string, rec: T, exp: T): string =>
  `Received ${description} ${rec} but expected ${exp}`;
