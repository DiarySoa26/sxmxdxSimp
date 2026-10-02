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