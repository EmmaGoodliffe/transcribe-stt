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

## Description

A TypeScript Node app which interacts with [Google's Speech to Text API](https://cloud.google.com/speech-to-text/) using its [`Node client`](https://www.npmjs.com/package/@google-cloud/speech) to transcribe WAV files of any length.

## Installation

```
npm i transcribe-stt
```

## Reference

See the [reference documentation](./docs/md/index.md).

## Google authentication

## Converting audio to a WAV file

## Enabling WSL

## To do

- Create a type for [language codes](https://cloud.google.com/speech-to-text/docs/languages)
- Simultaneously stream each file during `DistributedSTTStream.start()` to increase speed
