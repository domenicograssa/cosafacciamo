'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CATEGORIE, GEO_NODI } from '@/data/mock'

type Step = 'organizzatore' | 'evento' | 'anteprima' | 'inviato'

interface FormData {
  // Organizzatore
  nomeOrg: string
  emailOrg: string
  telefonoOrg: string
  sitoWeb: string
  // Evento
  titolo: string
  descrizione: string
  categorieSelezionate: string[]
  comuneId: string
  luogoNome: string
  indirizzo: string
  dataInizio: string
  oraInizio: string
  dataFine: string
  oraFine: string
  gratuito: boolean
  prezzoMin: string
  prezzoMax: string
  urlBiglietti: string
  // Consenso
  accettaTermini: boolean
}

const STEPS: { key: Step; label: string }[] = [
  { key: 'organizzatore', label: 'Chi sei' },
  { key: 'evento',        label: "L'evento" },
  { key: 'anteprima',     label: 'Anteprima' },
]

const STEP_INDEX: Record<Step, number> = { organizzatore: 0, evento: 1, anteprima: 2, inviato: 3 }

export default function PubblicaPage() {
  const [step, setStep] = useState<Step>('organizzatore')
  const [form, setForm] = useState<FormData>({
    nomeOrg: '', emailOrg: '', telefonoOrg: '', sitoWeb: '',
    titolo: '', descrizione: '', categorieSelezionate: [], comuneId: '',
    luogoNome: '', indirizzo: '', dataInizio: '', oraInizio: '',
    dataFine: '', oraFine: '', gratuito: false, prezzoMin: '', prezzoMax: '',
    urlBiglietti: '', accettaTermini: false,
  })

  const update = (field: keyof FormData, value: FormData[keyof FormData]) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const toggleCategoria = (slug: string) => {
    setForm(prev => ({
      ...prev,
      categorieSelezionate: prev.categorieSelezionate.includes(slug)
        ? prev.categorieSelezionate.filter(c => c !== slug)
        : [...prev.categorieSelezionate, slug],
    }))
  }

  const comuni = GEO_NODI.filter(n => n.tipo === 'comune')
  const comuneSelezionato = comuni.find(c => c.id === form.comuneId)
  const categorieSel = CATEGORIE.filter(c => form.categorieSelezionate.includes(c.slug))

  const handleSubmit = () => setStep('inviato')

  if (step === 'inviato') {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-2xl font-extrabold text-gray-900">Evento inviato!</h1>
        <p className="text-gray-600 mt-3 leading-relaxed">
          Il tuo evento è stato inviato e verrà revisionato dal nostro team entro 24 ore.
          Riceverai una notifica via email quando sarà approvato e visibile sul portale.
        </p>
        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-800">
          <strong>Stato:</strong> In revisione 🔍
        </div>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="bg-amber-400 hover:bg-amber-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
            Torna alla home
          </Link>
          <button
            onClick={() => { setStep('organizzatore'); setForm(f => ({ ...f, titolo: '', descrizione: '' })) }}
            className="border-2 border-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl hover:border-gray-300 transition-colors"
          >
            Pubblica un altro evento
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="text-sm text-gray-500 hover:text-amber-600 flex items-center gap-1 mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Torna alla home
        </Link>
        <h1 className="text-2xl font-extrabold text-gray-900">Pubblica il tuo evento</h1>
        <p className="text-gray-500 text-sm mt-1">
          Il tuo evento sarà visibile dopo la revisione del nostro team (entro 24 ore).
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                STEP_INDEX[step] > i ? 'bg-green-500 text-white' :
                STEP_INDEX[step] === i ? 'bg-amber-400 text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                {STEP_INDEX[step] > i ? '✓' : i + 1}
              </div>
              <p className={`text-xs mt-1 font-medium ${STEP_INDEX[step] === i ? 'text-amber-600' : 'text-gray-500'}`}>
                {s.label}
              </p>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mb-4 mx-1 transition-colors ${STEP_INDEX[step] > i ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1 — Chi sei */}
      {step === 'organizzatore' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-bold text-gray-900 text-lg">Chi organizza l&apos;evento?</h2>

          <Field label="Nome organizzazione o nome e cognome *">
            <input
              value={form.nomeOrg}
              onChange={e => update('nomeOrg', e.target.value)}
              placeholder="Es: ProLoco Alcamo, Mario Rossi, Associazione XYZ"
              className={inputClass}
            />
          </Field>

          <Field label="Email di contatto *">
            <input
              type="email"
              value={form.emailOrg}
              onChange={e => update('emailOrg', e.target.value)}
              placeholder="eventi@tuaorganizzazione.it"
              className={inputClass}
            />
          </Field>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Telefono">
              <input
                type="tel"
                value={form.telefonoOrg}
                onChange={e => update('telefonoOrg', e.target.value)}
                placeholder="+39 320 000 0000"
                className={inputClass}
              />
            </Field>
            <Field label="Sito web">
              <input
                type="url"
                value={form.sitoWeb}
                onChange={e => update('sitoWeb', e.target.value)}
                placeholder="https://..."
                className={inputClass}
              />
            </Field>
          </div>

          <div className="pt-2">
            <button
              disabled={!form.nomeOrg || !form.emailOrg}
              onClick={() => setStep('evento')}
              className="w-full bg-amber-400 hover:bg-amber-500 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Continua →
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — L'evento */}
      {step === 'evento' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-bold text-gray-900 text-lg">Dettagli evento</h2>

          <Field label="Titolo evento *">
            <input
              value={form.titolo}
              onChange={e => update('titolo', e.target.value)}
              placeholder="Es: Concerto in Piazza Petrolo"
              className={inputClass}
            />
          </Field>

          <Field label="Descrizione *">
            <textarea
              value={form.descrizione}
              onChange={e => update('descrizione', e.target.value)}
              placeholder="Descrivi l'evento, cosa succederà, per chi è rivolto..."
              rows={4}
              className={`${inputClass} resize-none`}
            />
          </Field>

          {/* Categorie */}
          <Field label="Categoria *">
            <div className="flex flex-wrap gap-2 mt-1">
              {CATEGORIE.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategoria(cat.slug)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border-2 transition-all ${
                    form.categorieSelezionate.includes(cat.slug)
                      ? 'text-white border-transparent'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                  style={form.categorieSelezionate.includes(cat.slug) ? { backgroundColor: cat.colore, borderColor: cat.colore } : {}}
                >
                  <span>{cat.icona}</span>
                  <span>{cat.nome}</span>
                </button>
              ))}
            </div>
          </Field>

          {/* Luogo */}
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Comune *">
              <select
                value={form.comuneId}
                onChange={e => update('comuneId', e.target.value)}
                className={inputClass}
              >
                <option value="">Seleziona comune</option>
                {comuni.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </Field>
            <Field label="Nome del luogo">
              <input
                value={form.luogoNome}
                onChange={e => update('luogoNome', e.target.value)}
                placeholder="Es: Piazza Petrolo"
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Indirizzo">
            <input
              value={form.indirizzo}
              onChange={e => update('indirizzo', e.target.value)}
              placeholder="Via, Piazza..."
              className={inputClass}
            />
          </Field>

          {/* Date */}
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Data inizio *">
              <input type="date" value={form.dataInizio} onChange={e => update('dataInizio', e.target.value)} className={inputClass} />
            </Field>
            <Field label="Ora inizio *">
              <input type="time" value={form.oraInizio} onChange={e => update('oraInizio', e.target.value)} className={inputClass} />
            </Field>
            <Field label="Data fine">
              <input type="date" value={form.dataFine} onChange={e => update('dataFine', e.target.value)} className={inputClass} />
            </Field>
            <Field label="Ora fine">
              <input type="time" value={form.oraFine} onChange={e => update('oraFine', e.target.value)} className={inputClass} />
            </Field>
          </div>

          {/* Prezzo */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer mb-4">
              <div
                onClick={() => update('gratuito', !form.gratuito)}
                className={`w-10 h-6 rounded-full transition-colors ${form.gratuito ? 'bg-green-500' : 'bg-gray-200'} relative`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.gratuito ? 'translate-x-5' : 'translate-x-1'}`} />
              </div>
              <span className="text-sm font-medium text-gray-700">Evento gratuito</span>
            </label>

            {!form.gratuito && (
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Prezzo minimo (€)">
                  <input
                    type="number"
                    min="0"
                    step="0.50"
                    value={form.prezzoMin}
                    onChange={e => update('prezzoMin', e.target.value)}
                    placeholder="0.00"
                    className={inputClass}
                  />
                </Field>
                <Field label="Prezzo massimo (€)">
                  <input
                    type="number"
                    min="0"
                    step="0.50"
                    value={form.prezzoMax}
                    onChange={e => update('prezzoMax', e.target.value)}
                    placeholder="0.00"
                    className={inputClass}
                  />
                </Field>
              </div>
            )}

            <Field label="Link biglietti (se disponibile)">
              <input
                type="url"
                value={form.urlBiglietti}
                onChange={e => update('urlBiglietti', e.target.value)}
                placeholder="https://..."
                className={inputClass}
              />
            </Field>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setStep('organizzatore')}
              className="flex-1 border-2 border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:border-gray-300 transition-colors"
            >
              ← Indietro
            </button>
            <button
              disabled={!form.titolo || !form.descrizione || !form.comuneId || !form.dataInizio || !form.oraInizio || form.categorieSelezionate.length === 0}
              onClick={() => setStep('anteprima')}
              className="flex-1 bg-amber-400 hover:bg-amber-500 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Anteprima →
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Anteprima */}
      {step === 'anteprima' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-gray-900 text-lg">Controlla prima di inviare</h2>

            <div className="bg-gray-50 rounded-xl p-5 space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Organizzatore</p>
                <p className="font-semibold text-gray-900">{form.nomeOrg}</p>
                <p className="text-sm text-gray-600">{form.emailOrg}</p>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Evento</p>
                <p className="font-bold text-gray-900 text-lg mt-1">{form.titolo}</p>
                <p className="text-sm text-gray-600 mt-1">{form.descrizione}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 border-t border-gray-200 pt-3">
                <div>
                  <p className="text-xs text-gray-500">Dove</p>
                  <p className="text-sm font-medium">{comuneSelezionato?.nome}{form.luogoNome && ` — ${form.luogoNome}`}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Quando</p>
                  <p className="text-sm font-medium">{form.dataInizio} {form.oraInizio && `ore ${form.oraInizio}`}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Prezzo</p>
                  <p className={`text-sm font-bold ${form.gratuito ? 'text-green-600' : 'text-gray-900'}`}>
                    {form.gratuito ? 'Gratuito' : form.prezzoMin ? `da € ${form.prezzoMin}` : 'Da definire'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Categorie</p>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {categorieSel.map(c => (
                      <span key={c.id} className="text-xs text-white px-2 py-0.5 rounded-full" style={{ backgroundColor: c.colore }}>
                        {c.nome}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Nota revisione */}
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
              <span className="text-xl">ℹ️</span>
              <p className="text-sm text-blue-800">
                Dopo l&apos;invio il tuo evento sarà <strong>in revisione</strong>. Il nostro team lo approverà entro 24 ore.
                Riceverai una email di conferma all&apos;indirizzo <strong>{form.emailOrg}</strong>.
              </p>
            </div>

            {/* Termini */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.accettaTermini}
                onChange={e => update('accettaTermini', e.target.checked)}
                className="mt-1 accent-amber-500"
              />
              <span className="text-sm text-gray-600">
                Confermo che le informazioni inserite sono corrette e accetto i{' '}
                <Link href="/termini" className="text-amber-600 hover:underline">termini del servizio</Link>.
              </span>
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('evento')}
                className="flex-1 border-2 border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:border-gray-300 transition-colors"
              >
                ← Modifica
              </button>
              <button
                disabled={!form.accettaTermini}
                onClick={handleSubmit}
                className="flex-1 bg-amber-400 hover:bg-amber-500 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Invia per approvazione ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const inputClass = 'w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-amber-400 transition-shadow'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      {children}
    </div>
  )
}
