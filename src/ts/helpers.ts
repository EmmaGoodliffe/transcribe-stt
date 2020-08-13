import { exec } from "child_process";
import { Ora } from "ora";
import { dirname, resolve } from "path";
import { STTStreamOptions } from "./STTStream";

// Constants
const WSL_URL = "_"; // TODO: Enter correct URL

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

/**
 * Run bash script
 * @param command Command to run bash script
 * @returns STD output
 */
export const runBashScript = (
  filename: string,
  args: string
): Promise<string> =>
  new Promise((resolve, reject) => {
    const absFilename = relPathToAbs(filename);
    const command = `${absFilename} ${args}`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        const isWindowsError = `${stderr}`.includes(
          "'.' is not recognized as an internal or external command"
        );
        if (isWindowsError) {
          const errorPrefix = `An error occurred running a bash script. If you are using windows, please use WSL. See ${WSL_URL} for more details`;
          reject(`${errorPrefix}. ${error}`);
        } else {
          reject(error);
        }
      }

      if (stderr && stderr.length) {
        reject(stderr);
      }

      resolve(stdout);
    });
  });

/**
 * Get headers of wav file
 * @param wavFilename Path to wav file
 * @returns Headers
 */
export const getWavHeaders = async (
  wavFilename: string
): Promise<STTStreamOptions> => {
  const stdout = await runBashScript("./scripts/headers.sh", wavFilename);
  const [encodingString, sampleRateString] = stdout
    .replace("\n", "")
    .toUpperCase()
    .split(",");
  const encoding = encodingString as STTStreamOptions["encoding"];
  const sampleRateHertz = parseInt(sampleRateString);
  return { encoding, sampleRateHertz };
};

/**
 * Generate "received but expected" error message
 * @param description Description of received and expected entities
 * @param rec Received value
 * @param exp Expected value
 * @returns Error message
 */
export const recExp = <T>(description: string, rec: T, exp: T): string =>
  `Received ${description} ${rec} but expected ${exp}`;
