'use server'

import { createAdminClient } from '@/lib/supabase/server'

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function slugify(testo: string): string {
  return testo
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
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

export interface EsitoRegistrazione {
  ok: boolean
  errore?: string
}

export async function completaRegistrazione(dati: {
  authUserId: string
  nome: string
  email: string
  telefono?: string
  sitoWeb?: string
  descrizione?: string
}): Promise<EsitoRegistrazione> {
  try {
    const sb = await createAdminClient()

    // Conferma automaticamente l'email (bypassa il flusso di verifica Supabase)
    await sb.auth.admin.updateUserById(dati.authUserId, { email_confirm: true })

    // Cerca se esiste già un organizzatore con questa email (es. aveva già pubblicato un evento)
    const { data: esistente } = await sb
      .from('organizzatori')
      .select('id')
      .eq('email', dati.email)
      .maybeSingle()

    if (esistente) {
      // Collega l'account auth all'organizzatore già esistente
      const { error: updErr } = await sb
        .from('organizzatori')
        .update({
          auth_user_id: dati.authUserId,
          nome: dati.nome,
          telefono: dati.telefono || null,
          sito_web: dati.sitoWeb || null,
          descrizione: dati.descrizione || null,
          stato: 'in_attesa',
        })
        .eq('id', esistente.id)
      if (updErr) return { ok: false, errore: 'Errore nell\'aggiornamento del profilo. Contattaci.' }
    } else {
      // Crea nuovo profilo organizzatore
      const slug = slugify(dati.nome) + '-' + Math.random().toString(36).slice(2, 6)
      const { error: orgError } = await sb.from('organizzatori').insert({
        auth_user_id: dati.authUserId,
        nome: dati.nome,
        slug,
        email: dati.email,
        telefono: dati.telefono || null,
        sito_web: dati.sitoWeb || null,
        descrizione: dati.descrizione || null,
        stato: 'in_attesa',
      })
      if (orgError) return { ok: false, errore: `DB: ${orgError.message}` }
    }

    // ── Email di benvenuto all'organizzatore ──────────────────
    await inviaEmail(
      dati.email,
      'Benvenuto su moesco! La tua richiesta è in fase di revisione',
      `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1B2653;">
        <div style="background:#FFAD05;padding:24px 32px;border-radius:12px 12px 0 0;">
          <h1 style="margin:0;color:#fff;font-size:24px;">Benvenuto su moesco! 🌞</h1>
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
          <p>Ciao <strong>${esc(dati.nome)}</strong>,</p>
          <p>grazie per esserti registrato come organizzatore su <strong>moesco</strong>, il portale degli eventi e delle esperienze nel territorio di Trapani.</p>
          <p>La tua richiesta è stata ricevuta ed è in fase di revisione da parte del nostro team. Riceverai un'email di conferma appena il tuo profilo sarà approvato — di solito entro 24-48 ore.</p>
          <p>Una volta approvato potrai:</p>
          <ul style="line-height:1.8;">
            <li>Pubblicare eventi e attività</li>
            <li>Gestire i tuoi annunci dalla dashboard</li>
            <li>Raggiungere migliaia di turisti e residenti del territorio</li>
          </ul>
          <div style="margin:24px 0;">
            <a href="https://www.moesco.it/dashboard"
               style="background:#FFAD05;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;display:inline-block;">
              Vai alla tua dashboard →
            </a>
          </div>
          <p style="font-size:13px;color:#6b7280;">
            Hai domande? Scrivici a
            <a href="mailto:grassacoppola@gmail.com" style="color:#FFAD05;">grassacoppola@gmail.com</a>
          </p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
          <p style="font-size:12px;color:#9ca3af;margin:0;">
            moesco — Scopri. Partecipa. Vivi il territorio.<br>
            Gestito da Domenico Grassa, Via Roma n. 53, 91014 Castellammare del Golfo (TP)
          </p>
        </div>
      </div>
      `
    )

    // ── Notifica all'admin ────────────────────────────────────
    const adminEmail = process.env.NOTIFICA_EMAIL
    if (adminEmail) {
      await inviaEmail(
        adminEmail,
        `Nuovo organizzatore in attesa: ${dati.nome}`,
        `
        <h2>Nuovo organizzatore da approvare</h2>
        <p><strong>Nome:</strong> ${esc(dati.nome)}</p>
        <p><strong>Email:</strong> ${esc(dati.email)}</p>
        ${dati.telefono ? `<p><strong>Telefono:</strong> ${esc(dati.telefono)}</p>` : ''}
        ${dati.sitoWeb ? `<p><strong>Sito web:</strong> ${esc(dati.sitoWeb)}</p>` : ''}
        ${dati.descrizione ? `<p><strong>Descrizione:</strong> ${esc(dati.descrizione)}</p>` : ''}
        <p><a href="https://www.moesco.it/admin/organizzatori">Apri il pannello organizzatori →</a></p>
        `
      )
    }

    return { ok: true }
  } catch {
    return { ok: false, errore: 'Errore imprevisto. Contattaci.' }
  }
}
