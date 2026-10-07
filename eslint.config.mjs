import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ['**/*.config.js', 'next.config.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  globalIgnores([
    '.next/**',
    '.contentlayer/**',
    'out/**',
    'build/**',
    'public/search.json',
    'app/tag-data.json',
    'next-env.d.ts',
  ]),
])
