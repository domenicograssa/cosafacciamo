import Link from 'next/link'
import { getLang } from '@/lib/i18n/getLang'

// Pagina mostrata dal service worker quando l'utente apre l'app senza rete e
// la pagina richiesta non è in cache (vedi public/sw.js).
export const metadata = {
  title: 'Sei offline — moesco',
  robots: { index: false, follow: false },
}

export default async function OfflinePage() {
  const lang = await getLang()
  const isEn = lang === 'en'

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <p className="text-5xl">📡</p>
      <h1 className="mt-4 text-2xl font-extrabold text-gray-900">
        {isEn ? 'You are offline' : 'Sei offline'}
      </h1>
      <p className="mt-2 text-gray-600">
        {isEn
          ? 'No internet connection right now. The pages you already visited stay available; the rest will load as soon as you are back online.'
          : 'Al momento non c’è connessione. Le pagine che hai già visitato restano consultabili, il resto si caricherà appena torni online.'}
      </p>
      <Link
        href={isEn ? '/en' : '/'}
        className="mt-6 inline-block rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-500"
      >
        {isEn ? 'Try again' : 'Riprova'}
      </Link>
    </div>
  )
}
