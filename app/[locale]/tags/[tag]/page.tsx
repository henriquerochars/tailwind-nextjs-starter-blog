import { TagPage } from '../../../(default)/tags/[tag]/content'
import { isLocale } from '@/lib/i18n/config'
import { localeMetadata } from '@/lib/i18n/metadata'
import { notFound } from 'next/navigation'
export { generateStaticParams } from '../../../(default)/tags/[tag]/content'
type Props = { params: Promise<{ locale: string; tag: string }> }
export async function generateMetadata(props: Props) {
  const resolved = await props.params
  const { locale } = resolved
  if (!isLocale(locale)) notFound()
  return localeMetadata(locale, `/tags/${resolved.tag}`, undefined)
}
export default async function Page(props: Props) {
  const { locale } = await props.params
  if (!isLocale(locale)) notFound()
  return <TagPage locale={locale} params={props.params} />
}
