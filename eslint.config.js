import { defineConfig } from 'eslint/config';
import importPlugin from 'eslint-plugin-import';
import tsParser from '@typescript-eslint/parser';

export default defineConfig([
  {
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
    },
    plugins: { import: importPlugin },
    settings: {
      'import/resolver': {
        typescript: true,
      },
    },
    rules: {
      'import/extensions': [
        'error',
        'ignorePackages'
      ]
    }
  }
]);
