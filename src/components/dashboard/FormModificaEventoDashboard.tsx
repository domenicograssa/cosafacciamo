'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { modificaEventoOrganizzatore } from '@/app/actions/eventi'
import { dataOraInputRoma, isoDaRoma } from '@/lib/utils'
import { comprimiImmagine } from '@/lib/comprimi-immagine'

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
  geo_nodo_id: string | null
  immagine_copertina: string | null
  stato: string
  [key: string]: unknown
}

interface Comune { id: string; nome: string }
interface Categoria { id: string; nome: string; icona: string | null }

export default function FormModificaEventoDashboard({
  evento,
  comuni,
  categorie,
  categorieSelezionate,
}: {
  evento: Evento
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
  const [immagineAttuale, setImmagineAttuale] = useState(evento.immagine_copertina ?? '')
  const [nuovaImmagine, setNuovaImmagine] = useState<File | null>(null)
  const [anteprimaNuova, setAnteprimaNuova] = useState<string | null>(null)
  const [erroreImmagine, setErroreImmagine] = useState('')
  const inizioIniziale = dataOraInputRoma(evento.data_inizio)
  const fineIniziale = dataOraInputRoma(evento.data_fine)
  const [dataInizio, setDataInizio] = useState(inizioIniziale.data)
  const [oraInizio, setOraInizio] = useState(inizioIniziale.ora)
  const [dataFine, setDataFine] = useState(fineIniziale.data)
  const [oraFine, setOraFine] = useState(fineIniziale.ora)
  const [gratuito, setGratuito] = useState(evento.gratuito)
  const [prezzoMin, setPrezzoMin] = useState(evento.prezzo_min?.toString() ?? '')
  const [prezzoMax, setPrezzoMax] = useState(evento.prezzo_max?.toString() ?? '')
  const [urlBiglietti, setUrlBiglietti] = useState((evento.url_biglietti as string | null) ?? '')
  const [sitoUfficiale, setSitoUfficiale] = useState((evento.sito_ufficiale as string | null) ?? '')
  const [emailContatto, setEmailContatto] = useState((evento.email_contatto as string | null) ?? '')
  const [telefonoContatto, setTelefonoContatto] = useState((evento.telefono_contatto as string | null) ?? '')
  const [catSelezionate, setCatSelezionate] = useState<string[]>(categorieSelezionate)

  const toggleCategoria = (id: string) => {
    setCatSelezionate(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
  }

  const selezionaImmagine = (file: File | null) => {
    setErroreImmagine('')
    if (!file) { setNuovaImmagine(null); setAnteprimaNuova(null); return }
    if (!file.type.startsWith('image/')) { setErroreImmagine('Il file selezionato non è un\'immagine.'); return }
    if (file.size > 10 * 1024 * 1024) { setErroreImmagine('L\'immagine è troppo grande (massimo 10 MB).'); return }
    setNuovaImmagine(file)
    setAnteprimaNuova(URL.createObjectURL(file))
  }

  const rimuoviImmagineAttuale = () => {
    setImmagineAttuale('')
    setNuovaImmagine(null)
    setAnteprimaNuova(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!titolo || !descrizione || !dataInizio || !oraInizio) {
      setErrore('Titolo, descrizione, data e ora di inizio sono obbligatori.')
      return
    }
    setSaving(true)
    setErrore('')

    try {
      const fd = new window.FormData()
      fd.append('titolo', titolo)
      fd.append('descrizione', descrizione)
      fd.append('luogo_nome', luogoNome)
      fd.append('indirizzo', indirizzo)
      fd.append('data_inizio', isoDaRoma(dataInizio, oraInizio))
      fd.append('data_fine', dataFine && oraFine ? isoDaRoma(dataFine, oraFine) : '')
      fd.append('gratuito', String(gratuito))
      fd.append('prezzo_min', !gratuito ? prezzoMin : '')
      fd.append('prezzo_max', !gratuito ? prezzoMax : '')
      fd.append('url_biglietti', urlBiglietti)
      fd.append('sito_ufficiale', sitoUfficiale)
      fd.append('email_contatto', emailContatto)
      fd.append('telefono_contatto', telefonoContatto)
      fd.append('geo_nodo_id', geoNodoId)
      fd.append('categorie_ids', catSelezionate.join(','))

      if (nuovaImmagine) {
        const blob = await comprimiImmagine(nuovaImmagine)
        fd.append('immagine', blob, 'evento.jpg')
      } else if (!immagineAttuale && evento.immagine_copertina) {
        fd.append('rimuovi_immagine', 'true')
      }

      const esito = await modificaEventoOrganizzatore(evento.id, fd)

      if (!esito.ok) {
        setErrore(esito.errore ?? 'Errore imprevisto.')
      } else {
        setOk(true)
        setTimeout(() => router.push('/dashboard/miei-eventi'), 1500)
      }
    } catch {
      setErrore('Errore nella preparazione dei dati. Riprova.')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
  const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1"

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {evento.stato === 'approvato' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          ⚠️ Questo evento è già pubblicato. Salvando le modifiche tornerà in revisione e verrà
          temporaneamente nascosto dal sito fino a nuova approvazione.
        </div>
      )}

      <div>
        <label className={labelCls}>Titolo *</label>
        <input type="text" value={titolo} onChange={e => setTitolo(e.target.value)} required className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>Descrizione completa *</label>
        <textarea value={descrizione} onChange={e => setDescrizione(e.target.value)}
          required rows={6} className={inputCls + ' resize-y'} />
      </div>

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

      <div>
        <label className={labelCls}>Comune</label>
        <select value={geoNodoId} onChange={e => setGeoNodoId(e.target.value)} className={inputCls + ' bg-white'}>
          <option value="">— Seleziona comune —</option>
          {comuni.map(c => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
      </div>

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

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={gratuito} onChange={e => setGratuito(e.target.checked)} className="w-4 h-4 accent-amber-400" />
          <span className="text-sm font-medium text-gray-700">Ingresso gratuito</span>
        </label>
      </div>

      {!gratuito && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Prezzo minimo (€)</label>
            <input type="number" min="0" step="0.50" value={prezzoMin} onChange={e => setPrezzoMin(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Prezzo massimo (€)</label>
            <input type="number" min="0" step="0.50" value={prezzoMax} onChange={e => setPrezzoMax(e.target.value)} className={inputCls} />
          </div>
        </div>
      )}

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
                <input type="checkbox" checked={catSelezionate.includes(cat.id)}
                  onChange={() => toggleCategoria(cat.id)} className="sr-only" />
                {cat.icona && <span>{cat.icona}</span>}
                {cat.nome}
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className={labelCls}>Immagine di copertina</label>
        {anteprimaNuova ? (
          <div className="relative rounded-xl overflow-hidden border border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={anteprimaNuova} alt="Anteprima nuova immagine" className="w-full aspect-video object-cover" />
            <button
              type="button"
              onClick={() => selezionaImmagine(null)}
              className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow"
            >
              ✕ Annulla
            </button>
          </div>
        ) : immagineAttuale ? (
          <div className="relative rounded-xl overflow-hidden border border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={immagineAttuale} alt="Immagine attuale" className="w-full aspect-video object-cover"
              onError={ev => { (ev.target as HTMLImageElement).style.display = 'none' }} />
            <div className="absolute top-2 right-2 flex gap-2">
              <label className="bg-white/90 hover:bg-white text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow cursor-pointer">
                Sostituisci
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                  onChange={e => selezionaImmagine(e.target.files?.[0] ?? null)} />
              </label>
              <button type="button" onClick={rimuoviImmagineAttuale}
                className="bg-white/90 hover:bg-white text-red-600 text-xs font-semibold px-3 py-1.5 rounded-full shadow">
                ✕ Rimuovi
              </button>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-amber-400 rounded-xl py-8 cursor-pointer transition-colors">
            <span className="text-3xl">🖼️</span>
            <span className="text-sm font-semibold text-gray-700">Carica un&apos;immagine</span>
            <span className="text-xs text-gray-500">JPG, PNG o WebP — verrà ottimizzata automaticamente</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
              onChange={e => selezionaImmagine(e.target.files?.[0] ?? null)} />
          </label>
        )}
        {erroreImmagine && <p className="text-red-600 text-xs mt-1.5">{erroreImmagine}</p>}
        <p className="text-xs text-gray-500 mt-1.5">
          Carica solo immagini di cui sei titolare o per cui disponi dei diritti di pubblicazione.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>URL biglietti</label>
          <input type="url" value={urlBiglietti} onChange={e => setUrlBiglietti(e.target.value)} placeholder="https://…" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Sito ufficiale</label>
          <input type="url" value={sitoUfficiale} onChange={e => setSitoUfficiale(e.target.value)} placeholder="https://…" className={inputCls} />
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
          ✅ Modifiche salvate! Torno ai tuoi eventi…
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving || ok}
          className="bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm">
          {saving ? 'Salvataggio…' : 'Salva modifiche'}
        </button>
        <a href="/dashboard/miei-eventi"
          className="border border-gray-200 hover:border-gray-400 text-gray-700 font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm">
          Annulla
        </a>
      </div>
    </form>
  )
}
