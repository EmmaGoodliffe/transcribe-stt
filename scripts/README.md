# `scripts`

## `scripts/bash`

Bash scripts used in production

## `scripts/ts`

TypeScript scripts used in production

### `scripts/ts/LanguageCode`

TypeScript script to download supported language codes from documentation to create a union type for them

### `scripts/ts/lint`

TypeScript script to perform extra linting on `src` files

#### `scripts/ts/lint/dependencies`

TypeScript script to check that all `dependencies` and `devDependencies` in `package.json` are used by `src` or `scripts/ts` files

#### `scripts/ts/lint/exports`

TypeScript script to check that everything exported by `src` files are used by `src` files

### `scripts/ts/svg`

TypeScript script to lint SVG files
