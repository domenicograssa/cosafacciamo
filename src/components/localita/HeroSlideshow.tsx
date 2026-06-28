'use client'

import { useEffect, useState, useCallback } from 'react'
import type { SlideComune } from '@/data/comuni-immagini'

interface Props {
  slides: SlideComune[]
  /** Intervallo di avanzamento automatico in ms — default 5000 */
  intervallo?: number
}

export default function HeroSlideshow({ slides, intervallo = 5000 }: Props) {
  const [current, setCurrent] = useState(0)
  const [loaded, setLoaded] = useState<boolean[]>(() => slides.map(() => false))
  const total = slides.length

  const goTo = useCallback((i: number) => {
    setCurrent((i + total) % total)
  }, [total])

  // Avanzamento automatico — si ferma se c'è una sola slide
  useEffect(() => {
    if (total <= 1) return
    const id = setInterval(() => goTo(current + 1), intervallo)
    return () => clearInterval(id)
  }, [current, goTo, intervallo, total])

  const markLoaded = (i: number) =>
    setLoaded(prev => { const next = [...prev]; next[i] = true; return next })

  return (
    <>
      {/* Strati immagine con transizione fade */}
      {slides.map((slide, i) => (
        <div
          key={i}
          aria-hidden={i !== current}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          {/* Precarica la slide successiva */}
          {(i === current || i === (current + 1) % total) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={slide.url}
              alt={slide.alt}
              onLoad={() => markLoaded(i)}
              className="w-full h-full object-cover"
            />
          )}
          {/* Placeholder grigio durante il caricamento */}
          {!loaded[i] && (
            <div className="absolute inset-0 bg-gray-800 animate-pulse" />
          )}
        </div>
      ))}

      {/* Credito foto */}
      {slides[current].creditoUrl ? (
        <a
          href={slides[current].creditoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-2 right-3 z-20 text-[10px] text-white/50 hover:text-white/80 transition-colors"
        >
          Foto: {slides[current].credito}
        </a>
      ) : (
        <span className="absolute top-2 right-3 z-20 text-[10px] text-white/50">
          Foto: {slides[current].credito}
        </span>
      )}

      {/* Punti di navigazione — visibili solo con 2+ slide */}
      {total > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Vai alla foto ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-5 h-2 bg-white'
                  : 'w-2 h-2 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}

      {/* Frecce prev/next — solo con 2+ slide */}
      {total > 1 && (
        <>
          <button
            onClick={() => goTo(current - 1)}
            aria-label="Foto precedente"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => goTo(current + 1)}
            aria-label="Foto successiva"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </>
  )
}
