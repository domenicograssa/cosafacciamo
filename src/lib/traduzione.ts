// Traduzione automatica IT -> EN dei testi di un evento, tramite l'API DeepL
// (piano Free: 500.000 caratteri/mese, nessuna carta di credito richiesta).
// Usata al momento della pubblicazione di un evento (vedi approvaEvento in
// src/app/actions/eventi.ts) così che la versione inglese del sito (/en/...)
// non mostri più il testo italiano di fallback.
//
// Richiede la variabile d'ambiente DEEPL_API_KEY (da impostare su Vercel e in
// .env.local per lo sviluppo locale). Se assente, la traduzione viene saltata
// senza bloccare la pubblicazione dell'evento.
//
// Nota: le chiavi del piano Free di DeepL terminano con ":fx" e vanno inviate
// a api-free.deepl.com (non api.deepl.com, riservato al piano Pro) — la scelta
// dell'endpoint è automatica in base al suffisso della chiave.

interface TestiEvento {
  titolo: string
  descrizione: string | null
  descrizioneBreve: string | null
  luogoNome: string | null
}

interface TestiEventoEN {
  titolo_en: string
  descrizione_en: string | null
  descrizione_breve_en: string | null
  luogo_nome_en: string | null
}

type ChiaveCampo = 'titolo_en' | 'descrizione_en' | 'descrizione_breve_en' | 'luogo_nome_en'

interface CampoDaTradurre {
  chiave: ChiaveCampo
  valore: string
}

export async function traduciEvento(testi: TestiEvento): Promise<TestiEventoEN | null> {
  const apiKey = process.env.DEEPL_API_KEY
  if (!apiKey) {
    console.warn('[traduzione] DEEPL_API_KEY non impostata: traduzione EN saltata')
    return null
  }
  if (!testi.titolo?.trim()) return null

  const endpoint = apiKey.trim().endsWith(':fx')
    ? 'https://api-free.deepl.com/v2/translate'
    : 'https://api.deepl.com/v2/translate'

  // Mantiene l'ordine dei campi per poter ricostruire il risultato dopo la
  // risposta; i campi vuoti non vengono inviati a DeepL.
  const tutti: Array<{ chiave: ChiaveCampo; valore: string | null }> = [
    { chiave: 'titolo_en', valore: testi.titolo },
    { chiave: 'descrizione_en', valore: testi.descrizione },
    { chiave: 'descrizione_breve_en', valore: testi.descrizioneBreve },
    { chiave: 'luogo_nome_en', valore: testi.luogoNome },
  ]
  const daTradurre: CampoDaTradurre[] = tutti.filter(
    (c): c is CampoDaTradurre => !!c.valore?.trim()
  )
  if (daTradurre.length === 0) return null

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `DeepL-Auth-Key ${apiKey}`,
      },
      body: JSON.stringify({
        text: daTradurre.map(c => c.valore),
        source_lang: 'IT',
        target_lang: 'EN-US',
      }),
    })

    if (!res.ok) {
      console.error('[traduzione] Errore API DeepL:', res.status, await res.text())
      return null
    }

    const data = await res.json()
    const traduzioni: Array<{ text: string }> = data?.translations ?? []
    if (traduzioni.length !== daTradurre.length) {
      console.error('[traduzione] Numero di traduzioni inatteso da DeepL')
      return null
    }

    const risultato: Partial<Record<ChiaveCampo, string>> = {}
    daTradurre.forEach((campo, i) => {
      risultato[campo.chiave] = traduzioni[i].text.trim()
    })

    if (!risultato.titolo_en?.trim()) return null

    return {
      titolo_en: risultato.titolo_en,
      descrizione_en: risultato.descrizione_en ?? null,
      descrizione_breve_en: risultato.descrizione_breve_en ?? null,
      luogo_nome_en: risultato.luogo_nome_en ?? null,
    }
  } catch (e) {
    console.error('[traduzione] Eccezione durante la traduzione:', e)
    return null
  }
}
