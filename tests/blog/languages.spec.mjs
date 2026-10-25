import { test, expect, openSearch } from './fixtures.mjs'
import { publishedSlug, draftSlug, draftTitle } from '../../scripts/harness/fixture.mjs'

const origin = 'https://henriquerochadevblog.vercel.app'
const languages = [
  {
    locale: 'pt-BR',
    prefix: '',
    label: 'Selecionar idioma',
    heading: 'Últimas postagens',
    title: 'Primeiro post do blog, meu diário técnico',
    body: 'Tive a vontade de criar esse blog',
    og: 'pt_BR',
  },
  {
    locale: 'en',
    prefix: '/en',
    label: 'Select language',
    heading: 'Latest posts',
    title: 'My first blog post, my technical diary',
    body: 'I wanted to create this blog',
    og: 'en_US',
  },
  {
    locale: 'es',
    prefix: '/es',
    label: 'Seleccionar idioma',
    heading: 'Últimas publicaciones',
    title: 'Mi primera publicación en el blog, mi diario técnico',
    body: 'Quise crear este blog',
    og: 'es_ES',
  },
]

test('language selector preserves article, query and fragment and persists through reload', async ({
  page,
}) => {
  await page.goto('/blog/first-post?from=language#article')
  for (const language of [languages[1], languages[2], languages[0]]) {
    await page.locator('select[name="language"]').selectOption(language.locale)
    await expect(page).toHaveURL(
      new RegExp(`${language.prefix}/blog/first-post\\?from=language#article$`)
    )
    await expect(page.locator('html')).toHaveAttribute('lang', language.locale)
    await expect(page.locator('h1')).toHaveText(language.title)
    await expect(page).toHaveTitle(`${language.title} | Blog | Henrique Rocha Dev`)
    await expect(page.locator('main .prose')).toContainText(language.body)
    await expect(page.getByRole('combobox', { name: language.label })).toHaveValue(language.locale)
    await page.reload()
    await expect(page.locator('h1')).toHaveText(language.title)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `${origin}${language.prefix}/blog/first-post`
    )
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', language.og)
    for (const alternate of languages)
      await expect(
        page.locator(`link[rel="alternate"][hreflang="${alternate.locale}"]`)
      ).toHaveAttribute('href', `${origin}${alternate.prefix}/blog/first-post`)
  }
})

test('localized navigation, dates, full second article and source fallback stay consistent', async ({
  page,
}) => {
  for (const language of languages.slice(1)) {
    await page.goto(`${language.prefix}/`)
    await expect(page.locator('h1')).toHaveText(language.heading)
    await expect(page.locator('main time').first()).toHaveText(
      language.locale === 'en' ? 'March 2, 2025' : '2 de marzo de 2025'
    )
    await page.goto(`${language.prefix}/blog/my-first-talk`)
    await expect(page.locator('main .prose')).toContainText(
      language.locale === 'en'
        ? 'Those are the updates for now. Until next time!'
        : 'Estas son las novedades por ahora. ¡Hasta la próxima!'
    )
    await expect(page.locator('main .prose a').last()).toHaveAttribute(
      'href',
      'https://www.eventbrite.com.br/e/js-vix-tickets-741027963587'
    )
    await page.goto(`${language.prefix}/blog/${publishedSlug}`)
    await expect(page.getByRole('note')).toHaveText(
      language.locale === 'en'
        ? 'This post is currently available in Portuguese.'
        : 'Esta publicación está disponible en portugués.'
    )
    await expect(page.locator('main .prose > [lang]')).toHaveAttribute('lang', 'pt-BR')
    await expect(page.locator('html')).toHaveAttribute('lang', language.locale)
    await expect(
      page
        .locator('main a')
        .filter({ hasText: language.locale === 'en' ? 'Back to the blog' : 'Volver al blog' })
    ).toHaveAttribute('href', `${language.prefix}/blog`)
    await page.goto(`${language.prefix}/blog/page/2`)
    await expect(page.locator('main article')).toHaveCount(5)
    await page
      .getByRole('link', { name: language.locale === 'en' ? 'Previous' : 'Anterior', exact: true })
      .click()
    await expect(page).toHaveURL(new RegExp(`${language.prefix}/blog/?$`))
  }
})

test('localized public indices, feeds, search and draft boundaries', async ({
  page,
  request,
  browserDiagnostics,
}) => {
  for (const language of languages.slice(1)) {
    const index = await (await request.get(`/search.${language.locale}.json`)).json()
    expect(
      index.every((post) => post.path.startsWith(`${language.locale}/blog/`) && !post.draft)
    ).toBe(true)
    expect(index.find((post) => post.slug === 'first-post')).toMatchObject({
      title: language.title,
      locale: language.locale,
    })
    expect(index.find((post) => post.slug === publishedSlug)).toMatchObject({ locale: 'pt-BR' })
    expect(JSON.stringify(index)).not.toContain(draftTitle)
    const feed = await request.get(`${language.prefix}/feed.xml`)
    expect(feed.status()).toBe(200)
    expect(await feed.text()).toContain(language.title)
    expect(await feed.text()).not.toContain(draftTitle)
    await page.goto(`${language.prefix}/`)
    await openSearch(page)
    const input = page.getByRole('searchbox')
    await input.fill(language.title)
    await page.getByRole('dialog').getByRole('link', { name: language.title, exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`${language.prefix}/blog/first-post$`))
    for (const slug of [draftSlug, 'does-not-exist']) {
      const route = `${language.prefix}/blog/${slug}`
      browserDiagnostics.expectDocument404(route)
      expect((await page.goto(route)).status()).toBe(404)
      expect(await page.content()).not.toContain(draftTitle)
      await expect(page.locator('html')).toHaveAttribute('lang', language.locale)
      await expect(
        page.getByText(
          language.locale === 'en'
            ? "Sorry we couldn't find this page."
            : 'No encontramos esta página.',
          { exact: true }
        )
      ).toBeVisible()
    }
  }
})

test('local search restores focus and handles unavailable or malformed indices', async ({
  page,
}) => {
  await page.goto('/en')
  const selector = page.getByRole('combobox', { name: 'Select language' })
  await selector.focus()
  await openSearch(page)
  await page.getByRole('searchbox').fill('anything')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(selector).toBeFocused()
  for (const body of [
    '{"unexpected":true}',
    '[{"title":42,"path":"blog/invalid"}]',
    'invalid json',
  ]) {
    await page.route('**/search.en.json', (route) =>
      route.fulfill({ contentType: 'application/json', body })
    )
    await page.reload()
    await openSearch(page)
    await expect(page.getByRole('status')).toHaveText('Unable to load search.')
    await page.keyboard.press('Escape')
    await page.unroute('**/search.en.json')
  }
  await page.addInitScript(() => {
    const original = window.fetch.bind(window)
    window.fetch = (input, options) =>
      String(input).includes('/search.en.json')
        ? Promise.reject(new Error('Synthetic offline search'))
        : original(input, options)
  })
  await page.reload()
  await openSearch(page)
  await expect(page.getByRole('status')).toHaveText('Unable to load search.')
})
