// Service worker di moesco — requisito tecnico perché il sito sia installabile
// come app su Android/iOS e perché resti utilizzabile con rete assente o pessima
// (situazione normale in giro per la provincia: sagre in campagna, isole, borghi).
//
// Strategia deliberatamente prudente:
//  - NON si mette mai in cache nulla che riguardi l'area riservata (/admin,
//    /dashboard, /accedi) né le chiamate API: dati potenzialmente personali o
//    che devono essere sempre freschi.
//  - Pagine: "network first". Si prova sempre la rete, così gli eventi mostrati
//    sono aggiornati; la copia in cache serve solo se la rete non risponde.
//  - Immagini e file statici: "stale while revalidate", perché cambiano di rado
//    e sono la parte pesante da scaricare.

const VERSIONE = 'moesco-v1'
const CACHE_PAGINE = `${VERSIONE}-pagine`
const CACHE_STATICI = `${VERSIONE}-statici`
const PAGINA_OFFLINE = '/offline'

const ESCLUSI = ['/admin', '/dashboard', '/accedi', '/api', '/_next/data']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_PAGINE).then((c) => c.addAll([PAGINA_OFFLINE])).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  // Rimuove le cache delle versioni precedenti, altrimenti a ogni deploy si
  // accumulerebbero copie vecchie del sito nello spazio del telefono.
  event.waitUntil(
    caches.keys().then((chiavi) =>
      Promise.all(chiavi.filter((k) => !k.startsWith(VERSIONE)).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

function daEscludere(url) {
  return ESCLUSI.some((p) => url.pathname === p || url.pathname.startsWith(p + '/'))
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (daEscludere(url)) return

  // Navigazione tra pagine → network first, con fallback a cache e poi offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((risposta) => {
          const copia = risposta.clone()
          caches.open(CACHE_PAGINE).then((c) => c.put(request, copia))
          return risposta
        })
        .catch(async () => {
          const daCache = await caches.match(request)
          return daCache || caches.match(PAGINA_OFFLINE)
        })
    )
    return
  }

  // Immagini, CSS, JS, font → stale while revalidate.
  if (['image', 'style', 'script', 'font'].includes(request.destination)) {
    event.respondWith(
      caches.open(CACHE_STATICI).then(async (cache) => {
        const daCache = await cache.match(request)
        const dallaRete = fetch(request)
          .then((risposta) => {
            if (risposta.ok) cache.put(request, risposta.clone())
            return risposta
          })
          .catch(() => daCache)
        return daCache || dallaRete
      })
    )
  }
})
