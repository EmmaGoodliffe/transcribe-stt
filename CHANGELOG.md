# Changelog

You can see a summary of everything exported by the module in `etc/transcribe-stt.api.md` at any point in its version history. See the [version history](https://github.com/EmmaGoodliffe/transcribe-stt/releases) on GitHub

## Breaking changes

There are breaking changes in these versions

- [`1.0.4`](#1.0.4)

## Deprecated versions

| Version           | Reason         | Version to update to |
| ----------------- | -------------- | -------------------- |
| [`1.0.0`](#1.0.0) | Unstable alpha | `>=1.0.1`            |

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
