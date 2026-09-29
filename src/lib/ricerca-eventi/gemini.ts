import type { EventoCandidato } from '@/lib/eventi-proposti'
import { promptDiSistema, promptUtente, estraiJson, type ContestoRicerca, type EsitoRicercaClaude } from './claude'

// Motore economico: API Gemini di Google con "Grounding with Google Search",
// tramite la Interactions API (POST /v1beta/interactions).
//
// STORIA (30/9/2026): la prima versione usava generateContent con
// tools: [{ google_search: {} }]. Con i modelli 3.x quella API (ora "Legacy")
// accettava la richiesta ma NON eseguiva mai la ricerca: Gemini rispondeva a
// memoria e scriveva nelle note di aver cercato. La Interactions API invece
// restituisce i passaggi "google_search_call" e le citazioni "url_citation"
// con gli URL reali delle fonti.
//
// Costi: la ricerca Google è inclusa fino a 5.000 query/mese (condivise tra i
// modelli 3.x) SOLO con fatturazione attiva; nel piano gratuito non è disponibile.
//
// Variabili d'ambiente:
//   GEMINI_API_KEY  (obbligatoria)  da aistudio.google.com → Chiavi API
//   GEMINI_MODEL    (facoltativa)   default "gemini-3.5-flash-lite"

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/interactions'
const MODELLO_DEFAULT = 'gemini-3.5-flash-lite'

interface Annotazione { type?: string; url?: string; title?: string; start_index?: number; end_index?: number }
interface BloccoContenuto { type?: string; text?: string; annotations?: Annotazione[] }
interface Passo {
  type?: string
  arguments?: { queries?: string[] }
  content?: BloccoContenuto[]
  result?: Array<{ url?: string; title?: string }>
}
interface RispostaInteraction {
  id?: string
  status?: string
  model?: string
  steps?: Passo[]
  usage?: { total_input_tokens?: number; total_output_tokens?: number; total_tokens?: number }
  error?: { message?: string; code?: number }
}

/** Se Google restituisce un link di reindirizzamento, lo risolve nell'URL originale. */
async function risolviRedirect(uri: string): Promise<string> {
  if (!uri.includes('grounding-api-redirect')) return uri
  try {
    const r = await fetch(uri, { method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(8000) })
    const loc = r.headers.get('location')
    if (loc) return loc
    const r2 = await fetch(uri, { redirect: 'follow', signal: AbortSignal.timeout(8000) })
    return r2.url || uri
  } catch {
    return uri
  }
}

function host(u: string): string {
  try { return new URL(u).hostname.replace(/^www\./, '') } catch { return '' }
}

function norm(u: string): string {
  return u.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/#.*$/, '').replace(/\/+$/, '')
}

export async function cercaEventiConGemini(ctx: ContestoRicerca, segnale?: AbortSignal, modelloForzato?: string): Promise<EsitoRicercaClaude> {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) throw new Error('GEMINI_API_KEY non impostata.')
  const modello = modelloForzato || process.env.GEMINI_MODEL?.trim() || MODELLO_DEFAULT

  const obbligoRicerca = (insistente: boolean) =>
    `ISTRUZIONE OBBLIGATORIA: prima di rispondere DEVI usare lo strumento di ricerca Google ` +
    `ed eseguire almeno 6 ricerche distinte (una per ciascuna categoria: musica, food & wine, cultura, ` +
    `sport, feste patronali/tradizioni, famiglie), più eventuali ricerche di approfondimento sui singoli eventi. ` +
    `Non rispondere MAI dalla tua memoria: ogni evento deve provenire da un risultato di ricerca di questa sessione.` +
    (insistente ? ' Il tentativo precedente è stato scartato perché non hai effettuato ricerche: questa volta cerca davvero.' : '') +
    `\n\n`

  const chiama = async (insistente: boolean): Promise<RispostaInteraction> => {
    const res = await fetch(API_URL, {
      method: 'POST',
      signal: segnale,
      headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        model: modello,
        system_instruction: promptDiSistema(),
        input: obbligoRicerca(insistente) + promptUtente(ctx),
        tools: [{ type: 'google_search' }],
      }),
    })
    const d = (await res.json().catch(() => ({}))) as RispostaInteraction
    if (!res.ok) throw new Error(`API Gemini ${res.status}: ${d.error?.message ?? 'errore sconosciuto'}`)
    if (d.status && d.status !== 'completed') throw new Error(`API Gemini: interazione in stato "${d.status}"`)
    return d
  }

  const querDi = (d: RispostaInteraction) =>
    (d.steps ?? []).filter(s => s.type === 'google_search_call').flatMap(s => s.arguments?.queries ?? [])

  let dati = await chiama(false)
  let tentativi = 1
  if (querDi(dati).length === 0) { dati = await chiama(true); tentativi = 2 }

  const passi = dati.steps ?? []
  const query = querDi(dati)

  // Testo finale e citazioni: dall'ultimo passo "model_output" che contiene testo.
  const uscite = passi.filter(s => s.type === 'model_output')
  const blocchi = uscite.flatMap(s => s.content ?? []).filter(b => b.type === 'text')
  const testo = blocchi.map(b => b.text ?? '').join('')

  // Citazioni: ogni annotazione indica il tratto del blocco di testo che cita.
  const citazioni: Array<{ url: string; testoCitato: string }> = []
  for (const b of blocchi) {
    for (const a of b.annotations ?? []) {
      if (a.type === 'url_citation' && a.url) {
        const s = a.start_index ?? 0, e = a.end_index ?? 0
        citazioni.push({ url: a.url, testoCitato: (b.text ?? '').slice(s, e) })
      }
    }
  }
  // Eventuali URL nei risultati di ricerca (se l'API li espone).
  const urlRisultati = passi
    .filter(s => s.type === 'google_search_result')
    .flatMap(s => (Array.isArray(s.result) ? s.result : []).map(r => r?.url).filter((u): u is string => !!u))

  const urlCitati = await Promise.all(citazioni.map(c => risolviRedirect(c.url)))
  const urlRisolti = await Promise.all(urlRisultati.map(risolviRedirect))
  const urlVisti = new Set<string>([...urlCitati, ...urlRisolti].filter(Boolean))

  // Diagnostica (solo nomi e contatori, nessun contenuto).
  const diagnostica = {
    api: 'interactions',
    modello,
    modelloRisposta: dati.model,
    tentativi,
    stato: dati.status,
    tipiPassi: passi.map(p => p.type),
    nQuery: query.length,
    query: query.slice(0, 20),
    nCitazioni: citazioni.length,
    nUrlVisti: urlVisti.size,
    usage: dati.usage,
  }

  const base = {
    diagnostica,
    urlVisti,
    ricercheWeb: query.length,
    tokenInput: dati.usage?.total_input_tokens ?? 0,
    tokenOutput: dati.usage?.total_output_tokens ?? 0,
  }

  const json = estraiJson(testo)
  if (!json) {
    return { ...base, candidati: [], note: `Risposta non interpretabile: ${testo.slice(0, 300)}` }
  }

  const candidati: EventoCandidato[] = []
  for (const e of Array.isArray(json.eventi) ? json.eventi : []) {
    if (!e || typeof e !== 'object') continue
    const c = { ...(e as Record<string, unknown>), comuneSlug: ctx.comune.slug } as unknown as EventoCandidato
    const fonte = String(c.fonteRicerca ?? '')

    // Se l'URL indicato non coincide con nessuna fonte citata ma il sito sì,
    // usa la pagina di quel sito effettivamente citata (preferendo quella la
    // cui citazione contiene il titolo dell'evento).
    const visto = [...urlVisti].some(u => norm(u) === norm(fonte))
    if (!visto) {
      const h = host(fonte)
      const titolo = String(c.titolo ?? '').toLowerCase().slice(0, 30)
      const stessoSito = citazioni
        .map((cit, i) => ({ url: urlCitati[i], testo: cit.testoCitato.toLowerCase() }))
        .filter(x => h && host(x.url) === h)
      if (stessoSito.length) {
        c.fonteRicerca = (stessoSito.find(x => titolo && x.testo.includes(titolo)) ?? stessoSito[0]).url
      }
    }
    candidati.push(c)
  }

  return { ...base, candidati, note: String(json.note ?? '') }
}
