# Repository map

| Path                                            | Responsibility                                                          |
| ----------------------------------------------- | ----------------------------------------------------------------------- |
| `app/`                                          | App Router pages, metadata, sitemap, robots                             |
| `components/`, `layouts/`                       | Shared UI and MDX layouts                                               |
| `lib/`                                          | Shared publication date formatting in UTC                               |
| `data/blog/`, `data/authors/`                   | Author-owned MDX sources; preserve their bytes during tooling changes   |
| `data/siteMetadata.js`                          | Personal identity, links and provider configuration                     |
| `css/`                                          | Tailwind 4 theme and Prism highlighting, retaining the original palette |
| `app/fonts/`                                    | Local Space Grotesk variable font and OFL license                       |
| `contentlayer.config.ts`, `scripts/content.mjs` | Content schema, compilation and integrity checks                        |
| `scripts/rss.mjs`                               | Main and per-tag production feeds                                       |
| `scripts/agent/`                                | Documentation, instruction budget, CI summary and source checks         |
| `scripts/harness/`, `tests/`                    | Process ownership, isolated blog tests and harness regression tests     |
| `.github/workflows/quality.yml`                 | Linux gate, macOS portability and required summary                      |

Generated output: `.contentlayer/`, `.next/`, `app/tag-data.json`, `public/search.json`, `public/feed.xml`, `public/tags/**/feed.xml` and `*.tsbuildinfo`. Generate content before consuming its types or tag counts. These paths are ignored; no check may modify tracked or unignored source files.

Renders flow from MDX through Contentlayer2 into Next.js pages and generated search, tags, feeds and sitemap. Production drafts must not enter those public surfaces. Dynamic post metadata and page rendering both enforce this boundary.

Canonical URLs and optional Umami analytics are configured centrally; comments and newsletter are disabled. See [public URLs and integrations](integrations.md). Cloud administration remains separate; automated tests never contact providers.
