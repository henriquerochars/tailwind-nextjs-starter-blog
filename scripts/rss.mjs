import { writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from 'node:fs'
import path from 'path'
import { slug } from 'github-slugger'
import { escape } from 'pliny/utils/htmlEscaper.js'
import siteMetadata from '../data/siteMetadata.js'
import tagData from '../app/tag-data.json' with { type: 'json' }
import { allBlogs, allTranslatedBlogs } from '../.contentlayer/generated/index.mjs'
import { sortPosts } from 'pliny/utils/contentlayer.js'

const outputFolder = process.env.EXPORT ? 'out' : 'public'

const generateRssItem = (config, post) => `
  <item xml:lang="${post.contentLocale || 'pt-BR'}">
    <guid>${config.siteUrl}/${post.rssPath || `blog/${post.slug}`}</guid>
    <title>${escape(post.title)}</title>
    <link>${config.siteUrl}/${post.rssPath || `blog/${post.slug}`}</link>
    ${post.summary ? `<description>${escape(post.summary)}</description>` : ''}
    <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    ${config.email ? `<author>${escape(`${config.email} (${config.author})`)}</author>` : ''}
    ${post.tags && post.tags.map((t) => `<category>${escape(t)}</category>`).join('')}
  </item>
`

const generateRss = (config, posts, page = 'feed.xml') => `
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
      <title>${escape(config.title)}</title>
      <link>${config.siteUrl}/${config.blogPath || 'blog'}</link>
      <description>${escape(config.description)}</description>
      <language>${config.language}</language>
      ${config.email ? `<managingEditor>${escape(`${config.email} (${config.author})`)}</managingEditor>` : ''}
      ${config.email ? `<webMaster>${escape(`${config.email} (${config.author})`)}</webMaster>` : ''}
      <lastBuildDate>${new Date(posts[0].date).toUTCString()}</lastBuildDate>
      <atom:link href="${config.siteUrl}/${page}" rel="self" type="application/rss+xml"/>
      ${posts.map((post) => generateRssItem(config, post)).join('')}
    </channel>
  </rss>
`

function generateRSS(config, allBlogs, page = 'feed.xml') {
  // Remove only owned feed files, so removed tags cannot keep an old public feed.
  rmSync(path.join(outputFolder, page), { force: true })
  const tagsFolder = path.join(outputFolder, page.includes('/') ? page.split('/')[0] : '', 'tags')
  if (existsSync(tagsFolder)) {
    for (const entry of readdirSync(tagsFolder, { withFileTypes: true })) {
      if (entry.isDirectory())
        rmSync(path.join(tagsFolder, entry.name, 'feed.xml'), { force: true })
    }
  }
  const publishPosts = allBlogs.filter((post) => post.draft !== true)
  // RSS for blog post
  if (publishPosts.length > 0) {
    const rss = generateRss(config, sortPosts(publishPosts), page)
    mkdirSync(path.dirname(path.join(outputFolder, page)), { recursive: true })
    writeFileSync(`./${outputFolder}/${page}`, rss)
  }

  if (publishPosts.length > 0) {
    for (const tag of Object.keys(tagData)) {
      const filteredPosts = sortPosts(
        publishPosts.filter((post) => post.tags.map((t) => slug(t)).includes(tag))
      )
      if (!filteredPosts.length) continue
      const rss = generateRss(
        config,
        filteredPosts,
        `${page.includes('/') ? `${page.split('/')[0]}/` : ''}tags/${tag}/feed.xml`
      )
      const rssPath = path.join(
        outputFolder,
        page.includes('/') ? page.split('/')[0] : '',
        'tags',
        tag
      )
      mkdirSync(rssPath, { recursive: true })
      writeFileSync(path.join(rssPath, 'feed.xml'), rss)
    }
  }
}

const rss = () => {
  generateRSS(siteMetadata, allBlogs)
  for (const locale of ['en', 'es']) {
    const posts = allBlogs.map((post) => {
      const translation = allTranslatedBlogs.find(
        (item) => item.locale === locale && item.translationKey === post.slug
      )
      return {
        ...post,
        title: translation?.title || post.title,
        summary: translation?.summary || post.summary,
        rssPath: `${locale}/blog/${post.slug}`,
        contentLocale: translation ? locale : 'pt-BR',
      }
    })
    generateRSS(
      {
        ...siteMetadata,
        language: locale,
        blogPath: `${locale}/blog`,
        description:
          locale === 'en'
            ? 'A blog created to share knowledge and experiences.'
            : 'Un blog creado para compartir conocimientos y experiencias.',
      },
      posts,
      `${locale}/feed.xml`
    )
  }
  console.log('RSS feed generated...')
}
export default rss
