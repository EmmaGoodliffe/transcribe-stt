import { DistributeListener, ProgressListener, STTStreamOptionsAppend } from "./types";
/**
 * A distributed STT stream
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
export default DistributedSTTStream;
//# sourceMappingURL=DistributedSTTStream.d.ts.map