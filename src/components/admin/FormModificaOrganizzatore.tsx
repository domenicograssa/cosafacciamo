'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { modificaOrganizzatore } from '@/app/actions/admin'

interface Organizzatore {
  id: string
  nome: string
  email: string
  telefono: string | null
  sito_web: string | null
  descrizione: string | null
  note_interne: string | null
}

export default function FormModificaOrganizzatore({
  organizzatore,
}: {
  organizzatore: Organizzatore
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [errore, setErrore] = useState('')
  const [ok, setOk] = useState(false)

  const [nome, setNome] = useState(organizzatore.nome)
  const [email, setEmail] = useState(organizzatore.email)
  const [telefono, setTelefono] = useState(organizzatore.telefono ?? '')
  const [sitoWeb, setSitoWeb] = useState(organizzatore.sito_web ?? '')
  const [descrizione, setDescrizione] = useState(organizzatore.descrizione ?? '')
  const [noteInterne, setNoteInterne] = useState(organizzatore.note_interne ?? '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome || !email) {
      setErrore('Nome ed email sono obbligatori.')
      return
    }
    setSaving(true)
    setErrore('')

    const esito = await modificaOrganizzatore(organizzatore.id, {
      nome,
      email,
      telefono: telefono || undefined,
      sito_web: sitoWeb || undefined,
      descrizione: descrizione || undefined,
      note_interne: noteInterne || undefined,
    })

    setSaving(false)
    if (!esito.ok) {
      setErrore(esito.errore ?? 'Errore imprevisto.')
    } else {
      setOk(true)
      setTimeout(() => { router.refresh(); setOk(false) }, 1500)
    }
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
  const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1"

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Nome *</label>
          <input type="text" value={nome} onChange={e => setNome(e.target.value)} required className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Email *</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={inputCls} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Telefono</label>
          <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Sito web</label>
          <input type="url" value={sitoWeb} onChange={e => setSitoWeb(e.target.value)} placeholder="https://…" className={inputCls} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Descrizione pubblica</label>
        <textarea
          value={descrizione}
          onChange={e => setDescrizione(e.target.value)}
          rows={3}
          className={inputCls + ' resize-y'}
          placeholder="Breve presentazione dell'organizzatore visibile sul portale…"
        />
      </div>

      <div>
        <label className={labelCls}>Note interne (non visibili al pubblico)</label>
        <textarea
          value={noteInterne}
          onChange={e => setNoteInterne(e.target.value)}
          rows={2}
          className={inputCls + ' resize-y bg-amber-50'}
          placeholder="Annotazioni riservate all'admin…"
        />
      </div>

      {errore && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{errore}</p>
      )}
      {ok && (
        <p className="text-green-700 text-sm bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          ✅ Modifiche salvate!
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
      </div>
    </form>
  )
}
