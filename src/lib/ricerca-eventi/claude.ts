import type { EventoCandidato } from '@/lib/eventi-proposti'
import type { Comune } from './rotazione'

// Chiamata all'API di Anthropic (Messages API) con lo strumento server-side di
// ricerca web: Claude cerca gli eventi di UN comune e restituisce un JSON di
// candidati. Nessuna dipendenza npm: si usa fetch.
//
// Variabili d'ambiente:
//   ANTHROPIC_API_KEY  (obbligatoria)  da console.anthropic.com
//   ANTHROPIC_MODEL    (facoltativa)   default "claude-sonnet-5-5"

const API_URL = 'https://api.anthropic.com/v1/messages'
const MODELLO_DEFAULT = 'claude-sonnet-5-5'

interface BloccoContenuto {
  type: string
  text?: string
  content?: unknown
  citations?: Array<{ url?: string }>
  [k: string]: unknown
}

interface RispostaMessaggio {
  content: BloccoContenuto[]
  stop_reason: string
  usage?: { input_tokens: number; output_tokens: number; server_tool_use?: { web_search_requests?: number } }
}

export interface EsitoRicercaClaude {
  candidati: EventoCandidato[]
  note: string
  urlVisti: Set<string>
  ricercheWeb: number
  tokenInput: number
  tokenOutput: number
}

export interface ContestoRicerca {
  comune: Comune
  oggiIso: string          // "YYYY-MM-DD"
  fineFinestraIso: string  // "YYYY-MM-DD"
  eventiEsistenti: Array<{ titolo: string; data: string }>
  categorie: Array<{ slug: string; nome: string }>
}

export function promptDiSistema(): string {
  return `Sei il ricercatore di eventi del portale "moesco" (www.moesco.it), che racconta gli eventi della provincia di Trapani e di Palermo città. Proponi eventi REALI e VERIFICATI che finiranno in una coda di revisione umana: non vengono mai pubblicati automaticamente.

REGOLA PIÙ IMPORTANTE: MAI INVENTARE.
Ogni evento deve avere una fonte reale che hai effettivamente trovato con la ricerca web in questa sessione, con una data 2026 esplicita e chiara. Se una fonte è ambigua, sembra riciclata da un anno precedente, o non trovi un calendario vero, NON proporre l'evento. Meglio zero eventi che un evento con dati inventati o incerti. Il campo fonteRicerca deve essere l'URL esatto di un risultato che hai visto.

TRAPPOLE SULLE FONTI (verificate sul campo):
- Anno riciclato: portali come vivasicilia.com, enjoysicilia.it, siciliainfesta.com tengono la stessa pagina da anni con il titolo aggiornato a "2026" ma date vecchie. Se i dati strutturati ("Start Date"/"End Date") mostrano un altro anno, o la pagina dice "a breve pubblicheremo il programma", l'evento NON è confermato.
- Date proiettate: sagr.it genera date 2026 per estrapolazione ("Text generated with AI", "This event is not yet managed"). Usalo solo come indizio dell'esistenza dell'evento, mai come conferma della data o come fonte della descrizione.
- Controprova del giorno della settimana: quasi tutte le sagre sono sabato/domenica. Date che cadono per esempio domenica-lunedì sono spesso traslate da un altro anno: verifica su una fonte primaria.
- Festival in più città (es. Le Vie dei Tesori): usa le date della SINGOLA città cercata, non quelle complessive.
Privilegia fonti ufficiali (sito del Comune, turismo regionale, pro loco, pagine ufficiali degli organizzatori) e testate locali (Tp24, TrapaniOggi, Giornale di Sicilia, Mazara Online, Marsala News, PalermoToday, ecc.).

COPERTURA PER CATEGORIA: cerca esplicitamente in tutte queste aree, con query mirate e non solo generiche:
musica e concerti; food & wine (sagre, degustazioni, cantine); cultura (mostre, libri, teatro, cinema, conferenze); sport e outdoor (gare, tornei, escursioni, ciclismo); feste patronali e tradizioni religiose/folkloristiche; eventi per famiglie e bambini.

DESCRIZIONE MOLTO RICCA: il campo "descrizione" è quello che il portale mostra in vetrina e deve essere lungo e denso (indicativamente 1.000-2.500 caratteri, in italiano, in paragrafi separati da una riga vuota). Includi tutto ciò che le fonti confermano: storia ed edizione, programma giorno per giorno con orari, ospiti e artisti, organizzatori, piatti o prodotti, luoghi e vie coinvolte, costi e prenotazioni, atmosfera. Se una fonte è povera cercane una seconda sullo stesso evento e uniscile. Solo dettagli confermati, mai abbelliti o dedotti. "descrizioneBreve" è una sintesi di 1-2 frasi (max 280 caratteri).

FORMATO DELLA RISPOSTA FINALE: dopo le ricerche, rispondi SOLO con un blocco \`\`\`json contenente:
{
  "eventi": [
    {
      "titolo": "...",
      "descrizione": "...",
      "descrizioneBreve": "...",
      "dataInizio": "YYYY-MM-DD",
      "oraInizio": "HH:MM (ometti se non nota)",
      "dataFine": "YYYY-MM-DD (solo se multi-giorno)",
      "oraFine": "HH:MM (facoltativo)",
      "luogoNome": "...", "indirizzo": "...",
      "gratuito": true/false, "prezzoMin": 0, "prezzoMax": 0,
      "sitoUfficiale": "...", "urlBiglietti": "...",
      "categorieSlugs": ["..."],
      "fonteRicerca": "URL esatto della pagina fonte"
    }
  ],
  "note": "breve resoconto: cosa hai cercato, cosa hai scartato e perché"
}
Ometti i campi facoltativi che non conosci (non scrivere null né stringhe vuote). Se non trovi nulla di verificabile restituisci "eventi": [] e spiega nelle note.`
}

export function promptUtente(ctx: ContestoRicerca): string {
  const esistenti = ctx.eventiEsistenti.length
    ? ctx.eventiEsistenti.map(e => `- ${e.data}: ${e.titolo}`).join('\n')
    : '(nessuno)'
  const categorie = ctx.categorie.map(c => `${c.slug} (${c.nome})`).join(', ')
  return `Oggi è ${ctx.oggiIso}. Cerca eventi nel comune di ${ctx.comune.nome} (provincia di ${ctx.comune.slug === 'palermo' ? 'Palermo' : 'Trapani'}, Sicilia) che iniziano tra il ${ctx.oggiIso} e il ${ctx.fineFinestraIso}.

Eventi GIÀ presenti sul portale per questo comune (qualunque stato): non riproporli, nemmeno con titolo leggermente diverso.
${esistenti}

Categorie esistenti sul portale (slug e nome): ${categorie || '(nessuna)'}.
Usa "categorieSlugs" solo se l'evento corrisponde chiaramente a una di queste; altrimenti ometti il campo.

Esempi di query utili: "eventi ${ctx.comune.nome} ottobre 2026", "sagra ${ctx.comune.nome} 2026", "mostra ${ctx.comune.nome} 2026", "teatro ${ctx.comune.nome} stagione 2026", "festa patronale ${ctx.comune.nome} 2026", "comune di ${ctx.comune.nome} eventi", "${ctx.comune.nome} gara torneo 2026". Adatta il mese al periodo della finestra.`
}

/** Estrae il JSON finale dal testo della risposta. */
export function estraiJson(testo: string): { eventi?: unknown[]; note?: string } | null {
  const fence = testo.match(/```json\s*([\s\S]*?)```/i)
  const grezzo = fence ? fence[1] : testo
  const inizio = grezzo.indexOf('{')
  const fine = grezzo.lastIndexOf('}')
  if (inizio === -1 || fine <= inizio) return null
  try {
    return JSON.parse(grezzo.slice(inizio, fine + 1))
  } catch {
    return null
  }
}

/** Raccoglie tutti gli URL che Claude ha visto nei risultati di ricerca o citato. */
function raccogliUrl(blocchi: BloccoContenuto[], into: Set<string>) {
  for (const b of blocchi) {
    if (b.type === 'web_search_tool_result' && Array.isArray(b.content)) {
      for (const r of b.content as Array<{ url?: string }>) if (r?.url) into.add(r.url)
    }
    if (b.type === 'web_fetch_tool_result') {
      const url = (b.content as { url?: string } | undefined)?.url
      if (url) into.add(url)
    }
    if (b.type === 'text' && b.citations) {
      for (const c of b.citations) if (c.url) into.add(c.url)
    }
  }
}

export async function cercaEventiConClaude(ctx: ContestoRicerca, segnale?: AbortSignal): Promise<EsitoRicercaClaude> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim()
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY non impostata.')
  const modello = process.env.ANTHROPIC_MODEL?.trim() || MODELLO_DEFAULT

  const messaggi: Array<{ role: 'user' | 'assistant'; content: unknown }> = [
    { role: 'user', content: promptUtente(ctx) },
  ]
  const urlVisti = new Set<string>()
  let testoFinale = ''
  let ricercheWeb = 0
  let tokenInput = 0
  let tokenOutput = 0

  // Gli strumenti server-side possono interrompere il turno con
  // stop_reason "pause_turn": si rimanda la risposta così com'è per farlo proseguire.
  for (let giro = 0; giro < 5; giro++) {
    const res = await fetch(API_URL, {
      method: 'POST',
      signal: segnale,
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: modello,
        max_tokens: 16000,
        system: promptDiSistema(),
        messages: messaggi,
        tools: [
          {
            type: 'web_search_20250305',
            name: 'web_search',
            max_uses: 15,
            user_location: {
              type: 'approximate',
              city: ctx.comune.nome,
              region: 'Sicilia',
              country: 'IT',
              timezone: 'Europe/Rome',
            },
          },
        ],
      }),
    })

    if (!res.ok) {
      const dettaglio = await res.text().catch(() => '')
      throw new Error(`API Anthropic ${res.status}: ${dettaglio.slice(0, 500)}`)
    }

    const dati = (await res.json()) as RispostaMessaggio
    raccogliUrl(dati.content, urlVisti)
    tokenInput += dati.usage?.input_tokens ?? 0
    tokenOutput += dati.usage?.output_tokens ?? 0
    ricercheWeb += dati.usage?.server_tool_use?.web_search_requests ?? 0
    testoFinale = dati.content.filter(b => b.type === 'text').map(b => b.text ?? '').join('')

    if (dati.stop_reason === 'pause_turn') {
      messaggi.push({ role: 'assistant', content: dati.content })
      continue
    }
    break
  }

  const json = estraiJson(testoFinale)
  if (!json) {
    return { candidati: [], note: `Risposta non interpretabile: ${testoFinale.slice(0, 300)}`, urlVisti, ricercheWeb, tokenInput, tokenOutput }
  }

  const candidati = (Array.isArray(json.eventi) ? json.eventi : [])
    .filter((e): e is Record<string, unknown> => !!e && typeof e === 'object')
    .map(e => ({ ...e, comuneSlug: ctx.comune.slug }) as unknown as EventoCandidato)

  return { candidati, note: String(json.note ?? ''), urlVisti, ricercheWeb, tokenInput, tokenOutput }
}
