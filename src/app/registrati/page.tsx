'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import LogoMoesco from '@/components/layout/LogoMoesco'
import { completaRegistrazione } from '@/app/actions/registrazione'

function slugify(testo: string): string {
  return testo
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export default function Registrati() {
  const router = useRouter()

  const [step, setStep] = useState<'form' | 'conferma'>('form')
  const [loading, setLoading] = useState(false)
  const [errore, setErrore] = useState('')

  // Dati form
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [sitoWeb, setSitoWeb] = useState('')
  const [descrizione, setDescrizione] = useState('')
  const [password, setPassword] = useState('')
  const [consenso, setConsenso] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!consenso) {
      setErrore('Devi accettare i termini e la privacy policy per continuare.')
      return
    }
    setLoading(true)
    setErrore('')

    const sb = createClient()

    // 1. Crea l'utente in Supabase Auth
    const { data: authData, error: authError } = await sb.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    })

    if (authError || !authData.user) {
      setErrore(authError?.message === 'User already registered'
        ? 'Esiste già un account con questa email. Usa il login.'
        : 'Errore durante la registrazione. Riprova.')
      setLoading(false)
      return
    }

    // 2. Crea profilo organizzatore + invia email via server action
    const esito = await completaRegistrazione({
      authUserId: authData.user.id,
      nome,
      email,
      telefono: telefono || undefined,
      sitoWeb: sitoWeb || undefined,
      descrizione: descrizione || undefined,
    })

    if (!esito.ok) {
      setErrore(esito.errore ?? 'Errore nella creazione del profilo. Contattaci.')
      setLoading(false)
      return
    }

    setStep('conferma')
    setLoading(false)
  }

  if (step === 'conferma') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-3xl">✅</span>
          </div>
          <h1 className="text-xl font-extrabold text-gray-900">Registrazione completata!</h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Ti abbiamo inviato un&apos;email di conferma. Clicca il link al suo interno per attivare l&apos;account.
            Una volta confermato, il tuo profilo verrà esaminato dall&apos;amministratore.
            Ti avviseremo via email quando potrai iniziare a pubblicare.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-left space-y-1">
            <p className="text-xs font-semibold text-amber-800">📧 Non trovi l&apos;email?</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              L&apos;email arriva dal mittente <span className="font-mono font-semibold">noreply@mail.app.supabase.io</span> — il sistema di autenticazione che utilizziamo. Controlla la cartella <strong>spam</strong> o <strong>posta indesiderata</strong> se non la vedi in arrivo.
            </p>
          </div>
          <Link href="/" className="inline-block mt-4 text-amber-600 font-semibold hover:underline text-sm">
            Torna al portale →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">

        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-block mb-4">
            <LogoMoesco height={48} />
          </Link>
          <h1 className="text-xl font-extrabold text-gray-900">Crea il tuo account organizzatore</h1>
          <p className="text-gray-500 text-sm mt-1">
            Pubblica i tuoi eventi su moesco — in pochi minuti
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Nome organizzatore / associazione *
            </label>
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              required
              placeholder="Es. Pro Loco Alcamo, Mario Rossi…"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Email *
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
              Password *
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Minimo 8 caratteri"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Telefono
            </label>
            <input
              type="tel"
              value={telefono}
              onChange={e => setTelefono(e.target.value)}
              placeholder="+39 091 000 0000"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Sito web
            </label>
            <input
              type="url"
              value={sitoWeb}
              onChange={e => setSitoWeb(e.target.value)}
              placeholder="https://…"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Chi siete / cosa fate
            </label>
            <textarea
              value={descrizione}
              onChange={e => setDescrizione(e.target.value)}
              rows={3}
              placeholder="Breve presentazione dell'organizzazione…"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
            />
          </div>

          {/* Consenso */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consenso}
              onChange={e => setConsenso(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-amber-400 shrink-0"
            />
            <span className="text-xs text-gray-600 leading-relaxed">
              Ho letto e accetto i{' '}
              <Link href="/termini-e-condizioni" target="_blank" className="text-amber-600 underline">Termini e Condizioni</Link>,
              la{' '}
              <Link href="/privacy-policy" target="_blank" className="text-amber-600 underline">Privacy Policy</Link> e
              le{' '}
              <Link href="/condizioni-organizzatori" target="_blank" className="text-amber-600 underline">Condizioni per gli Organizzatori</Link>.
            </span>
          </label>

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
            {loading ? 'Registrazione in corso…' : 'Crea account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Hai già un account?{' '}
          <Link href="/accedi" className="text-amber-600 font-semibold hover:underline">
            Accedi
          </Link>
        </p>
      </div>
    </div>
  )
}
