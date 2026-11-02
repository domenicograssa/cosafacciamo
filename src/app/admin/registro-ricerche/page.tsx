export const dynamic = 'force-dynamic'
import { createAdminClient } from '@/lib/supabase/server'

// ─── Registro delle ricerche automatiche ───
// Mostra le ultime esecuzioni di /api/cron/ricerca-eventi salvate in
// ricerche_eventi_log: serve a capire senza i log di Vercel (che durano
// un'ora) se il cron di lun/mer/ven gira, quali comuni ha cercato e cosa ha
// trovato. In alto un riquadro dice se l'ultima esecuzione automatica è recente.

const GIORNI_MOSTRATI = 21
// Il cron gira lun/mer/ven: tra venerdì e lunedì passano 3 giorni. Oltre 4
// giorni senza esecuzioni automatiche qualcosa non va.
const GIORNI_ALLARME = 4

interface Riga {
  id: number
  creato_il: string
  origine: 'cron' | 'manuale'
  esito: 'ok' | 'errore' | 'nessun_comune'
  comune: string | null
  slot: number | null
  motore: string | null
  prova: boolean
  ricerche_web: number | null
  proposti: number | null
  inseriti: number | null
  scartati: number | null
  durata_ms: number | null
  errore: string | null
  dettaglio: {
    proposti?: Array<{ titolo: string; ok?: boolean; slug?: string; errore?: string; data?: string }>
    scartati?: Array<{ titolo: string; motivo: string }>
    note?: string
  } | null
}

const fmtGiorno = (iso: string) => new Date(iso).toLocaleDateString('it-IT', {
  timeZone: 'Europe/Rome', weekday: 'long', day: 'numeric', month: 'long',
})
const fmtOra = (iso: string) => new Date(iso).toLocaleTimeString('it-IT', {
  timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit',
})
const giornoRoma = (iso: string) => new Date(iso).toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' })

// Fuori dal componente: il lint di React vieta Date.now() durante il render.
function giorniFa(giorni: number): string {
  return new Date(Date.now() - giorni * 86400000).toISOString()
}
function giorniDa(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / 86400000
}

function nomeComune(slug: string | null): string {
  if (!slug) return '—'
  return slug.split('-').map(p => (['di', 'del'].includes(p) ? p : p[0].toUpperCase() + p.slice(1))).join(' ')
}

export default async function RegistroRicerchePage() {
  const sb = await createAdminClient()
  const da = giorniFa(GIORNI_MOSTRATI)
  const { data, error } = await sb
    .from('ricerche_eventi_log')
    .select('*')
    .gte('creato_il', da)
    .order('creato_il', { ascending: false })
    .limit(500)

  if (error) {
    const manca = /does not exist|could not find the table/i.test(error.message)
    return (
      <div className="max-w-3xl space-y-3">
        <h1 className="text-2xl font-extrabold text-gray-900">Registro ricerche</h1>
        <p className="text-sm bg-amber-50 text-amber-800 border border-amber-200 rounded-lg px-4 py-3">
          {manca
            ? 'La tabella del registro non è ancora stata creata nel database: va eseguito una volta il file registro-ricerche.sql nel SQL Editor di Supabase.'
            : `Errore nel leggere il registro: ${error.message}`}
        </p>
      </div>
    )
  }

  const righe = (data ?? []) as Riga[]
  const ultimaCron = righe.find(r => r.origine === 'cron')
  const giorniDaUltimaCron = ultimaCron ? giorniDa(ultimaCron.creato_il) : null
  const cronOk = giorniDaUltimaCron != null && giorniDaUltimaCron <= GIORNI_ALLARME

  const perGiorno = new Map<string, Riga[]>()
  for (const r of righe) {
    const g = giornoRoma(r.creato_il)
    perGiorno.set(g, [...(perGiorno.get(g) ?? []), r])
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Registro ricerche</h1>
        <p className="text-sm text-gray-500 mt-1">
          Ogni ricerca automatica di eventi degli ultimi {GIORNI_MOSTRATI} giorni: quella programmata
          (lunedì, mercoledì e venerdì all&apos;alba, un comune all&apos;ora) e quelle lanciate a mano.
        </p>
      </div>

      {/* Stato del cron */}
      <div className={`rounded-2xl border px-5 py-4 ${cronOk ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
        {ultimaCron ? (
          <p className="text-sm">
            {cronOk ? '✅' : '⚠️'} <strong>Ultima ricerca automatica:</strong>{' '}
            <span className="first-letter:uppercase">{fmtGiorno(ultimaCron.creato_il)}</span> alle {fmtOra(ultimaCron.creato_il)}
            {ultimaCron.comune && <> ({nomeComune(ultimaCron.comune)})</>}
            {!cronOk && <> — da più di {GIORNI_ALLARME} giorni non gira: controlla Vercel → Settings → Cron Jobs.</>}
          </p>
        ) : (
          <p className="text-sm">
            ⚠️ <strong>Nessuna ricerca automatica registrata</strong> negli ultimi {GIORNI_MOSTRATI} giorni.
            Se il registro è appena stato attivato, la prima comparirà al prossimo lunedì, mercoledì o venerdì.
          </p>
        )}
      </div>

      {righe.length === 0 && <p className="text-sm text-gray-500">Nessuna ricerca registrata.</p>}

      {[...perGiorno.entries()].map(([giorno, lista]) => {
        const inseriti = lista.reduce((s, r) => s + (r.inseriti ?? 0), 0)
        const errori = lista.filter(r => r.esito === 'errore').length
        return (
          <section key={giorno} className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <header className="px-5 py-3 border-b border-gray-100 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-bold text-gray-900 first-letter:uppercase">{fmtGiorno(lista[0].creato_il)}</h2>
              <p className="text-xs text-gray-500">
                {lista.length} {lista.length === 1 ? 'ricerca' : 'ricerche'} · {inseriti} {inseriti === 1 ? 'evento inserito' : 'eventi inseriti'}
                {errori > 0 && <span className="text-red-600"> · {errori} {errori === 1 ? 'errore' : 'errori'}</span>}
              </p>
            </header>
            <ul className="divide-y divide-gray-50">
              {lista.map(r => (
                <li key={r.id} className="px-5 py-3 text-sm">
                  <details>
                    <summary className="cursor-pointer flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-gray-400 tabular-nums">{fmtOra(r.creato_il)}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.origine === 'cron' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                        {r.origine === 'cron' ? 'automatica' : 'manuale'}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {r.esito === 'nessun_comune' ? 'Nessun comune in questo turno' : nomeComune(r.comune)}
                      </span>
                      {r.esito === 'errore' && <span className="text-red-600 font-semibold">❌ errore</span>}
                      {r.esito === 'ok' && !r.ricerche_web && (
                        <span className="text-amber-700 font-semibold">⚠️ Gemini non ha fatto ricerche</span>
                      )}
                      {r.esito === 'ok' && !!r.ricerche_web && (
                        <span className="text-gray-500">
                          {r.ricerche_web ?? 0} ricerche Google ·{' '}
                          <span className={r.inseriti ? 'text-green-700 font-semibold' : ''}>
                            {r.prova ? `${r.proposti ?? 0} trovati (prova)` : `${r.inseriti ?? 0} inseriti`}
                          </span>
                          {' '}· {r.scartati ?? 0} scartati
                        </span>
                      )}
                    </summary>
                    <div className="mt-2 pl-1 space-y-2 text-xs text-gray-600">
                      {r.errore && <p className="text-red-700">{r.errore}</p>}
                      {r.esito === 'ok' && !r.ricerche_web && (
                        <p className="text-amber-800">
                          Gemini ha risposto senza cercare su Google, quindi per questo comune non è stato trovato nulla.
                          {r.dettaglio?.note && <> Nota del modello: «{r.dettaglio.note}»</>}
                        </p>
                      )}
                      {(r.dettaglio?.proposti?.length ?? 0) > 0 && (
                        <div>
                          <p className="font-semibold text-gray-700">Inseriti in revisione</p>
                          <ul className="list-disc pl-5">
                            {r.dettaglio!.proposti!.map((p, i) => (
                              <li key={i}>{p.titolo}{p.errore && <span className="text-red-600"> — {p.errore}</span>}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {(r.dettaglio?.scartati?.length ?? 0) > 0 && (
                        <div>
                          <p className="font-semibold text-gray-700">Scartati</p>
                          <ul className="list-disc pl-5">
                            {r.dettaglio!.scartati!.map((s, i) => (
                              <li key={i}>{s.titolo} <span className="text-gray-400">— {s.motivo}</span></li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {r.durata_ms != null && <p className="text-gray-400">Durata {Math.round(r.durata_ms / 1000)} s{r.motore && ` · motore ${r.motore}`}</p>}
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
