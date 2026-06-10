import Link from 'next/link'
import Image from 'next/image'
import { getComuni } from '@/lib/queries/geo'
import { COMUNE_IMMAGINI } from '@/data/comuni-immagini'

export const revalidate = 3600

export const metadata = {
  title: 'Località — che facciamo?',
  description: 'Esplora eventi e attività nei 25 comuni della provincia di Trapani.',
}

export default async function LocalitaIndexPage() {
  const comuni = await getComuni()
  const conFoto = comuni.filter(c => COMUNE_IMMAGINI[c.slug])
  const senzaFoto = comuni.filter(c => !COMUNE_IMMAGINI[c.slug])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      <h1 className="text-2xl font-bold text-gray-900">Località</h1>
      <p className="text-sm text-gray-500 mt-1 mb-8">
        Esplora eventi e attività nei {comuni.length} comuni della provincia di Trapani.
      </p>

      {/* Comuni con foto */}
      {conFoto.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {conFoto.map(c => {
            const img = COMUNE_IMMAGINI[c.slug]
            return (
              <Link
                key={c.id}
                href={`/localita/${c.slug}`}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <Image
                  src={img.url}
                  alt={img.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <p className="absolute bottom-3 left-4 right-4 text-white font-bold text-lg leading-tight">
                  {c.nome}
                </p>
              </Link>
            )
          })}
        </div>
      )}

      {/* Tutti gli altri comuni */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {senzaFoto.map(c => (
          <Link
            key={c.id}
            href={`/localita/${c.slug}`}
            className="flex items-center gap-2.5 bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 hover:shadow-md hover:border-amber-200 transition-all group"
          >
            <span className="text-lg">📍</span>
            <span className="text-sm font-semibold text-gray-800 group-hover:text-amber-600 transition-colors truncate">
              {c.nome}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
