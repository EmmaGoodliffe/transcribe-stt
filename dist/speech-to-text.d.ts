import { google } from '@google-cloud/speech/build/protos/protos';

/**
 * Audio encoding
 * @alpha
 */
export declare type AudioEncoding = keyof typeof google.cloud.speech.v1.RecognitionConfig.AudioEncoding;

/**
 * A distributed STT stream
 * @alpha
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
    /**
     * Listen to events and run callback functions
     * @param event - Event to listen to
     * @param callback - Function to run when event fires
     */
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

/** Listener for the distribute value */
declare type DistributeListener = () => void | Promise<void>;

/** Listener for the progress value */
declare type ProgressListener = (
/** Progress percentage */
progress: number) => void | Promise<void>;

/**
 * Overridden
 * @alpha
 */
export declare const STTStream: typeof STTStream_2;

/**
 * An STT stream
 * @alpha
 */
declare class STTStream_2 {
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
    constructor(audioFilename: STTStream_2["audioFilename"], textFilename: STTStream_2["textFilename"], options: STTStreamOptions);
    /**
     * Test if headers of wav file are correct
     * @returns If encoding was correct, if sample rate was correct, and the headers of the wav file
     */
    testHeaders(): Promise<[boolean, boolean, STTStreamOptions]>;
    /**
     * Start STT stream
     * @param useConsole - Whether to show a loading spinner and deliver warnings in the console during STT stream. Default `true`
     * @returns Lines of the transcript
     */
    start(useConsole?: boolean): Promise<string[]>;
    private inner;
}

/**
 *  Options for an STT stream
 * @alpha
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
 * @alpha
 */
export declare interface STTStreamOptionsAppend extends STTStreamOptions {
    append: true;
}

export { }