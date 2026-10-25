import { readdir } from 'node:fs/promises'
import { runNode } from './harness/process.mjs'

async function documents(directory) {
  const entries = await readdir(`data/${directory}`, { withFileTypes: true })
  return (
    await Promise.all(
      entries.map(async (entry) => {
        const name = `${directory}/${entry.name}`
        return entry.isDirectory() ? documents(name) : name.endsWith('.mdx') ? [name] : []
      })
    )
  ).flat()
}

await runNode(['node_modules/contentlayer2/bin/cli.cjs', 'build'])
const { allBlogs, allAuthors, allTranslatedBlogs, allTranslatedAuthors } =
  await import('../.contentlayer/generated/index.mjs')
const generated = new Set(
  [...allBlogs, ...allAuthors, ...allTranslatedBlogs, ...allTranslatedAuthors].map(
    (doc) => doc._raw.sourceFilePath
  )
)
for (const file of [
  ...(await documents('blog')),
  ...(await documents('authors')),
  ...(await documents('translations')),
]) {
  if (!generated.has(file)) throw new Error(`Contentlayer rejected document: ${file}`)
}
for (const collection of [allBlogs, allAuthors]) {
  const slugs = new Set()
  for (const doc of collection) {
    if (slugs.has(doc.slug)) throw new Error(`Duplicate content slug: ${doc.slug}`)
    slugs.add(doc.slug)
  }
}
const authors = new Set(allAuthors.map((author) => author.slug))
for (const post of allBlogs) {
  for (const author of post.authors || ['default']) {
    if (!authors.has(author)) throw new Error(`Unknown author ${author} in ${post.filePath}`)
  }
}
console.log(`Content integrity passed: ${allBlogs.length} posts, ${allAuthors.length} authors`)

for (const [collection, sources] of [
  [allTranslatedBlogs, allBlogs],
  [allTranslatedAuthors, allAuthors],
]) {
  const keys = new Set()
  for (const translation of collection) {
    const key = `${translation.locale}:${translation.translationKey}`
    if (keys.has(key)) throw new Error(`Duplicate translation: ${key}`)
    keys.add(key)
    if (!sources.some((source) => source.slug === translation.translationKey))
      throw new Error(`Unknown translation source: ${key}`)
    if (!translation.filePath.startsWith(`translations/${translation.locale}/`))
      throw new Error(`Translation locale/path mismatch: ${key}`)
  }
}
