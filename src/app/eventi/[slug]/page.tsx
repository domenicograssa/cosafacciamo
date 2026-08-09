import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { getEventoBySlug, getEventiCorrelati } from '@/lib/queries/eventi'
import EventCard from '@/components/events/EventCard'
import ImmagineEvento from '@/components/ui/ImmagineEvento'
import ShareButtons from '@/components/events/ShareButtons'
import { formatData, formatOra, formatPrezzo, eMultiGiorno, eInCorso, formatIntervalloData } from '@/lib/utils'
import { fotoComunePerEvento } from '@/data/comuni-immagini'
import { getLang } from '@/lib/i18n/getLang'
import { strings, nomeCategoria } from '@/lib/i18n/strings'

const SITE_URL = 'https://www.moesco.it'

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
  const lang = await getLang()
  const evento = await getEventoBySlug(slug, lang)
  if (!evento) return {}

  const canonicalUrl = lang === 'en' ? `${SITE_URL}/en/eventi/${slug}` : `${SITE_URL}/eventi/${slug}`
  const ogImage = evento.mediaAssetUrl ?? null
  const descrizioneFallback = lang === 'en'
    ? `${evento.titolo} in ${evento.geoNodo.nome}. Find all the details on moesco.`
    : `${evento.titolo} a ${evento.geoNodo.nome}. Scopri tutti i dettagli su moesco.`

  return {
    title: `${evento.titolo} — ${evento.geoNodo.nome}`,
    description: evento.descrizioneBreve ?? descrizioneFallback,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'it': `${SITE_URL}/eventi/${slug}`,
        'en': `${SITE_URL}/en/eventi/${slug}`,
      },
    },
    openGraph: {
      title: `${evento.titolo} — ${evento.geoNodo.nome}`,
      description: evento.descrizioneBreve ?? descrizioneFallback,
      url: canonicalUrl,
      type: 'article',
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630, alt: evento.titolo }] } : {}),
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title: `${evento.titolo} — ${evento.geoNodo.nome}`,
      description: evento.descrizioneBreve ?? undefined,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  }
}

export default async function DettaglioEvento({ params }: Props) {
  const { slug } = await params
  const lang = await getLang()
  const t = strings[lang]
  const evento = await getEventoBySlug(slug, lang)
  if (!evento) notFound()

  const categoriaIds = evento.categorie.map(c => c.id)
  const correlati = await getEventiCorrelati(evento.id, categoriaIds, 4, lang)
  const prezzo = formatPrezzo(evento.prezzoMin, evento.prezzoMax, evento.gratuito, evento.prezzoTesto, lang)
  const fotoCitta = fotoComunePerEvento(evento.geoNodo.slug, evento.id)
  const fontiImmagine = [
    ...(evento.mediaAssetUrl ? [{ url: evento.mediaAssetUrl, alt: evento.mediaAssetAlt ?? evento.titolo }] : []),
    ...(fotoCitta ? [{ url: fotoCitta.url, alt: fotoCitta.alt }] : []),
  ]
  const paginaUrl = lang === 'en' ? `${SITE_URL}/en/eventi/${slug}` : `${SITE_URL}/eventi/${slug}`

  // Eventi/rassegne "multi-giorno" (es. cartelloni stagionali) non hanno un
  // orario secco: mostriamo un intervallo di date, o "in corso · fino al..."
  // se sono già iniziati, invece di data_inizio + orario (che senza un vero
  // ora_inizio salvato mostrerebbe sempre un fuorviante "02:00").
  const multiGiorno = eMultiGiorno(evento.dataInizio, evento.dataFine)
  const inCorso = multiGiorno && eInCorso(evento.dataInizio, evento.dataFine)
  const etichettaData = inCorso
    ? `${t.card.ongoing} · ${t.card.until} ${formatData(evento.dataFine!, { day: 'numeric', month: 'long', year: 'numeric' }, lang)}`
    : multiGiorno
    ? formatIntervalloData(evento.dataInizio, evento.dataFine!, lang)
    : formatData(evento.dataInizio, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }, lang)
  const etichettaDataBreve = inCorso
    ? `${t.card.ongoing} · ${t.card.until} ${formatData(evento.dataFine!, { day: 'numeric', month: 'short' }, lang)}`
    : multiGiorno
    ? formatIntervalloData(evento.dataInizio, evento.dataFine!, lang)
    : `${formatData(evento.dataInizio, { weekday: 'short', day: 'numeric', month: 'short' }, lang)} · ${formatOra(evento.dataInizio, lang)}`

  // ── JSON-LD Schema.org Event ─────────────────────────────────────────────
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: evento.titolo,
    startDate: evento.dataInizio,
    ...(evento.dataFine ? { endDate: evento.dataFine } : {}),
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: evento.luogoNome ?? evento.geoNodo.nome,
      ...(evento.indirizzo ? { address: evento.indirizzo } : {
        address: {
          '@type': 'PostalAddress',
          addressLocality: evento.geoNodo.nome,
          addressRegion: 'Sicilia',
          addressCountry: 'IT',
        },
      }),
    },
    description: evento.descrizioneBreve ?? evento.titolo,
    url: paginaUrl,
    organizer: {
      '@type': 'Organization',
      name: evento.organizzatore.nome,
      url: SITE_URL,
    },
    ...(evento.gratuito
      ? {
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'EUR',
            availability: 'https://schema.org/InStock',
          },
        }
      : evento.prezzoMin != null
      ? {
          offers: {
            '@type': 'Offer',
            price: String(evento.prezzoMin),
            priceCurrency: 'EUR',
            ...(evento.urlBiglietti || evento.urlPrenotazione
              ? { url: evento.urlBiglietti ?? evento.urlPrenotazione }
              : {}),
          },
        }
      : {}),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href={lang === 'en' ? '/en' : '/'} className="hover:text-amber-600">{t.event.breadcrumbHome}</Link>
        <span>›</span>
        <Link href={lang === 'en' ? '/en/eventi' : '/eventi'} className="hover:text-amber-600">{t.event.breadcrumbEvents}</Link>
        <span>›</span>
        <Link href={`${lang === 'en' ? '/en' : ''}/localita/${evento.geoNodo.slug}`} className="hover:text-amber-600">{evento.geoNodo.nome}</Link>
        <span>›</span>
        <span className="text-gray-900 font-medium truncate">{evento.titolo}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* Colonna principale */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100">
            <ImmagineEvento
              fonti={fontiImmagine}
              categoriaSlug={evento.categorie[0]?.slug}
              categoriaNome={evento.categorie[0] ? nomeCategoria(evento.categorie[0], lang) : undefined}
              categoriaColore={evento.categorie[0]?.colore}
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 66vw"
              priority
            />
            <div className="absolute top-4 left-4 flex gap-2">
              {evento.categorie.map(cat => (
                <span key={cat.id} className="text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide" style={{ backgroundColor: cat.colore }}>
                  {nomeCategoria(cat, lang)}
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
            {evento.descrizione && (
              <div className="mt-4 text-gray-700 leading-relaxed whitespace-pre-line">{evento.descrizione}</div>
            )}

            {/*
              Trasparenza sui contenuti di origine automatizzata: gli eventi
              individuati dalla procedura di ricerca automatica dichiarano
              pubblicamente la fonte da cui l'informazione è stata tratta, così
              che chi legge possa verificarla. La scheda resta comunque
              approvata a mano prima della pubblicazione.
            */}
            {evento.fonteRicerca && (
              <aside className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-900">
                <p>
                  <span aria-hidden="true">ℹ️ </span>
                  {lang === 'en'
                    ? 'This listing was compiled from public sources by an automated search and reviewed by our team before publication. Please check the official source for last-minute changes.'
                    : 'Questa scheda è stata compilata a partire da fonti pubbliche tramite una ricerca automatica ed è stata verificata dalla redazione prima della pubblicazione. Ti consigliamo di controllare la fonte ufficiale per eventuali variazioni dell’ultimo momento.'}
                </p>
                <p className="mt-1.5 break-words">
                  {lang === 'en' ? 'Source: ' : 'Fonte: '}
                  <a
                    href={evento.fonteRicerca}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="underline hover:no-underline font-semibold"
                  >
                    {evento.fonteRicerca}
                  </a>
                </p>
              </aside>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <InfoRow icon="🗓️" label={t.event.date}>
              {etichettaData}
            </InfoRow>
            {!multiGiorno && (
              <InfoRow icon="🕐" label={t.event.time}>
                {formatOra(evento.dataInizio, lang)}{evento.dataFine && ` – ${formatOra(evento.dataFine, lang)}`}
              </InfoRow>
            )}
            <InfoRow icon="📍" label={t.event.where}>
              {evento.luogoNome ?? evento.indirizzo ?? evento.geoNodo.nome}
              {evento.indirizzo && evento.luogoNome && <span className="block text-sm text-gray-500">{evento.indirizzo}</span>}
            </InfoRow>
            <InfoRow icon="🏛️" label={t.event.town}>
              {evento.geoNodo.nome}
            </InfoRow>
            <InfoRow icon="🏷️" label={t.event.price}>
              <span className={evento.gratuito ? 'text-green-600 font-bold' : 'font-semibold'}>{prezzo}</span>
            </InfoRow>
            <InfoRow icon="🏢" label={t.event.organizer}>
              {evento.organizzatore.nome}
            </InfoRow>
            {evento.emailContatto && (
              <InfoRow icon="✉️" label={t.event.email}>
                <a href={`mailto:${evento.emailContatto}`} className="text-amber-600 hover:underline">{evento.emailContatto}</a>
              </InfoRow>
            )}
            {evento.telefonoContatto && (
              <InfoRow icon="📞" label={t.event.phone}>
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
                  {t.event.visitOfficialSite}
                </a>
              )}
              {evento.urlPrenotazione && (
                <a
                  href={evento.urlPrenotazione}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 border-2 border-amber-400 text-amber-600 hover:bg-amber-50 font-bold py-3 px-6 rounded-xl transition-colors"
                >
                  🎟️ {t.event.bookOrBuyTickets}
                </a>
              )}
            </div>
          )}

          {/* Avviso di non responsabilità */}
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <span className="text-xl shrink-0">⚠️</span>
            <p className="text-sm text-amber-900 leading-relaxed">
              <strong>{t.event.noticeTitle}</strong> {t.event.noticeIntro}{' '}
              <em>moesco</em> {t.event.noticeRest}
            </p>
          </div>

          {evento.lat && evento.lng && (
            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <span className="text-lg">🗺️</span>
                <p className="text-sm font-semibold text-gray-700">{t.event.howToGetThere}</p>
              </div>
              <div className="h-48 bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-4xl">📍</p>
                  <p className="text-sm font-semibold text-gray-700 mt-2">{evento.luogoNome ?? evento.geoNodo.nome}</p>
                  {evento.indirizzo && <p className="text-xs text-gray-500">{evento.indirizzo}</p>}
                  <a href={`https://maps.google.com/?q=${evento.lat},${evento.lng}`} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-xs text-amber-600 font-semibold hover:underline">
                    {t.event.openInMaps}
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
                {etichettaDataBreve}
              </p>
            </div>
            {(evento.urlPrenotazione || evento.urlBiglietti) ? (
              <a
                href={(evento.urlPrenotazione ?? evento.urlBiglietti)!}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center w-full bg-amber-400 hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition-colors"
              >
                🎟️ {t.event.bookTicketsShort}
              </a>
            ) : evento.sitoUfficiale ? (
              <a
                href={evento.sitoUfficiale}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center w-full bg-amber-400 hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition-colors"
              >
                {t.event.infoOnOfficialSite}
              </a>
            ) : (
              <p className="text-xs text-center text-gray-400">
                {t.event.contactOrganizerForInfo}
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{t.event.organizer}</p>
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
          <p className="text-xs text-gray-500 mt-0.5 truncate">{etichettaDataBreve}</p>
        </div>
        {(evento.urlPrenotazione || evento.urlBiglietti || evento.sitoUfficiale) && (
          <a
            href={(evento.urlPrenotazione ?? evento.urlBiglietti ?? evento.sitoUfficiale)!}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-amber-400 hover:bg-amber-500 text-white font-bold py-3 px-6 rounded-xl transition-colors shrink-0"
          >
            {evento.urlPrenotazione || evento.urlBiglietti ? t.event.book : t.event.info}
          </a>
        )}
      </div>

      {/* spazio per la sticky bar su mobile */}
      <div className="lg:hidden h-20" />

      {correlati.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl font-bold text-gray-900 mb-5">{t.event.youMightAlsoLike}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {correlati.map(e => <EventCard key={e.id} evento={e} />)}
          </div>
        </section>
      )}
    </div>
    </>
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
