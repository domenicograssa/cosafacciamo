'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Evento } from '@/types'
import { formatData, formatOra, formatPrezzo } from '@/lib/utils'
import EventImagePlaceholder from '@/components/ui/EventImagePlaceholder'
import { immagineComune } from '@/data/comuni-immagini'
import { useLang } from '@/lib/i18n/LanguageContext'

interface EventCardProps {
  evento: Evento
  compact?: boolean
  /** Etichetta "In evidenza" (es. "Oggi", "Domani", "Tra 3 giorni") */
  badgeEvidenza?: string
}

export default function EventCard({ evento, compact = false, badgeEvidenza }: EventCardProps) {
  const { t } = useLang()
  const prezzo = formatPrezzo(evento.prezzoMin, evento.prezzoMax, evento.gratuito)
  const categoria = evento.categorie[0]

  // Evento "in corso": iniziato in passato ma con data di fine non ancora passata
  // (es. mostre che durano settimane) — mostriamo "fino al" invece della data vecchia
  const adesso = Date.now()
  const inCorso = !!evento.dataFine &&
    new Date(evento.dataInizio).getTime() < adesso &&
    new Date(evento.dataFine).getTime() >= adesso

  // Priorità immagine: 1) immagine autorizzata dell'evento, 2) foto della città, 3) placeholder categoria
  const immagineAutorizzata = evento.mediaAssetUrl ?? null
  const fotoCitta = immagineComune(evento.geoNodo.slug)

  if (compact) {
    return (
      <Link href={`/eventi/${evento.slug}`} className="flex gap-3 group">
        <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
          {immagineAutorizzata ? (
            <Image src={immagineAutorizzata} alt={evento.mediaAssetAlt ?? evento.titolo} fill className="object-cover" />
          ) : fotoCitta ? (
            <Image src={fotoCitta.url} alt={fotoCitta.alt} fill className="object-cover" />
          ) : (
            <EventImagePlaceholder
              categoriaSlug={categoria?.slug}
              categoriaNome={categoria?.nome}
              categoriaColore={categoria?.colore}
              compact
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold ${inCorso ? 'text-green-600' : 'text-amber-600'}`}>
            {inCorso
              ? `${t.card.ongoing} · ${t.card.until} ${formatData(evento.dataFine!)}`
              : `${formatData(evento.dataInizio)} · ${formatOra(evento.dataInizio)}`}
          </p>
          <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-amber-600 transition-colors">{evento.titolo}</p>
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <span className="truncate">{evento.geoNodo.nome}</span>
          </div>
          <p className={`text-xs font-medium mt-1 ${evento.gratuito ? 'text-green-600' : 'text-amber-600'}`}>
            {prezzo}
          </p>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/eventi/${evento.slug}`} className="group flex flex-col rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow border border-gray-100">

      {/* Immagine o placeholder */}
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        {immagineAutorizzata ? (
          <Image
            src={immagineAutorizzata}
            alt={evento.mediaAssetAlt ?? evento.titolo}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : fotoCitta ? (
          <Image
            src={fotoCitta.url}
            alt={fotoCitta.alt}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <EventImagePlaceholder
            categoriaSlug={categoria?.slug}
            categoriaNome={categoria?.nome}
            categoriaColore={categoria?.colore}
          />
        )}

        {/* Badge categoria */}
        {categoria && (
          <span
            className="absolute top-3 left-3 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide z-10"
            style={{ backgroundColor: categoria.colore }}
          >
            {categoria.nome}
          </span>
        )}

        {/* Badge evidenza (Oggi / Domani / Tra N giorni) */}
        {badgeEvidenza && (
          <span className="absolute top-3 right-3 z-20 bg-amber-400 text-white text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full shadow-md">
            {badgeEvidenza}
          </span>
        )}

        {/* Badge data */}
        <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-sm rounded-xl px-2.5 py-1.5 text-center shadow-sm min-w-[44px]">
          {inCorso ? (
            <>
              <p className="text-[9px] font-bold uppercase text-green-600 leading-none">{t.card.until}</p>
              <p className="text-base font-extrabold text-gray-900 leading-none mt-0.5">
                {formatData(evento.dataFine!, { day: 'numeric' })}
              </p>
              <p className="text-[10px] font-bold uppercase text-green-600 leading-none mt-0.5">
                {formatData(evento.dataFine!, { month: 'short' }).replace('.', '')}
              </p>
            </>
          ) : (
            <>
              <p className="text-base font-extrabold text-gray-900 leading-none">
                {formatData(evento.dataInizio, { day: 'numeric' })}
              </p>
              <p className="text-[10px] font-bold uppercase text-amber-600 leading-none mt-0.5">
                {formatData(evento.dataInizio, { month: 'short' }).replace('.', '')}
              </p>
            </>
          )}
        </div>

        {/* Preferiti */}
        <button
          className={`absolute ${badgeEvidenza ? 'bottom-3 right-3' : 'top-3 right-3'} w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors z-10`}
          onClick={(e) => { e.preventDefault() }}
          aria-label={t.card.addFavorite}
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Contenuto */}
      <div className="p-4 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className={inCorso ? 'text-green-600' : undefined}>
            {inCorso
              ? `${t.card.ongoing} · ${t.card.until} ${formatData(evento.dataFine!)}`
              : `${formatData(evento.dataInizio)} · ${formatOra(evento.dataInizio)}`}
          </span>
        </div>

        <h3 className="font-bold text-gray-900 text-sm leading-tight group-hover:text-amber-600 transition-colors line-clamp-2">
          {evento.titolo}
        </h3>

        <div className="flex items-center gap-1 text-xs text-gray-500">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <span className="truncate">{evento.geoNodo.nome}</span>
        </div>

        <p className={`text-sm font-semibold mt-1 ${evento.gratuito ? 'text-green-600' : 'text-gray-900'}`}>
          {prezzo}
        </p>
      </div>
    </Link>
  )
}
