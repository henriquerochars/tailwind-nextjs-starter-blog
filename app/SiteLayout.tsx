import 'css/tailwind.css'
import 'pliny/search/algolia.css'

import localFont from 'next/font/local'
import { Analytics, AnalyticsConfig } from 'pliny/analytics/index.js'
import LocalSearch from '@/components/LocalSearch'
import Header from '@/components/Header'
import SectionContainer from '@/components/SectionContainer'
import Footer from '@/components/Footer'
import siteMetadata from '@/data/siteMetadata'
import { ThemeProviders } from './theme-providers'
import { Metadata } from 'next'
import { LocaleProvider } from '@/lib/i18n/LocaleProvider'
import { localePath } from '@/lib/i18n/config'
import { type SiteLocale } from '@/lib/i18n/config'

const space_grotesk = localFont({
  src: './fonts/SpaceGrotesk.ttf',
  display: 'swap',
  variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  title: {
    default: siteMetadata.title,
    template: `%s | ${siteMetadata.title}`,
  },
  description: siteMetadata.description,
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: './',
    siteName: siteMetadata.title,
    images: [siteMetadata.socialBanner],
    locale: siteMetadata.locale.replace('-', '_'),
    type: 'website',
  },
  alternates: {
    canonical: './',
    types: {
      'application/rss+xml': `${siteMetadata.siteUrl}/feed.xml`,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    title: siteMetadata.title,
    card: 'summary_large_image',
    images: [siteMetadata.socialBanner],
  },
}

export function SiteLayout({
  children,
  locale = 'pt-BR',
}: {
  children: React.ReactNode
  locale?: SiteLocale
}) {
  return (
    <html
      lang={locale}
      className={`${space_grotesk.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/static/favicons/apple-touch-icon.png?v=h-2"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/static/favicons/favicon-32x32.png?v=h-2"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/static/favicons/favicon-16x16.png?v=h-2"
      />
      <link rel="manifest" href="/static/favicons/site.webmanifest" />
      <link rel="mask-icon" href="/static/favicons/safari-pinned-tab.svg?v=h-2" color="#06b6d4" />
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="theme-color" media="(prefers-color-scheme: light)" content="#fff" />
      <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000" />
      <link rel="alternate" type="application/rss+xml" href={localePath(locale, '/feed.xml')} />
      <body className="bg-white text-black antialiased dark:bg-gray-950 dark:text-white">
        <LocaleProvider locale={locale}>
          <ThemeProviders>
            <Analytics analyticsConfig={siteMetadata.analytics as AnalyticsConfig} />
            <SectionContainer>
              <div className="flex h-screen flex-col justify-between font-sans">
                <LocalSearch key={locale}>
                  <Header />
                  <main className="mb-auto">{children}</main>
                </LocalSearch>
                <Footer />
              </div>
            </SectionContainer>
          </ThemeProviders>
        </LocaleProvider>
      </body>
    </html>
  )
}

export default SiteLayout
