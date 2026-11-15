import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// Поисковикам — всё, кроме служебных страниц: админки, корзины, оформления заказа и вебхуков
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/cart', '/checkout', '/api'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
