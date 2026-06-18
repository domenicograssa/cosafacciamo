import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy — moesco',
  description: 'Informativa sull\'uso dei cookie sul portale moesco',
}

export default function CookiePolicy() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1>Cookie Policy</h1>
      <p className="text-sm text-gray-500">Versione 1.1 — in vigore dal 18 giugno 2026</p>

      <p>
        Il presente documento descrive le modalità di utilizzo dei cookie e di tecnologie simili
        sul portale <strong>moesco</strong> (di seguito «il Portale»), ai sensi dell'art. 122
        del D.Lgs. 196/2003 e delle Linee Guida del Garante per la protezione dei dati personali.
      </p>

      <h2>1. Cosa sono i cookie</h2>
      <p>
        I cookie sono piccoli file di testo che i siti web visitati dall'utente inviano al suo
        dispositivo (computer, tablet, smartphone), dove vengono memorizzati per essere poi
        ritrasmessi agli stessi siti alla visita successiva. Permettono al sito di riconoscere
        il browser e di ricordare le preferenze dell'utente.
      </p>

      <h2>2. Tipologie di cookie utilizzate</h2>

      <h3>2.1 Cookie tecnici (necessari)</h3>
      <p>
        Il Portale utilizza cookie tecnici strettamente necessari al funzionamento del servizio.
        Questi cookie non richiedono il consenso dell'utente e non possono essere disabilitati
        senza compromettere la fruibilità del sito.
      </p>
      <table>
        <thead>
          <tr>
            <th>Cookie</th>
            <th>Scopo</th>
            <th>Durata</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>sb-session</td>
            <td>Gestione sessione autenticata (area admin/organizzatori)</td>
            <td>Sessione</td>
          </tr>
          <tr>
            <td>cookie_consent</td>
            <td>Memorizza la scelta dell'utente sui cookie</td>
            <td>12 mesi</td>
          </tr>
        </tbody>
      </table>

      <h3>2.2 Cookie analitici</h3>
      <p>
        Il Portale non utilizza attualmente cookie analitici. Il banner cookie include la possibilità
        di prestare o negare il consenso all'eventuale attivazione futura di strumenti di analisi
        del traffico. In caso di attivazione, la presente Cookie Policy sarà aggiornata.
      </p>

      <h2>3. Cookie di terze parti</h2>
      <p>
        Il Portale non installa cookie di profilazione propri né cookie di terze parti a fini
        pubblicitari. Non sono presenti plugin di social network che installino cookie di tracciamento.
      </p>

      <h2>4. Come gestire i cookie</h2>
      <p>
        L'utente può gestire le proprie preferenze sui cookie:
      </p>
      <ul>
        <li><strong>tramite il banner</strong> mostrato al primo accesso al Portale;</li>
        <li><strong>tramite le impostazioni del browser</strong>: ogni browser consente di eliminare,
        bloccare o ricevere notifiche per i cookie. Le istruzioni sono disponibili nella guida
        del browser utilizzato (Chrome, Firefox, Safari, Edge, ecc.);</li>
        <li><strong>tramite il link nel footer</strong> del Portale («Gestisci preferenze cookie») per modificare la scelta in qualsiasi momento.</li>
      </ul>
      <p>
        La disabilitazione dei soli cookie tecnici potrebbe compromettere alcune funzionalità
        del Portale.
      </p>

      <h2>5. Modifiche alla Cookie Policy</h2>
      <p>
        Il Titolare si riserva di modificare la presente Cookie Policy in qualsiasi momento.
        Le modifiche saranno pubblicate su questa pagina con l'aggiornamento della data di versione.
      </p>

      <h2>6. Contatti</h2>
      <p>
        Per qualsiasi domanda relativa alla presente Cookie Policy:{' '}
        <a href="mailto:domenicograssa@gmail.com">domenicograssa@gmail.com</a>
      </p>
    </article>
  )
}
