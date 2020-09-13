# Changelog

## Contents

- [API report](#api-report)
- [Breaking changes](#breaking-changes)
- [Deprecated versions](#deprecated-versions)
- [Versions](#versions)

## API report

You can see an automatically generated summary of everything exported by the module in the API report in `etc` at any point in the [version history](https://github.com/EmmaGoodliffe/transcribe-stt/releases). A JSON version of this file is also generated and copied to `docs/input` to be used to generate the reference documentation. These are both created by [API Extractor](https://api-extractor.com/).

## Breaking changes

There are breaking changes in these versions

- [`1.0.4`](#104)

## Deprecated versions

| Version         | Reason         | Version to update to |
| --------------- | -------------- | -------------------- |
| [`1.0.0`](#100) | Unstable alpha | `>=1.0.1`            |

## Versions

### 1.0.4

- **Breaking**: Minor changes to export shape. The types `DistributeListener` and `ProgressListener` are now exported as `Listeners["DistributeListener"]` and `Listeners["ProgressListener"]` respectively
- Minor change to all constructor paramaters. All options are now optional, whereas before `encoding` and `sampleRateHertz` were required
- Major documentation changes
- Major internal linting changes
- Minor internal changes
- Minor testing changes

### 1.0.3

- Minor internal changes

### 1.0.2

- Minor documentation changes
- Minor internal changes

### 1.0.1

- Beta

### 1.0.0

**Deprecated**

- Alpha
