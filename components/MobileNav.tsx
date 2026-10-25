'use client'

import { useLocale, useMessages } from '@/lib/i18n/LocaleProvider'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from './Link'
import headerNavLinks from '@/data/headerNavLinks'

const MobileNav = () => {
  const t = useMessages()
  const locale = useLocale()
  const [navShow, setNavShow] = useState(false)

  const onToggleNav = () => {
    setNavShow((status) => !status)
  }

  useEffect(() => {
    if (!navShow) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setNavShow(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [navShow])

  return (
    <>
      <button
        aria-label={t.menu}
        aria-expanded={navShow}
        aria-controls="mobile-navigation"
        onClick={onToggleNav}
        className="sm:hidden"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-8 w-8 text-gray-900 dark:text-gray-100"
        >
          <path
            fillRule="evenodd"
            d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <div
        id="mobile-navigation"
        aria-hidden={!navShow}
        inert={!navShow}
        className={`fixed top-0 left-0 z-10 h-full w-full transform bg-white opacity-95 duration-300 ease-in-out dark:bg-gray-950 dark:opacity-[0.98] ${
          navShow ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-end">
          <button className="mt-11 mr-8 h-8 w-8" aria-label={t.closeMenu} onClick={onToggleNav}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="text-gray-900 dark:text-gray-100"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <nav className="fixed mt-8 h-full">
          {headerNavLinks.map((link) => (
            <div
              key={link.href === '/' ? t.home : link.href === '/blog' ? t.blog : t.portfolio}
              className="px-12 py-4"
            >
              <Link
                href={
                  link.href.startsWith('https://henriquerochadev.vercel.app')
                    ? `https://henriquerochadev.vercel.app${locale === 'en' ? '/' : locale === 'es' ? '/es' : '/pt-br'}`
                    : link.href
                }
                className="flex items-center gap-3 text-2xl font-bold tracking-widest text-gray-900 dark:text-gray-100"
                onClick={onToggleNav}
              >
                {link.icon && (
                  <Image
                    src={link.icon}
                    alt=""
                    aria-hidden={true}
                    width={24}
                    height={24}
                    className="shrink-0"
                  />
                )}
                {link.href === '/' ? t.home : link.href === '/blog' ? t.blog : t.portfolio}
              </Link>
            </div>
          ))}
        </nav>
      </div>
    </>
  )
}

export default MobileNav
