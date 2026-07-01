'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'

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

export async function modificaEventoOrganizzatore(
  eventoId: string,
  dati: {
    titolo: string
    descrizione: string
    descrizione_breve: string
    luogo_nome?: string
    indirizzo?: string
    data_inizio: string
    data_fine?: string
    gratuito: boolean
    prezzo_min?: number | null
    prezzo_max?: number | null
    url_biglietti?: string
    sito_ufficiale?: string
    email_contatto?: string
    telefono_contatto?: string
    geo_nodo_id?: string
    immagine_copertina?: string
    categorie_ids?: string[]
  }
): Promise<{ ok: boolean; errore?: string }> {
  try {
    const { sb, org } = await richiedeOrganizzatore()

    // Verifica che l'evento appartenga a questo organizzatore
    const { data: ev } = await sb
      .from('eventi')
      .select('id, stato')
      .eq('id', eventoId)
      .eq('organizzatore_id', org.id)
      .single()

    if (!ev) return { ok: false, errore: 'Evento non trovato o non di tua proprietà.' }

    const sbAdmin = await createAdminClient()

    const aggiornamento: Record<string, unknown> = {
      titolo: dati.titolo.trim(),
      descrizione: dati.descrizione.trim(),
      descrizione_breve: dati.descrizione_breve.trim().slice(0, 280),
      luogo_nome: dati.luogo_nome?.trim() || null,
      indirizzo: dati.indirizzo?.trim() || null,
      data_inizio: dati.data_inizio,
      data_fine: dati.data_fine || null,
      gratuito: dati.gratuito,
      prezzo_min: dati.gratuito ? null : (dati.prezzo_min ?? null),
      prezzo_max: dati.gratuito ? null : (dati.prezzo_max ?? null),
      url_biglietti: dati.url_biglietti?.trim() || null,
      sito_ufficiale: dati.sito_ufficiale?.trim() || null,
      email_contatto: dati.email_contatto?.trim() || null,
      telefono_contatto: dati.telefono_contatto?.trim() || null,
    }
    if (dati.geo_nodo_id) aggiornamento.geo_nodo_id = dati.geo_nodo_id
    if (dati.immagine_copertina !== undefined) {
      aggiornamento.immagine_copertina = dati.immagine_copertina?.trim() || null
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

    if (dati.categorie_ids !== undefined) {
      await sbAdmin.from('eventi_categorie').delete().eq('evento_id', eventoId)
      if (dati.categorie_ids.length > 0) {
        await sbAdmin.from('eventi_categorie').insert(
          dati.categorie_ids.map(catId => ({ evento_id: eventoId, categoria_id: catId }))
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

  const { error } = await sb
    .from('eventi')
    .update({
      stato: 'approvato',
      pubblicato_il: new Date().toISOString(),
      revisionato_il: new Date().toISOString(),
    })
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
