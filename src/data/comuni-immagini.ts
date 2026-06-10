// Immagini rappresentative dei comuni — usate come fallback quando un evento
// non ha un'immagine propria autorizzata.
// Tutte con licenza Unsplash (uso libero anche commerciale): fonte e autore documentati.

export interface ImmagineComune {
  url: string
  alt: string
  credito: string
}

export const COMUNE_IMMAGINI: Record<string, ImmagineComune> = {
  // photo-1524942434100-2b3f200f5b40 — Jacek Dylag / Unsplash (Alcamo, Sicily)
  'alcamo': {
    url: 'https://images.unsplash.com/photo-1524942434100-2b3f200f5b40?w=1400&q=80',
    alt: 'Veduta di Alcamo',
    credito: 'Jacek Dylag / Unsplash',
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
}

export function immagineComune(slug: string): ImmagineComune | null {
  return COMUNE_IMMAGINI[slug] ?? null
}
