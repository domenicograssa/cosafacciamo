import type { Lang } from './i18n/strings'

// Fuso orario di riferimento del portale: senza questo, il server (UTC) mostrerebbe orari sbagliati
const TZ = 'Europe/Rome'

// Locale da usare per Intl a seconda della lingua del sito. Prima di questa
// mappa, formatData/formatOra/formatIntervalloData erano fissi su 'it-IT':
// sulle pagine /en questo mostrava date miste tipo "sab 8 ago" dentro card
// altrimenti in inglese (bug segnalato dall'utente, "come al solito il
// problema di traduzione" — 8/8/2026).
const LOCALE: Record<Lang, string> = { it: 'it-IT', en: 'en-US' }

export function formatData(dateStr: string, opzioni?: Intl.DateTimeFormatOptions, lang: Lang = 'it'): string {
  const data = new Date(dateStr)
  return data.toLocaleDateString(LOCALE[lang], {
    ...(opzioni ?? { weekday: 'short', day: 'numeric', month: 'short' }),
    timeZone: TZ,
  })
}

export function formatOra(dateStr: string, lang: Lang = 'it'): string {
  return new Date(dateStr).toLocaleTimeString(LOCALE[lang], {
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
const PREZZO_LABELS: Record<Lang, { gratuito: string; daDefinire: string; da: string }> = {
  it: { gratuito: 'Gratuito', daDefinire: 'Prezzo da definire', da: 'da' },
  en: { gratuito: 'Free', daDefinire: 'Price to be announced', da: 'from' },
}

export function formatPrezzo(
  min: number | null,
  max: number | null,
  gratuito: boolean,
  testoLibero?: string | null,
  lang: Lang = 'it'
): string {
  const l = PREZZO_LABELS[lang]
  if (gratuito) return l.gratuito
  if (min === null) return testoLibero?.trim() || l.daDefinire
  if (max && max > min) return `${l.da} € ${min}`
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
export function formatIntervalloData(dataInizio: string, dataFine: string, lang: Lang = 'it'): string {
  const inizio = new Date(dataInizio)
  const fine = new Date(dataFine)
  const partsOf = (d: Date) => Object.fromEntries(
    new Intl.DateTimeFormat(LOCALE[lang], { day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ })
      .formatToParts(d).map(p => [p.type, p.value])
  ) as Record<string, string>
  const pi = partsOf(inizio)
  const pf = partsOf(fine)

  if (pi.year !== pf.year) {
    return `${formatData(dataInizio, { day: 'numeric', month: 'long', year: 'numeric' }, lang)} – ${formatData(dataFine, { day: 'numeric', month: 'long', year: 'numeric' }, lang)}`
  }
  if (pi.month !== pf.month) {
    return `${pi.day} ${pi.month} – ${pf.day} ${pf.month} ${pf.year}`
  }
  return `${pi.day} – ${pf.day} ${pf.month} ${pf.year}`
}

// Converte un timestamp salvato (UTC) negli input <date>/<time> di un form,
// mostrando data e ora in Europe/Rome. Prima del fix, i form di modifica
// evento leggevano i caratteri grezzi dell'ISO string (UTC) come se fossero
// già ora locale: ogni salvataggio senza toccare l'orario lo faceva slittare
// di 2 ore indietro (bug scoperto sull'evento Loredana Bertè, 22/07/2026).
export function dataOraInputRoma(iso: string | null): { data: string; ora: string } {
  if (!iso) return { data: '', ora: '' }
  const d = new Date(iso)
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(d)
  const get = (t: string) => parts.find(p => p.type === t)?.value ?? ''
  return { data: `${get('year')}-${get('month')}-${get('day')}`, ora: `${get('hour')}:${get('minute')}` }
}

// Converte data/ora inserite come Europe/Rome (dai form di modifica) nell'ISO
// string UTC corretto da salvare. L'offset (+01:00 CET o +02:00 CEST) viene
// calcolato dinamicamente per la data in questione, invece di essere fissato
// a +02:00: senza questo, gli eventi modificati in inverno (ora solare)
// finirebbero salvati con un'ora di scarto.
export function isoDaRoma(data: string, ora: string): string {
  if (!data || !ora) return ''
  const probe = new Date(`${data}T12:00:00Z`)
  const offset = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, timeZoneName: 'longOffset',
  }).formatToParts(probe).find(p => p.type === 'timeZoneName')?.value.replace('GMT', '') || '+01:00'
  return `${data}T${ora}:00${offset}`
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

// ─── Contrasto dei colori categoria (accessibilità) ─────────────────────────
// I colori delle categorie arrivano dal database e sono pensati per essere
// vivaci, non per reggere del testo bianco sopra: misurati sulla home, chip
// come "Mare" (#0EA5E9) davano 2,77:1 e "Per famiglie" (#EC4899) 3,53:1,
// sotto il minimo di 4,5:1 richiesto da WCAG 2.1 AA (criterio 1.4.3) per il
// testo normale. Invece di rimettere mano ai colori nel database — che
// verrebbero comunque usati altrove come tinta decorativa — si scurisce qui
// il colore quanto basta perché il bianco sopra risulti leggibile.
// La tinta resta riconoscibile: si abbassa solo la luminosità.

function hexAOrgb(hex: string): [number, number, number] | null {
  const pulito = hex.trim().replace('#', '')
  const esteso = pulito.length === 3 ? pulito.split('').map(c => c + c).join('') : pulito
  if (!/^[0-9a-f]{6}$/i.test(esteso)) return null
  return [
    parseInt(esteso.slice(0, 2), 16),
    parseInt(esteso.slice(2, 4), 16),
    parseInt(esteso.slice(4, 6), 16),
  ]
}

function luminanzaRelativa([r, g, b]: [number, number, number]): number {
  const canale = (v: number) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * canale(r) + 0.7152 * canale(g) + 0.0722 * canale(b)
}

/** Rapporto di contrasto del colore dato rispetto al bianco. */
function contrastoConBianco(rgb: [number, number, number]): number {
  return 1.05 / (luminanzaRelativa(rgb) + 0.05)
}

/**
 * Restituisce il colore di sfondo scurito quanto basta perché il testo bianco
 * sopra raggiunga il rapporto di contrasto richiesto.
 * @param hex colore originale della categoria (es. "#0EA5E9")
 * @param minimo rapporto minimo — 4.5 per testo normale, 3 per testo grande
 */
export function sfondoConTestoBianco(hex: string | null | undefined, minimo = 4.5): string {
  if (!hex) return '#4B5563' // grigio neutro di riserva (7,5:1 sul bianco)
  const rgb = hexAOrgb(hex)
  if (!rgb) return hex

  let corrente = rgb
  // Scurisce del 6% per volta finché il contrasto è sufficiente (max 40 passi:
  // si arriva comunque al nero, che ha il contrasto massimo).
  for (let i = 0; i < 40 && contrastoConBianco(corrente) < minimo; i++) {
    corrente = corrente.map(c => Math.round(c * 0.94)) as [number, number, number]
  }
  return '#' + corrente.map(c => c.toString(16).padStart(2, '0')).join('')
}

// Normalizza un testo per ricerche: minuscole, senza accenti, senza spazi esterni
const COMBINING_MARKS = /[̀-ͯ]/g
export function normalizzaTesto(s: string): string {
  return s.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase().trim()
}
