'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { traduciEvento } from '@/lib/traduzione'

// Recupera l'organizzatore associato all'utente loggato (o lancia errore)
async function richiedeOrganizzatore() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) throw new Error('Non autorizzato: effettua il login.')

  const { data: org } = await sb
    .from('organizzatori')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!org) throw new Error('Profilo organizzatore non trovato.')
  return { sb, org }
}

const MAX_IMMAGINE_BYTES = 2 * 1024 * 1024 // 2 MB dopo compressione client

function slugifyNomeFile(testo: string): string {
  return testo
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export async function modificaEventoOrganizzatore(
  eventoId: string,
  fd: FormData
): Promise<{ ok: boolean; errore?: string }> {
  try {
    const { sb, org } = await richiedeOrganizzatore()

    // Verifica che l'evento appartenga a questo organizzatore
    const { data: ev } = await sb
      .from('eventi')
      .select('id, stato, titolo')
      .eq('id', eventoId)
      .eq('organizzatore_id', org.id)
      .single()

    if (!ev) return { ok: false, errore: 'Evento non trovato o non di tua proprietà.' }

    const sbAdmin = await createAdminClient()

    const campo = (k: string) => String(fd.get(k) ?? '').trim()
    const gratuito = fd.get('gratuito') === 'true'
    const titolo = campo('titolo')
    const descrizione = campo('descrizione')

    const aggiornamento: Record<string, unknown> = {
      titolo: titolo.trim(),
      descrizione: descrizione.trim(),
      descrizione_breve: descrizione.trim().slice(0, 280),
      luogo_nome: campo('luogo_nome') || null,
      indirizzo: campo('indirizzo') || null,
      data_inizio: campo('data_inizio'),
      data_fine: campo('data_fine') || null,
      gratuito,
      prezzo_min: gratuito ? null : (campo('prezzo_min') ? Number(campo('prezzo_min')) : null),
      prezzo_max: gratuito ? null : (campo('prezzo_max') ? Number(campo('prezzo_max')) : null),
      url_biglietti: campo('url_biglietti') || null,
      sito_ufficiale: campo('sito_ufficiale') || null,
      email_contatto: campo('email_contatto') || null,
      telefono_contatto: campo('telefono_contatto') || null,
    }
    if (campo('geo_nodo_id')) aggiornamento.geo_nodo_id = campo('geo_nodo_id')

    // ── Immagine: nuovo upload, rimozione esplicita, oppure lasciata invariata ──
    const file = fd.get('immagine')
    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_IMMAGINE_BYTES)
        return { ok: false, errore: 'L\'immagine supera la dimensione massima di 2 MB.' }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
        return { ok: false, errore: 'Formato immagine non supportato (usa JPG, PNG o WebP).' }

      const percorso = `eventi/${slugifyNomeFile(titolo || ev.titolo)}-${Date.now().toString(36)}.jpg`
      const buffer = Buffer.from(await file.arrayBuffer())
      const { error: errUp } = await sbAdmin.storage
        .from('eventi-immagini')
        .upload(percorso, buffer, { contentType: 'image/jpeg', upsert: false })
      if (errUp) return { ok: false, errore: 'Errore nel caricamento dell\'immagine. Riprova.' }
      const { data: pub } = sbAdmin.storage.from('eventi-immagini').getPublicUrl(percorso)
      aggiornamento.immagine_copertina = pub.publicUrl
    } else if (fd.get('rimuovi_immagine') === 'true') {
      aggiornamento.immagine_copertina = null
    }

    // Se l'evento era approvato, torna in revisione dopo la modifica
    if (ev.stato === 'approvato') aggiornamento.stato = 'in_revisione'

    const { data: eventoAgg, error } = await sbAdmin
      .from('eventi')
      .update(aggiornamento)
      .eq('id', eventoId)
      .select('slug, geo_nodi(slug)')
      .single()
    if (error) return { ok: false, errore: error.message }

    const categorieRaw = fd.get('categorie_ids')
    if (categorieRaw !== null) {
      const categorieIds = String(categorieRaw).split(',').filter(Boolean)
      await sbAdmin.from('eventi_categorie').delete().eq('evento_id', eventoId)
      if (categorieIds.length > 0) {
        await sbAdmin.from('eventi_categorie').insert(
          categorieIds.map(catId => ({ evento_id: eventoId, categoria_id: catId }))
        )
      }
    }

    revalidatePath('/dashboard/miei-eventi')
    revalidatePath('/')
    revalidatePath('/eventi')
    // La pagina di dettaglio evento (e quella della località) usano ISR:
    // vanno invalidate esplicitamente o la modifica non si vede per un'ora.
    if (eventoAgg?.slug) revalidatePath(`/eventi/${eventoAgg.slug}`)
    const geoNodo = eventoAgg?.geo_nodi as { slug: string } | { slug: string }[] | null
    const geoSlug = Array.isArray(geoNodo) ? geoNodo[0]?.slug : geoNodo?.slug
    if (geoSlug) revalidatePath(`/localita/${geoSlug}`)
    return { ok: true }
  } catch (e) {
    return { ok: false, errore: e instanceof Error ? e.message : 'Errore imprevisto' }
  }
}

export async function eliminaEventoOrganizzatore(
  eventoId: string
): Promise<{ ok: boolean; errore?: string }> {
  try {
    const { sb, org } = await richiedeOrganizzatore()

    // Verifica che l'evento appartenga a questo organizzatore
    const { data: ev } = await sb
      .from('eventi')
      .select('id')
      .eq('id', eventoId)
      .eq('organizzatore_id', org.id)
      .single()

    if (!ev) return { ok: false, errore: 'Evento non trovato o non di tua proprietà.' }

    const sbAdmin = await createAdminClient()

    // Elimina prima le categorie collegate
    await sbAdmin.from('eventi_categorie').delete().eq('evento_id', eventoId)

    const { error } = await sbAdmin.from('eventi').delete().eq('id', eventoId)
    if (error) return { ok: false, errore: error.message }

    revalidatePath('/dashboard/miei-eventi')
    revalidatePath('/')
    revalidatePath('/eventi')
    return { ok: true }
  } catch (e) {
    return { ok: false, errore: e instanceof Error ? e.message : 'Errore imprevisto' }
  }
}

void redirect // usato indirettamente

// Verifica che chi chiama sia l'admin (utente loggato con email admin).
// Le server action devono proteggere se stesse indipendentemente dal middleware.
async function richiedeAdmin() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  const adminEmail = process.env.ADMIN_EMAIL
  if (!user) throw new Error('Non autorizzato: effettua il login.')
  if (adminEmail && user.email !== adminEmail) throw new Error('Non autorizzato: accesso riservato all\'admin.')
  return user
}

export async function approvaEvento(eventoId: string) {
  await richiedeAdmin()
  const sb = await createAdminClient()

  const aggiornamento: Record<string, unknown> = {
    stato: 'approvato',
    pubblicato_il: new Date().toISOString(),
    revisionato_il: new Date().toISOString(),
  }

  // Traduzione automatica IT -> EN alla pubblicazione (solo se non è già
  // presente, per non richiamare l'API ad ogni riapprovazione).
  const { data: evento } = await sb
    .from('eventi')
    .select('titolo, descrizione, descrizione_breve, luogo_nome, titolo_en')
    .eq('id', eventoId)
    .single()

  if (evento && !evento.titolo_en) {
    const traduzione = await traduciEvento({
      titolo: evento.titolo,
      descrizione: evento.descrizione,
      descrizioneBreve: evento.descrizione_breve,
      luogoNome: evento.luogo_nome,
    })
    if (traduzione) Object.assign(aggiornamento, traduzione)
  }

  const { error } = await sb
    .from('eventi')
    .update(aggiornamento)
    .eq('id', eventoId)

  if (error) throw new Error(`Errore approvazione: ${error.message}`)

  revalidatePath('/admin/eventi')
  revalidatePath('/admin')
  revalidatePath('/eventi')
  revalidatePath('/')
}

export async function rifiutaEvento(eventoId: string, nota: string) {
  await richiedeAdmin()
  if (!nota.trim()) throw new Error('La nota è obbligatoria per il rifiuto.')

  const sb = await createAdminClient()

  const { error } = await sb
    .from('eventi')
    .update({
      stato: 'rifiutato',
      note_revisione: nota,
      revisionato_il: new Date().toISOString(),
    })
    .eq('id', eventoId)

  if (error) throw new Error(`Errore rifiuto: ${error.message}`)

  revalidatePath('/admin/eventi')
  revalidatePath('/admin')
}

export async function sospendiEvento(eventoId: string) {
  await richiedeAdmin()
  const sb = await createAdminClient()

  const { error } = await sb
    .from('eventi')
    .update({ stato: 'sospeso' })
    .eq('id', eventoId)

  if (error) throw new Error(`Errore sospensione: ${error.message}`)

  revalidatePath('/admin/eventi')
  revalidatePath('/eventi')
  revalidatePath('/')
}

export async function pubblicaEventoDaForm(formData: {
  organizzatoreId: string
  geoNodoId: string
  titolo: string
  slug: string
  descrizione: string
  descrizioneBreve: string
  categorieIds: string[]
  luogoNome: string
  indirizzo: string
  dataInizio: string
  dataFine?: string
  gratuito: boolean
  prezzoMin?: number
  prezzoMax?: number
  urlBiglietti?: string
}) {
  await richiedeAdmin()
  const sb = await createAdminClient()

  const { data: evento, error: erroreEvento } = await sb
    .from('eventi')
    .insert({
      organizzatore_id: formData.organizzatoreId,
      geo_nodo_id: formData.geoNodoId,
      titolo: formData.titolo,
      slug: formData.slug,
      descrizione: formData.descrizione,
      descrizione_breve: formData.descrizioneBreve,
      luogo_nome: formData.luogoNome,
      indirizzo: formData.indirizzo,
      data_inizio: formData.dataInizio,
      data_fine: formData.dataFine ?? null,
      gratuito: formData.gratuito,
      prezzo_min: formData.prezzoMin ?? null,
      prezzo_max: formData.prezzoMax ?? null,
      url_biglietti: formData.urlBiglietti ?? null,
      stato: 'in_revisione',
    })
    .select('id')
    .single()

  if (erroreEvento || !evento) throw new Error(`Errore creazione evento: ${erroreEvento?.message}`)

  if (formData.categorieIds.length > 0) {
    const { error: erroreCategorie } = await sb
      .from('eventi_categorie')
      .insert(formData.categorieIds.map(catId => ({
        evento_id: evento.id,
        categoria_id: catId,
      })))

    if (erroreCategorie) throw new Error(`Errore categorie: ${erroreCategorie.message}`)
  }

  revalidatePath('/admin')
  revalidatePath('/admin/eventi')

  return evento.id
}

// Traduce in blocco tutti gli eventi approvati che non hanno ancora una
// versione inglese (titolo_en vuoto) — utile come backfill una tantum dopo
// l'introduzione della traduzione automatica, o per recuperare eventuali
// traduzioni saltate per errore API. Ritorna un riepilogo dei risultati.
export async function traduciEventiMancanti(): Promise<{
  totale: number
  tradotti: number
  falliti: string[]
}> {
  await richiedeAdmin()
  const sb = await createAdminClient()

  const { data: eventi, error } = await sb
    .from('eventi')
    .select('id, titolo, descrizione, descrizione_breve, luogo_nome')
    .eq('stato', 'approvato')
    .is('titolo_en', null)

  if (error) throw new Error(`Errore recupero eventi: ${error.message}`)
  if (!eventi || eventi.length === 0) return { totale: 0, tradotti: 0, falliti: [] }

  let tradotti = 0
  const falliti: string[] = []

  for (const evento of eventi) {
    const traduzione = await traduciEvento({
      titolo: evento.titolo,
      descrizione: evento.descrizione,
      descrizioneBreve: evento.descrizione_breve,
      luogoNome: evento.luogo_nome,
    })

    if (!traduzione) {
      falliti.push(evento.titolo)
      continue
    }

    const { error: erroreUpdate } = await sb
      .from('eventi')
      .update(traduzione)
      .eq('id', evento.id)

    if (erroreUpdate) falliti.push(evento.titolo)
    else tradotti++
  }

  revalidatePath('/admin/eventi')
  revalidatePath('/eventi')
  revalidatePath('/')

  return { totale: eventi.length, tradotti, falliti }
}
