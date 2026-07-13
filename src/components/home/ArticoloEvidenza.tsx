'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Evento } from '@/types'
import { formatData, eMultiGiorno, eInCorso, formatIntervalloData } from '@/lib/utils'
import EventImagePlaceholder from '@/components/ui/EventImagePlaceholder'
import { immagineComune } from '@/data/comuni-immagini'
import { useLang } from '@/lib/i18n/LanguageContext'

interface Props {
  evento: Evento
}

// Card "articolo" più ricca delle EventCard standard: foto più grande e un
// estratto di testo più lungo (testoArticolo se compilato in admin, altrimenti
// la descrizione completa dell'evento) — usata nella sezione "In primo piano"
// della homepage.
export default function ArticoloEvidenza({ evento }: Props) {
  const { t } = useLang()
  const categoria = evento.categorie[0]

  const immagineAutorizzata = evento.mediaAssetUrl ?? null
  const fotoCitta = immagineComune(evento.geoNodo.slug)

  const testo = (evento.testoArticolo?.trim() || evento.descrizione?.trim() || evento.descrizioneBreve?.trim() || '')

  const multiGiorno = eMultiGiorno(evento.dataInizio, evento.dataFine)
  const inCorso = eInCorso(evento.dataInizio, evento.dataFine)
  const etichettaData = inCorso
    ? `In corso · fino al ${formatData(evento.dataFine!, { day: 'numeric', month: 'short' })}`
    : multiGiorno
    ? formatIntervalloData(evento.dataInizio, evento.dataFine!)
    : formatData(evento.dataInizio)

  return (
    <Link
      href={`/eventi/${evento.slug}`}
      className="group flex flex-col rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-shadow border border-gray-100"
    >
      <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
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

        {categoria && (
          <span
            className="absolute top-3 left-3 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide z-10"
            style={{ backgroundColor: categoria.colore }}
          >
            {categoria.nome}
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{etichettaData}</span>
          <span className="text-gray-300">·</span>
          <span className="text-gray-500 font-normal truncate">{evento.geoNodo.nome}</span>
        </div>

        <h3 className="font-extrabold text-gray-900 text-lg leading-snug group-hover:text-amber-600 transition-colors line-clamp-2">
          {evento.titolo}
        </h3>

        {testo && (
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
            {testo}
          </p>
        )}

        <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-amber-600">
          {t.home.readMore}
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </span>
      </div>
    </Link>
  )
}
