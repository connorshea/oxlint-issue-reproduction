# oxlint import/no-named-as-default false positive reproduction

Reproduction for [oxc-project/oxc#19501](https://github.com/oxc-project/oxc/issues/19501).

## Problem

When a module exports both a `default` export and a named export of the same value, oxlint's `import/no-named-as-default` rule incorrectly warns when that value is imported using the default import syntax. ESLint's `eslint-plugin-import` does **not** flag this pattern.

## Setup

```
src/
  tokens.ts    # exports `export default tokens` AND `export { tokens }`
  consumer.ts  # imports `tokens` as the default import
```

`src/tokens.ts`:

```ts
const tokens = { color: "blue" };

export default tokens;
export { tokens };
```

`src/consumer.ts`:

```ts
import tokens from './tokens.js'; // oxlint incorrectly warns here
```

Both linters are configured with `import/no-named-as-default: "error"`.

## Reproduce

```bash
pnpm install
pnpm lint:oxlint   # shows false positive (bug)
pnpm lint:eslint   # passes with no errors (correct)
```

## Results

### oxlint 1.48.0 (INCORRECT — false positive)

```
  x eslint-plugin-import(no-named-as-default): Using exported name 'tokens' as identifier for default import.
   ,-[src/consumer.ts:9:1]
 9 | import tokens from './tokens.js';
   : ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   `----
  help: ...

Found 0 warnings and 1 error.
```

### ESLint 9.x + eslint-plugin-import 2.32.0 (CORRECT — no errors)

```
$ pnpm lint:eslint
(no output, exit code 0)
```

## Root Cause

The previous fix in [#19100](https://github.com/oxc-project/oxc/pull/19100) only addressed re-export cases (e.g., `export { userEvent as default } from './source'`), but missed the case where a module directly declares both `export default tokens` and `export { tokens }` in the same file.
