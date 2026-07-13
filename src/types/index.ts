export type TipoGeoNodo = 'regione' | 'provincia' | 'comune' | 'quartiere'

export interface GeoNodo {
  id: string
  parentId: string | null
  tipo: TipoGeoNodo
  nome: string
  slug: string
  path: string
}

export interface Categoria {
  id: string
  nome: string
  slug: string
  icona: string
  colore: string
  ordinamento: number
}

export type StatoEvento    = 'bozza' | 'in_revisione' | 'approvato' | 'rifiutato' | 'sospeso' | 'scaduto'
export type StatoAttivita  = 'bozza' | 'pubblicato' | 'archiviato'
export type LivelloAttivita = 'facile' | 'medio' | 'esperto'

export interface Attivita {
  id: string
  titolo: string
  slug: string
  descrizioneBreve: string | null
  descrizione: string | null
  quando: string | null
  target: string | null
  gratuito: boolean
  durata: string | null
  livello: LivelloAttivita | null
  fonteUrl: string | null
  immagineCopertura: string | null
  stato: StatoAttivita
  geoNodo: GeoNodo
  categorie: Categoria[]
}

export interface Evento {
  id: string
  titolo: string
  slug: string
  descrizioneBreve: string | null
  descrizione: string | null
  // immagine diretta (legacy, non usare per nuovi contenuti)
  immagineCopertura: string | null
  // immagine da media_assets — unica fonte autorizzata
  mediaAssetUrl: string | null
  mediaAssetAlt: string | null
  luogoNome: string | null
  indirizzo: string | null
  lat: number | null
  lng: number | null
  dataInizio: string
  dataFine: string | null
  tuttoIlGiorno: boolean
  gratuito: boolean
  prezzoMin: number | null
  prezzoMax: number | null
  // Prezzo testo libero (script festival), fallback quando prezzoMin è null
  prezzoTesto: string | null
  urlBiglietti: string | null
  sitoUfficiale: string | null
  emailContatto: string | null
  telefonoContatto: string | null
  urlPrenotazione: string | null
  stato: StatoEvento
  // Scelto manualmente in admin per la sezione "In primo piano" della homepage
  inEvidenza: boolean
  // Testo esteso opzionale per la card "In primo piano"; se null si usa descrizione
  testoArticolo: string | null
  geoNodo: GeoNodo
  categorie: Categoria[]
  organizzatore: {
    id: string
    nome: string
    slug: string
    logoUrl: string | null
  }
}
