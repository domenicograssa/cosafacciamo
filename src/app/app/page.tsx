import Image from 'next/image'
import { getLang } from '@/lib/i18n/getLang'
import InstallaApp from '@/components/pwa/InstallaApp'

export const metadata = {
  title: 'App per smartphone e tablet — moesco',
  description:
    'Installa moesco sul tuo telefono o tablet: eventi, sagre e concerti della provincia di Trapani sempre a portata di mano, anche senza connessione.',
  alternates: { canonical: 'https://www.moesco.it/app' },
}

const PASSI_IT = [
  {
    titolo: 'Android (Chrome)',
    passi: [
      'Tocca il pulsante «Installa app» qui sopra.',
      'Se non compare, apri il menu ⋮ del browser e scegli «Installa app» o «Aggiungi a schermata Home».',
    ],
  },
  {
    titolo: 'iPhone e iPad (Safari)',
    passi: [
      'Tocca il pulsante Condividi (il quadrato con la freccia verso l’alto).',
      'Scorri e scegli «Aggiungi a Home».',
      'Conferma con «Aggiungi»: l’icona di moesco comparirà tra le tue app.',
    ],
  },
]

const PASSI_EN = [
  {
    titolo: 'Android (Chrome)',
    passi: [
      'Tap the “Install app” button above.',
      'If it does not appear, open the browser ⋮ menu and choose “Install app” or “Add to Home screen”.',
    ],
  },
  {
    titolo: 'iPhone and iPad (Safari)',
    passi: [
      'Tap the Share button (the square with an arrow pointing up).',
      'Scroll down and choose “Add to Home Screen”.',
      'Confirm with “Add”: the moesco icon will appear among your apps.',
    ],
  },
]

const VANTAGGI_IT = [
  ['📱', 'Si apre a schermo intero, senza barre del browser'],
  ['⚡', 'Si carica più in fretta: le pagine già viste restano salvate'],
  ['📡', 'Funziona anche con poca rete, utile nei borghi e sulle isole'],
  ['🆓', 'Non occupa quasi spazio e non passa dagli store'],
]

const VANTAGGI_EN = [
  ['📱', 'Opens full screen, with no browser bars'],
  ['⚡', 'Loads faster: pages you already visited stay saved'],
  ['📡', 'Works with a weak connection too — handy in villages and on the islands'],
  ['🆓', 'Takes almost no space and does not go through the app stores'],
]

export default async function AppPage() {
  const lang = await getLang()
  const isEn = lang === 'en'
  const guide = isEn ? PASSI_EN : PASSI_IT
  const vantaggi = isEn ? VANTAGGI_EN : VANTAGGI_IT

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-4">
        <Image src="/icon-192.png" alt="moesco" width={72} height={72} className="rounded-2xl shadow-sm" />
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            {isEn ? 'moesco on your phone' : 'moesco sul tuo telefono'}
          </h1>
          <p className="mt-1 text-gray-600">
            {isEn
              ? 'Install the portal as an app on smartphone and tablet — no app store needed.'
              : 'Installa il portale come app su smartphone e tablet — senza passare dagli store.'}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <InstallaApp />
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-gray-900">
          {isEn ? 'Why install it' : 'Perché installarla'}
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {vantaggi.map(([emoji, testo]) => (
            <li key={testo} className="flex gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <span className="text-xl">{emoji}</span>
              <span className="text-sm text-gray-700">{testo}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-gray-900">
          {isEn ? 'How to install it' : 'Come installarla'}
        </h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          {guide.map((g) => (
            <div key={g.titolo} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="font-bold text-gray-900">{g.titolo}</h3>
              <ol className="mt-3 space-y-2 text-sm text-gray-600">
                {g.passi.map((p, i) => (
                  <li key={p} className="flex gap-2">
                    <span className="font-bold text-amber-500">{i + 1}.</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-10 text-xs text-gray-400">
        {isEn
          ? 'moesco is a progressive web app: it installs straight from the browser, updates on its own and does not require Google Play or the App Store.'
          : 'moesco è una progressive web app: si installa direttamente dal browser, si aggiorna da sola e non richiede Google Play o App Store.'}
      </p>
    </div>
  )
}
