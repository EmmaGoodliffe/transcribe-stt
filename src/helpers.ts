import { exec } from "child_process";
import { Ora } from "ora";
import { resolve as pathResolve } from "path";

/**
 * Converts a relative path to an absolute path using the directory the function is run from
 * @param path - Relative path
 * @returns Absolute path
 * @internal
 */
export const relPathToAbs = (path: string): string =>
  pathResolve(__dirname, path);

/**
 * Show spinner while a promise is running
 * @param promise - Promise to base spinner on
 * @param spinner - Spinner instance
 * @param successText - Text to show if promise succeeds
 * @param failText - Text to show if promise fails
 * @returns Whatever the promise returns
 * @internal
 */
export const useSpinner = async <T>(
  promise: Promise<T>,
  spinner: Ora,
  successText = "Done",
  failText = "Failed",
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
 * @param filename - Filename of bash script
 * @param args - Arguments to pass to script
 * @returns Standard output of bash script
 * @internal
 */
export const runBashScript = (
  filename: string,
  args: string,
): Promise<string> =>
  new Promise((resolve, reject_) => {
    // Define reject function
    const reject = (reason: string) =>
      reject_(
        `${[
          "Error running a bash script.",
          "This is probably because you're environment is not set up correctly.",
          "Docker will be used soon to enable the app on any environment.",
        ].join(" ")} ${reason}`,
      );
    // Define absolute path
    const relFilename = pathResolve("./scripts/bash", `./${filename}`);
    const absFilename = relPathToAbs(relFilename);
    // Define command
    const command = `${absFilename} ${args}`;
    // Execute command
    exec(command, (error, stdout, stderr) => {
      // Handle errors
      if (error) {
        // Check if error was caused by Windows
        const isWindowsError = stderr.includes(
          "'.' is not recognized as an internal or external command",
        );
        // If error was caused by Windows
        if (isWindowsError) {
          // Throw error explaining
          const errorPrefix =
            "It looks like you are running Windows which is not supported yet";
          const reason = `${errorPrefix}. ${error}`;
          reject(reason);
        } else {
          reject(`${error}`);
        }
      }
      // If standard error was thrown, reject it
      stderr.length && reject(stderr);
      // Resolve standard output
      resolve(stdout);
    });
  });

/**
 * Generate "received but expected" error message
 * @param description - Description of received and expected entities
 * @param rec - Received value
 * @param exp - Expected value
 * @returns Error message
 * @internal
 */
export const recExp = <T>(description: string, rec: T, exp: T): string =>
  `Received ${description} ${rec} but expected ${exp}`;
