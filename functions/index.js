const { spawn } = require("child_process");
const express = require("express");
const functions = require("firebase-functions");

const runBashScript = (bashFile, audioFile) =>
  new Promise(resolve => {
    const results = [];
    const script = spawn("bash", [bashFile, audioFile]);
    script.stdout.on("data", chunk => results.push(chunk.toString()));
    script.stdout.on("error", err => results.push(err));
    script.stdout.on("end", () => resolve(results));
  });

const app = express();

app.get("/", (req, res) => {
  res.json({ message: "Working!" });
});

app.get("/stt", (req, res) => {
  runBashScript("./run.sh", "./test.wav")
    .then(output => res.json({ output }))
    .catch(err => res.json({ error: err }));
});

exports.app = functions.https.onRequest(app);
