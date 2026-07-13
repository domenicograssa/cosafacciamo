// Fuso orario di riferimento del portale: senza questo, il server (UTC) mostrerebbe orari sbagliati
const TZ = 'Europe/Rome'

export function formatData(dateStr: string, opzioni?: Intl.DateTimeFormatOptions): string {
  const data = new Date(dateStr)
  return data.toLocaleDateString('it-IT', {
    ...(opzioni ?? { weekday: 'short', day: 'numeric', month: 'short' }),
    timeZone: TZ,
  })
}

export function formatOra(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('it-IT', {
    hour: '2-digit', minute: '2-digit', timeZone: TZ,
  })
}

// Alcuni eventi "figli" di festival (script SQL con colonna ora_inizio,
// es. Orestiadi, Segesta, Trapani Luglio Musicale) salvano data_inizio come
// sola data (mezzanotte UTC) e l'orario reale in ora_inizio (VARCHAR
// "21:00"): senza questa combinazione, formatOra() mostra sempre "02:00"
// (mezzanotte UTC convertita in Europe/Rome). data_fine in questi casi
// duplica solo la data di data_inizio (nessun vero orario di fine salvato),
// quindi va azzerata per non mostrare un range fittizio tipo "02:00 – 02:00".
export function risolviOrarioEvento(
  dataInizio: string,
  dataFine: string | null,
  oraInizio?: string | null
): { dataInizio: string; dataFine: string | null } {
  if (!oraInizio) return { dataInizio, dataFine }

  const soloData = dataInizio.slice(0, 10) // YYYY-MM-DD
  const probe = new Date(`${soloData}T12:00:00Z`)
  const offset = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, timeZoneName: 'longOffset',
  }).formatToParts(probe).find(p => p.type === 'timeZoneName')?.value.replace('GMT', '') || '+01:00'

  return { dataInizio: `${soloData}T${oraInizio}:00${offset}`, dataFine: null }
}

// Gli stessi script SQL dei festival che causano il bug dell'orario (vedi
// risolviOrarioEvento) salvano il prezzo come testo libero in una colonna
// `prezzo` (es. "Da €15 a €35") invece che in prezzo_min/prezzo_max: senza
// il parametro testoLibero, formatPrezzo mostra "Prezzo da definire" anche
// quando il prezzo reale è noto.
export function formatPrezzo(
  min: number | null,
  max: number | null,
  gratuito: boolean,
  testoLibero?: string | null
): string {
  if (gratuito) return 'Gratuito'
  if (min === null) return testoLibero?.trim() || 'Prezzo da definire'
  if (max && max > min) return `da € ${min}`
  return `€ ${min}`
}

// Vero se dataFine cade in un giorno diverso da dataInizio (in Europe/Rome) —
// distingue un evento puntuale (stesso giorno, con orario di inizio/fine) da
// un evento/rassegna "multi-giorno" (festival, cartellone stagionale...) per
// cui mostrare un orario secco come "02:00 – 02:00" non ha senso.
export function eMultiGiorno(dataInizio: string, dataFine: string | null): boolean {
  if (!dataFine) return false
  const giornoInizio = formatData(dataInizio, { year: 'numeric', month: 'numeric', day: 'numeric' })
  const giornoFine = formatData(dataFine, { year: 'numeric', month: 'numeric', day: 'numeric' })
  return giornoInizio !== giornoFine
}

// Vero se un evento multi-giorno è "in corso" adesso (iniziato ma non ancora finito).
export function eInCorso(dataInizio: string, dataFine: string | null): boolean {
  if (!dataFine) return false
  const adesso = Date.now()
  return new Date(dataInizio).getTime() <= adesso && new Date(dataFine).getTime() >= adesso
}

// Formatta un intervallo di date leggibile, evitando ripetizioni inutili:
// stesso mese → "10 – 19 luglio 2026"; mesi diversi, stesso anno → "10 luglio – 6 settembre 2026".
export function formatIntervalloData(dataInizio: string, dataFine: string): string {
  const inizio = new Date(dataInizio)
  const fine = new Date(dataFine)
  const partsOf = (d: Date) => Object.fromEntries(
    new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ })
      .formatToParts(d).map(p => [p.type, p.value])
  ) as Record<string, string>
  const pi = partsOf(inizio)
  const pf = partsOf(fine)

  if (pi.year !== pf.year) {
    return `${formatData(dataInizio, { day: 'numeric', month: 'long', year: 'numeric' })} – ${formatData(dataFine, { day: 'numeric', month: 'long', year: 'numeric' })}`
  }
  if (pi.month !== pf.month) {
    return `${pi.day} ${pi.month} – ${pf.day} ${pf.month} ${pf.year}`
  }
  return `${pi.day} – ${pf.day} ${pf.month} ${pf.year}`
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

// Normalizza un testo per ricerche: minuscole, senza accenti, senza spazi esterni
const COMBINING_MARKS = /[̀-ͯ]/g
export function normalizzaTesto(s: string): string {
  return s.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase().trim()
}
