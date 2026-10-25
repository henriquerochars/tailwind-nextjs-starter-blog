import { PaginatedPage } from '../../../../(default)/blog/page/[page]/content'
import { isLocale } from '@/lib/i18n/config'
import { localeMetadata } from '@/lib/i18n/metadata'
import { notFound } from 'next/navigation'
export { generateStaticParams } from '../../../../(default)/blog/page/[page]/content'
type Props = { params: Promise<{ locale: string; page: string }> }
export async function generateMetadata(props: Props) {
  const resolved = await props.params
  const { locale } = resolved
  if (!isLocale(locale)) notFound()
  return localeMetadata(locale, `/blog/page/${resolved.page}`, undefined)
}
export default async function Page(props: Props) {
  const { locale } = await props.params
  if (!isLocale(locale)) notFound()
  return <PaginatedPage locale={locale} params={props.params} />
}
