import copy from "./copy";

const storage = firebase.storage();

const wavFileInput = document.querySelector("#wav-file") as HTMLInputElement;
const submitButton = document.querySelector("#submit") as HTMLButtonElement;
const resultPara = document.querySelector("#result") as HTMLParagraphElement;
const progressBarDiv = document.querySelector(
  "#progress-bar .determinate"
) as HTMLDivElement;

interface STTRequest {
  uri: string;
}

interface STTResponse {
  input: STTRequest;
  transcription?: string;
  error?: string;
}

const post = async (url: string, data: object): Promise<STTResponse> => {
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
      progressBarDiv.style.width = `${percentage}%`;
    },
    err => {
      // Error
      console.error(`Error uploading file: ${err}`);
    },
    async () => {
      // Complete
      const response = await post("/stt/uri", { uri });
      const { error } = response;
      if (error) {
        console.error({ error });
        throw `Error in post request: ${error}`;
      }
      const { transcription } = response;
      resultPara.innerText = transcription;
      copy(transcription);
    }
  );
});
