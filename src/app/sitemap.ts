import type { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? 'https://herman-intern-hub.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient()

  // ─── Static pages ──────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/apply`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/interns`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/success-stories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/apply/status`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    // ─── Legal ───────────────────────────────────────
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/cookies`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  // ─── Dynamic: public intern profiles ────────────────
  const { data: interns } = await supabase
    .from('profiles')
    .select('id, updated_at')
    .eq('role', 'intern')
    .in('status', ['active', 'completed'])
    .eq('directory_visible', true)

  const internRoutes: MetadataRoute.Sitemap = (interns ?? []).map((i) => ({
    url: `${BASE_URL}/interns/${i.id}`,
    lastModified: i.updated_at ? new Date(i.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  // ─── Dynamic: certificates ─────────────────────────
  const { data: certificates } = await supabase
    .from('documents')
    .select('certificate_id')
    .eq('type', 'certificate')
    .not('certificate_id', 'is', null)

  const certRoutes: MetadataRoute.Sitemap = (certificates ?? []).map((c) => ({
    url: `${BASE_URL}/verify/${c.certificate_id}`,
    lastModified: new Date(),
    changeFrequency: 'yearly',
    priority: 0.4,
  }))

  return [...staticRoutes, ...internRoutes, ...certRoutes]
}