import STTStream from "./STTStream";
import { relPathToAbs } from "./helpers";

// Prepare environment
const relGoogleKeyFilename = "./lgim-stt-key.json";
const absGoogleKeyFilename = relPathToAbs(relGoogleKeyFilename);
process.env.GOOGLE_APPLICATION_CREDENTIALS = absGoogleKeyFilename;

// Define filenames
const shortAudioFilename = "test mono";
const shortTextFilename = "text";
const audioFilename = `audio/${shortAudioFilename}.wav`;
const textFilename = `${shortTextFilename}.txt`;

// Initialise STT stream
const sttStream = new STTStream(audioFilename, textFilename, 48000);
// Start STT stream
sttStream.start().catch(console.error);
