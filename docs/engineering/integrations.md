# Public URLs and integrations

`data/siteMetadata.js` owns the canonical origin, `https://henriquerochadevblog.vercel.app`. Next.js metadata keeps each route's path through `./`; Open Graph, Twitter cards, JSON-LD, sitemap, robots and RSS derive absolute URLs from that origin. HTML and date formatting use `pt-BR`; Open Graph uses `pt_BR`. The existing logo and social banner remain local.

RSS omits the optional author, managing editor and webmaster elements when no email is configured. No account email is inferred or published.

## Disabled integrations

Comments and newsletter subscriptions are disabled by design. There is no comment container, comment scroll button, newsletter form, MDX newsletter component or `/api/newsletter` route. The removed endpoint receives the normal Next.js 404 response. Existing Portuguese posts and public page routes are preserved. Reintroducing either feature requires an explicit implementation and provider setup.

## Optional analytics

`NEXT_UMAMI_ID` is a public Umami Cloud website UUID, read at build time. An unset, empty or whitespace-only value disables analytics and removes its CSP allowances. A nonempty malformed UUID fails configuration with a clear error that does not print the supplied value. Set a valid website UUID in the intended build environment and rebuild to enable it. No provider account, environment variable or domain is provisioned by this repository change.

The script URL is explicitly `https://cloud.umami.is/script.js`; `data-host-url` selects `https://gateway.umami.is`. `data-domains` limits tracking to the canonical hostname, excluding localhost and Vercel preview hostnames. Pliny mounts the script only in production. See the official [Umami Cloud endpoints](https://docs.umami.is/docs/bypass-ad-blockers) and [tracker configuration](https://docs.umami.is/docs/tracker-configuration).

## Content Security Policy

The response CSP permits local scripts, styles, fonts, media and connections, plus `data:`/`blob:` images. When Umami is configured, only its script origin and collection origin are added to their respective directives. Frames and objects are forbidden; base URLs, form submissions and embedding are constrained. Existing security headers are retained.

`unsafe-inline` remains for Next.js hydration, theme initialization and inline styles on static pages. Request-specific nonces would require dynamic rendering; experimental SRI is outside this change. `unsafe-eval` and WebSocket schemes are allowed only in development for debugging and HMR. Production does not allow eval, wildcard connections, external frames or arbitrary image origins. Remote images must pass through the existing Next.js image optimizer or receive a deliberate policy change.

## Verification

Configuration tests run in isolated processes for absent, blank, valid and invalid analytics IDs and development/production CSPs. The shared production fixture uses a synthetic UUID. Chromium fulfills its script request with a local stub and blocks other foreign requests; no telemetry reaches Umami. Artifact checks verify the canonical origin, route-specific metadata, locale, RSS email omission and removed API route. See [verification](verification.md) for the full gate. These checks do not validate a live provider account or production deployment.
