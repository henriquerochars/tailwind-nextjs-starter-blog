import { notFound } from 'next/navigation'
import { SiteLayout, metadata as base } from '../SiteLayout'
import { isLocale } from '@/lib/i18n/config'
import { localeMetadata } from '@/lib/i18n/metadata'

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'es' }]
}
export const dynamicParams = false
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale) || locale === 'pt-BR') notFound()
  return { ...base, ...localeMetadata(locale, '/'), title: base.title }
}
export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale) || locale === 'pt-BR') notFound()
  return <SiteLayout locale={locale}>{children}</SiteLayout>
}
