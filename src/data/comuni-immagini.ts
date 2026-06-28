// Immagini rappresentative dei comuni — usate come hero nelle pagine /localita/[slug]
// e come fallback eventi.
// Licenze: Unsplash (libero uso commerciale) e Wikimedia Commons (CC BY / CC BY-SA).

export interface ImmagineComune {
  url: string
  alt: string
  credito: string
  /** Pagina della fonte con autore e licenza (per le foto Wikimedia Commons) */
  creditoUrl?: string
}

/** Array di foto per lo slideshow hero — min 1, idealmente 3–5 */
export interface SlideComune {
  url: string
  alt: string
  credito: string
  creditoUrl?: string
}

export const COMUNE_SLIDES: Record<string, SlideComune[]> = {
  'marsala': [
    {
      url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Saline_di_Marsala,_mulini_a_vento.jpg?width=1400',
      alt: 'Le saline di Marsala con i mulini a vento dello Stagnone',
      credito: 'Wikimedia Commons, CC BY-SA',
      creditoUrl: 'https://commons.wikimedia.org/wiki/File:Saline_di_Marsala,_mulini_a_vento.jpg',
    },
    {
      url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Stagnone_di_Marsala.jpg?width=1400',
      alt: 'Lo Stagnone di Marsala al tramonto',
      credito: 'Wikimedia Commons, CC BY-SA',
      creditoUrl: 'https://commons.wikimedia.org/wiki/File:Stagnone_di_Marsala.jpg',
    },
    {
      url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Marsala_-_Museo_del_Vino.jpg?width=1400',
      alt: 'Il Museo del Vino Marsala',
      credito: 'Wikimedia Commons, CC BY-SA',
      creditoUrl: 'https://commons.wikimedia.org/wiki/File:Marsala_-_Museo_del_Vino.jpg',
    },
  ],
  'trapani': [
    {
      url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Trapani_-_Torre_di_Ligny.jpg?width=1400',
      alt: 'La Torre di Ligny a Trapani',
      credito: 'Wikimedia Commons, CC BY-SA',
      creditoUrl: 'https://commons.wikimedia.org/wiki/File:Trapani_-_Torre_di_Ligny.jpg',
    },
    {
      url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Saline_di_Trapani_e_Paceco.jpg?width=1400',
      alt: 'Le saline di Trapani e Paceco con i mulini',
      credito: 'Wikimedia Commons, CC BY-SA',
      creditoUrl: 'https://commons.wikimedia.org/wiki/File:Saline_di_Trapani_e_Paceco.jpg',
    },
    {
      url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Tramonto_sulle_saline_di_Trapani.jpg?width=1400',
      alt: 'Tramonto sulle saline di Trapani',
      credito: 'Wikimedia Commons, CC BY-SA',
      creditoUrl: 'https://commons.wikimedia.org/wiki/File:Tramonto_sulle_saline_di_Trapani.jpg',
    },
  ],
  'castellammare-del-golfo': [
    {
      url: 'https://images.unsplash.com/photo-1756990901059-90f464223f3f?w=1400&q=80',
      alt: 'Il porto di Castellammare del Golfo al tramonto',
      credito: 'Gabriele Merlino / Unsplash',
    },
    {
      url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Castellammare_del_Golfo_-_porto.jpg?width=1400',
      alt: 'Castellammare del Golfo — il castello sul porto',
      credito: 'Wikimedia Commons, CC BY-SA',
      creditoUrl: 'https://commons.wikimedia.org/wiki/File:Castellammare_del_Golfo_-_porto.jpg',
    },
  ],
  'san-vito-lo-capo': [
    {
      url: 'https://images.unsplash.com/photo-1730193488340-0af0fe404306?w=1400&q=80',
      alt: 'La spiaggia di San Vito Lo Capo',
      credito: 'Paul Sebastian Saliba / Unsplash',
    },
    {
      url: 'https://commons.wikimedia.org/wiki/Special:FilePath/San_Vito_Lo_Capo_beach.jpg?width=1400',
      alt: 'Il mare cristallino di San Vito Lo Capo',
      credito: 'Wikimedia Commons, CC BY-SA',
      creditoUrl: 'https://commons.wikimedia.org/wiki/File:San_Vito_Lo_Capo_beach.jpg',
    },
  ],
  'calatafimi-segesta': [
    {
      url: 'https://images.unsplash.com/photo-1677967062355-b951f29c66e8?w=1400&q=80',
      alt: 'Il tempio dorico di Segesta',
      credito: 'Antonio Sessa / Unsplash',
    },
    {
      url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Segesta_theater.jpg?width=1400',
      alt: 'Il teatro greco di Segesta',
      credito: 'Wikimedia Commons, CC BY-SA',
      creditoUrl: 'https://commons.wikimedia.org/wiki/File:Segesta_theater.jpg',
    },
  ],
  'erice': [
    {
      url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Castello_di_Venere,_Erice,_Sicilia.jpg?width=1280',
      alt: 'Il Castello di Venere a Erice',
      credito: 'Ambra75, CC BY-SA 4.0, via Wikimedia Commons',
      creditoUrl: 'https://commons.wikimedia.org/wiki/File:Castello_di_Venere,_Erice,_Sicilia.jpg',
    },
    {
      url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Erice_-_panorama.jpg?width=1400',
      alt: 'Panorama di Erice tra le nuvole',
      credito: 'Wikimedia Commons, CC BY-SA',
      creditoUrl: 'https://commons.wikimedia.org/wiki/File:Erice_-_panorama.jpg',
    },
  ],
  'alcamo': [
    {
      url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Castello_di_Alcamo_0024.JPG?width=1280',
      alt: 'Il Castello dei Conti di Modica ad Alcamo',
      credito: 'Esculapio, CC BY-SA 3.0, via Wikimedia Commons',
      creditoUrl: 'https://commons.wikimedia.org/wiki/File:Castello_di_Alcamo_0024.JPG',
    },
  ],
  'favignana': [
    {
      url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Favignana_Cala_Rossa.JPG?width=1280',
      alt: 'Cala Rossa a Favignana',
      credito: 'Pizzodaniele, CC BY-SA 3.0, via Wikimedia Commons',
      creditoUrl: 'https://commons.wikimedia.org/wiki/File:Favignana_Cala_Rossa.JPG',
    },
    {
      url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Favignana_-_Stabilimento_Florio.jpg?width=1400',
      alt: "L'Ex Stabilimento Florio a Favignana",
      credito: 'Wikimedia Commons, CC BY-SA',
      creditoUrl: 'https://commons.wikimedia.org/wiki/File:Favignana_-_Stabilimento_Florio.jpg',
    },
  ],
  'castelvetrano': [
    {
      url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Selinunte_Temple_C_aerial_view.jpg?width=1280',
      alt: 'Veduta aerea del Tempio C di Selinunte',
      credito: 'Jorre, CC BY 3.0, via Wikimedia Commons',
      creditoUrl: 'https://commons.wikimedia.org/wiki/File:Selinunte_Temple_C_aerial_view.jpg',
    },
  ],
  'mazara-del-vallo': [
    {
      url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mazara_del_Vallo_-_porto.jpg?width=1400',
      alt: 'Il porto peschereccio di Mazara del Vallo',
      credito: 'Wikimedia Commons, CC BY-SA',
      creditoUrl: 'https://commons.wikimedia.org/wiki/File:Mazara_del_Vallo_-_porto.jpg',
    },
    {
      url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mazara_del_Vallo_-_la_Casbah.jpg?width=1400',
      alt: 'La Casbah di Mazara del Vallo',
      credito: 'Wikimedia Commons, CC BY-SA',
      creditoUrl: 'https://commons.wikimedia.org/wiki/File:Mazara_del_Vallo_-_la_Casbah.jpg',
    },
  ],
  'pantelleria': [
    {
      url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Dammuso_in_Pantelleria,_Sicily.JPG?width=1280',
      alt: 'Un dammuso a Pantelleria',
      credito: 'Michael Leithold, pubblico dominio, via Wikimedia Commons',
      creditoUrl: 'https://commons.wikimedia.org/wiki/File:Dammuso_in_Pantelleria,_Sicily.JPG',
    },
    {
      url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Pantelleria_-_Lago_di_Venere.jpg?width=1400',
      alt: 'Il Lago di Venere a Pantelleria',
      credito: 'Wikimedia Commons, CC BY-SA',
      creditoUrl: 'https://commons.wikimedia.org/wiki/File:Pantelleria_-_Lago_di_Venere.jpg',
    },
  ],
  'gibellina': [
    {
      url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Cretto_di_Burri_-_Gibellina.JPG?width=1280',
      alt: 'Il Cretto di Burri a Gibellina',
      credito: 'Fabior1984, CC BY-SA 3.0, via Wikimedia Commons',
      creditoUrl: 'https://commons.wikimedia.org/wiki/File:Cretto_di_Burri_-_Gibellina.JPG',
    },
  ],
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
