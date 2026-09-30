CREATE TABLE IF NOT EXISTS role (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS utilisateur (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100),
    email VARCHAR(150) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL REFERENCES role(id),
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    date_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    derniere_connexion TIMESTAMP
);

CREATE TABLE IF NOT EXISTS journal_connexion (
    id SERIAL PRIMARY KEY,
    utilisateur_id INTEGER REFERENCES utilisateur(id),
    date_connexion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    succes BOOLEAN NOT NULL
);

INSERT INTO role (nom, description)
VALUES
    ('ADMIN', 'Administrateur de l''application'),
    ('COMPTABLE', 'Gestion des imports et budgets'),
    ('LECTEUR', 'Consultation des budgets')
ON CONFLICT (nom) DO NOTHING;




INSERT INTO utilisateur (
    nom,
    prenom,
    email,
    mot_de_passe,
    role_id
)
VALUES (
    'RATSARATOETRA',
    'Fidy',
    'admin.sxmxdx@gmail.com',
    '$2b$12$IE7hAFmpKrnWOmBFY8OXMuv9JmSsNioDv5loIEcXCro2VCJ0uhzoS',
    1
);