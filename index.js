const { spawn } = require("child_process");
const express = require("express");

// const script = spawn("python3", ["./index.py"]);

const runBashScript = fileName =>
  new Promise(resolve => {
    const results = [];
    const script = spawn("bash", [fileName]);
    script.stdout.on("data", chunk => results.push(chunk.toString()));
    script.stdout.on("end", () => resolve(results));
  });

const app = express();

app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.json({ message: "Home page" });
});

app.get("/bash", (req, res) => {
  runBashScript("./run.sh")
    .then(output => res.json({ output }))
    .catch(err => res.json({ err }));
});

const port = 3000;
app.listen(port, () => console.log(`Listening at http://localhost:${port}`));
