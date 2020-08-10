import { relPathToAbs } from "./helpers";
import STTStream from "./STTStream";

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
const sttStream = new STTStream(audioFilename, textFilename, {
  sampleRateHertz: 48000,
});

// Start STT stream
sttStream.start().catch(console.error);
