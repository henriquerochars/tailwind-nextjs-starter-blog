import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { runNode } from '../../scripts/harness/process.mjs'

test('timeout also terminates owned descendants', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'blog-descendant-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const marker = path.join(root, 'leaked')
  const descendant =
    "setTimeout(()=>require('node:fs').writeFileSync(process.argv[1],'leaked'),2500)"
  await assert.rejects(
    runNode(
      [
        '-e',
        `require('node:child_process').spawn(process.execPath,['-e',process.argv[1],process.argv[2]],{stdio:'ignore'});setInterval(()=>{},100)`,
        descendant,
        marker,
      ],
      { timeout: 1000 }
    ),
    /deadline exceeded/
  )
  await new Promise((resolve) => setTimeout(resolve, 1800))
  await assert.rejects(readFile(marker), { code: 'ENOENT' })
})

test('commands keep literal arguments and return a useful failure', async () => {
  await runNode([
    '-e',
    'if(process.argv[1] !== "literal; $(no-shell)") process.exit(1)',
    'literal; $(no-shell)',
  ])
  await assert.rejects(runNode(['-e', 'process.exit(7)']), /failed: 7/)
})

test('deadline rejects even if a process handles SIGTERM by exiting successfully', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'blog-process-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const pidFile = path.join(root, 'pid')
  const termFile = path.join(root, 'terminated')
  await assert.rejects(
    runNode(
      [
        '-e',
        `const fs=require('node:fs');fs.writeFileSync(process.argv[1],String(process.pid));process.on('SIGTERM',()=>{fs.writeFileSync(process.argv[2],'yes');process.exit(0)});setInterval(()=>{},100)`,
        pidFile,
        termFile,
      ],
      { timeout: 1500 }
    ),
    /deadline exceeded/
  )
  assert.equal(await readFile(termFile, 'utf8'), 'yes')
  const pid = Number(await readFile(pidFile, 'utf8'))
  assert.throws(() => process.kill(pid, 0), { code: 'ESRCH' })
})

test('spawn errors restore parent signal listeners', async () => {
  const before = ['SIGINT', 'SIGTERM'].map((signal) => process.listenerCount(signal))
  await assert.rejects(
    runNode(['-e', ''], { cwd: path.join(tmpdir(), 'missing-blog-directory-5486') }),
    /ENOENT/
  )
  assert.deepEqual(
    ['SIGINT', 'SIGTERM'].map((signal) => process.listenerCount(signal)),
    before
  )
})
