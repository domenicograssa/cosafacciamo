'use client'

import { Categoria } from '@/types'

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
      <span className="text-xl">{categoria.icona}</span>
      <span>{categoria.nome}</span>
    </button>
  )
}
