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

export function formatPrezzo(min: number | null, max: number | null, gratuito: boolean): string {
  if (gratuito) return 'Gratuito'
  if (min === null) return 'Prezzo da definire'
  if (max && max > min) return `da € ${min}`
  return `€ ${min}`
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

// Normalizza un testo per ricerche: minuscole, senza accenti, senza spazi esterni
const COMBINING_MARKS = /[̀-ͯ]/g
export function normalizzaTesto(s: string): string {
  return s.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase().trim()
}
