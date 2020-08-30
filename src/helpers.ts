import { exec } from "child_process";
import { Ora } from "ora";
import { resolve as resolvePath } from "path";

// Functions
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
  // Start
  spinner.start();
  try {
    // Await
    const result = await promise;
    // Output
    spinner.succeed(successText);
    // Return
    return result;
  } catch (err) {
    // Handle
    spinner.fail(failText);
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
  new Promise((resolve, reject) => {
    // Resolve
    const relFilename = resolvePath(
      __dirname,
      "../scripts/bash",
      `./${filename}`,
    );
    // Define
    const command = `${relFilename} ${args}`;
    // Execute
    exec(command, (error, stdout, stderr) => {
      // Handle
      const errorPrefix = [
        "Error running a bash script.",
        "This is probably because you're environment is not set up correctly.",
        "Docker will be used soon to enable the app on any environment.",
      ].join(" ");
      if (error) {
        const isWindowsError = stderr.includes(
          "'.' is not recognized as an internal or external command",
        );
        if (isWindowsError) {
          const secondErrorPrefix =
            "It looks like you are running Windows which is not supported yet";
          const reason = `${errorPrefix} ${secondErrorPrefix}. ${error}`;
          reject(reason);
        } else {
          const reason = `${errorPrefix} ${error}`;
          reject(reason);
        }
      }
      stderr.length && reject(stderr);
      // Resolve
      resolve(stdout);
    });
  });
