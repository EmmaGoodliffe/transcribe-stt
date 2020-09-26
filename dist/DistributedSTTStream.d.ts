import STTStream from "./STTStream";
import { Listeners, STTStreamOptions } from "./types";
/**
 * A distributed STT stream (for audio files longer than 305 seconds)
 * @example
 * This example writes the transcript of a long WAV file to a text file.
 * The audio files is split up into smaller files saved in the audio directory passed to the constructor.
 * See {@link DistributedSTTStream.distribute} for more details
 *
 * See {@link https://github.com/EmmaGoodliffe/transcribe-stt/blob/master/README.md#google-authentication | guide} for help authenticating
 *
 * ```ts
 * import { DistributedSTTStream } from "transcribe-stt";
 *
 * // Define arguments
 * const audioFilename = "./<input audio file>.wav";
 * const audioDirname = "./<output audio directory>";
 * const textFilename = "./<output text file>.txt";
 * const options = {};
 *
 * // Initialise stream
 * const stream = new DistributedSTTStream(audioFilename, audioDirname, textFilename, options);
 *
 * // Start stream
 * stream.start().catch(console.error);
 * ```
 * @remarks
 * See {@link STTStream} for other properties and methods
 * @public
 */
declare class DistributedSTTStream extends STTStream {
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
     * @returns Standard output of bash script
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
    on(event: "distribute", callback: Listeners.DistributeListener): void;
    /**
     * Listen to `"progress"` event and run callback functions
     * @remarks
     * The callback function is run whenever a distributed audio file is transcribed.
     * The progress percentage of audio files transcribed is passed as the parameter of the callback.
     * For example, if 2 of 4 audio files have been transcribed, `50` will be passed, representing 50%
     * @param event - Event to listen to
     * @param callback - Function to run when event fires
     */
    on(event: "progress", callback: Listeners.ProgressListener): void;
    /**
     * Set progress
     * @param progress - Progress percentage
     * @internal
     */
    private setProgress;
    /** {@inheritdoc STTStream.start} */
    start(useConsole?: boolean): Promise<string[]>;
}
export default DistributedSTTStream;
//# sourceMappingURL=DistributedSTTStream.d.ts.map