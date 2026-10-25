'use client'

import { useLocale, useMessages } from '@/lib/i18n/LocaleProvider'

import { ReactNode } from 'react'
import { formatDate } from '@/lib/formatDate'
import { CoreContent } from 'pliny/utils/contentlayer.js'
import type { Blog } from 'contentlayer/generated'
import Link from '@/components/Link'
import PageTitle from '@/components/PageTitle'
import SectionContainer from '@/components/SectionContainer'
import ScrollTop from '@/components/ScrollTop'

interface LayoutProps {
  content: CoreContent<Blog>
  contentLanguage?: string
  children: ReactNode
  next?: { path: string; title: string }
  prev?: { path: string; title: string }
}

export default function PostLayout({
  content,
  next,
  prev,
  children,
  contentLanguage,
}: LayoutProps) {
  const t = useMessages()
  const locale = useLocale()
  const { date, title } = content

  return (
    <SectionContainer>
      <ScrollTop />
      <article>
        <div>
          <header>
            <div className="space-y-1 border-b border-gray-200 pb-10 text-center dark:border-gray-700">
              <dl>
                <div>
                  <dt className="sr-only">{t.published}</dt>
                  <dd className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
                    <time dateTime={date}>{formatDate(date, locale)}</time>
                  </dd>
                </div>
              </dl>
              <div>
                <PageTitle>
                  <span lang={contentLanguage}>{title}</span>
                </PageTitle>
              </div>
            </div>
          </header>
          <div className="grid-rows-[auto_1fr] divide-y divide-gray-200 pb-8 xl:divide-y-0 dark:divide-gray-700">
            <div className="divide-y divide-gray-200 xl:col-span-3 xl:row-span-2 xl:pb-0 dark:divide-gray-700">
              <div className="prose max-w-none pt-10 pb-8 dark:prose-invert">
                <div lang={contentLanguage}>{children}</div>
              </div>
            </div>
            <footer>
              <div className="flex flex-col text-sm font-medium sm:flex-row sm:justify-between sm:text-base">
                {prev && prev.path && (
                  <div className="pt-4 xl:pt-8">
                    <Link
                      href={`/${prev.path}`}
                      className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                      aria-label={`${t.previousPost}: ${prev.title}`}
                    >
                      &larr; {prev.title}
                    </Link>
                  </div>
                )}
                {next && next.path && (
                  <div className="pt-4 xl:pt-8">
                    <Link
                      href={`/${next.path}`}
                      className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                      aria-label={`${t.nextPost}: ${next.title}`}
                    >
                      {next.title} &rarr;
                    </Link>
                  </div>
                )}
              </div>
            </footer>
          </div>
        </div>
      </article>
    </SectionContainer>
  )
}
