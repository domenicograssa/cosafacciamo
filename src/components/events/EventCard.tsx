import Link from 'next/link'
import Image from 'next/image'
import { Evento } from '@/types'
import { formatOra, formatPrezzo, formatData } from '@/lib/utils'

interface EventCardProps {
  evento: Evento
  compact?: boolean
}

export default function EventCard({ evento, compact = false }: EventCardProps) {
  const prezzo = formatPrezzo(evento.prezzoMin, evento.prezzoMax, evento.gratuito)
  const categoria = evento.categorie[0]

  if (compact) {
    return (
      <Link href={`/eventi/${evento.slug}`} className="flex gap-3 group">
        <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
          {evento.immagineCopertura && (
            <Image src={evento.immagineCopertura} alt={evento.titolo} fill className="object-cover" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500">{formatOra(evento.dataInizio)}</p>
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

      {/* Immagine */}
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        {evento.immagineCopertura && (
          <Image
            src={evento.immagineCopertura}
            alt={evento.titolo}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}

        {/* Badge categoria */}
        {categoria && (
          <span
            className="absolute top-3 left-3 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide"
            style={{ backgroundColor: categoria.colore }}
          >
            {categoria.nome}
          </span>
        )}

        {/* Preferiti */}
        <button
          className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
          onClick={(e) => { e.preventDefault() }}
          aria-label="Aggiungi ai preferiti"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Contenuto */}
      <div className="p-4 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{formatOra(evento.dataInizio)}</span>
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
