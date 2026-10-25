import { sortPosts, allCoreContent } from 'pliny/utils/contentlayer.js'
import Main from '../Main'
import { localizedPosts } from '@/lib/i18n/content'
import { type SiteLocale } from '@/lib/i18n/config'
import { localeMetadata } from '@/lib/i18n/metadata'

export const metadata = localeMetadata('pt-BR', '/')
export function HomePage({ locale = 'pt-BR' }: { locale?: SiteLocale }) {
  const sortedPosts = sortPosts(localizedPosts(locale))
  const posts = allCoreContent(sortedPosts)
  return <Main posts={posts} />
}

export default function Page() {
  return <HomePage />
}
