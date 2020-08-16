import { google } from "@google-cloud/speech/build/protos/protos";

// Types
/**
 * Listener for the progress value
 * @public
 */
export type ProgressListener = (
  /** Progress percentage */
  progress: number
) => void | Promise<void>;

/**
 *  Listener for the distribute value
 * @public
 */
export type DistributeListener = () => void | Promise<void>;

/**
 * Listener for any property
 * @public
 */
export type Listener = ProgressListener | DistributeListener;

/**
 * Helper type for `Omit2`
 * @internal
 */
type K_ = string | number | symbol;

/**
 *  Omit two properties from an interface
 * @internal
 */
type Omit2<T, K extends K_, K2 extends K_> = Omit<Omit<T, K>, K2>;

/**
 * Audio encoding
 * @public
 */
export type AudioEncoding = keyof typeof google.cloud.speech.v1.RecognitionConfig.AudioEncoding;

// Interfaces
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
export interface WavHeaders
  extends Omit2<STTStreamOptions, "append", "languageCode"> {
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
