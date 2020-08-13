import DistributedSTTStream from "./DistributedSTTStream";
import { relPathToAbs } from "./helpers";

// Prepare environment
const relGoogleKeyFilename = "./lgim-stt-key.json";
const absGoogleKeyFilename = relPathToAbs(relGoogleKeyFilename);
process.env.GOOGLE_APPLICATION_CREDENTIALS = absGoogleKeyFilename;

// Initialise distributed STT stream
const distStream = new DistributedSTTStream(
  "input.wav",
  "./audio_dist",
  "text.txt",
  {
    append: true,
    sampleRateHertz: 48000,
  }
);

// Empty text file
distStream.emptyTextFile();
// Log distribution
distStream.on("distribute", () => console.log("Distributed"));
// Log progress
distStream.on("progress", console.log);
// Start stream
distStream.start().catch(console.error);
