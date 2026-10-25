import 'css/prism.css'
import 'katex/dist/katex.css'

import { notFound } from 'next/navigation'
import { components } from '@/components/MDXComponents'
import { MDXLayoutRenderer } from 'pliny/mdx-components.js'
import { sortPosts, coreContent, allCoreContent } from 'pliny/utils/contentlayer.js'
import { allBlogs } from 'contentlayer/generated'
import { localizedPosts, localizedAuthor } from '@/lib/i18n/content'
import { type SiteLocale, localePath, messages, openGraphLocales } from '@/lib/i18n/config'
import { localeMetadata } from '@/lib/i18n/metadata'
import type { Authors } from 'contentlayer/generated'
import PostSimple from '@/layouts/PostSimple'
import PostLayout from '@/layouts/PostLayout'
import PostBanner from '@/layouts/PostBanner'
import { Metadata } from 'next'
import siteMetadata from '@/data/siteMetadata'

const defaultLayout = 'PostLayout'
const layouts = {
  PostSimple,
  PostLayout,
  PostBanner,
}

export async function postMetadata(
  props: {
    params: Promise<{ slug: string[] }>
  },
  locale: SiteLocale = 'pt-BR'
): Promise<Metadata | undefined> {
  const resolved = await props.params
  const slug = decodeURI(resolved.slug.join('/'))
  const post = localizedPosts(locale).find((p) => p.slug === slug)
  if (!post || (process.env.NODE_ENV === 'production' && post.draft)) notFound()
  const authorList = post?.authors || ['default']
  const authorDetails = authorList.map((author) => {
    const authorResults = localizedAuthor(author, locale)
    return coreContent(authorResults as Authors)
  })

  const publishedAt = new Date(post.date).toISOString()
  const modifiedAt = new Date(post.lastmod || post.date).toISOString()
  const authors = authorDetails.map((author) => author.name)
  let imageList = [siteMetadata.socialBanner]
  if (post.images) {
    imageList = typeof post.images === 'string' ? [post.images] : post.images
  }
  const ogImages = imageList.map((img) => {
    return {
      url: img.includes('http') ? img : siteMetadata.siteUrl + img,
    }
  })

  return {
    ...localeMetadata(locale, `/blog/${slug}`, post.title, post.summary),
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      siteName: siteMetadata.title,
      locale: openGraphLocales[locale],
      type: 'article',
      publishedTime: publishedAt,
      modifiedTime: modifiedAt,
      url: localePath(locale, `/blog/${slug}`),
      images: ogImages,
      authors: authors.length > 0 ? authors : [siteMetadata.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
      images: imageList,
    },
  }
}

export const generateStaticParams = async () => {
  const paths = allCoreContent(allBlogs).map((p) => ({ slug: p.slug.split('/') }))

  return paths
}

export async function PostPage({
  params,
  locale = 'pt-BR',
}: {
  params: Promise<{ slug: string[] }>
  locale?: SiteLocale
}) {
  const resolved = await params
  const slug = decodeURI(resolved.slug.join('/'))
  // Filter out drafts in production
  const sortedCoreContents = allCoreContent(sortPosts(localizedPosts(locale)))
  const postIndex = sortedCoreContents.findIndex((p) => p.slug === slug)
  if (postIndex === -1) {
    notFound()
  }

  const prev = sortedCoreContents[postIndex + 1]
  const next = sortedCoreContents[postIndex - 1]
  const post = localizedPosts(locale).find((p) => p.slug === slug)!
  const authorList = post?.authors || ['default']
  const authorDetails = authorList.map((author) => {
    const authorResults = localizedAuthor(author, locale)
    return coreContent(authorResults as Authors)
  })
  const mainContent = coreContent(post)
  const jsonLd = { ...post.structuredData }
  jsonLd.url = `${siteMetadata.siteUrl}${localePath(locale, `/blog/${slug}`)}`
  jsonLd.headline = post.title
  jsonLd.description = post.summary
  jsonLd.inLanguage = post.contentLocale
  jsonLd['author'] = authorDetails.map((author) => {
    return {
      '@type': 'Person',
      name: author.name,
    }
  })

  const Layout = layouts[post.layout || defaultLayout]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div>
        {locale !== post.contentLocale && (
          <p role="note" className="my-4 rounded border border-gray-300 p-4 dark:border-gray-700">
            {messages[locale].fallback}
          </p>
        )}
        <Layout
          contentLanguage={post.contentLocale}
          content={mainContent}
          authorDetails={authorDetails}
          next={next}
          prev={prev}
        >
          <MDXLayoutRenderer code={post.body.code} components={components} toc={post.toc} />
        </Layout>
      </div>
    </>
  )
}

export const generateMetadata = (props: { params: Promise<{ slug: string[] }> }) =>
  postMetadata(props)
export default function Page(props: { params: Promise<{ slug: string[] }> }) {
  return <PostPage {...props} />
}
