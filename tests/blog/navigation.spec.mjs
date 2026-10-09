import { test, expect } from './fixtures.mjs'
import {
  umamiWebsiteId,
  oldestSlug,
  publishedSlug,
  publishedTitle,
  draftSlug,
  draftTitle,
} from '../../scripts/harness/fixture.mjs'

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
  const jsonLd = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent())
  expect(jsonLd.url).toBe(`https://henriquerochadevblog.vercel.app/blog/${publishedSlug}`)
  expect(jsonLd.author).toEqual([{ '@type': 'Person', name: 'Harness Author' }])
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
  await expect(page.locator('main article')).toHaveCount(5)
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

test('personal pages work and unpublished or invalid routes return 404', async ({
  page,
  browserDiagnostics,
}) => {
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
    browserDiagnostics.expectDocument404(route)
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

test('configured Umami loads its local stub under the production CSP', async ({ page }) => {
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
})

test('previous and next links navigate published posts and respect the ends', async ({ page }) => {
  const articleLink = (heading) =>
    page.getByRole('heading', { name: heading, exact: true }).locator('..').getByRole('link')
  await page.goto(`/blog/${publishedSlug}`)
  await expect(page.getByRole('heading', { name: 'Next Article', exact: true })).toHaveCount(0)
  const previous = articleLink('Previous Article')
  await expect(previous).toHaveAttribute('href', '/blog/__harness/post-6')
  await previous.click()
  await expect(page).toHaveURL(/\/blog\/__harness\/post-6$/)
  await expect(
    page.getByRole('heading', { name: 'Harness pagination 6', exact: true })
  ).toBeVisible()
  await expect(articleLink('Previous Article')).toHaveAttribute('href', '/blog/__harness/post-5')
  const next = articleLink('Next Article')
  await expect(next).toHaveAttribute('href', `/blog/${publishedSlug}`)
  await next.click()
  await expect(page.getByRole('heading', { name: publishedTitle, exact: true })).toBeVisible()
  await page.goto(`/blog/${oldestSlug}`)
  await expect(page.getByRole('heading', { name: 'Previous Article', exact: true })).toHaveCount(0)
  const newer = articleLink('Next Article')
  const title = await newer.textContent()
  const href = await newer.getAttribute('href')
  expect(href).not.toContain(draftSlug)
  await newer.click()
  await expect(page).toHaveURL(new RegExp(`${href}$`))
  await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible()
})

test('all primary routes preserve canonical metadata and disabled integrations', async ({
  page,
}) => {
  for (const route of [
    '/',
    '/about',
    '/projects',
    '/blog',
    '/blog/page/1',
    '/blog/page/2',
    '/tags',
    '/tags/harness-shared',
    `/blog/${publishedSlug}`,
    '/blog/__harness/post-1',
    '/blog/__harness/post-2',
  ]) {
    expect((await page.goto(route)).status(), route).toBe(200)
    const canonical = `https://henriquerochadevblog.vercel.app${route === '/' ? '' : route}`
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical)
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonical)
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'pt_BR')
    const image = route === '/blog/__harness/post-2' ? 'avatar.png' : 'twitter-card.png'
    for (const selector of ['meta[property="og:image"]', 'meta[name="twitter:image"]']) {
      await expect(page.locator(selector)).toHaveAttribute(
        'content',
        `https://henriquerochadevblog.vercel.app/static/images/${image}`
      )
    }
    await expect(
      page.locator('#comment, .giscus, iframe, input[type="email"], form[action*="newsletter"]')
    ).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Scroll To Comment' })).toHaveCount(0)
    await expect(
      page.locator('script[src*="giscus"], script[src*="utterances"], script[src*="disqus"]')
    ).toHaveCount(0)
  }
})

test('discovery endpoints serve canonical URLs and exclude drafts', async ({ request }) => {
  const origin = 'https://henriquerochadevblog.vercel.app'
  const robots = await request.get('/robots.txt')
  expect(robots.status()).toBe(200)
  expect(await robots.text()).toContain(`Host: ${origin}`)
  expect(await robots.text()).toContain(`Sitemap: ${origin}/sitemap.xml`)
  const sitemap = await request.get('/sitemap.xml')
  expect(sitemap.status()).toBe(200)
  expect(await sitemap.text()).toContain(`<loc>${origin}/blog/${publishedSlug}</loc>`)
  expect(await sitemap.text()).not.toContain(draftSlug)
  for (const route of ['/feed.xml', '/tags/harness-shared/feed.xml']) {
    const feed = await request.get(route)
    expect(feed.status()).toBe(200)
    const xml = await feed.text()
    expect(xml).toContain(`<atom:link href="${origin}${route}"`)
    expect(xml).toContain(`<guid>${origin}/blog/${publishedSlug}</guid>`)
    expect(xml).not.toContain(draftSlug)
    expect(xml).not.toContain('undefined')
  }
})

test('browser guard detects injected console, runtime and CSP diagnostics', async ({
  page,
  browserDiagnostics,
}) => {
  await page.goto('/')
  await page.evaluate(() => {
    document.dispatchEvent(
      new SecurityPolicyViolationEvent('securitypolicyviolation', {
        violatedDirective: 'script-src',
        blockedURI: 'harness-negative-control',
      })
    )
    console.error('Harness injected console error')
    setTimeout(() => {
      throw new Error('Harness injected runtime error')
    }, 0)
  })
  await expect.poll(() => browserDiagnostics.failures().length).toBe(3)
  expect(() => browserDiagnostics.assertClean()).toThrow(/Unexpected browser diagnostics/)
  browserDiagnostics.consumeExpected('console.error', 'Harness injected console error')
  expect(() => browserDiagnostics.assertClean()).toThrow(/Unexpected browser diagnostics/)
  browserDiagnostics.consumeExpected('pageerror', 'Harness injected runtime error')
  expect(() => browserDiagnostics.assertClean()).toThrow(/Unexpected browser diagnostics/)
  browserDiagnostics.consumeExpected('CSP', 'script-src: harness-negative-control')
  browserDiagnostics.assertClean()
})
