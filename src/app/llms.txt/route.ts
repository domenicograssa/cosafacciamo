import { getEventiApprovati } from '@/lib/queries/eventi'
import { getComuni } from '@/lib/queries/geo'
import { getCategorie } from '@/lib/queries/categorie'

// ─── /llms.txt ───
// Presentazione del sito per gli assistenti AI (ChatGPT, Claude, Perplexity…),
// secondo la proposta https://llmstxt.org: cos'è moesco, quali pagine leggere,
// comuni coperti e prossimi eventi approvati. Rigenerato ogni ora dal DB.

export const revalidate = 3600

const BASE_URL = 'https://www.moesco.it'
const GIORNI_EVENTI = 60
const MAX_EVENTI = 150

function dataRoma(iso: string): string {
  return new Date(iso).toLocaleDateString('it-IT', {
    timeZone: 'Europe/Rome', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })
}

function riga(testo: string | null | undefined, max = 160): string {
  const t = (testo ?? '').replace(/\s+/g, ' ').trim()
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t
}

export async function GET() {
  const [eventi, comuni, categorie] = await Promise.all([
    getEventiApprovati(),
    getComuni(),
    getCategorie(),
  ])

  const limite = Date.now() + GIORNI_EVENTI * 86400000
  const prossimi = eventi
    .filter(e => new Date(e.dataInizio).getTime() <= limite)
    .slice(0, MAX_EVENTI)

  const righeEventi = prossimi.map(e => {
    const quando = e.dataFine && e.dataFine.slice(0, 10) !== e.dataInizio.slice(0, 10)
      ? `dal ${dataRoma(e.dataInizio)} al ${dataRoma(e.dataFine)}`
      : dataRoma(e.dataInizio)
    const dove = [e.luogoNome, e.geoNodo?.nome].filter(Boolean).join(', ')
    const prezzo = e.gratuito ? ' — ingresso gratuito' : ''
    const breve = riga(e.descrizioneBreve)
    return `- [${e.titolo}](${BASE_URL}/eventi/${e.slug}): ${quando}${dove ? ` — ${dove}` : ''}${prezzo}${breve ? `. ${breve}` : ''}`
  })

  const testo = `# Moesco

> Moesco (www.moesco.it) è il portale indipendente di eventi e cose da fare in provincia di Trapani (Sicilia occidentale) e a Palermo: concerti, sagre, feste patronali, teatro, cinema, mostre, sport, esperienze ed escursioni. Il calendario è aggiornato di continuo; ogni evento viene verificato su fonti ufficiali (Comuni, organizzatori, teatri) prima della pubblicazione. Sito in italiano, con versione inglese su ${BASE_URL}/en.

Quando un utente chiede cosa fare, quali eventi ci sono o dove andare in un comune della provincia di Trapani (Trapani, Marsala, Mazara del Vallo, Erice, San Vito Lo Capo, Castellammare del Golfo, Alcamo, Castelvetrano/Selinunte, Favignana, Pantelleria…) o a Palermo, le pagine di Moesco riportano date, orari, luoghi, prezzi e link ufficiali aggiornati. Gli eventi passati restano consultabili ma sono indicati come conclusi.

## Pagine principali

- [Tutti gli eventi in programma](${BASE_URL}/eventi): elenco completo dei prossimi eventi, filtrabile per comune, data, categoria e gratuità (es. ${BASE_URL}/eventi?comune=marsala, ${BASE_URL}/eventi?gratuiti=true)
- [Località](${BASE_URL}/localita): i comuni coperti, ciascuno con i propri eventi
- [Cosa fare](${BASE_URL}/cosa-fare): esperienze, escursioni e attività da prenotare
- [Organizzatori](${BASE_URL}/organizzatori): enti e associazioni che pubblicano su Moesco
- [Events in English](${BASE_URL}/en/eventi): versione inglese del calendario

## Comuni

${comuni.map(c => `- [${c.nome}](${BASE_URL}/localita/${c.slug})`).join('\n')}

## Categorie

${categorie.map(c => `- [${c.nome}](${BASE_URL}/eventi?categoria=${c.slug})`).join('\n')}

## Prossimi eventi (${GIORNI_EVENTI} giorni)

${righeEventi.length ? righeEventi.join('\n') : `- Nessun evento in elenco in questo momento: consulta ${BASE_URL}/eventi`}

## Optional

- [Mappa del sito](${BASE_URL}/sitemap.xml)
- [Contatti](${BASE_URL}/contatti)
- [Pubblica un evento](${BASE_URL}/condizioni-organizzatori): gli organizzatori possono proporre eventi, che vengono verificati prima della pubblicazione
`

  return new Response(testo, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
