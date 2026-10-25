# Site languages

The public default stays Brazilian Portuguese at the existing URLs. English uses `/en` and Spanish `/es`; route segments and article slugs remain stable. There is no browser-language redirect or cookie: the URL determines server HTML and survives reloads. The shared header selector preserves the current route, query and fragment. Portfolio navigation uses its English root, `/pt-br` or `/es`.

## Architecture

Native App Router route groups provide separate root layouts with the correct HTML language while sharing page implementations. Typed local dictionaries handle UI text; `Intl` formats dates in UTC. This follows the [Next.js internationalization guide](https://nextjs.org/docs/app/guides/internationalization). The small site does not need another runtime translation dependency. [next-intl](https://github.com/amannn/next-intl) (MIT) is a good future option for ICU messages; [next-i18next](https://github.com/i18next/next-i18next) (MIT) provides an alternative based on i18next. Neither is installed. No runtime LLM, translation widget, API key or external translation provider is used.

`components/LanguageSwitcher.tsx` and its CSS module are shared byte-for-byte with the portfolio. `BlogLanguageSwitcher` adapts that UI to blog URLs. `LocaleProvider` supplies translated client labels; server pages and metadata receive the locale explicitly.

## Content ownership

Original `data/blog/` and `data/authors/` MDX remains untouched. Reviewed translations live separately in `data/translations/<locale>/blog/` and `authors/`, with `locale` and `translationKey` identifying the source slug. Contentlayer2 compiles separate translated collections. Translation validation rejects duplicate keys, unknown source documents and inconsistent locale paths.

The source document controls publication status, dates, tags, authors and route identity. A translated draft cannot become public independently. Existing posts have full English and Spanish translations. When a future post lacks a translation, its selected-locale URL displays the Portuguese source with a localized notice and `lang="pt-BR"` on the source headline and MDX body. UI and dates still use the selected locale. Tags retain their original identifiers in every language. English source author prose has localized Portuguese and Spanish overlays.

## Public artifacts

`/search.json` stays compatible with the original Portuguese index. `/search.pt-BR.json`, `/search.en.json` and `/search.es.json` contain locale-scoped titles, summaries and stable paths, plus `locale` describing the effective text language (Portuguese when falling back). Local search consumes that same index and never contacts a provider.

Main and per-tag RSS feeds exist at their original Portuguese paths and under `/en` and `/es`. Source-only `allBlogs` remains the authority for counts and publication filtering. Canonical URLs, language alternates, Open Graph locale, JSON-LD, HTML language and sitemap agree with each selected URL. Static site and article routes appear in each locale's sitemap entries.

The browser suite verifies language changes with query/fragment preservation, full post translations, server language/metadata, dates, navigation, fallback articles and localized search. Artifact checks cover every locale's feed and index without leaking drafts. Original source bytes are checked against Git before delivery.
