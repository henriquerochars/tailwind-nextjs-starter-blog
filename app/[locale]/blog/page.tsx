import { BlogPage } from '../../(default)/blog/content'
import { isLocale, messages } from '@/lib/i18n/config'
import { localeMetadata } from '@/lib/i18n/metadata'
import { notFound } from 'next/navigation'
type Props = { params: Promise<{ locale: string }> }
export async function generateMetadata(props: Props) {
  const resolved = await props.params
  const { locale } = resolved
  if (!isLocale(locale)) notFound()
  return localeMetadata(locale, `/blog`, messages[locale].blog)
}
export default async function Page(props: Props) {
  const { locale } = await props.params
  if (!isLocale(locale)) notFound()
  return <BlogPage locale={locale} />
}
