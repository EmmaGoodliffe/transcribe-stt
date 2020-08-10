import { dirname, resolve } from "path";
import { Ora } from "ora";

export const relPathToAbs = (path: string): string =>
  resolve(dirname(""), path);

export const useSpinner = async <T>(
  promise: Promise<T>,
  spinner: Ora,
  successText: string,
  failText: string
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
