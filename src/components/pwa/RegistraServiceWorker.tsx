'use client'

import { useEffect } from 'react'

/**
 * Registra il service worker (vedi public/sw.js), necessario perché il sito sia
 * installabile come app e funzioni anche senza rete.
 *
 * Va montato una sola volta, nel layout principale. Non renderizza nulla.
 */
export default function RegistraServiceWorker() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return
    // In sviluppo il service worker darebbe fastidio (serve cache vecchie
    // mentre si lavora), quindi si registra solo in produzione.
    if (process.env.NODE_ENV !== 'production') return

    const registra = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Un fallimento qui non deve rompere il sito: senza service worker il
        // portale funziona normalmente, semplicemente non è installabile.
      })
    }

    // Si aspetta il load per non rubare banda al primo rendering.
    if (document.readyState === 'complete') registra()
    else window.addEventListener('load', registra, { once: true })
  }, [])

  return null
}
