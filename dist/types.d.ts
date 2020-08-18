import { google } from "@google-cloud/speech/build/protos/protos";
import { LanguageCode } from "./generated/LanguageCode";
/**
 * Listener for the progress value
 * @remarks
 * <h2>Parameters</h2>
 * <code>progress</code> - Progress percentage
 * @public
 */
export declare type ProgressListener = (progress: number) => void | Promise<void>;
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
 * Audio encoding
 * @remarks
 * See https://cloud.google.com/speech-to-text/docs/encoding
 *
 * If you don't know the encoding of your WAV file, find out how to check it <a href="https://github.com/EmmaGoodliffe/transcribe-stt/blob/master/README.md#encoding">here</a>
 * @public
 */
export declare type AudioEncoding = keyof typeof google.cloud.speech.v1.RecognitionConfig.AudioEncoding;
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
     * If you don't know the encoding of your WAV file, find out how to check it <a href="https://github.com/EmmaGoodliffe/transcribe-stt/blob/master/README.md#sample-rate">here</a>
     */
    sampleRateHertz: number;
    /** BCP-47 language code. See {@link LanguageCode}. Default `"en-US"` */
    languageCode?: LanguageCode;
    /** When true, results are appended to the text file. When false, the text file is emptied first. Default `false` */
    append?: boolean;
}
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
//# sourceMappingURL=types.d.ts.map