// Traduzione automatica IT -> EN dei testi di un evento, tramite l'API Messages
// di Anthropic (Claude). Usata al momento della pubblicazione di un evento
// (vedi approvaEvento in src/app/actions/eventi.ts) così che la versione
// inglese del sito (/en/...) non mostri più il testo italiano di fallback.
//
// Richiede la variabile d'ambiente ANTHROPIC_API_KEY (da impostare su Vercel
// e in .env.local per lo sviluppo locale). Se assente, la traduzione viene
// saltata senza bloccare la pubblicazione dell'evento.

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

const MODELLO = 'claude-sonnet-4-5'

export async function traduciEvento(testi: TestiEvento): Promise<TestiEventoEN | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.warn('[traduzione] ANTHROPIC_API_KEY non impostata: traduzione EN saltata')
    return null
  }
  if (!testi.titolo?.trim()) return null

  const origine = {
    titolo: testi.titolo,
    descrizione: testi.descrizione ?? '',
    descrizioneBreve: testi.descrizioneBreve ?? '',
    luogoNome: testi.luogoNome ?? '',
  }

  const prompt = `Sei un traduttore professionista specializzato in turismo culturale. Traduci in inglese i seguenti campi di un evento siciliano (provincia di Trapani e dintorni), per un pubblico internazionale colto.

Regole importanti:
- Registro naturale, scorrevole, editoriale (non traduzione letterale/meccanica).
- NON tradurre nomi propri di persone, toponimi siciliani, titoli di libri/spettacoli/opere/rassegne: lasciali in italiano, tra virgolette dove opportuno (usa "..." invece di «...»).
- Non aggiungere né omettere informazioni rispetto al testo originale; non inventare dettagli.
- Se un campo è vuoto restituiscilo come stringa vuota.
- Rispondi ESCLUSIVAMENTE con un oggetto JSON valido, senza testo prima o dopo, con esattamente queste chiavi: titolo, descrizione, descrizioneBreve, luogoNome.

Testo da tradurre:
${JSON.stringify(origine, null, 2)}`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODELLO,
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) {
      console.error('[traduzione] Errore API Anthropic:', res.status, await res.text())
      return null
    }

    const data = await res.json()
    const testo: string = data?.content?.[0]?.text ?? ''
    const match = testo.match(/\{[\s\S]*\}/)
    if (!match) {
      console.error('[traduzione] Risposta senza JSON valido:', testo.slice(0, 200))
      return null
    }

    const parsed = JSON.parse(match[0]) as Record<string, string>
    if (!parsed.titolo?.trim()) return null

    return {
      titolo_en: parsed.titolo.trim(),
      descrizione_en: parsed.descrizione?.trim() || null,
      descrizione_breve_en: parsed.descrizioneBreve?.trim() || null,
      luogo_nome_en: parsed.luogoNome?.trim() || null,
    }
  } catch (e) {
    console.error('[traduzione] Eccezione durante la traduzione:', e)
    return null
  }
}
