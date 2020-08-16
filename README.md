# google-speech-to-text

Node app for using Google's Speech to Text API

## Contents

- [Description](#description)
- [Installation](#installation)
- [Usage](#usage)
- - [Short audio files](#STTStream)
- - [Long audio files](#DistributedSTTStream)
- - [Google authentication](#google-authentication)
- [Reference](#Reference)
- [Converting audio to a WAV file](#converting-audio-to-a-wav-file)
- [Enabling WSL](#enabling-wsl)
- [To do](#to-do)

## Description

A TypeScript Node app which interacts with [Google's Speech to Text API](https://cloud.google.com/speech-to-text/) using its [`Node client`](https://www.npmjs.com/package/@google-cloud/speech) to transcribe WAV files of any length.

## Installation

```
npm i google-speech-to-text
```

## Usage

To use `google-speech-to-text`, you will need to authenticate yourself with Google's API. See [Google authentication](#google-authentication) for help. If your audio file is under 305 seconds long, you can use the basic [`STTStream`](#STTStream). Otherwise, use the [`DistributedSTTStream`](#DistributedSTTStream).

### `STTStream`

`STTStream` is a simple wrapper class around the [`.streamingRecognize`](https://cloud.google.com/speech-to-text/docs/streaming-recognize) method.

```ts
import { STTStream } from "google-speech-to-text";

// TODO: define GOOGLE_APPLICATION_CREDENTIALS

const audioFile = "PATH TO AUDIO FILE.wav";
const textFile = "PATH TO TEXT FILE.txt";
const options = {
  sampleRateHertz: 16000,
};

const stream = new STTStream(audioFile, textFile, options);

stream.start().catch(console.error);
```

See full [reference](#reference).

### `DistributedSTTStream`

Google allows for streams of up to 305 seconds. Therefore, to transcribe a long audio file through a stream, you must separate the WAV file into smaller chunks and stream them one at a time.

`DistributedSTTStream` is a high-level class that makes this process easy.

```ts
import { DistributedSTTStream } from "google-speech-to-text";

// TODO: define GOOGLE_APPLICATION_CREDENTIALS

const audioFile = "PATH TO AUDIO FILE.wav";
const audioDir = "PATH TO AUDIO DIRECTORY";
const textFile = "PATH TO TEXT FILE.txt";
const options = {
  append: true,
  sampleRateHertz: 16000,
};

const stream = new DistributedSTTStream(audioFile, audioDir, textFile, options);

stream.emptyTextFile();
stream.on("progress", p => console.log(`${p}%`));
stream.start().catch(console.error);
```

See full [reference](#reference).

### Google authentication

## Reference

## Converting audio to a WAV file

## Enabling WSL

## To do

- Create a type for [language codes](https://cloud.google.com/speech-to-text/docs/languages)
- Dynamically generate a reference, e.g. with [`TSDoc`](https://www.npmjs.com/package/@microsoft/tsdoc)
- Rename key file
