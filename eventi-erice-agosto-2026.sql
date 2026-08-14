-- Eventi Erice agosto 2026, da docx caricato dall'utente + verifica WebSearch (trapanisi.it, tp24.it, ettoremajoranafoundation.com)
-- Pubblicati direttamente con stato 'approvato' su richiesta esplicita dell'utente ("verifica, scrivi una ricca descrizione e pubblica")

-- 1. Festa di Maria SS. di Custonaci — Erice 2026 (evento "ombrello")
INSERT INTO eventi (
  organizzatore_id, geo_nodo_id, titolo, slug, descrizione, descrizione_breve,
  luogo_nome, data_inizio, data_fine, ora_inizio, ora_fine, gratuito,
  sito_ufficiale, fonte_url, stato
) VALUES (
  '3b75ff49-9797-4738-87a6-335f0c3387fb', '9bc61c88-69c7-4f80-a1e1-cbb9a7d9360a',
  'Festa di Maria SS. di Custonaci — Erice 2026',
  'festa-madonna-custonaci-erice-2026',
  'Dal 16 al 27 agosto Erice vive undici giorni di fede, musica e tradizione per i festeggiamenti di Maria Santissima di Custonaci, patrona della città, organizzati dal Real Duomo di Erice. Si apre domenica 16 agosto alle 21:30 con la rievocazione storica dell''arrivo della Madonna e la fiaccolata verso il Duomo; dal 17 al 24 agosto si tiene la Novena in Chiesa Madre, guidata da Don Antonello Sacco della Diocesi di Roma (scampanìo alle 9:00 e alle 19:30, Rosario alle 18:30, Messa alle 19:00). Sabato 22 agosto, alle 21:00, l''Associazione Musicale "Nuova Banda Ericina" accompagna la benedizione degli altarini votivi nei cortili del centro storico. Martedì 25 agosto, vigilia della festa, si susseguono il corteo dei Sindaci dell''Agro Ericino dal Municipio al Duomo, la consegna delle chiavi d''oro della "Civitas Erycina" e la Soirée dédiée à la Vierge Marie, itinerario musicale a cura di MeMA tra le chiese del centro storico. Il giorno solenne, mercoledì 26 agosto, prevede le Sante Messe (quella delle 11:00 presieduta da Mons. Alessandro Damiano, arcivescovo di Agrigento) e, alle 18:00, la processione della venerata immagine accompagnata dalla Banda Musicale M° Pietro Mascagni e dai Tamburi dell''Unione Maestranze di Trapani. Giovedì 27 agosto, alle 10:00, la Messa di ringraziamento e la distribuzione dei fiori chiudono il programma.',
  'Undici giorni di fede e tradizione a Erice per la patrona Maria SS. di Custonaci: novena, corteo dei Sindaci, processione del 26 agosto e Soirée musicale a cura di MeMA.',
  'Real Duomo di Erice e Chiesa Madre, Erice',
  '2026-08-16', '2026-08-27', '21:30', '10:00', true,
  'https://www.comune.erice.tp.it',
  'https://www.trapanisi.it/erice-si-prepara-a-festeggiare-la-patrona-con-eventi-imperdibili/',
  'approvato'
);

-- 2. Concerto "Il Trovatore" di Giuseppe Verdi (figlio, 23 agosto)
INSERT INTO eventi (
  organizzatore_id, geo_nodo_id, titolo, slug, descrizione, descrizione_breve,
  luogo_nome, data_inizio, ora_inizio, gratuito,
  fonte_url, stato, parent_event_id
) VALUES (
  '3b75ff49-9797-4738-87a6-335f0c3387fb', '9bc61c88-69c7-4f80-a1e1-cbb9a7d9360a',
  'Concerto "Il Trovatore" di Giuseppe Verdi',
  'trovatore-verdi-piazza-matrice-erice-2026',
  'Nell''ambito dei festeggiamenti patronali, il Real Duomo di Erice porta in Piazza Matrice "Il Trovatore" di Giuseppe Verdi. Sul palco le eccellenze del Conservatorio Santa Cecilia di Roma e dell''Accademia Gnesin di Mosca, con l''orchestra della International School of Musical Sciences della Fondazione Ettore Majorana. Un concerto lirico all''aperto, nel cuore del centro storico, che unisce la tradizione operistica italiana alla formazione musicale internazionale ospitata ogni estate a Erice.',
  'Concerto lirico in Piazza Matrice: "Il Trovatore" di Verdi con i talenti del Conservatorio Santa Cecilia di Roma e dell''Accademia Gnesin di Mosca.',
  'Piazza Matrice, Erice',
  '2026-08-23', '21:00', false,
  'https://www.trapanisi.it/erice-si-prepara-a-festeggiare-la-patrona-con-eventi-imperdibili/',
  'approvato',
  (SELECT id FROM eventi WHERE slug = 'festa-madonna-custonaci-erice-2026')
);

-- 3. Spettacolo piromusicale "Magnificat" (figlio, notte tra 26 e 27 agosto)
INSERT INTO eventi (
  organizzatore_id, geo_nodo_id, titolo, slug, descrizione, descrizione_breve,
  luogo_nome, data_inizio, ora_inizio, gratuito,
  fonte_url, stato, parent_event_id
) VALUES (
  '3b75ff49-9797-4738-87a6-335f0c3387fb', '9bc61c88-69c7-4f80-a1e1-cbb9a7d9360a',
  'Spettacolo piromusicale "Magnificat"',
  'piromusicale-magnificat-erice-2026',
  'A chiusura della notte più sentita dell''anno per gli ericini, dopo il giro bandistico e lo sparo dei mortaretti del mattino del 26 agosto, Piazza Matrice ospita lo spettacolo piromusicale "Magnificat", a cura della ditta "Il Re dei Fuochi" per la Casa Santa Erice. Fuochi d''artificio sincronizzati alla musica per salutare la Patrona nella notte tra il 26 e il 27 agosto, momento tradizionalmente molto partecipato dalla città e dai visitatori saliti a Erice per la festa.',
  'Fuochi d''artificio sincronizzati alla musica in Piazza Matrice, a chiusura della festa patronale di Erice.',
  'Piazza Matrice, Erice',
  '2026-08-27', '00:00', true,
  'https://www.trapanisi.it/erice-si-prepara-a-festeggiare-la-patrona-con-eventi-imperdibili/',
  'approvato',
  (SELECT id FROM eventi WHERE slug = 'festa-madonna-custonaci-erice-2026')
);

-- 4. Santa Cecilia a Erice — International School of Musical Sciences (ISMS), 13-24 agosto
INSERT INTO eventi (
  organizzatore_id, geo_nodo_id, titolo, slug, descrizione, descrizione_breve,
  luogo_nome, data_inizio, data_fine, ora_inizio, gratuito,
  sito_ufficiale, fonte_url, stato
) VALUES (
  'ac92e301-6915-40e5-9787-9288eecbe8e9', '9bc61c88-69c7-4f80-a1e1-cbb9a7d9360a',
  'Santa Cecilia a Erice — International School of Musical Sciences',
  'santa-cecilia-erice-isms-2026',
  'Dal 13 al 24 agosto Erice ospita la settima edizione della International School of Musical Sciences (ISMS), promossa dalla Fondazione Ettore Majorana e dal Centro di Cultura Scientifica insieme al Ministero della Cultura e alla Fondazione Santa Cecilia, sotto la direzione del M° Roberto Giuliani. Il tema di quest''anno è "Voci e strumenti da Mozart a Prokofiev": giovani talenti del Conservatorio di Santa Cecilia di Roma si esibiscono insieme ai musicisti dell''Accademia russa di musica Gnesin, in un fitto calendario di concerti tra i chiostri e le piazzette del centro storico. Tra gli appuntamenti in programma: giovedì 13 agosto (ore 19, Piazzetta San Giuliano) "L''inutile precauzione", scene da Il Barbiere di Siviglia di Rossini; venerdì 14 agosto (ore 19, Chiostro San Francesco) l''omaggio a Sergej Prokofiev nel 135° anniversario della nascita; sabato 15 agosto (ore 19, Chiostro San Francesco) il concerto vocale "Musica proibita" (Rossini, Mozart, Verdi, Satie, Donizetti, Bizet, Čajkovskij); domenica 16 agosto (ore 19, Chiostro San Francesco) "Passione Latina". Ingresso con Erice Card, fino a esaurimento posti.',
  'Settima edizione della International School of Musical Sciences a Erice: concerti tra i chiostri del centro storico, dal Barbiere di Siviglia a Prokofiev, con i talenti del Conservatorio Santa Cecilia e dell''Accademia Gnesin di Mosca.',
  'Chiostro San Francesco e Piazzetta San Giuliano, Erice',
  '2026-08-13', '2026-08-24', '19:00', false,
  'https://ettoremajoranafoundation.com/',
  'https://www.tp24.it/2026/08/07/cose-di-musica/erice-torna-l-accademia-gnesin-sette-concerti-e-un-omaggio-a-prokofiev/237951',
  'approvato'
);

-- 5. Ericé Estate 2026 — "Erice Kids" (cinema e spettacoli per bambini, Teatro Gebel Hamed)
INSERT INTO eventi (
  organizzatore_id, geo_nodo_id, titolo, slug, descrizione, descrizione_breve,
  luogo_nome, data_inizio, data_fine, ora_inizio, gratuito,
  sito_ufficiale, stato
) VALUES (
  '3b75ff49-9797-4738-87a6-335f0c3387fb', '9bc61c88-69c7-4f80-a1e1-cbb9a7d9360a',
  'Ericé Estate 2026 — "Erice Kids"',
  'erice-kids-estate-2026',
  'All''interno della rassegna comunale "Ericeventi d''Estate 2026", il Teatro Gebel Hamed di Erice ospita per tutto agosto la sezione dedicata ai più piccoli, "Erice Kids", con proiezioni cinematografiche e spettacoli teatrali con inizio alle 17:30. In programma tre film d''animazione — Lorax (6 agosto), Wicked (11 agosto) e Il Piccolo Yeti (22 agosto) — e due spettacoli della compagnia Teatro Atlante: "Magico Mister Mu", teatro e magia con Emilio Ajovalasit (23 agosto), e "Fischietta torna a casa", clownerie di e con Theano Vavatziani (31 agosto). Il programma, curato dal Comune di Erice, può subire modifiche o integrazioni: per aggiornamenti si consiglia di consultare il sito del Comune.',
  'Cinema e spettacoli per bambini al Teatro Gebel Hamed di Erice: tre film d''animazione e due spettacoli della compagnia Teatro Atlante, tutti i pomeriggi alle 17:30.',
  'Teatro Gebel Hamed, Erice',
  '2026-08-06', '2026-08-31', '17:30', false,
  'https://www.comune.erice.tp.it',
  'approvato'
);

-- Categorie
INSERT INTO eventi_categorie (evento_id, categoria_id)
SELECT e.id, c.id
FROM (VALUES
  ('festa-madonna-custonaci-erice-2026','cultura'),
  ('trovatore-verdi-piazza-matrice-erice-2026','concerti'),
  ('piromusicale-magnificat-erice-2026','cultura'),
  ('santa-cecilia-erice-isms-2026','concerti'),
  ('erice-kids-estate-2026','famiglie'),
  ('erice-kids-estate-2026','cinema')
) AS x(slug, cat_slug)
JOIN eventi e ON e.slug = x.slug
JOIN categorie c ON c.slug = x.cat_slug;

-- Verifica
SELECT titolo, slug, data_inizio, data_fine, stato FROM eventi
WHERE slug IN (
  'festa-madonna-custonaci-erice-2026',
  'trovatore-verdi-piazza-matrice-erice-2026',
  'piromusicale-magnificat-erice-2026',
  'santa-cecilia-erice-isms-2026',
  'erice-kids-estate-2026'
) ORDER BY data_inizio;
