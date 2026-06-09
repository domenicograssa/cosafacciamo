import Link from 'next/link'
import Image from 'next/image'
import type { Attivita } from '@/types'

const LIVELLO_LABEL: Record<string, string> = {
  facile: 'Facile',
  medio: 'Medio',
  esperto: 'Esperto',
}

const LIVELLO_COLOR: Record<string, string> = {
  facile: 'text-green-600 bg-green-50',
  medio: 'text-amber-600 bg-amber-50',
  esperto: 'text-red-600 bg-red-50',
}

interface ActivityCardProps {
  attivita: Attivita
  compact?: boolean
}

export default function ActivityCard({ attivita, compact = false }: ActivityCardProps) {
  const categoria = attivita.categorie[0]

  if (compact) {
    return (
      <Link href={`/cosa-fare/${attivita.slug}`} className="flex gap-3 group">
        <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
          {attivita.immagineCopertura ? (
            <Image src={attivita.immagineCopertura} alt={attivita.titolo} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: categoria?.colore ?? '#6366F1' }}>
              <svg className="w-6 h-6 text-white opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500">{attivita.geoNodo.nome}</p>
          <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-amber-600 transition-colors">
            {attivita.titolo}
          </p>
          {attivita.durata && (
            <p className="text-xs text-gray-500 mt-0.5">{attivita.durata}</p>
          )}
          <p className={`text-xs font-medium mt-1 ${attivita.gratuito ? 'text-green-600' : 'text-amber-600'}`}>
            {attivita.gratuito ? 'Gratuito' : 'A pagamento'}
          </p>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/cosa-fare/${attivita.slug}`}
      className="group flex flex-col rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow border border-gray-100"
    >
      {/* Immagine */}
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        {attivita.immagineCopertura ? (
          <Image
            src={attivita.immagineCopertura}
            alt={attivita.titolo}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: categoria?.colore ?? '#6366F1' }}
          >
            <svg className="w-12 h-12 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
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

        {/* Badge gratuito */}
        {attivita.gratuito && (
          <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
            Gratuito
          </span>
        )}
      </div>

      {/* Contenuto */}
      <div className="p-4 flex flex-col gap-1.5">
        {/* Comune */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <span className="truncate">{attivita.geoNodo.nome}</span>
        </div>

        <h3 className="font-bold text-gray-900 text-sm leading-tight group-hover:text-amber-600 transition-colors line-clamp-2">
          {attivita.titolo}
        </h3>

        {attivita.descrizioneBreve && (
          <p className="text-xs text-gray-500 line-clamp-2">{attivita.descrizioneBreve}</p>
        )}

        <div className="flex items-center gap-2 mt-1">
          {/* Durata */}
          {attivita.durata && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {attivita.durata}
            </span>
          )}

          {/* Livello */}
          {attivita.livello && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${LIVELLO_COLOR[attivita.livello]}`}>
              {LIVELLO_LABEL[attivita.livello]}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
