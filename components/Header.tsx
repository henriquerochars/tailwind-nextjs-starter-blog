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
    <header className="sticky top-0 z-50 w-full border-b border-transparent bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto flex h-(--header-height) max-w-3xl items-center justify-between gap-4 px-4 sm:px-6 xl:max-w-5xl xl:px-0">
        <div>
          <Link href="/" aria-label={siteMetadata.headerTitle}>
            <div className="flex items-center justify-between">
              <div className="mr-3 shrink-0">
                <Logo />
              </div>
              {typeof siteMetadata.headerTitle === 'string' ? (
                <div className="hidden h-6 text-xl font-semibold whitespace-nowrap sm:block md:text-2xl">
                  {siteMetadata.headerTitle}
                </div>
              ) : (
                siteMetadata.headerTitle
              )}
            </div>
          </Link>
        </div>
        <div className="flex min-w-0 items-center gap-3 leading-5 md:gap-6">
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
                className="hidden items-center gap-2 font-medium whitespace-nowrap text-gray-900 md:flex dark:text-gray-100"
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
          {/* Lets the fixed-width switcher shrink on the narrowest phones instead of overflowing. */}
          <div className="flex min-w-0">
            <BlogLanguageSwitcher />
          </div>
          <ThemeSwitch />
          <MobileNav />
        </div>
      </div>
    </header>
  )
}

export default Header
