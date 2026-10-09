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

Negative fixtures exercise a missing required field, malformed MDX and an unknown author through the real content command. Positive fixtures include a nested slug, shared and draft-only tags, escaped XML text, an explicit author, rich MDX and enough published posts for pagination, an oldest-post boundary and all three post layouts with local images.

Artifact checks inspect generated schema, slugs, authors, reading time, TOC, compiled rich MDX, tag counts, local search, main/per-tag RSS, sitemap, robots, JSON-LD and prerendered routes. They compare the sitemap with the exact published route set and verify canonical origins throughout RSS/JSON-LD. The route manifest must not contain the disabled newsletter endpoint; tests never call it.

Chromium tests cover home, listing/pagination, nested/rich MDX, about/projects, tags/feed, search, themes, mobile navigation, invalid/draft routes, publication dates and previous/next post navigation including both ends. A metadata matrix checks canonical/OG URLs, Portuguese locale, social images and absent comment/newsletter UI across static pages, listing/pagination, tags and all three post layouts. HTTP checks verify robots, sitemap and both RSS endpoints. They run on desktop and mobile viewports in Honolulu and Kiritimati time zones. Publication dates render in UTC so the calendar date and hydration stay consistent across server and visitor time zones.

Every browser test uses the shared fixture in `tests/blog/fixtures.mjs` to capture `console.error`, `pageerror` (including hydration failures) and CSP violations across pages and navigations. The only console exemption is Chromium's exact document-404 resource message for a URL explicitly declared by the test and observed with a document response of 404. A non-document resource 404 at the same URL invalidates that exemption. Image/script/fetch errors, other URLs, arbitrary application messages and CSP/runtime errors remain failures. Portable tests verify this boundary. A browser negative control injects a console error, runtime error and synthetic CSP event, proves the same guard rejects them, and consumes only those exact diagnostics; unrelated failures still fail the test.

The fixture uses a synthetic Umami UUID and fulfills only its exact Cloud script URL with a local stub. Newsletter requests are aborted and fail the test; all other external requests, including comment and telemetry providers, are aborted and fail the test. No live analytics, newsletter or comment credentials are required. Isolated-process configuration tests cover absent, blank, valid and invalid analytics IDs and production/development CSP; the fixture environment excludes caller analytics IDs as well as provider secrets. One shared production fixture build serves all browser scenarios.

Failures preserve Playwright screenshots/traces in `test-results/` for CI upload. Fix the failing boundary and rerun the relevant check, then the complete gate for the final candidate.

## CI and review

All pull requests and pushes to `main` run the complete gate on Ubuntu. A separate macOS job installs immutably and runs docs/harness tests. Workflow permissions are read-only and required jobs receive no provider secrets. The summary runs even after failures and accepts only explicit success for both required jobs; absent, failed, cancelled and skipped jobs fail.

CI logs the actual Node, Yarn, Next.js and Playwright versions, PR head/base SHAs and tested integration SHA. Review the final candidate diff separately and record the checks and remaining limitations in the PR. No workflow merges, deploys or changes branch protection.
