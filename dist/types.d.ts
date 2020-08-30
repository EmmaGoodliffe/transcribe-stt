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
 * Listeners
 * @public
 */
export interface Listeners {
    /** Listener for the distribute event */
    DistributeListener: () => void | Promise<void>;
    /**
     * Listener for the progress event
     * @remarks
     * <h2>Parameters</h2>
     * <code>progress</code> - Progress percentage
     */
    ProgressListener: (progress: number) => void | Promise<void>;
    /**
     * Listener for all events
     * @internal
     */
    All: Listeners["ProgressListener"] | Listeners["DistributeListener"];
}
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
//# sourceMappingURL=types.d.ts.map