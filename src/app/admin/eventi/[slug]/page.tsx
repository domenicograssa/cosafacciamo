'use client'

import { useState } from 'react'
import { notFound, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { use } from 'react'
import { EVENTI_ADMIN_MOCK } from '@/data/mock-admin'
import { formatData, formatOra, formatPrezzo } from '@/lib/utils'

interface Props {
  params: Promise<{ slug: string }>
}

const BADGE: Record<string, string> = {
  approvato:    'bg-green-100 text-green-700',
  in_revisione: 'bg-amber-100 text-amber-700',
  rifiutato:    'bg-red-100 text-red-700',
  sospeso:      'bg-orange-100 text-orange-700',
}

export default function AdminEventoDettaglio({ params }: Props) {
  const { slug } = use(params)
  const router = useRouter()
  const evento = EVENTI_ADMIN_MOCK.find(e => e.slug === slug)
  if (!evento) notFound()

  const [azione, setAzione] = useState<'approva' | 'rifiuta' | null>(null)
  const [nota, setNota] = useState(evento.noteRevisione ?? '')
  const [statoSimulato, setStatoSimulato] = useState(evento.stato)

  const confermaAzione = () => {
    if (azione === 'approva') setStatoSimulato('approvato')
    if (azione === 'rifiuta') setStatoSimulato('rifiutato')
    setAzione(null)
  }

  const prezzo = formatPrezzo(evento.prezzoMin, evento.prezzoMax, evento.gratuito)

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin" className="hover:text-amber-600">Dashboard</Link>
        <span>›</span>
        <Link href="/admin/eventi" className="hover:text-amber-600">Eventi</Link>
        <span>›</span>
        <span className="text-gray-900 font-medium truncate">{evento.titolo}</span>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">{evento.titolo}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Inviato da <span className="font-semibold">{evento.organizzatore.nome}</span>
          </p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 ${BADGE[statoSimulato] ?? 'bg-gray-100 text-gray-600'}`}>
          {statoSimulato === 'approvato' ? '✅ Approvato' :
           statoSimulato === 'in_revisione' ? '🔍 In revisione' :
           statoSimulato === 'rifiutato' ? '❌ Rifiutato' :
           statoSimulato}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Colonna principale */}
        <div className="lg:col-span-2 space-y-5">

          {/* Immagine */}
          {evento.immagineCopertura && (
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100">
              <Image src={evento.immagineCopertura} alt={evento.titolo} fill className="object-cover" />
            </div>
          )}

          {/* Dati evento */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="font-bold text-gray-900">Dettagli evento</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Dato label="Luogo">{evento.luogoNome ?? '—'}</Dato>
              <Dato label="Comune">{evento.geoNodo.nome}</Dato>
              <Dato label="Data inizio">
                {formatData(evento.dataInizio, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                {' · '}{formatOra(evento.dataInizio)}
              </Dato>
              {evento.dataFine && (
                <Dato label="Data fine">
                  {formatData(evento.dataFine, { day: 'numeric', month: 'long' })}
                  {' · '}{formatOra(evento.dataFine)}
                </Dato>
              )}
              <Dato label="Prezzo">
                <span className={evento.gratuito ? 'text-green-600 font-bold' : ''}>{prezzo}</span>
              </Dato>
              <Dato label="Indirizzo">{evento.indirizzo ?? '—'}</Dato>
            </div>

            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Categorie</p>
              <div className="flex flex-wrap gap-2">
                {evento.categorie.map(c => (
                  <span key={c.id} className="text-xs text-white px-2.5 py-1 rounded-full font-semibold" style={{ backgroundColor: c.colore }}>
                    {c.icona} {c.nome}
                  </span>
                ))}
              </div>
            </div>

            {evento.descrizioneBreve && (
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Descrizione</p>
                <p className="text-sm text-gray-700 leading-relaxed">{evento.descrizioneBreve}</p>
              </div>
            )}
          </div>

          {/* Note revisione esistenti */}
          {evento.noteRevisione && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-1">Nota precedente</p>
              <p className="text-sm text-red-800">{evento.noteRevisione}</p>
            </div>
          )}

          {/* Visualizza sul portale */}
          {statoSimulato === 'approvato' && (
            <Link
              href={`/eventi/${evento.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 text-sm text-amber-600 font-semibold hover:underline"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Visualizza sul portale →
            </Link>
          )}
        </div>

        {/* Sidebar azioni */}
        <div className="space-y-4">

          {/* Organizzatore */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Organizzatore</p>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                {evento.organizzatore.nome.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">{evento.organizzatore.nome}</p>
                <Link href="/admin/organizzatori" className="text-xs text-amber-600 hover:underline">
                  Vedi profilo →
                </Link>
              </div>
            </div>
          </div>

          {/* Azioni revisione */}
          {statoSimulato === 'in_revisione' && !azione && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <p className="font-bold text-gray-900">Revisione</p>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                  Nota (opzionale)
                </label>
                <textarea
                  value={nota}
                  onChange={e => setNota(e.target.value)}
                  rows={3}
                  placeholder="Aggiungi una nota per l'organizzatore..."
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                />
              </div>

              <button
                onClick={() => setAzione('approva')}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                ✅ Approva evento
              </button>
              <button
                onClick={() => setAzione('rifiuta')}
                className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 rounded-xl transition-colors border border-red-200 flex items-center justify-center gap-2"
              >
                ❌ Rifiuta evento
              </button>
            </div>
          )}

          {/* Dialog conferma */}
          {azione && (
            <div className={`rounded-2xl border p-5 space-y-4 ${azione === 'approva' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <p className="font-bold text-gray-900">
                {azione === 'approva' ? '✅ Confermi l\'approvazione?' : '❌ Confermi il rifiuto?'}
              </p>
              {azione === 'rifiuta' && (
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Motivo del rifiuto *</label>
                  <textarea
                    value={nota}
                    onChange={e => setNota(e.target.value)}
                    rows={3}
                    placeholder="Spiega all'organizzatore perché l'evento non è stato approvato..."
                    className="w-full text-sm border border-red-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-red-300 resize-none bg-white"
                  />
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => setAzione(null)} className="flex-1 bg-white border border-gray-200 text-gray-700 font-semibold py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                  Annulla
                </button>
                <button
                  onClick={confermaAzione}
                  disabled={azione === 'rifiuta' && !nota.trim()}
                  className={`flex-1 font-bold py-2 rounded-xl text-sm transition-colors disabled:opacity-40 ${
                    azione === 'approva'
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  Conferma
                </button>
              </div>
            </div>
          )}

          {/* Azioni su approvato */}
          {statoSimulato === 'approvato' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <p className="font-bold text-gray-900">Azioni</p>
              <button
                onClick={() => setStatoSimulato('sospeso')}
                className="w-full bg-orange-50 hover:bg-orange-100 text-orange-600 font-semibold py-2.5 rounded-xl transition-colors border border-orange-200 text-sm"
              >
                ⏸ Sospendi evento
              </button>
            </div>
          )}

          {/* Esito completato */}
          {(statoSimulato === 'approvato' || statoSimulato === 'rifiutato') && statoSimulato !== evento.stato && (
            <div className={`rounded-2xl p-4 text-sm ${statoSimulato === 'approvato' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {statoSimulato === 'approvato'
                ? '✅ Evento approvato. L\'organizzatore riceverà una notifica email.'
                : '❌ Evento rifiutato. L\'organizzatore riceverà una notifica con il motivo.'}
            </div>
          )}

          <Link
            href="/admin/eventi"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-amber-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Torna alla lista
          </Link>
        </div>
      </div>
    </div>
  )
}

function Dato({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-900 font-medium mt-0.5">{children}</p>
    </div>
  )
}
