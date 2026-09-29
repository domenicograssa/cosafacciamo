import type { EventoCandidato } from '@/lib/eventi-proposti'
import { promptDiSistema, promptUtente, estraiJson, type ContestoRicerca, type EsitoRicercaClaude } from './claude'

// Motore GRATUITO: API Gemini di Google con "Grounding with Google Search".
// Il piano gratuito di Google AI Studio include un numero di richieste con
// ricerca al giorno ampiamente sufficiente (~15 comuni a settimana).
//
// Variabili d'ambiente:
//   GEMINI_API_KEY  (obbligatoria)  da aistudio.google.com → Get API key
//   GEMINI_MODEL    (facoltativa)   default "gemini-2.5-flash"
//
// Differenza con Claude: Gemini restituisce le fonti come link di
// reindirizzamento di Google (vertexaisearch.cloud.google.com/grounding-api-redirect/...).
// Qui li risolviamo negli URL originali, così il controllo "fonte vista
// davvero" della route resta valido e in admin compare il link vero.

const MODELLO_DEFAULT = 'gemini-2.5-flash'

interface Chunk { web?: { uri?: string; title?: string } }
interface Support { segment?: { text?: string }; groundingChunkIndices?: number[] }
interface RispostaGemini {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> }
    finishReason?: string
    groundingMetadata?: {
      groundingChunks?: Chunk[]
      groundingSupports?: Support[]
      webSearchQueries?: string[]
    }
  }>
  usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number }
  error?: { message?: string }
}

/** Segue il reindirizzamento di Google e restituisce l'URL originale. */
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

export async function cercaEventiConGemini(ctx: ContestoRicerca, segnale?: AbortSignal): Promise<EsitoRicercaClaude> {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) throw new Error('GEMINI_API_KEY non impostata.')
  const modello = process.env.GEMINI_MODEL?.trim() || MODELLO_DEFAULT

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modello)}:generateContent`,
    {
      method: 'POST',
      signal: segnale,
      headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: promptDiSistema() }] },
        contents: [{ role: 'user', parts: [{ text: promptUtente(ctx) }] }],
        tools: [{ google_search: {} }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 16000 },
      }),
    },
  )

  const dati = (await res.json().catch(() => ({}))) as RispostaGemini
  if (!res.ok) throw new Error(`API Gemini ${res.status}: ${dati.error?.message ?? 'errore sconosciuto'}`)

  const cand = dati.candidates?.[0]
  const testo = (cand?.content?.parts ?? []).map(p => p.text ?? '').join('')
  const meta = cand?.groundingMetadata ?? {}
  const chunks = meta.groundingChunks ?? []
  const supports = meta.groundingSupports ?? []

  // Risolve i link di reindirizzamento in parallelo: indice chunk → URL originale.
  const urlChunk = await Promise.all(chunks.map(c => risolviRedirect(c.web?.uri ?? '')))
  const urlVisti = new Set<string>(urlChunk.filter(Boolean))

  const base = {
    urlVisti,
    ricercheWeb: meta.webSearchQueries?.length ?? 0,
    tokenInput: dati.usageMetadata?.promptTokenCount ?? 0,
    tokenOutput: dati.usageMetadata?.candidatesTokenCount ?? 0,
  }

  const json = estraiJson(testo)
  if (!json) {
    return { ...base, candidati: [], note: `Risposta non interpretabile (${cand?.finishReason ?? '?'}): ${testo.slice(0, 300)}` }
  }

  const candidati: EventoCandidato[] = []
  for (const e of Array.isArray(json.eventi) ? json.eventi : []) {
    if (!e || typeof e !== 'object') continue
    const c = { ...(e as Record<string, unknown>), comuneSlug: ctx.comune.slug } as unknown as EventoCandidato
    const fonte = String(c.fonteRicerca ?? '')

    // 1) Se Gemini ha scritto il link di reindirizzamento, lo sostituiamo con quello risolto.
    const idxRedirect = chunks.findIndex(ch => ch.web?.uri && norm(ch.web.uri) === norm(fonte))
    if (idxRedirect >= 0) c.fonteRicerca = urlChunk[idxRedirect]

    // 2) Se l'URL non coincide con nessuna fonte vista, ma il sito sì, usiamo la
    //    pagina di quel sito effettivamente consultata (preferendo quella che
    //    Gemini collega al testo che contiene il titolo dell'evento).
    const visto = [...urlVisti].some(u => norm(u) === norm(c.fonteRicerca ?? ''))
    if (!visto) {
      const h = host(c.fonteRicerca ?? '') || (chunks.find(ch => ch.web?.title && fonte.includes(ch.web.title))?.web?.title ?? '')
      const stessoSito = urlChunk.map((u, i) => ({ u, i })).filter(x => h && host(x.u) === h)
      if (stessoSito.length) {
        const titolo = String(c.titolo ?? '').toLowerCase().slice(0, 30)
        const collegati = new Set(
          supports
            .filter(s => titolo && s.segment?.text?.toLowerCase().includes(titolo))
            .flatMap(s => s.groundingChunkIndices ?? []),
        )
        const scelto = stessoSito.find(x => collegati.has(x.i)) ?? stessoSito[0]
        c.fonteRicerca = scelto.u
      }
    }
    candidati.push(c)
  }

  return { ...base, candidati, note: String(json.note ?? '') }
}
