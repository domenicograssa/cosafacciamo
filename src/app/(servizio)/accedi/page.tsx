'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import LogoMoesco from '@/components/layout/LogoMoesco'

function AccediForm() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') ?? '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errore, setErrore] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrore('')

    const sb = createClient()
    const { error } = await sb.auth.signInWithPassword({ email, password })

    if (error) {
      setErrore('Email o password non corretti.')
      setLoading(false)
      return
    }

    router.push(redirect)
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">

        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-block mb-4">
            <LogoMoesco height={48} />
          </Link>
          <h1 className="text-xl font-extrabold text-gray-900">Accedi come organizzatore</h1>
          <p className="text-gray-500 text-sm mt-1">
            Gestisci i tuoi eventi su moesco
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="la-tua@email.it"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>

          {errore && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {errore}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors"
          >
            {loading ? 'Accesso in corso…' : 'Accedi'}
          </button>
        </form>

        <div className="text-center text-sm text-gray-500 space-y-2">
          <p>
            Non hai ancora un account?{' '}
            <Link href="/registrati" className="text-amber-600 font-semibold hover:underline">
              Registrati
            </Link>
          </p>
          <p>
            <Link href="/" className="text-gray-400 hover:text-gray-600 text-xs">
              ← Torna al portale
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function Accedi() {
  return (
    <Suspense>
      <AccediForm />
    </Suspense>
  )
}
