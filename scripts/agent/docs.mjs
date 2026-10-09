import { readdir } from 'node:fs/promises'
import path from 'node:path'
import GithubSlugger from 'github-slugger'
import { readContained, isMain } from './files.mjs'
import { checkBudget } from './prompt-budget.mjs'

async function markdownFiles(root, directory = 'docs') {
  const entries = await readdir(path.join(root, directory), { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const name = path.posix.join(directory, entry.name)
      if (entry.isDirectory()) return markdownFiles(root, name)
      return name.endsWith('.md') ? [name] : []
    })
  )
  return files.flat().sort()
}

const prose = (text) => text.replace(/^\s*(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\s*\1\s*$/gm, '')

function anchors(text) {
  const slugger = new GithubSlugger()
  return new Set(
    [...prose(text).matchAll(/^#{1,6}\s+(.+?)\s*#*$/gm)].map((match) =>
      slugger.slug(match[1].replace(/[`*_]/g, ''))
    )
  )
}

export async function checkDocs(root = process.cwd()) {
  await checkBudget(root)
  const registry = JSON.parse(await readContained(root, 'docs/registry.json'))
  if (!Array.isArray(registry.documents)) throw new Error('Registry must contain documents')
  const registered = registry.documents.map((entry) => {
    if (!entry.path?.startsWith('docs/') || !entry.purpose?.trim())
      throw new Error('Invalid registry entry')
    return entry.path
  })
  if (new Set(registered).size !== registered.length) throw new Error('Duplicate registry document')
  const actual = await markdownFiles(root)
  if (JSON.stringify([...registered].sort()) !== JSON.stringify(actual)) {
    throw new Error('Registry does not match docs/**/*.md')
  }
  for (const file of ['AGENTS.md', 'CLAUDE.md', ...actual]) {
    const text = prose(await readContained(root, file)).replace(/`[^`\n]*`/g, '')
    for (const match of text.matchAll(/!?\[[^\]\n]*\]\(<?([^\s)>]+)>?(?:\s+"[^"]*")?\)/g)) {
      const href = match[1]
      if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(href)) continue
      const [linkPath, fragment] = href.split('#')
      const decoded = decodeURIComponent(linkPath.split('?')[0])
      const target = decoded
        ? path.posix.normalize(path.posix.join(path.posix.dirname(file), decoded))
        : file
      const targetText = await readContained(root, target)
      if (
        fragment &&
        target.endsWith('.md') &&
        !anchors(targetText).has(decodeURIComponent(fragment))
      ) {
        throw new Error(`Missing anchor ${href} in ${file}`)
      }
    }
  }
  return actual.length
}

if (isMain(import.meta.url))
  console.log(`Documentation passed: ${await checkDocs()} registered documents`)
