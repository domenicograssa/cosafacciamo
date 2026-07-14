'use client'

import Link from 'next/link'
import { Categoria } from '@/types'

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
}

export default function CategoryChip({ categoria, attiva = false, onClick, href }: CategoryChipProps) {
  const className = `flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-semibold transition-all shrink-0 border-2 ${
    attiva
      ? 'text-white border-transparent shadow-md scale-105'
      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:shadow-sm'
  }`
  const style = attiva ? { backgroundColor: categoria.colore, borderColor: categoria.colore } : {}
  const content = (
    <>
      <span className="text-xl">{icona(categoria.icona)}</span>
      <span>{categoria.nome}</span>
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
    <button onClick={onClick} className={className} style={style}>
      {content}
    </button>
  )
}
