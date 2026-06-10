'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Categoria, GeoNodo } from '@/types'
import ComuneCombobox from '@/components/ui/ComuneCombobox'
import { icona } from '@/components/ui/CategoryChip'

type Step = 'organizzatore' | 'evento' | 'consenso' | 'anteprima' | 'inviato'

interface FormData {
  // Organizzatore — campi obbligatori GDPR
  nome: string
  cognome: string
  emailOrg: string
  telefonoOrg: string
  denominazione: string   // organizzazione (facoltativo)
  comuneOrgId: string
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
  sitoUfficiale: string
  emailContatto: string
  telefonoContatto: string
  // Consensi obbligatori (non preselezionati)
  accettaTermini: boolean       // Termini e Condizioni
  accettaPrivacy: boolean       // Informativa Privacy
  accettaDiritti: boolean       // Dichiarazione diritti sui contenuti
}

const STEPS: { key: Step; label: string }[] = [
  { key: 'organizzatore', label: 'Chi sei' },
  { key: 'evento',        label: "L'evento" },
  { key: 'consenso',      label: 'Consensi' },
  { key: 'anteprima',     label: 'Anteprima' },
]

const STEP_INDEX: Record<Step, number> = {
  organizzatore: 0, evento: 1, consenso: 2, anteprima: 3, inviato: 4,
}

const inputClass = 'w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-amber-400 transition-shadow'

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-gray-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function CheckboxConsent({
  checked,
  onChange,
  children,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  children: React.ReactNode
}) {
  return (
    <label className={`flex items-start gap-3 cursor-pointer p-4 rounded-xl border-2 transition-colors ${
      checked ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-gray-300'
    }`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 accent-amber-500 shrink-0"
      />
      <span className="text-sm text-gray-700 leading-relaxed">{children}</span>
    </label>
  )
}

interface PubblicaFormProps {
  comuni: GeoNodo[]
  categorie: Categoria[]
}

export default function PubblicaForm({ comuni, categorie }: PubblicaFormProps) {
  const [step, setStep] = useState<Step>('organizzatore')
  const [form, setForm] = useState<FormData>({
    nome: '', cognome: '', emailOrg: '', telefonoOrg: '',
    denominazione: '', comuneOrgId: '', sitoWeb: '',
    titolo: '', descrizione: '', categorieSelezionate: [], comuneId: '',
    luogoNome: '', indirizzo: '', dataInizio: '', oraInizio: '',
    dataFine: '', oraFine: '', gratuito: false, prezzoMin: '', prezzoMax: '',
    urlBiglietti: '', sitoUfficiale: '', emailContatto: '', telefonoContatto: '',
    accettaTermini: false, accettaPrivacy: false, accettaDiritti: false,
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

  const comuneSelezionato = comuni.find(c => c.id === form.comuneId)
  const categorieSel = categorie.filter(c => form.categorieSelezionate.includes(c.slug))

  const canProceedStep1 = form.nome && form.cognome && form.emailOrg && form.telefonoOrg && form.comuneOrgId
  const canProceedStep2 = form.titolo && form.descrizione && form.comuneId && form.dataInizio && form.oraInizio && form.categorieSelezionate.length > 0
  const canProceedConsenso = form.accettaTermini && form.accettaPrivacy && form.accettaDiritti

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
            onClick={() => {
              setStep('organizzatore')
              setForm(f => ({ ...f, titolo: '', descrizione: '', accettaTermini: false, accettaPrivacy: false, accettaDiritti: false }))
            }}
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
          Il tuo evento sarà visibile dopo la revisione del nostro team (entro 24 ore). La pubblicazione è gratuita.
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

      {/* ── Step 1: Chi sei ── */}
      {step === 'organizzatore' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-bold text-gray-900 text-lg">Chi organizza l&apos;evento?</h2>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Nome" required>
              <input
                value={form.nome}
                onChange={e => update('nome', e.target.value)}
                placeholder="Mario"
                className={inputClass}
              />
            </Field>
            <Field label="Cognome" required>
              <input
                value={form.cognome}
                onChange={e => update('cognome', e.target.value)}
                placeholder="Rossi"
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Denominazione organizzazione">
            <input
              value={form.denominazione}
              onChange={e => update('denominazione', e.target.value)}
              placeholder="Es: ProLoco Alcamo, Associazione XYZ (facoltativo)"
              className={inputClass}
            />
          </Field>

          <Field label="Email di contatto" required>
            <input
              type="email"
              value={form.emailOrg}
              onChange={e => update('emailOrg', e.target.value)}
              placeholder="mario.rossi@email.it"
              className={inputClass}
            />
          </Field>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Telefono" required>
              <input
                type="tel"
                value={form.telefonoOrg}
                onChange={e => update('telefonoOrg', e.target.value)}
                placeholder="+39 320 000 0000"
                className={inputClass}
              />
            </Field>
            <Field label="Comune" required>
              <ComuneCombobox
                comuni={comuni}
                value={form.comuneOrgId}
                valueKey="id"
                onChange={v => update('comuneOrgId', v)}
                placeholder="Cerca il tuo comune…"
              />
            </Field>
          </div>

          <Field label="Sito web">
            <input
              type="url"
              value={form.sitoWeb}
              onChange={e => update('sitoWeb', e.target.value)}
              placeholder="https://... (facoltativo)"
              className={inputClass}
            />
          </Field>

          <div className="pt-2">
            <button
              disabled={!canProceedStep1}
              onClick={() => setStep('evento')}
              className="w-full bg-amber-400 hover:bg-amber-500 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Continua →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: L'evento ── */}
      {step === 'evento' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-bold text-gray-900 text-lg">Dettagli evento</h2>

          <Field label="Titolo evento" required>
            <input
              value={form.titolo}
              onChange={e => update('titolo', e.target.value)}
              placeholder="Es: Concerto in Piazza Petrolo"
              className={inputClass}
            />
          </Field>

          <Field label="Descrizione" required>
            <textarea
              value={form.descrizione}
              onChange={e => update('descrizione', e.target.value)}
              placeholder="Descrivi l'evento, cosa succederà, per chi è rivolto..."
              rows={4}
              className={`${inputClass} resize-none`}
            />
          </Field>

          {/* Categorie */}
          <Field label="Categoria" required>
            <div className="flex flex-wrap gap-2 mt-1">
              {categorie.map(cat => (
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
                  <span>{icona(cat.icona)}</span>
                  <span>{cat.nome}</span>
                </button>
              ))}
            </div>
          </Field>

          {/* Luogo */}
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Comune" required>
              <ComuneCombobox
                comuni={comuni}
                value={form.comuneId}
                valueKey="id"
                onChange={v => update('comuneId', v)}
                placeholder="Cerca il comune dell'evento…"
              />
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
            <Field label="Data inizio" required>
              <input type="date" value={form.dataInizio} onChange={e => update('dataInizio', e.target.value)} className={inputClass} />
            </Field>
            <Field label="Ora inizio" required>
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
                className={`w-10 h-6 rounded-full transition-colors ${form.gratuito ? 'bg-green-500' : 'bg-gray-200'} relative cursor-pointer`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.gratuito ? 'translate-x-5' : 'translate-x-1'}`} />
              </div>
              <span className="text-sm font-medium text-gray-700">Evento gratuito</span>
            </label>

            {!form.gratuito && (
              <div className="grid sm:grid-cols-2 gap-5 mb-4">
                <Field label="Prezzo minimo (€)">
                  <input
                    type="number" min="0" step="0.50"
                    value={form.prezzoMin}
                    onChange={e => update('prezzoMin', e.target.value)}
                    placeholder="0.00"
                    className={inputClass}
                  />
                </Field>
                <Field label="Prezzo massimo (€)">
                  <input
                    type="number" min="0" step="0.50"
                    value={form.prezzoMax}
                    onChange={e => update('prezzoMax', e.target.value)}
                    placeholder="0.00"
                    className={inputClass}
                  />
                </Field>
              </div>
            )}
          </div>

          {/* Link utili */}
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Sito ufficiale dell'evento">
              <input
                type="url"
                value={form.sitoUfficiale}
                onChange={e => update('sitoUfficiale', e.target.value)}
                placeholder="https://..."
                className={inputClass}
              />
            </Field>
            <Field label="Link biglietti / prenotazione">
              <input
                type="url"
                value={form.urlBiglietti}
                onChange={e => update('urlBiglietti', e.target.value)}
                placeholder="https://..."
                className={inputClass}
              />
            </Field>
            <Field label="Email pubblica evento">
              <input
                type="email"
                value={form.emailContatto}
                onChange={e => update('emailContatto', e.target.value)}
                placeholder="info@evento.it"
                className={inputClass}
              />
            </Field>
            <Field label="Telefono pubblico evento">
              <input
                type="tel"
                value={form.telefonoContatto}
                onChange={e => update('telefonoContatto', e.target.value)}
                placeholder="+39 ..."
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
              disabled={!canProceedStep2}
              onClick={() => setStep('consenso')}
              className="flex-1 bg-amber-400 hover:bg-amber-500 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Continua →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Consensi ── */}
      {step === 'consenso' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Dichiarazioni obbligatorie</h2>
            <p className="text-sm text-gray-500 mt-1">
              Tutte e tre le dichiarazioni sono obbligatorie per procedere alla pubblicazione.
            </p>
          </div>

          <div className="space-y-3">
            <CheckboxConsent
              checked={form.accettaTermini}
              onChange={v => update('accettaTermini', v)}
            >
              Dichiaro di aver letto e accettato i{' '}
              <Link href="/termini-e-condizioni" target="_blank" className="text-amber-600 hover:underline font-semibold">
                Termini e Condizioni del Portale
              </Link>{' '}
              e le{' '}
              <Link href="/condizioni-organizzatori" target="_blank" className="text-amber-600 hover:underline font-semibold">
                Condizioni per gli Organizzatori
              </Link>.
            </CheckboxConsent>

            <CheckboxConsent
              checked={form.accettaPrivacy}
              onChange={v => update('accettaPrivacy', v)}
            >
              Dichiaro di aver letto l&apos;
              <Link href="/privacy-policy" target="_blank" className="text-amber-600 hover:underline font-semibold">
                Informativa Privacy
              </Link>{' '}
              e acconsento al trattamento dei miei dati personali per le finalità ivi indicate.
            </CheckboxConsent>

            <CheckboxConsent
              checked={form.accettaDiritti}
              onChange={v => update('accettaDiritti', v)}
            >
              Dichiaro di essere titolare dei diritti o di disporre delle necessarie autorizzazioni
              per la pubblicazione di testi, immagini, loghi, marchi e altri contenuti caricati sulla
              piattaforma e di assumermi ogni responsabilità derivante dalla pubblicazione.
            </CheckboxConsent>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
            <strong>Nota:</strong> Le dichiarazioni saranno registrate con indicazione di data, ora
            e versione del documento accettato, ai sensi della normativa vigente.
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setStep('evento')}
              className="flex-1 border-2 border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:border-gray-300 transition-colors"
            >
              ← Indietro
            </button>
            <button
              disabled={!canProceedConsenso}
              onClick={() => setStep('anteprima')}
              className="flex-1 bg-amber-400 hover:bg-amber-500 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Anteprima →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 4: Anteprima ── */}
      {step === 'anteprima' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-gray-900 text-lg">Controlla prima di inviare</h2>

            <div className="bg-gray-50 rounded-xl p-5 space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Organizzatore</p>
                <p className="font-semibold text-gray-900">
                  {form.nome} {form.cognome}
                  {form.denominazione && <span className="text-gray-500 font-normal"> — {form.denominazione}</span>}
                </p>
                <p className="text-sm text-gray-600">{form.emailOrg} · {form.telefonoOrg}</p>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Evento</p>
                <p className="font-bold text-gray-900 text-lg mt-1">{form.titolo}</p>
                <p className="text-sm text-gray-600 mt-1 line-clamp-3">{form.descrizione}</p>
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

            {/* Riepilogo consensi */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-1.5">
              <p className="text-xs font-bold text-green-700 uppercase tracking-wide">Dichiarazioni accettate ✓</p>
              <p className="text-xs text-green-700">✓ Termini e Condizioni + Condizioni Organizzatori (v1.0)</p>
              <p className="text-xs text-green-700">✓ Informativa Privacy (v1.0)</p>
              <p className="text-xs text-green-700">✓ Diritti e autorizzazioni sui contenuti</p>
            </div>

            <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
              <span className="text-xl">ℹ️</span>
              <p className="text-sm text-blue-800">
                Dopo l&apos;invio il tuo evento sarà <strong>in revisione</strong>. Il team approverà entro 24 ore.
                Riceverai una email di conferma a <strong>{form.emailOrg}</strong>.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('consenso')}
                className="flex-1 border-2 border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:border-gray-300 transition-colors"
              >
                ← Modifica
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-amber-400 hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition-colors"
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
