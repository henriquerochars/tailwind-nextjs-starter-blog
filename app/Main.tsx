'use client'

import { useLocale, useMessages } from '@/lib/i18n/LocaleProvider'

import Link from '@/components/Link'
import Tag from '@/components/Tag'
import { formatDate } from '@/lib/formatDate'

const MAX_DISPLAY = 5

export default function Home({ posts }) {
  const t = useMessages()
  const locale = useLocale()
  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
            {t.latest}
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">{t.description}</p>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {!posts.length && t.noPosts}
          {posts.slice(0, MAX_DISPLAY).map((post) => {
            const { slug, date, title, summary, tags } = post
            return (
              <li key={slug} className="py-12">
                <article>
                  <div className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
                    <dl>
                      <dt className="sr-only">{t.published}</dt>
                      <dd className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
                        <time dateTime={date}>{formatDate(date, locale)}</time>
                      </dd>
                    </dl>
                    <div className="space-y-5 xl:col-span-3">
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-2xl leading-8 font-bold tracking-tight">
                            <Link
                              href={`/blog/${slug}`}
                              className="text-gray-900 dark:text-gray-100"
                            >
                              <span
                                lang={
                                  'contentLocale' in post ? String(post.contentLocale) : 'pt-BR'
                                }
                              >
                                {title}
                              </span>
                            </Link>
                          </h2>
                          <div className="flex flex-wrap">
                            {tags.map((tag) => (
                              <Tag key={tag} text={tag} />
                            ))}
                          </div>
                        </div>
                        <div className="prose max-w-none text-gray-500 dark:text-gray-400">
                          <span
                            lang={'contentLocale' in post ? String(post.contentLocale) : 'pt-BR'}
                          >
                            {summary}
                          </span>
                        </div>
                      </div>
                      <div className="text-base leading-6 font-medium">
                        <Link
                          href={`/blog/${slug}`}
                          className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                          aria-label={`${t.read} "${title}"`}
                        >
                          {t.readMore} &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      </div>
      {posts.length > MAX_DISPLAY && (
        <div className="flex justify-end text-base leading-6 font-medium">
          <Link
            href="/blog"
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            aria-label={t.allPosts}
          >
            {t.allPosts} &rarr;
          </Link>
        </div>
      )}
    </>
  )
}
