import ListLayout from '@/layouts/ListLayoutWithTags'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer.js'
import { localizedPosts } from '@/lib/i18n/content'
import { type SiteLocale, messages } from '@/lib/i18n/config'
import { localeMetadata } from '@/lib/i18n/metadata'

const POSTS_PER_PAGE = 5

export const metadata = localeMetadata('pt-BR', '/blog', messages['pt-BR'].blog)

export function BlogPage({ locale = 'pt-BR' }: { locale?: SiteLocale }) {
  const posts = allCoreContent(sortPosts(localizedPosts(locale)))
  const pageNumber = 1
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

export default function Page() {
  return <BlogPage />
}
