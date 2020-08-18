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
 * @remarks
 * See https://cloud.google.com/speech-to-text/docs/encoding
 *
 * If you don't know the encoding or sample rate of your WAV file, see https://github.com/EmmaGoodliffe/transcribe-stt/blob/master/README.md#encoding
 * @public
 */
export type AudioEncoding = keyof typeof google.cloud.speech.v1.RecognitionConfig.AudioEncoding;

// Interfaces
/**
 *  Options for an STT stream
 * @public
 */
export interface STTStreamOptions {
  /** Audio encoding. See {@link AudioEncoding} */
  encoding: AudioEncoding;
  /**
   * Audio sample rate in Hertz
   * @remarks
   * If you don't know the encoding or sample rate of your WAV file, see https://github.com/EmmaGoodliffe/transcribe-stt/blob/master/README.md#sample-rate
   */
  sampleRateHertz: number;
  /** BCP-47 language code. See {@link LanguageCode}. Default `"en-US"` */
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
