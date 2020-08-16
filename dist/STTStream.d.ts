import { google } from "@google-cloud/speech/build/protos/protos";
import { WavHeaders } from "./helpers";
/**
 * Audio encoding
 * @public
 */
export declare type AudioEncoding = keyof typeof google.cloud.speech.v1.RecognitionConfig.AudioEncoding;
/**
 *  Options for an STT stream
 * @public
 */
export interface STTStreamOptions {
    /** When true, results are appended to the text file. When false, the text file is emptied first. Default `false` */
    append?: boolean;
    /** Audio encoding. See https://cloud.google.com/speech-to-text/docs/encoding. Default `"LINEAR16"` */
    encoding?: AudioEncoding;
    /** Audio sample rate in Hertz */
    sampleRateHertz: number;
    /** BCP-47 language code. See https://cloud.google.com/speech-to-text/docs/languages. Default `"en-US"` */
    languageCode?: string;
}
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
     * Test if headers of wav file are correct
     * @returns If encoding was correct, if sample rate was correct, and the headers of the wav file
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