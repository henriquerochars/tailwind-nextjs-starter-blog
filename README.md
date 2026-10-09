# Henrique Rocha Dev — Blog

Personal blog built with Next.js, React, Tailwind CSS and Contentlayer2, deployed through Vercel's Git integration. Posts and author profiles live in `data/`; the existing Portuguese content and visual identity are preserved.

## Development

Use Node from `.nvmrc` and the checked-in Yarn launcher:

```sh
nvm use
node .yarn/releases/yarn-4.18.1.cjs install --immutable
yarn playwright install chromium
yarn dev
```

Run `yarn check` for the full gate: documentation, lint, formatting, types, harness regressions, production build, content and desktop/mobile Chromium tests. Browser installation is explicit; tests use temporary fixtures and no provider secrets. `yarn build` builds the actual blog with Webpack and generates feeds. Use `yarn serve` to inspect that production build.

Start with [the engineering documentation](docs/engineering/index.md) for setup, generated files, Vercel compatibility and verification. Repository agent instructions are in [AGENTS.md](AGENTS.md), with a short [CLAUDE.md](CLAUDE.md) pointer. The accepted content pipeline is recorded in [the Contentlayer2 decision](docs/decisions/0001-content-pipeline.md).

This project derives from [Tailwind Next.js Starter Blog](https://github.com/timlrx/tailwind-nextjs-starter-blog). See [LICENSE](LICENSE) for attribution and licensing. Space Grotesk's license is in `app/fonts/OFL.txt`.
