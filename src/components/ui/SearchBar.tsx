'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { GeoNodo } from '@/types'

interface SearchBarProps {
  comuni?: GeoNodo[]
}

export default function SearchBar({ comuni = [] }: SearchBarProps) {
  const router = useRouter()
  const [dove, setDove] = useState('')
  const [quando, setQuando] = useState('')
  const [cosa, setCosa] = useState('')

  const cerca = () => {
    const params = new URLSearchParams()
    if (dove)   params.set('comune', dove)
    if (quando) params.set('data', quando)
    if (cosa)   params.set('q', cosa)
    router.push(`/eventi?${params.toString()}`)
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-2 flex flex-col sm:flex-row gap-2">

      {/* Dove */}
      <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
        <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        </svg>
        <select
          value={dove}
          onChange={e => setDove(e.target.value)}
          className="w-full text-sm text-gray-700 bg-transparent outline-none cursor-pointer"
        >
          <option value="">Dove vuoi andare?</option>
          {comuni.map(c => (
            <option key={c.id} value={c.slug}>{c.nome}</option>
          ))}
        </select>
      </div>

      <div className="hidden sm:block w-px bg-gray-200 self-stretch" />

      {/* Quando */}
      <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
        <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <input
          type="date"
          value={quando}
          onChange={e => setQuando(e.target.value)}
          className="w-full text-sm text-gray-700 bg-transparent outline-none"
        />
      </div>

      <div className="hidden sm:block w-px bg-gray-200 self-stretch" />

      {/* Cosa */}
      <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
        <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={cosa}
          onChange={e => setCosa(e.target.value)}
          placeholder="Che cosa ti interessa?"
          className="w-full text-sm text-gray-700 bg-transparent outline-none placeholder-gray-400"
        />
      </div>

      <button
        onClick={cerca}
        className="bg-amber-400 hover:bg-amber-500 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors shrink-0"
      >
        Cerca
      </button>
    </div>
  )
}
