-- A exécuter manuellement après validation du schéma existant.
CREATE TABLE IF NOT EXISTS amortissement_mensuel (
 id BIGSERIAL PRIMARY KEY,
 import_id BIGINT NOT NULL REFERENCES import_fichier(id),
 exercice_id BIGINT NOT NULL REFERENCES exercice(id),
 categorie TEXT NOT NULL,
 nature TEXT NOT NULL,
 perimetre_general TEXT,
 unite TEXT NOT NULL DEFAULT 'MGA',
 mois INTEGER NOT NULL CHECK (mois BETWEEN 1 AND 12),
 montant NUMERIC(20,4) NOT NULL,
 UNIQUE(import_id,nature,mois)
);
