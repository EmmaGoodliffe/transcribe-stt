# transcribe-stt

Transcribe audio of any length using Google's Speech to Text API

## Contents

- [Description](#description)
- [Installation](#installation)
- [Reference](#Reference)
- [Google authentication](#google-authentication)
- [Converting audio to a WAV file](#converting-audio-to-a-wav-file)
- [To do](#to-do)

## Description

A TypeScript Node app which interacts with [Google's Speech to Text API](https://cloud.google.com/speech-to-text/) using its [`Node client`](https://www.npmjs.com/package/@google-cloud/speech) to transcribe WAV files of any length.

## Installation

```
npm i transcribe-stt
```

## Reference

See the [reference documentation](./docs/md/index.md).

## Google authentication

To stream any audio, you must authenticate yourself with Google. To do this, just follow the steps below

1. Complete step 1 (only) of [Google's "quickstart" guide](https://cloud.google.com/speech-to-text/docs/quickstart-client-libraries#before-you-begin) to create a GCP project and a private key. Save the private key in your project. (In this guide, we will call it `key.json`)
1. Make sure any repo utilities ignore your new JSON key, e.g. by adding it to a `.gitignore`:
   ```
   key.json
   ```
1. Change the value of the environment variable `GOOGLE_APPLICATION_CREDENTIALS` to the **absolute** path to your JSON key. There are multiple ways to do this. The easiest way is probably `dotenv`

   - `dotenv` (a package for easily defining environment variables)

     1. Create a file called `.env` and add it to any `.gitignore`/etc in the same way as the JSON key
     1. In your `.env`, add a line as follows, replacing `PATH` with the absolute path to your JSON key
        ```
        GOOGLE_APPLICATION_CREDENTIALS=PATH
        ```
     1. Install `dotenv`
        ```
        npm i dotenv --save-dev
        ```
     1. Configure `dotenv` before using any `transcribe-stt` services

        ```ts
        import { config } from "dotenv";
        // Or in JavaScript: const { config } = require("dotenv");

        config();
        ```

     1. Done!

   - Directly through Node

     1. Before using any `transcribe-stt` services, define the environment variable

        ```ts
        import { dirname, resolve } from "path";
        // Or in JavaScript: const { dirname, resolve } = require("path");

        // Define relative path
        const relGoogleKeyFilename = "./key.json";
        // Convert to absolute path
        const absGoogleKeyFilename = resolve(dirname(""), relGoogleKeyFilename);
        // Save to environment variable
        process.env.GOOGLE_APPLICATION_CREDENTIALS = absGoogleKeyFilename;
        ```

     1. Done!

   - Command-line/shell
     1. Define environment variable, replacing `PATH` with the absolute path to your JSON key
        - Linux/macOS
          ```
          export GOOGLE_APPLICATION_CREDENTIALS="PATH"
          ```
        - Windows
          - PowerShell
            ```
            $env:GOOGLE_APPLICATION_CREDENTIALS="PATH"
            ```
          - Command prompt
            ```
            set GOOGLE_APPLICATION_CREDENTIALS=PATH
            ```
     1. Done!

## Converting audio to a WAV file

To use an audio file with `transcribe-stt`, it must be a WAV file with mono audio. This is a simple guide to converting audio files with an editor, specifically [Audacity](https://www.audacityteam.org/), which is free and available on all 3 major operating systems. However, many of the steps will be very similar on any audio editing software

1. Open the editor and import your audio
   > File > Import > Audio...
1. Select all
   > Select > All
1. Convert to mono if necessary
   > Tracks > Mix > Mix Stereo Down to Mono
1. Optionally change sample rate (and remember it for later)
   > Tracks > Resample...
1. Export as WAV file
   > Export > Export as WAV
1. Optionally change the encoding. When the export dialogue appears, there is an option to "Save as type" where you can choose what encoding you want (and remember it for later)

## To do

- Simultaneously stream each file during `DistributedSTTStream.start()` to increase speed
- Create development guide
- Use docker
- Don't check WAV headers
- Document how to change to a WAV file programmatically
- Make `STTStream` and `DistributedSTTStream` extend same class, or make `DistributedSTTStream` extend `STTStream`
