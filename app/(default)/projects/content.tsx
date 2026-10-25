import projectsData from '@/data/projectsData'
import { type SiteLocale, messages } from '@/lib/i18n/config'
import Card from '@/components/Card'
import { localeMetadata } from '@/lib/i18n/metadata'

export const metadata = localeMetadata('pt-BR', '/projects', messages['pt-BR'].projects)

export function ProjectsPage({ locale = 'pt-BR' }: { locale?: SiteLocale }) {
  const t = messages[locale]
  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
            {t.projects}
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">{t.projectsIntro}</p>
        </div>
        <div className="container py-12">
          <div className="-m-4 flex flex-wrap">
            {projectsData.map((d) => (
              <Card
                key={d.title}
                title={d.title === 'A Search Engine' ? t.searchEngine : t.timeMachine}
                description={
                  d.title === 'A Search Engine'
                    ? t.searchEngineDescription
                    : t.timeMachineDescription
                }
                imgSrc={d.imgSrc}
                href={d.href}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default function Page() {
  return <ProjectsPage />
}
