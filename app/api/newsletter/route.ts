import { NewsletterAPI, type NewsletterConfig } from 'pliny/newsletter/index.js'
import siteMetadata from '@/data/siteMetadata'

const handler = NewsletterAPI({
  provider: siteMetadata.newsletter.provider as NewsletterConfig['provider'],
})

export { handler as GET, handler as POST }
