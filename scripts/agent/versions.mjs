import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

const require = createRequire(import.meta.url)
const packages = [
  'next',
  'react',
  'tailwindcss',
  'typescript',
  'eslint',
  '@playwright/test',
  'contentlayer2',
  'pliny',
]
const versions = Object.fromEntries(
  packages.map((name) => [name, require(`${name}/package.json`).version])
)
console.log(
  JSON.stringify(
    {
      node: process.version,
      yarn: execFileSync(process.execPath, ['.yarn/releases/yarn-4.18.1.cjs', '--version'], {
        encoding: 'utf8',
      }).trim(),
      ...versions,
      lockSha256: createHash('sha256').update(readFileSync('yarn.lock')).digest('hex'),
      candidate: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
      dirty: Boolean(execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim()),
      integration: process.env.TESTED_INTEGRATION_SHA || null,
      head: process.env.PR_HEAD_SHA || null,
      base: process.env.PR_BASE_SHA || null,
    },
    null,
    2
  )
)
