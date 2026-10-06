# Production integrations

## Canonical URL

The canonical production URL is:

`https://henriquerochadevblog.vercel.app`

Sitemap, RSS, Open Graph and other absolute URLs should derive from `siteMetadata.siteUrl`.

## Comments

Giscus remains enabled and uses environment variables for repository/category identifiers. The UI language is Portuguese.

## Analytics

Umami remains supported through `NEXT_UMAMI_ID`. The CSP explicitly allows the configured Umami host.

## Newsletter

Newsletter signup is intentionally disabled. The dormant newsletter API route and provider configuration were removed so the repository does not expose an unused endpoint.

## Security headers

The application keeps CSP, Referrer-Policy, X-Frame-Options, X-Content-Type-Options, HSTS, DNS prefetch control and Permissions-Policy headers.

The CSP no longer uses wildcard `img-src *` or `connect-src *`. External origins are scoped to the integrations currently used by the site.
