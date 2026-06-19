export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardHome() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()

  const { data: organizzatore } = await sb
    .from('organizzatori')
    .select('id, nome, email, telefono, sito_web, descrizione, stato')
    .eq('auth_user_id', user!.id)
    .single()

  if (!organizzatore) return null

  const { data: eventi, count } = await sb
    .from('eventi')
    .select('id, titolo, stato, data_inizio', { count: 'exact' })
    .eq('organizzatore_id', organizzatore.id)
    .order('data_inizio', { ascending: false })
    .limit(5)

  const totali = count ?? 0
  const approvati  = (eventi ?? []).filter(e => e.stato === 'approvato').length
  const inRevisione = (eventi ?? []).filter(e => e.stato === 'in_revisione').length

  return (
    <div className="space-y-8">

      {/* Avviso account in attesa */}
      {organizzatore.stato === 'in_attesa' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
          <span className="text-2xl shrink-0">⏳</span>
          <div>
            <p className="font-semibold text-amber-900">Account in fase di approvazione</p>
            <p className="text-sm text-amber-800 mt-0.5">
              Il tuo profilo è in attesa di revisione da parte dell&apos;amministratore. Puoi già inserire eventi, ma
              saranno pubblicati solo dopo l&apos;approvazione del tuo account.
            </p>
          </div>
        </div>
      )}

      {/* Benvenuto */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Ciao, {organizzatore.nome} 👋</h1>
        <p className="text-gray-500 text-sm mt-1">Ecco un riepilogo della tua attività su moesco.</p>
      </div>

      {/* Statistiche */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard label="Totale eventi" value={totali} href="/dashboard/miei-eventi" />
        <StatCard label="Pubblicati" value={approvati} colore="text-green-600" href="/dashboard/miei-eventi" />
        <StatCard label="In revisione" value={inRevisione} colore="text-amber-600" href="/dashboard/miei-eventi" />
      </div>

      {/* Ultimi eventi */}
      {eventi && eventi.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Ultimi eventi</h2>
            <Link href="/dashboard/miei-eventi" className="text-xs text-amber-600 font-semibold hover:underline">
              Vedi tutti →
            </Link>
          </div>
          <ul className="divide-y divide-gray-50">
            {eventi.map(ev => (
              <li key={ev.id} className="px-5 py-3 flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-gray-900 truncate">{ev.titolo}</span>
                <StatoBadge stato={ev.stato} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Azioni rapide */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/pubblica"
          className="flex items-center gap-3 bg-amber-400 hover:bg-amber-500 text-white font-bold px-5 py-4 rounded-2xl transition-colors"
        >
          <span className="text-2xl">➕</span>
          <div>
            <p className="font-bold">Pubblica nuovo evento</p>
            <p className="text-xs font-normal opacity-90">Il team lo revisionerà prima della pubblicazione</p>
          </div>
        </Link>
        <Link
          href="/dashboard/miei-eventi"
          className="flex items-center gap-3 bg-white border border-gray-200 hover:border-amber-300 text-gray-700 font-semibold px-5 py-4 rounded-2xl transition-colors"
        >
          <span className="text-2xl">📋</span>
          <div>
            <p className="font-semibold">I miei eventi</p>
            <p className="text-xs font-normal text-gray-500">Visualizza e gestisci tutti i tuoi eventi</p>
          </div>
        </Link>
      </div>

      {/* Profilo */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
        <h2 className="font-semibold text-gray-900">Il tuo profilo</h2>
        <dl className="grid sm:grid-cols-2 gap-3 text-sm">
          <InfoProfilo label="Email" value={organizzatore.email} />
          {organizzatore.telefono && <InfoProfilo label="Telefono" value={organizzatore.telefono} />}
          {organizzatore.sito_web && <InfoProfilo label="Sito web" value={organizzatore.sito_web} href={organizzatore.sito_web} />}
          {organizzatore.descrizione && (
            <div className="sm:col-span-2">
              <dt className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Descrizione</dt>
              <dd className="text-gray-700 mt-0.5">{organizzatore.descrizione}</dd>
            </div>
          )}
        </dl>
        <p className="text-xs text-gray-400">
          Per modificare il profilo scrivi a{' '}
          <a href="mailto:grassacoppola@gmail.com" className="text-amber-600 hover:underline">grassacoppola@gmail.com</a>
        </p>
      </div>
    </div>
  )
}

function StatCard({ label, value, colore = 'text-gray-900', href }: {
  label: string; value: number; colore?: string; href: string
}) {
  return (
    <Link href={href} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:border-amber-200 transition-colors">
      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-extrabold mt-1 ${colore}`}>{value}</p>
    </Link>
  )
}

function InfoProfilo({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{label}</dt>
      <dd className="text-gray-700 mt-0.5">
        {href
          ? <a href={href} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">{value}</a>
          : value
        }
      </dd>
    </div>
  )
}

function StatoBadge({ stato }: { stato: string }) {
  const cfg: Record<string, { label: string; cls: string }> = {
    approvato:    { label: 'Pubblicato', cls: 'bg-green-100 text-green-700' },
    in_revisione: { label: 'In revisione', cls: 'bg-amber-100 text-amber-700' },
    bozza:        { label: 'Bozza', cls: 'bg-gray-100 text-gray-500' },
    rifiutato:    { label: 'Rifiutato', cls: 'bg-red-100 text-red-700' },
    sospeso:      { label: 'Sospeso', cls: 'bg-orange-100 text-orange-700' },
  }
  const { label, cls } = cfg[stato] ?? { label: stato, cls: 'bg-gray-100 text-gray-500' }
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${cls}`}>{label}</span>
}
