import type { MetadataRoute } from 'next'

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? 'https://herman-intern-hub.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/apply', '/interns', '/success-stories', '/verify/'],
        disallow: [
          '/admin/',
          '/dashboard/',
          '/onboarding/',
          '/invite/',
          '/api/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}