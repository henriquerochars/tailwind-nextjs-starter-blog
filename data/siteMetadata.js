const umamiWebsiteId = process.env.NEXT_UMAMI_ID?.trim()
if (
  umamiWebsiteId &&
  !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(umamiWebsiteId)
) {
  throw new Error('NEXT_UMAMI_ID must be a valid UUID, or empty to disable analytics')
}

const siteUrl = 'https://henriquerochadevblog.vercel.app'

/** @type {import("pliny/config").PlinyConfig } */
const siteMetadata = {
  title: 'Blog | Henrique Rocha Dev',
  author: 'Henrique Rocha Serrano',
  headerTitle: 'HenriqueRochaDev | Blog',
  description: 'Um blog criado para compartilhar conhecimento e experiências.',
  language: 'pt-BR',
  theme: 'system', // system, dark or light
  siteUrl,
  siteRepo: 'https://github.com/henriquerochars/tailwind-nextjs-starter-blog',
  siteLogo: '/static/images/logo.png',
  socialBanner: '/static/images/twitter-card.png',
  github: 'https://github.com/henriquerochars',
  twitter: 'https://twitter.com/henriquerochars',
  linkedin: 'https://www.linkedin.com/in/henriquerochaserrano/',
  locale: 'pt-BR',
  analytics: umamiWebsiteId
    ? {
        umamiAnalytics: {
          umamiWebsiteId,
          src: 'https://cloud.umami.is/script.js',
          umamiHostUrl: 'https://gateway.umami.is',
          umamiDomains: new URL(siteUrl).hostname,
        },
      }
    : {},
  search: {
    provider: 'kbar', // kbar or algolia
    kbarConfig: {
      searchDocumentsPath: 'search.json', // path to load documents to search
    },
  },
}

module.exports = siteMetadata
