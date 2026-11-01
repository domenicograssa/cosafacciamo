-- ============================================================
-- MOESCO — Registro delle ricerche automatiche eventi
-- Una riga per ogni chiamata a /api/cron/ricerca-eventi (cron di
-- Vercel o lancio manuale), letta dalla pagina /admin/registro-ricerche.
-- Sicuro da rieseguire: IF NOT EXISTS ovunque.
-- ============================================================

CREATE TABLE IF NOT EXISTS ricerche_eventi_log (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  creato_il     timestamptz NOT NULL DEFAULT now(),
  origine       text NOT NULL,            -- 'cron' (Vercel) | 'manuale'
  esito         text NOT NULL,            -- 'ok' | 'errore' | 'nessun_comune'
  comune        text,
  gruppo        int,
  slot          int,
  motore        text,
  prova         boolean NOT NULL DEFAULT false,
  ricerche_web  int,
  proposti      int,                      -- candidati che hanno superato i controlli
  inseriti      int,                      -- effettivamente inseriti in revisione
  scartati      int,
  durata_ms     int,
  errore        text,
  dettaglio     jsonb                     -- titoli proposti/scartati, query, note
);

CREATE INDEX IF NOT EXISTS ricerche_eventi_log_creato_il_idx
  ON ricerche_eventi_log (creato_il DESC);

-- Solo il service role (server) legge e scrive: nessuna policy pubblica.
ALTER TABLE ricerche_eventi_log ENABLE ROW LEVEL SECURITY;
