import { TagsPage } from '../../(default)/tags/content'
import { isLocale, messages } from '@/lib/i18n/config'
import { localeMetadata } from '@/lib/i18n/metadata'
import { notFound } from 'next/navigation'
type Props = { params: Promise<{ locale: string }> }
export async function generateMetadata(props: Props) {
  const resolved = await props.params
  const { locale } = resolved
  if (!isLocale(locale)) notFound()
  return localeMetadata(locale, `/tags`, messages[locale].tags)
}
export default async function Page(props: Props) {
  const { locale } = await props.params
  if (!isLocale(locale)) notFound()
  return <TagsPage locale={locale} />
}
