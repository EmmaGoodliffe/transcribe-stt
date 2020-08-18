import { google } from "@google-cloud/speech/build/protos/protos";
import DistributedSTTStream from "./DistributedSTTStream";
import { LanguageCode } from "./generated/LanguageCode";

// Types
/**
 * Listener for the progress value
 * @remarks
 * <h2>Parameters</h2>
 * <code>progress</code> - Progress percentage
 * @public
 */
export type ProgressListener = (progress: number) => void | Promise<void>;

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
 * Audio encoding
 * @public
 */
export type AudioEncoding = keyof typeof google.cloud.speech.v1.RecognitionConfig.AudioEncoding;

// Interfaces
/**
 * Headers of a WAV file
 * @public
 */
export interface WavHeaders {
  /** Audio encoding. See https://cloud.google.com/speech-to-text/docs/encoding */
  encoding: AudioEncoding;
  /** Audio sample rate in Hertz */
  sampleRateHertz: number;
}

/**
 *  Options for an STT stream
 * @remarks
 * See {@link WavHeaders} for other properties
 * @public
 */
export interface STTStreamOptions extends WavHeaders {
  /** BCP-47 language code. See https://cloud.google.com/speech-to-text/docs/languages. Default `"en-US"` */
  languageCode?: LanguageCode;
  /** When true, results are appended to the text file. When false, the text file is emptied first. Default `false` */
  append?: boolean;
}

DistributedSTTStream;
/**
 * Options for an STT stream but `append` must be set to `true`
 * @remarks
 * `append` must be set to `true` because each audio file's transcript is appended to the same file.
 * Despite this, you can use {@link DistributedSTTStream.emptyTextFile} to empty the file first.
 * See {@link DistributedSTTStream} for an example.
 *
 * See {@link STTStreamOptions} for other properties
 * @public
 */
export interface STTStreamOptionsAppend extends STTStreamOptions {
  /** Extends {@link STTStreamOptions.append} */
  append: true;
}
