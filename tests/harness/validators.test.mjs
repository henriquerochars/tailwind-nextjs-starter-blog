import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, rm, symlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { checkBudget } from '../../scripts/agent/prompt-budget.mjs'
import { checkDocs } from '../../scripts/agent/docs.mjs'
import { requireSuccessfulJobs } from '../../scripts/agent/ci-summary.mjs'
import { readContained } from '../../scripts/agent/files.mjs'

async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'blog-docs-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  await mkdir(path.join(root, 'docs'))
  await writeFile(
    path.join(root, 'AGENTS.md'),
    '# Instructions\n\nSee [guide](docs/guide.md#start-here).\n'
  )
  await writeFile(path.join(root, 'CLAUDE.md'), 'Follow [AGENTS.md](AGENTS.md).\n')
  await writeFile(path.join(root, 'docs/guide.md'), '# Start here\n\n[Root](../AGENTS.md)\n')
  await writeFile(
    path.join(root, 'docs/registry.json'),
    JSON.stringify({ documents: [{ path: 'docs/guide.md', purpose: 'A guide' }] })
  )
  return root
}

test('valid instructions, registered docs and local anchors pass', async (t) => {
  const root = await fixture(t)
  assert.deepEqual(await checkBudget(root), { lines: 3, bytes: 55 })
  assert.equal(await checkDocs(root), 1)
})

test('line limit accepts CRLF and rejects the next logical line', async (t) => {
  const root = await fixture(t)
  await writeFile(path.join(root, 'AGENTS.md'), 'a\r\n'.repeat(120))
  assert.equal((await checkBudget(root)).lines, 120)
  await writeFile(path.join(root, 'AGENTS.md'), 'a\n'.repeat(121))
  await assert.rejects(checkBudget(root), /budget/)
})

test('budget counts UTF-8 bytes, including multibyte content', async (t) => {
  const root = await fixture(t)
  await writeFile(path.join(root, 'AGENTS.md'), 'é'.repeat(5500))
  assert.equal((await checkBudget(root)).bytes, 11000)
  await writeFile(path.join(root, 'AGENTS.md'), 'é'.repeat(5501))
  await assert.rejects(checkBudget(root), /budget/)
})

test('empty instructions and oversized or missing pointers fail', async (t) => {
  const root = await fixture(t)
  await writeFile(path.join(root, 'AGENTS.md'), '')
  await assert.rejects(checkBudget(root), /budget/)
  await writeFile(path.join(root, 'AGENTS.md'), 'Valid')
  await writeFile(path.join(root, 'CLAUDE.md'), 'AGENTS.md' + 'a'.repeat(1000))
  await assert.rejects(checkBudget(root), /short pointer/)
  await writeFile(path.join(root, 'CLAUDE.md'), 'No canonical link')
  await assert.rejects(checkBudget(root), /short pointer/)
})

test('unregistered files and duplicate registry entries fail', async (t) => {
  const root = await fixture(t)
  await writeFile(path.join(root, 'docs/extra.md'), '# Extra')
  await assert.rejects(checkDocs(root), /Registry does not match/)
  await rm(path.join(root, 'docs/extra.md'))
  const entry = { path: 'docs/guide.md', purpose: 'Guide' }
  await writeFile(
    path.join(root, 'docs/registry.json'),
    JSON.stringify({ documents: [entry, entry] })
  )
  await assert.rejects(checkDocs(root), /Duplicate/)
})

test('missing files and headings fail; code examples and external links are ignored', async (t) => {
  const root = await fixture(t)
  await writeFile(path.join(root, 'docs/guide.md'), '# Start here\n\n[bad](missing.md)')
  await assert.rejects(checkDocs(root), /ENOENT/)
  await writeFile(path.join(root, 'docs/guide.md'), '# Other heading')
  await assert.rejects(checkDocs(root), /Missing anchor/)
  await writeFile(
    path.join(root, 'docs/guide.md'),
    '# Start here\n\n```md\n[example](missing.md)\n```\n\n[external](https://example.invalid/path)\n`[example](also-missing.md)`'
  )
  assert.equal(await checkDocs(root), 1)
})

test('path traversal, symlink escapes and invalid UTF-8 fail', async (t) => {
  const root = await fixture(t)
  const outside = await mkdtemp(path.join(tmpdir(), 'blog-outside-'))
  t.after(() => rm(outside, { recursive: true, force: true }))
  await writeFile(path.join(outside, 'secret.md'), '# Outside')
  await symlink(path.join(outside, 'secret.md'), path.join(root, 'escape.md'))
  await assert.rejects(readContained(root, 'escape.md'), /escapes repository/)
  await assert.rejects(readContained(root, path.join(outside, 'secret.md')), /escapes repository/)
  await writeFile(path.join(root, 'invalid.md'), Buffer.from([0xff]))
  await assert.rejects(readContained(root, 'invalid.md'), /encoded data/)
})

test('summary only accepts explicit success for both required jobs', () => {
  const success = { quality: { result: 'success' }, portable: { result: 'success' } }
  assert.doesNotThrow(() => requireSuccessfulJobs(success))
  for (const name of ['quality', 'portable']) {
    for (const status of ['failure', 'cancelled', 'skipped', undefined]) {
      const results = structuredClone(success)
      results[name] = status ? { result: status } : undefined
      assert.throws(() => requireSuccessfulJobs(results), /Required job/)
    }
  }
  assert.throws(() => requireSuccessfulJobs({}), /missing/)
})
