import firebase from "firebase/app";
import "firebase/analytics";
import "firebase/storage";

import copy from "./copy";
import download from "./download";
import Server from "./Server";
import Progress from "./Progress";

// Configure firebase
const firebaseConfig = {
  apiKey: "AIzaSyC69UlY6-nX58VAsWY_FxRYNcQz65HxFUw",
  authDomain: "lgim-stt.firebaseapp.com",
  databaseURL: "https://lgim-stt.firebaseio.com",
  projectId: "lgim-stt",
  storageBucket: "lgim-stt.appspot.com",
  messagingSenderId: "676795015015",
  appId: "1:676795015015:web:67a2723a118472304d99c2",
  measurementId: "G-YSVF271RC6",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
const storage = firebase.storage();

// Get elements
const wavFileInput = document.querySelector("#wav-file") as HTMLInputElement;
const submitButton = document.querySelector("#submit") as HTMLButtonElement;
const resultPara = document.querySelector("#result") as HTMLParagraphElement;
const progressDiv = document.querySelector(
  "#progress .determinate"
) as HTMLDivElement;
const serverIcon = document.querySelector("#server") as HTMLElement;

// Create helper class instances
const server = new Server(serverIcon);
const progress = new Progress(progressDiv);

// Interfaces
interface STTRequest {
  uri: string;
}

interface STTResponse {
  input: STTRequest;
  transcription?: string;
  error?: string;
}

const post = async (url: string, data: object): Promise<object> => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

submitButton.addEventListener("click", () => {
  // File
  const [file] = wavFileInput.files;
  const filename = `wav/${Date.now()}.wav`;
  const uri = `gs://lgim-stt.appspot.com/${filename}`;
  // Storage ref
  const ref = storage.ref(filename);
  // Upload
  const task = ref.put(file);
  // Progress bar
  task.on(
    "state_changed",
    snapshot => {
      // Progress
      const percentage =
        (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      progress.set(percentage);
    },
    err => {
      // Error
      console.error(`Error uploading file: ${err}`);
    },
    async () => {
      // Complete
      server.start();
      const response = (await post("/stt/uri", { uri })) as STTResponse;
      const { error } = response;
      if (error) {
        console.error(error);
        throw `Error in post request: ${error}`;
      }
      const { transcription } = response;
      server.stop();
      progress.set(0);
      resultPara.innerText = transcription;
      copy(transcription);
      download("transcript.txt", transcription);
    }
  );
});
