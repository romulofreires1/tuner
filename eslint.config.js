import { Linter } from 'eslint';
import nextPlugin from '@next/eslint-plugin-next';

const linter = new Linter();

const config = [
  {
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      '@next/next/no-html-link-for-pages': 'error',
    },
  },
];

export default config;