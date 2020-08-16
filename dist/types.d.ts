import { google } from "@google-cloud/speech/build/protos/protos";
/**
 * Listener for the progress value
 * <h2>Parameters</h2>
 * `progress` - Progress percentage
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
 * @public
 */
export declare type AudioEncoding = keyof typeof google.cloud.speech.v1.RecognitionConfig.AudioEncoding;
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
    /** Extends {@link WavHeaders.encoding}. Default `"LINEAR16"` */
    encoding: AudioEncoding;
    /** When true, results are appended to the text file. When false, the text file is emptied first. Default `false` */
    append?: boolean;
    /** BCP-47 language code. See https://cloud.google.com/speech-to-text/docs/languages. Default `"en-US"` */
    languageCode?: string;
}
/**
 * Options for an STT stream but `append` must be set to `true`
 * @remarks
 * Even though `append` must be set to `true`, you can use {@link DistributedSTTStream.emptyTextFile} to empty the file first.
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