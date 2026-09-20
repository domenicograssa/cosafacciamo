// Invio di eventi custom a Google Analytics (GA4), da marcare come "eventi
// chiave" (conversioni) nell'Amministrazione di GA4 una volta che iniziano
// a comparire nei report — quella marcatura si fa dall'interfaccia GA4 e va
// fatta a mano, qui ci limitiamo a mandare gli eventi con un nome stabile.
//
// Stesso pattern difensivo di lib/pwa/installazione.ts: gtag esiste solo se
// l'utente ha dato consenso ai cookie analitici (vedi components/Analytics.tsx).
// Se manca, la funzione non fa nulla — nessun dato personale viene mai raccolto
// qui, solo il nome dell'azione e i parametri espliciti passati dal chiamante.
type Gtag = (comando: string, evento: string, parametri?: Record<string, unknown>) => void

export function tracciaEventoGA(nome: string, parametri?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  const gtag = (window as unknown as { gtag?: Gtag }).gtag
  if (typeof gtag !== 'function') return
  try {
    gtag('event', nome, parametri)
  } catch {
    /* il tracciamento non deve mai rompere la navigazione dell'utente */
  }
}
