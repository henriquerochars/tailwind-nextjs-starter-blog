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
const { allBlogs, allAuthors } = await import('../.contentlayer/generated/index.mjs')
const generated = new Set([...allBlogs, ...allAuthors].map((doc) => doc._raw.sourceFilePath))
for (const file of [...(await documents('blog')), ...(await documents('authors'))]) {
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
