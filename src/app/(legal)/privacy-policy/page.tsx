import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — moesco',
  description: 'Informativa sul trattamento dei dati personali ai sensi del Regolamento UE 2016/679 (GDPR).',
}

export default function PrivacyPolicy() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1>Privacy Policy</h1>
      <p className="text-sm text-gray-500">Versione 1.2 — in vigore dal 20 giugno 2026</p>

      <h2>1. Titolare del trattamento</h2>
      <p>
        Il titolare del trattamento dei dati personali è:<br />
        <strong>Domenico Grassa</strong><br />
        Via Roma n. 53, 91014 Castellammare del Golfo (TP); c.f. GRSDNC83H20G273G<br />
        Email: <a href="mailto:domenicograssa@gmail.com">domenicograssa@gmail.com</a>
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
        Il portale utilizza cookie tecnici necessari al funzionamento. Non sono attualmente utilizzati
        cookie analitici o di profilazione. Per informazioni dettagliate si rimanda alla{' '}
        <a href="/cookie-policy">Cookie Policy</a>.
      </p>

      <h2>3. Finalità e base giuridica del trattamento</h2>
      <p>I dati personali sono trattati per le seguenti finalità:</p>
      <ul>
        <li><strong>Erogazione del servizio</strong> (base giuridica: esecuzione del contratto — art. 6, par. 1, lett. b GDPR): gestione della registrazione degli organizzatori, pubblicazione degli eventi, risposta a richieste, invio di comunicazioni transazionali via email.</li>
        <li><strong>Adempimento di obblighi legali</strong> (base giuridica: obbligo legale — art. 6, par. 1, lett. c GDPR): conservazione dei log di consenso ai sensi della normativa vigente.</li>
      </ul>

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
      <p>I dati personali non sono ceduti a terzi. Sono comunicati esclusivamente a:</p>
      <ul>
        <li><strong>Supabase Inc.</strong> — in qualità di responsabile del trattamento, per la gestione del database e dell'autenticazione (server UE).</li>
        <li><strong>Vercel Inc.</strong> — in qualità di responsabile del trattamento, per l'hosting del portale.</li>
        <li><strong>Resend Inc.</strong> — in qualità di responsabile del trattamento, per l'invio di email transazionali (conferme di registrazione, notifiche agli organizzatori).</li>
      </ul>

      <h2>7. Trasferimento dei dati extra-UE</h2>
      <p>
        Alcuni fornitori del portale (Vercel, Resend) possono trasferire dati al di fuori dello Spazio
        Economico Europeo. Tali trasferimenti avvengono nel rispetto delle garanzie previste dal GDPR
        (clausole contrattuali standard approvate dalla Commissione europea).
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
        <a href="mailto:domenicograssa@gmail.com">domenicograssa@gmail.com</a>.
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
