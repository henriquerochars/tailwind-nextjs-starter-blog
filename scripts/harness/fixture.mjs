import { execFileSync } from 'node:child_process'
import { copyFile, lstat, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

export async function createFixture(root = process.cwd()) {
  const directory = await mkdtemp(path.join(tmpdir(), 'blog-fixture-'))
  try {
    const names = execFileSync(
      'git',
      ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
      { cwd: root, encoding: 'utf8' }
    )
      .split('\0')
      .filter(Boolean)
    for (const name of new Set(names)) {
      if (/^\.(?:git|aws|vercel|codex|agents)(?:\/|$)/.test(name)) continue
      if (/^\.env(?:\.|$)/.test(path.basename(name)) && path.basename(name) !== '.env.example')
        continue
      const source = path.join(root, name)
      const stat = await lstat(source).catch((error) => {
        if (error.code === 'ENOENT') return null
        throw error
      })
      if (!stat) continue
      if (!stat.isFile()) throw new Error(`Fixture source must be a regular file: ${name}`)
      await mkdir(path.dirname(path.join(directory, name)), { recursive: true })
      await copyFile(source, path.join(directory, name))
    }
    await symlink(path.join(root, 'node_modules'), path.join(directory, 'node_modules'), 'dir')
    await mkdir(path.join(directory, '.yarn'), { recursive: true })
    await copyFile(
      path.join(root, '.yarn/install-state.gz'),
      path.join(directory, '.yarn/install-state.gz')
    )
    return directory
  } catch (error) {
    await rm(directory, { recursive: true, force: true })
    throw error
  }
}

export async function put(directory, name, text) {
  const target = path.join(directory, name)
  await mkdir(path.dirname(target), { recursive: true })
  await writeFile(target, text)
}

// Public, synthetic UUID used only by the isolated production fixture.
export const umamiWebsiteId = '123e4567-e89b-42d3-a456-426614174000'

export const publishedSlug = '__harness/nested/published'
export const oldestSlug = '__harness/oldest'
export const draftSlug = '__harness/draft'
export const publishedTitle = 'Harness published & verified'
export const draftTitle = 'Harness secret draft'

export async function addContent(directory) {
  // A prior published tag must not leave a stale feed after it becomes draft-only.
  await put(directory, 'public/tags/harness-draft-only/feed.xml', draftTitle)
  await put(
    directory,
    'data/authors/harness-author.mdx',
    `---\nname: Harness Author\n---\n\nAn isolated author.\n`
  )
  await put(
    directory,
    `data/blog/${publishedSlug}.mdx`,
    `---
title: '${publishedTitle}'
date: '2025-03-02'
tags: ['Harness Shared', 'Harness & XML']
summary: 'Fixture summary <safe> & checked'
authors: ['harness-author']
draft: false
---

## Harness heading

<TOCInline toc={props.toc} />

Rich MDX content with **bold text** and [a local link](/about).

| Name | Value |
| --- | --- |
| Harness | Verified |

- [x] Task checked

Math: $a^2 + b^2 = c^2$.

\`\`\`js:fixture.js {1} showLineNumbers
export const verified = true
\`\`\`

![Fixture image](/static/images/avatar.png)

<div data-harness="rich">Rendered MDX component</div>
`
  )
  await put(
    directory,
    `data/blog/${draftSlug}.mdx`,
    `---\ntitle: '${draftTitle}'\ndate: '2026-01-01'\ntags: ['Harness Shared', 'Harness Draft Only']\ndraft: true\n---\n\nNever publish this.\n`
  )
  await put(
    directory,
    `data/blog/${oldestSlug}.mdx`,
    `---\ntitle: Harness oldest post\ndate: '2000-01-01'\ntags: ['Harness Boundary']\n---\n\nOldest published boundary.\n`
  )
  for (let index = 1; index <= 6; index++) {
    await put(
      directory,
      `data/blog/__harness/post-${index}.mdx`,
      `---\ntitle: Harness pagination ${index}\ndate: '2024-01-0${index}'\ntags: ['Harness Shared']\n${index === 1 ? 'layout: PostSimple\n' : index === 2 ? 'layout: PostBanner\nimages: [\"/static/images/avatar.png\"]\n' : ''}---\n\nPagination fixture ${index}.\n`
    )
  }
}

// Keep only runtime/tooling environment; no provider credentials enter fixture builds.
export function fixtureEnvironment() {
  const allowed =
    /^(PATH|HOME|TMPDIR|TMP|TEMP|SYSTEMROOT|WINDIR|COMSPEC|PATHEXT|LANG|LC_.*|TZ|TERM|CI|FORCE_COLOR|PLAYWRIGHT_BROWSERS_PATH|YARN_CACHE_FOLDER|YARN_GLOBAL_FOLDER)$/i
  const env = Object.fromEntries(
    Object.entries(process.env).map(([key, value]) => [key, allowed.test(key) ? value : undefined])
  )
  return { ...env, NODE_ENV: 'production', NEXT_TELEMETRY_DISABLED: '1' }
}

export const json = async (directory, name) =>
  JSON.parse(await readFile(path.join(directory, name), 'utf8'))
