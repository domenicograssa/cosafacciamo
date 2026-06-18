import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatData, formatOra } from '@/lib/utils'

export default async function MieiEventi() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()

  const { data: organizzatore } = await sb
    .from('organizzatori')
    .select('id, nome')
    .eq('auth_user_id', user!.id)
    .single()

  if (!organizzatore) return null

  const { data: eventi } = await sb
    .from('eventi')
    .select('id, titolo, slug, stato, data_inizio, data_fine, gratuito, note_revisione, luogo_nome')
    .eq('organizzatore_id', organizzatore.id)
    .order('data_inizio', { ascending: false })

  const totale = eventi?.length ?? 0

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">I miei eventi</h1>
          <p className="text-gray-500 text-sm mt-0.5">{totale} eventi totali</p>
        </div>
        <Link
          href="/pubblica"
          className="bg-amber-400 hover:bg-amber-500 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors"
        >
          + Nuovo evento
        </Link>
      </div>

      {!eventi || eventi.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-4xl mb-3">📅</p>
          <p className="font-semibold text-gray-700">Nessun evento ancora</p>
          <p className="text-sm text-gray-500 mt-1 mb-4">Pubblica il tuo primo evento su moesco!</p>
          <Link
            href="/pubblica"
            className="inline-block bg-amber-400 hover:bg-amber-500 text-white font-bold px-6 py-3 rounded-xl transition-colors"
          >
            Pubblica evento
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <ul className="divide-y divide-gray-50">
            {eventi.map(ev => (
              <li key={ev.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 truncate">{ev.titolo}</p>
                      <StatoBadge stato={ev.stato} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      📅 {formatData(ev.data_inizio, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      {' '}· ⏰ {formatOra(ev.data_inizio)}
                      {ev.luogo_nome && ` · 📍 ${ev.luogo_nome}`}
                    </p>
                    {ev.stato === 'rifiutato' && ev.note_revisione && (
                      <p className="text-xs text-red-600 mt-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                        <strong>Motivo rifiuto:</strong> {ev.note_revisione}
                      </p>
                    )}
                  </div>
                  {ev.stato === 'approvato' && (
                    <Link
                      href={`/eventi/${ev.slug}`}
                      target="_blank"
                      className="text-xs text-amber-600 font-semibold hover:underline shrink-0"
                    >
                      Vedi →
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">
        Hai domande sui tuoi eventi? Scrivici a{' '}
        <a href="mailto:grassacoppola@gmail.com" className="text-amber-600 hover:underline">grassacoppola@gmail.com</a>
      </p>
    </div>
  )
}

function StatoBadge({ stato }: { stato: string }) {
  const cfg: Record<string, { label: string; cls: string }> = {
    approvato:    { label: '✅ Pubblicato', cls: 'bg-green-100 text-green-700' },
    in_revisione: { label: '⏳ In revisione', cls: 'bg-amber-100 text-amber-700' },
    bozza:        { label: '📝 Bozza', cls: 'bg-gray-100 text-gray-500' },
    rifiutato:    { label: '❌ Rifiutato', cls: 'bg-red-100 text-red-700' },
    sospeso:      { label: '⏸ Sospeso', cls: 'bg-orange-100 text-orange-700' },
  }
  const { label, cls } = cfg[stato] ?? { label: stato, cls: 'bg-gray-100 text-gray-500' }
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${cls}`}>{label}</span>
}
