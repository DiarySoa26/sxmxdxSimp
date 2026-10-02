

-- DROP TABLE IF EXISTS budget_charge_mensuelle CASCADE;
-- DROP TABLE IF EXISTS budget_mensuel CASCADE;
-- DROP TABLE IF EXISTS budget CASCADE;



-- ============================================================
-- SXMXDX
-- 004_budget.sql
--
-- Tables utilisées pour enregistrer les budgets générés
-- à partir d'un exercice importé.
-- ============================================================


-- ============================================================
-- 1. BUDGET
-- ============================================================

CREATE TABLE IF NOT EXISTS budget (

    id BIGSERIAL PRIMARY KEY,

    exercice_id BIGINT NOT NULL,

    import_id BIGINT NOT NULL,

    type_budget VARCHAR(30)
        NOT NULL DEFAULT 'GENERE',

    statut VARCHAR(30)
        NOT NULL DEFAULT 'GENERE',

    ca_export NUMERIC(20, 2)
        NOT NULL DEFAULT 0,

    charges_exploitation NUMERIC(20, 2)
        NOT NULL DEFAULT 0,

    frais_export NUMERIC(20, 2)
        NOT NULL DEFAULT 0,

    masse_salariale NUMERIC(20, 2)
        NOT NULL DEFAULT 0,

    resultat_operationnel NUMERIC(20, 2)
        NOT NULL DEFAULT 0,

    marge_operationnelle NUMERIC(20, 8)
        NOT NULL DEFAULT 0,

    date_generation TIMESTAMP
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_budget_exercice
        FOREIGN KEY (exercice_id)
        REFERENCES exercice(id),

    CONSTRAINT fk_budget_import
        FOREIGN KEY (import_id)
        REFERENCES import_fichier(id),

    CONSTRAINT chk_budget_type
        CHECK (
            type_budget IN (
                'GENERE',
                'PREVISIONNEL'
            )
        ),

    CONSTRAINT chk_budget_statut
        CHECK (
            statut IN (
                'EN_COURS',
                'GENERE',
                'ERREUR'
            )
        )
);


-- ============================================================
-- 2. BUDGET MENSUEL
-- ============================================================

CREATE TABLE IF NOT EXISTS budget_mensuel (

    id BIGSERIAL PRIMARY KEY,

    budget_id BIGINT NOT NULL,

    mois_id BIGINT NOT NULL,

    ca_export NUMERIC(20, 2)
        NOT NULL DEFAULT 0,

    charges_exploitation NUMERIC(20, 2)
        NOT NULL DEFAULT 0,

    frais_export NUMERIC(20, 2)
        NOT NULL DEFAULT 0,

    masse_salariale NUMERIC(20, 2)
        NOT NULL DEFAULT 0,

    resultat_operationnel NUMERIC(20, 2)
        NOT NULL DEFAULT 0,

    marge_operationnelle NUMERIC(20, 8)
        NOT NULL DEFAULT 0,

    CONSTRAINT fk_budget_mensuel_budget
        FOREIGN KEY (budget_id)
        REFERENCES budget(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_budget_mensuel_mois
        FOREIGN KEY (mois_id)
        REFERENCES mois(id),

    CONSTRAINT uq_budget_mois
        UNIQUE (
            budget_id,
            mois_id
        )
);


-- ============================================================
-- 3. INDEX
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_budget_exercice
ON budget(exercice_id);


CREATE INDEX IF NOT EXISTS idx_budget_import
ON budget(import_id);


CREATE INDEX IF NOT EXISTS idx_budget_type
ON budget(type_budget);


CREATE INDEX IF NOT EXISTS idx_budget_mensuel_budget
ON budget_mensuel(budget_id);


CREATE INDEX IF NOT EXISTS idx_budget_mensuel_mois
ON budget_mensuel(mois_id);


ALTER TABLE budget
    ALTER COLUMN import_id DROP NOT NULL;

ALTER TABLE budget
    ADD COLUMN IF NOT EXISTS annee_reference INTEGER,
    ADD COLUMN IF NOT EXISTS modele VARCHAR(100),
    ADD COLUMN IF NOT EXISTS version_modele VARCHAR(30);