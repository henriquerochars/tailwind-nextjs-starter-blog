import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'
import globals from 'globals'

const config = [
  ...nextVitals,
  ...nextTypescript,
  prettier,
  {
    ignores: [
      '.next/**',
      '.contentlayer/**',
      '.yarn/**',
      'public/**',
      'app/tag-data.json',
      'test-results/**',
      'playwright-report/**',
    ],
  },
  {
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
    rules: {
      'react/no-unescaped-entities': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['*.config.js', 'data/siteMetadata.js'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
]

export default config
