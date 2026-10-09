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

Lint uses ESLint's flat configuration. Formatting is a separate check and intentionally excludes author-owned MDX. Run fixes deliberately with `yarn lint:fix` and `yarn format:fix`. Optional local hooks require `yarn hooks:install`; installation and CI do not install hooks automatically.

## Vercel

Vercel can detect Next.js, Yarn and the root `build` script. `package.json` declares `engines.node: 24.x`, which [overrides the Node version in project settings](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions#version-overrides-in-packagejson); `.nvmrc` pins local and CI patch versions. Vercel supplies a supported Node 24 patch rather than promising the exact local patch. Keep the Git integration as the deployment owner; CI does not run another deployment command.

The read-only project inspection on 2026-10-09 reported a legacy Node 18 setting and an errored latest production deployment. This implementation does not change cloud settings, domains or provider credentials. Verify the runtime selected in a Vercel preview's build log before promotion, including whether project-level command overrides supersede repository scripts.

Tests need no `.env` files or provider secrets. For application integrations, use `.env.example` as the reference and keep local values untracked.
