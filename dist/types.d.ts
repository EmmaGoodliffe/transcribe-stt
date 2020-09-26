import { google } from "@google-cloud/speech/build/protos/protos";
import { LanguageCode } from "./generated/LanguageCode";
/**
 * Audio encoding
 * @remarks
 * See https://cloud.google.com/speech-to-text/docs/encoding
 * @public
 */
export declare type AudioEncoding = keyof typeof google.cloud.speech.v1.RecognitionConfig.AudioEncoding;
export { LanguageCode };
/**
 *  Options for an STT stream
 * @public
 */
export interface STTStreamOptions {
    /** Audio encoding. Not required for WAV files */
    encoding?: AudioEncoding;
    /** Audio sample rate in Hertz. Not required for WAV files */
    sampleRateHertz?: number;
    /** BCP-47 language code. Default `"en-US"` */
    languageCode?: LanguageCode;
}
/**
 * Listeners
 * @public
 */
export declare namespace Listeners {
    /** Listener for the distribute event */
    type DistributeListener = () => void | Promise<void>;
    /** Listener for the progress event */
    type ProgressListener = (
    /** Progress percentage */
    progress: number) => void | Promise<void>;
    /** Listener for any event */
    type All = DistributeListener | ProgressListener;
}
//# sourceMappingURL=types.d.ts.map