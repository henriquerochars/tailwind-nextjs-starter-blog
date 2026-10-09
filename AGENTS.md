# Repository instructions

This is Henrique Rocha's personal Next.js blog, deployed through Vercel's Git integration.
Preserve the Portuguese content, existing routes, visual identity and author-owned MDX.
Use English for engineering documentation and the user's language in conversation.

## Start here

- Read [the engineering index](docs/engineering/index.md) and the relevant linked guide.
- Keep [the Contentlayer2 decision](docs/decisions/0001-content-pipeline.md).
- Before Next.js changes, read the relevant version-matched guide in `node_modules/next/dist/docs/`.
- Read the actual code and reproduce reported problems before changing behavior.

## Runtime and commands

- Use Node from `.nvmrc` (24.21.0) and the checked-in Yarn 4.18.1 launcher.
- Install: `node .yarn/releases/yarn-4.18.1.cjs install --immutable`.
- Develop: `yarn dev`; serve a production build: `yarn serve`.
- `yarn lint:check`, `yarn format:check`, `yarn typecheck` are read-only source checks.
- `yarn check:docs` checks instruction budgets, the docs registry and local links.
- `yarn test:harness` runs portable positive and negative harness tests.
- Install Chromium explicitly once: `yarn playwright install chromium`.
- `yarn test:blog` builds synthetic content in a temporary copy and tests artifacts and browsers.
- `yarn check` runs the complete gate; run it before declaring an implementation ready.
- Use `yarn lint:fix` / `yarn format:fix` deliberately; never hide writes inside check commands.

## Boundaries

- Contentlayer2 generates `.contentlayer/`, `app/tag-data.json` and `public/search.json`.
- Builds generate `.next/` and RSS files under `public/`; these outputs stay untracked.
- Dev and build explicitly use Webpack because the Contentlayer2 integration requires it.
- The Space Grotesk font is local and its license is in `app/fonts/OFL.txt`.
- Do not format or rewrite posts/authors incidentally. Keep content fixtures out of `data/`.
- Keep tests offline from external providers; never send newsletter or comment requests in tests.
- Keep secrets and local environment files out of source, logs and fixture copies.
- Keep cloud runtime settings, domains, provider setup and production deployment within the user's requested scope.
- Do not merge, deploy or change branch protection as part of local validation.

## Completion

- Review the final diff separately from implementation; resolve defects and report remaining risks.
- Report the actual checks and results, with the candidate and integration SHAs when available.
- CI runs the whole gate on Linux and portable harness tests on macOS, without provider secrets.
- The required summary must fail for missing, failed, cancelled or skipped required jobs.
- Keep documentation registered in [docs/registry.json](docs/registry.json).
- Keep this file at most 120 logical lines and 11,000 UTF-8 bytes; keep CLAUDE.md a short pointer.
- This harness does not implement evidence reuse, receipts, scope selection, process leases or delivery automation.
