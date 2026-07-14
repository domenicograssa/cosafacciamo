export const dynamic = 'force-dynamic'
import { createAdminClient } from '@/lib/supabase/server'
import GestioneInEvidenza from '@/components/admin/GestioneInEvidenza'

export default async function InEvidenzaAdminPage() {
  const sb = await createAdminClient()

  const oggi = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' })
  const inizioOggi = `${oggi}T00:00:00`
  const adesso = new Date().toISOString()

  // Pulizia: i pin manuali scadono dopo 2 giorni (vedi app/actions/admin.ts).
  // Li spegniamo qui così il toggle in questa pagina riflette sempre lo stato
  // reale — la homepage pubblica li ignora comunque già tramite il filtro in
  // getEventiInEvidenza, indipendentemente da questa pulizia.
  await sb
    .from('eventi')
    .update({ in_evidenza: false, in_evidenza_scade_il: null })
    .eq('in_evidenza', true)
    .lt('in_evidenza_scade_il', adesso)

  const { data } = await sb
    .from('eventi')
    .select('id, slug, titolo, data_inizio, data_fine, in_evidenza, in_evidenza_scade_il, testo_articolo, descrizione, geo_nodi(nome, slug)')
    .eq('stato', 'approvato')
    .or(`data_inizio.gte.${inizioOggi},data_fine.gte.${inizioOggi}`)
    .order('data_inizio', { ascending: true })

  const eventi = (data ?? []) as unknown as {
    id: string
    slug: string
    titolo: string
    data_inizio: string
    data_fine: string | null
    in_evidenza: boolean
    in_evidenza_scade_il: string | null
    testo_articolo: string | null
    descrizione: string | null
    geo_nodi: { nome: string; slug: string } | null
  }[]

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <a href="/admin" className="hover:text-amber-600">Dashboard</a>
          <span>›</span>
          <span className="text-gray-900 font-medium">In primo piano</span>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">In primo piano</h1>
        <p className="text-sm text-gray-500 mt-1">
          Scegli quali eventi mettere in evidenza nella sezione &quot;In primo piano&quot; della homepage.
          Gli eventi selezionati hanno la priorità sui 3 posti disponibili; i posti restanti si riempiono
          da soli con i prossimi eventi in programma. Ogni scelta manuale dura 2 giorni, poi scade in
          automatico e il posto torna a riempirsi da solo — puoi rimetterla in evidenza in qualsiasi
          momento per rinnovarla.
        </p>
      </div>

      <GestioneInEvidenza eventi={eventi} />
    </div>
  )
}
