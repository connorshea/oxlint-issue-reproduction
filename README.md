# oxlint import/extensions false positive reproduction

Reproduction for [oxc-project/oxc#19431](https://github.com/oxc-project/oxc/issues/19431).

## Problem

When using `import/extensions` with `"ignorePackages"` (or `"always"`), oxlint incorrectly flags imports that **already have** `.js` extensions as missing extensions. This happens when `.ts` (or `.mts`) files import `.ts` source files using `.js` extensions — a standard practice in TypeScript with `Node16`/`NodeNext` module resolution.

ESLint with `eslint-plugin-import` does **not** flag these imports when using the default Node resolver (see analysis below).

## Setup

```
src/
  main.ts                     # imports using .js extensions
  tools/test/
    shards.ts                 # source file (imported as shards.js)
    utils.ts                  # source file (imported as utils.js)
```

`src/main.ts` contains:

```ts
import { testShards } from './tools/test/shards.js';
import {
  getCoverageIgnorePatterns,
  normalizePattern,
} from './tools/test/utils.js';
```

Both linters are configured with `import/extensions: ["error", "ignorePackages"]`.

## Reproduce

```bash
pnpm install
npx oxlint --config .oxlintrc.json src/main.ts   # shows false positives (bug)
npx eslint src/main.ts                            # see analysis below
```

## Results

### oxlint 1.48.0 (INCORRECT — false positive)

```
  x eslint-plugin-import(extensions): Missing file extension in import declaration.
   ,-[src/main.ts:7:1]
 7 | import { testShards } from './tools/test/shards.js';
   : ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   `----
  help: Add a file extension to this import.

  x eslint-plugin-import(extensions): Missing file extension in import declaration.
    ,-[src/main.ts:8:1]
  8 | ,-> import {
  9 | |     getCoverageIgnorePatterns,
 10 | |     normalizePattern,
 11 | `-> } from './tools/test/utils.js';
    `----
  help: Add a file extension to this import.

Found 0 warnings and 2 errors.
```

### ESLint + eslint-plugin-import — depends on resolver

**With `eslint-import-resolver-typescript` (current config):** ESLint **also** reports errors,
but with a different message — it says the `.ts` extension is missing:

```
src/main.ts
  7:28  error  Missing file extension "ts" for "./tools/test/shards.js"  import/extensions
  11:8  error  Missing file extension "ts" for "./tools/test/utils.js"   import/extensions
```

**Without the TypeScript resolver (default Node resolver):** ESLint reports **no errors**.

## Analysis: why ESLint's default Node resolver produces no errors

The key logic is in [`checkFileExtension`](https://github.com/import-js/eslint-plugin-import/blob/main/src/rules/extensions.js):

```js
const resolvedPath = resolve(importPath, context);
// get extension from resolved path, if possible.
// for unresolved, use source value.
const extension = path.extname(resolvedPath || importPath).substring(1);
```

1. The default Node resolver (`eslint-import-resolver-node`) tries to find `./tools/test/shards.js`
   literally on disk. Its extension list is `['.mjs', '.js', '.json', '.node']` — **no `.ts`**.
   Since `shards.js` doesn't exist, the resolver returns `undefined`.

2. The fallback kicks in: `path.extname(undefined || './tools/test/shards.js')` gives `'js'`.

3. The rule checks: does the import path end with `.js`? **Yes** — so it enters the `else if`
   branch, which only flags if the extension is *forbidden*. With `always`/`ignorePackages` mode,
   `.js` is not forbidden. **No error.**

With the TypeScript resolver, step 1 resolves `shards.js` → `shards.ts` (the actual file),
so `extension = 'ts'`. The import doesn't end with `.ts`, so the rule flags it as missing
the `.ts` extension.

### Why oxlint differs

oxlint doesn't have a pluggable resolver system. It has its own TypeScript-aware resolution
that finds `shards.ts` for an import of `shards.js`, but then reports "Missing file extension"
without recognizing that `.js` is already present and is the correct runtime extension for
TypeScript's `Node16`/`NodeNext` module resolution.
