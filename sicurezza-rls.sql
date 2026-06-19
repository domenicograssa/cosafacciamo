-- ============================================================
-- MOESCO — Row Level Security (RLS) policies
-- Sicuro da rieseguire: DROP IF EXISTS prima di ogni CREATE
-- ============================================================

-- ── 1. Abilita RLS su tutte le tabelle pubbliche ─────────────
ALTER TABLE eventi            ENABLE ROW LEVEL SECURITY;
ALTER TABLE attivita          ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizzatori     ENABLE ROW LEVEL SECURITY;
ALTER TABLE messaggi          ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_acceptances ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventi_categorie  ENABLE ROW LEVEL SECURITY;
ALTER TABLE attivita_categorie ENABLE ROW LEVEL SECURITY;
ALTER TABLE geo_nodi          ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorie         ENABLE ROW LEVEL SECURITY;

-- ── 2. GEO_NODI e CATEGORIE: lettura pubblica ────────────────
DROP POLICY IF EXISTS "geo_nodi: lettura pubblica"    ON geo_nodi;
DROP POLICY IF EXISTS "categorie: lettura pubblica"   ON categorie;

CREATE POLICY "geo_nodi: lettura pubblica"
  ON geo_nodi FOR SELECT USING (true);

CREATE POLICY "categorie: lettura pubblica"
  ON categorie FOR SELECT USING (true);

-- ── 3. EVENTI ────────────────────────────────────────────────
DROP POLICY IF EXISTS "eventi: lettura pubblica approvati" ON eventi;

CREATE POLICY "eventi: lettura pubblica approvati"
  ON eventi FOR SELECT
  USING (stato = 'approvato');

-- ── 4. ATTIVITA ──────────────────────────────────────────────
DROP POLICY IF EXISTS "attivita: lettura pubblica pubblicato" ON attivita;

CREATE POLICY "attivita: lettura pubblica pubblicato"
  ON attivita FOR SELECT
  USING (stato = 'pubblicato');

-- ── 5. ORGANIZZATORI ─────────────────────────────────────────
DROP POLICY IF EXISTS "organizzatori: lettura pubblica approvati" ON organizzatori;

CREATE POLICY "organizzatori: lettura pubblica approvati"
  ON organizzatori FOR SELECT
  USING (stato = 'approvato');

-- ── 6. EVENTI_CATEGORIE e ATTIVITA_CATEGORIE ─────────────────
DROP POLICY IF EXISTS "eventi_categorie: lettura pubblica"    ON eventi_categorie;
DROP POLICY IF EXISTS "attivita_categorie: lettura pubblica"  ON attivita_categorie;

CREATE POLICY "eventi_categorie: lettura pubblica"
  ON eventi_categorie FOR SELECT USING (true);

CREATE POLICY "attivita_categorie: lettura pubblica"
  ON attivita_categorie FOR SELECT USING (true);

-- ── 7. MESSAGGI e LEGAL_ACCEPTANCES ──────────────────────────
-- Nessuna policy SELECT: visibili solo via service role (default DENY)

-- ============================================================
-- VERIFICA dopo l'esecuzione:
-- SELECT * FROM eventi;          -- solo approvati
-- SELECT * FROM messaggi;        -- 0 righe (via anon)
-- SELECT * FROM organizzatori;   -- solo approvati
-- ============================================================
