const speech = require("@google-cloud/speech");
const { readFileSync, writeFileSync } = require("fs");
const { dirname, resolve } = require("path");

// Helpers
const relPathToAbs = path => resolve(dirname(""), path);

// Prepare environment
const relGoogleKeyFilename = "./lgim-stt-key.json";
const absGoogleKeyFilename = relPathToAbs(relGoogleKeyFilename);
process.env.GOOGLE_APPLICATION_CREDENTIALS = absGoogleKeyFilename;

const createBase64Request = base64Audio => {
  // Define audio
  const audio = {
    content: base64Audio,
  };
  // Define configuration
  const config = {
    languageCode: "en-GB",
  };
  // Define request
  const request = {
    audio,
    config,
  };
  // Return request
  return request;
};

const stt = async base64Audio => {
  // Initialise STT client
  const client = new speech.SpeechClient();
  // Create request
  const request = createBase64Request(base64Audio);
  // Recognise speech
  const [response] = await client.recognize(request);
  // Transcribe response
  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join("\n");
  // Return transcription
  return transcription;
};

const transcribeLocalFile = async filename => {
  // Read audio file
  const audioFile = readFileSync(`./audio/${filename}`);
  // Covert audio to base64
  const base64Audio = audioFile.toString("base64");
  // Run STT
  const transcription = await stt(base64Audio);
  // Return transcription
  return transcription;
};

transcribeLocalFile("./meeting.wav")
  .then(transcript => {
    writeFileSync("./meeting.txt", transcript);
  })
  .catch(err => console.error(err));
