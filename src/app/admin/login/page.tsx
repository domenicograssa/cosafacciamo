'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function AdminLogin() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') ?? '/admin'

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
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">

        {/* Logo */}
        <div className="text-center">
          <div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-extrabold text-xl">c</span>
          </div>
          <h1 className="text-xl font-extrabold text-white">Pannello Admin</h1>
          <p className="text-gray-400 text-sm mt-1">cosafacciamo</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="bg-gray-800 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="admin@cosafacciamo.it"
              className="w-full bg-gray-700 text-white text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-400 placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-gray-700 text-white text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {errore && (
            <p className="text-red-400 text-sm bg-red-900/30 border border-red-800 rounded-xl px-4 py-3">
              {errore}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-400 hover:bg-amber-500 disabled:bg-amber-400/50 text-white font-bold py-3 rounded-xl transition-colors"
          >
            {loading ? 'Accesso in corso…' : 'Accedi'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-600">
          <Link href="/" className="text-gray-500 hover:text-gray-300 transition-colors">
            ← Torna al portale
          </Link>
        </p>
      </div>
    </div>
  )
}
