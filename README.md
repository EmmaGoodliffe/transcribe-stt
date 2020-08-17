# transcribe-stt

Transcribe audio of any length using Google's Speech to Text API

## Contents

- [Description](#description)
- [Installation](#installation)
- [Reference](#Reference)
- [Google authentication](#google-authentication)
- [Converting audio to a WAV file](#converting-audio-to-a-wav-file)
- [Enabling WSL](#enabling-wsl)
- [To do](#to-do)

> [&#8673;](#transcribe-stt)

## Description

A TypeScript Node app which interacts with [Google's Speech to Text API](https://cloud.google.com/speech-to-text/) using its [`Node client`](https://www.npmjs.com/package/@google-cloud/speech) to transcribe WAV files of any length.

> [&#8673;](#transcribe-stt)

## Installation

```
npm i transcribe-stt
```

> [&#8673;](#transcribe-stt)

## Reference

See the [reference documentation](./docs/md/index.md).

> [&#8673;](#transcribe-stt)

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

> [&#8673;](#transcribe-stt)

## Converting audio to a WAV file

> [&#8673;](#transcribe-stt)

## Enabling WSL

> [&#8673;](#transcribe-stt)

## To do

- Create a type for [language codes](https://cloud.google.com/speech-to-text/docs/languages)
- Simultaneously stream each file during `DistributedSTTStream.start()` to increase speed
- Create issue templates
- Create PR templates
- Create development guide

> [&#8673;](#transcribe-stt)

<!-- Arrows options: &uarr; &#8613; &uArr; &#8673; &#8679; -->
