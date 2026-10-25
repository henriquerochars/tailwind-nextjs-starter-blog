'use client'

import { useEffect, useRef, useState } from 'react'
import { useLocale } from '@/lib/i18n/LocaleProvider'
import Link from './Link'

const labels = {
  'pt-BR': {
    search: 'Buscar postagens',
    close: 'Fechar busca',
    empty: 'Nenhuma postagem encontrada.',
    error: 'Não foi possível carregar a busca.',
  },
  en: {
    search: 'Search posts',
    close: 'Close search',
    empty: 'No posts found.',
    error: 'Unable to load search.',
  },
  es: {
    search: 'Buscar publicaciones',
    close: 'Cerrar búsqueda',
    empty: 'No se encontraron publicaciones.',
    error: 'No se pudo cargar la búsqueda.',
  },
}
type Result = { path: string; title: string; summary?: string; locale?: string }
export default function LocalSearch({ children }: { children: React.ReactNode }) {
  const locale = useLocale()
  const t = labels[locale]
  const dialog = useRef<HTMLDialogElement>(null)
  const [query, setQuery] = useState('')
  const [posts, setPosts] = useState<Result[]>([])
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    const abort = new AbortController()
    fetch(`/search.${locale}.json`, { signal: abort.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Search unavailable')
        return response.json()
      })
      .then((value: unknown) => {
        if (
          !Array.isArray(value) ||
          !value.every(
            (item) =>
              item &&
              typeof item === 'object' &&
              typeof item.path === 'string' &&
              typeof item.title === 'string' &&
              (item.summary === undefined || typeof item.summary === 'string') &&
              /^(?:(?:en|es)\/)?blog\//.test(item.path)
          )
        )
          throw new Error('Invalid search index')
        setPosts(value)
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setFailed(true)
      })
    return () => abort.abort()
  }, [locale])
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && dialog.current?.open) {
        event.preventDefault()
        dialog.current.close()
        return
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        if (dialog.current?.open) dialog.current.close()
        else dialog.current?.showModal()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  const matches = posts.filter((post) =>
    `${post.title} ${post.summary || ''}`
      .toLocaleLowerCase(locale)
      .includes(query.toLocaleLowerCase(locale))
  )
  return (
    <>
      {children}
      <dialog
        ref={dialog}
        aria-label={t.search}
        className="fixed inset-0 m-auto max-h-[80vh] w-[min(90vw,40rem)] rounded-lg border border-gray-300 bg-white p-6 text-gray-900 backdrop:bg-black/50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
      >
        <div className="flex items-center gap-4">
          <label className="grow">
            <span className="sr-only">{t.search}</span>
            <input
              type="search"
              placeholder={t.search}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full rounded border border-gray-300 bg-transparent p-3 dark:border-gray-700"
            />
          </label>
          <button onClick={() => dialog.current?.close()} aria-label={t.close}>
            ×
          </button>
        </div>
        {failed ? (
          <p role="status">{t.error}</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {matches.map((post) => (
              <li key={post.path}>
                <Link
                  href={`/${post.path}`}
                  lang={post.locale}
                  onClick={() => dialog.current?.close()}
                  className="block rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {post.title}
                </Link>
              </li>
            ))}
            {matches.length === 0 && <li>{t.empty}</li>}
          </ul>
        )}
      </dialog>
    </>
  )
}
