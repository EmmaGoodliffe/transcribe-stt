import { STTStreamOptions, WavHeaders } from "./types";
/**
 * An STT stream (for audio files shorter than 305 seconds)
 * @example
 * This example writes the transcript of a short LINEAR16 16000Hz WAV file to a text file.
 * You can customise the functionality of the stream with the {@link STTStreamOptions}.
 *
 * If you don't know the encoding or sample rate of your WAV file, try using {@link STTStream.testHeaders}
 * ```ts
 * import { STTStream } form "transcribe-stt";
 *
 * const audioFilename = "./<input audio file>.wav";
 * const textFilename = "./<output text file>.txt";
 * const options = {
 *  sampleRateHertz: 16000
 * };
 *
 * // Initialise stream
 * const stream = new STTStream(audioFilename, textFilename, options);
 *
 * // Start stream and write output to text file
 * stream.start();
 * ```
 * @public
 */
declare class STTStream {
    audioFilename: string;
    textFilename: string;
    append: STTStreamOptions["append"];
    encoding: STTStreamOptions["encoding"];
    sampleRateHertz: STTStreamOptions["sampleRateHertz"];
    languageCode: STTStreamOptions["languageCode"];
    /**
     * @param audioFilename - Path to audio file
     * @param textFilename - Path to text file
     * @param options - Options
     */
    constructor(audioFilename: string, textFilename: string, options: STTStreamOptions);
    /**
     * Test if headers of WAV file are correct
     * @example
     * This example checks if the headers you passed to {@link STTStream} are correct and logs them.
     * This can be helpful when you don't know what headers your WAV file has.
     *
     * See {@link STTStream} to instantiate the stream
     *
     * ```ts
     * // ...
     *
     * // Test headers
     * const [goodEncoding, goodSampleRate, headers] = await stream.testHeaders();
     *
     * // Log results
     * console.log("File has correct encoding?", goodEncoding);
     * console.log("File has correct sample rate?", goodSampleRate);
     *
     * // Log headers
     * console.log("File has encoding:", headers.encoding);
     * console.log("File has sample rate:", headers.sampleRateHertz);
     * ```
     * @remarks
     * This method does not test encodings perfectly as many encodings go by multiples aliases.
     * For example, "LINEAR16" is often listed in headers as "Microsoft PCM 16 bit".
     *
     * Because of this, {@link STTStream.testHeaders} does not have to pass for {@link STTStream.start} to pass.
     *
     * If you find an alias of an encoding that causes {@link STTStream.testHeaders} to throw a false error, please leave an issue about it in the GitHub repo
     * @returns If encoding was correct, if sample rate was correct, and the headers of the WAV file
     */
    testHeaders(): Promise<[boolean, boolean, WavHeaders]>;
    /**
     * Start STT stream
     * @example
     * See {@link STTStream} for an example
     * @param useConsole - Whether to show a loading spinner and deliver warnings in the console during STT stream. Default `true`
     * @returns Lines of the transcript
     */
    start(useConsole?: boolean): Promise<string[]>;
    /**
     * Main inner method (automatically called by {@link STTStream.start})
     * @internal
     */
    private inner;
}
export default STTStream;
//# sourceMappingURL=STTStream.d.ts.map