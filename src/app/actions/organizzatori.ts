'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'

export async function approvaOrganizzatore(organizzatoreId: string) {
  const sb = await createAdminClient()

  const { error } = await sb
    .from('organizzatori')
    .update({
      stato: 'approvato',
      approvato_il: new Date().toISOString(),
    })
    .eq('id', organizzatoreId)

  if (error) throw new Error(`Errore approvazione: ${error.message}`)

  revalidatePath('/admin/organizzatori')
  revalidatePath('/admin')
}

export async function rifiutaOrganizzatore(organizzatoreId: string) {
  const sb = await createAdminClient()

  const { error } = await sb
    .from('organizzatori')
    .update({ stato: 'rifiutato' })
    .eq('id', organizzatoreId)

  if (error) throw new Error(`Errore rifiuto: ${error.message}`)

  revalidatePath('/admin/organizzatori')
}

export async function sospendiOrganizzatore(organizzatoreId: string) {
  const sb = await createAdminClient()

  const { error } = await sb
    .from('organizzatori')
    .update({ stato: 'sospeso' })
    .eq('id', organizzatoreId)

  if (error) throw new Error(`Errore sospensione: ${error.message}`)

  // Sospendi anche tutti gli eventi approvati dell'organizzatore
  await sb
    .from('eventi')
    .update({ stato: 'sospeso' })
    .eq('organizzatore_id', organizzatoreId)
    .eq('stato', 'approvato')

  revalidatePath('/admin/organizzatori')
  revalidatePath('/admin/eventi')
  revalidatePath('/eventi')
}

export async function registraOrganizzatore(data: {
  nome: string
  slug: string
  email: string
  telefono?: string
  sitoWeb?: string
}) {
  const sb = await createAdminClient()

  const { data: org, error } = await sb
    .from('organizzatori')
    .insert({
      nome: data.nome,
      slug: data.slug,
      email: data.email,
      telefono: data.telefono ?? null,
      sito_web: data.sitoWeb ?? null,
      stato: 'in_attesa',
    })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') throw new Error('Email già registrata.')
    throw new Error(`Errore registrazione: ${error.message}`)
  }

  revalidatePath('/admin/organizzatori')
  return org.id
}
