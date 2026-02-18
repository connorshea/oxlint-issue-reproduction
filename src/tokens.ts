// Reproduction for https://github.com/oxc-project/oxc/issues/19501
// This module exports both a default export and a named export of the same value.
// ESLint's import/no-named-as-default does NOT warn when importing this as a default
// import in consumer.ts, but oxlint incorrectly flags it.

const tokens = { color: "blue" };

export default tokens;
export { tokens };
