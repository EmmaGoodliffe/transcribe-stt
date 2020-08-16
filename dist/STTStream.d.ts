import { STTStreamOptions, WavHeaders } from "./types";
/**
 * An STT stream
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
    constructor(audioFilename: STTStream["audioFilename"], textFilename: STTStream["textFilename"], options: STTStreamOptions);
    /**
     * Test if headers of WAV file are correct
     * @returns If encoding was correct, if sample rate was correct, and the headers of the WAV file
     */
    testHeaders(): Promise<[boolean, boolean, WavHeaders]>;
    /**
     * Start STT stream
     * @param useConsole - Whether to show a loading spinner and deliver warnings in the console during STT stream. Default `true`
     * @returns Lines of the transcript
     */
    start(useConsole?: boolean): Promise<string[]>;
    /**
     * Main inner method called during `STTStream.start()`
     * @internal
     */
    private inner;
}
export default STTStream;
//# sourceMappingURL=STTStream.d.ts.map