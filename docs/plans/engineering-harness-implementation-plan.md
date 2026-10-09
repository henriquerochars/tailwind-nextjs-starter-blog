# Engineering harness implementation plan

## Adopted scope

Port the useful engineering harness ideas from `manager-for-brokers` to this personal blog. The user approved the essential scope, full compatible stable dependency upgrades first, real content/browser tests, one PR with separate commits, and fixes for small demonstrated pre-existing defects. Preserve the personal content, routes, language, visual identity and accepted [Contentlayer2 decision](../decisions/0001-content-pipeline.md).

The remote `main` was replaced with the upstream starter before implementation. Preserve the local personalized baseline (`e0eecb20dfdc6ef6eaa0f988c8c5f9d0289169ee`) while basing the implementation branch on the fetched remote (`b45bef66b40c63b6f57c15ee8cd090682238df4c`). The restoration is its own commit.

## Sequence

1. Capture the personalized baseline build and desktop/mobile appearance in a temporary copy.
2. Modernize to Node 24, Yarn 4, Next 16, React 19, Tailwind 4 and compatible stable tooling. Keep Contentlayer2 0.5.8, Pliny 0.4.1 and explicit Webpack. Pin TypeScript 6 and ESLint 9 to the supported lint peer ranges.
3. Prepare deterministic generation and checks: local licensed font, generated tags untracked, content integrity, route type generation, flat ESLint and separate formatting. Reproduce and fix production draft leaks in RSS, sitemap, post metadata and routes.
4. Add a bounded canonical AGENTS.md, a short CLAUDE.md pointer, engineering docs, registry/link validators and positive/negative portable tests.
5. Add one isolated fixture production build shared by artifact and desktop/mobile Chromium tests; do not mutate real content or contact external providers.
6. Add immutable Linux/macOS CI with a summary that requires every required job to succeed. Record actual runtime and candidate/integration SHAs, review the final patch and open one PR.

## Acceptance

- `yarn check` succeeds and leaves tracked/unignored source unchanged.
- Published content remains navigable; production drafts are absent from public pages, tags, search, feeds and sitemap, with 404s for draft URLs.
- Invalid source documents fail explicitly rather than disappearing silently from a successful build.
- Negative harness tests reject oversize instructions, stale registries, broken links, unsafe paths, source mutations and unsuccessful/missing CI jobs.
- Desktop/mobile browser checks exercise real production pages and remain independent of provider credentials.
- Local author MDX remains byte-identical to the preserved baseline.
- Vercel remains the Git-based deployment owner; runtime compatibility is documented without production cloud mutations.

Deferred: scope selectors, evidence reuse, receipts, Linux-specific process discovery, lease systems, automatic hook enforcement, GitHub Projects and delivery automation. Domain/provider cleanup remains separate.

Operational instructions and coverage live in [the engineering index](../engineering/index.md).
