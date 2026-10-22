import { slugify } from '@/lib/eventi-proposti'

// Similarità tra titoli di eventi, usata per riconoscere i doppioni sia dalla
// ricerca automatica (api/cron/ricerca-eventi) sia nella pagina admin
// "Da approvare". 1 = stesse parole significative, 0 = nessuna in comune.

export function paroleTitolo(t: string): Set<string> {
  return new Set(slugify(t).split('-').filter(p => p.length > 2 && !/^20\d\d$/.test(p)))
}

// Coppie di parole consecutive unite ("wine sicily" → "winesicily"): così
// "WineSicily 2026" e "Wine Sicily 2026" risultano lo stesso titolo.
function paroleUnite(t: string): Set<string> {
  const p = slugify(t).split('-').filter(Boolean)
  return new Set(p.slice(1).map((x, i) => p[i] + x))
}

export function similarita(a: string, b: string): number {
  const A = paroleTitolo(a), B = paroleTitolo(b)
  if (!A.size || !B.size) return 0
  const uniteA = paroleUnite(a), uniteB = paroleUnite(b)
  let comuni = 0, uniteInA = 0, uniteInB = 0
  for (const p of A) {
    if (B.has(p)) comuni++
    else if (uniteB.has(p)) { comuni++; uniteInB++ }
  }
  for (const p of B) if (!A.has(p) && uniteA.has(p)) { comuni++; uniteInA++ }
  // Una parola unita corrisponde a due parole dell'altro titolo: queste
  // contano come una sola nella dimensione di quel titolo.
  return comuni / Math.min(A.size - uniteInA, B.size - uniteInB)
}
