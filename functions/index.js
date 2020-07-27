const speech = require("@google-cloud/speech");
const { readFileSync } = require("fs");

const main = async () => {
  // Initialise STT client
  const client = new speech.SpeechClient();
  // Read audio file
  const filename = "./test mono.wav";
  const audioFile = readFileSync(filename);
  // Covert audio to base64
  const base64Audio = audioFile.toString("base64");

  // Define audio
  const audio = {
    content: base64Audio,
  };

  // Define request
  const request = {
    audio,
    config: {
      languageCode: "en-GB"
    }
  };

  // Recognise speech
  const [response] = await client.recognize(request);

  // Transcribe response
  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join("\n");

  // Log transcription
  console.log(`Transcription: ${transcription}`);
};

// Run
main().catch(console.error);
