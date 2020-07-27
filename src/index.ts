import copy from "./copy";

const storage = firebase.storage();

const wavFileInput = document.querySelector("#wav-file") as HTMLInputElement;
const submitButton = document.querySelector("#submit") as HTMLButtonElement;
const resultPara = document.querySelector("#result") as HTMLParagraphElement;
const spinnerDiv = document.querySelector("#spinner") as HTMLDivElement;
const progressBarDiv = document.querySelector(
  "#progress-bar .determinate"
) as HTMLDivElement;

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const base64WithPrefixes = reader.result as string;
      const base64 = base64WithPrefixes.replace("data:audio/wav;base64,", "");
      resolve(base64);
    };
    reader.onerror = () => {
      const err = reader.result;
      reject(`Error converting file to base64: ${err}`);
    };
  });

interface STTRequest {
  base64?: string;
  uri?: string;
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

const startSpinner = () => {
  spinnerDiv.classList.remove("invisible");
};

const stopSpinner = () => {
  spinnerDiv.classList.add("invisible");
};

const useSpinner = async <T>(asyncFunc: () => Promise<T>) => {
  startSpinner();
  const result = await asyncFunc();
  stopSpinner();
  return result;
};

submitButton.addEventListener("click", () => {
  // useSpinner(async () => {
  // const [file] = wavFileInput.files;
  //   const base64 = await fileToBase64(file);
  //   const response = await post("/stt/base64", { base64 });
  //   const { error } = response;
  //   if (error) {
  //     console.error({ error });
  //     throw `Error in post request: ${error}`;
  //   }
  //   const { transcription } = response;
  //   resultPara.innerText = transcription;
  //   copy(transcription);
  // }).catch(err => console.error(err));

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
