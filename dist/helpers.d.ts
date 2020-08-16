import { Ora } from "ora";
import { WavHeaders } from "./types";
/**
 * Converts a relative path to an absolute path using the directory the function is run from
 * @param path - Relative path
 * @returns Absolute path
 * @internal
 */
export declare const relPathToAbs: (path: string) => string;
/**
 * Show spinner while a promise is running
 * @param promise - Promise to base spinner on
 * @param spinner - Spinner instance
 * @param successText - Text to show if promise succeeds
 * @param failText - Text to show if promise fails
 * @returns Whatever the promise returns
 * @internal
 */
export declare const useSpinner: <T>(promise: Promise<T>, spinner: Ora, successText?: string, failText?: string) => Promise<T>;
/**
 * Run bash script
 * @param command - Command to run bash script
 * @returns STD output of bash script
 * @internal
 */
export declare const runBashScript: (filename: string, args: string) => Promise<string>;
/**
 * Get headers of WAV file
 * @param wavFilename - Path to WAV file
 * @returns Headers
 * @internal
 */
export declare const getWavHeaders: (wavFilename: string) => Promise<WavHeaders>;
/**
 * Generate "received but expected" error message
 * @param description - Description of received and expected entities
 * @param rec - Received value
 * @param exp - Expected value
 * @returns Error message
 * @internal
 */
export declare const recExp: <T>(description: string, rec: T, exp: T) => string;
//# sourceMappingURL=helpers.d.ts.map