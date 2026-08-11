'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { modificaEvento } from '@/app/actions/admin'
import { dataOraInputRoma, isoDaRoma } from '@/lib/utils'

interface Evento {
  id: string
  titolo: string
  descrizione: string | null
  descrizione_breve: string | null
  luogo_nome: string | null
  indirizzo: string | null
  data_inizio: string
  data_fine: string | null
  gratuito: boolean
  prezzo_min: number | null
  prezzo_max: number | null
  url_biglietti: string | null
  geo_nodo_id: string | null
  immagine_copertina: string | null
  [key: string]: unknown
}

interface Comune { id: string; nome: string }
interface Categoria { id: string; nome: string; icona: string | null }

export default function FormModificaEvento({
  evento,
  slugEvento,
  comuni,
  categorie,
  categorieSelezionate,
}: {
  evento: Evento
  slugEvento: string
  comuni: Comune[]
  categorie: Categoria[]
  categorieSelezionate: string[]
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [errore, setErrore] = useState('')
  const [ok, setOk] = useState(false)

  const [titolo, setTitolo] = useState(evento.titolo)
  const [descrizione, setDescrizione] = useState(evento.descrizione ?? '')
  const [luogoNome, setLuogoNome] = useState(evento.luogo_nome ?? '')
  const [indirizzo, setIndirizzo] = useState(evento.indirizzo ?? '')
  const [geoNodoId, setGeoNodoId] = useState(evento.geo_nodo_id ?? '')
  const [immagine, setImmagine] = useState(evento.immagine_copertina ?? '')
  const inizioIniziale = dataOraInputRoma(evento.data_inizio)
  const fineIniziale = dataOraInputRoma(evento.data_fine)
  const [dataInizio, setDataInizio] = useState(inizioIniziale.data)
  const [oraInizio, setOraInizio] = useState(inizioIniziale.ora)
  const [dataFine, setDataFine] = useState(fineIniziale.data)
  const [oraFine, setOraFine] = useState(fineIniziale.ora)
  const [gratuito, setGratuito] = useState(evento.gratuito)
  const [prezzoMin, setPrezzoMin] = useState(evento.prezzo_min?.toString() ?? '')
  const [prezzoMax, setPrezzoMax] = useState(evento.prezzo_max?.toString() ?? '')
  const [urlBiglietti, setUrlBiglietti] = useState((evento.url_biglietti as string) ?? '')
  const [sitoUfficiale, setSitoUfficiale] = useState((evento.sito_ufficiale as string | null) ?? '')
  const [emailContatto, setEmailContatto] = useState((evento.email_contatto as string | null) ?? '')
  const [telefonoContatto, setTelefonoContatto] = useState((evento.telefono_contatto as string | null) ?? '')
  const [inEvidenza, setInEvidenza] = useState((evento.in_evidenza as boolean | null) ?? false)
  const [testoArticolo, setTestoArticolo] = useState((evento.testo_articolo as string | null) ?? '')
  const [catSelezionate, setCatSelezionate] = useState<string[]>(categorieSelezionate)

  const toggleCategoria = (id: string) => {
    setCatSelezionate(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!titolo || !descrizione || !dataInizio || !oraInizio) {
      setErrore('Titolo, descrizione, data e ora di inizio sono obbligatori.')
      return
    }
    setSaving(true)
    setErrore('')

    const esito = await modificaEvento(evento.id, {
      titolo,
      descrizione,
      // Non più editabile a mano: derivata dalla descrizione completa, serve
      // solo per meta-tag SEO (og:description, JSON-LD) — mai mostrata in pagina.
      descrizione_breve: descrizione.slice(0, 280),
      luogo_nome: luogoNome || undefined,
      indirizzo: indirizzo || undefined,
      data_inizio: isoDaRoma(dataInizio, oraInizio),
      data_fine: dataFine && oraFine ? isoDaRoma(dataFine, oraFine) : undefined,
      gratuito,
      prezzo_min: !gratuito && prezzoMin ? Number(prezzoMin) : null,
      prezzo_max: !gratuito && prezzoMax ? Number(prezzoMax) : null,
      url_biglietti: urlBiglietti || undefined,
      sito_ufficiale: sitoUfficiale || undefined,
      email_contatto: emailContatto || undefined,
      telefono_contatto: telefonoContatto || undefined,
      geo_nodo_id: geoNodoId || undefined,
      immagine_copertina: immagine,
      in_evidenza: inEvidenza,
      testo_articolo: testoArticolo || undefined,
      categorie_ids: catSelezionate,
    })

    setSaving(false)
    if (!esito.ok) {
      setErrore(esito.errore ?? 'Errore imprevisto.')
    } else {
      setOk(true)
      setTimeout(() => router.push(`/admin/eventi/${slugEvento}`), 1500)
    }
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
  const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1"

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Titolo */}
      <div>
        <label className={labelCls}>Titolo *</label>
        <input type="text" value={titolo} onChange={e => setTitolo(e.target.value)} required className={inputCls} />
      </div>

      {/* Descrizione completa */}
      <div>
        <label className={labelCls}>Descrizione completa *</label>
        <textarea value={descrizione} onChange={e => setDescrizione(e.target.value)}
          required rows={6} className={inputCls + ' resize-y'} />
      </div>

      {/* Luogo */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Luogo / Nome sede</label>
          <input type="text" value={luogoNome} onChange={e => setLuogoNome(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Indirizzo</label>
          <input type="text" value={indirizzo} onChange={e => setIndirizzo(e.target.value)} className={inputCls} />
        </div>
      </div>

      {/* Comune */}
      <div>
        <label className={labelCls}>Comune</label>
        <select value={geoNodoId} onChange={e => setGeoNodoId(e.target.value)} className={inputCls + ' bg-white'}>
          <option value="">— Seleziona comune —</option>
          {comuni.map(c => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
      </div>

      {/* Date */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Data inizio *</label>
          <input type="date" value={dataInizio} onChange={e => setDataInizio(e.target.value)} required className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Ora inizio *</label>
          <input type="time" value={oraInizio} onChange={e => setOraInizio(e.target.value)} required className={inputCls} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Data fine</label>
          <input type="date" value={dataFine} onChange={e => setDataFine(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Ora fine</label>
          <input type="time" value={oraFine} onChange={e => setOraFine(e.target.value)} className={inputCls} />
        </div>
      </div>

      {/* Prezzo */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={gratuito} onChange={e => setGratuito(e.target.checked)}
            className="w-4 h-4 accent-amber-400" />
          <span className="text-sm font-medium text-gray-700">Ingresso gratuito</span>
        </label>
      </div>

      {!gratuito && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Prezzo minimo (€)</label>
            <input type="number" min="0" step="0.50" value={prezzoMin}
              onChange={e => setPrezzoMin(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Prezzo massimo (€)</label>
            <input type="number" min="0" step="0.50" value={prezzoMax}
              onChange={e => setPrezzoMax(e.target.value)} className={inputCls} />
          </div>
        </div>
      )}

      {/* Categorie */}
      {categorie.length > 0 && (
        <div>
          <label className={labelCls}>Categorie</label>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {categorie.map(cat => (
              <label
                key={cat.id}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm cursor-pointer border transition-colors ${
                  catSelezionate.includes(cat.id)
                    ? 'bg-amber-400 border-amber-400 text-white font-semibold'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-amber-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={catSelezionate.includes(cat.id)}
                  onChange={() => toggleCategoria(cat.id)}
                  className="sr-only"
                />
                {cat.icona && <span>{cat.icona}</span>}
                {cat.nome}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* In evidenza homepage */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={inEvidenza} onChange={e => setInEvidenza(e.target.checked)}
            className="w-4 h-4 accent-amber-400" />
          <span className="text-sm font-semibold text-gray-800">Metti in evidenza nella sezione &quot;In primo piano&quot; della homepage</span>
        </label>
        <p className="text-xs text-gray-500">
          Gli eventi in evidenza hanno la priorità nei 3 posti della sezione &quot;In primo piano&quot;.
          Se ne selezioni meno di 3, i posti restanti si riempiono da soli con i prossimi eventi in programma.
        </p>
        <div>
          <label className={labelCls}>Testo articolo homepage (opzionale)</label>
          <textarea value={testoArticolo} onChange={e => setTestoArticolo(e.target.value)}
            rows={4} placeholder="Se lasci vuoto, in homepage viene mostrata la descrizione completa dell'evento."
            className={inputCls + ' resize-y bg-white'} />
        </div>
      </div>

      {/* Immagine */}
      <div>
        <label className={labelCls}>Immagine di copertina</label>
        {/*
          type="text" e non type="url": il campo deve accettare anche i percorsi
          relativi tipo /eventi/nome-file.jpg, che sono il formato usato dalle
          locandine committate in public/eventi/ ed è uno dei due soli formati
          che queries/eventi.ts accetta di mostrare.
          Con type="url" il browser considerava "/eventi/…" un valore non valido
          e bloccava l'invio del form senza mostrare alcun errore: le modifiche
          sembravano salvate e invece non partivano. (Bug trovato l'11/8/2026
          inserendo la locandina di TIME90.)
        */}
        <input
          type="text"
          value={immagine}
          onChange={e => setImmagine(e.target.value)}
          placeholder="/eventi/nome-file.jpg oppure https://…"
          className={inputCls}
        />
        <p className="mt-1 text-xs text-gray-500">
          Percorso di una locandina caricata nel sito (es. <code>/eventi/nome-file.jpg</code>)
          oppure indirizzo completo di un&apos;immagine su Supabase Storage.
        </p>
        {immagine && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={immagine}
            alt="Anteprima"
            className="mt-2 rounded-xl max-h-40 object-cover"
            onError={ev => { (ev.target as HTMLImageElement).style.display = 'none' }}
          />
        )}
      </div>

      {/* Link e contatti */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>URL biglietti</label>
          <input type="url" value={urlBiglietti} onChange={e => setUrlBiglietti(e.target.value)}
            placeholder="https://…" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Sito ufficiale</label>
          <input type="url" value={sitoUfficiale} onChange={e => setSitoUfficiale(e.target.value)}
            placeholder="https://…" className={inputCls} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Email contatto</label>
          <input type="email" value={emailContatto} onChange={e => setEmailContatto(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Telefono contatto</label>
          <input type="tel" value={telefonoContatto} onChange={e => setTelefonoContatto(e.target.value)} className={inputCls} />
        </div>
      </div>

      {errore && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{errore}</p>
      )}
      {ok && (
        <p className="text-green-700 text-sm bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          ✅ Modifiche salvate! Torno al dettaglio…
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || ok}
          className="bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm"
        >
          {saving ? 'Salvataggio…' : 'Salva modifiche'}
        </button>
        <a
          href={`/admin/eventi/${slugEvento}`}
          className="border border-gray-200 hover:border-gray-400 text-gray-700 font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
        >
          Annulla
        </a>
      </div>
    </form>
  )
}
