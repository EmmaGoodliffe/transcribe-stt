import { google } from "@google-cloud/speech/build/protos/protos";
/**
 * Listener for the progress value
 * @public
 */
export declare type ProgressListener = (
/** Progress percentage */
progress: number) => void | Promise<void>;
/**
 *  Listener for the distribute value
 * @public
 */
export declare type DistributeListener = () => void | Promise<void>;
/**
 * Listener for any property
 * @public
 */
export declare type Listener = ProgressListener | DistributeListener;
/**
 * Helper type for `Omit2`
 * @internal
 */
declare type K_ = string | number | symbol;
/**
 *  Omit two properties from an interface
 * @internal
 */
declare type Omit2<T, K extends K_, K2 extends K_> = Omit<Omit<T, K>, K2>;
/**
 * Audio encoding
 * @public
 */
export declare type AudioEncoding = keyof typeof google.cloud.speech.v1.RecognitionConfig.AudioEncoding;
/**
 * Options for an STT stream but `append` must be set to `true`
 * @public
 */
export interface STTStreamOptionsAppend extends STTStreamOptions {
    append: true;
}
/**
 * Headers of a WAV file
 * @public
 */
export interface WavHeaders extends Omit2<STTStreamOptions, "append", "languageCode"> {
    encoding: AudioEncoding;
}
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
export {};
//# sourceMappingURL=types.d.ts.map