-- ============================================================
-- MOESCO — Row Level Security (RLS) policies
-- Esegui nel SQL Editor di Supabase (una volta sola)
-- ============================================================

-- ── 1. Abilita RLS su tutte le tabelle pubbliche ─────────────
ALTER TABLE eventi            ENABLE ROW LEVEL SECURITY;
ALTER TABLE attivita          ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizzatori     ENABLE ROW LEVEL SECURITY;
ALTER TABLE messaggi          ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_acceptances ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventi_categorie  ENABLE ROW LEVEL SECURITY;
ALTER TABLE attivita_categorie ENABLE ROW LEVEL SECURITY;

-- ── 2. Tabelle di sola lettura pubblica ──────────────────────
-- geo_nodi, categorie: chiunque può leggere, nessuno può modificare via client
ALTER TABLE geo_nodi   ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorie  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "geo_nodi: lettura pubblica"
  ON geo_nodi FOR SELECT USING (true);

CREATE POLICY "categorie: lettura pubblica"
  ON categorie FOR SELECT USING (true);

-- ── 3. EVENTI ────────────────────────────────────────────────
-- Lettura pubblica: solo eventi approvati
CREATE POLICY "eventi: lettura pubblica approvati"
  ON eventi FOR SELECT
  USING (stato = 'approvato');

-- Nessun client (anon o autenticato) può inserire/modificare/cancellare eventi
-- direttamente. Solo il service role (server actions) può farlo.
-- (Con RLS abilitata e nessuna policy INSERT/UPDATE/DELETE, il default è DENY)

-- ── 4. ATTIVITA ──────────────────────────────────────────────
CREATE POLICY "attivita: lettura pubblica pubblicato"
  ON attivita FOR SELECT
  USING (stato = 'pubblicato');

-- ── 5. ORGANIZZATORI ─────────────────────────────────────────
-- Lettura pubblica: solo organizzatori approvati (per pagine /organizzatori)
CREATE POLICY "organizzatori: lettura pubblica approvati"
  ON organizzatori FOR SELECT
  USING (stato = 'approvato');

-- ── 6. MESSAGGI ──────────────────────────────────────────────
-- Nessuna policy di SELECT pubblica: i messaggi sono visibili solo via service role
-- (nessuna policy = accesso negato via client anon/autenticato)

-- ── 7. LEGAL_ACCEPTANCES ─────────────────────────────────────
-- Nessuna policy di SELECT pubblica: solo service role

-- ── 8. EVENTI_CATEGORIE e ATTIVITA_CATEGORIE ─────────────────
-- Lettura pubblica OK (non contengono dati sensibili)
CREATE POLICY "eventi_categorie: lettura pubblica"
  ON eventi_categorie FOR SELECT USING (true);

CREATE POLICY "attivita_categorie: lettura pubblica"
  ON attivita_categorie FOR SELECT USING (true);

-- ── 9. Storage bucket sicuro ─────────────────────────────────
-- Assicurati che il bucket 'eventi-immagini' sia PUBLIC (lettura)
-- ma che solo il service role possa caricare file.
-- Esegui nel dashboard Supabase → Storage → Policies:
--
--   INSERT: solo service_role (già così se non hai aggiunto policy)
--   SELECT: public (per mostrare le immagini)
--
-- Non servono comandi SQL aggiuntivi se non hai ancora modificato le policy Storage.

-- ============================================================
-- VERIFICA: dopo aver eseguito, testa con:
-- SELECT * FROM eventi;          -- deve restituire solo approvati
-- SELECT * FROM messaggi;        -- deve restituire 0 righe (via anon)
-- SELECT * FROM organizzatori;   -- deve restituire solo approvati
-- ============================================================
