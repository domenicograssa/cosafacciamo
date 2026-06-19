export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { formatData, formatOra, formatPrezzo } from '@/lib/utils'
import { AzioniEvento } from '@/components/admin/AzioniRevisione'

const BADGE: Record<string, string> = {
  approvato:    'bg-green-100 text-green-700',
  in_revisione: 'bg-amber-100 text-amber-700',
  rifiutato:    'bg-red-100 text-red-700',
  sospeso:      'bg-orange-100 text-orange-700',
  bozza:        'bg-gray-100 text-gray-600',
  scaduto:      'bg-gray-100 text-gray-400',
}

const LABEL: Record<string, string> = {
  approvato: 'Approvato', in_revisione: 'In revisione', rifiutato: 'Rifiutato',
  sospeso: 'Sospeso', bozza: 'Bozza', scaduto: 'Scaduto',
}

export default async function AdminEventoDettaglio({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const sb = await createAdminClient()

  const { data: evento } = await sb
    .from('eventi')
    .select(`
      *,
      geo_nodi(nome),
      organizzatori(id, nome, slug, email, telefono, sito_web, stato),
      categorie:eventi_categorie(categorie(nome, icona))
    `)
    .eq('slug', slug)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!evento) notFound()

  const org = evento.organizzatori as unknown as {
    id: string; nome: string; email: string | null; telefono: string | null
    sito_web: string | null; stato: string
  } | null
  const categorie = ((evento.categorie as unknown as Array<{ categorie: { nome: string; icona: string | null } }>) ?? [])
    .map(c => c.categorie)

  const info: Array<[string, string | null]> = [
    ['Comune', (evento.geo_nodi as unknown as { nome: string } | null)?.nome ?? null],
    ['Luogo', evento.luogo_nome],
    ['Indirizzo', evento.indirizzo],
    ['Inizio', `${formatData(evento.data_inizio)} ${formatOra(evento.data_inizio)}`],
    ['Fine', evento.data_fine ? `${formatData(evento.data_fine)} ${formatOra(evento.data_fine)}` : null],
    ['Prezzo', formatPrezzo(evento.prezzo_min, evento.prezzo_max, evento.gratuito)],
    ['Categorie', categorie.length ? categorie.map(c => `${c.icona ?? ''} ${c.nome}`).join(', ') : null],
    ['Biglietti', evento.url_biglietti],
    ['Sito ufficiale', (evento as Record<string, unknown>).sito_ufficiale as string | null],
    ['Email contatto', (evento as Record<string, unknown>).email_contatto as string | null],
    ['Telefono contatto', (evento as Record<string, unknown>).telefono_contatto as string | null],
    ['Inviato il', evento.created_at ? `${formatData(evento.created_at)} ${formatOra(evento.created_at)}` : null],
  ]

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin" className="hover:text-amber-600">Dashboard</Link>
        <span>›</span>
        <Link href="/admin/eventi" className="hover:text-amber-600">Eventi</Link>
        <span>›</span>
        <span className="text-gray-900 font-medium truncate">{evento.titolo}</span>
      </div>

      {/* Intestazione */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">{evento.titolo}</h1>
            {evento.descrizione_breve && (
              <p className="text-sm text-gray-600 mt-1">{evento.descrizione_breve}</p>
            )}
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 ${BADGE[evento.stato] ?? ''}`}>
            {LABEL[evento.stato] ?? evento.stato}
          </span>
        </div>

        {/* Immagine */}
        {evento.immagine_copertina && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={evento.immagine_copertina}
            alt={evento.titolo}
            className="mt-4 rounded-xl max-h-72 w-full object-cover"
          />
        )}

        {/* Descrizione completa */}
        {evento.descrizione && (
          <p className="text-sm text-gray-700 mt-4 leading-relaxed whitespace-pre-line">{evento.descrizione}</p>
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

      {/* Nota revisione precedente */}
      {evento.note_revisione && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
          <p className="text-xs font-semibold text-red-500 uppercase tracking-wide">Nota di revisione</p>
          <p className="text-sm text-red-800 mt-1">{evento.note_revisione}</p>
        </div>
      )}

      {/* Azioni */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4 gap-4">
          <h2 className="font-bold text-gray-900">Azioni</h2>
          <Link
            href={`/admin/eventi/${slug}/modifica`}
            className="text-xs font-semibold text-amber-600 border border-amber-200 hover:bg-amber-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            ✏️ Modifica evento
          </Link>
        </div>
        <AzioniEvento eventoId={evento.id} stato={evento.stato} />
        <p className="text-xs text-gray-400 mt-4">
          Approvando, l&apos;evento diventa subito visibile sul sito e l&apos;organizzatore in attesa viene approvato automaticamente.
        </p>
      </div>
    </div>
  )
}
