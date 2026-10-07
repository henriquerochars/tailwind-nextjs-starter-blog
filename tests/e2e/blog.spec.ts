import { expect, test } from '@playwright/test'

test.describe('blog smoke and regression coverage', () => {
  test('renders the home page and latest posts without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text())
    })

    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Últimas postagens' })).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Minha primeira palestra em um evento aberto a comunidade' })
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Primeiro post do blog, meu diário técnico' })
    ).toBeVisible()
    expect(errors).toEqual([])
  })

  test('renders the blog index and an MDX post', async ({ page }) => {
    await page.goto('/blog')
    await expect(page.getByRole('heading', { name: 'All Posts' })).toBeVisible()

    await page
      .getByRole('link', { name: 'Primeiro post do blog, meu diário técnico' })
      .first()
      .click()
    await expect(page).toHaveURL(/\/blog\/first-post$/)
    await expect(
      page.getByRole('heading', { name: 'Primeiro post do blog, meu diário técnico' })
    ).toBeVisible()
    await expect(page.getByText('Por que eu criei esse blog?')).toBeVisible()
  })

  test('renders tag pages and filtered content', async ({ page }) => {
    await page.goto('/tags')
    await page.getByRole('link', { name: /diary/i }).first().click()
    await expect(page).toHaveURL(/\/tags\/diary$/)
    await expect(page.getByRole('heading', { name: /Diary/i })).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Primeiro post do blog, meu diário técnico' })
    ).toBeVisible()
  })

  test('toggles dark mode', async ({ page }) => {
    await page.goto('/')

    const toggle = page.getByRole('button', { name: 'Toggle Dark Mode' })
    await expect(toggle).toBeVisible()
    await toggle.click()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await toggle.click()
    await expect(page.locator('html')).not.toHaveClass(/dark/)
  })

  test('supports mobile navigation', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')

    const toggles = page.getByRole('button', { name: 'Toggle Menu' })
    await toggles.first().click()
    await expect(page.getByRole('link', { name: 'Blog' })).toBeVisible()

    await page.getByRole('link', { name: 'Blog' }).click()
    await expect(page).toHaveURL(/\/blog$/)
  })

  test('serves sitemap, robots and RSS artifacts', async ({ request }) => {
    const [sitemap, robots, rss] = await Promise.all([
      request.get('/sitemap.xml'),
      request.get('/robots.txt'),
      request.get('/feed.xml'),
    ])

    expect(sitemap.ok()).toBeTruthy()
    expect(await sitemap.text()).toContain('<urlset')
    expect(robots.ok()).toBeTruthy()
    expect(await robots.text()).toContain('User-Agent')
    expect(rss.ok()).toBeTruthy()
    expect(await rss.text()).toContain('<rss')
  })
})
