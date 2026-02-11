import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tsParser from '@typescript-eslint/parser';

const sharedPlugins = {
  'react-hooks': reactHooks,
  'react-refresh': reactRefresh
};

const sharedRules = {
  ...reactHooks.configs.recommended.rules,
  'react-refresh/only-export-components': ['warn', { allowConstantExport: true }]
};

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module'
      }
    },
    plugins: sharedPlugins,
    rules: {
      ...js.configs.recommended.rules,
      ...sharedRules,
      'no-unused-vars': 'off'
    }
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true }
      },
      globals: globals.browser
    },
    plugins: sharedPlugins,
    rules: {
      ...js.configs.recommended.rules,
      ...sharedRules,
      'no-undef': 'off',
      'no-unused-vars': 'off'
    }
  }
];
