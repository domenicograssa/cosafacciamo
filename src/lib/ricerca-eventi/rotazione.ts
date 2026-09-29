// Rotazione dei comuni per la ricerca automatica eventi.
// 26 comuni (25 provincia di Trapani + Palermo città) in 5 gruppi; il cron gira
// lun/mer/ven e la rotazione avanza a ogni esecuzione, così in ~9 giorni
// (5 esecuzioni) si coprono tutti i comuni.
//   indice_run    = (settimana_ISO - 1) * 3 + run_in_settimana   (lun=0, mer=1, ven=2)
//   indice_gruppo = indice_run % 5

export interface Comune {
  nome: string
  slug: string
}

export const GRUPPI: Comune[][] = [
  [
    { nome: 'Alcamo', slug: 'alcamo' },
    { nome: 'Buseto Palizzolo', slug: 'buseto-palizzolo' },
    { nome: 'Calatafimi Segesta', slug: 'calatafimi-segesta' },
    { nome: 'Campobello di Mazara', slug: 'campobello-di-mazara' },
    { nome: 'Castellammare del Golfo', slug: 'castellammare-del-golfo' },
    { nome: 'Castelvetrano', slug: 'castelvetrano' },
  ],
  [
    { nome: 'Custonaci', slug: 'custonaci' },
    { nome: 'Erice', slug: 'erice' },
    { nome: 'Favignana', slug: 'favignana' },
    { nome: 'Gibellina', slug: 'gibellina' },
    { nome: 'Marsala', slug: 'marsala' },
  ],
  [
    { nome: 'Mazara del Vallo', slug: 'mazara-del-vallo' },
    { nome: 'Misiliscemi', slug: 'misiliscemi' },
    { nome: 'Paceco', slug: 'paceco' },
    { nome: 'Palermo', slug: 'palermo' },
    { nome: 'Pantelleria', slug: 'pantelleria' },
  ],
  [
    { nome: 'Partanna', slug: 'partanna' },
    { nome: 'Petrosino', slug: 'petrosino' },
    { nome: 'Poggioreale', slug: 'poggioreale' },
    { nome: 'Salaparuta', slug: 'salaparuta' },
    { nome: 'Salemi', slug: 'salemi' },
  ],
  [
    { nome: 'San Vito Lo Capo', slug: 'san-vito-lo-capo' },
    { nome: 'Santa Ninfa', slug: 'santa-ninfa' },
    { nome: 'Trapani', slug: 'trapani' },
    { nome: 'Valderice', slug: 'valderice' },
    { nome: 'Vita', slug: 'vita' },
  ],
]

export const TUTTI_I_COMUNI: Comune[] = GRUPPI.flat()

/** Data odierna a Roma come { anno, mese, giorno, isoString "YYYY-MM-DD" }. */
export function oggiRoma(adesso = new Date()) {
  const parti = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(adesso) // "YYYY-MM-DD"
  const [anno, mese, giorno] = parti.split('-').map(Number)
  return { anno, mese, giorno, iso: parti }
}

/** Settimana ISO e giorno ISO (1=lun … 7=dom) della data odierna a Roma. */
export function settimanaIso(adesso = new Date()) {
  const { anno, mese, giorno } = oggiRoma(adesso)
  const d = new Date(Date.UTC(anno, mese - 1, giorno))
  const giornoIso = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - giornoIso) // giovedì della stessa settimana
  const inizioAnno = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const settimana = Math.ceil(((d.getTime() - inizioAnno.getTime()) / 86400000 + 1) / 7)
  return { settimana, giornoIso }
}

/**
 * Indice del gruppo di oggi. Se il cron gira in un giorno non previsto
 * (es. un recupero manuale di martedì), usa l'ultimo giorno di esecuzione
 * precedente: mar→lun, gio→mer, sab/dom→ven.
 */
export function gruppoDiOggi(adesso = new Date()): number {
  const { settimana, giornoIso } = settimanaIso(adesso)
  const runInSettimana = giornoIso <= 2 ? 0 : giornoIso <= 4 ? 1 : 2
  const indiceRun = (settimana - 1) * 3 + runInSettimana
  return indiceRun % 5
}
