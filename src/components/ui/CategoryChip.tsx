'use client'

import Link from 'next/link'
import { Categoria } from '@/types'
import { nomeCategoria } from '@/lib/i18n/strings'
import type { Lang } from '@/lib/i18n/strings'
import { sfondoConTestoBianco } from '@/lib/utils'

const ICONA_EMOJI: Record<string, string> = {
  'music-note': '🎵',
  'building': '🏛️',
  'trophy': '🏆',
  'map': '🗺️',
  'utensils': '🍽️',
  'users': '👨‍👩‍👧',
  'waves': '🌊',
  'moon': '🌙',
  'gift': '🎁',
  'frame': '🖼️',
  'leaf': '🌿',
  'landmark': '🏺',
  'mountain': '⛰️',
  'home': '🏘️',
  'eye': '👁️',
  'palette': '🎨',
  'heart': '💚',
  'anchor': '⚓',
}

export function icona(slug: string): string {
  return ICONA_EMOJI[slug] ?? '✨'
}

interface CategoryChipProps {
  categoria: Categoria
  attiva?: boolean
  onClick?: () => void
  /** Se presente, il chip diventa un link di navigazione (es. homepage → /eventi?categoria=slug)
   *  invece di un toggle di filtro locale (usato invece in EventiList/AttivitaList/PubblicaForm). */
  href?: string
  /** Lingua per il nome mostrato — default 'it' (i form admin/pubblicazione restano sempre italiani). */
  lang?: Lang
}

export default function CategoryChip({ categoria, attiva = false, onClick, href, lang = 'it' }: CategoryChipProps) {
  const className = `flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-semibold transition-all shrink-0 border-2 ${
    attiva
      ? 'text-white border-transparent shadow-md scale-105'
      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:shadow-sm'
  }`
  // Il colore viene scurito quanto serve a rendere leggibile il testo bianco
  // sopra (WCAG AA 4,5:1) — vedi sfondoConTestoBianco in lib/utils.
  const tinta = sfondoConTestoBianco(categoria.colore)
  const style = attiva ? { backgroundColor: tinta, borderColor: tinta } : {}
  const content = (
    <>
      <span className="text-xl" aria-hidden="true">{icona(categoria.icona)}</span>
      <span>{nomeCategoria(categoria, lang)}</span>
    </>
  )

  if (href) {
    return (
      <Link href={href} className={className} style={style}>
        {content}
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={attiva}
      className={className}
      style={style}
    >
      {content}
    </button>
  )
}
