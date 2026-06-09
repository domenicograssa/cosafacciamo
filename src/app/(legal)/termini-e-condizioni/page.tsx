import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Termini e Condizioni — che facciamo?',
  description: 'Termini e condizioni di utilizzo del portale che facciamo?',
}

export default function TerminiCondizioni() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1>Termini e Condizioni di Utilizzo</h1>
      <p className="text-sm text-gray-500">Versione 1.0 — in vigore dal {new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

      <h2>1. Il Gestore</h2>
      <p>
        Il portale <strong>che facciamo?</strong> (di seguito «il Portale») è gestito da:<br />
        <strong>Avv. Domenico Grassa</strong><br />
        Foro di Trapani — Studio: Via Roma n. 53, 91014 Castellammare del Golfo (TP)<br />
        Email: <a href="mailto:domenicograssa@gmail.com">domenicograssa@gmail.com</a>
      </p>

      <h2>2. Oggetto e natura del servizio</h2>
      <p>
        Il Portale è una piattaforma informativa che consente ad associazioni, enti pubblici,
        attività commerciali, organizzatori di eventi e altri soggetti terzi di pubblicare eventi,
        attività ed esperienze relativi al territorio.
      </p>
      <p>
        <strong>
          Il Gestore svolge esclusivamente attività tecnica di messa a disposizione della piattaforma
          e non assume alcun ruolo di organizzatore, promotore, patrocinatore o garante degli eventi
          pubblicati.
        </strong>
      </p>
      <p>
        Il Gestore non è parte di alcun rapporto contrattuale tra l'organizzatore e i partecipanti
        agli eventi. Non gestisce prenotazioni, vendita di biglietti né alcuna transazione economica.
      </p>

      <h2>3. Accesso al Portale</h2>
      <p>
        La consultazione del Portale è gratuita e libera. Non è richiesta la registrazione per
        visualizzare gli eventi pubblicati.
      </p>
      <p>
        La registrazione è richiesta esclusivamente per gli organizzatori che intendono pubblicare
        contenuti, ed è soggetta all'accettazione delle presenti Condizioni e delle{' '}
        <a href="/condizioni-organizzatori">Condizioni per gli Organizzatori</a>.
      </p>

      <h2>4. Servizio gratuito</h2>
      <p>
        La registrazione e la pubblicazione degli eventi sono attualmente gratuite.
        Il Gestore si riserva la facoltà di introdurre in futuro servizi a pagamento,
        funzionalità premium, abbonamenti o altri servizi remunerati.
        L'eventuale introduzione di corrispettivi economici sarà comunicata preventivamente
        agli utenti interessati e potrà richiedere l'accettazione di nuove condizioni contrattuali.
      </p>

      <h2>5. Contenuti pubblicati</h2>
      <p>
        I contenuti pubblicati sul Portale (eventi, descrizioni, immagini, loghi, ecc.) sono forniti
        esclusivamente dagli organizzatori registrati, che ne assumono l'intera responsabilità.
      </p>
      <p>
        Il Gestore non verifica preventivamente la veridicità, la completezza, la legalità né
        l'accuratezza dei contenuti pubblicati dagli organizzatori, fatta salva la facoltà di
        rimuovere contenuti che risultino manifestamente illeciti, scorretti o lesivi di diritti
        di terzi.
      </p>

      <h2>6. Responsabilità del Gestore</h2>
      <p>
        Il Gestore non risponde:
      </p>
      <ul>
        <li>della veridicità, completezza o aggiornamento delle informazioni sugli eventi;</li>
        <li>della qualità, sicurezza o correttezza degli eventi pubblicati;</li>
        <li>di eventuali danni subiti dai visitatori in relazione alla partecipazione a eventi pubblicati sul Portale;</li>
        <li>di interruzioni, malfunzionamenti o indisponibilità temporanea del servizio;</li>
        <li>di contenuti di siti terzi eventualmente raggiungibili tramite link presenti nel Portale.</li>
      </ul>

      <h2>7. Proprietà intellettuale</h2>
      <p>
        Il codice sorgente, il design, il logo, il nome «che facciamo?» e gli altri elementi
        grafici del Portale sono di proprietà del Gestore o dei rispettivi titolari e sono
        protetti dalla normativa sul diritto d'autore.
      </p>
      <p>
        I contenuti pubblicati dagli organizzatori (testi, immagini, loghi) rimangono di
        proprietà dei rispettivi autori. Pubblicando contenuti sul Portale, l'organizzatore
        concede al Gestore una licenza non esclusiva, gratuita e revocabile per la loro
        visualizzazione e distribuzione tramite il Portale.
      </p>

      <h2>8. Condotta degli utenti</h2>
      <p>È vietato utilizzare il Portale per:</p>
      <ul>
        <li>pubblicare contenuti falsi, fuorvianti, diffamatori, osceni o illeciti;</li>
        <li>violare diritti di terzi (copyright, marchi, privacy);</li>
        <li>inviare comunicazioni indesiderate (spam);</li>
        <li>tentare di accedere senza autorizzazione a sistemi informatici;</li>
        <li>qualsiasi attività contraria alla legge italiana o al diritto dell'Unione Europea.</li>
      </ul>

      <h2>9. Legge applicabile e foro competente</h2>
      <p>
        Le presenti Condizioni sono regolate dalla legge italiana.
        Per qualsiasi controversia derivante dall'utilizzo del Portale è competente
        il Tribunale di Trapani.
      </p>

      <h2>10. Modifiche alle Condizioni</h2>
      <p>
        Il Gestore si riserva di modificare le presenti Condizioni in qualsiasi momento.
        Le modifiche saranno pubblicate su questa pagina. L'utilizzo continuato del Portale
        successivamente alla pubblicazione delle modifiche costituisce accettazione delle
        nuove Condizioni.
      </p>

      <h2>11. Contatti</h2>
      <p>
        Per qualsiasi questione relativa alle presenti Condizioni:{' '}
        <a href="mailto:domenicograssa@gmail.com">domenicograssa@gmail.com</a>
      </p>
    </article>
  )
}
