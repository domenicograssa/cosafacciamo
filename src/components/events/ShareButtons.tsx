'use client'

import { useState } from 'react'

interface ShareButtonsProps {
  titolo: string
  url: string
}

export default function ShareButtons({ titolo, url }: ShareButtonsProps) {
  const [copiato, setCopiato] = useState(false)

  const encodedUrl  = encodeURIComponent(url)
  const encodedTesto = encodeURIComponent(`${titolo} — ${url}`)

  const copiLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // fallback per browser che non supportano clipboard API
      const el = document.createElement('input')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopiato(true)
    setTimeout(() => setCopiato(false), 2000)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Condividi</p>
      <div className="grid grid-cols-4 gap-2">

        {/* WhatsApp */}
        <a
          href={`https://wa.me/?text=${encodedTesto}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Condividi su WhatsApp"
          className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-green-50 transition-colors"
        >
          <svg className="w-7 h-7 text-green-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <span className="text-[10px] text-gray-500">WhatsApp</span>
        </a>

        {/* Facebook */}
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Condividi su Facebook"
          className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-blue-50 transition-colors"
        >
          <svg className="w-7 h-7 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          <span className="text-[10px] text-gray-500">Facebook</span>
        </a>

        {/* X / Twitter */}
        <a
          href={`https://twitter.com/intent/tweet?text=${encodedTesto}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Condividi su X"
          className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <svg className="w-7 h-7 text-gray-900" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span className="text-[10px] text-gray-500">X</span>
        </a>

        {/* Copia link */}
        <button
          onClick={copiLink}
          aria-label="Copia link"
          className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-amber-50 transition-colors"
        >
          {copiato ? (
            <>
              <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-[10px] text-green-600 font-semibold">Copiato!</span>
            </>
          ) : (
            <>
              <svg className="w-7 h-7 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="text-[10px] text-gray-500">Copia</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
