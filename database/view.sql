CREATE OR REPLACE VIEW view_journal_connexion AS
SELECT
    j.id AS journal_id,
    u.id AS utilisateur_id,
    u.nom,
    u.prenom,
    u.email,
    r.nom AS role,
    j.date_connexion,
    j.succes
FROM journal_connexion j
JOIN utilisateur u ON u.id = j.utilisateur_id
LEFT JOIN role r ON r.id = u.role_id;


CREATE OR REPLACE VIEW view_journal_audit AS
SELECT
    j.id,
    j.utilisateur_id,
    u.nom,
    u.prenom,
    u.email,
    r.nom AS role,
    j.action,
    j.module,
    j.description,
    j.entite_type,
    j.entite_id,
    j.statut,
    j.date_action
FROM journal_audit j
LEFT JOIN utilisateur u
    ON u.id = j.utilisateur_id
LEFT JOIN role r
    ON r.id = u.role_id;




CREATE OR REPLACE VIEW view_exercice AS
SELECT
    e.id as id_exercice,
    e.annee as annee_exercice,
    i.*
    FROM exercice e
    JOIN
    import_fichier i ON e.id = i.exercice_id
;


CREATE OR REPLACE VIEW view_exercice_budget AS
SELECT
    ve.id_exercice,
    ve.annee_exercice,
    ve.id as id_import_fichier,
    ve.nom_fichier,
    ve.statut as statut_import_fichier,
    ve.date_import,
    ve.message_erreur,
    b.*
    FROM view_exercice ve
    JOIN
    budget b
    ON ve.id_exercice = b.exercice_id
;



CREATE OR REPLACE VIEW view_budget AS
SELECT
    b.id AS id_budget,

    e.id AS exercice_id,
    e.annee,

    b.import_id,
    i.nom_fichier,

    b.type_budget,
    b.statut,

    b.ca_export,
    b.charges_exploitation,
    b.frais_export,
    b.masse_salariale,

    b.resultat_operationnel,
    b.marge_operationnelle,

    b.annee_reference,
    b.modele,
    b.version_modele,

    b.date_generation

FROM budget b

JOIN exercice e
    ON e.id = b.exercice_id

LEFT JOIN import_fichier i
    ON i.id = b.import_id;




CREATE OR REPLACE VIEW view_charges_mois AS
SELECT c.* , m.nom as nom_mois
FROM charge c
JOIN mois m ON c.mois_id = m.id
;


CREATE OR REPLACE VIEW view_exportations_mois AS
SELECT e.* , m.nom as nom_mois
FROM exportation e
JOIN mois m ON e.mois_id = m.id
;


CREATE OR REPLACE VIEW view_frais_export_mois AS
SELECT e.* , m.nom as nom_mois
FROM frais_export e
JOIN mois m ON e.mois_id = m.id
;


CREATE OR REPLACE VIEW view_production_mois AS
SELECT e.* , m.nom as nom_mois
FROM production e
JOIN mois m ON e.mois_id = m.id
;


CREATE OR REPLACE VIEW view_budget_mensuel_mois AS
SELECT e.* , m.nom as nom_mois
FROM budget_mensuel e
JOIN mois m ON e.mois_id = m.id
;

CREATE OR REPLACE VIEW view_amortissement_mois AS
SELECT c.* , m.nom as nom_mois
FROM amortissement_mensuel c
JOIN mois m ON c.mois = m.id
;


CREATE OR REPLACE VIEW view_campagne_avancement AS
SELECT
    c.id,
    c.nom,
    c.exercice_id,
    c.date_debut,
    c.date_fin,
    c.statut,
    COUNT(j.id) AS total_jalons,
    COUNT(j.id) FILTER (
        WHERE j.statut = 'TERMINE'
    ) AS jalons_termines,
    COUNT(j.id) FILTER (
        WHERE j.statut <> 'TERMINE'
        AND j.date_limite < CURRENT_DATE
    ) AS jalons_en_retard,
    CASE
        WHEN COUNT(j.id) = 0 THEN 0
        ELSE ROUND(
            COUNT(j.id) FILTER (
                WHERE j.statut = 'TERMINE'
            ) * 100.0 / COUNT(j.id),
            2
        )
    END AS progression
FROM campagne_budgetaire c
LEFT JOIN jalon_budgetaire j
    ON j.campagne_id = c.id
GROUP BY c.id;

SELECT *
FROM view_campagne_avancement
ORDER BY date_debut DESC;