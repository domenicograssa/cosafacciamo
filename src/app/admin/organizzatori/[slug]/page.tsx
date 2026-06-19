import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { formatData, formatOra } from '@/lib/utils'
import { AzioniOrganizzatore } from '@/components/admin/AzioniRevisione'
import FormModificaOrganizzatore from '@/components/admin/FormModificaOrganizzatore'

const BADGE: Record<string, string> = {
  approvato: 'bg-green-100 text-green-700',
  in_attesa: 'bg-amber-100 text-amber-700',
  sospeso:   'bg-orange-100 text-orange-700',
  rifiutato: 'bg-red-100 text-red-700',
}
const LABEL: Record<string, string> = {
  approvato: 'Approvato',
  in_attesa: 'In attesa',
  sospeso:   'Sospeso',
  rifiutato: 'Rifiutato',
}

const BADGE_EV: Record<string, string> = {
  approvato:    'bg-green-100 text-green-700',
  in_revisione: 'bg-amber-100 text-amber-700',
  rifiutato:    'bg-red-100 text-red-700',
  sospeso:      'bg-orange-100 text-orange-700',
  bozza:        'bg-gray-100 text-gray-500',
  scaduto:      'bg-gray-100 text-gray-400',
}
const LABEL_EV: Record<string, string> = {
  approvato: 'Approvato', in_revisione: 'In revisione', rifiutato: 'Rifiutato',
  sospeso: 'Sospeso', bozza: 'Bozza', scaduto: 'Scaduto',
}

export default async function AdminOrganizzatoreDettaglio({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const sb = await createAdminClient()

  const { data: org } = await sb
    .from('organizzatori')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (!org) notFound()

  // Carica gli eventi di questo organizzatore
  const { data: eventi } = await sb
    .from('eventi')
    .select('id, titolo, slug, stato, data_inizio, created_at')
    .eq('organizzatore_id', org.id)
    .order('data_inizio', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin" className="hover:text-amber-600">Dashboard</Link>
        <span>›</span>
        <Link href="/admin/organizzatori" className="hover:text-amber-600">Organizzatori</Link>
        <span>›</span>
        <span className="text-gray-900 font-medium truncate">{org.nome}</span>
      </div>

      {/* Intestazione */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">{org.nome}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{org.email}</p>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 ${BADGE[org.stato] ?? ''}`}>
            {LABEL[org.stato] ?? org.stato}
          </span>
        </div>

        <dl className="mt-5 grid sm:grid-cols-2 gap-x-6 gap-y-3">
          {org.telefono && (
            <div>
              <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Telefono</dt>
              <dd className="text-sm text-gray-800 mt-0.5">{org.telefono}</dd>
            </div>
          )}
          {org.sito_web && (
            <div>
              <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Sito web</dt>
              <dd className="text-sm text-gray-800 mt-0.5 break-words">
                <a href={org.sito_web} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">
                  {org.sito_web}
                </a>
              </dd>
            </div>
          )}
          {org.descrizione && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Descrizione</dt>
              <dd className="text-sm text-gray-800 mt-0.5 whitespace-pre-line">{org.descrizione}</dd>
            </div>
          )}
          {org.note_interne && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Note interne</dt>
              <dd className="text-sm text-amber-800 mt-0.5 bg-amber-50 rounded-lg px-3 py-2">{org.note_interne}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Registrato il</dt>
            <dd className="text-sm text-gray-800 mt-0.5">{formatData(org.created_at)}</dd>
          </div>
          {org.approvato_il && (
            <div>
              <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Approvato il</dt>
              <dd className="text-sm text-gray-800 mt-0.5">{formatData(org.approvato_il)}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Azioni stato */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-4">Stato organizzatore</h2>
        <AzioniOrganizzatore organizzatoreId={org.id} stato={org.stato} />
      </div>

      {/* Form modifica */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-5">Modifica dati</h2>
        <FormModificaOrganizzatore organizzatore={{
          id: org.id,
          nome: org.nome,
          email: org.email,
          telefono: org.telefono,
          sito_web: org.sito_web,
          descrizione: org.descrizione,
          note_interne: org.note_interne,
        }} />
      </div>

      {/* Eventi dell'organizzatore */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-4">
          Eventi ({eventi?.length ?? 0})
        </h2>
        {!eventi || eventi.length === 0 ? (
          <p className="text-sm text-gray-400">Nessun evento pubblicato da questo organizzatore.</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {eventi.map(ev => (
              <li key={ev.id} className="py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/admin/eventi/${ev.slug}`}
                    className="text-sm font-semibold text-gray-900 hover:text-amber-600 truncate block"
                  >
                    {ev.titolo}
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatData(ev.data_inizio)} {formatOra(ev.data_inizio)}
                    {' · '}inviato il {formatData(ev.created_at)}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0 ${BADGE_EV[ev.stato] ?? ''}`}>
                  {LABEL_EV[ev.stato] ?? ev.stato}
                </span>
                <Link
                  href={`/admin/eventi/${ev.slug}`}
                  className="text-xs text-amber-600 hover:underline shrink-0"
                >
                  Apri →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  )
}
