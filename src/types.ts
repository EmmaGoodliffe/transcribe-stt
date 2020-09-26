import { google } from "@google-cloud/speech/build/protos/protos";
import { LanguageCode } from "./generated/LanguageCode";

// Types
/**
 * Audio encoding
 * @remarks
 * See https://cloud.google.com/speech-to-text/docs/encoding
 * @public
 */
export type AudioEncoding = keyof typeof google.cloud.speech.v1.RecognitionConfig.AudioEncoding;

export { LanguageCode };

// Interfaces
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

// Namespaces
/**
 * Listeners
 * @public
 */
export namespace Listeners {
  /** Listener for the distribute event */
  export type DistributeListener = () => void | Promise<void>;
  /** Listener for the progress event */
  export type ProgressListener = (
    /** Progress percentage */
    progress: number,
  ) => void | Promise<void>;
  /** Listener for any event */
  export type All = DistributeListener | ProgressListener;
}
