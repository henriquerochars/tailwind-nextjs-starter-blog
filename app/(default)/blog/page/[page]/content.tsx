import { localeMetadata } from '@/lib/i18n/metadata'
import ListLayout from '@/layouts/ListLayoutWithTags'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer.js'
import { allBlogs } from 'contentlayer/generated'
import { localizedPosts } from '@/lib/i18n/content'
import { type SiteLocale, messages } from '@/lib/i18n/config'
import { notFound } from 'next/navigation'

const POSTS_PER_PAGE = 5

export const generateStaticParams = async () => {
  const totalPages = Math.ceil(allCoreContent(allBlogs).length / POSTS_PER_PAGE)
  const paths = Array.from({ length: totalPages }, (_, i) => ({ page: (i + 1).toString() }))

  return paths
}

export async function PaginatedPage({
  params,
  locale = 'pt-BR',
}: {
  params: Promise<{ page: string }>
  locale?: SiteLocale
}) {
  const resolved = await params
  const posts = allCoreContent(sortPosts(localizedPosts(locale)))
  const pageNumber = Number(resolved.page)
  if (
    !/^\d+$/.test(resolved.page) ||
    !Number.isSafeInteger(pageNumber) ||
    pageNumber < 1 ||
    pageNumber > Math.ceil(posts.length / POSTS_PER_PAGE)
  )
    notFound()
  const initialDisplayPosts = posts.slice(
    POSTS_PER_PAGE * (pageNumber - 1),
    POSTS_PER_PAGE * pageNumber
  )
  const pagination = {
    currentPage: pageNumber,
    totalPages: Math.ceil(posts.length / POSTS_PER_PAGE),
  }

  return (
    <ListLayout
      posts={posts}
      initialDisplayPosts={initialDisplayPosts}
      pagination={pagination}
      title={messages[locale].allPosts}
    />
  )
}

export default function Page(props: { params: Promise<{ page: string }> }) {
  return <PaginatedPage {...props} />
}

export async function generateMetadata({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params
  return localeMetadata('pt-BR', `/blog/page/${page}`, messages['pt-BR'].blog)
}
