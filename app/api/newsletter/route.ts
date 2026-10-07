import { NewsletterAPI } from 'pliny/newsletter'
import siteMetadata from '@/data/siteMetadata'

const handler = NewsletterAPI({
  // @ts-expect-error -- site metadata stores the newsletter provider as a generic string
  provider: siteMetadata.newsletter.provider,
})

export { handler as GET, handler as POST }
