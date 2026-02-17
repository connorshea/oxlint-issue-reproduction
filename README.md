# oxlint import/extensions false positive reproduction

Reproduction for [oxc-project/oxc#19431](https://github.com/oxc-project/oxc/issues/19431).

## Problem

When using `import/extensions` with `"always"`, oxlint incorrectly flags imports that **already have** `.js` extensions as missing extensions. This happens when `.mts` files import `.ts` source files using `.js` extensions — a standard practice in TypeScript with `Node16`/`NodeNext` module resolution.

ESLint with `eslint-plugin-import` does **not** flag these imports.

## Setup

```
src/
  main.mts                    # imports using .js extensions
  tools/test/
    shards.ts                 # source file (imported as shards.js)
    utils.ts                  # source file (imported as utils.js)
```

`src/main.mts` contains:

```ts
import { testShards } from './tools/test/shards.js';
import {
  getCoverageIgnorePatterns,
  normalizePattern,
} from './tools/test/utils.js';
```

Both linters are configured with `import/extensions: ["error", "always"]`.

## Reproduce

```bash
pnpm install
pnpm lint:oxlint   # shows false positives (bug)
pnpm lint:eslint    # passes with no errors (correct)
```

## Results

### oxlint 1.48.0 (INCORRECT — false positive)

```
  x eslint-plugin-import(extensions): Missing file extension in import declaration.
   ,-[src/main.mts:7:1]
 7 | import { testShards } from './tools/test/shards.js';
   : ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   `----
  help: Add a file extension to this import.

  x eslint-plugin-import(extensions): Missing file extension in import declaration.
    ,-[src/main.mts:8:1]
  8 | ,-> import {
  9 | |     getCoverageIgnorePatterns,
 10 | |     normalizePattern,
 11 | `-> } from './tools/test/utils.js';
    `----
  help: Add a file extension to this import.

Found 0 warnings and 2 errors.
```

### ESLint 8.57.1 + eslint-plugin-import 2.32.0 (CORRECT — no errors)

```
$ pnpm lint:eslint
(no output, exit code 0)
```
