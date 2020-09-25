# Contributing

Thanks for contributing!

## Contents

- [Issues](#issues)
- [Contributing code](#contributing-code)
  - [NPM scripts](#npm-scripts)

## Issues

Issues about bug reports, feature requests and other questions are all welcome

## Contributing code

Thanks for contributing code!

1. Fork the GitHub repo
1. Install the [NPM](https://www.npmjs.com/) dependencies
   ```
   npm i
   ```
1. Use the beginning of this [guide](https://github.com/EmmaGoodliffe/transcribe-stt/blob/master/README.md#google-authentication) to generate an authentication key from GCP. Save it as `key.json`
1. Check that your environment is set up correctly
   ```
   npm test
   ```
1. Write some code using frequent commits. (See the [file tour](#file-tour) for an explanation of how the project works)
1. Optionally write some tests for your new code
1. Run a full build
   ```
   npm run build:all
   ```
1. Create a pull request

### NPM scripts

These are the useful NPM scripts

| Script      | Description                                                        |
| ----------- | ------------------------------------------------------------------ |
| `build:all` | Full build (download, build, generate documentation, lint)         |
| `build`     | Build TypeScript                                                   |
| `docs`      | Generate documentation                                             |
| `lint:fix`  | Fix linting problems                                               |
| `lint`      | Lint                                                               |
| `test`      | Test                                                               |
| `ts:types`  | Download types from [GCP](https://cloud.google.com/) documentation |
