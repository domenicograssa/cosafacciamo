'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function NuovaPassword() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [conferma, setConferma] = useState('')
  const [stato, setStato] = useState<'form' | 'completato' | 'errore' | 'link-scaduto'>('form')
  const [errore, setErrore] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessione, setSessione] = useState(false)

  useEffect(() => {
    // Supabase gestisce automaticamente lo scambio del token dall'URL hash
    const sb = createClient()
    sb.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessione(true)
      }
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrore('')

    if (password.length < 8) {
      setErrore('La password deve essere di almeno 8 caratteri.')
      return
    }
    if (password !== conferma) {
      setErrore('Le due password non coincidono.')
      return
    }

    setLoading(true)
    const sb = createClient()
    const { error } = await sb.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      if (error.message.includes('expired') || error.message.includes('invalid')) {
        setStato('link-scaduto')
      } else {
        setStato('errore')
        setErrore(error.message)
      }
    } else {
      setStato('completato')
      setTimeout(() => router.push('/admin'), 3000)
    }
  }

  if (stato === 'completato') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <p className="text-4xl">✅</p>
          <h1 className="text-xl font-extrabold text-white">Password aggiornata!</h1>
          <p className="text-gray-400 text-sm">Verrai reindirizzato al pannello admin tra pochi secondi…</p>
          <Link href="/admin" className="inline-block text-amber-400 hover:text-amber-300 text-sm font-semibold">
            Vai subito all&apos;admin →
          </Link>
        </div>
      </div>
    )
  }

  if (stato === 'link-scaduto') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <p className="text-4xl">⏰</p>
          <h1 className="text-xl font-extrabold text-white">Link scaduto</h1>
          <p className="text-gray-400 text-sm">Il link di recupero è scaduto o è già stato usato. Richiedine uno nuovo.</p>
          <Link
            href="/admin/recupera-password"
            className="inline-block bg-amber-400 hover:bg-amber-500 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            Richiedi nuovo link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">

        <div className="text-center">
          <div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-extrabold text-xl">c</span>
          </div>
          <h1 className="text-xl font-extrabold text-white">Nuova password</h1>
          <p className="text-gray-400 text-sm mt-1">moesco Admin</p>
        </div>

        {!sessione && (
          <div className="bg-amber-900/30 border border-amber-700 rounded-2xl px-4 py-3">
            <p className="text-amber-300 text-xs text-center">
              ⚠️ Assicurati di aver cliccato il link dall&apos;email e non di aver aperto questa pagina direttamente.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
              Nuova password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Minimo 8 caratteri"
              className="w-full bg-gray-700 text-white text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
              Conferma password
            </label>
            <input
              type="password"
              value={conferma}
              onChange={e => setConferma(e.target.value)}
              required
              placeholder="Ripeti la password"
              className="w-full bg-gray-700 text-white text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {errore && (
            <p className="text-red-400 text-sm bg-red-900/30 border border-red-800 rounded-xl px-4 py-3">
              {errore}
            </p>
          )}

          {stato === 'errore' && !errore && (
            <p className="text-red-400 text-sm bg-red-900/30 border border-red-800 rounded-xl px-4 py-3">
              Errore imprevisto. Riprova o richiedi un nuovo link.
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-400 hover:bg-amber-500 disabled:bg-amber-400/50 text-white font-bold py-3 rounded-xl transition-colors"
          >
            {loading ? 'Aggiornamento…' : 'Imposta nuova password'}
          </button>
        </form>

        <p className="text-center text-xs">
          <Link href="/admin/login" className="text-gray-500 hover:text-gray-300 transition-colors">
            ← Torna al login
          </Link>
        </p>
      </div>
    </div>
  )
}
