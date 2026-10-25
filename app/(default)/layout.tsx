import SiteLayout, { metadata as base } from '../SiteLayout'
import { localeMetadata } from '@/lib/i18n/metadata'
export const metadata = { ...base, ...localeMetadata('pt-BR', '/'), title: base.title }
export default function Layout({ children }: { children: React.ReactNode }) {
  return <SiteLayout>{children}</SiteLayout>
}
