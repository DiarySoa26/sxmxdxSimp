
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






CREATE TABLE IF NOT EXISTS prediction_evolution (
    id BIGSERIAL PRIMARY KEY,
    budget_id BIGINT NOT NULL,
    indicateur VARCHAR(50) NOT NULL,
    valeur_reference NUMERIC(20,2),
    valeur_prediction NUMERIC(20,2),
    evolution_pct NUMERIC(15,6) NOT NULL,
    CONSTRAINT fk_prediction_evolution_budget FOREIGN KEY (budget_id) REFERENCES budget(id) ON DELETE CASCADE,
    CONSTRAINT uq_prediction_evolution UNIQUE (budget_id,indicateur)
);

CREATE TABLE IF NOT EXISTS prediction_derive (
    id BIGSERIAL PRIMARY KEY,
    budget_id BIGINT NOT NULL,
    mois_id INTEGER NOT NULL,
    categorie VARCHAR(100) NOT NULL,
    charge_prevue NUMERIC(20,2) NOT NULL,
    charge_attendue NUMERIC(20,2) NOT NULL,
    ecart_mga NUMERIC(20,2) NOT NULL,
    ecart_pct NUMERIC(15,6),
    score_derive NUMERIC(15,6),
    indice_derive NUMERIC(15,6),
    niveau_risque VARCHAR(20),
    type_derive VARCHAR(30),
    CONSTRAINT fk_prediction_derive_budget FOREIGN KEY (budget_id) REFERENCES budget(id) ON DELETE CASCADE,
    CONSTRAINT chk_prediction_derive_mois CHECK (mois_id BETWEEN 1 AND 12)
);

CREATE TABLE IF NOT EXISTS prediction_analyse (
    id BIGSERIAL PRIMARY KEY,
    budget_id BIGINT NOT NULL UNIQUE,
    resume TEXT NOT NULL,
    date_generation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_prediction_analyse_budget FOREIGN KEY (budget_id) REFERENCES budget(id) ON DELETE CASCADE
);