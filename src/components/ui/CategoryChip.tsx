'use client'

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
}

export default function CategoryChip({ categoria, attiva = false, onClick }: CategoryChipProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-semibold transition-all shrink-0 border-2 ${
        attiva
          ? 'text-white border-transparent shadow-md scale-105'
          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
      style={attiva ? { backgroundColor: categoria.colore, borderColor: categoria.colore } : {}}
    >
      <span className="text-xl">{icona(categoria.icona)}</span>
      <span>{categoria.nome}</span>
    </button>
  )
}
