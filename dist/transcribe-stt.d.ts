/**
 * Transcribe audio of any length using Google's Speech to Text API
 * @remarks
 * See <a href="#classes">classes</a>
 * @packageDocumentation
 */

import { google } from '@google-cloud/speech/build/protos/protos';

/**
 * Audio encoding
 * @remarks
 * See https://cloud.google.com/speech-to-text/docs/encoding
 * @public
 */
export declare type AudioEncoding = keyof typeof google.cloud.speech.v1.RecognitionConfig.AudioEncoding;

/**
 * A distributed STT stream (for audio files longer than 305 seconds)
 * @example
 * This example writes the transcript of a long LINEAR16 16000Hz WAV file to a text file.
 * The audio files is split up into smaller files saved in the audio directory passed to the constructor.
 * You can customise the functionality of the stream with the {@link STTStreamOptions}
 *
 * ```ts
 * import { DistributedSTTStream } from "transcribe-stt";
 *
 * // TODO: Authenticate with Google. See https://github.com/EmmaGoodliffe/transcribe-stt/blob/master/README.md#google-authentication
 *
 * const audioFilename = "./<input audio file>.wav";
 * const audioDirname = "./<output audio directory>";
 * const textFilename = "./<output text file>.txt";
 * const options = {};
 *
 * // Initialise stream
 * const stream = new DistributedSTTStream(audioFilename, audioDirname, textFilename, options);
 *
 * // Start stream and write output to text file
 * stream.start().catch(console.error);
 * ```
 * @remarks
 * See {@link STTStream} for other properties and methods
 * @public
 */
export declare class DistributedSTTStream extends STTStream {
    audioDirname: string;
    options: STTStreamOptions;
    private progress;
    private progressListeners;
    private distributeListeners;
    /**
     * @param audioFilename - Path to audio file
     * @param audioDirname - Path to output distributed audio directory
     * @param textFilename - Path to text file or null
     * @param options - Options
     */
    constructor(audioFilename: string, audioDirname: string, textFilename: string | null, options: STTStreamOptions);
    /**
     * Distribute audio into separate files (automatically called by {@link DistributedSTTStream.start})
     * @remarks
     * Single audio file is split up into smaller files of 300 seconds so they can be used with Google's streaming API.
     * Each file is separately streamed and written to the text file when {@link DistributedSTTStream.start} is called
     * @returns standard output of bash script
     */
    distribute(): Promise<string>;
    /**
     * Listen to `"distribute"` event and run callback functions
     * @remarks
     * The callback function is run whenever the {@link DistributedSTTStream.distribute} method finishes.
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
     * Set progress
     * @param progress - Progress percentage
     * @internal
     */
    private setProgress;
    /** {@inheritdoc STTStream.start} */
    start(useConsole?: boolean): Promise<string[]>;
}

/**
 * Listener for the distribute value
 * @public
 */
export declare type DistributeListener = () => void | Promise<void>;

/**
 * Language code
 * @remarks
 * See https://cloud.google.com/speech-to-text/docs/languages
 * @public
 */
export declare type LanguageCode = "af-ZA" | "sq-AL" | "am-ET" | "ar-DZ" | "ar-BH" | "ar-EG" | "ar-IQ" | "ar-IL" | "ar-JO" | "ar-KW" | "ar-LB" | "ar-MA" | "ar-OM" | "ar-QA" | "ar-SA" | "ar-PS" | "ar-TN" | "ar-AE" | "ar-YE" | "hy-AM" | "az-AZ" | "eu-ES" | "bn-BD" | "bn-IN" | "bs-BA" | "bg-BG" | "my-MM" | "ca-ES" | "yue-Hant-HK" | "zh (cmn-Hans-CN)" | "zh-TW (cmn-Hant-TW)" | "hr-HR" | "cs-CZ" | "da-DK" | "nl-BE" | "nl-NL" | "en-AU" | "en-CA" | "en-GH" | "en-HK" | "en-IN" | "en-IE" | "en-KE" | "en-NZ" | "en-NG" | "en-PK" | "en-PH" | "en-SG" | "en-ZA" | "en-TZ" | "en-GB" | "en-US" | "et-EE" | "fil-PH" | "fi-FI" | "fr-BE" | "fr-CA" | "fr-FR" | "fr-CH" | "gl-ES" | "ka-GE" | "de-AT" | "de-DE" | "de-CH" | "el-GR" | "gu-IN" | "iw-IL" | "hi-IN" | "hu-HU" | "is-IS" | "id-ID" | "it-IT" | "it-CH" | "ja-JP" | "jv-ID" | "kn-IN" | "km-KH" | "ko-KR" | "lo-LA" | "lv-LV" | "lt-LT" | "mk-MK" | "ms-MY" | "ml-IN" | "mr-IN" | "mn-MN" | "ne-NP" | "no-NO" | "fa-IR" | "pl-PL" | "pt-BR" | "pt-PT" | "pa-Guru-IN" | "ro-RO" | "ru-RU" | "sr-RS" | "si-LK" | "sk-SK" | "sl-SI" | "es-AR" | "es-BO" | "es-CL" | "es-CO" | "es-CR" | "es-DO" | "es-EC" | "es-SV" | "es-GT" | "es-HN" | "es-MX" | "es-NI" | "es-PA" | "es-PY" | "es-PE" | "es-PR" | "es-ES" | "es-US" | "es-UY" | "es-VE" | "su-ID" | "sw-KE" | "sw-TZ" | "sv-SE" | "ta-IN" | "ta-MY" | "ta-SG" | "ta-LK" | "te-IN" | "th-TH" | "tr-TR" | "uk-UA" | "ur-IN" | "ur-PK" | "uz-UZ" | "vi-VN" | "zu-ZA";

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
 * ```ts
 * import { STTStream } form "transcribe-stt";
 *
 * // TODO: Authenticate with Google. See https://github.com/EmmaGoodliffe/transcribe-stt/blob/master/README.md#google-authentication
 *
 * const audioFilename = "./<input audio file>.wav";
 * const textFilename = "./<output text file>.txt";
 * const options = {};
 *
 * // Initialise stream
 * const stream = new STTStream(audioFilename, textFilename, options);
 *
 * // Start stream and write output to text file
 * stream.start().catch(console.error);
 * ```
 * @public
 */
export declare class STTStream {
    audioFilename: string;
    textFilename: string | null;
    neededFiles: string[];
    options: STTStreamOptions;
    /**
     * @param audioFilename - Path to audio file
     * @param textFilename - Path to text file or null
     * @param options - Options
     */
    constructor(audioFilename: string, textFilename: string | null, options: STTStreamOptions);
    /**
     * Check that all needed files exist
     * @returns Whether files exist
     */
    checkFiles(): boolean;
    /**
     * Main inner method (automatically called by {@link STTStream.start})
     * @internal
     */
    private inner;
    /**
     * Start stream
     * @example
     * See {@link STTStream} for an example
     * @param useConsole - Whether to show a loading spinner and deliver warnings in the console during STT stream. Default `true`
     * @returns Lines of the transcript
     */
    start(useConsole?: boolean): Promise<string[]>;
}

/**
 *  Options for an STT stream
 * @public
 */
export declare interface STTStreamOptions {
    /** Audio encoding. Not required for WAV files */
    encoding?: AudioEncoding;
    /** Audio sample rate in Hertz. Not required for WAV files */
    sampleRateHertz?: number;
    /** BCP-47 language code. Default `"en-US"` */
    languageCode?: LanguageCode;
}

export { }
