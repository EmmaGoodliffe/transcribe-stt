const express = require("express");
const functions = require("firebase-functions");
const { dirname, resolve } = require("path");
const { transcribeLocalFile } = require("./transcribeLocalFile");
const { sttUri } = require("./sttUri");

// Helpers
const relPathToAbs = path => resolve(dirname(""), path);

// Prepare environment
const relGoogleKeyFilename = "./lgim-stt-key.json";
const absGoogleKeyFilename = relPathToAbs(relGoogleKeyFilename);
process.env.GOOGLE_APPLICATION_CREDENTIALS = absGoogleKeyFilename;

// Initialise express app
const app = express();

// Use body parser for post requests
app.use(express.urlencoded());

// Handle `/stt/uri` post requests
app.post("/stt/uri", (req, res) => {
  const { uri } = req.body;
  sttUri(uri)
    .then(result => {
      const status = result.error ? 500 : 200;
      res.status(status).json(result);
    })
    .catch(err => console.error(err));
});

// Handle `/stt/file/:filename` get requests
app.get("/stt/file/:filename", (req, res) => {
  const { filename } = req.params;
  transcribeLocalFile(filename)
    .then(result => {
      const status = result.error ? 500 : 200;
      res.status(status).json(result);
    })
    .catch(err => console.error(err));
});

exports.app = functions.https.onRequest(app);
