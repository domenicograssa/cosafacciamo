-- ============================================================
-- SERE D'ESTATE 2026 — Comune di Misiliscemi
-- Esegui nel SQL Editor di Supabase
-- ============================================================

-- 1. Crea l'organizzatore "Comune di Misiliscemi" se non esiste
INSERT INTO organizzatori (nome, slug, email, telefono, sito_web, stato)
VALUES (
  'Comune di Misiliscemi',
  'comune-di-misiliscemi',
  'protocollo@comune.misiliscemi.tp.it',
  '0923 1830300',
  'https://www.comune.misiliscemi.tp.it',
  'approvato'
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 2. Inserisci gli eventi
--    geo_nodo_id = ID di Misiliscemi nella tabella geo_nodi
--    organizzatore_id = ID appena creato
-- ============================================================

-- Helper: usiamo variabili locali tramite DO $$ block
DO $$
DECLARE
  org_id   uuid;
  geo_id   uuid;
BEGIN
  SELECT id INTO org_id FROM organizzatori WHERE slug = 'comune-di-misiliscemi';
  SELECT id INTO geo_id FROM geo_nodi WHERE slug = 'misiliscemi';

  IF org_id IS NULL THEN
    RAISE EXCEPTION 'Organizzatore comune-di-misiliscemi non trovato';
  END IF;
  IF geo_id IS NULL THEN
    RAISE EXCEPTION 'Comune misiliscemi non trovato in geo_nodi (controlla lo slug)';
  END IF;

  -- ── SPORT ──────────────────────────────────────────────────

  INSERT INTO eventi (organizzatore_id, geo_nodo_id, titolo, slug, descrizione, descrizione_breve,
    luogo_nome, data_inizio, data_fine, gratuito, stato, pubblicato_il)
  VALUES (org_id, geo_id,
    'Calcio Balilla Umano',
    'calcio-balilla-umano-misiliscemi-2026',
    'Torneo di Calcio Balilla Umano a Rilievo, organizzato dall''Associazione Nuovi Orizzonti. Primo evento del programma "Sere d''Estate Duemilaventisei" del Comune di Misiliscemi.',
    'Torneo di Calcio Balilla Umano a Rilievo - Ass. Nuovi Orizzonti.',
    'Rilievo',
    '2026-06-22T21:00:00+02:00',
    '2026-07-04T23:59:00+02:00',
    true, 'approvato', now()
  ) ON CONFLICT (slug) DO NOTHING;

  INSERT INTO eventi (organizzatore_id, geo_nodo_id, titolo, slug, descrizione, descrizione_breve,
    luogo_nome, data_inizio, data_fine, gratuito, stato, pubblicato_il)
  VALUES (org_id, geo_id,
    'Torneo di Ciappedde',
    'torneo-ciappedde-locogrande-2026',
    'Torneo di Ciappedde a Locogrande, organizzato dal Comitato Uniti per Locogrande. Due giorni di sport e comunità nelle contrade di Misiliscemi.',
    'Torneo di Ciappedde a Locogrande - Comitato Uniti per Locogrande.',
    'Locogrande',
    '2026-07-10T00:00:00+02:00',
    '2026-07-11T23:59:00+02:00',
    true, 'approvato', now()
  ) ON CONFLICT (slug) DO NOTHING;

  INSERT INTO eventi (organizzatore_id, geo_nodo_id, titolo, slug, descrizione, descrizione_breve,
    luogo_nome, data_inizio, data_fine, gratuito, stato, pubblicato_il)
  VALUES (org_id, geo_id,
    'Prima Maratona di Misiliscemi – Passi di legalità',
    'maratona-misiliscemi-2026',
    'Prima Maratona di Misiliscemi "Passi di legalità". Partenza ore 9 da Locogrande, un evento sportivo dedicato ai valori della legalità e della giustizia.',
    'Prima Maratona di Misiliscemi - Passi di legalità. Ore 9, Locogrande.',
    'Locogrande',
    '2026-09-20T09:00:00+02:00',
    NULL,
    true, 'approvato', now()
  ) ON CONFLICT (slug) DO NOTHING;

  -- ── LE SERATE DANZANTI (Duo Bucky e Aleo) ─────────────────

  INSERT INTO eventi (organizzatore_id, geo_nodo_id, titolo, slug, descrizione, descrizione_breve,
    luogo_nome, data_inizio, gratuito, stato, pubblicato_il)
  VALUES (org_id, geo_id,
    'Serata Danzante – Duo Bucky e Aleo',
    'serata-danzante-bucky-aleo-12luglio-2026',
    'Serata danzante con il Duo Bucky e Aleo in Piazza Palma. Una delle quattro serate danzanti del programma "Sere d''Estate 2026" di Misiliscemi.',
    'Serata danzante con il Duo Bucky e Aleo - Piazza Palma.',
    'Piazza Palma',
    '2026-07-12T21:15:00+02:00',
    true, 'approvato', now()
  ) ON CONFLICT (slug) DO NOTHING;

  INSERT INTO eventi (organizzatore_id, geo_nodo_id, titolo, slug, descrizione, descrizione_breve,
    luogo_nome, data_inizio, gratuito, stato, pubblicato_il)
  VALUES (org_id, geo_id,
    'Serata Danzante – Duo Bucky e Aleo',
    'serata-danzante-bucky-aleo-26luglio-2026',
    'Serata danzante con il Duo Bucky e Aleo in Piazza Palma. Una delle quattro serate danzanti del programma "Sere d''Estate 2026" di Misiliscemi.',
    'Serata danzante con il Duo Bucky e Aleo - Piazza Palma.',
    'Piazza Palma',
    '2026-07-26T21:15:00+02:00',
    true, 'approvato', now()
  ) ON CONFLICT (slug) DO NOTHING;

  INSERT INTO eventi (organizzatore_id, geo_nodo_id, titolo, slug, descrizione, descrizione_breve,
    luogo_nome, data_inizio, gratuito, stato, pubblicato_il)
  VALUES (org_id, geo_id,
    'Serata Danzante – Duo Bucky e Aleo',
    'serata-danzante-bucky-aleo-9agosto-2026',
    'Serata danzante con il Duo Bucky e Aleo in Piazza Rilievo. Una delle quattro serate danzanti del programma "Sere d''Estate 2026" di Misiliscemi.',
    'Serata danzante con il Duo Bucky e Aleo - Piazza Rilievo.',
    'Piazza Rilievo',
    '2026-08-09T21:15:00+02:00',
    true, 'approvato', now()
  ) ON CONFLICT (slug) DO NOTHING;

  INSERT INTO eventi (organizzatore_id, geo_nodo_id, titolo, slug, descrizione, descrizione_breve,
    luogo_nome, data_inizio, gratuito, stato, pubblicato_il)
  VALUES (org_id, geo_id,
    'Serata Danzante – Duo Bucky e Aleo',
    'serata-danzante-bucky-aleo-23agosto-2026',
    'Serata danzante con il Duo Bucky e Aleo in Piazza Rilievo. Una delle quattro serate danzanti del programma "Sere d''Estate 2026" di Misiliscemi.',
    'Serata danzante con il Duo Bucky e Aleo - Piazza Rilievo.',
    'Piazza Rilievo',
    '2026-08-23T21:15:00+02:00',
    true, 'approvato', now()
  ) ON CONFLICT (slug) DO NOTHING;

  -- ── EVENTI GENERALI ────────────────────────────────────────

  INSERT INTO eventi (organizzatore_id, geo_nodo_id, titolo, slug, descrizione, descrizione_breve,
    luogo_nome, data_inizio, gratuito, stato, pubblicato_il)
  VALUES (org_id, geo_id,
    '1° Raduno Bandistico di Misiliscemi',
    'raduno-bandistico-misiliscemi-2026',
    'Il 1° Raduno Bandistico di Misiliscemi con l''Associazione Banda Musicale "G. Verdi". Una serata di musica bandistica sul Molo Uccello Pio di Salinagrande.',
    '1° Raduno Bandistico di Misiliscemi - Ass. Banda Musicale "G. Verdi". Molo Uccello Pio, Salinagrande.',
    'Molo Uccello Pio – Salinagrande',
    '2026-07-05T21:15:00+02:00',
    NULL, true, 'approvato', now()
  ) ON CONFLICT (slug) DO NOTHING;

  INSERT INTO eventi (organizzatore_id, geo_nodo_id, titolo, slug, descrizione, descrizione_breve,
    luogo_nome, data_inizio, gratuito, stato, pubblicato_il)
  VALUES (org_id, geo_id,
    'Barrio de tango Misilese',
    'barrio-de-tango-misilese-2026',
    'Una serata di tango argentino a Guarrato: "Barrio de tango Misilese" al Baglio Sanacore. Musica, danza e atmosfera latinoamericana nelle contrade di Misiliscemi.',
    'Barrio de tango Misilese al Baglio Sanacore di Guarrato.',
    'Baglio Sanacore – Guarrato',
    '2026-08-05T21:15:00+02:00',
    NULL, true, 'approvato', now()
  ) ON CONFLICT (slug) DO NOTHING;

  INSERT INTO eventi (organizzatore_id, geo_nodo_id, titolo, slug, descrizione, descrizione_breve,
    luogo_nome, data_inizio, gratuito, stato, pubblicato_il)
  VALUES (org_id, geo_id,
    'Regata delle Contrade, Villaggio del Gusto e Artigianato',
    'regata-contrade-marausa-2026',
    'Una giornata ricca di eventi a Marausa Lido: Regata delle Contrade, Villaggio del Gusto ed esposizione dell''artigianato locale. Organizzata dal Proloco di Misiliscemi.',
    'Regata delle contrade, villaggio del gusto e artigianato locale - Proloco di Misiliscemi. Dalle ore 18.',
    'Marausa Lido',
    '2026-08-08T18:00:00+02:00',
    NULL, true, 'approvato', now()
  ) ON CONFLICT (slug) DO NOTHING;

  INSERT INTO eventi (organizzatore_id, geo_nodo_id, titolo, slug, descrizione, descrizione_breve,
    luogo_nome, data_inizio, gratuito, stato, pubblicato_il)
  VALUES (org_id, geo_id,
    'Meteore Music Festival',
    'meteore-music-festival-2026',
    'Il Meteore Music Festival sulla spiaggia di Marausa Lido. Musica, mare e natura: un festival sulla spiaggia di Misiliscemi, dalle ore 16.',
    'Meteore Music Festival - Spiaggia Marausa Lido. Dalle ore 16.',
    'Spiaggia Marausa Lido',
    '2026-08-10T16:00:00+02:00',
    NULL, true, 'approvato', now()
  ) ON CONFLICT (slug) DO NOTHING;

  INSERT INTO eventi (organizzatore_id, geo_nodo_id, titolo, slug, descrizione, descrizione_breve,
    luogo_nome, data_inizio, gratuito, stato, pubblicato_il)
  VALUES (org_id, geo_id,
    'Da Ennio Morricone a Pino Daniele – Recital di chitarra',
    'morricone-pino-daniele-recital-2026',
    'Recital di chitarra con Mauro Di Domenico: "Da Ennio Morricone a Pino Daniele". Un viaggio musicale tra i grandi maestri della canzone italiana e della colonna sonora. Villa Immacolatella, Pietretagliate.',
    'Recital di chitarra con Mauro Di Domenico - da Morricone a Pino Daniele. Villa Immacolatella, Pietretagliate.',
    'Villa Immacolatella – Pietretagliate',
    '2026-08-21T21:15:00+02:00',
    NULL, true, 'approvato', now()
  ) ON CONFLICT (slug) DO NOTHING;

  INSERT INTO eventi (organizzatore_id, geo_nodo_id, titolo, slug, descrizione, descrizione_breve,
    luogo_nome, data_inizio, gratuito, stato, pubblicato_il)
  VALUES (org_id, geo_id,
    'Talenti in dono: l''arte si fa comunità',
    'talenti-in-dono-palma-2026',
    '"Talenti in dono: l''arte si fa comunità" - un evento della Comunità Parrocchiale Palma Salinagrande nel campetto parrocchiale di Palma. Musica, arte e partecipazione comunitaria.',
    'Talenti in dono: l''arte si fa comunità - Comunità Parrocchiale Palma Salinagrande.',
    'Campetto Parrocchiale – Palma',
    '2026-08-22T21:15:00+02:00',
    NULL, true, 'approvato', now()
  ) ON CONFLICT (slug) DO NOTHING;

  INSERT INTO eventi (organizzatore_id, geo_nodo_id, titolo, slug, descrizione, descrizione_breve,
    luogo_nome, data_inizio, gratuito, stato, pubblicato_il)
  VALUES (org_id, geo_id,
    'Giornata della Legalità e della Memoria – Giudice Alberto Giacomelli',
    'giornata-legalita-giacomelli-2026',
    'Giornata della legalità, della giustizia e della memoria dedicata al Giudice Alberto Giacomelli. Evento istituzionale presso la Casa Comunale di Salinagrande.',
    'Giornata della legalità, della giustizia e della memoria Giudice Alberto Giacomelli - Casa Comunale Salinagrande.',
    'Casa Comunale – Salinagrande',
    '2026-09-14T10:00:00+02:00',
    NULL, true, 'approvato', now()
  ) ON CONFLICT (slug) DO NOTHING;

  -- ── LE SAGRE ───────────────────────────────────────────────

  INSERT INTO eventi (organizzatore_id, geo_nodo_id, titolo, slug, descrizione, descrizione_breve,
    luogo_nome, data_inizio, data_fine, gratuito, stato, pubblicato_il)
  VALUES (org_id, geo_id,
    'Sagra dell''Anguria',
    'sagra-anguria-rilievo-2026',
    'La Sagra dell''Anguria a Piazza Rilievo, organizzata dall''Associazione Nuovi Orizzonti. Una settimana di festa, cibo e tradizione nel cuore dell''estate misilisemese.',
    'Sagra dell''Anguria - Ass. Nuovi Orizzonti. Piazza Rilievo, 19-25 luglio.',
    'Piazza Rilievo',
    '2026-07-19T00:00:00+02:00',
    '2026-07-25T23:59:00+02:00',
    true, 'approvato', now()
  ) ON CONFLICT (slug) DO NOTHING;

  INSERT INTO eventi (organizzatore_id, geo_nodo_id, titolo, slug, descrizione, descrizione_breve,
    luogo_nome, data_inizio, data_fine, gratuito, stato, pubblicato_il)
  VALUES (org_id, geo_id,
    'Sagra del Pane Cunzato',
    'sagra-pane-cunzato-locogrande-2026',
    'La Sagra del Pane Cunzato a Piazza Locogrande, organizzata dal Comitato Uniti per Locogrande. Due serate all''insegna del gusto e della tradizione gastronomica siciliana.',
    'Sagra del Pane Cunzato - Comitato Uniti per Locogrande. Piazza Locogrande, 1-2 agosto.',
    'Piazza Locogrande',
    '2026-08-01T00:00:00+02:00',
    '2026-08-02T23:59:00+02:00',
    true, 'approvato', now()
  ) ON CONFLICT (slug) DO NOTHING;

  -- ── GIOVEDÌNJAZZ (Baglio Elena · Pietretagliate) ───────────

  INSERT INTO eventi (organizzatore_id, geo_nodo_id, titolo, slug, descrizione, descrizione_breve,
    luogo_nome, data_inizio, gratuito, stato, pubblicato_il)
  VALUES (org_id, geo_id,
    'GiovedìnJazz – C''era una volta lo Swing',
    'giovedinjazz-swing-2luglio-2026',
    'Prima serata della rassegna GiovedìnJazz al Baglio Elena di Pietretagliate: "C''era una volta lo Swing" con Mauro Carpi, Tony Terrasi, Antonella Parnasso, Felice Cavazza e Giacomo Bertuglia.',
    'GiovedìnJazz - C''era una volta lo Swing. Mauro Carpi, Tony Terrasi, Antonella Parnasso, Felice Cavazza, Giacomo Bertuglia.',
    'Baglio Elena – Pietretagliate',
    '2026-07-02T21:15:00+02:00',
    NULL, true, 'approvato', now()
  ) ON CONFLICT (slug) DO NOTHING;

  INSERT INTO eventi (organizzatore_id, geo_nodo_id, titolo, slug, descrizione, descrizione_breve,
    luogo_nome, data_inizio, gratuito, stato, pubblicato_il)
  VALUES (org_id, geo_id,
    'GiovedìnJazz – Fly me to the Monk',
    'giovedinjazz-monk-9luglio-2026',
    'Seconda serata della rassegna GiovedìnJazz al Baglio Elena di Pietretagliate: "Fly me to the Monk" con Nicola Grizzaffi, Flavio Gannuscio, Calogero Bongiovi e Vincenzo Capuano.',
    'GiovedìnJazz - Fly me to the Monk. Nicola Grizzaffi, Flavio Gannuscio, Calogero Bongiovi, Vincenzo Capuano.',
    'Baglio Elena – Pietretagliate',
    '2026-07-09T21:15:00+02:00',
    NULL, true, 'approvato', now()
  ) ON CONFLICT (slug) DO NOTHING;

  INSERT INTO eventi (organizzatore_id, geo_nodo_id, titolo, slug, descrizione, descrizione_breve,
    luogo_nome, data_inizio, gratuito, stato, pubblicato_il)
  VALUES (org_id, geo_id,
    'GiovedìnJazz – Chet, tributo a Chet Baker',
    'giovedinjazz-chet-baker-16luglio-2026',
    'Terza serata della rassegna GiovedìnJazz al Baglio Elena di Pietretagliate: "Chet – Tributo a Chet Baker" con Alberto Anguzza, Salvo Casano, Peppe Pipitone e Salvatore Bonafede.',
    'GiovedìnJazz - Chet, tributo a Chet Baker. Alberto Anguzza, Salvo Casano, Peppe Pipitone, Salvatore Bonafede.',
    'Baglio Elena – Pietretagliate',
    '2026-07-16T21:15:00+02:00',
    NULL, true, 'approvato', now()
  ) ON CONFLICT (slug) DO NOTHING;

  INSERT INTO eventi (organizzatore_id, geo_nodo_id, titolo, slug, descrizione, descrizione_breve,
    luogo_nome, data_inizio, gratuito, stato, pubblicato_il)
  VALUES (org_id, geo_id,
    'GiovedìnJazz – Dusud trio',
    'giovedinjazz-dusud-trio-30luglio-2026',
    'Quarta serata della rassegna GiovedìnJazz al Baglio Elena di Pietretagliate: "Dusud trio" con Anita Vitale, Rita Collura e Sergio Calì.',
    'GiovedìnJazz - Dusud trio. Anita Vitale, Rita Collura, Sergio Calì.',
    'Baglio Elena – Pietretagliate',
    '2026-07-30T21:15:00+02:00',
    NULL, true, 'approvato', now()
  ) ON CONFLICT (slug) DO NOTHING;

  -- ── RASSEGNA TEATRALE "RADICI DI PIETRA E SALE" ────────────

  INSERT INTO eventi (organizzatore_id, geo_nodo_id, titolo, slug, descrizione, descrizione_breve,
    luogo_nome, data_inizio, gratuito, stato, pubblicato_il)
  VALUES (org_id, geo_id,
    'Tonino di Bella duo – Spettacolo di cabaret',
    'tonino-di-bella-cabaret-2026',
    'Prima serata della Rassegna Teatrale "Radici di Pietra e Sale": Tonino di Bella duo con Marco Manera in uno spettacolo di cabaret. Molo Uccello Pio, Salinagrande.',
    'Rassegna Teatrale "Radici di Pietra e Sale" - Tonino di Bella duo, Marco Manera. Spettacolo di cabaret.',
    'Molo Uccello Pio – Salinagrande',
    '2026-07-11T21:15:00+02:00',
    NULL, true, 'approvato', now()
  ) ON CONFLICT (slug) DO NOTHING;

  INSERT INTO eventi (organizzatore_id, geo_nodo_id, titolo, slug, descrizione, descrizione_breve,
    luogo_nome, data_inizio, gratuito, stato, pubblicato_il)
  VALUES (org_id, geo_id,
    'Isola Nura – Canta e cunta',
    'isola-nura-canta-cunta-2026',
    'Seconda serata della Rassegna Teatrale "Radici di Pietra e Sale": "Isola Nura – Canta e cunta" con la regia di Enzo Caputo. Baglio Sanacore, Guarrato.',
    'Rassegna Teatrale "Radici di Pietra e Sale" - Isola Nura, Canta e cunta. Regia di Enzo Caputo.',
    'Baglio Sanacore – Guarrato',
    '2026-07-18T21:15:00+02:00',
    NULL, true, 'approvato', now()
  ) ON CONFLICT (slug) DO NOTHING;

  INSERT INTO eventi (organizzatore_id, geo_nodo_id, titolo, slug, descrizione, descrizione_breve,
    luogo_nome, data_inizio, gratuito, stato, pubblicato_il)
  VALUES (org_id, geo_id,
    'Pi un pezzo di terreno – Commedia di Maurizio Rallo',
    'pi-un-pezzo-di-terreno-2026',
    'Terza serata della Rassegna Teatrale "Radici di Pietra e Sale": "Pi un pezzo di terreno", commedia di Maurizio Rallo con la Compagnia Teatrale Smile. Marausa Lido.',
    'Rassegna Teatrale "Radici di Pietra e Sale" - Pi un pezzo di terreno, commedia di Maurizio Rallo. Compagnia Teatrale Smile.',
    'Marausa Lido',
    '2026-08-29T21:15:00+02:00',
    NULL, true, 'approvato', now()
  ) ON CONFLICT (slug) DO NOTHING;

END $$;

-- Verifica: conta gli eventi inseriti per Misiliscemi
SELECT COUNT(*) AS eventi_misiliscemi
FROM eventi e
JOIN organizzatori o ON o.id = e.organizzatore_id
WHERE o.slug = 'comune-di-misiliscemi';
