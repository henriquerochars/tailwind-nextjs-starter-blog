import { PostPage, postMetadata } from '../../../(default)/blog/[...slug]/content'
import { isLocale } from '@/lib/i18n/config'
import { notFound } from 'next/navigation'
export { generateStaticParams } from '../../../(default)/blog/[...slug]/content'
type Props = { params: Promise<{ locale: string; slug: string[] }> }
export async function generateMetadata(props: Props) {
  const resolved = await props.params
  const { locale } = resolved
  if (!isLocale(locale)) notFound()
  return postMetadata(props, locale)
}
export default async function Page(props: Props) {
  const { locale } = await props.params
  if (!isLocale(locale)) notFound()
  return <PostPage locale={locale} params={props.params} />
}
