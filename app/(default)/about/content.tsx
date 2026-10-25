import { localizedAuthor } from '@/lib/i18n/content'
import { type SiteLocale, messages } from '@/lib/i18n/config'
import { MDXLayoutRenderer } from 'pliny/mdx-components.js'
import AuthorLayout from '@/layouts/AuthorLayout'
import { coreContent } from 'pliny/utils/contentlayer.js'
import { localeMetadata } from '@/lib/i18n/metadata'

export const metadata = localeMetadata('pt-BR', '/about', messages['pt-BR'].about)

export function AboutPage({ locale = 'pt-BR' }: { locale?: SiteLocale }) {
  const author = localizedAuthor('default', locale)
  const mainContent = coreContent(author)

  return (
    <>
      <AuthorLayout content={mainContent}>
        <MDXLayoutRenderer code={author.body.code} />
      </AuthorLayout>
    </>
  )
}

export default function Page() {
  return <AboutPage />
}
