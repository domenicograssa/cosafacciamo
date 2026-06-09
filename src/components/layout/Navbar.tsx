'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">c</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-gray-900 text-lg leading-none">cosafacciamo</span>
              <p className="text-[10px] text-gray-500 leading-none">Scopri. Partecipa. Vivi il territorio.</p>
            </div>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link href="/cosa-fare" className="hover:text-gray-900 transition-colors">Attività</Link>
            <Link href="/eventi" className="hover:text-gray-900 transition-colors">Eventi</Link>
            <Link href="/localita" className="hover:text-gray-900 transition-colors">Località</Link>
            <Link href="/organizzatori" className="hover:text-gray-900 transition-colors">Per organizzatori</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-500 hover:text-gray-900 transition-colors" aria-label="Cerca">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-900 transition-colors" aria-label="Preferiti">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button className="hidden sm:block bg-amber-400 hover:bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors">
              Pubblica evento
            </button>
            {/* Mobile menu */}
            <button
              className="md:hidden p-2 text-gray-500"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <nav className="md:hidden border-t border-gray-100 py-4 flex flex-col gap-3 text-sm font-medium text-gray-600">
            <Link href="/cosa-fare" className="px-2 py-1 hover:text-gray-900" onClick={() => setMenuOpen(false)}>Attività</Link>
            <Link href="/eventi" className="px-2 py-1 hover:text-gray-900" onClick={() => setMenuOpen(false)}>Eventi</Link>
            <Link href="/localita" className="px-2 py-1 hover:text-gray-900" onClick={() => setMenuOpen(false)}>Località</Link>
            <Link href="/organizzatori" className="px-2 py-1 hover:text-gray-900" onClick={() => setMenuOpen(false)}>Per organizzatori</Link>
            <Link href="/pubblica" className="mt-2 text-center bg-amber-400 text-white font-semibold px-4 py-2 rounded-full" onClick={() => setMenuOpen(false)}>Pubblica evento</Link>
          </nav>
        )}
      </div>
    </header>
  )
}
