'use client'

import { useLocale } from '@/lib/i18n/LocaleProvider'
import { localePath } from '@/lib/i18n/config'
import Link from 'next/link'
import type { LinkProps } from 'next/link'
import { AnchorHTMLAttributes } from 'react'

const CustomLink = ({ href, ...rest }: LinkProps & AnchorHTMLAttributes<HTMLAnchorElement>) => {
  const locale = useLocale()
  const localizedHref =
    typeof href === 'string' &&
    /^\/(?:$|(?:blog|tags|about|projects)(?:[/?#]|$)|feed\.xml(?:[?#]|$))/.test(href)
      ? localePath(locale, href)
      : href
  const isInternalLink = href && href.startsWith('/')
  const isAnchorLink = href && href.startsWith('#')

  if (isInternalLink) {
    return <Link href={localizedHref} {...rest} />
  }

  if (isAnchorLink) {
    return <a href={href} {...rest} />
  }

  return <a target="_blank" rel="noopener noreferrer" href={href} {...rest} />
}

export default CustomLink
