'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import LogoMoesco from './LogoMoesco'
import { useLang } from '@/lib/i18n/LanguageContext'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { t, lang, setLang } = useLang()

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex flex-col justify-center shrink-0">
            <LogoMoesco height={36} />
            <p className="hidden sm:block text-[10px] text-gray-500 leading-none mt-0.5">
              {t.footer.tagline}
            </p>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link href="/cosa-fare" className="hover:text-gray-900 transition-colors">{t.nav.whatToDo}</Link>
            <Link href="/eventi"    className="hover:text-gray-900 transition-colors">{t.nav.events}</Link>
            <Link href="/localita"  className="hover:text-gray-900 transition-colors">{t.nav.locations}</Link>
            <Link href="/organizzatori" className="hover:text-gray-900 transition-colors">{t.nav.organizers}</Link>
            <Link href="/contatti"  className="hover:text-gray-900 transition-colors">Contatti</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Lingua toggle IT / EN */}
            <button
              onClick={() => setLang(lang === 'it' ? 'en' : 'it')}
              className="hidden sm:flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-400 rounded-full px-2.5 py-1 transition-colors"
              aria-label={lang === 'it' ? 'Switch to English' : 'Passa all\'italiano'}
              title={lang === 'it' ? 'Switch to English' : 'Torna in italiano'}
            >
              {lang === 'it' ? '🇬🇧 EN' : '🇮🇹 IT'}
            </button>

            <Link href="/eventi" className="p-2 text-gray-500 hover:text-gray-900 transition-colors" aria-label="Cerca eventi">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
            <button className="p-2 text-gray-500 hover:text-gray-900 transition-colors" aria-label="Preferiti">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <Link href="/accedi" className="hidden sm:block text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
              {t.nav.login}
            </Link>
            <Link href="/pubblica" className="hidden sm:block bg-amber-400 hover:bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors">
              {t.nav.publish}
            </Link>

            {/* Mobile menu button */}
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
            <Link href="/cosa-fare"     className="px-2 py-1 hover:text-gray-900" onClick={() => setMenuOpen(false)}>{t.nav.whatToDo}</Link>
            <Link href="/eventi"        className="px-2 py-1 hover:text-gray-900" onClick={() => setMenuOpen(false)}>{t.nav.events}</Link>
            <Link href="/localita"      className="px-2 py-1 hover:text-gray-900" onClick={() => setMenuOpen(false)}>{t.nav.locations}</Link>
            <Link href="/organizzatori" className="px-2 py-1 hover:text-gray-900" onClick={() => setMenuOpen(false)}>{t.nav.organizers}</Link>
            <Link href="/contatti"      className="px-2 py-1 hover:text-gray-900" onClick={() => setMenuOpen(false)}>Contatti</Link>
            <Link href="/accedi"        className="px-2 py-1 hover:text-gray-900" onClick={() => setMenuOpen(false)}>{t.nav.login} / Dashboard</Link>
            <Link href="/pubblica" className="mt-2 text-center bg-amber-400 text-white font-semibold px-4 py-2 rounded-full" onClick={() => setMenuOpen(false)}>
              {t.nav.publish}
            </Link>
            <button
              onClick={() => { setLang(lang === 'it' ? 'en' : 'it'); setMenuOpen(false) }}
              className="px-2 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 text-left"
            >
              {lang === 'it' ? '🇬🇧 Switch to English' : '🇮🇹 Torna in italiano'}
            </button>
          </nav>
        )}
      </div>
    </header>
  )
}
