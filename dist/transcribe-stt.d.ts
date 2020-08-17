/**
 * @packageDocumentation
 * Transcribe audio of any length using Google's Speech to Text API
 *
 * See <a href="#classes">classes</a>
 */

import { google } from '@google-cloud/speech/build/protos/protos';

/**
 * Audio encoding
 * @public
 */
export declare type AudioEncoding = keyof typeof google.cloud.speech.v1.RecognitionConfig.AudioEncoding;

/**
 * A distributed STT stream (for audio files longer than 305 seconds)
 * @example
 * This example writes the transcript of a long LINEAR16 16000Hz WAV file to a text file.
 * You can customise the functionality of the stream with the {@link STTStreamOptionsAppend}.
 *
 * If you don't know the encoding or sample rate of you WAV file, try using {@link STTStream.testHeaders}
 * ```ts
 * import { DistributedSTTStream } from "transcribe-stt";
 *
 * const audioFilename = "./<input audio file>.wav";
 * const audioDirname = "./<output audio directory>";
 * const textFilename = "./<output text file>.txt";
 * const options = {
 *  encoding: "LINEAR16",
 *  sampleRateHertz: 16000
 * };
 *
 * // Initialise stream
 * const stream = new DistributedSTTStream(audioFilename, audioDirname, textFilename, options);
 *
 * // Empty text file
 * stream.emptyTextFile();
 *
 * // Start stream and write output to text file
 * stream.start();
 * ```
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
    constructor(audioFilename: string, audioDirname: string, textFilename: string, options: STTStreamOptionsAppend);
    /**
     * Set progress
     * @param progress - Progress percentage
     * @internal
     */
    private setProgress;
    /**
     * Listen to `"distribute"` event and run callback functions
     * @remarks
     * The callback function is run whenever the {@link DistributedSTTStream.distribute} method finishes.
     *
     * This can be helpful if you are using a very large audio file and want to know when it has been split up by the {@link DistributedSTTStream.start} method.
     *
     * ({@link DistributedSTTStream.distribute} returns a promise which resolves when the distribution completes.
     * So if you are using the method on its own, this event is obsolete)
     * @param event - Event to listen to
     * @param callback - Function to run when event fires
     */
    on(event: "distribute", callback: DistributeListener): void;
    /**
     * Listen to `"progress"` event and run callback functions
     * @remarks
     * The callback function is run whenever a distributed audio file is transcribed.
     * The progress percentage of audio files transcribed is passed as the parameter of the callback.
     * For example, if 2 of 4 audio files have been transcribed, `50` will be passed, representing 50%
     * @param event - Event to listen to
     * @param callback - Function to run when event fires
     */
    on(event: "progress", callback: ProgressListener): void;
    /**
     * Distribute audio into separate files (automatically called by {@link DistributedSTTStream.start})
     * @remarks
     * Single audio file is split up into smaller files of 300 seconds so they can be used with Google's streaming API.
     * Each file is separately streamed and written to the text file when {@link DistributedSTTStream.start} is called
     * @returns STD output of bash script
     */
    distribute(): Promise<string>;
    /**
     * Start distributed STT stream
     * @param useConsole - Whether to show a loading spinner and deliver warnings in the console during STT stream. Default `true`
     * @returns Lines of the transcript
     */
    start(useConsole?: boolean): Promise<string[]>;
    /** {@inheritdoc STTStream.emptyTextFile} */
    emptyTextFile(): void;
}

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
 * Listener for the progress value
 * @remarks
 * <h2>Parameters</h2>
 * <code>progress</code> - Progress percentage
 * @public
 */
export declare type ProgressListener = (progress: number) => void | Promise<void>;

/**
 * An STT stream (for audio files shorter than 305 seconds)
 * @example
 * This example writes the transcript of a short LINEAR16 16000Hz WAV file to a text file.
 * You can customise the functionality of the stream with the {@link STTStreamOptions}.
 *
 * If you don't know the encoding or sample rate of your WAV file, try using {@link STTStream.testHeaders}
 * ```ts
 * import { STTStream } form "transcribe-stt";
 *
 * const audioFilename = "./<input audio file>.wav";
 * const textFilename = "./<output text file>.txt";
 * const options = {
 *  encoding: "LINEAR16",
 *  sampleRateHertz: 16000
 * };
 *
 * // Initialise stream
 * const stream = new STTStream(audioFilename, textFilename, options);
 *
 * // Start stream and write output to text file
 * stream.start();
 * ```
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
    constructor(audioFilename: string, textFilename: string, options: STTStreamOptions);
    /**
     * Test if headers of WAV file are correct
     * @example
     * This example checks if the headers you passed to {@link STTStream} are correct and logs them.
     * This can be helpful when you don't know what headers of your WAV file are.
     *
     * See also {@link STTStream}
     *
     * ```ts
     * // ...
     *
     * // Initialise stream with arbitrary headers to test
     * const stream = new STTStream("...", "...", {
     *  encoding: "LINEAR16",
     *  sampleRateHertz: 16000
     * });
     *
     * // Test headers
     * const [goodEncoding, goodSampleRate, headers] = await stream.testHeaders();
     *
     * // Log results
     * console.log("File has correct encoding?:", goodEncoding);
     * console.log("File has correct sample rate?:", goodSampleRate);
     *
     * // Log headers
     * console.log("File's encoding:", headers.encoding);
     * console.log("File's sample rate:", headers.sampleRateHertz);
     * ```
     * @remarks
     * This method does not test encodings perfectly as many encodings go by multiples aliases.
     * For example, "LINEAR16" is often listed in headers as "Microsoft PCM 16 bit".
     *
     * Because of this, {@link STTStream.testHeaders} does not have to pass for {@link STTStream.start} to pass.
     *
     * If you find an alias of an encoding that causes {@link STTStream.testHeaders} to throw a false error, please leave an issue about it in the GitHub repo
     * @returns If encoding was correct, if sample rate was correct, and the headers of the WAV file
     */
    testHeaders(): Promise<[boolean, boolean, WavHeaders]>;
    /**
     * Start STT stream
     * @example
     * See {@link STTStream} for an example
     * @param useConsole - Whether to show a loading spinner and deliver warnings in the console during STT stream. Default `true`
     * @returns Lines of the transcript
     */
    start(useConsole?: boolean): Promise<string[]>;
    /**
     * Main inner method (automatically called by {@link STTStream.start})
     * @internal
     */
    private inner;
    /** Empty text file */
    emptyTextFile(): void;
}

/**
 *  Options for an STT stream
 * @remarks
 * See {@link WavHeaders} for other properties
 * @public
 */
export declare interface STTStreamOptions extends WavHeaders {
    /** BCP-47 language code. See https://cloud.google.com/speech-to-text/docs/languages. Default `"en-US"` */
    languageCode?: string;
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
export declare interface STTStreamOptionsAppend extends STTStreamOptions {
    /** Extends {@link STTStreamOptions.append} */
    append: true;
}

/**
 * Headers of a WAV file
 * @public
 */
export declare interface WavHeaders {
    /** Audio encoding. See https://cloud.google.com/speech-to-text/docs/encoding */
    encoding: AudioEncoding;
    /** Audio sample rate in Hertz */
    sampleRateHertz: number;
}

export { }
