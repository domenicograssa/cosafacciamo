// Gestione centralizzata dell'invito a installare l'app.
//
// PERCHÉ UN MODULO A PARTE E NON LA LOGICA DENTRO IL COMPONENTE:
// il browser emette `beforeinstallprompt` UNA SOLA VOLTA, subito dopo il
// caricamento della pagina. Se l'ascoltatore viene registrato da un componente
// che si monta più tardi — per esempio arrivando su /app con una navigazione
// interna, che in Next.js non ricarica la pagina — l'evento è già passato e il
// pulsante "Installa app" non compare mai. Era esattamente il bug segnalato.
// Qui l'ascoltatore parte al primo import del modulo (quindi già nel layout,
// su ogni pagina) e l'evento viene conservato finché serve.

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const CHIAVE_MAI = 'moesco_install_mai'      // "non chiedere più"
const CHIAVE_RINVIO = 'moesco_install_rinvio' // "più tardi" (timestamp)
const GIORNI_RINVIO = 14

let promptSalvato: BeforeInstallPromptEvent | null = null
let installata = false
// Vero se l'installazione è partita dal pulsante del sito e non dal menu del
// browser — serve solo a distinguere l'origine nel conteggio.
let promptSalvatoUsato = false
const iscritti = new Set<() => void>()

function avvisa() {
  iscritti.forEach((cb) => cb())
}

// ─── Conteggio delle installazioni ──────────────────────────────────────────
// Il browser non fornisce alcun contatore di installazioni e Google Analytics
// non le rileva da solo: senza questo invio esplicito non esiste modo di sapere
// quante persone hanno aggiunto l'app al telefono.
//
// gtag esiste solo se l'utente ha acconsentito ai cookie analitici (vedi
// components/Analytics.tsx): se il consenso manca, la funzione non fa nulla e
// l'installazione semplicemente non viene conteggiata. Nessun dato personale
// viene inviato, solo il fatto che è avvenuta un'installazione.
type Gtag = (comando: string, evento: string, parametri?: Record<string, unknown>) => void

function tracciaEvento(nome: string, parametri?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  const gtag = (window as unknown as { gtag?: Gtag }).gtag
  if (typeof gtag !== 'function') return
  try {
    gtag('event', nome, parametri)
  } catch {
    /* il tracciamento non deve mai rompere l'installazione */
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault() // blocca il mini-banner automatico di Chrome: mostriamo il nostro
    promptSalvato = e as BeforeInstallPromptEvent
    avvisa()
  })

  // 'appinstalled' scatta a installazione avvenuta, qualunque sia il percorso
  // seguito dall'utente: il nostro pulsante, il menu del browser o il banner
  // di sistema. È quindi il conteggio più fedele delle installazioni reali.
  window.addEventListener('appinstalled', () => {
    installata = true
    promptSalvato = null
    tracciaEvento('pwa_installata', {
      // Distingue il canale: utile per capire se il pulsante del sito serve
      // davvero o se le persone installano dal menu del browser.
      origine: promptSalvatoUsato ? 'pulsante_sito' : 'browser',
    })
    avvisa()
  })
}

export function iscriviti(cb: () => void): () => void {
  iscritti.add(cb)
  return () => iscritti.delete(cb)
}

export function promptDisponibile(): boolean {
  return promptSalvato !== null
}

/** True se il sito sta già girando come app installata. */
export function inModalitaApp(): boolean {
  if (typeof window === 'undefined') return false
  return (
    installata ||
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS non supporta display-mode: standalone nei vecchi Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

export function suIOS(): boolean {
  if (typeof window === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

/**
 * Lancia l'installazione nativa. Restituisce true se l'utente ha accettato,
 * false se ha rifiutato, null se il browser non offre l'installazione nativa
 * (tipicamente Safari: lì si possono solo dare istruzioni manuali).
 */
export async function installa(): Promise<boolean | null> {
  if (!promptSalvato) return null
  const p = promptSalvato
  promptSalvato = null // il prompt è usa e getta
  promptSalvatoUsato = true
  await p.prompt()
  const scelta = await p.userChoice
  if (scelta.outcome === 'accepted') installata = true
  // Registra anche i rifiuti: sapere quante persone aprono il prompt e poi
  // rinunciano dice se l'invito arriva nel momento sbagliato.
  tracciaEvento('pwa_prompt_esito', { esito: scelta.outcome })
  avvisa()
  return scelta.outcome === 'accepted'
}

// ─── Preferenze dell'utente sull'invito ──────────────────────────────────

export function nonChiedereMai(): void {
  try { localStorage.setItem(CHIAVE_MAI, '1') } catch { /* modalità privata */ }
  avvisa()
}

export function chiediPiuTardi(): void {
  try { localStorage.setItem(CHIAVE_RINVIO, String(Date.now())) } catch { /* modalità privata */ }
  avvisa()
}

/** Annulla il "non chiedere più" — usato dal pulsante nella pagina /app. */
export function riattivaInvito(): void {
  try {
    localStorage.removeItem(CHIAVE_MAI)
    localStorage.removeItem(CHIAVE_RINVIO)
  } catch { /* modalità privata */ }
  avvisa()
}

export function invitoDisattivato(): boolean {
  if (typeof window === 'undefined') return false
  try { return localStorage.getItem(CHIAVE_MAI) === '1' } catch { return false }
}

/** True se il banner può comparire adesso. */
export function bannerDaMostrare(): boolean {
  if (typeof window === 'undefined') return false
  if (inModalitaApp()) return false
  if (invitoDisattivato()) return false

  try {
    const rinvio = localStorage.getItem(CHIAVE_RINVIO)
    if (rinvio) {
      const giorni = (Date.now() - Number(rinvio)) / 86_400_000
      if (giorni < GIORNI_RINVIO) return false
    }
    // Non ci si sovrappone al banner cookie: prima il consenso, poi l'invito.
    if (!localStorage.getItem('moesco_cookie_consent')) return false
  } catch {
    return false
  }

  // Su iOS non esiste il prompt nativo ma l'installazione manuale è possibile,
  // quindi il banner ha senso comunque (rimanda alle istruzioni su /app).
  return promptDisponibile() || suIOS()
}
