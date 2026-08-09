import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — moesco',
  description: 'Informativa sul trattamento dei dati personali ai sensi del Regolamento UE 2016/679 (GDPR).',
}

export default function PrivacyPolicy() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1>Privacy Policy</h1>
      <p className="text-sm text-gray-500">Versione 1.3 — in vigore dal 9 agosto 2026</p>

      <h2>1. Titolare del trattamento</h2>
      <p>
        Il titolare del trattamento dei dati personali è:<br />
        <strong>Domenico Grassa</strong><br />
        Via Roma n. 53, 91014 Castellammare del Golfo (TP); c.f. GRSDNC83H20G273G<br />
        Email: <a href="mailto:info@moesco.it">info@moesco.it</a>
      </p>

      <h2>2. Tipologie di dati trattati</h2>

      <h3>2.1 Dati di navigazione</h3>
      <p>
        I sistemi informatici e le procedure software preposte al funzionamento del portale acquisiscono,
        nel corso del loro normale esercizio, alcuni dati personali la cui trasmissione è implicita nell'uso
        dei protocolli di comunicazione di Internet. Si tratta di informazioni che non sono raccolte per
        essere associate a interessati identificati, ma che per loro stessa natura potrebbero, attraverso
        elaborazioni ed associazioni con dati detenuti da terzi, permettere di identificare gli utenti.
        In questa categoria di dati rientrano gli indirizzi IP o i nomi a dominio dei computer utilizzati
        dagli utenti che si connettono al portale.
      </p>

      <h3>2.2 Dati forniti volontariamente dagli utenti</h3>
      <p>
        Il portale raccoglie i seguenti dati forniti volontariamente dagli organizzatori che si registrano
        o che pubblicano eventi: nome, cognome o denominazione dell'organizzazione, indirizzo email,
        numero di telefono (facoltativo), sito web (facoltativo), comune di riferimento.
        Gli organizzatori possono inoltre caricare immagini degli eventi; tali immagini sono archiviate
        su Supabase Storage e possono essere visibili pubblicamente sul portale.
      </p>
      <p>
        I visitatori che utilizzano il portale senza registrarsi non forniscono dati personali al titolare,
        salvo quelli di navigazione di cui al punto 2.1.
      </p>

      <h3>2.3 Cookie e tecnologie di tracciamento</h3>
      <p>
        Il portale utilizza cookie tecnici necessari al funzionamento e, solo previo consenso
        dell'utente, cookie analitici (Google Analytics 4) per analizzare in forma aggregata
        l'utilizzo del sito. Non sono utilizzati cookie di profilazione. Per informazioni
        dettagliate si rimanda alla{' '}
        <a href="/cookie-policy">Cookie Policy</a>.
      </p>

      <h2>3. Finalità e base giuridica del trattamento</h2>
      <p>I dati personali sono trattati per le seguenti finalità:</p>
      <ul>
        <li><strong>Erogazione del servizio</strong>{' '}(base giuridica: esecuzione del contratto — art. 6, par. 1, lett. b GDPR): gestione della registrazione degli organizzatori, pubblicazione degli eventi, risposta a richieste, invio di comunicazioni transazionali via email.</li>
        <li><strong>Adempimento di obblighi legali</strong>{' '}(base giuridica: obbligo legale — art. 6, par. 1, lett. c GDPR): conservazione dei log di consenso ai sensi della normativa vigente.</li>
        <li><strong>Risposta alle richieste inviate tramite il modulo contatti</strong>{' '}(base giuridica: consenso — art. 6, par. 1, lett. a GDPR): i dati inseriti nel modulo sono usati unicamente per rispondere e non per altre finalità.</li>
        <li><strong>Sicurezza del portale e prevenzione degli abusi</strong>{' '}(base giuridica: legittimo interesse — art. 6, par. 1, lett. f GDPR): conservazione dei log tecnici per individuare accessi anomali, tentativi di intrusione e invii automatizzati di spam. L&apos;interesse del titolare a mantenere il servizio funzionante e sicuro è stato bilanciato con i diritti degli interessati, trattandosi di dati tecnici conservati per un periodo limitato.</li>
        <li><strong>Analisi statistica dell&apos;utilizzo del sito</strong>{' '}(base giuridica: consenso — art. 6, par. 1, lett. a GDPR): raccolta di statistiche aggregate tramite Google Analytics, attivata solo se l&apos;utente presta consenso tramite il banner cookie e revocabile in qualsiasi momento.</li>
      </ul>

      <h2>3-bis. Uso di sistemi automatizzati e di intelligenza artificiale</h2>
      <p>
        Per trasparenza si dà conto degli strumenti automatizzati impiegati nella
        gestione dei contenuti del portale.
      </p>
      <ul>
        <li>
          <strong>Traduzione automatica dei contenuti.</strong>{' '}I testi degli eventi
          (titolo, descrizione, luogo) vengono tradotti dall&apos;italiano
          all&apos;inglese tramite il servizio <strong>DeepL</strong>{' '}(DeepL SE,
          Germania) al momento della pubblicazione, per alimentare la versione
          inglese del portale. Vengono inviati a DeepL esclusivamente i testi
          descrittivi degli eventi: non sono trasmessi dati di contatto, dati di
          navigazione né dati identificativi degli utenti. Le traduzioni sono
          generate automaticamente e possono contenere imprecisioni.
        </li>
        <li>
          <strong>Ricerca automatica di eventi.</strong>{' '}Una procedura automatizzata
          ricerca periodicamente su fonti pubbliche in rete notizie di eventi del
          territorio e ne propone una bozza. Le bozze sono <em>sempre</em>{' '}sottoposte
          a revisione e approvazione umana prima di essere pubblicate: nessun
          contenuto viene pubblicato automaticamente. Su ogni evento originato da
          questa procedura è indicata pubblicamente la fonte da cui
          l&apos;informazione è stata tratta.
        </li>
      </ul>
      <p>
        Il portale <strong>non effettua alcun processo decisionale automatizzato
        né profilazione</strong>{' '}che produca effetti giuridici o incida in modo
        analogamente significativo sugli utenti, ai sensi dell&apos;art. 22 GDPR.
        Nessun dato personale degli utenti viene utilizzato per addestrare
        sistemi di intelligenza artificiale, né dal titolare né, per quanto a sua
        conoscenza, dai fornitori indicati.
      </p>
      <p>
        Gli strumenti impiegati non rientrano fra i sistemi di intelligenza
        artificiale ad alto rischio di cui al Regolamento (UE) 2024/1689 (AI Act);
        l&apos;indicazione della natura automatica delle traduzioni e delle bozze
        di evento risponde all&apos;obbligo generale di trasparenza verso gli
        utenti.
      </p>

      <h2>4. Modalità del trattamento</h2>
      <p>
        Il trattamento dei dati personali è effettuato mediante strumenti informatici e telematici,
        con modalità organizzative e con logiche strettamente correlate alle finalità indicate.
        I dati sono conservati su server gestiti da Supabase (database) e Vercel (hosting),
        soggetti a idonee misure di sicurezza contrattuali.
      </p>

      <h2>5. Conservazione dei dati</h2>
      <p>
        I dati degli organizzatori registrati sono conservati per tutta la durata del rapporto
        contrattuale e, successivamente alla cancellazione dell'account, per un ulteriore periodo
        di 10 anni ai fini di adempimento di obblighi di legge e per la gestione di eventuali
        controversie. I log di consenso (legal_acceptances) sono conservati per 10 anni dalla data
        di accettazione.
      </p>

      <h2>6. Comunicazione dei dati a terzi</h2>
      <p>
        I dati personali non sono ceduti né venduti a terzi. Sono comunicati
        esclusivamente ai seguenti fornitori, che agiscono in qualità di
        responsabili del trattamento ai sensi dell&apos;art. 28 GDPR:
      </p>
      <table>
        <thead>
          <tr>
            <th>Fornitore</th>
            <th>Finalità</th>
            <th>Dati trattati</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Supabase Inc.</td>
            <td>Database e autenticazione</td>
            <td>Dati di registrazione degli organizzatori, contenuti pubblicati, immagini</td>
          </tr>
          <tr>
            <td>Vercel Inc.</td>
            <td>Hosting del portale</td>
            <td>Dati di navigazione, log tecnici</td>
          </tr>
          <tr>
            <td>Resend Inc.</td>
            <td>Invio di email transazionali</td>
            <td>Indirizzo email e contenuto del messaggio</td>
          </tr>
          <tr>
            <td>Google Ireland Limited</td>
            <td>Statistiche di utilizzo (solo previo consenso)</td>
            <td>Dati di navigazione in forma aggregata, identificativi dei cookie analitici</td>
          </tr>
          <tr>
            <td>DeepL SE (Germania)</td>
            <td>Traduzione automatica dei testi degli eventi</td>
            <td>Solo i testi descrittivi degli eventi — nessun dato personale degli utenti</td>
          </tr>
        </tbody>
      </table>
      <p>
        I dati possono inoltre essere comunicati all&apos;autorità giudiziaria o
        agli organi di polizia, su loro legittima richiesta, nei casi previsti
        dalla legge.
      </p>

      <h2>7. Trasferimento dei dati extra-UE</h2>
      <p>
        Alcuni fornitori del portale (Vercel, Resend, Google) possono trasferire dati al di fuori dello
        Spazio Economico Europeo, in particolare negli Stati Uniti. Tali trasferimenti avvengono nel
        rispetto delle garanzie previste dal Capo V del GDPR: clausole contrattuali standard approvate
        dalla Commissione europea e, per i fornitori aderenti, il quadro
        <em> EU-U.S. Data Privacy Framework</em>{' '}(decisione di adeguatezza della Commissione europea
        del 10 luglio 2023). Supabase è configurato con server nell&apos;Unione europea; DeepL tratta i
        dati su server situati nell&apos;Unione europea.
      </p>

      <h2>8. Diritti dell'interessato</h2>
      <p>L'interessato ha il diritto di:</p>
      <ul>
        <li>accedere ai propri dati personali (art. 15 GDPR);</li>
        <li>ottenere la rettifica dei dati inesatti (art. 16 GDPR);</li>
        <li>ottenere la cancellazione dei dati (art. 17 GDPR);</li>
        <li>ottenere la limitazione del trattamento (art. 18 GDPR);</li>
        <li>opporsi al trattamento (art. 21 GDPR);</li>
        <li>ricevere i dati in formato portabile (art. 20 GDPR);</li>
        <li>revocare il consenso in qualsiasi momento, senza pregiudizio per la liceità del trattamento basato sul consenso prestato prima della revoca;</li>
        <li>proporre reclamo al Garante per la protezione dei dati personali (<a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer">www.garanteprivacy.it</a>).</li>
      </ul>
      <p>
        Per esercitare i propri diritti, l'interessato può contattare il titolare all'indirizzo email:{' '}
        <a href="mailto:info@moesco.it">info@moesco.it</a>, oppure usare il{' '}
        <a href="/contatti">modulo contatti</a> selezionando «Richiesta privacy (GDPR)».
        Il titolare risponde senza ingiustificato ritardo e comunque entro un mese dal ricevimento
        della richiesta, ai sensi dell'art. 12, par. 3 GDPR.
      </p>

      <h2>8-bis. Dati dei minori</h2>
      <p>
        Il portale non è rivolto a minori di 14 anni e non raccoglie
        consapevolmente i loro dati personali. La registrazione come organizzatore
        è riservata a maggiorenni o a soggetti giuridici. Qualora un genitore o
        un tutore ritenga che un minore abbia fornito dati personali, può
        richiederne la cancellazione ai recapiti sopra indicati.
      </p>

      <h2>9. Modifiche alla presente informativa</h2>
      <p>
        Il titolare si riserva il diritto di modificare la presente informativa in qualsiasi momento.
        Le modifiche saranno pubblicate su questa pagina con indicazione della data di aggiornamento.
        In caso di modifiche sostanziali che incidano sui diritti degli interessati, il titolare
        provvederà a darne comunicazione adeguata.
      </p>
    </article>
  )
}
