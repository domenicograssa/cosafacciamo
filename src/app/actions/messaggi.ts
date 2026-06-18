'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const TIPI_VALIDI = ['messaggio', 'segnalazione', 'richiesta_gdpr', 'collaborazione']
const MAX_MESSAGGIO = 4000

// Escape HTML per prevenire XSS nelle email
function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export interface EsitoMessaggio {
  ok: boolean
  errore?: string
}

// Invia una mail di avviso al gestore quando arriva un nuovo messaggio.
// Richiede RESEND_API_KEY e NOTIFICA_EMAIL su Vercel; se mancano, salta.
async function notificaGestore(dati: {
  nome: string
  email: string
  tipo: string
  oggetto: string
  messaggio: string
}) {
  const apiKey = process.env.RESEND_API_KEY
  const destinatario = process.env.NOTIFICA_EMAIL
  if (!apiKey || !destinatario) return
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'moesco <onboarding@resend.dev>',
        to: [destinatario],
        reply_to: dati.email,
        subject: `Nuovo messaggio dal sito: ${dati.oggetto || dati.tipo}`,
        html: `
          <h2>Nuovo messaggio dal modulo contatti</h2>
          <p><strong>Da:</strong> ${esc(dati.nome)} (${esc(dati.email)})</p>
          <p><strong>Tipo:</strong> ${esc(dati.tipo)}</p>
          ${dati.oggetto ? `<p><strong>Oggetto:</strong> ${esc(dati.oggetto)}</p>` : ''}
          <p style="white-space:pre-line;border-left:3px solid #f59e0b;padding-left:12px;">${esc(dati.messaggio)}</p>
          <p><a href="https://cosafacciamo.vercel.app/admin/messaggi">Apri il pannello messaggi</a></p>
        `,
      }),
    })
  } catch {
    // La notifica non deve mai bloccare l'invio
  }
}

// Azione pubblica: salva il messaggio di un visitatore
export async function inviaMessaggio(fd: FormData): Promise<EsitoMessaggio> {
  try {
    const campo = (k: string) => String(fd.get(k) ?? '').trim()

    // Honeypot anti-spam: campo invisibile che gli umani non compilano
    if (campo('sitoweb')) return { ok: true }

    const nome = campo('nome')
    const email = campo('email')
    const tipo = TIPI_VALIDI.includes(campo('tipo')) ? campo('tipo') : 'messaggio'
    const oggetto = campo('oggetto').slice(0, 200)
    const messaggio = campo('messaggio')
    const urlPagina = campo('urlPagina').slice(0, 500)

    if (!nome || !email || !messaggio)
      return { ok: false, errore: 'Compila nome, email e messaggio.' }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return { ok: false, errore: 'Inserisci un indirizzo email valido.' }
    if (messaggio.length > MAX_MESSAGGIO)
      return { ok: false, errore: `Il messaggio supera i ${MAX_MESSAGGIO} caratteri.` }
    if (fd.get('accettaPrivacy') !== 'true')
      return { ok: false, errore: 'Devi accettare l\'informativa privacy per inviare il messaggio.' }

    const h = await headers()
    const ip = (h.get('x-forwarded-for') ?? '').split(',')[0].trim() || h.get('x-real-ip') || null

    const sb = await createAdminClient()
    const { error } = await sb.from('messaggi').insert({
      nome: nome.slice(0, 200),
      email: email.slice(0, 200),
      tipo,
      oggetto: oggetto || null,
      messaggio,
      url_pagina: urlPagina || null,
      ip_address: ip,
    })
    if (error) {
      console.error('inviaMessaggio insert:', error)
      return { ok: false, errore: `Errore nell'invio del messaggio: ${error.message ?? 'errore database'}` }
    }

    await notificaGestore({ nome, email, tipo, oggetto, messaggio })
    revalidatePath('/admin/messaggi')
    return { ok: true }
  } catch {
    return { ok: false, errore: 'Errore imprevisto. Riprova tra qualche istante.' }
  }
}

// Azione admin: cambia lo stato di un messaggio (letto / archiviato / nuovo)
export async function aggiornaStatoMessaggio(
  messaggioId: string,
  nuovoStato: 'nuovo' | 'letto' | 'archiviato'
): Promise<EsitoMessaggio> {
  try {
    // Auth check admin: solo l'admin può modificare lo stato dei messaggi
    const sbAuth = await createClient()
    const { data: { user } } = await sbAuth.auth.getUser()
    const adminEmail = process.env.ADMIN_EMAIL
    if (!user) return { ok: false, errore: 'Non autorizzato: effettua il login.' }
    if (adminEmail && user.email !== adminEmail) return { ok: false, errore: 'Non autorizzato.' }

    const sb = await createAdminClient()
    const { error } = await sb
      .from('messaggi')
      .update({ stato: nuovoStato })
      .eq('id', messaggioId)
    if (error) return { ok: false, errore: error.message }

    revalidatePath('/admin/messaggi')
    revalidatePath('/admin')
    return { ok: true }
  } catch (e) {
    return { ok: false, errore: e instanceof Error ? e.message : 'Errore imprevisto' }
  }
}
