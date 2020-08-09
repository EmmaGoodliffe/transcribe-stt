const speech = require("@google-cloud/speech");

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

const main = async uri => {
  const input = { uri };
  try {
    const transcription = await sttUri(uri);
    const result = {
      input,
      transcription,
    };
    return result;
  } catch (err) {
    const error = {
      input,
      error: {
        ...err,
        message: `${err}`,
      },
    };
    return error;
  }
};

exports.sttUri = main;
