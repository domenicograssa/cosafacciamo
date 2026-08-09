'use client'

import { useState } from 'react'
import Image from 'next/image'
import EventImagePlaceholder from '@/components/ui/EventImagePlaceholder'

export interface FonteImmagine {
  url: string
  alt: string
}

interface Props {
  /** Fonti in ordine di preferenza: locandina evento → foto della città → … */
  fonti: FonteImmagine[]
  categoriaSlug?: string
  categoriaNome?: string
  categoriaColore?: string
  compact?: boolean
  className?: string
  sizes?: string
  priority?: boolean
}

/**
 * Immagine di un evento con degradazione elegante.
 *
 * Perché esiste: le foto delle città sono ospitate su Wikimedia Commons, dove i
 * file possono essere rinominati o cancellati dalla community in qualsiasi
 * momento. Prima di questo componente un URL non più valido lasciava un
 * riquadro grigio vuoto nella card — il problema "immagini" segnalato più volte.
 * Ora un errore di caricamento fa semplicemente passare alla fonte successiva e,
 * esaurite le fonti, al placeholder colorato per categoria: l'evento ha SEMPRE
 * qualcosa di presentabile, qualunque cosa succeda alla fonte remota.
 */
export default function ImmagineEvento({
  fonti,
  categoriaSlug,
  categoriaNome,
  categoriaColore,
  compact = false,
  className = '',
  sizes,
  priority = false,
}: Props) {
  const [indice, setIndice] = useState(0)

  const fonte = fonti[indice]

  if (!fonte) {
    return (
      <EventImagePlaceholder
        categoriaSlug={categoriaSlug}
        categoriaNome={categoriaNome}
        categoriaColore={categoriaColore}
        compact={compact}
      />
    )
  }

  return (
    <Image
      src={fonte.url}
      alt={fonte.alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
      // Si passa alla fonte successiva; quando finiscono, `fonte` diventa
      // undefined e viene reso il placeholder (vedi sopra).
      onError={() => setIndice(i => i + 1)}
    />
  )
}
