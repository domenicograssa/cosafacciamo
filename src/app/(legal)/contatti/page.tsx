import type { Metadata } from 'next'
import ModuloContatti from '@/components/contatti/ModuloContatti'

export const metadata: Metadata = {
  title: 'Contatti — moesco',
  description: 'Contatta il gestore del portale moesco per messaggi e segnalazioni',
}

export default function Contatti() {
  return (
    <>
      <article className="prose prose-gray max-w-none">
        <h1>Contatti</h1>

        <p>
          Per qualsiasi comunicazione relativa al portale <strong>moesco</strong> —
          segnalazioni, richieste di informazioni o esercizio dei diritti in materia di
          privacy — puoi usare il modulo qui sotto oppure scriverci direttamente.
        </p>
      </article>

      {/* Modulo messaggi/segnalazioni */}
      <div className="mt-8 bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8">
        <h2 className="text-lg font-extrabold text-gray-900 mb-1">Scrivici un messaggio</h2>
        <p className="text-sm text-gray-500 mb-6">
          Compila il modulo: il messaggio arriva direttamente al gestore del portale.
        </p>
        <ModuloContatti />
      </div>

      <article className="prose prose-gray max-w-none mt-10">
        <h2>Gestore del portale</h2>
        <p>
          <strong>Domenico Grassa</strong><br />
          Via Roma n. 53, 91014 Castellammare del Golfo (TP); c.f. GRSDNC83H20G273G
        </p>

        <h2>Email</h2>
        <p>
          <a href="mailto:domenicograssa@gmail.com">domenicograssa@gmail.com</a>
        </p>

        <hr />

        <h2>Segnalazioni</h2>
        <p>
          Per segnalare contenuti illeciti, violazioni del diritto d&apos;autore o altri problemi
          relativi ai contenuti pubblicati sul Portale, usa il modulo qui sopra scegliendo
          «Segnalazione contenuto», oppure scrivi all&apos;indirizzo email indicato
          specificando nell&apos;oggetto «Segnalazione contenuto».
        </p>

        <h2>Esercizio dei diritti GDPR</h2>
        <p>
          Per esercitare i tuoi diritti ai sensi del Regolamento UE 2016/679 (accesso, rettifica,
          cancellazione, limitazione, portabilità dei dati), usa il modulo scegliendo
          «Richiesta privacy (GDPR)», oppure scrivi all&apos;indirizzo email indicato
          specificando nell&apos;oggetto «Richiesta GDPR».
        </p>
      </article>
    </>
  )
}
