# ADR-0001: Replace legacy Contentlayer with Contentlayer2

## Status

Accepted.

## Context

The blog currently uses:

- `contentlayer 0.3.4`
- `next-contentlayer 0.3.4`

The original Contentlayer project is no longer maintained. The current stack also fails to build on Node.js 24 because the legacy generated content pipeline emits ESM syntax that Node 24 no longer accepts.

The replacement must preserve:

- local Markdown/MDX content;
- typed content access;
- blog and author schemas;
- computed fields such as slug, path, reading time, and table of contents;
- Remark/Rehype plugins;
- tag count generation;
- local search index generation;
- compatibility with Pliny helpers;
- static generation in the Next.js App Router;
- Vercel builds.

## Options considered

### 1. Contentlayer2

Pros:

- Maintained fork of Contentlayer with largely compatible APIs.
- The current upstream `timlrx/tailwind-nextjs-starter-blog` uses `contentlayer2` and `next-contentlayer2`.
- Lowest migration risk for this codebase.
- Preserves the generated content model and most existing imports.
- Preserves the current Pliny integration with limited changes.
- Updated Unified/Remark/Rehype compatibility compared with the legacy package.

Cons:

- Smaller maintainer surface than first-party Next.js tooling.
- Release cadence is slower than some alternatives.
- Still keeps a dedicated content-build layer in the architecture.

### 2. Velite

Pros:

- Actively maintained.
- Type-safe Zod-based content collections.
- Framework-agnostic and not coupled to the Next.js bundler.
- Strong long-term architecture for local content.

Cons:

- Requires a larger rewrite of generated content imports and Pliny integration.
- Would expand the current modernization scope substantially.
- Existing helpers around `pliny/utils/contentlayer` would need replacement or adapters.

### 3. Native @next/mdx + custom content loader

Pros:

- Uses first-party Next.js MDX integration.
- Minimal framework dependency surface.

Cons:

- Does not replace Contentlayer's typed collection/query layer by itself.
- Requires custom schema validation, file discovery, frontmatter parsing, sorting, tag indexing, and generated types.
- Increases custom maintenance code.

## Decision

Use **Contentlayer2** as the immediate replacement for legacy Contentlayer.

This is the lowest-risk path because the upstream starter has already adopted it and the blog's current architecture is tightly integrated with Pliny's Contentlayer utilities.

The migration should:

1. replace `contentlayer` with `contentlayer2`;
2. replace `next-contentlayer` with `next-contentlayer2`;
3. update Contentlayer imports to `contentlayer2/source-files`;
4. update `withContentlayer` to come from `next-contentlayer2`;
5. upgrade only the Remark/Rehype packages required for Contentlayer2 compatibility;
6. preserve existing MDX files and frontmatter;
7. preserve tag/search/reading-time/TOC behavior;
8. re-run the Node.js 24 validation after the migration.

## Consequences

- Issue #5 can be implemented as an incremental migration rather than a rewrite.
- Issue #3 remains blocked until the legacy Contentlayer packages are removed.
- Issue #7 can then modernize Pliny and the broader MDX/Remark/Rehype ecosystem without also carrying the content-engine migration.
- A future migration to Velite remains possible if Contentlayer2 maintenance becomes insufficient, but it is not required for the current modernization milestone.
