import { Evento } from '@/types'
import { EVENTI_MOCK, GEO_NODI, CATEGORIE } from './mock'

export interface Organizzatore {
  id: string
  nome: string
  slug: string
  email: string
  telefono: string | null
  sitoWeb: string | null
  stato: 'in_attesa' | 'approvato' | 'sospeso' | 'rifiutato'
  createdAt: string
  eventiCount: number
}

export interface EventoAdmin extends Evento {
  createdAt: string
  noteRevisione: string | null
}

export const ORGANIZZATORI_MOCK: Organizzatore[] = [
  {
    id: 'org1',
    nome: 'Comune di Castellammare del Golfo',
    slug: 'comune-castellammare',
    email: 'eventi@castellammare.tp.it',
    telefono: '+39 0924 592111',
    sitoWeb: 'https://www.comune.castellammaredelgolfo.tp.it',
    stato: 'approvato',
    createdAt: '2026-05-10T09:00:00',
    eventiCount: 3,
  },
  {
    id: 'org2',
    nome: 'ProLoco Alcamo',
    slug: 'proloco-alcamo',
    email: 'info@proloco-alcamo.it',
    telefono: '+39 0924 21123',
    sitoWeb: null,
    stato: 'approvato',
    createdAt: '2026-05-12T10:30:00',
    eventiCount: 2,
  },
  {
    id: 'org3',
    nome: 'Associazione Culturale SVC',
    slug: 'ass-culturale-svc',
    email: 'ass.culturale@sanvitolocapo.it',
    telefono: null,
    sitoWeb: null,
    stato: 'approvato',
    createdAt: '2026-05-15T14:00:00',
    eventiCount: 1,
  },
  {
    id: 'org4',
    nome: 'Parco Archeologico Segesta',
    slug: 'parco-segesta',
    email: 'info@segesta.it',
    telefono: '+39 0924 952356',
    sitoWeb: 'https://www.segesta.it',
    stato: 'in_attesa',
    createdAt: '2026-06-08T11:20:00',
    eventiCount: 0,
  },
  {
    id: 'org5',
    nome: 'Marco Ferrante Events',
    slug: 'marco-ferrante-events',
    email: 'm.ferrante@gmail.com',
    telefono: '+39 333 1234567',
    sitoWeb: null,
    stato: 'in_attesa',
    createdAt: '2026-06-09T08:45:00',
    eventiCount: 0,
  },
]

export const EVENTI_ADMIN_MOCK: EventoAdmin[] = [
  // Approvati (dal mock pubblico)
  ...EVENTI_MOCK.map(e => ({
    ...e,
    createdAt: '2026-06-05T10:00:00',
    noteRevisione: null,
  })),

  // In revisione
  {
    id: 'rev1',
    titolo: 'Visita guidata al Tempio di Segesta',
    slug: 'visita-guidata-tempio-segesta',
    descrizioneBreve: 'Tour guidato al tramonto tra i resti del tempio dorico e del teatro greco.',
    immagineCopertura: 'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=800&q=80',
    luogoNome: 'Parco Archeologico Segesta',
    indirizzo: 'SS 113, Calatafimi Segesta',
    lat: 37.9394, lng: 12.8336,
    dataInizio: '2026-06-20T18:30:00',
    dataFine: '2026-06-20T21:00:00',
    tuttoIlGiorno: false,
    gratuito: false,
    prezzoMin: 12, prezzoMax: 12,
    urlBiglietti: null,
    stato: 'in_revisione',
    geoNodo: GEO_NODI.find(n => n.slug === 'calatafimi-segesta')!,
    categorie: [CATEGORIE.find(c => c.slug === 'cultura')!, CATEGORIE.find(c => c.slug === 'escursioni')!],
    organizzatore: { id: 'org4', nome: 'Parco Archeologico Segesta', slug: 'parco-segesta', logoUrl: null },
    createdAt: '2026-06-08T11:30:00',
    noteRevisione: null,
  },
  {
    id: 'rev2',
    titolo: 'Serata DJ al Lido Positano',
    slug: 'serata-dj-lido-positano',
    descrizioneBreve: 'Notte in spiaggia con i migliori DJ della scena elettronica siciliana.',
    immagineCopertura: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800&q=80',
    luogoNome: 'Lido Positano',
    indirizzo: 'Lungomare Alcamo Marina',
    lat: 37.957, lng: 12.940,
    dataInizio: '2026-06-14T23:00:00',
    dataFine: '2026-06-15T04:00:00',
    tuttoIlGiorno: false,
    gratuito: false,
    prezzoMin: 15, prezzoMax: 25,
    urlBiglietti: null,
    stato: 'in_revisione',
    geoNodo: GEO_NODI.find(n => n.slug === 'alcamo')!,
    categorie: [CATEGORIE.find(c => c.slug === 'nightlife')!],
    organizzatore: { id: 'org5', nome: 'Marco Ferrante Events', slug: 'marco-ferrante-events', logoUrl: null },
    createdAt: '2026-06-09T08:50:00',
    noteRevisione: null,
  },

  // Rifiutato
  {
    id: 'rif1',
    titolo: 'Vendita prodotti biologici',
    slug: 'vendita-prodotti-biologici',
    descrizioneBreve: 'Stand di vendita prodotti biologici in piazza.',
    immagineCopertura: null,
    luogoNome: 'Piazza Ciullo',
    indirizzo: 'Piazza Ciullo, Alcamo',
    lat: 37.980, lng: 12.964,
    dataInizio: '2026-06-12T09:00:00',
    dataFine: '2026-06-12T18:00:00',
    tuttoIlGiorno: false,
    gratuito: true,
    prezzoMin: null, prezzoMax: null,
    urlBiglietti: null,
    stato: 'rifiutato',
    geoNodo: GEO_NODI.find(n => n.slug === 'alcamo')!,
    categorie: [CATEGORIE.find(c => c.slug === 'food-wine')!],
    organizzatore: { id: 'org2', nome: 'ProLoco Alcamo', slug: 'proloco-alcamo', logoUrl: null },
    createdAt: '2026-06-03T09:00:00',
    noteRevisione: 'Non è un evento aperto al pubblico ma una vendita commerciale. Non rientra nei criteri del portale.',
  },
]
