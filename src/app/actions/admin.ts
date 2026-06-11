'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// Verifica che chi chiama l'azione sia loggato come admin (Supabase Auth).
// Le pagine /admin sono protette dal middleware, ma le server action
// vanno protette anche qui: senza login non si modifica nulla.
async function richiedeLogin() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) throw new Error('Non autorizzato: effettua il login.')
  return user
}

function ricaricaPagine() {
  revalidatePath('/')
  revalidatePath('/eventi')
  revalidatePath('/cosa-fare')
  revalidatePath('/admin')
  revalidatePath('/admin/eventi')
  revalidatePath('/admin/attivita')
  revalidatePath('/admin/organizzatori')
}

export async function aggiornaStatoEvento(
  eventoId: string,
  nuovoStato: 'approvato' | 'rifiutato' | 'sospeso',
  nota?: string
): Promise<{ ok: boolean; errore?: string }> {
  try {
    await richiedeLogin()
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
      .select('organizzatore_id')
      .single()

    if (error) return { ok: false, errore: error.message }

    // Quando approvi un evento, l'organizzatore in attesa diventa approvato
    if (nuovoStato === 'approvato' && evento?.organizzatore_id) {
      await sb
        .from('organizzatori')
        .update({ stato: 'approvato' })
        .eq('id', evento.organizzatore_id)
        .eq('stato', 'in_attesa')
    }

    ricaricaPagine()
    return { ok: true }
  } catch (e) {
    return { ok: false, errore: e instanceof Error ? e.message : 'Errore imprevisto' }
  }
}

export async function aggiornaStatoAttivita(
  attivitaId: string,
  nuovoStato: 'pubblicato' | 'archiviato'
): Promise<{ ok: boolean; errore?: string }> {
  try {
    await richiedeLogin()
    const sb = await createAdminClient()

    const { data: attivita, error } = await sb
      .from('attivita')
      .update({ stato: nuovoStato })
      .eq('id', attivitaId)
      .select('organizzatore_id')
      .single()

    if (error) return { ok: false, errore: error.message }

    if (nuovoStato === 'pubblicato' && attivita?.organizzatore_id) {
      await sb
        .from('organizzatori')
        .update({ stato: 'approvato' })
        .eq('id', attivita.organizzatore_id)
        .eq('stato', 'in_attesa')
    }

    ricaricaPagine()
    return { ok: true }
  } catch (e) {
    return { ok: false, errore: e instanceof Error ? e.message : 'Errore imprevisto' }
  }
}

export async function aggiornaStatoOrganizzatore(
  organizzatoreId: string,
  nuovoStato: 'approvato' | 'sospeso' | 'rifiutato'
): Promise<{ ok: boolean; errore?: string }> {
  try {
    await richiedeLogin()
    const sb = await createAdminClient()

    const { error } = await sb
      .from('organizzatori')
      .update({ stato: nuovoStato })
      .eq('id', organizzatoreId)

    if (error) return { ok: false, errore: error.message }

    ricaricaPagine()
    return { ok: true }
  } catch (e) {
    return { ok: false, errore: e instanceof Error ? e.message : 'Errore imprevisto' }
  }
}
