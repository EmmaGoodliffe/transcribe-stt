import { Ora } from "ora";
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
 * @param filename - Filename of bash script
 * @param args - Arguments to pass to script
 * @returns Standard output of bash script
 * @internal
 */
export declare const runBashScript: (filename: string, args: string) => Promise<string>;
//# sourceMappingURL=helpers.d.ts.map