import type { Metadata } from 'next'
import siteMetadata from '@/data/siteMetadata'
import { locales, localePath, messages, openGraphLocales, type SiteLocale } from './config'
export function localeMetadata(
  locale: SiteLocale,
  path: string,
  title?: string,
  description?: string
): Metadata {
  const url = localePath(locale, path)
  const summary = description || messages[locale].description
  return {
    title: path === '/' ? { absolute: siteMetadata.title } : title || siteMetadata.title,
    description: summary,
    alternates: {
      canonical: url,
      languages: Object.fromEntries([
        ...locales.map((language) => [language, localePath(language, path)]),
        ['x-default', path],
      ]),
      types: {
        'application/rss+xml': `${siteMetadata.siteUrl}${localePath(locale, path.startsWith('/tags/') ? `${path}/feed.xml` : '/feed.xml')}`,
      },
    },
    openGraph: {
      title: title || siteMetadata.title,
      description: summary,
      url,
      siteName: siteMetadata.title,
      locale: openGraphLocales[locale],
      alternateLocale: locales
        .filter((item) => item !== locale)
        .map((item) => openGraphLocales[item]),
      images: [siteMetadata.socialBanner],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: title || siteMetadata.title,
      description: summary,
      images: [siteMetadata.socialBanner],
    },
  }
}
