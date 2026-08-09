import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dichiarazione di accessibilità — moesco',
  description:
    'Stato di accessibilità del portale moesco, barriere note, misure adottate e come segnalare un problema di accessibilità.',
}

export default function DichiarazioneAccessibilita() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1>Dichiarazione di accessibilità</h1>
      <p className="text-sm text-gray-500">Versione 1.0 — in vigore dal 9 agosto 2026</p>

      <p>
        <strong>moesco</strong> si impegna a rendere il proprio portale accessibile
        al maggior numero possibile di persone, comprese quelle che navigano con
        screen reader, ingranditori di schermo, sola tastiera o comandi vocali.
      </p>

      <h2>1. Stato di conformità</h2>
      <p>
        Il portale è <strong>parzialmente conforme</strong> alle{' '}
        <a
          href="https://www.w3.org/Translations/WCAG21-it/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Linee guida per l&apos;accessibilità dei contenuti web (WCAG) 2.1
        </a>{' '}
        di livello AA. «Parzialmente conforme» significa che una parte dei
        contenuti non è ancora pienamente accessibile: le eccezioni note sono
        elencate al punto 3.
      </p>
      <p>
        moesco è un portale gestito da un privato e non da una pubblica
        amministrazione: non rientra quindi fra i soggetti obbligati dalla Legge
        9 gennaio 2004 n. 4 («legge Stanca»). La presente dichiarazione è resa
        volontariamente e come impegno verso gli utenti. Si tiene inoltre conto
        della Direttiva (UE) 2019/882 sull&apos;accessibilità di prodotti e
        servizi, recepita in Italia con il D.Lgs. 82/2022.
      </p>

      <h2>2. Misure adottate</h2>
      <ul>
        <li>
          collegamento «Salta al contenuto principale» come primo elemento
          raggiungibile con il tasto Tab, per non dover riattraversare il menu a
          ogni pagina;
        </li>
        <li>
          struttura semantica delle pagine con intestazioni gerarchiche, un solo
          titolo di primo livello per pagina e regioni (intestazione,
          navigazione, contenuto, piè di pagina) etichettate;
        </li>
        <li>
          indicatore di fuoco sempre visibile durante la navigazione da tastiera;
        </li>
        <li>
          testo alternativo sulle immagini informative e icone decorative
          nascoste alle tecnologie assistive;
        </li>
        <li>
          etichette esplicite associate a tutti i campi dei moduli;
        </li>
        <li>
          rapporto di contrasto minimo di 4,5:1 per il testo normale, ottenuto
          anche adattando automaticamente i colori delle categorie;
        </li>
        <li>
          rispetto della preferenza di sistema «riduci movimento», che disattiva
          animazioni e scorrimenti automatici;
        </li>
        <li>
          annuncio vocale del numero di risultati quando si applicano filtri o
          si effettua una ricerca, così che chi non vede lo schermo si accorga
          dell&apos;aggiornamento della lista;
        </li>
        <li>
          lingua della pagina dichiarata correttamente (italiano o inglese) sia
          nel codice sia negli header HTTP.
        </li>
      </ul>

      <h2>3. Contenuti non accessibili</h2>
      <p>Sono note le seguenti limitazioni, sulle quali è in corso il lavoro:</p>
      <ul>
        <li>
          <strong>Contenuti inseriti dagli organizzatori.</strong> Le descrizioni
          e le immagini degli eventi sono caricate da soggetti terzi. Le immagini
          delle locandine possono contenere informazioni testuali (date, orari,
          prezzi) non riportate nel testo alternativo. Le informazioni essenziali
          di ogni evento sono comunque sempre disponibili come testo nella scheda
          dell&apos;evento, indipendentemente dalla locandina.
        </li>
        <li>
          <strong>Traduzione automatica del sito.</strong> Le pagine dichiarano
          l&apos;attributo <code>translate=&quot;no&quot;</code>, che impedisce ai
          browser di offrire la traduzione automatica. La scelta nasce da problemi
          ricorrenti di traduzione errata dei contenuti; il portale offre in
          alternativa una versione inglese curata, raggiungibile dal selettore di
          lingua. Chi ha bisogno di leggere in un&apos;altra lingua non ha oggi
          un&apos;alternativa integrata: la limitazione è in corso di riesame.
        </li>
        <li>
          <strong>Contenuti caricati progressivamente.</strong> Nelle liste di
          eventi con il pulsante «Mostra altri», l&apos;arrivo dei nuovi elementi
          non viene annunciato vocalmente: il conteggio complessivo è però
          sempre annunciato.
        </li>
        <li>
          <strong>Mappe e contenuti incorporati.</strong> Eventuali contenuti di
          terze parti incorporati nelle pagine possono non rispettare i medesimi
          criteri di accessibilità.
        </li>
      </ul>

      <h2>4. Metodo di valutazione</h2>
      <p>
        La valutazione è stata effettuata mediante autovalutazione condotta dal
        gestore del portale in data 9 agosto 2026, con verifica della struttura
        semantica, della navigazione da sola tastiera, dei nomi accessibili dei
        controlli e con misurazione strumentale dei rapporti di contrasto. Non è
        stato ancora svolto un audit indipendente né un test con utenti reali di
        tecnologie assistive.
      </p>

      <h2>5. Segnalazioni e recapiti</h2>
      <p>
        Se incontri una barriera che ti impedisce di usare il portale, scrivi
        indicando la pagina interessata e il problema riscontrato: la
        segnalazione riceve risposta entro 30 giorni.
      </p>
      <p>
        Email:{' '}
        <a href="mailto:domenicograssa@gmail.com">domenicograssa@gmail.com</a>
        <br />
        Oppure tramite il{' '}
        <a href="/contatti">modulo contatti</a>, selezionando «Segnalazione
        contenuto».
      </p>
      <p>
        Responsabile: Domenico Grassa, Via Roma n. 53, 91014 Castellammare del
        Golfo (TP).
      </p>

      <h2>6. Procedura di attuazione</h2>
      <p>
        Se non ricevi risposta entro 30 giorni o la risposta non è soddisfacente,
        puoi rivolgerti alle autorità competenti in materia di tutela dei
        consumatori e di accessibilità dei servizi digitali. Per i servizi
        rientranti nel D.Lgs. 82/2022 l&apos;autorità di vigilanza è
        l&apos;Agenzia per l&apos;Italia Digitale (AgID).
      </p>
    </article>
  )
}
