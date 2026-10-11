import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { chmod, mkdtemp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { devNull, tmpdir } from 'node:os'
import path from 'node:path'
import { createFixture, fixtureEnvironment, put } from '../../scripts/harness/fixture.mjs'
import { runNode, runYarn } from '../../scripts/harness/process.mjs'
import { sourceState, assertUnchanged } from '../../scripts/agent/source-state.mjs'

async function hookFixture(t) {
  const root = process.cwd()
  const rootEnv = fixtureEnvironment()
  const before = await sourceState(root)
  const originalConfig = execFileSync('git', ['config', '--local', '--list'], {
    cwd: root,
    env: rootEnv,
    encoding: 'utf8',
  })
  t.after(async () => {
    assertUnchanged(before, await sourceState(root))
    assert.ok(
      originalConfig ===
        execFileSync('git', ['config', '--local', '--list'], {
          cwd: root,
          env: rootEnv,
          encoding: 'utf8',
        }),
      'original checkout Git configuration is unchanged'
    )
  })
  const directory = await createFixture(root)
  t.after(() => rm(directory, { recursive: true, force: true }))
  const tools = await mkdtemp(path.join(tmpdir(), 'blog-hook-tools-'))
  t.after(() => rm(tools, { recursive: true, force: true }))
  const emptyTemplate = path.join(tools, 'template')
  await mkdir(emptyTemplate)
  await writeFile(
    path.join(tools, 'yarn'),
    '#!/bin/sh\nprintf "%s\\n" "Unexpected external Yarn invocation" >&2\nexit 127\n'
  )
  await chmod(path.join(tools, 'yarn'), 0o755)
  // Keep Git and all hook descendants in the process group owned by runNode.
  const runner = path.join(tools, 'git-runner.mjs')
  await writeFile(
    runner,
    `import { spawnSync } from 'node:child_process'
const result = spawnSync('git', process.argv.slice(2), { stdio: 'inherit' })
if (result.error) throw result.error
process.exit(result.status ?? 1)
`
  )
  const env = {
    ...fixtureEnvironment(),
    PATH: [tools, path.dirname(process.execPath), process.env.PATH].join(path.delimiter),
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_CONFIG_GLOBAL: devNull,
    XDG_CONFIG_HOME: path.join(tools, 'config'),
  }
  const git = (...args) =>
    execFileSync('git', args, { cwd: directory, env, encoding: 'utf8', timeout: 10000 })
  const commit = (message) =>
    runNode([runner, 'commit', '--quiet', '-m', message], {
      cwd: directory,
      env,
      capture: true,
      timeout: 60000,
    })
  git('init', '--quiet', '--initial-branch=main', `--template=${emptyTemplate}`)
  git('config', '--local', 'user.name', 'Harness Author')
  git('config', '--local', 'user.email', 'harness@example.invalid')
  git('config', '--local', 'commit.gpgsign', 'false')
  assert.ok(!git('config', '--local', '--list').includes('core.hookspath='))
  git('add', '.')
  await commit('Fixture baseline before optional hook installation')
  await runYarn(['hooks:install'], { cwd: directory, env, capture: true, timeout: 30000 })
  assert.equal(git('config', '--local', '--get', 'core.hooksPath').trim(), '.husky/_')
  assert.ok((await stat(path.join(directory, '.husky/_/pre-commit'))).mode & 0o111)
  return { directory, git, commit }
}

test('pre-commit runs through Git without external Yarn', async (t) => {
  const { directory, git, commit } = await hookFixture(t)
  const file = 'scripts/__hook-installed.ts'
  const source = 'export const hookInstalled = true\n'
  await put(directory, file, source)
  git('add', file)
  await commit('Verify installed hook')
  assert.equal(git('show', `HEAD:${file}`), source)
  assert.equal(git('status', '--porcelain'), '')
})

test('pre-commit commits ESLint and Prettier corrections to staged files', async (t) => {
  const { directory, git, commit } = await hookFixture(t)
  const sourceFile = 'scripts/__hook-fixable.ts'
  const jsonFile = 'hook-fixable.json'
  await put(directory, sourceFile, 'export let hookValue=1;\n')
  await put(directory, jsonFile, '[1,2]\n')
  git('add', sourceFile, jsonFile)
  await commit('Fix staged TypeScript and JSON')
  const expectedSource = 'export const hookValue = 1\n'
  assert.equal(git('show', `HEAD:${sourceFile}`), expectedSource)
  assert.equal(await readFile(path.join(directory, sourceFile), 'utf8'), expectedSource)
  assert.equal(git('show', `HEAD:${jsonFile}`), '[1, 2]\n')
  assert.equal(await readFile(path.join(directory, jsonFile), 'utf8'), '[1, 2]\n')
  assert.equal(git('status', '--porcelain'), '')
  assert.equal(git('stash', 'list'), '')
})

test('pre-commit blocks lint errors and restores the index and working tree', async (t) => {
  const { directory, git, commit } = await hookFixture(t)
  const sourceFile = 'scripts/__hook-blocking.ts'
  const jsonFile = 'hook-blocking.json'
  const stagedSource = 'export let hookValue=1;\nconst unusedHookValue = 2\n'
  const localSource = `${stagedSource}\n// Unstaged local note\n`
  await put(directory, sourceFile, stagedSource)
  await put(directory, jsonFile, '[1,2]\n')
  git('add', sourceFile, jsonFile)
  await put(directory, sourceFile, localSource)
  const head = git('rev-parse', 'HEAD')
  const staged = git('diff', '--cached', '--binary')
  const unstaged = git('diff', '--binary')
  await assert.rejects(commit('Reject unfixable staged error'), (error) => {
    assert.match(error.output || '', /@typescript-eslint\/no-unused-vars/)
    assert.match(error.output || '', /unusedHookValue/)
    return true
  })
  assert.equal(git('rev-parse', 'HEAD'), head)
  assert.equal(git('diff', '--cached', '--binary'), staged)
  assert.equal(git('diff', '--binary'), unstaged)
  assert.equal(await readFile(path.join(directory, sourceFile), 'utf8'), localSource)
  assert.equal(await readFile(path.join(directory, jsonFile), 'utf8'), '[1,2]\n')
  assert.equal(git('stash', 'list'), '')
})

test('pre-commit preserves unstaged edits in a partially staged file', async (t) => {
  const { directory, git, commit } = await hookFixture(t)
  const file = 'scripts/__hook-partial.ts'
  // Separate both edits so applying the unstaged patch does not overlap the fix.
  const baseline = [
    'export const stagedValue = 1',
    ...Array.from({ length: 12 }, (_, index) => `export const spacer${index} = ${index}`),
    'export const localOnlyValue = 1',
    '',
  ].join('\n')
  await put(directory, file, baseline)
  git('add', file)
  await commit('Baseline for partial staging')
  const staged = baseline.replace('export const stagedValue = 1', 'export let stagedValue=2;')
  await put(directory, file, staged)
  git('add', file)
  await put(directory, file, staged.replace('localOnlyValue = 1', 'localOnlyValue = 2'))
  await commit('Commit only selected changes')
  const expected = baseline.replace('stagedValue = 1', 'stagedValue = 2')
  assert.equal(git('show', `HEAD:${file}`), expected)
  assert.equal(
    await readFile(path.join(directory, file), 'utf8'),
    expected.replace('localOnlyValue = 1', 'localOnlyValue = 2')
  )
  assert.equal(git('diff', '--cached'), '')
  assert.equal(git('status', '--porcelain').trim(), `M ${file}`)
  assert.equal(git('stash', 'list'), '')
})

test('pre-commit preserves synthetic post and author MDX bytes', async (t) => {
  const { directory, git, commit } = await hookFixture(t)
  const files = ['data/blog/__hook-content.mdx', 'data/authors/__hook-content.mdx']
  const source =
    '---\nname: "Harness Author"\ntitle: "Harness Post"\n---\n\n#   Preserve\n\nA   spaced paragraph.\n'
  for (const file of files) await put(directory, file, source)
  git('add', ...files)
  await commit('Preserve author-owned MDX formatting')
  for (const file of files) {
    assert.equal(git('show', `HEAD:${file}`), source)
    assert.equal(await readFile(path.join(directory, file), 'utf8'), source)
  }
  assert.equal(git('status', '--porcelain'), '')
})
