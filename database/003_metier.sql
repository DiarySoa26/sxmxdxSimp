-- ============================================================
-- SXMXDX
-- Tables métier issues du fichier Excel SOMIDA
-- ============================================================


-- ============================================================
-- EMPLOYES
-- ============================================================

CREATE TABLE IF NOT EXISTS employe (
    id SERIAL PRIMARY KEY,

    import_id INTEGER NOT NULL
        REFERENCES import_fichier(id)
        ON DELETE CASCADE,

    matricule VARCHAR(50),

    nom VARCHAR(150),

    site VARCHAR(100),

    departement VARCHAR(100),

    poste VARCHAR(150),

    salaire_base NUMERIC(18,2) DEFAULT 0,

    prime NUMERIC(18,2) DEFAULT 0,

    charges_patronales NUMERIC(18,2) DEFAULT 0,

    cout_total NUMERIC(18,2) DEFAULT 0
);


-- ============================================================
-- PRODUCTION
-- ============================================================

CREATE TABLE IF NOT EXISTS production (
    id SERIAL PRIMARY KEY,

    import_id INTEGER NOT NULL
        REFERENCES import_fichier(id)
        ON DELETE CASCADE,

    exercice_id INTEGER NOT NULL
        REFERENCES exercice(id),

    mois_id INTEGER NOT NULL
        REFERENCES mois(id),

    produit VARCHAR(100) NOT NULL,

    unite VARCHAR(30),

    production_prevue NUMERIC(18,3) DEFAULT 0,

    production_reelle NUMERIC(18,3) DEFAULT 0,

    pertes NUMERIC(18,3) DEFAULT 0,

    production_commercialisable NUMERIC(18,3) DEFAULT 0
);


-- ============================================================
-- CHARGES
-- ============================================================

CREATE TABLE IF NOT EXISTS charge (
    id SERIAL PRIMARY KEY,

    import_id INTEGER NOT NULL
        REFERENCES import_fichier(id)
        ON DELETE CASCADE,

    exercice_id INTEGER NOT NULL
        REFERENCES exercice(id),

    mois_id INTEGER NOT NULL
        REFERENCES mois(id),

    categorie VARCHAR(100),

    sous_categorie VARCHAR(150),

    montant NUMERIC(18,2) NOT NULL DEFAULT 0
);


-- ============================================================
-- EXPORTATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS exportation (
    id SERIAL PRIMARY KEY,

    import_id INTEGER NOT NULL
        REFERENCES import_fichier(id)
        ON DELETE CASCADE,

    exercice_id INTEGER NOT NULL
        REFERENCES exercice(id),

    mois_id INTEGER NOT NULL
        REFERENCES mois(id),

    pays VARCHAR(100),

    representant VARCHAR(150),

    produit VARCHAR(100),

    devise VARCHAR(10),

    quantite NUMERIC(18,3) DEFAULT 0,

    prix_unitaire_devise NUMERIC(18,4) DEFAULT 0,

    ca_devise NUMERIC(20,4) DEFAULT 0,

    taux_change NUMERIC(20,6) DEFAULT 0,

    ca_mga NUMERIC(20,2) DEFAULT 0
);


-- ============================================================
-- FRAIS EXPORT
-- ============================================================

CREATE TABLE IF NOT EXISTS frais_export (
    id SERIAL PRIMARY KEY,

    import_id INTEGER NOT NULL
        REFERENCES import_fichier(id)
        ON DELETE CASCADE,

    exercice_id INTEGER NOT NULL
        REFERENCES exercice(id),

    mois_id INTEGER NOT NULL
        REFERENCES mois(id),

    pays VARCHAR(100),

    representant VARCHAR(150),

    transport_local NUMERIC(18,2) DEFAULT 0,

    transit NUMERIC(18,2) DEFAULT 0,

    manutention NUMERIC(18,2) DEFAULT 0,

    fret NUMERIC(18,2) DEFAULT 0,

    assurance NUMERIC(18,2) DEFAULT 0,

    frais_bancaires NUMERIC(18,2) DEFAULT 0,

    total NUMERIC(18,2) DEFAULT 0
);


-- ============================================================
-- INDEX
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_production_exercice_mois
ON production(exercice_id, mois_id);

CREATE INDEX IF NOT EXISTS idx_charge_exercice_mois
ON charge(exercice_id, mois_id);

CREATE INDEX IF NOT EXISTS idx_exportation_exercice_mois
ON exportation(exercice_id, mois_id);

CREATE INDEX IF NOT EXISTS idx_frais_export_exercice_mois
ON frais_export(exercice_id, mois_id);


ALTER TABLE employe
ADD COLUMN IF NOT EXISTS statut VARCHAR(50);

ALTER TABLE charge
ADD COLUMN IF NOT EXISTS site VARCHAR(50);

ALTER TABLE charge
ADD COLUMN IF NOT EXISTS unite VARCHAR(50);

ALTER TABLE production
ADD COLUMN IF NOT EXISTS site VARCHAR(100);