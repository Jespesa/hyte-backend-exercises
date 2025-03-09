import globals from 'globals';
import js from '@eslint/js';

export default [
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {...globals.node},
    },
    rules: {
      'no-undef': 'off', // Disable no-undef errors
    },
  },
  js.configs.recommended,
];