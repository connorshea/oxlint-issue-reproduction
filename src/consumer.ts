// Reproduction for https://github.com/oxc-project/oxc/issues/19501
// This file imports `tokens` as the default import from a module that exports
// both `export default tokens` and `export { tokens }`.
//
// ESLint's import/no-named-as-default does NOT warn here because the module
// explicitly has a default export. Oxlint incorrectly warns on this import.

import tokens from './tokens.js';

console.log(tokens);
