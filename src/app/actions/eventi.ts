'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'

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
