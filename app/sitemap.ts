import { MetadataRoute } from 'next'
import { allBlogs } from 'contentlayer/generated'
import { locales, localePath } from '@/lib/i18n/config'
import siteMetadata from '@/data/siteMetadata'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = siteMetadata.siteUrl
  const blogRoutes = allBlogs
    .filter((post) => post.draft !== true)
    .flatMap((post) =>
      locales.map((locale) => ({
        url: `${siteUrl}${localePath(locale, `/${post.path}`)}`,
        lastModified: post.lastmod || post.date,
        alternates: {
          languages: Object.fromEntries(
            locales.map((language) => [
              language,
              `${siteUrl}${localePath(language, `/${post.path}`)}`,
            ])
          ),
        },
      }))
    )

  const routes = ['', 'blog', 'projects', 'tags', 'about'].flatMap((route) =>
    locales.map((locale) => ({
      url: `${siteUrl}${localePath(locale, `/${route}`)}`,
      lastModified: new Date().toISOString().split('T')[0],
      alternates: {
        languages: Object.fromEntries(
          locales.map((language) => [language, `${siteUrl}${localePath(language, `/${route}`)}`])
        ),
      },
    }))
  )

  return [...routes, ...blogRoutes]
}
