'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RecuperaPassword() {
  const [email, setEmail] = useState('')
  const [stato, setStato] = useState<'form' | 'inviato' | 'errore'>('form')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const sb = createClient()
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/nuova-password`,
    })

    setLoading(false)
    if (error) {
      setStato('errore')
    } else {
      setStato('inviato')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">

        <div className="text-center">
          <div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-extrabold text-xl">c</span>
          </div>
          <h1 className="text-xl font-extrabold text-white">Recupera password</h1>
          <p className="text-gray-400 text-sm mt-1">moesco Admin</p>
        </div>

        {stato === 'inviato' ? (
          <div className="bg-green-900/40 border border-green-700 rounded-2xl p-6 text-center space-y-3">
            <p className="text-3xl">📧</p>
            <p className="text-green-300 font-semibold">Email inviata!</p>
            <p className="text-green-400 text-sm leading-relaxed">
              Controlla la casella <strong>{email}</strong> e clicca il link per impostare la nuova password.
            </p>
            <p className="text-gray-500 text-xs">
              Non trovi l&apos;email? Controlla anche la cartella spam.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl p-6 space-y-4">
            <p className="text-gray-300 text-sm leading-relaxed">
              Inserisci l&apos;email del tuo account admin. Ti invieremo un link per reimpostare la password.
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="grassacoppola@gmail.com"
                className="w-full bg-gray-700 text-white text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-400 placeholder-gray-500"
              />
            </div>

            {stato === 'errore' && (
              <p className="text-red-400 text-sm bg-red-900/30 border border-red-800 rounded-xl px-4 py-3">
                Errore nell&apos;invio. Riprova tra qualche istante.
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-400 hover:bg-amber-500 disabled:bg-amber-400/50 text-white font-bold py-3 rounded-xl transition-colors"
            >
              {loading ? 'Invio in corso…' : 'Invia link di recupero'}
            </button>
          </form>
        )}

        <p className="text-center text-xs">
          <Link href="/admin/login" className="text-gray-500 hover:text-gray-300 transition-colors">
            ← Torna al login
          </Link>
        </p>
      </div>
    </div>
  )
}
