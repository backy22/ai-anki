import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { globalIgnores } from 'eslint/config';
import { qwikEslint9Plugin } from 'eslint-plugin-qwik';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
  globalIgnores([
    'node_modules/**',
    'dist/**',
    'dist-dev/**',
    'server/**',
    'tmp/**',
    '.rollup.cache/**',
    '.cache/**',
    'build/**',
    'lib/**',
    'etc/**',
    'external/**',
    'target/**',
    'output/**',
    '.vscode/**',
    '.yarn/**',
    '**/*.log',
    '**/.DS_Store',
    '**/tsconfig.tsbuildinfo',
    'vite.config.ts',
    'rollup.config.js',
    '**/*.spec.ts',
    '**/*.spec.tsx',
  ]),
  js.configs.recommended,
  ...tseslint.configs.recommended,
  qwikEslint9Plugin.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    languageOptions: {
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      'prefer-spread': 'off',
      'no-case-declarations': 'off',
      'no-console': 'off',
      '@typescript-eslint/no-unused-vars': ['error'],
    },
  }
);
