import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { formatData, formatOra } from '@/lib/utils'

export default async function AdminDashboard() {
  const sb = await createAdminClient()

  const [
    { count: inRevisione },
    { count: approvati },
    { count: rifiutati },
    { count: attivitaBozza },
    { count: orgInAttesa },
    { data: daRevisionare },
    { data: attivitaDaPubblicare },
  ] = await Promise.all([
    sb.from('eventi').select('id', { count: 'exact', head: true }).eq('stato', 'in_revisione'),
    sb.from('eventi').select('id', { count: 'exact', head: true }).eq('stato', 'approvato'),
    sb.from('eventi').select('id', { count: 'exact', head: true }).eq('stato', 'rifiutato'),
    sb.from('attivita').select('id', { count: 'exact', head: true }).eq('stato', 'bozza'),
    sb.from('organizzatori').select('id', { count: 'exact', head: true }).eq('stato', 'in_attesa'),
    sb.from('eventi')
      .select('id, slug, titolo, data_inizio, created_at, geo_nodi(nome), organizzatori(nome)')
      .eq('stato', 'in_revisione')
      .order('created_at', { ascending: false })
      .limit(8),
    sb.from('attivita')
      .select('id, slug, titolo, created_at, geo_nodi(nome), organizzatori(nome)')
      .eq('stato', 'bozza')
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  const kpi = [
    { label: 'Eventi in revisione', valore: inRevisione ?? 0,  colore: 'bg-amber-50 text-amber-700 border-amber-200', icon: '🔍', href: '/admin/eventi?stato=in_revisione' },
    { label: 'Eventi approvati',    valore: approvati ?? 0,    colore: 'bg-green-50 text-green-700 border-green-200', icon: '✅', href: '/admin/eventi?stato=approvato' },
    { label: 'Eventi rifiutati',    valore: rifiutati ?? 0,    colore: 'bg-red-50 text-red-700 border-red-200',       icon: '❌', href: '/admin/eventi?stato=rifiutato' },
    { label: 'Attività da pubblicare', valore: attivitaBozza ?? 0, colore: 'bg-blue-50 text-blue-700 border-blue-200', icon: '🤿', href: '/admin/attivita' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          {new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Rome' })}
          {(orgInAttesa ?? 0) > 0 && (
            <> · <Link href="/admin/organizzatori" className="text-amber-600 font-semibold hover:underline">{orgInAttesa} organizzator{orgInAttesa === 1 ? 'e' : 'i'} in attesa</Link></>
          )}
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpi.map(k => (
          <Link key={k.label} href={k.href} className={`rounded-2xl border p-5 hover:shadow-md transition-shadow ${k.colore}`}>
            <div className="text-3xl mb-2">{k.icon}</div>
            <p className="text-3xl font-extrabold">{k.valore}</p>
            <p className="text-sm font-medium mt-0.5 opacity-80">{k.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Eventi da revisionare */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <span>🔍</span> Eventi da revisionare
              {(daRevisionare?.length ?? 0) > 0 && (
                <span className="ml-1 bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">{daRevisionare!.length}</span>
              )}
            </h2>
            <Link href="/admin/eventi?stato=in_revisione" className="text-xs text-amber-600 font-semibold hover:underline">Vedi tutti</Link>
          </div>
          {!daRevisionare?.length ? (
            <div className="px-5 py-10 text-center text-gray-400 text-sm">Nessun evento in attesa 🎉</div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {daRevisionare.map(e => (
                <li key={e.id}>
                  <Link href={`/admin/eventi/${e.slug}`} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl shrink-0">🎉</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{e.titolo}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {(e.geo_nodi as unknown as { nome: string } | null)?.nome} · {formatData(e.data_inizio)} {formatOra(e.data_inizio)}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">da: {(e.organizzatori as unknown as { nome: string } | null)?.nome}</p>
                    </div>
                    <span className="text-gray-300 shrink-0 mt-1">›</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Attività da pubblicare */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <span>🤿</span> Attività da pubblicare
              {(attivitaDaPubblicare?.length ?? 0) > 0 && (
                <span className="ml-1 bg-blue-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">{attivitaDaPubblicare!.length}</span>
              )}
            </h2>
            <Link href="/admin/attivita" className="text-xs text-amber-600 font-semibold hover:underline">Vedi tutte</Link>
          </div>
          {!attivitaDaPubblicare?.length ? (
            <div className="px-5 py-10 text-center text-gray-400 text-sm">Nessuna attività in attesa 🎉</div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {attivitaDaPubblicare.map(a => (
                <li key={a.id} className="flex items-start gap-4 px-5 py-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-xl shrink-0">🤿</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{a.titolo}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{(a.geo_nodi as unknown as { nome: string } | null)?.nome}</p>
                    <p className="text-xs text-gray-400 mt-0.5">da: {(a.organizzatori as unknown as { nome: string } | null)?.nome ?? '—'}</p>
                  </div>
                  <Link href="/admin/attivita" className="text-xs text-amber-600 font-semibold hover:underline shrink-0 mt-1">Gestisci →</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
