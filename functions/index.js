const speech = require("@google-cloud/speech");
const express = require("express");
const { readFileSync } = require("fs");
const functions = require("firebase-functions");
const { dirname, resolve } = require("path");

// Helpers
const relPathToAbs = path => resolve(dirname(""), path);

// Prepare environment
const relGoogleKeyFilename = "./lgim-stt-key.json";
const absGoogleKeyFilename = relPathToAbs(relGoogleKeyFilename);
process.env.GOOGLE_APPLICATION_CREDENTIALS = absGoogleKeyFilename;

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

const stt = async base64Audio => {
  // Initialise STT client
  const client = new speech.SpeechClient();
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
  // Recognise speech
  const [response] = await client.recognize(request);
  // Transcribe response
  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join("\n");
  // Return transcription
  return transcription;
};

const app = express();

app.use(express.urlencoded());

app.get("/", (req, res) => {
  res.json({ message: "Working!" });
});

app.get("/stt/base64/:base64_audio", (req, res) => {
  const { base64_audio } = req.params;
  stt(base64_audio).then(transcription => {
    const result = {
      input: {
        base64: base64_audio,
      },
      transcription,
    };
    res.json(result);
  });
});

app.get("/stt/file/:filename", (req, res) => {
  const { filename } = req.params;
  transcribeLocalFile(filename).then(transcription => {
    const result = {
      input: {
        file: filename,
      },
      transcription,
    };
    res.json(result);
  });
});

exports.app = functions.https.onRequest(app);
