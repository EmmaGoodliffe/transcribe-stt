import { relPathToAbs } from "./helpers";
// import STTStream from "./STTStream";
import DistributedSTTStream from "./DistributedSTTStream";

// Prepare environment
const relGoogleKeyFilename = "./lgim-stt-key.json";
const absGoogleKeyFilename = relPathToAbs(relGoogleKeyFilename);
process.env.GOOGLE_APPLICATION_CREDENTIALS = absGoogleKeyFilename;

const distStream = new DistributedSTTStream(
  "input.wav",
  "./audio_dist",
  "text.txt",
  {
    append: true,
    sampleRateHertz: 48000,
  }
);

distStream.emptyTextFile();
distStream.on("progress", console.log);
distStream.start().catch(console.error);
