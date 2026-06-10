'use client'

import { useEffect, useRef, useState } from 'react'
import type { GeoNodo } from '@/types'
import { normalizzaTesto } from '@/lib/utils'

interface ComuneComboboxProps {
  comuni: GeoNodo[]
  value: string
  valueKey?: 'slug' | 'id'
  onChange: (value: string) => void
  placeholder?: string
  /** Stile "nudo" per l'uso dentro la barra di ricerca della homepage */
  bare?: boolean
}

export default function ComuneCombobox({
  comuni,
  value,
  valueKey = 'slug',
  onChange,
  placeholder = 'Cerca comune…',
  bare = false,
}: ComuneComboboxProps) {
  const selezionato = comuni.find(c => c[valueKey] === value) ?? null
  const [testo, setTesto] = useState(selezionato?.nome ?? '')
  const [aperto, setAperto] = useState(false)
  const [evidenziato, setEvidenziato] = useState(0)
  const boxRef = useRef<HTMLDivElement>(null)

  // Riallinea il testo quando la selezione cambia dall'esterno (es. reset filtri)
  useEffect(() => {
    setTesto(selezionato?.nome ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  // Chiudi cliccando fuori
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setAperto(false)
        setTesto(selezionato?.nome ?? '')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [selezionato])

  const query = normalizzaTesto(testo)
  const filtrati =
    query && query !== normalizzaTesto(selezionato?.nome ?? '')
      ? comuni.filter(c => normalizzaTesto(c.nome).includes(query))
      : comuni

  const seleziona = (c: GeoNodo) => {
    onChange(c[valueKey])
    setTesto(c.nome)
    setAperto(false)
  }

  const pulisci = () => {
    onChange('')
    setTesto('')
    setAperto(false)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!aperto && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setAperto(true)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setEvidenziato(i => Math.min(i + 1, filtrati.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setEvidenziato(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtrati[evidenziato]) seleziona(filtrati[evidenziato])
    } else if (e.key === 'Escape') {
      setAperto(false)
      setTesto(selezionato?.nome ?? '')
    }
  }

  return (
    <div ref={boxRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={testo}
          placeholder={placeholder}
          onChange={e => {
            setTesto(e.target.value)
            setAperto(true)
            setEvidenziato(0)
          }}
          onFocus={() => setAperto(true)}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-expanded={aperto}
          aria-autocomplete="list"
          className={
            bare
              ? 'w-full text-sm text-gray-700 bg-transparent outline-none placeholder-gray-400 pr-6'
              : 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 pr-8 outline-none focus:ring-2 focus:ring-amber-400 bg-white'
          }
        />
        {value && (
          <button
            type="button"
            onClick={pulisci}
            aria-label="Rimuovi comune selezionato"
            className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 ${bare ? 'right-0' : 'right-2'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {aperto && filtrati.length > 0 && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1 z-40 bg-white border border-gray-100 rounded-xl shadow-lg max-h-60 overflow-y-auto py-1"
        >
          {filtrati.map((c, i) => (
            <li key={c.id} role="option" aria-selected={c[valueKey] === value}>
              <button
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => seleziona(c)}
                onMouseEnter={() => setEvidenziato(i)}
                className={`w-full text-left text-sm px-3 py-2 flex items-center gap-2 transition-colors ${
                  i === evidenziato ? 'bg-amber-50 text-amber-700' : 'text-gray-700'
                }`}
              >
                <span className="text-amber-500">📍</span>
                <span>{c.nome}</span>
                {c[valueKey] === value && <span className="ml-auto text-amber-500">✓</span>}
              </button>
            </li>
          ))}
        </ul>
      )}

      {aperto && filtrati.length === 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 z-40 bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-3 text-sm text-gray-500">
          Nessun comune trovato
        </div>
      )}
    </div>
  )
}
