import Link from 'next/link'

export const metadata = {
  title: 'Per organizzatori — moesco',
  description: 'Pubblica gratuitamente i tuoi eventi sul portale moesco e raggiungi il pubblico della provincia di Trapani.',
}

const PASSI = [
  {
    emoji: '📝',
    titolo: 'Compila il modulo',
    testo: 'Inserisci i tuoi dati e quelli del tuo evento: titolo, descrizione, data, luogo, prezzo e contatti. Bastano pochi minuti.',
  },
  {
    emoji: '✅',
    titolo: 'Accetta le condizioni',
    testo: 'Confermi di avere i diritti sui contenuti che pubblichi e accetti le condizioni del portale, in piena trasparenza.',
  },
  {
    emoji: '🔍',
    titolo: 'Revisione entro 24 ore',
    testo: 'Il nostro team controlla l’evento e lo approva. Riceverai una conferma via email.',
  },
  {
    emoji: '🎉',
    titolo: 'Il tuo evento è online',
    testo: 'L’evento diventa visibile a tutti i visitatori del portale, con la tua scheda completa di contatti e link.',
  },
]

export default function OrganizzatoriPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-sm font-bold text-amber-600 uppercase tracking-wide">Per organizzatori</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2 leading-tight">
          Fai conoscere i tuoi eventi a tutta la provincia di Trapani
        </h1>
        <p className="text-gray-600 mt-4 leading-relaxed">
          Associazioni, enti, pro loco, attività commerciali e organizzatori:
          pubblicare su <strong>moesco</strong> è <strong>gratuito</strong>.
          Puoi proporre <strong>eventi</strong> con una data precisa oppure{' '}
          <strong>esperienze</strong> continuative — snorkeling, corsi di cucina,
          giri in barca, escursioni — e raggiungere chi cerca cosa fare nei 25 comuni del territorio.
        </p>
      </div>

      {/* Cosa vuoi pubblicare? */}
      <div className="mt-12 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold text-gray-900 text-center">Cosa vuoi pubblicare?</h2>
        <div className="mt-6 grid sm:grid-cols-2 gap-5">
          <Link
            href="/pubblica"
            className="group bg-white rounded-2xl border-2 border-gray-200 hover:border-amber-400 shadow-sm p-6 text-center transition-colors"
          >
            <span className="text-4xl">🎉</span>
            <h3 className="font-extrabold text-gray-900 mt-3 text-lg">Un evento</h3>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              Ha una data precisa: sagra, concerto, festa patronale, mostra, spettacolo, presentazione.
            </p>
            <span className="inline-block mt-4 bg-amber-400 group-hover:bg-amber-500 text-white font-bold px-6 py-2.5 rounded-xl transition-colors">
              Pubblica un evento →
            </span>
          </Link>
          <Link
            href="/pubblica?tipo=esperienza"
            className="group bg-white rounded-2xl border-2 border-gray-200 hover:border-amber-400 shadow-sm p-6 text-center transition-colors"
          >
            <span className="text-4xl">🤿</span>
            <h3 className="font-extrabold text-gray-900 mt-3 text-lg">Un&apos;attività / esperienza</h3>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              Si ripete nel tempo: snorkeling, giro in barca, escursione, corso di cucina, degustazione.
            </p>
            <span className="inline-block mt-4 bg-amber-400 group-hover:bg-amber-500 text-white font-bold px-6 py-2.5 rounded-xl transition-colors">
              Pubblica un&apos;attività →
            </span>
          </Link>
        </div>
        <p className="text-center mt-4">
          <Link href="/condizioni-organizzatori" className="text-sm text-gray-500 underline hover:text-gray-700">
            Leggi le condizioni per gli organizzatori
          </Link>
        </p>
      </div>

      {/* Come funziona */}
      <div className="mt-16">
        <h2 className="text-xl font-bold text-gray-900 text-center mb-8">Come funziona</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PASSI.map((p, i) => (
            <div key={p.titolo} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 font-extrabold flex items-center justify-center text-sm">{i + 1}</span>
                <span className="text-2xl">{p.emoji}</span>
              </div>
              <h3 className="font-bold text-gray-900 mt-4">{p.titolo}</h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">{p.testo}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cosa serve sapere */}
      <div className="mt-16 grid sm:grid-cols-3 gap-5">
        <div className="bg-green-50 border border-green-100 rounded-2xl p-6">
          <p className="text-2xl">💶</p>
          <h3 className="font-bold text-gray-900 mt-3">Gratuito</h3>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            La registrazione e la pubblicazione degli eventi sono gratuite.
            Eventuali servizi premium futuri saranno sempre comunicati in anticipo.
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
          <p className="text-2xl">🖼️</p>
          <h3 className="font-bold text-gray-900 mt-3">Immagini: solo con i diritti</h3>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            Puoi caricare solo immagini di cui sei titolare o per cui hai
            l&apos;autorizzazione. Niente foto prese da internet senza permesso.
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
          <p className="text-2xl">⚖️</p>
          <h3 className="font-bold text-gray-900 mt-3">Responsabilità chiare</h3>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            L&apos;organizzatore è responsabile dei contenuti che pubblica.
            Il portale mette a disposizione lo spazio: l&apos;evento è tuo.
          </p>
        </div>
      </div>

      {/* CTA finale */}
      <div className="mt-16 bg-gray-900 rounded-3xl px-8 py-12 text-center">
        <h2 className="text-2xl font-extrabold text-white">Pronto a pubblicare?</h2>
        <p className="text-gray-300 mt-2">Bastano pochi minuti. Il tuo evento o la tua attività sarà online entro 24 ore.</p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/pubblica"
            className="bg-amber-400 hover:bg-amber-500 text-white font-bold px-8 py-3.5 rounded-xl transition-colors"
          >
            Pubblica un evento →
          </Link>
          <Link
            href="/pubblica?tipo=esperienza"
            className="border-2 border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-white font-bold px-8 py-3.5 rounded-xl transition-colors"
          >
            Pubblica un&apos;attività →
          </Link>
        </div>
      </div>
    </div>
  )
}
