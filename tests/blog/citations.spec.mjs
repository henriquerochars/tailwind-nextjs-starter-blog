import { test, expect } from './fixtures.mjs'
import { publishedSlug } from '../../scripts/harness/fixture.mjs'

test('citations link to unique local bibliography entries', async ({ page }) => {
  await page.goto(`/blog/${publishedSlug}`)
  const citations = page.locator('main [id^="citation--"]')
  await expect(citations).toHaveText(['(Alpha, 2020)', '(Beta, 2021)', '(Alpha, 2020)'])
  await expect(page.locator('main')).not.toContainText(/\[@harness-/)

  const bibliography = page.locator('main #refs')
  await expect(bibliography).toHaveCount(1)
  await expect(bibliography.locator('.csl-entry')).toHaveCount(2)
  await expect(bibliography).not.toContainText('Harness uncited reference')
  await expect(page.locator('#bib-harness-unused')).toHaveCount(0)
  for (const [key, author, year] of [
    ['alpha', 'Alpha', '2020'],
    ['beta', 'Beta', '2021'],
  ]) {
    const entry = page.locator(`#bib-harness-${key}`)
    await expect(entry).toHaveCount(1)
    await expect(entry).toContainText(`Harness reference ${key}`)
    await expect(entry).toContainText(author)
    await expect(entry).toContainText(year)
  }

  for (const [index, key] of ['alpha', 'beta', 'alpha'].entries()) {
    const link = citations.nth(index).getByRole('link')
    const fragment = `#bib-harness-${key}`
    await expect(link).toHaveAttribute('href', fragment)
    await link.click()
    await expect(page).toHaveURL(new RegExp(`/blog/${publishedSlug}${fragment}$`))
    await expect(page.locator(fragment)).toBeInViewport()
    // The sticky site header must not cover the anchor target.
    const headerBottom = await page
      .getByRole('banner')
      .evaluate((element) => element.getBoundingClientRect().bottom)
    await expect
      .poll(async () => (await page.locator(fragment).boundingBox()).y)
      .toBeGreaterThanOrEqual(headerBottom)
  }
})
