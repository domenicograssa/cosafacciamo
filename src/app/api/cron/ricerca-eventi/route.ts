import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { richiestaAutorizzata } from '@/lib/api-auth'
import { inserisciCandidati, slugify, type EventoCandidato } from '@/lib/eventi-proposti'
import { GRUPPI, TUTTI_I_COMUNI, gruppoDiOggi, oggiRoma, type Comune } from '@/lib/ricerca-eventi/rotazione'
import { cercaEventiConClaude } from '@/lib/ricerca-eventi/claude'
import { cercaEventiConGemini } from '@/lib/ricerca-eventi/gemini'

// ─── Ricerca automatica eventi (sostituisce il task pianificato di Cowork) ───
//
// Vercel Cron chiama questa route lun/mer/ven, una volta per ciascuno slot
// (0-5) del gruppo di comuni del giorno: ogni chiamata elabora UN solo comune,
// così resta entro il limite di durata di una funzione. Vedi vercel.json.
//
// Motore di ricerca: Gemini (gratuito) se è impostata GEMINI_API_KEY, altrimenti
// Claude (a pagamento, ANTHROPIC_API_KEY). Si può forzare con la variabile
// MOTORE_RICERCA_EVENTI=gemini|claude o con ?motore=gemini|claude.
//
// Per ogni comune: legge gli eventi già a DB (tutti gli stati, via service
// role), chiede al modello con ricerca web di trovare eventi reali nelle
// prossime ~6 settimane, scarta i candidati non validi o duplicati e inserisce
// il resto in coda di revisione ('in_revisione'). Nulla viene pubblicato.
//
// Auth: Vercel Cron invia da solo "Authorization: Bearer <CRON_SECRET>" se la
// variabile CRON_SECRET è impostata nel progetto.
//
// Parametri (query string):
//   slot=N        posizione del comune nel gruppo di oggi (0-5)
//   comune=slug   forza un comune specifico (test/recuperi manuali)
//   gruppo=N      forza il gruppo (0-4) invece di quello calcolato
//   prova=1       dry-run: esegue la ricerca ma NON inserisce nulla
//   motore=gemini|claude  forza il motore di ricerca
//   modello=...   forza il modello Gemini (solo per prove)

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // secondi (massimo consentito sul piano Hobby con Fluid compute)

const GIORNI_FINESTRA = 42
const LUNGHEZZA_MINIMA_DESCRIZIONE = 400

function aggiungiGiorni(iso: string, giorni: number): string {
  const d = new Date(`${iso}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + giorni)
  return d.toISOString().slice(0, 10)
}

function normalizzaUrl(u: string): string {
  return u.trim().toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/#.*$/, '')
    .replace(/\/+$/, '')
}

function paroleTitolo(t: string): Set<string> {
  return new Set(slugify(t).split('-').filter(p => p.length > 2 && !/^20\d\d$/.test(p)))
}

function similarita(a: string, b: string): number {
  const A = paroleTitolo(a), B = paroleTitolo(b)
  if (!A.size || !B.size) return 0
  let comuni = 0
  for (const p of A) if (B.has(p)) comuni++
  return comuni / Math.min(A.size, B.size)
}

function distanzaGiorni(a: string, b: string): number {
  return Math.abs(new Date(`${a}T12:00:00Z`).getTime() - new Date(`${b}T12:00:00Z`).getTime()) / 86400000
}

interface Scarto { titolo: string; motivo: string }

/**
 * Verifica indipendente della fonte: il server apre la pagina e controlla che
 * esista (HTTP 200), che parli del 2026 e che contenga buona parte delle
 * parole significative del titolo. Serve quando il motore di ricerca non
 * restituisce gli URL visti (es. Gemini) e blocca comunque le fonti inventate.
 * Pagine non leggibili dal server (es. Facebook/Instagram) non passano: in
 * dubbio si scarta.
 */
async function verificaPaginaFonte(url: string, titolo: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; moesco-verifica-fonti/1.0; +https://www.moesco.it)' },
    })
    if (!res.ok) return `pagina fonte non raggiungibile (HTTP ${res.status})`
    const html = (await res.text()).slice(0, 2_000_000)
    const testo = slugify(html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' '))
    if (!testo.includes('2026')) return 'la pagina fonte non menziona il 2026'
    const parole = [...paroleTitolo(titolo)]
    if (parole.length) {
      const trovate = parole.filter(p => testo.includes(p)).length
      if (trovate / parole.length < 0.6) return `la pagina fonte non contiene il titolo (${trovate}/${parole.length} parole)`
    }
    return null
  } catch (e) {
    return `pagina fonte non leggibile (${e instanceof Error ? e.name : 'errore'})`
  }
}

async function valida(
  c: EventoCandidato,
  oggi: string,
  fine: string,
  urlVisti: Set<string>,
  esistenti: Array<{ titolo: string; data: string }>,
  giaAccettati: EventoCandidato[],
): Promise<string | null> {
  if (!c.titolo?.trim()) return 'titolo mancante'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(c.dataInizio || '')) return 'dataInizio non valida'
  if (c.dataFine && !/^\d{4}-\d{2}-\d{2}$/.test(c.dataFine)) return 'dataFine non valida'
  if (c.oraInizio && !/^\d{2}:\d{2}$/.test(c.oraInizio)) return 'oraInizio non valida'
  if (c.oraFine && !/^\d{2}:\d{2}$/.test(c.oraFine)) return 'oraFine non valida'
  if (c.dataInizio < oggi || c.dataInizio > fine) return `data ${c.dataInizio} fuori finestra`
  if (c.dataFine && c.dataFine < c.dataInizio) return 'dataFine precedente a dataInizio'
  if ((c.descrizione?.length ?? 0) < LUNGHEZZA_MINIMA_DESCRIZIONE) return 'descrizione troppo corta'
  if (!/^https?:\/\//.test(c.fonteRicerca || '')) return 'fonteRicerca mancante o non è un URL'

  for (const e of esistenti) {
    const sim = similarita(c.titolo, e.titolo)
    if (sim >= 0.8 || (sim >= 0.5 && distanzaGiorni(c.dataInizio, e.data) <= 3)) {
      return `duplicato di "${e.titolo}" (${e.data})`
    }
  }
  for (const a of giaAccettati) {
    if (similarita(c.titolo, a.titolo) >= 0.6 && distanzaGiorni(c.dataInizio, a.dataInizio) <= 3) {
      return `doppione interno di "${a.titolo}"`
    }
  }

  // La fonte deve essere un URL effettivamente visto nei risultati di ricerca
  // oppure una pagina reale che il server riesce ad aprire e che parla
  // davvero dell'evento: blocca le fonti inventate.
  const fonte = normalizzaUrl(c.fonteRicerca)
  const vista = [...urlVisti].some(u => {
    const n = normalizzaUrl(u)
    return n === fonte || n.split('?')[0] === fonte.split('?')[0]
  })
  if (!vista) {
    const problema = await verificaPaginaFonte(c.fonteRicerca, c.titolo)
    if (problema) return problema
  }
  return null
}

export async function GET(req: NextRequest) {
  if (!richiestaAutorizzata(req)) {
    return NextResponse.json({ ok: false, errore: 'Non autorizzato.' }, { status: 401 })
  }

  const params = new URL(req.url).searchParams
  const prova = params.get('prova') === '1'
  const oggi = oggiRoma().iso
  const fine = aggiungiGiorni(oggi, GIORNI_FINESTRA)

  // ── Scelta del comune ──
  let comune: Comune | undefined
  let gruppo: number | null = null
  const slugForzato = params.get('comune')
  if (slugForzato) {
    comune = TUTTI_I_COMUNI.find(c => c.slug === slugForzato)
    if (!comune) return NextResponse.json({ ok: false, errore: `Comune "${slugForzato}" non in rotazione.` }, { status: 400 })
  } else {
    const gruppoParam = params.get('gruppo')
    gruppo = gruppoParam != null ? Number(gruppoParam) : gruppoDiOggi()
    if (!Number.isInteger(gruppo) || gruppo < 0 || gruppo >= GRUPPI.length) {
      return NextResponse.json({ ok: false, errore: 'Parametro gruppo non valido.' }, { status: 400 })
    }
    const slot = Number(params.get('slot') ?? '0')
    comune = GRUPPI[gruppo][slot]
    if (!comune) {
      // Il gruppo di oggi ha meno comuni di questo slot: niente da fare.
      return NextResponse.json({ ok: true, gruppo, slot, messaggio: 'Nessun comune per questo slot oggi.' })
    }
  }

  const sb = await createAdminClient()

  // ── Dedup: eventi già a DB per il comune, TUTTI gli stati (service role) ──
  const { data: geo } = await sb
    .from('geo_nodi').select('id').eq('slug', comune.slug).eq('tipo', 'comune').maybeSingle()
  if (!geo) {
    return NextResponse.json({ ok: false, errore: `Comune "${comune.slug}" non trovato in geo_nodi.` }, { status: 500 })
  }
  const geoId = (geo as { id: string }).id
  const { data: righe } = await sb
    .from('eventi').select('titolo, data_inizio')
    .eq('geo_nodo_id', geoId)
    .gte('data_inizio', aggiungiGiorni(oggi, -60))
  const esistenti = ((righe ?? []) as Array<{ titolo: string; data_inizio: string }>)
    .map(r => ({ titolo: r.titolo, data: r.data_inizio.slice(0, 10) }))

  const { data: cat } = await sb.from('categorie').select('slug, nome').eq('attiva', true)
  const categorie = (cat ?? []) as Array<{ slug: string; nome: string }>

  // ── Ricerca (timeout interno per restare sotto maxDuration) ──
  const motore = (params.get('motore') || process.env.MOTORE_RICERCA_EVENTI?.trim()
    || (process.env.GEMINI_API_KEY ? 'gemini' : 'claude')) === 'claude' ? 'claude' : 'gemini'
  const modelloParam = params.get('modello')?.trim()
  const modelloForzato = modelloParam && /^[a-z0-9.\-]{3,60}$/.test(modelloParam) ? modelloParam : undefined
  const timeout = AbortSignal.timeout((maxDuration - 25) * 1000)
  const contesto = { comune, oggiIso: oggi, fineFinestraIso: fine, eventiEsistenti: esistenti, categorie }
  let esito
  try {
    esito = motore === 'claude'
      ? await cercaEventiConClaude(contesto, timeout)
      : await cercaEventiConGemini(contesto, timeout, modelloForzato)
  } catch (e) {
    const errore = e instanceof Error ? e.message : String(e)
    console.error(`[ricerca-eventi] ${motore} ${comune.slug}: ${errore}`)
    return NextResponse.json({ ok: false, motore, comune: comune.slug, errore }, { status: 502 })
  }

  // ── Validazione e dedup dei candidati ──
  const slugValidi = new Set(categorie.map(c => c.slug))
  const accettati: EventoCandidato[] = []
  const scartati: Scarto[] = []
  for (const c of esito.candidati) {
    const motivo = await valida(c, oggi, fine, esito.urlVisti, esistenti, accettati)
    if (motivo) { scartati.push({ titolo: c.titolo || '(senza titolo)', motivo }); continue }
    if (c.categorieSlugs) c.categorieSlugs = c.categorieSlugs.filter(s => slugValidi.has(s))
    accettati.push(c)
  }

  // ── Inserimento in coda di revisione ──
  let risultati: Awaited<ReturnType<typeof inserisciCandidati>>['risultati'] = []
  if (!prova && accettati.length) {
    try {
      const r = await inserisciCandidati(sb, accettati)
      risultati = r.risultati
      if (r.almenoUnoOk) {
        revalidatePath('/admin/eventi')
        revalidatePath('/admin')
      }
    } catch (e) {
      return NextResponse.json({ ok: false, comune: comune.slug, errore: e instanceof Error ? e.message : String(e) }, { status: 500 })
    }
  }

  const report = {
    ok: true,
    prova,
    motore,
    comune: comune.slug,
    gruppo,
    finestra: `${oggi} → ${fine}`,
    ricercheWeb: esito.ricercheWeb,
    token: { input: esito.tokenInput, output: esito.tokenOutput },
    proposti: prova ? accettati.map(a => ({ titolo: a.titolo, data: a.dataInizio, fonte: a.fonteRicerca })) : risultati,
    scartati,
    note: esito.note,
    diagnostica: esito.diagnostica,
  }
  console.log(`[ricerca-eventi] ${JSON.stringify(report)}`)
  return NextResponse.json(report)
}
