import { slug } from 'github-slugger'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer.js'
import ListLayout from '@/layouts/ListLayoutWithTags'
import { localizedPosts } from '@/lib/i18n/content'
import { type SiteLocale, messages } from '@/lib/i18n/config'
import tagData from 'app/tag-data.json'
import { localeMetadata } from '@/lib/i18n/metadata'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

export async function generateMetadata(props: {
  params: Promise<{ tag: string }>
}): Promise<Metadata> {
  const params = await props.params
  const tag = decodeURI(params.tag)
  if (!Object.hasOwn(tagData, tag)) notFound()
  return localeMetadata('pt-BR', `/tags/${tag}`, tag, `${messages['pt-BR'].tagged} ${tag}`)
}

export const generateStaticParams = async () => {
  const tagCounts = tagData as Record<string, number>
  const tagKeys = Object.keys(tagCounts)
  const paths = tagKeys.map((tag) => ({
    tag: tag,
  }))
  return paths
}

export async function TagPage({
  params,
  locale = 'pt-BR',
}: {
  params: Promise<{ tag: string }>
  locale?: SiteLocale
}) {
  const resolved = await params
  const tag = decodeURI(resolved.tag)
  if (!Object.hasOwn(tagData, tag)) notFound()
  // Capitalize first letter and convert space to dash
  const title = tag[0].toUpperCase() + tag.split(' ').join('-').slice(1)
  const filteredPosts = allCoreContent(
    sortPosts(
      localizedPosts(locale).filter(
        (post) => post.tags && post.tags.map((t) => slug(t)).includes(tag)
      )
    )
  )
  return <ListLayout posts={filteredPosts} title={title} />
}

export default function Page(props: { params: Promise<{ tag: string }> }) {
  return <TagPage {...props} />
}
