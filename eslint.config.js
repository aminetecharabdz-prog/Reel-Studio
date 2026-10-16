import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist', 'public', 'docs', '.qa', '.ref', 'node_modules', '.claude', 'playwright-report', 'test-results'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    // Remotion compositions must be deterministic (CLAUDE.md video rules).
    files: ['src/engine/**/*.{ts,tsx}', 'src/styles/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-properties': ['error',
        { object: 'Math', property: 'random', message: 'Use random(seed) from remotion.' },
        { object: 'Date', property: 'now', message: 'Animation must come from useCurrentFrame().' }],
    },
  },
  { files: ['scripts/**/*.mjs'], languageOptions: { globals: globals.node } },
);
