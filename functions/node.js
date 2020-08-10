const { dirname, resolve } = require("path");
const { createReadStream, appendFile, writeFileSync } = require("fs");
const { SpeechClient } = require("@google-cloud/speech");

// Helpers
const relPathToAbs = path => resolve(dirname(""), path);

// Prepare environment
const relGoogleKeyFilename = "./lgim-stt-key.json";
const absGoogleKeyFilename = relPathToAbs(relGoogleKeyFilename);
process.env.GOOGLE_APPLICATION_CREDENTIALS = absGoogleKeyFilename;

const shortAudioFilename = "test 3 mono";
const shortTextFilename = "text";
const audioFilename = `audio/${shortAudioFilename}.wav`;
const textFilename = `${shortTextFilename}.txt`;

// Empty file
writeFileSync(textFilename, "");

// Initialise client
const client = new SpeechClient();

// Define request
const request = {
  config: {
    encoding: "LINEAR16",
    sampleRateHertz: 48000,
    languageCode: "en-GB",
  },
  // interimResults: true,
};

// Create read stream for audio file
const audioReadStream = createReadStream(audioFilename);

// Define a read/write stream to handle audio file
const recogniseStream = client
  .streamingRecognize(request)
  .on("error", err => {
    // Handle errors
    throw `Error in stream: ${err}`;
  })
  .on("data", data => {
    // Get result
    const result = data.results[0].alternatives[0].transcript;
    // Append result to text file
    appendFile("text.txt", `${result}\n`, () => {});
  })
  .on("end", () => console.log("Done"));

// Pipe audio file through read/write stream
audioReadStream.pipe(recogniseStream);
