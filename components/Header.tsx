'use client'

import { useLocale, useMessages } from '@/lib/i18n/LocaleProvider'

import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import Logo from '@/data/logo.svg'
import Image from 'next/image'
import Link from './Link'
import MobileNav from './MobileNav'
import BlogLanguageSwitcher from './BlogLanguageSwitcher'
import ThemeSwitch from './ThemeSwitch'

const Header = () => {
  const t = useMessages()
  const locale = useLocale()
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 py-10">
      <div>
        <Link href="/" aria-label={siteMetadata.headerTitle}>
          <div className="flex items-center justify-between">
            <div className="mr-3">
              <Logo />
            </div>
            {typeof siteMetadata.headerTitle === 'string' ? (
              <div className="hidden h-6 text-2xl font-semibold sm:block">
                {siteMetadata.headerTitle}
              </div>
            ) : (
              siteMetadata.headerTitle
            )}
          </div>
        </Link>
      </div>
      <div className="flex items-center space-x-4 leading-5 sm:space-x-6">
        {headerNavLinks
          .filter((link) => link.href !== '/')
          .map((link) => (
            <Link
              key={link.href === '/' ? t.home : link.href === '/blog' ? t.blog : t.portfolio}
              href={
                link.href.startsWith('https://henriquerochadev.vercel.app')
                  ? `https://henriquerochadev.vercel.app${locale === 'en' ? '/' : locale === 'es' ? '/es' : '/pt-br'}`
                  : link.href
              }
              className="hidden items-center gap-2 font-medium text-gray-900 sm:flex dark:text-gray-100"
            >
              {link.icon && (
                <Image
                  src={link.icon}
                  alt=""
                  aria-hidden={true}
                  width={20}
                  height={20}
                  className="shrink-0"
                />
              )}
              {link.href === '/' ? t.home : link.href === '/blog' ? t.blog : t.portfolio}
            </Link>
          ))}
        {/* <SearchButton /> */}
        <BlogLanguageSwitcher />
        <ThemeSwitch />
        <MobileNav />
      </div>
    </header>
  )
}

export default Header
