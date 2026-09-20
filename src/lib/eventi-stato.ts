import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'

// ─── Nucleo condiviso di "cambia stato di un evento" ─────────────────────────
//
// Contiene esattamente la logica che prima viveva solo dentro
// actions/admin.ts::aggiornaStatoEvento (update riga, cascata organizzatore,
// email, invalidazione cache) ma senza il controllo di login: chi chiama
// questa funzione deve aver già verificato l'autorizzazione.
//
// Due chiamanti:
//  - actions/admin.ts::aggiornaStatoEvento → richiede login admin (pannello)
//  - api/approva-eventi/route.ts → richiede il segreto CRON_SECRET/ADMIN_EMAIL
//    (vedi lib/api-auth.ts), stessa logica usata da api/proponi-eventi

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

async function inviaEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return
  const from = process.env.RESEND_FROM_EMAIL ?? 'moesco <onboarding@resend.dev>'
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], subject, html }),
    })
  } catch { /* non bloccante */ }
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.moesco.it'

function ricaricaPagine(slug?: string, geoSlug?: string) {
  revalidatePath('/')
  revalidatePath('/eventi')
  revalidatePath('/cosa-fare')
  revalidatePath('/admin')
  revalidatePath('/admin/eventi')
  revalidatePath('/admin/attivita')
  revalidatePath('/admin/organizzatori')
  if (slug) revalidatePath(`/eventi/${slug}`)
  if (geoSlug) revalidatePath(`/localita/${geoSlug}`)
}

export async function aggiornaStatoEventoCore(
  eventoId: string,
  nuovoStato: 'approvato' | 'rifiutato' | 'sospeso',
  nota?: string
): Promise<{ ok: boolean; errore?: string }> {
  try {
    const sb = await createAdminClient()

    const update: Record<string, unknown> = {
      stato: nuovoStato,
      note_revisione: nota?.trim() || null,
      revisionato_il: new Date().toISOString(),
    }
    if (nuovoStato === 'approvato') update.pubblicato_il = new Date().toISOString()

    const { data: evento, error } = await sb
      .from('eventi')
      .update(update)
      .eq('id', eventoId)
      .select('organizzatore_id, titolo, slug, geo_nodi(slug)')
      .single()

    if (error) return { ok: false, errore: error.message }

    // Approva anche l'organizzatore se era in attesa
    if (nuovoStato === 'approvato' && evento?.organizzatore_id) {
      await sb
        .from('organizzatori')
        .update({ stato: 'approvato' })
        .eq('id', evento.organizzatore_id)
        .eq('stato', 'in_attesa')
    }

    // ── Email all'organizzatore ───────────────────────────────
    if (evento?.organizzatore_id && (nuovoStato === 'approvato' || nuovoStato === 'rifiutato')) {
      const { data: org } = await sb
        .from('organizzatori')
        .select('nome, email')
        .eq('id', evento.organizzatore_id)
        .single()

      if (org?.email) {
        if (nuovoStato === 'approvato') {
          await inviaEmail(
            org.email,
            `Il tuo evento "${evento.titolo}" è stato pubblicato su moesco! 🎉`,
            `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1B2653;">
              <div style="background:#FFAD05;padding:24px 32px;border-radius:12px 12px 0 0;">
                <h1 style="margin:0;color:#fff;font-size:22px;">Evento pubblicato! 🎉</h1>
              </div>
              <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
                <p>Ciao <strong>${esc(org.nome)}</strong>,</p>
                <p>ottima notizia! Il tuo evento <strong>"${esc(evento.titolo)}"</strong> è stato revisionato e pubblicato su moesco.</p>
                <p>Da questo momento è visibile a tutti gli utenti del portale.</p>
                <div style="margin:24px 0;">
                  <a href="${siteUrl}/eventi/${evento.slug}"
                     style="background:#FFAD05;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;display:inline-block;">
                    Visualizza il tuo evento →
                  </a>
                </div>
                <p style="font-size:13px;color:#6b7280;">Gestisci tutti i tuoi eventi dalla
                  <a href="${siteUrl}/dashboard" style="color:#FFAD05;">dashboard organizzatori</a>.
                </p>
                <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
                <p style="font-size:12px;color:#9ca3af;margin:0;">
                  moesco — Scopri. Partecipa. Vivi il territorio.
                </p>
              </div>
            </div>
            `
          )
        } else if (nuovoStato === 'rifiutato') {
          await inviaEmail(
            org.email,
            `Aggiornamento sul tuo evento "${evento.titolo}" su moesco`,
            `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1B2653;">
              <div style="background:#1B2653;padding:24px 32px;border-radius:12px 12px 0 0;">
                <h1 style="margin:0;color:#fff;font-size:22px;">Aggiornamento sul tuo evento</h1>
              </div>
              <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
                <p>Ciao <strong>${esc(org.nome)}</strong>,</p>
                <p>abbiamo revisionato il tuo evento <strong>"${esc(evento.titolo)}"</strong> e purtroppo non è stato possibile pubblicarlo.</p>
                ${nota ? `
                <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:12px 16px;border-radius:0 8px 8px 0;margin:16px 0;">
                  <p style="margin:0;font-size:14px;color:#991b1b;"><strong>Motivazione:</strong> ${esc(nota)}</p>
                </div>` : ''}
                <p>Puoi modificare l'evento e ripubblicarlo dalla tua dashboard, oppure contattarci per chiarimenti.</p>
                <div style="margin:24px 0;">
                  <a href="${siteUrl}/dashboard"
                     style="background:#FFAD05;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;display:inline-block;">
                    Vai alla dashboard →
                  </a>
                </div>
                <p style="font-size:13px;color:#6b7280;">
                  Hai domande? Scrivici a
                  <a href="mailto:grassacoppola@gmail.com" style="color:#FFAD05;">grassacoppola@gmail.com</a>
                </p>
                <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
                <p style="font-size:12px;color:#9ca3af;margin:0;">moesco — Scopri. Partecipa. Vivi il territorio.</p>
              </div>
            </div>
            `
          )
        }
      }
    }

    const geoNodo = evento?.geo_nodi as { slug: string } | { slug: string }[] | null
    const geoSlug = Array.isArray(geoNodo) ? geoNodo[0]?.slug : geoNodo?.slug
    ricaricaPagine(evento?.slug, geoSlug)
    return { ok: true }
  } catch (e) {
    return { ok: false, errore: e instanceof Error ? e.message : 'Errore imprevisto' }
  }
}
