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
  const transcription = await sttLong(base64Audio);
  // Return transcription
  return transcription;
};

// const createBase64Request = base64Audio => {
//   // Define audio
//   const audio = {
//     content: base64Audio,
//   };
//   // Define configuration
//   const config = {
//     languageCode: "en-GB",
//   };
//   // Define request
//   const request = {
//     audio,
//     config,
//   };
//   // Return request
//   return request;
// };

const createUriRequest = uri => {
  // Define audio
  const audio = {
    uri,
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

// const stt = async base64Audio => {
//   // Initialise STT client
//   const client = new speech.SpeechClient();
//   // Create request
//   const request = createBase64Request(base64Audio);
//   // Recognise speech
//   const [response] = await client.recognize(request);
//   // Transcribe response
//   const transcription = response.results
//     .map(result => result.alternatives[0].transcript)
//     .join("\n");
//   // Return transcription
//   return transcription;
// };

// const sttBase64 = async base64Audio => {
//   // Initialise STT client
//   const client = new speech.SpeechClient();
//   // Create request
//   const request = createBase64Request(base64Audio);
//   // Recognise long speech
//   const [operation] = await client.longRunningRecognize(request);
//   // Generate promise form
//   const [response] = await operation.promise();
//   // Transcribe response
//   const transcription = response.results
//     .map(result => result.alternatives[0].transcript)
//     .join("\n");
//   // Return transcription
//   return transcription;
// };

const sttUri = async uri => {
  // Initialise STT client
  const client = new speech.SpeechClient();
  // Create request
  const request = createUriRequest(uri);
  // Recognise long speech
  const [operation] = await client.longRunningRecognize(request);
  // Generate promise form
  const [response] = await operation.promise();
  // Transcribe response
  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join("\n\n");
  // Return transcription
  return transcription;
};

const app = express();

app.use(express.urlencoded());

app.get("/", (req, res) => {
  res.json({ message: "Working!" });
});

// app.post("/stt/base64", (req, res) => {
//   const { base64 } = req.body;
//   const input = { base64 };
//   sttBase64(base64)
//     .then(transcription => {
//       const result = {
//         input,
//         transcription,
//       };
//       res.json(result);
//     })
//     .catch(err => res.status(500).json({ error: err, input }));
// });

app.post("/stt/uri", (req, res) => {
  const { uri } = req.body;
  const input = { uri };
  sttUri(uri)
    .then(transcription => {
      const result = {
        input,
        transcription,
      };
      res.json(result);
    })
    .catch(err => res.status(500).json({ error: err, input }));
});

app.get("/stt/file/:filename", (req, res) => {
  const { filename } = req.params;
  const input = { file: filename };
  transcribeLocalFile(filename)
    .then(transcription => {
      const result = {
        input,
        transcription,
      };
      res.json(result);
    })
    .catch(err => res.status(500).json({ error: err, input }));
});

exports.app = functions.https.onRequest(app);
