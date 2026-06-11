import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { formatData, formatOra, formatPrezzo } from '@/lib/utils'
import { AzioniAttivita } from '@/components/admin/AzioniRevisione'

const BADGE: Record<string, string> = {
  pubblicato: 'bg-green-100 text-green-700',
  bozza:      'bg-amber-100 text-amber-700',
  archiviato: 'bg-gray-100 text-gray-500',
}

const LABEL: Record<string, string> = {
  pubblicato: 'Pubblicata',
  bozza:      'Da pubblicare',
  archiviato: 'Archiviata',
}

const LIVELLO: Record<string, string> = {
  facile: 'Facile', medio: 'Medio', esperto: 'Esperto',
}

export default async function AdminAttivitaDettaglio({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const sb = await createAdminClient()

  const { data: attivita } = await sb
    .from('attivita')
    .select(`
      *,
      geo_nodi(nome),
      organizzatori(id, nome, slug, email, telefono, sito_web, stato),
      categorie:attivita_categorie(categorie(nome, icona))
    `)
    .eq('slug', slug)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!attivita) notFound()

  const org = attivita.organizzatori as unknown as {
    id: string; nome: string; email: string | null; telefono: string | null
    sito_web: string | null; stato: string
  } | null
  const categorie = ((attivita.categorie as unknown as Array<{ categorie: { nome: string; icona: string | null } }>) ?? [])
    .map(c => c.categorie)

  const a = attivita as Record<string, unknown>
  const info: Array<[string, string | null]> = [
    ['Comune', (attivita.geo_nodi as unknown as { nome: string } | null)?.nome ?? null],
    ['Quando', attivita.quando],
    ['Durata', attivita.durata],
    ['Livello', attivita.livello ? LIVELLO[attivita.livello] ?? attivita.livello : null],
    ['Adatta a', attivita.target],
    ['Prezzo', formatPrezzo(a.prezzo_min as number | null, a.prezzo_max as number | null, attivita.gratuito)],
    ['Categorie', categorie.length ? categorie.map(c => `${c.icona ?? ''} ${c.nome}`).join(', ') : null],
    ['Prenotazione', a.url_prenotazione as string | null],
    ['Sito ufficiale', a.sito_ufficiale as string | null],
    ['Email contatto', a.email_contatto as string | null],
    ['Telefono contatto', a.telefono_contatto as string | null],
    ['Inviata il', attivita.created_at ? `${formatData(attivita.created_at)} ${formatOra(attivita.created_at)}` : null],
  ]

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin" className="hover:text-amber-600">Dashboard</Link>
        <span>›</span>
        <Link href="/admin/attivita" className="hover:text-amber-600">Attività</Link>
        <span>›</span>
        <span className="text-gray-900 font-medium truncate">{attivita.titolo}</span>
      </div>

      {/* Intestazione */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">{attivita.titolo}</h1>
            {attivita.descrizione_breve && (
              <p className="text-sm text-gray-600 mt-1">{attivita.descrizione_breve}</p>
            )}
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 ${BADGE[attivita.stato] ?? ''}`}>
            {LABEL[attivita.stato] ?? attivita.stato}
          </span>
        </div>

        {/* Immagine */}
        {attivita.immagine_copertina && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={attivita.immagine_copertina}
            alt={attivita.titolo}
            className="mt-4 rounded-xl max-h-72 w-full object-cover"
          />
        )}

        {/* Descrizione completa */}
        {attivita.descrizione && (
          <p className="text-sm text-gray-700 mt-4 leading-relaxed whitespace-pre-line">{attivita.descrizione}</p>
        )}

        {/* Dettagli */}
        <dl className="mt-6 grid sm:grid-cols-2 gap-x-6 gap-y-3">
          {info.filter(([, v]) => v).map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{k}</dt>
              <dd className="text-sm text-gray-800 mt-0.5 break-words">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Organizzatore */}
      {org && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900">Organizzatore</h2>
          <dl className="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-3">
            <div>
              <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Nome</dt>
              <dd className="text-sm text-gray-800 mt-0.5">{org.nome} <span className="text-xs text-gray-400">({org.stato})</span></dd>
            </div>
            {org.email && (
              <div>
                <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Email</dt>
                <dd className="text-sm text-gray-800 mt-0.5 break-words">{org.email}</dd>
              </div>
            )}
            {org.telefono && (
              <div>
                <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Telefono</dt>
                <dd className="text-sm text-gray-800 mt-0.5">{org.telefono}</dd>
              </div>
            )}
            {org.sito_web && (
              <div>
                <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Sito web</dt>
                <dd className="text-sm text-gray-800 mt-0.5 break-words">{org.sito_web}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Azioni */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-4">Azioni</h2>
        <AzioniAttivita attivitaId={attivita.id} stato={attivita.stato} />
        <p className="text-xs text-gray-400 mt-4">
          Pubblicando, l&apos;attività diventa subito visibile sul sito e l&apos;organizzatore in attesa viene approvato automaticamente.
        </p>
      </div>
    </div>
  )
}
