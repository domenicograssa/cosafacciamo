'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { modificaEvento } from '@/app/actions/admin'

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
  sito_ufficiale: string | null
  email_contatto: string | null
  telefono_contatto: string | null
}

// Converte ISO → "YYYY-MM-DD" e "HH:MM" per i campi input
function toDateInput(iso: string | null) {
  if (!iso) return ''
  return iso.slice(0, 10)
}
function toTimeInput(iso: string | null) {
  if (!iso) return ''
  return iso.slice(11, 16)
}

export default function FormModificaEvento({
  evento,
  slugEvento,
}: {
  evento: Evento
  slugEvento: string
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [errore, setErrore] = useState('')
  const [ok, setOk] = useState(false)

  const [titolo, setTitolo] = useState(evento.titolo)
  const [descrizione, setDescrizione] = useState(evento.descrizione ?? '')
  const [descrizioneBreve, setDescrizioneBreve] = useState(evento.descrizione_breve ?? '')
  const [luogoNome, setLuogoNome] = useState(evento.luogo_nome ?? '')
  const [indirizzo, setIndirizzo] = useState(evento.indirizzo ?? '')
  const [dataInizio, setDataInizio] = useState(toDateInput(evento.data_inizio))
  const [oraInizio, setOraInizio] = useState(toTimeInput(evento.data_inizio))
  const [dataFine, setDataFine] = useState(toDateInput(evento.data_fine))
  const [oraFine, setOraFine] = useState(toTimeInput(evento.data_fine))
  const [gratuito, setGratuito] = useState(evento.gratuito)
  const [prezzoMin, setPrezzoMin] = useState(evento.prezzo_min?.toString() ?? '')
  const [prezzoMax, setPrezzoMax] = useState(evento.prezzo_max?.toString() ?? '')
  const [urlBiglietti, setUrlBiglietti] = useState(evento.url_biglietti ?? '')
  const [sitoUfficiale, setSitoUfficiale] = useState(evento.sito_ufficiale ?? '')
  const [emailContatto, setEmailContatto] = useState(evento.email_contatto ?? '')
  const [telefonoContatto, setTelefonoContatto] = useState(evento.telefono_contatto ?? '')

  const isoRoma = (data: string, ora: string) => {
    if (!data || !ora) return ''
    return `${data}T${ora}:00+02:00`
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
      descrizione_breve: descrizioneBreve || descrizione.slice(0, 280),
      luogo_nome: luogoNome || undefined,
      indirizzo: indirizzo || undefined,
      data_inizio: isoRoma(dataInizio, oraInizio),
      data_fine: dataFine && oraFine ? isoRoma(dataFine, oraFine) : undefined,
      gratuito,
      prezzo_min: !gratuito && prezzoMin ? Number(prezzoMin) : null,
      prezzo_max: !gratuito && prezzoMax ? Number(prezzoMax) : null,
      url_biglietti: urlBiglietti || undefined,
      sito_ufficiale: sitoUfficiale || undefined,
      email_contatto: emailContatto || undefined,
      telefono_contatto: telefonoContatto || undefined,
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

      <div>
        <label className={labelCls}>Titolo *</label>
        <input type="text" value={titolo} onChange={e => setTitolo(e.target.value)} required className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>Descrizione breve (max 280 caratteri)</label>
        <textarea value={descrizioneBreve} onChange={e => setDescrizioneBreve(e.target.value)}
          rows={2} maxLength={280} className={inputCls + ' resize-none'} />
        <p className="text-xs text-gray-400 mt-0.5">{descrizioneBreve.length}/280</p>
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
