import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { rm } from 'node:fs/promises'
import path from 'node:path'
import { createFixture, put, addContent, fixtureEnvironment } from './fixture.mjs'
import { runNode, runYarn, stopNode, terminate } from './process.mjs'
import { checkArtifacts } from './blog-artifacts.mjs'
import { sourceState, assertUnchanged } from '../agent/source-state.mjs'

const root = process.cwd()
const before = await sourceState(root)
let directory
let server
let interrupted = false
let serverLog = ''
const interrupt = () => {
  interrupted = true
  if (server) terminate(server)
}
process.once('SIGINT', interrupt)
process.once('SIGTERM', interrupt)
const env = fixtureEnvironment()
try {
  directory = await createFixture(root)
  const invalidPath = 'data/blog/__harness-invalid.mdx'
  const negativeCases = [
    ['missing title', '---\ndate: 2025-01-01\n---\n\nMissing title.', /__harness-invalid\.mdx/],
    [
      'malformed MDX',
      '---\ntitle: Broken MDX\ndate: 2025-01-01\n---\n\n<Unclosed',
      /__harness-invalid\.mdx/,
    ],
    [
      'unknown author',
      '---\ntitle: Unknown author\ndate: 2025-01-01\nauthors: [missing-author]\n---\n\nUnknown author.',
      /Unknown author missing-author/,
    ],
  ]
  for (const [name, source, expected] of negativeCases) {
    await rm(path.join(directory, '.contentlayer'), { recursive: true, force: true })
    await put(directory, invalidPath, source)
    await assert.rejects(
      runNode(['scripts/content.mjs'], { cwd: directory, env, capture: true }),
      (error) => {
        assert.match(error.output || '', expected, `negative fixture: ${name}`)
        return true
      }
    )
    await rm(path.join(directory, invalidPath))
    if (interrupted) throw new Error('Blog test interrupted')
    console.log(`Negative content fixture passed: ${name}`)
  }
  await rm(path.join(directory, '.contentlayer'), { recursive: true, force: true })
  await addContent(directory)
  await runYarn(['build'], { cwd: directory, env, timeout: 300000 })
  await checkArtifacts(directory)
  if (interrupted) throw new Error('Blog test interrupted')
  // Port zero lets the OS choose an available port without a reservation race.
  server = spawn(
    process.execPath,
    ['node_modules/next/dist/bin/next', 'start', '--port', '0', '--hostname', '127.0.0.1'],
    {
      cwd: directory,
      env: { ...env, PWD: directory, INIT_CWD: directory },
      detached: process.platform !== 'win32',
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  )
  let serverError
  server.once('error', (error) => {
    serverError = error
  })
  const append = (chunk) => {
    serverLog = (serverLog + chunk.toString()).slice(-65536)
  }
  server.stdout.on('data', append)
  server.stderr.on('data', append)
  let origin
  const deadline = Date.now() + 30000
  while (Date.now() < deadline) {
    if (interrupted) throw new Error('Blog test interrupted')
    if (serverError) throw serverError
    if (server.exitCode !== null || server.signalCode !== null)
      throw new Error('Fixture server exited early')
    origin = serverLog.match(/http:\/\/127\.0\.0\.1:(\d+)/)?.[0]
    if (origin) {
      try {
        if ((await fetch(origin, { signal: AbortSignal.timeout(1000) })).ok) break
      } catch {}
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  if (!origin || !(await fetch(origin, { signal: AbortSignal.timeout(1000) })).ok)
    throw new Error('Fixture server readiness deadline exceeded')
  await runYarn(['playwright', 'test'], {
    cwd: root,
    env: { ...env, BLOG_TEST_URL: origin },
    timeout: 180000,
  })
} catch (error) {
  if (serverLog) console.error(serverLog)
  throw error
} finally {
  process.removeListener('SIGINT', interrupt)
  process.removeListener('SIGTERM', interrupt)
  try {
    if (server) await stopNode(server)
  } finally {
    if (directory) await rm(directory, { recursive: true, force: true })
    assertUnchanged(before, await sourceState(root))
  }
}
console.log('Blog content and browser tests passed; fixture removed; source unchanged')
