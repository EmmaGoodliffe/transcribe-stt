const wavFileInput = document.querySelector("#wav-file") as HTMLInputElement;
const submitButton = document.querySelector("#submit") as HTMLButtonElement;
const resultPara = document.querySelector("#result") as HTMLParagraphElement;
const spinnerDiv = document.querySelector("#spinner") as HTMLDivElement;

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

interface STTResponse {
  input: {
    base64: string;
  };
  transcription: string;
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
  useSpinner(async () => {
    const [file] = wavFileInput.files;
    const base64 = await fileToBase64(file);
    const response = await post("/stt/base64", { base64 });
    resultPara.innerText = response.transcription;
  });
});
