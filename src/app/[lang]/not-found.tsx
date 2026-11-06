import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-7xl mb-4">🗺️</p>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Pagina non trovata</h1>
      <p className="text-gray-500 mb-8 max-w-sm">
        La pagina che stai cercando non esiste o è stata rimossa.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="bg-amber-400 hover:bg-amber-500 text-white font-bold px-6 py-3 rounded-xl transition-colors"
        >
          Torna alla home
        </Link>
        <Link
          href="/eventi"
          className="border-2 border-gray-200 hover:border-amber-400 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          Vedi gli eventi
        </Link>
      </div>
    </div>
  )
}
