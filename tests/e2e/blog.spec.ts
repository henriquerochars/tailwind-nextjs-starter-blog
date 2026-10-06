import { expect, test } from '@playwright/test'

test.describe('blog smoke and regression coverage', () => {
  test('renders the homepage and primary navigation without browser errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text())
    })
    page.on('pageerror', (error) => errors.push(error.message))

    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Últimas postagens' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Blog Index' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Portfolio Page' })).toHaveAttribute(
      'href',
      'https://henriquerochadev.vercel.app/'
    )

    expect(errors).toEqual([])
  })

  test('renders the blog index, pagination, and an MDX post', async ({ page }) => {
    await page.goto('/blog')
    await expect(page.getByRole('heading', { name: 'All Posts' })).toBeVisible()

    await page.goto('/blog/page/1')
    await expect(page.getByRole('heading', { name: 'All Posts' })).toBeVisible()

    const response = await page.goto('/blog/first-post')
    expect(response?.ok()).toBeTruthy()
    await expect(page.locator('article')).toBeVisible()
  })

  test('renders tags and tag-filtered content', async ({ page }) => {
    const tagsResponse = await page.goto('/tags')
    expect(tagsResponse?.ok()).toBeTruthy()

    const tagResponse = await page.goto('/tags/diary')
    expect(tagResponse?.ok()).toBeTruthy()
    await expect(page.locator('main')).toBeVisible()
  })

  test('toggles theme and supports mobile navigation', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'Toggle Dark Mode' }).click()
    await expect(page.locator('html')).toHaveClass(/dark|light/)

    await page.setViewportSize({ width: 390, height: 844 })
    await page.reload()

    const menuButtons = page.getByRole('button', { name: 'Toggle Menu' })
    await menuButtons.first().click()
    await expect(page.getByRole('link', { name: 'Blog Index' })).toBeVisible()
  })

  test('serves SEO, feed, and generated search artifacts', async ({ request }) => {
    for (const path of ['/robots.txt', '/sitemap.xml', '/feed.xml', '/search.json']) {
      const response = await request.get(path)
      expect(response.ok(), `${path} should respond successfully`).toBeTruthy()
      expect((await response.body()).length).toBeGreaterThan(0)
    }
  })
})
