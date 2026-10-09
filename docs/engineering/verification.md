# Verification

Run `yarn check` from the repository root with the pinned Node runtime and Chromium installed. The gate runs sequentially:

1. `check:docs`: instruction line/byte budgets, exact docs registry coverage and local Markdown links/anchors.
2. `lint:check`: ESLint with zero warnings.
3. `format:check`: Prettier without writes; excludes author-owned MDX and generated output.
4. `typecheck`: content generation, Next.js route types and TypeScript.
5. `test:harness`: portable positive and negative tests for validators, source integrity, process cleanup and CI summary.
6. `build`: the actual personal blog's production build and RSS generation.
7. `test:blog`: isolated negative content cases, then one shared production fixture build for content and Chromium checks.

The runner hashes tracked and unignored files before and after, even on failure. A source mutation fails the gate. Generated files remain ignored. This is a verification of the current run, without receipts or previous-run reuse.

## Blog tests

The fixture runner copies current source into a directory it owns under the system temp directory. It excludes Git metadata, dependencies, generated output and local environment files. It links the already-installed dependencies and uses the pinned launcher with the fixture directory as `PWD` and `INIT_CWD`. It never edits real posts or authors. It cleans up its server process group and temporary directory on success or failure.

Negative fixtures exercise a missing required field, malformed MDX and an unknown author through the real content command. Positive fixtures include a nested slug, shared and draft-only tags, escaped XML text, an explicit author, rich MDX and enough published posts for pagination.

Artifact checks inspect generated schema, slugs, authors, reading time, TOC, compiled rich MDX, tag counts, local search, main/per-tag RSS, sitemap and prerendered routes. Chromium tests cover home, listing, pagination, post, tags, about, projects, search, mobile navigation, theme persistence and real 404 responses. They run on desktop and mobile viewports in Honolulu and Kiritimati time zones. Publication dates render in UTC so the calendar date and hydration stay consistent across server and visitor time zones. The fixture uses a synthetic Umami UUID and stubs its script locally. Other external browser requests are blocked and newsletter requests are forbidden. Configuration tests cover analytics opt-in and production/development CSP; artifact checks cover canonical URLs, locale, RSS email omission and the removed newsletter route. No live analytics, newsletter or comment credentials are required.

Failures preserve Playwright screenshots/traces in `test-results/` for CI upload. Fix the failing boundary and rerun the relevant check, then the complete gate for the final candidate.

## CI and review

All pull requests and pushes to `main` run the complete gate on Ubuntu. A separate macOS job installs immutably and runs docs/harness tests. Workflow permissions are read-only and required jobs receive no provider secrets. The summary runs even after failures and accepts only explicit success for both required jobs; absent, failed, cancelled and skipped jobs fail.

CI logs the actual Node, Yarn, Next.js and Playwright versions, PR head/base SHAs and tested integration SHA. Review the final candidate diff separately and record the checks and remaining limitations in the PR. No workflow merges, deploys or changes branch protection.
