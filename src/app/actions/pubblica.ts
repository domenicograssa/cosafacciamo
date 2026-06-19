'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'

const VERSIONE_DOCUMENTI = '1.0'
const MAX_IMMAGINE_BYTES = 2 * 1024 * 1024 // 2 MB dopo compressione client

// Escape HTML per prevenire XSS nelle email di notifica
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

// Offset di Roma per la data indicata (gestisce ora legale/solare)
function isoRoma(data: string, ora: string): string {
  const probe = new Date(`${data}T12:00:00Z`)
  const parti = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Rome',
    timeZoneName: 'longOffset',
  }).formatToParts(probe)
  const offset = parti.find(p => p.type === 'timeZoneName')?.value.replace('GMT', '') || '+01:00'
  return `${data}T${ora}:00${offset}`
}

export interface EsitoPubblicazione {
  ok: boolean
  errore?: string
}

// Registra le 4 accettazioni obbligatorie con timestamp, IP e versione documento
async function registraConsensi(
  sb: Awaited<ReturnType<typeof createAdminClient>>,
  organizzatoreId: string,
) {
  const h = await headers()
  const ip = (h.get('x-forwarded-for') ?? '').split(',')[0].trim() || h.get('x-real-ip') || 'sconosciuto'
  await sb.from('legal_acceptances').insert([
    { user_id: organizzatoreId, document_type: 'termini_e_condizioni', document_version: VERSIONE_DOCUMENTI, ip_address: ip },
    { user_id: organizzatoreId, document_type: 'condizioni_organizzatori', document_version: VERSIONE_DOCUMENTI, ip_address: ip },
    { user_id: organizzatoreId, document_type: 'privacy_policy', document_version: VERSIONE_DOCUMENTI, ip_address: ip },
    { user_id: organizzatoreId, document_type: 'diritti_contenuti', document_version: VERSIONE_DOCUMENTI, ip_address: ip },
  ])
}

// Invia una mail di avviso al gestore quando arriva un nuovo evento.
// Richiede le variabili d'ambiente RESEND_API_KEY e NOTIFICA_EMAIL su Vercel.
// Se non configurate, non blocca la pubblicazione.
async function notificaGestore(dati: {
  titolo: string
  slugEvento: string
  emailOrg: string
  nomeReferente: string
  dataInizio: string
  immagineUrl: string | null
}) {
  const apiKey = process.env.RESEND_API_KEY
  const destinatario = process.env.NOTIFICA_EMAIL
  if (!apiKey || !destinatario) return
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL ?? 'moesco <onboarding@resend.dev>',
        to: [destinatario],
        subject: `Nuovo evento in revisione: ${dati.titolo}`,
        html: `
          <h2>Nuovo evento da revisionare</h2>
          <p><strong>${esc(dati.titolo)}</strong> — data inizio: ${esc(dati.dataInizio)}</p>
          <p>Inviato da: ${esc(dati.nomeReferente)} (${esc(dati.emailOrg)})</p>
          ${dati.immagineUrl ? `<p><img src="${esc(dati.immagineUrl)}" width="400" alt="Immagine evento" /></p>` : '<p>Nessuna immagine caricata.</p>'}
          <p><a href="https://www.moesco.it/admin/eventi">Apri il pannello di amministrazione</a></p>
        `,
      }),
    })
  } catch {
    // La notifica non deve mai bloccare la pubblicazione
  }
}

export async function pubblicaEvento(fd: FormData): Promise<EsitoPubblicazione> {
  try {
    const campo = (k: string) => String(fd.get(k) ?? '').trim()

    // ── Validazione minima lato server ──
    const nome = campo('nome'), cognome = campo('cognome')
    const emailOrg = campo('emailOrg'), telefonoOrg = campo('telefonoOrg')
    const comuneOrgId = campo('comuneOrgId')
    const titolo = campo('titolo'), descrizione = campo('descrizione')
    const comuneId = campo('comuneId')
    const dataInizio = campo('dataInizio'), oraInizio = campo('oraInizio')

    const tipoContenuto = campo('tipo') || 'evento'
    if (!nome || !cognome || !emailOrg || !telefonoOrg || !comuneOrgId)
      return { ok: false, errore: 'Compila tutti i dati obbligatori dell\'organizzatore.' }
    if (!titolo || !descrizione || !comuneId)
      return { ok: false, errore: 'Compila tutti i dati obbligatori.' }
    if (tipoContenuto === 'evento' && (!dataInizio || !oraInizio))
      return { ok: false, errore: 'Indica data e ora di inizio dell\'evento.' }
    if (fd.get('accettaTermini') !== 'true' || fd.get('accettaPrivacy') !== 'true' || fd.get('accettaDiritti') !== 'true')
      return { ok: false, errore: 'Tutte e tre le dichiarazioni sono obbligatorie.' }

    const sb = await createAdminClient()

    // ── Organizzatore: riusa per email, altrimenti crea in attesa ──
    let organizzatoreId: string
    const { data: esistente } = await sb
      .from('organizzatori').select('id').eq('email', emailOrg).maybeSingle()

    if (esistente) {
      organizzatoreId = esistente.id
    } else {
      const denominazione = campo('denominazione')
      const nomeOrg = denominazione || `${nome} ${cognome}`
      let slugOrg = slugify(nomeOrg)
      const { data: slugOccupato } = await sb
        .from('organizzatori').select('id').eq('slug', slugOrg).maybeSingle()
      if (slugOccupato) slugOrg = `${slugOrg}-${Date.now().toString(36)}`

      const { data: nuovo, error: errOrg } = await sb
        .from('organizzatori')
        .insert({
          nome: nomeOrg,
          slug: slugOrg,
          email: emailOrg,
          telefono: telefonoOrg,
          sito_web: campo('sitoWeb') || null,
          stato: 'in_attesa',
          note_interne: `Referente: ${nome} ${cognome} — comune geo_nodo_id: ${comuneOrgId}`,
        })
        .select('id').single()
      if (errOrg || !nuovo) return { ok: false, errore: 'Errore nella registrazione dell\'organizzatore.' }
      organizzatoreId = nuovo.id
    }

    // ── Immagine (facoltativa): upload su Supabase Storage ──
    let immagineUrl: string | null = null
    const file = fd.get('immagine')
    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_IMMAGINE_BYTES)
        return { ok: false, errore: 'L\'immagine supera la dimensione massima di 2 MB.' }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
        return { ok: false, errore: 'Formato immagine non supportato (usa JPG, PNG o WebP).' }

      const percorso = `eventi/${slugify(titolo)}-${Date.now().toString(36)}.jpg`
      const buffer = Buffer.from(await file.arrayBuffer())
      const { error: errUp } = await sb.storage
        .from('eventi-immagini')
        .upload(percorso, buffer, { contentType: 'image/jpeg', upsert: false })
      if (errUp) return { ok: false, errore: 'Errore nel caricamento dell\'immagine. Riprova.' }
      const { data: pub } = sb.storage.from('eventi-immagini').getPublicUrl(percorso)
      immagineUrl = pub.publicUrl
    }

    // ── Esperienza (attività permanente) oppure evento ──
    const tipo = campo('tipo') || 'evento'
    const gratuito = fd.get('gratuito') === 'true'

    if (tipo === 'esperienza') {
      let slugAtt = slugify(titolo)
      const inserisciAttivita = async (slug: string) =>
        sb.from('attivita').insert({
          organizzatore_id: organizzatoreId,
          geo_nodo_id: comuneId,
          titolo,
          slug,
          descrizione,
          descrizione_breve: descrizione.slice(0, 280),
          immagine_copertina: immagineUrl,
          quando: campo('quando') || null,
          durata: campo('durata') || null,
          livello: campo('livello') || null,
          gratuito,
          prezzo_min: !gratuito && campo('prezzoMin') ? Number(campo('prezzoMin')) : null,
          prezzo_max: !gratuito && campo('prezzoMax') ? Number(campo('prezzoMax')) : null,
          sito_ufficiale: campo('sitoUfficiale') || null,
          email_contatto: campo('emailContatto') || null,
          telefono_contatto: campo('telefonoContatto') || null,
          url_prenotazione: campo('urlBiglietti') || null,
          stato: 'bozza', // in revisione: l'admin la pubblica
        }).select('id').single()

      let { data: att, error: errAtt } = await inserisciAttivita(slugAtt)
      if (errAtt?.code === '23505') {
        slugAtt = `${slugAtt}-${Date.now().toString(36)}`
        ;({ data: att, error: errAtt } = await inserisciAttivita(slugAtt))
      }
      if (errAtt || !att) return { ok: false, errore: 'Errore nel salvataggio dell\'esperienza. Riprova.' }

      const catSlugs = String(fd.get('categorie') ?? '').split(',').filter(Boolean)
      if (catSlugs.length > 0) {
        const { data: cats } = await sb.from('categorie').select('id').in('slug', catSlugs)
        if (cats?.length) {
          await sb.from('attivita_categorie').insert(cats.map(c => ({ attivita_id: att.id, categoria_id: c.id })))
        }
      }

      await registraConsensi(sb, organizzatoreId)
      await notificaGestore({
        titolo: `[Esperienza] ${titolo}`, slugEvento: slugAtt, emailOrg,
        nomeReferente: `${nome} ${cognome}`, dataInizio: campo('quando') || 'permanente', immagineUrl,
      })
      revalidatePath('/cosa-fare')
      return { ok: true }
    }

    // ── Evento in revisione ──
    const dataFine = campo('dataFine'), oraFine = campo('oraFine')
    let slugEvento = `${slugify(titolo)}-${new Date(dataInizio).getFullYear()}`

    const inserisciEvento = async (slug: string) =>
      sb.from('eventi').insert({
        organizzatore_id: organizzatoreId,
        geo_nodo_id: comuneId,
        titolo,
        slug,
        descrizione,
        descrizione_breve: descrizione.slice(0, 280),
        immagine_copertina: immagineUrl,
        luogo_nome: campo('luogoNome') || null,
        indirizzo: campo('indirizzo') || null,
        data_inizio: isoRoma(dataInizio, oraInizio),
        data_fine: dataFine ? isoRoma(dataFine, oraFine || '23:59') : null,
        gratuito,
        prezzo_min: !gratuito && campo('prezzoMin') ? Number(campo('prezzoMin')) : null,
        prezzo_max: !gratuito && campo('prezzoMax') ? Number(campo('prezzoMax')) : null,
        url_biglietti: campo('urlBiglietti') || null,
        sito_ufficiale: campo('sitoUfficiale') || null,
        email_contatto: campo('emailContatto') || null,
        telefono_contatto: campo('telefonoContatto') || null,
        stato: 'in_revisione',
      }).select('id').single()

    let { data: evento, error: errEvento } = await inserisciEvento(slugEvento)
    if (errEvento?.code === '23505') {
      slugEvento = `${slugEvento}-${Date.now().toString(36)}`
      ;({ data: evento, error: errEvento } = await inserisciEvento(slugEvento))
    }
    if (errEvento || !evento) return { ok: false, errore: 'Errore nel salvataggio dell\'evento. Riprova.' }

    // ── Categorie ──
    const categorieSlugs = String(fd.get('categorie') ?? '').split(',').filter(Boolean)
    if (categorieSlugs.length > 0) {
      const { data: cats } = await sb.from('categorie').select('id').in('slug', categorieSlugs)
      if (cats?.length) {
        await sb.from('eventi_categorie').insert(cats.map(c => ({ evento_id: evento.id, categoria_id: c.id })))
      }
    }

    // ── Log accettazioni (GDPR): timestamp, IP, versione documento ──
    await registraConsensi(sb, organizzatoreId)

    // ── Notifica email al gestore del portale (se configurata) ──
    await notificaGestore({
      titolo, slugEvento, emailOrg, nomeReferente: `${nome} ${cognome}`,
      dataInizio, immagineUrl,
    })

    revalidatePath('/admin/eventi')
    revalidatePath('/admin')
    return { ok: true }
  } catch {
    return { ok: false, errore: 'Errore imprevisto. Riprova tra qualche istante.' }
  }
}
