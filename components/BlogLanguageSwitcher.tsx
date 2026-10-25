'use client'
import { usePathname, useRouter } from 'next/navigation'
import LanguageSwitcher from './LanguageSwitcher'
import { useLocale, useMessages } from '@/lib/i18n/LocaleProvider'
import { localePath, stripLocale } from '@/lib/i18n/config'
export default function BlogLanguageSwitcher() {
  const locale = useLocale()
  const t = useMessages()
  const pathname = usePathname()
  const router = useRouter()
  return (
    <LanguageSwitcher
      locale={locale}
      label={t.language}
      onLocaleChange={(next) =>
        router.push(
          `${localePath(next, stripLocale(pathname))}${window.location.search}${window.location.hash}`
        )
      }
    />
  )
}
