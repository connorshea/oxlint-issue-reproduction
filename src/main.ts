// Reproduction for https://github.com/oxc-project/oxc/issues/19431
// These imports use .js extensions, which is standard practice in TypeScript
// with Node16/NodeNext module resolution. The actual source files are .ts files.
// oxlint incorrectly flags these as "Missing file extension in import declaration"
// even though .js extensions are already present.

import { testShards } from './tools/test/shards.js';
import {
  getCoverageIgnorePatterns,
  normalizePattern,
} from './tools/test/utils.js';

console.log(testShards(4, 1));
console.log(getCoverageIgnorePatterns());
console.log(normalizePattern("foo\\bar"));
