import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { sourceState, assertUnchanged } from '../../scripts/agent/source-state.mjs'

test('source guard ignores generated output but detects edits, additions and deletions', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'blog-source-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  execFileSync('git', ['init', '--quiet'], { cwd: root })
  await writeFile(path.join(root, '.gitignore'), 'generated.json\n')
  await writeFile(path.join(root, 'source.md'), 'original')
  execFileSync('git', ['add', '.'], { cwd: root })
  const before = await sourceState(root)
  await writeFile(path.join(root, 'generated.json'), 'generated')
  assert.doesNotThrow(() => assertUnchanged(before, before))
  assertUnchanged(before, await sourceState(root))
  await writeFile(path.join(root, 'source.md'), 'changed')
  let after = await sourceState(root)
  assert.throws(() => assertUnchanged(before, after), /source.md/)
  assert.notDeepEqual(before, await sourceState(root))
  await writeFile(path.join(root, 'source.md'), 'original')
  await writeFile(path.join(root, 'new.md'), 'new')
  after = await sourceState(root)
  assert.throws(() => assertUnchanged(before, after), /new.md/)
  await rm(path.join(root, 'new.md'))
  await rm(path.join(root, 'source.md'))
  after = await sourceState(root)
  assert.throws(() => assertUnchanged(before, after), /source.md/)
  assert.equal((await sourceState(root))['source.md'], 'missing')
})
