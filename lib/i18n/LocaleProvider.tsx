'use client'
import { createContext, useContext } from 'react'
import { type SiteLocale, messages } from './config'
const LocaleContext = createContext<SiteLocale>('pt-BR')
export function LocaleProvider({
  locale,
  children,
}: {
  locale: SiteLocale
  children: React.ReactNode
}) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
}
export const useLocale = () => useContext(LocaleContext)
export function useMessages() {
  return messages[useLocale()]
}
