'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/admin',              label: 'Dashboard',     icon: '📊' },
  { href: '/admin/eventi',       label: 'Eventi',        icon: '🗓️' },
  { href: '/admin/organizzatori',label: 'Organizzatori', icon: '👤' },
]

export default function AdminSidebar() {
  const path = usePathname()

  return (
    <aside className="w-56 shrink-0 bg-gray-900 min-h-screen flex flex-col">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-700">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-amber-400 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xs">c</span>
          </div>
          <span className="text-white font-bold text-sm">cosafacciamo</span>
        </Link>
        <p className="text-gray-500 text-xs mt-1 ml-9">Pannello Admin</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(item => {
          const attivo = item.href === '/admin'
            ? path === '/admin'
            : path.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                attivo
                  ? 'bg-amber-400 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Vai al portale
        </Link>
      </div>
    </aside>
  )
}
