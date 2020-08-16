import { google } from '@google-cloud/speech/build/protos/protos';

/**
 * Audio encoding
 * @public
 */
export declare type AudioEncoding = keyof typeof google.cloud.speech.v1.RecognitionConfig.AudioEncoding;

/**
 * A distributed STT stream
 * @public
 */
export declare class DistributedSTTStream {
    audioFilename: string;
    audioDirname: string;
    textFilename: string;
    options: STTStreamOptionsAppend;
    progress: number;
    progressListeners: ProgressListener[];
    distributeListeners: DistributeListener[];
    /**
     * @param audioFilename - Path to original audio file
     * @param audioDirname - Path to output distributed audio directory
     * @param textFilename - Path to text file
     * @param options - Options
     */
    constructor(audioFilename: DistributedSTTStream["audioFilename"], audioDirname: DistributedSTTStream["audioDirname"], textFilename: DistributedSTTStream["textFilename"], options: DistributedSTTStream["options"]);
    private setProgress;
    /**
     * Listen to events and run callback functions
     * @param event - Event to listen to
     * @param callback - Function to run when event fires
     */
    on(event: "distribute", callback: DistributeListener): void;
    on(event: "progress", callback: ProgressListener): void;
    /**
     * Distribute audio into separate files. (`.distribute` is automatically called by `.start`)
     * @returns STD output
     */
    distribute(): Promise<string>;
    /**
     * Start distributed STT stream
     * @param useConsole - Whether to show a loading spinner and deliver warnings in the console during STT stream. Default `true`
     * @returns Lines of the transcript
     */
    start(useConsole?: boolean): Promise<string[]>;
    /** Empty text file */
    emptyTextFile(): void;
}

/**
 *  Listener for the distribute value
 * @public
 */
export declare type DistributeListener = () => void | Promise<void>;

/**
 * Helper type for `Omit2`
 * @internal
 */
declare type K_ = string | number | symbol;

/**
 * Listener for any property
 * @public
 */
export declare type Listener = ProgressListener | DistributeListener;

/**
 *  Omit two properties from an interface
 * @internal
 */
declare type Omit2<T, K extends K_, K2 extends K_> = Omit<Omit<T, K>, K2>;

/**
 * Listener for the progress value
 * @public
 */
export declare type ProgressListener = (
/** Progress percentage */
progress: number) => void | Promise<void>;

/**
 * An STT stream
 * @public
 */
export declare class STTStream {
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
     * Test if headers of WAV file are correct
     * @returns If encoding was correct, if sample rate was correct, and the headers of the WAV file
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

/**
 *  Options for an STT stream
 * @public
 */
export declare interface STTStreamOptions {
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
 * Options for an STT stream but `append` must be set to `true`
 * @public
 */
export declare interface STTStreamOptionsAppend extends STTStreamOptions {
    append: true;
}

/**
 * Headers of a WAV file
 * @public
 */
export declare interface WavHeaders extends Omit2<STTStreamOptions, "append", "languageCode"> {
    encoding: AudioEncoding;
}

export { }
