# moesco — istruzioni per Claude Code

Portale eventi e attività della provincia di Trapani (+ Palermo città): **www.moesco.it**.
Proprietario: Domenico Grassa. Questo file raccoglie il contesto e le regole imparate
sul campo fino al 30/9/2026 (prima il lavoro si faceva con Cowork). Tienilo aggiornato
quando una decisione o una lezione nuova vale anche per le sessioni future.

## Come lavorare con Domenico

- Rispondi sempre in **italiano**, in modo chiaro e senza gergo inutile.
- Domenico non è uno sviluppatore: quando deve fare qualcosa lui (Vercel, Google AI
  Studio, Supabase, GitHub), guidalo **passo passo**, un'azione per volta, dicendo
  esattamente dove cliccare e cosa deve vedere.
- Segreti (chiavi API, `CRON_SECRET`, token): non chiedergli mai di incollarli in chat
  né di mandare screenshot che li mostrano. Se servono in un comando, fai in modo che
  li legga da `.env.local` o li copi negli appunti (`… | tr -d '\n' | pbcopy`).
- Prima di azioni irreversibili o visibili al pubblico (push in produzione, modifiche
  massive al DB, pubblicazione di eventi) chiedi conferma.

## Stack

- **Next.js 16** (App Router, React 19, Tailwind 4) in `src/`. `next.config.ts` ha
  `typescript.ignoreBuildErrors: true`: il repo ha errori TS preesistenti sparsi, quindi
  per verificare le tue modifiche lancia `npx tsc --noEmit` e guarda **solo** gli errori
  nei file che hai toccato.
- **Supabase** (Postgres + Auth + Storage), progetto `irtewoirgrberzlvsxso`.
  Client in `src/lib/supabase/server.ts`: `createClient()` (utente, rispetta RLS) e
  `createAdminClient()` (service role, bypassa RLS, solo server-side).
- **Vercel** (piano Hobby, progetto `cosafacciamo`, dominio www.moesco.it). Deploy
  automatico a ogni push su `main`. `netlify.toml` è un residuo: il sito NON è su Netlify.
- Repo GitHub: `domenicograssa/cosafacciamo`.
- Email: Resend, mittente `info@moesco.it`. Traduzione EN: DeepL (`src/lib/traduzione.ts`).

### Variabili d'ambiente (Vercel → Settings → Environment Variables)
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`CRON_SECRET`, `GEMINI_API_KEY`, `GEMINI_MODEL` (= `gemini-3.5-flash-lite`),
`DEEPL_API_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `NOTIFICA_EMAIL`, `ADMIN_EMAIL`.
Modello di riferimento: `.env.local.example`. Dopo aver cambiato una variabile su Vercel
serve un nuovo deploy (Redeploy o push). Attenzione agli "a capo" finali nei valori:
Vercel li rifiuta nelle intestazioni HTTP (successo il 29/9/2026 con `CRON_SECRET`).

### Sessioni cloud di Claude Code (claude.ai/code, dal 1/10/2026)

- Ambiente cloud **"Moesco"**: rete *Personalizzata* con `www.moesco.it` e
  `irtewoirgrberzlvsxso.supabase.co` (+ elenco predefinito dei gestori di pacchetti).
  Altri siti (es. `gibellina2026.it`) sono bloccati finché Domenico non li aggiunge.
- Le chiavi sono **Credenziali API** dell'ambiente: il proxy le aggiunge da solo alle
  richieste, Claude non le vede e non ci sono variabili d'ambiente da leggere.
  - `moesco CRON` → host `www.moesco.it`, `Authorization: Bearer <CRON_SECRET>`.
    Basta chiamare gli endpoint di servizio senza header.
  - `Supabase moesco` → host Supabase, `Authorization: Bearer <service_role legacy JWT>`.
    L'header `apikey` va passato a mano con la chiave **anon pubblica** (è nel bundle JS
    del sito, es. pagina `/accedi`): con le due insieme la richiesta gira come service role.
    La chiave nuova `sb_secret_…` NON funziona qui: il modulo forza il prefisso "Bearer".
- I valori dei segreti su Vercel sono di tipo *Secret*: non si possono rileggere. Se
  serve un valore, va rigenerato (es. `openssl rand -hex 32 | tr -d '\n' | pbcopy`),
  messo su Vercel + credenziale Claude, poi Redeploy. `CRON_SECRET` è stata rigenerata il 1/10/2026.
- In modalità "Auto" il classificatore blocca letture/scritture sul DB di produzione:
  Domenico deve passare ad "Accetta modifiche" e approvare i comandi.
- Vercel Hobby: **le anteprime falliscono se il commit è firmato da un autore non
  membro del team** (es. "Claude"). Il merge della PR su GitHub crea un commit firmato
  da Domenico e la produzione si pubblica regolarmente.
- Vercel Hobby: i **log runtime durano 1 ora**. Per vedere l'esito della ricerca
  automatica: Settings → Cron Jobs → Run sullo slot, poi Logs entro l'ora.

## Pubblicare il codice (git)

- **Mai `git add -A` / `git add .`**: nella cartella restano file di lavoro da non
  pubblicare (`batch*-jsonstring.txt`, `i18n-eventi-batch*.sql`,
  `public/eventi/test-write-check.txt`, `_tmp-*.mjs`…). Aggiungi sempre i percorsi espliciti.
  Lo script `../git-push.sh` fa `git add -A` con un messaggio fisso: non usarlo.
- Il remoto riceve commit da più postazioni: prima del push fai sempre
  `git pull --rebase` (il repo non ha `pull.rebase` configurato, un `git pull` secco si ferma).
  Se ci sono modifiche locali non committate, verifica prima se sono già sul remoto
  (`git fetch` + confronto) invece di scartarle alla cieca.
- Se compaiono lock (`.git/index.lock`, `HEAD.lock`), rimuovili con `rm -f` prima di riprovare.
- **Raggruppa i deploy**: un commit a fine lavoro o per gruppo di modifiche correlate,
  non un push per ogni ritocco. Le modifiche ai **dati** (Supabase) non richiedono deploy:
  il sito legge dal DB.
- Il remoto `origin` ha un token GitHub fine-grained scritto nell'URL (scadenza prevista
  6/11/2026). Se il push fallisce con 401 il token è scaduto: Domenico deve generarne uno
  nuovo (GitHub → Settings → Developer settings → Fine-grained tokens, solo repo
  `cosafacciamo`, Contents read/write). Meglio ancora: passare a un credential helper
  e togliere il token dall'URL.

## Modello dati (essenziale)

- **`geo_nodi`**: gerarchia geografica unica (`regione` → `provincia` → `comune` →
  `quartiere`) con `path` tipo `/sicilia/trapani/castelvetrano/`. Dettagli in
  `../architettura-geografica.md`.
  - ⚠️ Lo slug `trapani` esiste **due volte** (provincia e comune): filtra sempre anche
    per `tipo` (`tipo=eq.comune`), altrimenti prendi il nodo sbagliato. Il 22/9/2026 un
    dedup fatto senza filtro ha inserito Le Vie dei Tesori in quattro copie.
  - Le frazioni turistiche sono nodi `quartiere` con nome composto, es.
    "Castelvetrano - Selinunte" (slug `castelvetrano-selinunte`). Quando ne crei una,
    aggiungi la foto anche in `COMUNE_FOTO` (`src/data/comuni-immagini.ts`).
- **`eventi`**: `stato` ∈ `bozza | in_revisione | approvato | rifiutato | sospeso | scaduto`.
  Il sito pubblico mostra solo `approvato`. `slug_precedenti` conserva i vecchi slug
  (redirect permanente da `/eventi/[slug]`). `descrizione` = i fatti; `testo_articolo` =
  il racconto redazionale (sezione «Il racconto» e vetrina in homepage).
  Categorie via tabella ponte `eventi_categorie`. La categoria famiglie è `famiglie`:
  il doppione `per-famiglie` è stato unito e disattivato il 2/10/2026.
- Doppioni: il 2/10/2026 ne sono stati tolti 9 (stato `rifiutato` via
  `/api/approva-eventi`, nota "Doppione rimosso nella pulizia del 2/10/2026"). Nascono
  quando la ricerca propone lo stesso evento con un titolo diverso: in revisione
  controlla sempre luogo + data prima di approvare. Rifiutare un evento manda
  un'email all'organizzatore (anche a quello tecnico "Redazione moesco").
- **`attivita`**: esperienze/cose da fare (`/cosa-fare`), stato pubblico `pubblicato`.
- **RLS**: con la chiave anon si vedono solo gli eventi `approvato`. Per leggere o
  modificare righe in altri stati serve la service role (`SUPABASE_SERVICE_ROLE_KEY` in
  `.env.local`), passata sia come `apikey` sia come `Authorization: Bearer`.
- Cambi di stato degli eventi: usa `aggiornaStatoEventoCore` (`src/lib/eventi-stato.ts`),
  che gestisce email, organizzatore e invalidazione cache. Non fare UPDATE diretti sullo stato.

## Endpoint di servizio (auth: `Authorization: Bearer <CRON_SECRET>`, vedi `src/lib/api-auth.ts`)

- `POST /api/proponi-eventi` — inserisce eventi candidati, **sempre** `in_revisione`,
  organizzatore tecnico `ricerca-automatica-moesco`, `fonteRicerca` obbligatoria.
  Logica condivisa in `src/lib/eventi-proposti.ts`. Ogni voce di `risultati` riporta
  `id` e `slug` dell'evento inserito (anche nella risposta di `/api/cron/ricerca-eventi`).
- `POST /api/approva-eventi` — cambia stato a eventi elencati per id.
- `POST /api/proponi-attivita` — come proponi-eventi ma per `attivita` (stato `bozza`).
- `POST /api/revalidate` — invalida la cache ISR.
- `GET /api/cron/ricerca-eventi` — ricerca automatica eventi (sotto).

## Ricerca automatica eventi (dal 30/9/2026)

Sostituisce il vecchio task pianificato di Cowork. File:
`src/app/api/cron/ricerca-eventi/route.ts`, `src/lib/ricerca-eventi/{rotazione,gemini,claude}.ts`,
`vercel.json` (crons).

- **Quando**: `vercel.json` la lancia lun/mer/ven, 6 slot orari (04–09 UTC), un comune
  per chiamata (limite 300 s per funzione). Rotazione di 26 comuni in 5 gruppi:
  `indice_gruppo = ((settimana_ISO − 1) × 3 + run) % 5`, con run lun=0, mer=1, ven=2.
- **Motore**: Gemini con ricerca Google tramite la **Interactions API**
  (`POST /v1beta/interactions`, `tools: [{type:'google_search'}]`, `response_format`
  con schema JSON). La vecchia `generateContent` con i modelli 3.x **non eseguiva la
  ricerca** e Gemini rispondeva a memoria dichiarando il falso: non tornarci.
  Claude (`ANTHROPIC_API_KEY`) resta come alternativa: `?motore=claude` o
  `MOTORE_RICERCA_EVENTI=claude`.
- **Costi**: la ricerca Google con i modelli Gemini 3.x NON è nel piano gratuito. Domenico
  ha attivato la fatturazione su Google AI Studio con 5 € prepagati e ricarica automatica
  spenta; 5.000 ricerche/mese sono incluse. Controllo spesa: aistudio.google.com → Spesa.
- **Controlli prima dell'inserimento** (non allentarli): data nella finestra di 42 giorni,
  descrizione ≥ 400 caratteri, dedup contro tutti gli eventi del comune (tutti gli stati)
  e interno al lotto, e fonte verificata: o URL citato dal motore, oppure la pagina
  aperta dal server deve esistere, menzionare il 2026 e contenere ≥ 60% delle parole del titolo.
- **Prova senza inserire nulla**:
  `https://www.moesco.it/api/cron/ricerca-eventi?comune=<slug>&prova=1` con il segreto
  (header, oppure `&secret=` solo per prove manuali dal browser). Parametri utili:
  `gruppo=`, `slot=`, `motore=`, `modello=`. La risposta contiene `proposti`, `scartati`
  con motivo e `diagnostica`.
- I risultati si approvano a mano su `/admin/eventi?stato=in_revisione`.
- **Approvazione automatica prudente (dal 10/10/2026)**: l'attività programmata
  "Moesco verifica eventi" (lun/mer) approva da sola, con `/api/approva-eventi` e l'`id`
  restituito all'inserimento, solo gli eventi che rispettano la regola di pubblicazione
  diretta (fonte primaria letta direttamente + descrizione ricca, vedi Regole editoriali).
  Tutto il resto resta in revisione. Non rifiuta mai in automatico (il rifiuto manda email).

## Regole editoriali (valgono per qualunque inserimento di eventi/attività)

- **MAI INVENTARE.** Ogni evento deve avere una fonte reale, verificabile e con data 2026
  esplicita. Meglio zero eventi che uno incerto. Nel giugno 2026 uno script SQL ha
  pubblicato ~19 eventi inventati (`../bonifica-eventi-inventati-2026.sql`): mai
  inserimenti massivi via SQL con stato `approvato`.
- Trappole sulle fonti: portali con **anno riciclato** (vivasicilia.com, enjoysicilia.it,
  siciliainfesta.com: controlla "Start Date/End Date", non il titolo); **sagr.it** genera
  date 2026 per estrapolazione ("Text generated with AI"), vale solo come indizio;
  **giorno della settimana**: le sagre sono quasi sempre sabato/domenica, date
  domenica-lunedì fanno pensare a date traslate; i **festival in più città** vanno inseriti
  con le date della singola città.
- **Descrizioni ricche**, richiesta forte e ripetuta di Domenico: 3-5 paragrafi con storia
  ed edizione, programma e orari, ospiti, organizzatori, luoghi, prezzi e prenotazioni,
  atmosfera. Solo fatti confermati dalle fonti.
- Pubblicazione diretta (stato `approvato`) consentita solo se la descrizione è ricca e la
  fonte è primaria (sito del Comune, sito ufficiale evento/teatro) letta direttamente;
  altrimenti `in_revisione`.
- **Immagini**: mai foto prese da testate o portali (balarm, vivasicilia, itacanotizie…).
  Solo foto di Domenico, con diritti chiari o da Wikimedia Commons (verificate). Le
  locandine vanno in `public/eventi/` con percorso relativo nel campo immagine.
- `testo_articolo`: taglio da rivista, un dettaglio concreto in apertura, contesto sul
  luogo, niente enfasi promozionale.

## Note tecniche varie

- Nei form admin (`/admin/eventi/[slug]/modifica` ecc.) i campi sono React controllati:
  se li compili via browser automatizzato, simula digitazione vera, non impostare il valore.
- Il cambio del titolo di un evento rigenera lo slug e salva il vecchio in `slug_precedenti`:
  i post Facebook usano slug scritti a mano, quindi i vecchi link devono continuare a funzionare.
- `/llms.txt` (`src/app/llms.txt/route.ts`): presentazione del sito per gli assistenti AI
  (ChatGPT porta visite: 11 utenti su 37 a settembre 2026), con comuni, categorie e
  prossimi eventi approvati presi dal DB. Se cambiano le sezioni del sito, aggiornalo.
- Accessibilità: barriere note e non ancora risolte sono elencate in
  `/dichiarazione-accessibilita` (aria-live sui filtri, alt delle locandine). Se ne risolvi
  una, aggiorna anche quella pagina.
