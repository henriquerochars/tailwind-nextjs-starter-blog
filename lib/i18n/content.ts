import {
  allBlogs,
  allAuthors,
  allTranslatedBlogs,
  allTranslatedAuthors,
} from 'contentlayer/generated'
import type { Blog, Authors } from 'contentlayer/generated'
import { type SiteLocale } from './config'
export function localizedPosts(locale: SiteLocale): (Blog & { contentLocale: SiteLocale })[] {
  return allBlogs.map((source) => {
    const translation = allTranslatedBlogs.find(
      (item) => item.locale === locale && item.translationKey === source.slug
    )
    return {
      ...source,
      ...(translation
        ? {
            title: translation.title,
            summary: translation.summary,
            body: translation.body,
            toc: translation.toc,
            readingTime: translation.readingTime,
          }
        : {}),
      contentLocale: translation ? locale : 'pt-BR',
    }
  })
}
export function localizedAuthor(key: string, locale: SiteLocale): Authors {
  const source = allAuthors.find((author) => author.slug === key)!
  const translation = allTranslatedAuthors.find(
    (item) => item.locale === locale && item.translationKey === key
  )
  return translation
    ? { ...source, occupation: translation.occupation || source.occupation, body: translation.body }
    : source
}
