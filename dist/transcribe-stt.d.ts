/**
 * Transcribe audio of any length using Google's Speech to Text API
 *
 * @remarks
 * See <a href="#classes">classes</a>
 *
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
 * You can customise the functionality of the stream with the {@link STTStreamOptionsAppend}
 * ```ts
 * import { DistributedSTTStream } from "transcribe-stt";
 *
 * const audioFilename = "./<input audio file>.wav";
 * const audioDirname = "./<output audio directory>";
 * const textFilename = "./<output text file>.txt";
 * const options = {
 *  encoding: "LINEAR16",
 *  sampleRateHertz: 16000,
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
 * Language code
 * @remarks
 * See https://cloud.google.com/speech-to-text/docs/languages
 * @public
 */
export declare type LanguageCode = "af-ZA" | "af-ZA" | "sq-AL" | "sq-AL" | "am-ET" | "am-ET" | "ar-DZ" | "ar-DZ" | "ar-BH" | "ar-BH" | "ar-EG" | "ar-EG" | "ar-IQ" | "ar-IQ" | "ar-IL" | "ar-IL" | "ar-JO" | "ar-JO" | "ar-KW" | "ar-KW" | "ar-LB" | "ar-LB" | "ar-MA" | "ar-MA" | "ar-OM" | "ar-OM" | "ar-QA" | "ar-QA" | "ar-SA" | "ar-SA" | "ar-PS" | "ar-PS" | "ar-TN" | "ar-TN" | "ar-AE" | "ar-AE" | "ar-YE" | "ar-YE" | "hy-AM" | "hy-AM" | "az-AZ" | "az-AZ" | "eu-ES" | "eu-ES" | "bn-BD" | "bn-BD" | "bn-IN" | "bn-IN" | "bs-BA" | "bs-BA" | "bg-BG" | "bg-BG" | "my-MM" | "my-MM" | "ca-ES" | "ca-ES" | "yue-Hant-HK" | "yue-Hant-HK" | "zh (cmn-Hans-CN)" | "zh (cmn-Hans-CN)" | "zh-TW (cmn-Hant-TW)" | "zh-TW (cmn-Hant-TW)" | "hr-HR" | "hr-HR" | "cs-CZ" | "cs-CZ" | "da-DK" | "da-DK" | "nl-BE" | "nl-BE" | "nl-NL" | "nl-NL" | "en-AU" | "en-AU" | "en-CA" | "en-CA" | "en-GH" | "en-GH" | "en-HK" | "en-HK" | "en-IN" | "en-IN" | "en-IE" | "en-IE" | "en-KE" | "en-KE" | "en-NZ" | "en-NZ" | "en-NG" | "en-NG" | "en-PK" | "en-PK" | "en-PH" | "en-PH" | "en-SG" | "en-SG" | "en-ZA" | "en-ZA" | "en-TZ" | "en-TZ" | "en-GB" | "en-GB" | "en-GB" | "en-GB" | "en-US" | "en-US" | "en-US" | "en-US" | "en-US" | "et-EE" | "et-EE" | "fil-PH" | "fil-PH" | "fi-FI" | "fi-FI" | "fr-BE" | "fr-BE" | "fr-CA" | "fr-CA" | "fr-FR" | "fr-FR" | "fr-CH" | "fr-CH" | "gl-ES" | "gl-ES" | "ka-GE" | "ka-GE" | "de-AT" | "de-AT" | "de-DE" | "de-DE" | "de-CH" | "de-CH" | "el-GR" | "el-GR" | "gu-IN" | "gu-IN" | "iw-IL" | "iw-IL" | "hi-IN" | "hi-IN" | "hu-HU" | "hu-HU" | "is-IS" | "is-IS" | "id-ID" | "id-ID" | "it-IT" | "it-IT" | "it-CH" | "it-CH" | "ja-JP" | "ja-JP" | "jv-ID" | "jv-ID" | "kn-IN" | "kn-IN" | "km-KH" | "km-KH" | "ko-KR" | "ko-KR" | "lo-LA" | "lo-LA" | "lv-LV" | "lv-LV" | "lt-LT" | "lt-LT" | "mk-MK" | "mk-MK" | "ms-MY" | "ms-MY" | "ml-IN" | "ml-IN" | "mr-IN" | "mr-IN" | "mn-MN" | "mn-MN" | "ne-NP" | "ne-NP" | "no-NO" | "no-NO" | "fa-IR" | "fa-IR" | "pl-PL" | "pl-PL" | "pt-BR" | "pt-BR" | "pt-PT" | "pt-PT" | "pa-Guru-IN" | "pa-Guru-IN" | "ro-RO" | "ro-RO" | "ru-RU" | "ru-RU" | "ru-RU" | "ru-RU" | "sr-RS" | "sr-RS" | "si-LK" | "si-LK" | "sk-SK" | "sk-SK" | "sl-SI" | "sl-SI" | "es-AR" | "es-AR" | "es-BO" | "es-BO" | "es-CL" | "es-CL" | "es-CO" | "es-CO" | "es-CR" | "es-CR" | "es-DO" | "es-DO" | "es-EC" | "es-EC" | "es-SV" | "es-SV" | "es-GT" | "es-GT" | "es-HN" | "es-HN" | "es-MX" | "es-MX" | "es-NI" | "es-NI" | "es-PA" | "es-PA" | "es-PY" | "es-PY" | "es-PE" | "es-PE" | "es-PR" | "es-PR" | "es-ES" | "es-ES" | "es-US" | "es-US" | "es-US" | "es-US" | "es-UY" | "es-UY" | "es-VE" | "es-VE" | "su-ID" | "su-ID" | "sw-KE" | "sw-KE" | "sw-TZ" | "sw-TZ" | "sv-SE" | "sv-SE" | "ta-IN" | "ta-IN" | "ta-MY" | "ta-MY" | "ta-SG" | "ta-SG" | "ta-LK" | "ta-LK" | "te-IN" | "te-IN" | "th-TH" | "th-TH" | "tr-TR" | "tr-TR" | "uk-UA" | "uk-UA" | "ur-IN" | "ur-IN" | "ur-PK" | "ur-PK" | "uz-UZ" | "uz-UZ" | "vi-VN" | "vi-VN" | "zu-ZA" | "zu-ZA";

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
 * ```ts
 * import { STTStream } form "transcribe-stt";
 *
 * const audioFilename = "./<input audio file>.wav";
 * const textFilename = "./<output text file>.txt";
 * const options = {
 *  encoding: "LINEAR16",
 *  sampleRateHertz: 16000,
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
 * @public
 */
export declare interface STTStreamOptions {
    /** Audio encoding. See {@link AudioEncoding} */
    encoding: AudioEncoding;
    /** Audio sample rate in Hertz */
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
export declare interface STTStreamOptionsAppend extends STTStreamOptions {
    /** Extends {@link STTStreamOptions.append} */
    append: true;
}

export { }
