// Immagini rappresentative dei comuni — usate come fallback quando un evento
// non ha un'immagine propria autorizzata.
// Tutte con licenza Unsplash (uso libero anche commerciale): fonte e autore documentati.

export interface ImmagineComune {
  url: string
  alt: string
  credito: string
  /** Pagina della fonte con autore e licenza (per le foto Wikimedia Commons) */
  creditoUrl?: string
}

export const COMUNE_IMMAGINI: Record<string, ImmagineComune> = {
  // Wikimedia Commons — CC BY-SA 3.0 — autore: Esculapio
  'alcamo': {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Castello_di_Alcamo_0024.JPG?width=1280',
    alt: 'Il Castello dei Conti di Modica ad Alcamo',
    credito: 'Esculapio, CC BY-SA 3.0, via Wikimedia Commons',
    creditoUrl: 'https://commons.wikimedia.org/wiki/File:Castello_di_Alcamo_0024.JPG',
  },
  // photo-1756990901059-90f464223f3f — Gabriele Merlino / Unsplash (Castellammare del Golfo)
  'castellammare-del-golfo': {
    url: 'https://images.unsplash.com/photo-1756990901059-90f464223f3f?w=1400&q=80',
    alt: 'Il porto di Castellammare del Golfo al tramonto',
    credito: 'Gabriele Merlino / Unsplash',
  },
  // photo-1730193488340-0af0fe404306 — Paul Sebastian Saliba / Unsplash (San Vito Lo Capo)
  'san-vito-lo-capo': {
    url: 'https://images.unsplash.com/photo-1730193488340-0af0fe404306?w=1400&q=80',
    alt: 'La spiaggia di San Vito Lo Capo',
    credito: 'Paul Sebastian Saliba / Unsplash',
  },
  // photo-1677967062355-b951f29c66e8 — Antonio Sessa / Unsplash (Segesta)
  'calatafimi-segesta': {
    url: 'https://images.unsplash.com/photo-1677967062355-b951f29c66e8?w=1400&q=80',
    alt: 'Il tempio di Segesta',
    credito: 'Antonio Sessa / Unsplash',
  },
  // Wikimedia Commons — CC BY-SA 4.0 — autore: Ambra75
  'erice': {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Castello_di_Venere,_Erice,_Sicilia.jpg?width=1280',
    alt: 'Il Castello di Venere a Erice',
    credito: 'Ambra75, CC BY-SA 4.0, via Wikimedia Commons',
    creditoUrl: 'https://commons.wikimedia.org/wiki/File:Castello_di_Venere,_Erice,_Sicilia.jpg',
  },
  // Wikimedia Commons — CC BY-SA 3.0 — autore: Fabior1984
  'gibellina': {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Cretto_di_Burri_-_Gibellina.JPG?width=1280',
    alt: 'Il Cretto di Burri a Gibellina',
    credito: 'Fabior1984, CC BY-SA 3.0, via Wikimedia Commons',
    creditoUrl: 'https://commons.wikimedia.org/wiki/File:Cretto_di_Burri_-_Gibellina.JPG',
  },
  // Wikimedia Commons — CC BY 3.0 — autore: Jorre
  'castelvetrano': {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Selinunte_Temple_C_aerial_view.jpg?width=1280',
    alt: 'Veduta aerea del Tempio C di Selinunte',
    credito: 'Jorre, CC BY 3.0, via Wikimedia Commons',
    creditoUrl: 'https://commons.wikimedia.org/wiki/File:Selinunte_Temple_C_aerial_view.jpg',
  },
  // Wikimedia Commons — CC BY-SA 3.0 — autore: Pizzodaniele
  'favignana': {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Favignana_Cala_Rossa.JPG?width=1280',
    alt: 'Cala Rossa a Favignana',
    credito: 'Pizzodaniele, CC BY-SA 3.0, via Wikimedia Commons',
    creditoUrl: 'https://commons.wikimedia.org/wiki/File:Favignana_Cala_Rossa.JPG',
  },
  // Wikimedia Commons — pubblico dominio — autore: Michael Leithold
  'pantelleria': {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Dammuso_in_Pantelleria,_Sicily.JPG?width=1280',
    alt: 'Un dammuso a Pantelleria',
    credito: 'Michael Leithold, pubblico dominio, via Wikimedia Commons',
    creditoUrl: 'https://commons.wikimedia.org/wiki/File:Dammuso_in_Pantelleria,_Sicily.JPG',
  },
}

export function immagineComune(slug: string): ImmagineComune | null {
  return COMUNE_IMMAGINI[slug] ?? null
}
