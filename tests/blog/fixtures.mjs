import { test as base, expect } from '@playwright/test'
import { createBrowserDiagnostics } from '../../scripts/harness/browser-diagnostics.mjs'

export { expect }

export const test = base.extend({
  browserDiagnostics: [
    async ({ context, baseURL }, use) => {
      if (!baseURL) throw new Error('Run yarn test:blog to start the isolated production fixture')
      const diagnostics = createBrowserDiagnostics(baseURL)
      const attach = (page) => {
        page.on('pageerror', (error) => diagnostics.record('pageerror', error.message, page.url()))
        page.on('console', (message) => {
          if (message.type() === 'error') {
            diagnostics.record('console.error', message.text(), message.location().url)
          }
        })
      }
      context.on('page', attach)
      context.pages().forEach(attach)
      context.on('response', (response) => {
        diagnostics.response(response.url(), response.status(), response.request().resourceType())
      })
      await context.exposeBinding('__reportBlogCspViolation', (_source, detail) => {
        diagnostics.record('CSP', `${detail.directive}: ${detail.blockedURI}`, detail.url)
      })
      await context.addInitScript(() => {
        document.addEventListener('securitypolicyviolation', (event) => {
          window.__reportBlogCspViolation({
            directive: event.violatedDirective,
            blockedURI: event.blockedURI,
            url: location.href,
          })
        })
      })
      await context.route('**/*', (route) => {
        const url = new URL(route.request().url())
        if (url.pathname === '/api/newsletter' || url.pathname.startsWith('/api/newsletter/')) {
          diagnostics.record('network', 'Forbidden newsletter request', url.href)
          return route.abort()
        }
        if (url.href === 'https://cloud.umami.is/script.js') {
          return route.fulfill({
            contentType: 'application/javascript',
            body: 'window.__umamiStubLoaded = true',
          })
        }
        if (url.origin !== new URL(baseURL).origin) {
          diagnostics.record('network', 'Unexpected external request', url.href)
          return route.abort()
        }
        return route.continue()
      })
      await use(diagnostics)
      diagnostics.assertClean()
    },
    { auto: true },
  ],
})
