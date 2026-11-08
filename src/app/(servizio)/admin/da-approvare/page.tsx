export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { risolviOrarioEvento } from '@/lib/utils'
import { similarita } from '@/lib/ricerca-eventi/similarita'
import SchedaDaApprovare, { type EventoDaApprovare } from '@/components/admin/SchedaDaApprovare'

// ─── Coda di approvazione semplificata ───
// Tutti gli eventi 'in_revisione' in un'unica pagina, uno per scheda, con le
// informazioni utili a decidere (data, luogo, fonte, descrizione) e i bottoni
// Approva / Rifiuta subito sotto: niente passaggio dalla pagina di dettaglio.
// Ogni scheda segnala anche i possibili doppioni già presenti nello stesso
// comune (titolo simile, data entro 3 giorni) e gli eventi già passati.

const GIORNI_DOPPIONE = 3

interface Riga {
  id: string
  slug: string
  titolo: string
  stato: string
  data_inizio: string
  data_fine: string | null
  ora_inizio?: string | null
  tutto_il_giorno: boolean | null
  luogo_nome: string | null
  indirizzo: string | null
  gratuito: boolean | null
  prezzo_min: number | null
  prezzo_max: number | null
  descrizione: string | null
  descrizione_breve: string | null
  fonte_ricerca: string | null
  sito_ufficiale: string | null
  geo_nodo_id: string | null
  created_at: string
  geo_nodi: { nome: string } | null
  organizzatori: { nome: string } | null
  categorie: Array<{ categorie: { nome: string } | null }> | null
}

function giaPassato(data: string): boolean {
  return new Date(data).getTime() < Date.now()
}

function giorniTra(a: string, b: string): number {
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) / 86400000
}

export default async function DaApprovarePage() {
  const sb = await createAdminClient()

  const { data, error } = await sb
    .from('eventi')
    .select('id, slug, titolo, stato, data_inizio, data_fine, ora_inizio, tutto_il_giorno, luogo_nome, indirizzo, gratuito, prezzo_min, prezzo_max, descrizione, descrizione_breve, fonte_ricerca, sito_ufficiale, geo_nodo_id, created_at, geo_nodi(nome), organizzatori(nome), categorie:eventi_categorie(categorie(nome))')
    .eq('stato', 'in_revisione')
    .order('data_inizio', { ascending: true })
  if (error) console.error('DaApprovarePage:', error)
  const righe = (data ?? []) as unknown as Riga[]

  // Eventi già pubblicati (o anch'essi in revisione) negli stessi comuni, per
  // segnalare i possibili doppioni.
  const comuni = [...new Set(righe.map(r => r.geo_nodo_id).filter((id): id is string => !!id))]
  const { data: altriRaw } = comuni.length
    ? await sb
        .from('eventi')
        .select('id, slug, titolo, stato, data_inizio, geo_nodo_id')
        .in('geo_nodo_id', comuni)
        .in('stato', ['approvato', 'in_revisione'])
    : { data: [] }
  const altri = (altriRaw ?? []) as Array<{ id: string; slug: string; titolo: string; stato: string; data_inizio: string; geo_nodo_id: string }>

  const eventi: EventoDaApprovare[] = righe.map(r => {
    const { dataInizio, dataFine } = risolviOrarioEvento(r.data_inizio, r.data_fine, r.ora_inizio)
    const doppioni = altri
      .filter(a => a.id !== r.id && a.geo_nodo_id === r.geo_nodo_id)
      .filter(a => {
        const sim = similarita(r.titolo, a.titolo)
        return sim >= 0.8 || (sim >= 0.5 && giorniTra(a.data_inizio, r.data_inizio) <= GIORNI_DOPPIONE)
      })
      .map(a => ({ titolo: a.titolo, slug: a.slug, approvato: a.stato === 'approvato' }))
    return {
      id: r.id,
      slug: r.slug,
      titolo: r.titolo,
      comune: r.geo_nodi?.nome ?? null,
      luogo: r.luogo_nome,
      indirizzo: r.indirizzo,
      dataInizio,
      dataFine,
      tuttoIlGiorno: !!r.tutto_il_giorno,
      gratuito: !!r.gratuito,
      prezzoMin: r.prezzo_min,
      prezzoMax: r.prezzo_max,
      descrizioneBreve: r.descrizione_breve,
      descrizione: r.descrizione,
      fonte: r.fonte_ricerca || r.sito_ufficiale,
      daRicercaAutomatica: !!r.fonte_ricerca,
      organizzatore: r.organizzatori?.nome ?? null,
      categorie: (r.categorie ?? []).map(c => c.categorie?.nome).filter((n): n is string => !!n),
      passato: giaPassato(dataFine ?? dataInizio),
      doppioni,
    }
  })

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Da approvare</h1>
        <p className="text-sm text-gray-500 mt-1">
          {eventi.length === 0
            ? 'Nessun evento in attesa. 🎉'
            : `${eventi.length} ${eventi.length === 1 ? 'evento' : 'eventi'} in attesa, dal più vicino nel tempo.`}
          {' '}Approvando, l&apos;evento compare subito sul sito.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Vista completa con filtri: <Link href="/admin/eventi?stato=in_revisione" className="underline hover:text-amber-600">Eventi → In revisione</Link>
        </p>
      </div>

      {eventi.map(e => <SchedaDaApprovare key={e.id} evento={e} />)}
    </div>
  )
}
