import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contatti — che facciamo?',
  description: 'Contatta il gestore del portale che facciamo?',
}

export default function Contatti() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1>Contatti</h1>

      <p>
        Per qualsiasi comunicazione relativa al portale <strong>che facciamo?</strong>,
        segnalazioni, richieste di informazioni o esercizio dei diritti in materia di
        privacy, puoi contattarci ai seguenti recapiti:
      </p>

      <h2>Gestore del portale</h2>
      <p>
        <strong>Avv. Domenico Grassa</strong><br />
        Foro di Trapani<br />
        Studio: Via Roma n. 53<br />
        91014 Castellammare del Golfo (TP)
      </p>

      <h2>Email</h2>
      <p>
        <a href="mailto:domenicograssa@gmail.com">domenicograssa@gmail.com</a>
      </p>

      <hr />

      <h2>Segnalazioni</h2>
      <p>
        Per segnalare contenuti illeciti, violazioni del diritto d'autore o altri problemi
        relativi ai contenuti pubblicati sul Portale, scrivi all'indirizzo email indicato sopra
        specificando nell'oggetto «Segnalazione contenuto».
      </p>

      <h2>Esercizio dei diritti GDPR</h2>
      <p>
        Per esercitare i tuoi diritti ai sensi del Regolamento UE 2016/679 (accesso, rettifica,
        cancellazione, limitazione, portabilità dei dati), scrivi all'indirizzo email indicato sopra
        specificando nell'oggetto «Richiesta GDPR».
      </p>
    </article>
  )
}
