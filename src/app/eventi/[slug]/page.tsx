import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { getEventoBySlug, getEventiCorrelati } from '@/lib/queries/eventi'
import EventCard from '@/components/events/EventCard'
import EventImagePlaceholder from '@/components/ui/EventImagePlaceholder'
import ShareButtons from '@/components/events/ShareButtons'
import { formatData, formatOra, formatPrezzo } from '@/lib/utils'
import { immagineComune } from '@/data/comuni-immagini'

const SITE_URL = 'https://cosafacciamo.vercel.app'

export const revalidate = 3600

// Pre-builda tutte le pagine evento al deploy → file HTML statici, zero serverless functions
export async function generateStaticParams() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await sb
    .from('eventi')
    .select('slug')
    .eq('stato', 'approvato')
  return (data ?? []).map(e => ({ slug: e.slug }))
}

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const evento = await getEventoBySlug(slug)
  if (!evento) return {}
  return {
    title: `${evento.titolo} — moesco`,
    description: evento.descrizioneBreve ?? undefined,
  }
}

export default async function DettaglioEvento({ params }: Props) {
  const { slug } = await params
  const evento = await getEventoBySlug(slug)
  if (!evento) notFound()

  const categoriaIds = evento.categorie.map(c => c.id)
  const correlati = await getEventiCorrelati(evento.id, categoriaIds)
  const prezzo = formatPrezzo(evento.prezzoMin, evento.prezzoMax, evento.gratuito)
  const fotoCitta = immagineComune(evento.geoNodo.slug)
  const paginaUrl = `${SITE_URL}/eventi/${slug}`

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-amber-600">Home</Link>
        <span>›</span>
        <Link href="/eventi" className="hover:text-amber-600">Eventi</Link>
        <span>›</span>
        <Link href={`/localita/${evento.geoNodo.slug}`} className="hover:text-amber-600">{evento.geoNodo.nome}</Link>
        <span>›</span>
        <span className="text-gray-900 font-medium truncate">{evento.titolo}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* Colonna principale */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100">
            {evento.mediaAssetUrl ? (
              <Image src={evento.mediaAssetUrl} alt={evento.mediaAssetAlt ?? evento.titolo} fill className="object-cover" priority />
            ) : fotoCitta ? (
              <Image src={fotoCitta.url} alt={fotoCitta.alt} fill className="object-cover" priority />
            ) : (
              <EventImagePlaceholder
                categoriaSlug={evento.categorie[0]?.slug}
                categoriaNome={evento.categorie[0]?.nome}
                categoriaColore={evento.categorie[0]?.colore}
              />
            )}
            <div className="absolute top-4 left-4 flex gap-2">
              {evento.categorie.map(cat => (
                <span key={cat.id} className="text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide" style={{ backgroundColor: cat.colore }}>
                  {cat.nome}
                </span>
              ))}
            </div>
          </div>

          {/* Credito immagine (richiesto dalle licenze Creative Commons) */}
          {!evento.mediaAssetUrl && fotoCitta && (
            <p className="text-[11px] text-gray-400 -mt-4">
              Foto:{' '}
              {fotoCitta.creditoUrl ? (
                <a href={fotoCitta.creditoUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 underline">
                  {fotoCitta.credito}
                </a>
              ) : (
                fotoCitta.credito
              )}
            </p>
          )}

          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">{evento.titolo}</h1>
            {evento.descrizioneBreve && (
              <p className="mt-3 text-lg text-gray-600 leading-relaxed">{evento.descrizioneBreve}</p>
            )}
            {evento.descrizione && (
              <div className="mt-4 text-gray-700 leading-relaxed whitespace-pre-line">{evento.descrizione}</div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <InfoRow icon="🗓️" label="Data">
              {formatData(evento.dataInizio, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </InfoRow>
            <InfoRow icon="🕐" label="Orario">
              {formatOra(evento.dataInizio)}{evento.dataFine && ` – ${formatOra(evento.dataFine)}`}
            </InfoRow>
            <InfoRow icon="📍" label="Luogo">
              {evento.luogoNome ?? evento.indirizzo ?? evento.geoNodo.nome}
              {evento.indirizzo && evento.luogoNome && <span className="block text-sm text-gray-500">{evento.indirizzo}</span>}
            </InfoRow>
            <InfoRow icon="🏛️" label="Comune">
              {evento.geoNodo.nome}
            </InfoRow>
            <InfoRow icon="🏷️" label="Prezzo">
              <span className={evento.gratuito ? 'text-green-600 font-bold' : 'font-semibold'}>{prezzo}</span>
            </InfoRow>
            <InfoRow icon="🏢" label="Organizzatore">
              {evento.organizzatore.nome}
            </InfoRow>
            {evento.emailContatto && (
              <InfoRow icon="✉️" label="Email">
                <a href={`mailto:${evento.emailContatto}`} className="text-amber-600 hover:underline">{evento.emailContatto}</a>
              </InfoRow>
            )}
            {evento.telefonoContatto && (
              <InfoRow icon="📞" label="Telefono">
                <a href={`tel:${evento.telefonoContatto}`} className="text-amber-600 hover:underline">{evento.telefonoContatto}</a>
              </InfoRow>
            )}
          </div>

          {/* CTA sito ufficiale + prenotazione */}
          {(evento.sitoUfficiale || evento.urlPrenotazione) && (
            <div className="flex flex-col sm:flex-row gap-3">
              {evento.sitoUfficiale && (
                <a
                  href={evento.sitoUfficiale}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  VISITA IL SITO UFFICIALE
                </a>
              )}
              {evento.urlPrenotazione && (
                <a
                  href={evento.urlPrenotazione}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 border-2 border-amber-400 text-amber-600 hover:bg-amber-50 font-bold py-3 px-6 rounded-xl transition-colors"
                >
                  🎟️ Prenota / Acquista biglietti
                </a>
              )}
            </div>
          )}

          {/* Avviso di non responsabilità */}
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <span className="text-xl shrink-0">⚠️</span>
            <p className="text-sm text-amber-900 leading-relaxed">
              <strong>Avviso:</strong> le informazioni sugli eventi sono fornite dagli organizzatori.{' '}
              <em>moesco</em> non è in alcun modo responsabile per eventuali errori, omissioni
              o cambiamenti dovuti a fattori non prevedibili. Ti invitiamo a verificare eventuali
              variazioni dell&apos;ultima ora visitando il sito ufficiale e i canali social
              dell&apos;organizzatore, i cui riferimenti sono indicati in questa pagina.
            </p>
          </div>

          {evento.lat && evento.lng && (
            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <span className="text-lg">🗺️</span>
                <p className="text-sm font-semibold text-gray-700">Come arrivare</p>
              </div>
              <div className="h-48 bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-4xl">📍</p>
                  <p className="text-sm font-semibold text-gray-700 mt-2">{evento.luogoNome ?? evento.geoNodo.nome}</p>
                  {evento.indirizzo && <p className="text-xs text-gray-500">{evento.indirizzo}</p>}
                  <a href={`https://maps.google.com/?q=${evento.lat},${evento.lng}`} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-xs text-amber-600 font-semibold hover:underline">
                    Apri in Google Maps →
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4 sticky top-24">
            <div className="text-center">
              <p className={`text-2xl font-extrabold ${evento.gratuito ? 'text-green-600' : 'text-gray-900'}`}>{prezzo}</p>
              <p className="text-sm text-gray-500 mt-0.5">
                {formatData(evento.dataInizio, { weekday: 'short', day: 'numeric', month: 'short' })} · {formatOra(evento.dataInizio)}
              </p>
            </div>
            {(evento.urlPrenotazione || evento.urlBiglietti) ? (
              <a
                href={(evento.urlPrenotazione ?? evento.urlBiglietti)!}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center w-full bg-amber-400 hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition-colors"
              >
                🎟️ Prenota / Biglietti
              </a>
            ) : evento.sitoUfficiale ? (
              <a
                href={evento.sitoUfficiale}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center w-full bg-amber-400 hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Info sul sito ufficiale
              </a>
            ) : (
              <p className="text-xs text-center text-gray-400">
                Per informazioni contatta l&apos;organizzatore
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Organizzatore</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-600">
                {evento.organizzatore.nome.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">{evento.organizzatore.nome}</p>
              </div>
            </div>
          </div>

          <ShareButtons titolo={evento.titolo} url={paginaUrl} />
        </div>
      </div>

      {/* ── Sticky bottom bar mobile ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3 shadow-lg">
        <div className="flex-1 min-w-0">
          <p className={`text-lg font-extrabold leading-none ${evento.gratuito ? 'text-green-600' : 'text-gray-900'}`}>{prezzo}</p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{formatData(evento.dataInizio, { day: 'numeric', month: 'short' })} · {formatOra(evento.dataInizio)}</p>
        </div>
        {(evento.urlPrenotazione || evento.urlBiglietti || evento.sitoUfficiale) && (
          <a
            href={(evento.urlPrenotazione ?? evento.urlBiglietti ?? evento.sitoUfficiale)!}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-amber-400 hover:bg-amber-500 text-white font-bold py-3 px-6 rounded-xl transition-colors shrink-0"
          >
            {evento.urlPrenotazione || evento.urlBiglietti ? 'Prenota' : 'Info'}
          </a>
        )}
      </div>

      {/* spazio per la sticky bar su mobile */}
      <div className="lg:hidden h-20" />

      {correlati.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Potrebbe interessarti</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {correlati.map(e => <EventCard key={e.id} evento={e} />)}
          </div>
        </section>
      )}
    </div>
  )
}

function InfoRow({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
      <span className="text-xl shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{label}</p>
        <div className="text-sm font-medium text-gray-900 mt-0.5">{children}</div>
      </div>
    </div>
  )
}
