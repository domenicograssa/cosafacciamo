import Link from 'next/link'
import { EVENTI_ADMIN_MOCK, ORGANIZZATORI_MOCK } from '@/data/mock-admin'
import { formatData, formatOra } from '@/lib/utils'

export default function AdminDashboard() {
  const inRevisione   = EVENTI_ADMIN_MOCK.filter(e => e.stato === 'in_revisione')
  const approvati     = EVENTI_ADMIN_MOCK.filter(e => e.stato === 'approvato')
  const rifiutati     = EVENTI_ADMIN_MOCK.filter(e => e.stato === 'rifiutato')
  const orgInAttesa   = ORGANIZZATORI_MOCK.filter(o => o.stato === 'in_attesa')
  const orgApprovati  = ORGANIZZATORI_MOCK.filter(o => o.stato === 'approvato')

  const kpi = [
    { label: 'In revisione',        valore: inRevisione.length,  colore: 'bg-amber-50 text-amber-700 border-amber-200',  icon: '🔍', href: '/admin/eventi?stato=in_revisione' },
    { label: 'Approvati',           valore: approvati.length,    colore: 'bg-green-50 text-green-700 border-green-200',  icon: '✅', href: '/admin/eventi?stato=approvato' },
    { label: 'Rifiutati',           valore: rifiutati.length,    colore: 'bg-red-50 text-red-700 border-red-200',        icon: '❌', href: '/admin/eventi?stato=rifiutato' },
    { label: 'Organizzatori',       valore: orgApprovati.length, colore: 'bg-blue-50 text-blue-700 border-blue-200',     icon: '👤', href: '/admin/organizzatori' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          {new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpi.map(k => (
          <Link
            key={k.label}
            href={k.href}
            className={`rounded-2xl border p-5 hover:shadow-md transition-shadow ${k.colore}`}
          >
            <div className="text-3xl mb-2">{k.icon}</div>
            <p className="text-3xl font-extrabold">{k.valore}</p>
            <p className="text-sm font-medium mt-0.5 opacity-80">{k.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Revisioni urgenti */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <span>🔍</span> Da revisionare
              {inRevisione.length > 0 && (
                <span className="ml-1 bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {inRevisione.length}
                </span>
              )}
            </h2>
            <Link href="/admin/eventi?stato=in_revisione" className="text-xs text-amber-600 font-semibold hover:underline">
              Vedi tutti
            </Link>
          </div>

          {inRevisione.length === 0 ? (
            <div className="px-5 py-10 text-center text-gray-400 text-sm">
              Nessun evento in attesa 🎉
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {inRevisione.map(e => (
                <li key={e.id}>
                  <Link
                    href={`/admin/eventi/${e.slug}`}
                    className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl shrink-0">
                      {e.categorie[0]?.icona ?? '🎉'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{e.titolo}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {e.geoNodo.nome} · {formatData(e.dataInizio)} {formatOra(e.dataInizio)}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">da: {e.organizzatore.nome}</p>
                    </div>
                    <svg className="w-4 h-4 text-gray-300 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Organizzatori in attesa */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <span>👤</span> Organizzatori in attesa
              {orgInAttesa.length > 0 && (
                <span className="ml-1 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {orgInAttesa.length}
                </span>
              )}
            </h2>
            <Link href="/admin/organizzatori" className="text-xs text-amber-600 font-semibold hover:underline">
              Vedi tutti
            </Link>
          </div>

          {orgInAttesa.length === 0 ? (
            <div className="px-5 py-10 text-center text-gray-400 text-sm">Nessuno in attesa 🎉</div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {orgInAttesa.map(org => (
                <li key={org.id}>
                  <Link
                    href={`/admin/organizzatori`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 shrink-0">
                      {org.nome.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{org.nome}</p>
                      <p className="text-xs text-gray-500">{org.email}</p>
                    </div>
                    <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-1 rounded-full shrink-0">
                      In attesa
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Ultimi approvati */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">✅ Ultimi eventi approvati</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Evento</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Comune</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Data</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Categoria</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {approvati.slice(0, 5).map(e => (
                <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-900 max-w-xs truncate">{e.titolo}</td>
                  <td className="px-5 py-3.5 text-gray-600">{e.geoNodo.nome}</td>
                  <td className="px-5 py-3.5 text-gray-600">{formatData(e.dataInizio)}</td>
                  <td className="px-5 py-3.5">
                    {e.categorie[0] && (
                      <span
                        className="text-white text-xs font-semibold px-2 py-1 rounded-full"
                        style={{ backgroundColor: e.categorie[0].colore }}
                      >
                        {e.categorie[0].nome}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/eventi/${e.slug}`} className="text-amber-600 hover:underline text-xs font-semibold">
                      Dettaglio →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
