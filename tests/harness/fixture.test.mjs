import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises'
import path from 'node:path'
import { tmpdir } from 'node:os'
import {
  createFixture,
  fixtureEnvironment,
  umamiWebsiteId,
} from '../../scripts/harness/fixture.mjs'

test('fixture copies current source while excluding local environment and cloud configuration', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'blog-copy-source-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  execFileSync('git', ['init', '--quiet'], { cwd: root })
  await mkdir(path.join(root, 'node_modules'))
  await mkdir(path.join(root, '.yarn'))
  await mkdir(path.join(root, '.aws'))
  await writeFile(path.join(root, '.gitignore'), 'node_modules\n.yarn\n')
  await writeFile(path.join(root, 'source.md'), 'current working content')
  await writeFile(path.join(root, '.env.local'), 'BUTTONDOWN_API_KEY=fixture-secret')
  await writeFile(path.join(root, '.env.example'), 'BUTTONDOWN_API_KEY=')
  await writeFile(path.join(root, '.aws/credentials'), 'fixture-secret')
  await writeFile(path.join(root, '.yarn/install-state.gz'), 'test install state')
  const copy = await createFixture(root)
  t.after(() => rm(copy, { recursive: true, force: true }))
  assert.equal(await readFile(path.join(copy, 'source.md'), 'utf8'), 'current working content')
  assert.equal(await readFile(path.join(copy, '.env.example'), 'utf8'), 'BUTTONDOWN_API_KEY=')
  await assert.rejects(readFile(path.join(copy, '.env.local')), { code: 'ENOENT' })
  await assert.rejects(readFile(path.join(copy, '.aws/credentials')), { code: 'ENOENT' })
})

test('fixture environment omits provider credentials and retains runtime paths', (t) => {
  const previous = process.env.BUTTONDOWN_API_KEY
  const previousAnalytics = process.env.NEXT_UMAMI_ID
  process.env.NEXT_UMAMI_ID = umamiWebsiteId
  process.env.BUTTONDOWN_API_KEY = 'fixture-secret'
  t.after(() => {
    if (previous === undefined) delete process.env.BUTTONDOWN_API_KEY
    else process.env.BUTTONDOWN_API_KEY = previous
    if (previousAnalytics === undefined) delete process.env.NEXT_UMAMI_ID
    else process.env.NEXT_UMAMI_ID = previousAnalytics
  })
  const env = fixtureEnvironment()
  assert.equal(env.BUTTONDOWN_API_KEY, undefined)
  assert.equal(env.NEXT_UMAMI_ID, undefined)
  assert.equal(env.PATH, process.env.PATH)
  assert.equal(env.NODE_ENV, 'production')
})
