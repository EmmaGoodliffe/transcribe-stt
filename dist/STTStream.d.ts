import { STTStreamOptions } from "./types";
/**
 * An STT stream (for audio files shorter than 305 seconds)
 * @example
 * This example writes the transcript of a short WAV file to a text file.
 *
 * See {@link https://github.com/EmmaGoodliffe/transcribe-stt/blob/master/README.md#google-authentication | guide} for help authenticating
 *
 * ```ts
 * import { STTStream } form "transcribe-stt";
 *
 * // Define arguments
 * const audioFilename = "./<input audio file>.wav";
 * const textFilename = "./<output text file>.txt";
 * const options = {};
 *
 * // Initialise stream
 * const stream = new STTStream(audioFilename, textFilename, options);
 *
 * // Start stream
 * stream.start().catch(console.error);
 * ```
 * @public
 */
declare class STTStream {
    audioFilename: string;
    textFilename: string | null;
    neededFiles: string[];
    options: STTStreamOptions;
    /**
     * @param audioFilename - Path to audio file
     * @param textFilename - Path to text file or null
     * @param options - Options
     */
    constructor(audioFilename: string, textFilename: string | null, options: STTStreamOptions);
    /**
     * Check that all needed files exist
     * @returns Whether files exist
     */
    checkFiles(): boolean;
    /**
     * Main inner method (automatically called by {@link STTStream.start})
     * @returns Lines of transcript
     * @internal
     */
    private inner;
    /**
     * Start stream
     * @example
     * See {@link STTStream} for an example
     * @param useConsole - Whether to show a loading spinner and deliver warnings in the console during STT stream. Default `true`
     * @returns Lines of transcript
     */
    start(useConsole?: boolean): Promise<string[]>;
}
export default STTStream;
//# sourceMappingURL=STTStream.d.ts.map