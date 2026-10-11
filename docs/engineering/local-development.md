# Local development

Use Node **24.21.0** (`.nvmrc`) and Yarn **4.18.1** (`packageManager` and the checked-in launcher). Yarn uses the `node-modules` linker.

```sh
nvm use
node .yarn/releases/yarn-4.18.1.cjs install --immutable
yarn playwright install chromium
yarn dev
```

Corepack can provide the `yarn` command. Without it, replace `yarn <command>` with `node .yarn/releases/yarn-4.18.1.cjs <command>`. Browser installation is explicit and never runs during dependency installation. On Linux, Playwright may also need system packages: `yarn playwright install --with-deps chromium`.

`yarn content:build` compiles content and verifies that every source document was generated, slugs are unique and referenced authors exist. `dev`, `build` and `typecheck` run it first. `typecheck` also runs `next typegen` before `tsc --noEmit`. Next.js route types include both production and development directories in the committed TypeScript configuration.

`yarn build` creates a production Webpack build and RSS feeds; `yarn serve` serves it. Webpack remains explicit for Contentlayer2 and the SVG loader. The font is local, so builds do not download Google Fonts.

Lint uses ESLint's flat configuration. Formatting is a separate check and intentionally excludes author-owned MDX. Run fixes deliberately with `yarn lint:fix` and `yarn format:fix`.

## Git hooks

Hooks are optional and require explicit installation in each checkout:

```sh
node .yarn/releases/yarn-4.18.1.cjs hooks:install
```

Dependency installation and CI do not activate hooks in their checkout. The pre-commit hook calls the checked-in Yarn launcher directly, so it needs Node on `PATH` but no global Yarn or Corepack shim. Use the pinned Node runtime before committing.

The hook runs `lint-staged` with the repository configuration: ESLint and Prettier fix staged JavaScript/TypeScript, and Prettier formats staged JSON, CSS and Markdown. Corrections are included in the commit. Unfixable lint errors block the commit and restore the index and working tree. For partially staged files, unstaged edits remain outside the commit. Author-owned MDX is excluded from these tasks.

`yarn test:harness` verifies this behavior with real commits in disposable repositories, installing hooks only in those copies. See [verification](verification.md#git-hook-tests).

## Citations

Posts can reference a local BibTeX file through the `bibliography` frontmatter field. Paths are relative to `data/`, including for nested posts. For example, create `data/references.bib`:

```bibtex
@book{example2025,
  title = {Example reference},
  author = {Example, Alice},
  year = {2025},
  publisher = {Example Press}
}
```

Reference it from a post:

```mdx
---
title: 'Citation example'
date: '2025-01-01'
bibliography: 'references.bib'
---

A supported statement [@example2025].
```

Citations retain the plugin's default APA style and `en-US` locale. Each citation links to its bibliography entry on the same page. The bibliography appears at the end of the post, includes only cited references and does not duplicate repeated citations. Posts without a bibliography retain their existing behavior. An unreadable bibliography causes `yarn content:build` to fail. The example is for authoring; automated tests create their bibliography and posts only in a temporary copy.

## Vercel

Vercel can detect Next.js, Yarn and the root `build` script. `package.json` declares `engines.node: 24.x`, which [overrides the Node version in project settings](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions#version-overrides-in-packagejson); `.nvmrc` pins local and CI patch versions. Vercel supplies a supported Node 24 patch rather than promising the exact local patch. Keep the Git integration as the deployment owner; CI does not run another deployment command.

The read-only project inspection on 2026-10-09 reported a legacy Node 18 setting and an errored latest production deployment. This implementation does not change cloud settings, domains or provider credentials. Verify the runtime selected in a Vercel preview's build log before promotion, including whether project-level command overrides supersede repository scripts.

Tests need no `.env` files or provider secrets. For application integrations, use `.env.example` as the reference and keep local values untracked.
