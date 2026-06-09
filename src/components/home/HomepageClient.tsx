'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import SearchBar from '@/components/ui/SearchBar'
import CategoryChip from '@/components/ui/CategoryChip'
import EventCard from '@/components/events/EventCard'
import type { Evento, Categoria, GeoNodo } from '@/types'

const HERO_SLIDES = [
  {
    // Fonte: unsplash.com/s/photos/castellammare-del-golfo — "Coastal town with harbor at sunset"
    src: 'https://images.unsplash.com/photo-1756990901059-90f464223f3f?w=1400&q=80',
    nome: 'Castellammare del Golfo',
    slug: 'castellammare-del-golfo',
    emoji: '⛵',
  },
  {
    // Fonte: unsplash.com/s/photos/san-vito-lo-capo — "An aerial view of a beach and ocean" (Paul Sebastian Saliba)
    src: 'https://images.unsplash.com/photo-1730193488340-0af0fe404306?w=1400&q=80',
    nome: 'San Vito Lo Capo',
    slug: 'san-vito-lo-capo',
    emoji: '🏖️',
  },
  {
    // Fonte: unsplash.com/s/photos/alcamo-sicily — "aerial photography of brown town near ocean"
    src: 'https://images.unsplash.com/photo-1524942434100-2b3f200f5b40?w=1400&q=80',
    nome: 'Alcamo',
    slug: 'alcamo',
    emoji: '🏰',
  },
  {
    // Fonte: unsplash.com/s/photos/segesta-sicily — "sun behind ruins of a temple" (Antonio Sessa)
    src: 'https://images.unsplash.com/photo-1677967062355-b951f29c66e8?w=1400&q=80',
    nome: 'Calatafimi Segesta',
    slug: 'calatafimi-segesta',
    emoji: '🏛️',
  },
]

interface Props {
  eventiOggi: Evento[]
  categorie: Categoria[]
  comuni: GeoNodo[]
}

export default function HomepageClient({ eventiOggi, categorie, comuni }: Props) {
  const [categoriaAttiva, setCategoriaAttiva] = useState<string | null>(null)
  const [slideIdx, setSlideIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setSlideIdx(i => (i + 1) % HERO_SLIDES.length), 5000)
    return () => clearInterval(t)
  }, [])

  const inEvidenza = categoriaAttiva
    ? eventiOggi.filter(e => e.categorie.some(c => c.slug === categoriaAttiva))
    : eventiOggi.slice(0, 5)

  const gratuiti = eventiOggi.filter(e => e.gratuito).slice(0, 4)

  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[480px] flex items-center bg-gray-900 overflow-hidden">

        {/* slideshow layers */}
        <div className="absolute inset-0">
          {HERO_SLIDES.map((slide, i) => (
            <div
              key={slide.slug}
              className="absolute inset-0 transition-opacity duration-1000"
              style={{ opacity: i === slideIdx ? 1 : 0 }}
            >
              <Image
                src={slide.src}
                alt={slide.nome}
                fill
                className="object-cover opacity-50"
                priority={i === 0}
              />
            </div>
          ))}
        </div>

        {/* locality badge (top-right) */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5">
          <span className="text-base leading-none">{HERO_SLIDES[slideIdx].emoji}</span>
          <span className="text-white text-xs font-semibold tracking-wide">{HERO_SLIDES[slideIdx].nome}</span>
        </div>

        {/* dot navigation (bottom-center) */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {HERO_SLIDES.map((slide, i) => (
            <button
              key={slide.slug}
              onClick={() => setSlideIdx(i)}
              aria-label={`Vai a ${slide.nome}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === slideIdx ? 'w-7 bg-amber-400' : 'w-2 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>

        {/* content */}
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 w-full py-14 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
            che facciamo <span className="text-amber-400">oggi?</span>
          </h1>
          <p className="mt-3 text-white/80 text-lg">
            Eventi, esperienze e attività nei posti che ami.
          </p>

          <div className="mt-6">
            <SearchBar comuni={comuni} />
          </div>

          {/* Città — chip orizzontali */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {comuni.map(comune => (
              <Link
                key={comune.id}
                href={`/localita/${comune.slug}`}
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
              >
                <span>📍</span>
                <span>{comune.nome}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CATEGORIE ────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {categorie.map(cat => (
              <CategoryChip
                key={cat.id}
                categoria={cat}
                attiva={categoriaAttiva === cat.slug}
                onClick={() => setCategoriaAttiva(prev => prev === cat.slug ? null : cat.slug)}
              />
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">

        {/* ─── IN EVIDENZA ──────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900">
              {categoriaAttiva
                ? categorie.find(c => c.slug === categoriaAttiva)?.nome
                : 'In evidenza oggi'}
            </h2>
            <Link href="/eventi" className="flex items-center gap-1.5 text-sm text-amber-600 font-semibold hover:underline">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Vedi calendario
            </Link>
          </div>
          {inEvidenza.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {inEvidenza.map(evento => <EventCard key={evento.id} evento={evento} />)}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-sm">Nessun evento in programma per questa categoria.</p>
              <button onClick={() => setCategoriaAttiva(null)} className="mt-3 text-sm text-amber-600 font-semibold hover:underline">
                Mostra tutti gli eventi
              </button>
            </div>
          )}
        </section>

        {/* ─── PROSSIMI + GRATUITI ──────────────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Prossimi eventi</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {eventiOggi.slice(0, 6).map(evento => <EventCard key={evento.id} evento={evento} />)}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">Gratuiti</h2>
              <Link href="/eventi?gratuiti=true" className="text-sm text-amber-600 font-semibold hover:underline">Vedi tutti</Link>
            </div>
            {gratuiti.length > 0 ? (
              <div className="space-y-4">
                {gratuiti.map(evento => <EventCard key={evento.id} evento={evento} compact />)}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Nessun evento gratuito in programma.</p>
            )}
          </div>
        </div>

        {/* ─── CTA ──────────────────────────────────────────────────────── */}
        <section className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: '📣', titolo: 'Pubblica il tuo evento', testo: 'Raggiungi migliaia di persone in pochi semplici passaggi.' },
            { icon: '🔔', titolo: 'Sempre aggiornato',      testo: 'Ogni giorno nuovi eventi e attività selezionati.' },
            { icon: '📍', titolo: 'Ovunque tu sia',         testo: 'Cerca vicino a te e scopri cosa fare intorno.' },
          ].map(item => (
            <div key={item.titolo} className="flex items-start gap-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <span className="text-3xl shrink-0">{item.icon}</span>
              <div>
                <p className="font-bold text-gray-900 text-sm">{item.titolo}</p>
                <p className="text-gray-500 text-sm mt-0.5">{item.testo}</p>
              </div>
            </div>
          ))}
        </section>
      </div>
    </>
  )
}
