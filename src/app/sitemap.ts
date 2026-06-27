import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const BASE_URL = 'https://www.moesco.it'

export const revalidate = 3600 // rigenera ogni ora

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // ── Pagine statiche ──────────────────────────────────────────────────────
  const statiche: MetadataRoute.Sitemap = [
    { url: BASE_URL,                             changeFrequency: 'daily',  priority: 1.0, lastModified: new Date() },
    { url: `${BASE_URL}/eventi`,                 changeFrequency: 'daily',  priority: 0.9, lastModified: new Date() },
    { url: `${BASE_URL}/localita`,               changeFrequency: 'weekly', priority: 0.7, lastModified: new Date() },
    { url: `${BASE_URL}/cosa-fare`,              changeFrequency: 'weekly', priority: 0.7, lastModified: new Date() },
    { url: `${BASE_URL}/organizzatori`,          changeFrequency: 'weekly', priority: 0.5, lastModified: new Date() },
    { url: `${BASE_URL}/contatti`,               changeFrequency: 'yearly', priority: 0.4 },
    { url: `${BASE_URL}/privacy-policy`,         changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/termini-e-condizioni`,   changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/cookie-policy`,          changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/condizioni-organizzatori`, changeFrequency: 'yearly', priority: 0.2 },
  ]

  // ── Comuni (pagine /localita/[slug]) ─────────────────────────────────────
  const { data: comuni } = await sb
    .from('geo_nodi')
    .select('slug')
    .eq('tipo', 'comune')

  const comuniUrls: MetadataRoute.Sitemap = (comuni ?? []).map(c => ({
    url: `${BASE_URL}/localita/${c.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
    lastModified: new Date(),
  }))

  // ── Schede evento approvate ───────────────────────────────────────────────
  // Includiamo tutti gli eventi approvati (anche passati: la pagina esiste ancora)
  const { data: eventi } = await sb
    .from('eventi')
    .select('slug, updated_at')
    .eq('stato', 'approvato')
    .order('data_inizio', { ascending: false })

  const eventiUrls: MetadataRoute.Sitemap = (eventi ?? []).map(e => ({
    url: `${BASE_URL}/eventi/${e.slug}`,
    lastModified: e.updated_at ? new Date(e.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...statiche, ...comuniUrls, ...eventiUrls]
}
