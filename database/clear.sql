BEGIN;

-- 1. Supprimer les budgets
DELETE FROM budget
WHERE exercice_id = 23;

-- 2. Supprimer les campagnes budgétaires
DELETE FROM campagne_budgetaire
WHERE exercice_id = 23;

-- 3. Supprimer les exportations
DELETE FROM exportation
WHERE exercice_id = 23;

-- 4. Supprimer la production
DELETE FROM production
WHERE exercice_id = 23;

-- 5. Supprimer les charges
DELETE FROM charge
WHERE exercice_id = 23;

-- 6. Supprimer les frais d'exportation
DELETE FROM frais_export
WHERE exercice_id = 23;

-- 7. Supprimer les fichiers importés
DELETE FROM import_fichier
WHERE exercice_id = 23;

-- 8. Supprimer l'exercice 2021
DELETE FROM exercice
WHERE id = 23
  AND annee = 2021;

COMMIT;















BEGIN;

-- 1. Supprimer les budgets
DELETE FROM budget
WHERE import_id = 31;

-- 2. Supprimer les campagnes budgétaires
DELETE FROM charge
WHERE import_id = 31;

-- 3. Supprimer les exportations
DELETE FROM exportation
WHERE import_id = 31;

-- 4. Supprimer la production
DELETE FROM production
WHERE import_id = 31;

-- 6. Supprimer les frais d'exportation
DELETE FROM frais_export
WHERE import_id = 31;

DELETE FROM employe
WHERE import_id = 31;

DELETE FROM amortissement_mensuel
WHERE import_id = 31;





DELETE FROM jalon_budgetaire
WHERE campagne_id = 7;


DELETE FROM campagne_budgetaire
WHERE exercice_id = 33;


DELETE FROM import_fichier
WHERE exercice_id = 33;

DELETE FROM exercice
WHERE id = 33;