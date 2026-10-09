import { test, expect } from '@playwright/test'
import {
  umamiWebsiteId,
  publishedSlug,
  publishedTitle,
  draftSlug,
  draftTitle,
} from '../../scripts/harness/fixture.mjs'

test.beforeEach(async ({ context, page, baseURL }) => {
  if (!baseURL) throw new Error('Run yarn test:blog to start the isolated production fixture')
  const errors = []
  let newsletterRequests = 0
  page.on('pageerror', (error) => errors.push(error.message))
  await context.route('**/*', (route) => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/newsletter') {
      newsletterRequests++
      return route.abort()
    }
    if (url.href === 'https://cloud.umami.is/script.js') {
      return route.fulfill({
        contentType: 'application/javascript',
        body: 'window.__umamiStubLoaded = true',
      })
    }
    if (url.origin !== new URL(baseURL).origin) return route.abort()
    return route.continue()
  })
  test.info()._harness = { errors, newsletterRequests: () => newsletterRequests }
})

test.afterEach(async () => {
  expect(test.info()._harness.errors, 'browser runtime errors').toEqual([])
  expect(test.info()._harness.newsletterRequests(), 'no newsletter requests').toBe(0)
})

test('home navigates to a nested post with rich MDX', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Últimas postagens', exact: true })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
  await expect(page.getByText(draftTitle, { exact: true })).toHaveCount(0)
  await expect(page.locator('main time').first()).toHaveText('2 de março de 2025')
  await page.locator('main').getByRole('link', { name: publishedTitle, exact: true }).click()
  await expect(page).toHaveURL(new RegExp(`/blog/${publishedSlug}$`))
  await expect(page.getByRole('heading', { name: publishedTitle, exact: true })).toBeVisible()
  await expect(page.locator('main time').first()).toHaveText('domingo, 2 de março de 2025')
  await expect(page.locator('main').getByText('Harness Author', { exact: true })).toBeVisible()
  await expect(page.locator('main table')).toContainText('Verified')
  await expect(page.locator('.katex').first()).toBeVisible()
  await expect(page.locator('main pre')).toContainText('export const verified = true')
  await expect(page.locator('[data-harness="rich"]')).toHaveText('Rendered MDX component')
  await expect(page.getByRole('img', { name: 'Fixture image', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Harness heading', exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    await page.evaluate(() => innerWidth)
  )
})

test('listing paginates published posts and returns to page one', async ({ page }) => {
  await page.goto('/blog')
  await expect(page.locator('main article')).toHaveCount(5)
  await expect(page.locator('main time').first()).toHaveText('2 de março de 2025')
  await page.getByRole('link', { name: 'Next', exact: true }).click()
  await expect(page).toHaveURL(/\/blog\/page\/2$/)
  await expect(page.locator('main article')).toHaveCount(4)
  await expect(page.getByText(draftTitle, { exact: true })).toHaveCount(0)
  await page.getByRole('link', { name: 'Previous', exact: true }).click()
  await expect(page).toHaveURL(/\/blog\/?$/)
})

test('tag pages contain published matches and a working feed', async ({ page, request }) => {
  await page.goto('/tags')
  await page.locator('a[href="/tags/harness-shared"]').first().click()
  await expect(page).toHaveURL(/\/tags\/harness-shared$/)
  await expect(page.locator('main article')).toHaveCount(7)
  await expect(page.getByText(draftTitle, { exact: true })).toHaveCount(0)
  const response = await request.get('/tags/harness-shared/feed.xml')
  expect(response.status()).toBe(200)
  expect(await response.text()).toContain('Harness published &amp; verified')
  expect(await response.text()).not.toContain(draftTitle)
})

test('personal pages work and unpublished or invalid routes return 404', async ({ page }) => {
  for (const route of ['/about', '/projects', '/blog/first-post']) {
    expect((await page.goto(route)).status()).toBe(200)
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('main h1')).toBeVisible()
  }
  for (const route of [
    `/blog/${draftSlug}`,
    '/blog/does-not-exist',
    '/tags/harness-draft-only',
    '/blog/page/999',
    '/blog/page/1x',
    '/missing-page',
  ]) {
    expect((await page.goto(route)).status(), route).toBe(404)
    expect(await page.content()).not.toContain(draftTitle)
  }
})

test('local search opens by keyboard and finds a published post', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+k' : 'Control+k')
  const input = page.getByPlaceholder(/search/i)
  await expect(input).toBeVisible()
  await input.fill('Harness published')
  await expect(page.getByText(publishedTitle, { exact: true }).last()).toBeVisible()
  await input.fill(draftTitle)
  await expect(page.getByText(draftTitle, { exact: true })).toHaveCount(0)
  await page.keyboard.press('Escape')
  await expect(input).toBeHidden()
})

test('theme persists and mobile navigation opens, closes and restores scrolling', async ({
  page,
}, testInfo) => {
  await page.goto('/')
  const toggle = page.getByRole('button', { name: 'Toggle Dark Mode', exact: true })
  await toggle.click()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await page.reload()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await toggle.click()
  await expect(page.locator('html')).not.toHaveClass(/dark/)
  const menu = page.getByRole('button', { name: 'Toggle Menu', exact: true })
  if (testInfo.project.name === 'mobile') {
    await menu.click()
    await expect(menu).toHaveAttribute('aria-expanded', 'true')
    await expect(page.locator('body')).toHaveCSS('overflow', 'hidden')
    await page
      .locator('#mobile-navigation')
      .getByRole('link', { name: 'Blog Index', exact: true })
      .click()
    await expect(page).toHaveURL(/\/blog$/)
    await expect(menu).toHaveAttribute('aria-expanded', 'false')
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
    await menu.click()
    await page.keyboard.press('Escape')
    await expect(menu).toHaveAttribute('aria-expanded', 'false')
  } else {
    await expect(menu).toBeHidden()
  }
})

test('production metadata, analytics and CSP use the personal configuration', async ({ page }) => {
  await page.addInitScript(() => {
    window.__cspViolations = []
    document.addEventListener('securitypolicyviolation', (event) => {
      window.__cspViolations.push(`${event.violatedDirective}: ${event.blockedURI}`)
    })
  })
  const response = await page.goto('/')
  const csp = response.headers()['content-security-policy']
  expect(csp).toContain("connect-src 'self' https://gateway.umami.is;")
  expect(csp).toContain("script-src 'self' 'unsafe-inline' https://cloud.umami.is;")
  expect(csp).not.toContain('unsafe-eval')
  expect(csp).not.toContain('*')
  await expect.poll(() => page.evaluate(() => window.__umamiStubLoaded)).toBe(true)
  const tracker = page.locator('script[src="https://cloud.umami.is/script.js"]')
  await expect(tracker).toHaveAttribute('data-website-id', umamiWebsiteId)
  await expect(tracker).toHaveAttribute('data-host-url', 'https://gateway.umami.is')
  await expect(tracker).toHaveAttribute('data-domains', 'henriquerochadevblog.vercel.app')
  for (const route of ['/', `/blog/${publishedSlug}`]) {
    await page.goto(route)
    const canonical = `https://henriquerochadevblog.vercel.app${route === '/' ? '' : route}`
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical)
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonical)
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'pt_BR')
    await expect(page.locator('#comment, iframe, form[action="/api/newsletter"]')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Scroll To Comment' })).toHaveCount(0)
    expect(await page.evaluate(() => window.__cspViolations)).toEqual([])
  }
})
