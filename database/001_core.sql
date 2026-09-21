CREATE TABLE IF NOT EXISTS exercice (
    id SERIAL PRIMARY KEY,
    annee INTEGER NOT NULL UNIQUE
);


CREATE TABLE IF NOT EXISTS mois (
    id SERIAL PRIMARY KEY,
    numero INTEGER NOT NULL UNIQUE,
    nom VARCHAR(20) NOT NULL UNIQUE
);


CREATE TABLE IF NOT EXISTS import_fichier (
    id SERIAL PRIMARY KEY,

    nom_fichier VARCHAR(255) NOT NULL,

    exercice_id INTEGER
        REFERENCES exercice(id),

    statut VARCHAR(30) NOT NULL,

    date_import TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    message_erreur TEXT
);


CREATE TABLE IF NOT EXISTS produit (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    nom VARCHAR(150) NOT NULL,
    unite VARCHAR(30)
);


CREATE TABLE IF NOT EXISTS pays (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) UNIQUE NOT NULL
);


CREATE TABLE IF NOT EXISTS devise (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL
);


CREATE TABLE IF NOT EXISTS representant (
    id SERIAL PRIMARY KEY,

    nom VARCHAR(150) NOT NULL,

    pays_id INTEGER
        REFERENCES pays(id)
);



INSERT INTO mois (numero, nom)
VALUES
    (1, 'Janvier'),
    (2, 'Février'),
    (3, 'Mars'),
    (4, 'Avril'),
    (5, 'Mai'),
    (6, 'Juin'),
    (7, 'Juillet'),
    (8, 'Août'),
    (9, 'Septembre'),
    (10, 'Octobre'),
    (11, 'Novembre'),
    (12, 'Décembre')
ON CONFLICT DO NOTHING;


INSERT INTO devise (code)
VALUES
    ('MGA'),
    ('USD'),
    ('JPY')
ON CONFLICT DO NOTHING;


INSERT INTO pays (nom)
VALUES
    ('Japon'),
    ('Russie'),
    ('Chine')
ON CONFLICT DO NOTHING;