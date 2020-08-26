import { STTStreamOptions } from "./types";
/**
 * An STT stream (for audio files shorter than 305 seconds)
 * @example
 * This example writes the transcript of a short LINEAR16 16000Hz WAV file to a text file.
 * You can customise the functionality of the stream with the {@link STTStreamOptions}.
 *
 * If you don't know the encoding or sample rate of your WAV file, find out how to check it <a href="https://github.com/EmmaGoodliffe/transcribe-stt/blob/master/README.md#checking-encoding-and-sample-rate">here</a>
 *
 * ```ts
 * import { STTStream } form "transcribe-stt";
 *
 * // TODO: Authenticate with Google. See https://github.com/EmmaGoodliffe/transcribe-stt/blob/master/README.md#google-authentication
 *
 * const audioFilename = "./<input audio file>.wav";
 * const textFilename = "./<output text file>.txt";
 * const options = {
 *  encoding: "LINEAR16",
 *  sampleRateHertz: 16000,
 * };
 *
 * // Initialise stream
 * const stream = new STTStream(audioFilename, textFilename, options);
 *
 * // Start stream and write output to text file
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
     * @internal
     */
    private inner;
    /**
     * Start stream
     * @example
     * See {@link STTStream} for an example
     * @param useConsole - Whether to show a loading spinner and deliver warnings in the console during STT stream. Default `true`
     * @returns Lines of the transcript
     */
    start(useConsole?: boolean): Promise<string[]>;
}
export default STTStream;
//# sourceMappingURL=STTStream.d.ts.map