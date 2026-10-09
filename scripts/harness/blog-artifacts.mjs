import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { json, publishedSlug, publishedTitle, draftSlug, draftTitle } from './fixture.mjs'

export async function checkArtifacts(directory) {
  const posts = await json(directory, '.contentlayer/generated/Blog/_index.json')
  const authors = await json(directory, '.contentlayer/generated/Authors/_index.json')
  const published = posts.find((post) => post.slug === publishedSlug)
  assert.ok(published, 'nested fixture generated')
  assert.equal(published.path, `blog/${publishedSlug}`)
  assert.equal(published.filePath, `blog/${publishedSlug}.mdx`)
  assert.equal(published.title, publishedTitle)
  assert.ok(Number.isFinite(Date.parse(published.date)))
  assert.deepEqual(published.authors, ['harness-author'])
  assert.ok(
    authors.some((author) => author.slug === 'harness-author' && author.name === 'Harness Author')
  )
  assert.ok(published.readingTime.words > 20 && published.readingTime.minutes > 0)
  assert.ok(Array.isArray(published.toc))
  assert.ok(published.toc.some((heading) => heading.url === '#harness-heading'))
  for (const token of [
    'table',
    'katex',
    'code-highlight',
    'task-list',
    'Rendered MDX component',
    'Fixture image',
  ]) {
    assert.ok(published.body.code.includes(token), `compiled rich MDX contains ${token}`)
  }
  assert.equal(published.structuredData['@type'], 'BlogPosting')
  const tags = await json(directory, 'app/tag-data.json')
  const publicPosts = posts.filter((post) => post.draft !== true)
  assert.equal(tags['harness-shared'], 7)
  assert.equal(tags['harness-draft-only'], undefined)
  await assert.rejects(readFile(path.join(directory, 'public/tags/harness-draft-only/feed.xml')), {
    code: 'ENOENT',
  })
  const search = await json(directory, 'public/search.json')
  assert.equal(search.length, publicPosts.length)
  assert.ok(search.some((post) => post.slug === publishedSlug))
  assert.ok(!search.some((post) => post.slug === draftSlug))
  assert.ok(search.every((post) => !('body' in post) && !('_raw' in post)))
  const mainFeed = await readFile(path.join(directory, 'public/feed.xml'), 'utf8')
  const tagFeed = await readFile(
    path.join(directory, 'public/tags/harness-shared/feed.xml'),
    'utf8'
  )
  for (const feed of [mainFeed, tagFeed]) {
    assert.ok(feed.includes('Harness published &amp; verified'))
    assert.ok(feed.includes('Harness &amp; XML'))
    assert.ok(feed.includes('Fixture summary &lt;safe&gt; &amp; checked'))
    assert.ok(!feed.includes(draftTitle))
    assert.ok(!feed.includes(draftSlug))
    assert.ok(feed.indexOf(publishedSlug) < feed.indexOf('__harness/post-6'), 'feed newest first')
  }
  assert.equal((mainFeed.match(/<item>/g) || []).length, publicPosts.length)
  assert.equal((tagFeed.match(/<item>/g) || []).length, 7)
  assert.match(tagFeed, /atom:link href="[^"]+\/tags\/harness-shared\/feed\.xml"/)
  const prerender = await json(directory, '.next/prerender-manifest.json')
  assert.ok(prerender.routes[`/blog/${publishedSlug}`])
  assert.ok(!prerender.routes[`/blog/${draftSlug}`])
  assert.ok(!prerender.routes['/tags/harness-draft-only'])
  const sitemap = await readFile(path.join(directory, '.next/server/app/sitemap.xml.body'), 'utf8')
  assert.ok(sitemap.includes(`/blog/${publishedSlug}`))
  assert.ok(!sitemap.includes(draftSlug))
  console.log(`Blog artifacts passed: ${publicPosts.length} published posts; drafts excluded`)
}
