import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Condizioni per gli Organizzatori — che facciamo?',
  description: 'Condizioni specifiche per gli organizzatori che pubblicano eventi sul portale che facciamo?',
}

export default function CondizioniOrganizzatori() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1>Condizioni per gli Organizzatori</h1>
      <p className="text-sm text-gray-500">Versione 1.0 — in vigore dal {new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

      <p>
        Le presenti Condizioni disciplinano il rapporto tra il Gestore del portale{' '}
        <strong>che facciamo?</strong> e i soggetti (di seguito «Organizzatori») che si registrano
        per pubblicare eventi, attività o esperienze. Si applicano congiuntamente ai{' '}
        <a href="/termini-e-condizioni">Termini e Condizioni generali</a> e all'
        <a href="/privacy-policy">Informativa Privacy</a>.
      </p>

      <h2>1. Ruolo del Gestore</h2>
      <p>
        <strong>
          Il Gestore svolge esclusivamente attività tecnica di messa a disposizione della piattaforma
          e non assume alcun ruolo di organizzatore, promotore, patrocinatore o garante degli eventi
          pubblicati.
        </strong>
      </p>
      <p>
        Il Gestore non è responsabile dell'organizzazione, della sicurezza, dello svolgimento né
        di alcun aspetto degli eventi pubblicati dagli Organizzatori. Il rapporto contrattuale
        relativo all'evento intercorre esclusivamente tra l'Organizzatore e i partecipanti.
      </p>

      <h2>2. Requisiti per la registrazione</h2>
      <p>Per registrarsi come Organizzatore è necessario:</p>
      <ul>
        <li>essere una persona fisica maggiorenne o un ente/associazione legalmente costituito;</li>
        <li>fornire dati veritieri e aggiornati (nome, cognome, email, telefono, comune);</li>
        <li>accettare le presenti Condizioni, i Termini generali e l'Informativa Privacy;</li>
        <li>dichiarare di essere titolare dei diritti o di disporre delle autorizzazioni sui contenuti caricati.</li>
      </ul>

      <h2>3. Responsabilità dell'Organizzatore per i contenuti</h2>
      <p>L'Organizzatore è l'<strong>unico responsabile</strong> dei contenuti pubblicati e garantisce che:</p>
      <ul>
        <li>le informazioni sull'evento (titolo, descrizione, data, luogo, prezzo, ecc.) siano veritiere, complete e aggiornate;</li>
        <li>i contenuti non violino la normativa vigente (italiana ed europea) né diritti di terzi;</li>
        <li>i contenuti non siano diffamatori, osceni, discriminatori o comunque illeciti;</li>
        <li>disponga di tutti i permessi, autorizzazioni e licenze necessari per organizzare l'evento e pubblicarlo;</li>
        <li>rispetti le normative in materia di sicurezza degli spettacoli e degli eventi pubblici.</li>
      </ul>

      <h2>4. Immagini e materiali visivi</h2>
      <p>
        <strong>È vietato caricare immagini, loghi, grafiche o altri materiali visivi per i quali
        l'Organizzatore non disponga di idoneo titolo giuridico di utilizzo.</strong>
      </p>
      <p>L'Organizzatore garantisce che ogni immagine caricata:</p>
      <ul>
        <li>è di sua proprietà, oppure</li>
        <li>è stata da lui acquistata con licenza che ne consente la pubblicazione, oppure</li>
        <li>è rilasciata con licenza libera (es. Creative Commons) compatibile con l'uso sul Portale,
        con indicazione della fonte e dell'autore.</li>
      </ul>
      <p>
        È vietato caricare immagini di soggetti riconoscibili senza il loro consenso, ai sensi
        dell'art. 10 c.c. e degli artt. 96-98 della Legge n. 633/1941.
      </p>
      <p>
        Il Gestore si riserva di rimuovere senza preavviso qualsiasi immagine per la quale
        sussistano fondati dubbi sulla legittimità dell'utilizzo.
      </p>

      <h2>5. Diritto d'autore</h2>
      <p>
        L'Organizzatore garantisce il pieno rispetto della Legge 22 aprile 1941 n. 633
        (Legge sul diritto d'autore) e dei relativi regolamenti, con riferimento a tutti i
        contenuti pubblicati (testi, immagini, musiche, loghi, marchi).
      </p>

      <h2>6. Manleva e indennizzo</h2>
      <p>
        L'Organizzatore si impegna a manlevare, tenere indenne e mantenere indenne il Gestore —
        nonché i suoi collaboratori, consulenti e aventi causa — da qualsiasi pretesa, richiesta,
        azione, danno, perdita, costo o spesa (incluse le spese legali) derivanti da:
      </p>
      <ul>
        <li>violazione delle presenti Condizioni o dei Termini generali;</li>
        <li>contenuti pubblicati dall'Organizzatore;</li>
        <li>violazione di diritti di terzi (copyright, marchi, privacy, diritto all'immagine);</li>
        <li>organizzazione e svolgimento dell'evento pubblicato;</li>
        <li>qualsiasi condotta illecita dell'Organizzatore o dei suoi collaboratori.</li>
      </ul>

      <h2>7. Moderazione e rimozione dei contenuti</h2>
      <p>
        Il Gestore si riserva il diritto di:
      </p>
      <ul>
        <li>rifiutare la pubblicazione di eventi che non rispettino le presenti Condizioni;</li>
        <li>rimuovere in qualsiasi momento contenuti illeciti, scorretti o lesivi di diritti di terzi;</li>
        <li>sospendere o revocare l'accesso all'account dell'Organizzatore in caso di violazioni gravi o reiterate.</li>
      </ul>
      <p>
        La rimozione di contenuti non comporta alcuna responsabilità del Gestore né diritto
        a indennizzi da parte dell'Organizzatore.
      </p>

      <h2>8. Aggiornamento delle informazioni</h2>
      <p>
        L'Organizzatore si impegna ad aggiornare tempestivamente le informazioni sugli eventi
        pubblicati in caso di variazioni (data, luogo, annullamento, ecc.), al fine di garantire
        ai visitatori informazioni accurate e aggiornate.
      </p>

      <h2>9. Servizio gratuito e modifiche future</h2>
      <p>
        La registrazione e la pubblicazione degli eventi sono attualmente gratuite.
        Il Gestore si riserva la facoltà di introdurre in futuro servizi a pagamento,
        funzionalità premium, abbonamenti o altri servizi remunerati.
        L'eventuale introduzione di corrispettivi economici sarà comunicata preventivamente
        agli Organizzatori interessati e potrà richiedere l'accettazione di nuove condizioni
        contrattuali. L'Organizzatore che non intendesse accettare le nuove condizioni potrà
        richiedere la cancellazione del proprio account.
      </p>

      <h2>10. Trattamento dei dati personali</h2>
      <p>
        I dati personali dell'Organizzatore sono trattati ai sensi dell'
        <a href="/privacy-policy">Informativa Privacy</a>. Il log delle accettazioni
        (data, ora, indirizzo IP, versione del documento) è conservato per 10 anni
        ai fini di prova dell'avvenuta accettazione.
      </p>

      <h2>11. Contatti</h2>
      <p>
        Per qualsiasi comunicazione relativa alle presenti Condizioni:{' '}
        <a href="mailto:domenicograssa@gmail.com">domenicograssa@gmail.com</a>
      </p>
    </article>
  )
}
