// Foto rappresentative dei comuni — usate come hero nelle pagine /localita/[slug]
// e come fallback per gli eventi che non hanno una locandina propria.
//
// Licenze: Unsplash (libero uso commerciale) e Wikimedia Commons (CC BY / CC BY-SA /
// pubblico dominio). Per le foto Wikimedia il credito rimanda SEMPRE alla pagina del
// file su Commons, dove sono indicati autore e licenza esatti: è la forma di
// attribuzione richiesta dalle licenze CC per il riuso online.
//
// REGOLA DI SELEZIONE (importante, 9/8/2026): si accettano solo file il cui nome
// contiene il nome del comune (o di una sua frazione/monumento inequivocabile).
// Motivo: cercando "Paceco" i motori restituiscono file di "Pachino", che è un
// comune diverso in un'altra provincia — senza questa regola si finisce per
// mostrare la foto della città sbagliata, che è esattamente ciò che il portale
// non deve fare.

export interface FotoComune {
  url: string
  alt: string
  credito: string
  /** Pagina della fonte con autore e licenza (obbligatoria per le foto Wikimedia Commons) */
  creditoUrl?: string
}

// Alias storici mantenuti per non rompere gli import esistenti
export type ImmagineComune = FotoComune
export type SlideComune = FotoComune

/** Costruisce l'URL di un file Wikimedia Commons alla larghezza voluta. */
function wm(file: string, width = 1400): string {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${file}?width=${width}`
}

/** Pagina descrittiva del file su Commons (autore + licenza). */
function wmPagina(file: string): string {
  return `https://commons.wikimedia.org/wiki/File:${file}`
}

function commons(file: string, alt: string, width = 1400): FotoComune {
  return {
    url: wm(file, width),
    alt,
    credito: 'Wikimedia Commons',
    creditoUrl: wmPagina(file),
  }
}

// ─── FONTE DI VERITÀ UNICA ────────────────────────────────────────────────
// Un array di foto per comune. La prima foto è quella "di riferimento" (usata
// come copertina nella lista località); le altre servono allo slideshow hero e
// alla rotazione sulle card evento.
export const COMUNE_FOTO: Record<string, FotoComune[]> = {
  'trapani': [
    commons('Trapani_-_Centro_Storico_-_panoramio.jpg', 'Il centro storico di Trapani'),
    commons('Porto-Trapani-Sicilia-Italia.jpg', 'Il porto di Trapani'),
    commons('Saline_di_Trapani_0017.JPG', 'Le saline di Trapani'),
    commons('Saline_trapani_-_tramonto.JPG', 'Tramonto sulle saline di Trapani'),
    commons('Saline_di_Nubia_-_Trapani.jpg', 'Le saline di Nubia a Trapani'),
  ],
  'marsala': [
    commons('Porta_Garibaldi,_Marsala_TP,_Sicily,_Italy_-_panoramio.jpg', 'Porta Garibaldi a Marsala'),
    commons('Saro_di_bartolo_saline_trapani_marsala_01.jpg', 'Le saline tra Trapani e Marsala'),
    commons('Tramonto_alle_saline_Ettore_Infersa.jpg', 'Tramonto alle saline Ettore Infersa, Marsala'),
  ],
  'mazara-del-vallo': [
    commons('Mazara_del_Vallo_-_Basilica_Cattedrale_del_Santissimo_Salvatore_-_2023-09-10_16-51-15_002.jpg', 'La Basilica Cattedrale del Santissimo Salvatore a Mazara del Vallo'),
    commons('Mazara_del_Vallo_-_Porto_-_panoramio.jpg', 'Il porto peschereccio di Mazara del Vallo'),
    commons('Mazara_del_Vallo_(TP)_Il_Duomo_2011_-_panoramio.jpg', 'Il Duomo di Mazara del Vallo'),
  ],
  'castellammare-del-golfo': [
    {
      url: 'https://images.unsplash.com/photo-1756990901059-90f464223f3f?w=1400&q=80',
      alt: 'Il porto di Castellammare del Golfo al tramonto',
      credito: 'Gabriele Merlino / Unsplash',
    },
    commons('Castello_Arabo_Normanno_(Castellammare_del_Golfo)_01.jpg', 'Il castello arabo-normanno di Castellammare del Golfo'),
  ],
  'san-vito-lo-capo': [
    {
      url: 'https://images.unsplash.com/photo-1730193488340-0af0fe404306?w=1400&q=80',
      alt: 'La spiaggia di San Vito Lo Capo',
      credito: 'Paul Sebastian Saliba / Unsplash',
    },
  ],
  'calatafimi-segesta': [
    {
      url: 'https://images.unsplash.com/photo-1677967062355-b951f29c66e8?w=1400&q=80',
      alt: 'Il tempio dorico di Segesta',
      credito: 'Antonio Sessa / Unsplash',
    },
  ],
  'erice': [
    commons('Castello_di_Venere,_Erice,_Sicilia.jpg', 'Il Castello di Venere a Erice', 1280),
  ],
  'alcamo': [
    commons('Castello_di_Alcamo_0024.JPG', 'Il Castello dei Conti di Modica ad Alcamo', 1280),
  ],
  'favignana': [
    commons('Favignana_Cala_Rossa.JPG', 'Cala Rossa a Favignana', 1280),
  ],
  'castelvetrano': [
    commons('Selinunte_Temple_C_aerial_view.jpg', 'Veduta aerea del Tempio C di Selinunte', 1280),
  ],
  'pantelleria': [
    commons('Dammuso_in_Pantelleria,_Sicily.JPG', 'Un dammuso a Pantelleria', 1280),
    commons('Castello_di_Pantelleria.jpeg', 'Il castello di Pantelleria'),
  ],
  'gibellina': [
    commons('Cretto_di_Burri_-_Gibellina.JPG', 'Il Cretto di Burri a Gibellina', 1280),
  ],
  'palermo': [
    commons('Il_Teatro_Massimo_di_Palermo.jpg', 'Il Teatro Massimo di Palermo'),
    commons('Palermo_Cathedral_BW_2025-04-29_11-57-44.jpg', 'La Cattedrale di Palermo'),
  ],
  'salemi': [
    commons('Castello_di_Salemi_2.jpg', 'Il castello normanno-svevo di Salemi'),
  ],
  'custonaci': [
    commons('Custonaci-pan.jpg', 'Panorama di Custonaci'),
    commons('Custonaci_-_Santuario_di_Maria_SS._di_Custonaci_-_panoramio_-_Andrea_Albini_(4).jpg', 'Il Santuario di Maria SS. di Custonaci'),
    commons('Edicola_di_San_Nicola_-_Riserva_naturale_Monte_Cofano,_Custonaci,_Trapani_-_1_Maggio_2023.jpg', 'La riserva naturale di Monte Cofano a Custonaci'),
  ],
  'partanna': [
    commons('Chiesa_madre_Partanna.jpg', 'La Chiesa Madre di Partanna'),
  ],
  'campobello-di-mazara': [
    commons('Rocche-di-Cusa-bjs-1.jpg', 'Le Cave di Cusa a Campobello di Mazara'),
    commons('Rocche-di-Cusa-bjs-4.jpg', 'I rocchi di colonna delle Cave di Cusa, Campobello di Mazara'),
  ],
  'poggioreale': [
    commons('Ruderi_di_Poggioreale_30.jpg', 'I ruderi di Poggioreale antica'),
  ],
  'buseto-palizzolo': [
    commons('BattagliaBuseto2.JPG', 'Buseto Palizzolo'),
  ],
  // ─── Comuni ancora senza foto verificata su Wikimedia Commons ───────────
  // paceco, petrosino, santa-ninfa, salaparuta, vita, valderice, misiliscemi:
  // la copertura di Commons per questi centri è quasi nulla (spesso esiste solo
  // la mappa SVG del comune). Restano sul placeholder colorato per categoria,
  // che è comunque una resa dignitosa. NON inserire qui foto "somiglianti" di
  // altri comuni: meglio un placeholder onesto di una foto sbagliata.
}

// ─── Compatibilità con il codice esistente ────────────────────────────────
// COMUNE_SLIDES (slideshow hero) e COMUNE_IMMAGINI (foto singola di riferimento)
// sono ora derivati da COMUNE_FOTO, così non esiste più il rischio — capitato
// davvero fino all'8/8/2026 — che un comune abbia le slide ma manchi dal
// fallback eventi (era il caso di Marsala, Trapani e Mazara del Vallo: le loro
// pagine località mostravano le foto, ma tutti i loro eventi mostravano l'emoji).
export const COMUNE_SLIDES: Record<string, FotoComune[]> = COMUNE_FOTO

export const COMUNE_IMMAGINI: Record<string, FotoComune> = Object.fromEntries(
  Object.entries(COMUNE_FOTO)
    .filter(([, foto]) => foto.length > 0)
    .map(([slug, foto]) => [slug, foto[0]])
)

export function immagineComune(slug: string): FotoComune | null {
  return COMUNE_IMMAGINI[slug] ?? null
}

export function fotoComune(slug: string): FotoComune[] {
  return COMUNE_FOTO[slug] ?? []
}

// Hash stabile e deterministico (djb2) — serve a scegliere sempre la stessa foto
// per lo stesso evento, sia sul server sia sul client: un Math.random() qui
// causerebbe un mismatch di hydration e farebbe "saltare" l'immagine al caricamento.
function hashStabile(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0
  return h
}

/**
 * Foto della città da usare per un evento specifico. Quando il comune ha più
 * foto, ne sceglie una in base all'id dell'evento: così due eventi dello stesso
 * comune non mostrano la stessa identica immagine (prima succedeva sempre, e la
 * pagina di una località sembrava piena di card fotocopia).
 */
export function fotoComunePerEvento(slug: string, seedEvento: string): FotoComune | null {
  const foto = COMUNE_FOTO[slug]
  if (!foto || foto.length === 0) return null
  if (foto.length === 1) return foto[0]
  return foto[hashStabile(seedEvento) % foto.length]
}
