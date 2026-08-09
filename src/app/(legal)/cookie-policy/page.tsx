import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy — moesco',
  description: 'Informativa sull\'uso dei cookie sul portale moesco',
}

export default function CookiePolicy() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1>Cookie Policy</h1>
      <p className="text-sm text-gray-500">Versione 1.3 — in vigore dal 9 agosto 2026</p>

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
            <th>Nome</th>
            <th>Tipo</th>
            <th>Scopo</th>
            <th>Durata</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>sb-*-auth-token</td>
            <td>Cookie</td>
            <td>Gestione della sessione autenticata (area amministrazione e organizzatori). Presente solo dopo l&apos;accesso.</td>
            <td>Sessione / fino al logout</td>
          </tr>
          <tr>
            <td>moesco_cookie_consent</td>
            <td>Memoria locale del browser (localStorage)</td>
            <td>Memorizza la scelta espressa sui cookie, per non riproporre il banner a ogni visita</td>
            <td>6 mesi</td>
          </tr>
        </tbody>
      </table>
      <p>
        La scelta sui cookie non è conservata in un cookie ma nella memoria
        locale del browser: resta quindi sul dispositivo dell&apos;utente e non
        viene trasmessa al server a ogni richiesta. Trascorsi sei mesi la scelta
        scade e il banner viene ripresentato, in linea con le indicazioni del
        Garante del 9 luglio 2021. Cancellando i dati di navigazione del browser
        la scelta viene rimossa e il banner ricompare.
      </p>

      <h3>2.2 Cookie analitici</h3>
      <p>
        Il Portale utilizza <strong>Google Analytics 4</strong> (Google Ireland Limited), uno
        strumento di analisi statistica che raccoglie informazioni in forma aggregata sulla
        navigazione degli utenti (pagine visitate, provenienza, durata della visita, dispositivo
        utilizzato). Questi cookie vengono installati solo previo consenso esplicito dell'utente,
        prestato tramite il banner cookie, e possono essere revocati in qualsiasi momento.
      </p>
      <table>
        <thead>
          <tr>
            <th>Cookie</th>
            <th>Fornitore</th>
            <th>Scopo</th>
            <th>Durata</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>_ga</td>
            <td>Google Analytics</td>
            <td>Distingue gli utenti univoci</td>
            <td>13 mesi</td>
          </tr>
          <tr>
            <td>_ga_FF8FCVMKSZ</td>
            <td>Google Analytics</td>
            <td>Mantiene lo stato della sessione</td>
            <td>13 mesi</td>
          </tr>
        </tbody>
      </table>
      <p>
        I cookie analitici <strong>non vengono installati</strong> finché l&apos;utente non presta il
        proprio consenso: fino a quel momento nessuno script di Google viene caricato dal browser.
        Google Analytics 4 è configurato con l&apos;anonimizzazione degli indirizzi IP attiva per
        impostazione predefinita. Il consenso può essere revocato in qualsiasi momento dal link
        «Gestisci preferenze cookie» nel piè di pagina; la revoca ha effetto immediato e impedisce
        ogni ulteriore raccolta.
      </p>
      <p>
        Per approfondimenti sul trattamento dei dati da parte di Google si rimanda alla{' '}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
          informativa privacy di Google
        </a>. Per eliminare i cookie già installati è possibile usare le impostazioni del browser
        oppure il{' '}
        <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
          componente aggiuntivo di disattivazione di Google Analytics
        </a>.
      </p>

      <h2>3. Cookie di terze parti</h2>
      <p>
        Il Portale non installa cookie di profilazione propri né cookie di terze parti a fini
        pubblicitari. È presente unicamente il cookie analitico di terze parti di Google Analytics
        descritto al punto 2.2, attivato solo previo consenso. Non sono presenti plugin di social
        network che installino cookie di tracciamento.
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
