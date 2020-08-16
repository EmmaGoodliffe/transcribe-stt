import { DistributeListener, ProgressListener, STTStreamOptionsAppend } from "./types";
/**
 * A distributed STT stream (for audio files longer than 305 seconds)
 * @public
 */
declare class DistributedSTTStream {
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
    private setProgress;
    /**
     * Listen to `"distribute"` event and run callback functions
     * @param event - Event to listen to
     * @param callback - Function to run when event fires
     */
    on(event: "distribute", callback: DistributeListener): void;
    /**
     * Listen to `"progress"` event and run callback functions
     * @param event - Event to listen to
     * @param callback - Function to run when event fires
     */
    on(event: "progress", callback: ProgressListener): void;
    /**
     * Distribute audio into separate files (automatically called by {@link DistributedSTTStream.start})
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
export default DistributedSTTStream;
//# sourceMappingURL=DistributedSTTStream.d.ts.map