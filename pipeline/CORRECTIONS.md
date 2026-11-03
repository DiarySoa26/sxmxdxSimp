# SXMXDX - Corrections des points d'attention (03/11/2026)

Aucun endpoint, contrôleur Spring Boot ni composant Next.js n'est modifié.
Le point 6 (validation du budget contre la feuille Synthese) n'est pas traité.

| # | Problème | Correction | Fichiers |
|---|---|---|---|
| 1 | La prédiction pouvait utiliser un import en ERREUR | La CTE `dernier_import` ne retient que les imports `PRET_GENERATION` | `prediction/construire_dataset.py`, `prediction/prediction/predire_charges_categories.py`, `prediction/prediction/detecter_derives_categories.py` |
| 2 | Connexions par défaut différentes (`localhost:5434/sxmxdx5` vs `postgres:5432/sxmxdx5`) | Nouveau module unique `pipeline/config_db.py` (variables `DB_*`, `JDBC_URL`) utilisé partout | `config_db.py` (nouveau), `prediction/prediction/database.py`, `prediction/enregistrer_prediction.py`, `importation/creer_import.py`, `validation/valider_import.py`, `transformation/normaliser_*.py` (5 scripts Spark) |
| 3 | Le budget cherchait les règles RE dans `output/reverse_engineering/` au lieu du dossier de l'import | `verifier_regles_re(import_id)` lit `output/reverse_engineering/import_<id>/regles_executables.json` (chemin absolu) ; contrôle ignoré si `SOMIDA_REVERSE_ENGINEERING=0` ; appel déplacé après la sélection de l'import | `budget/moteur_regles.py`, `budget/generer_budget.py` |
| 4 | Un import en échec laissait des lignes partielles en base | `marquer_import_erreur()` supprime les lignes de l'import (exportation, production, charge, frais_export, employe, amortissement_mensuel) puis passe le statut à ERREUR, dans la même transaction | `importation/importer_exercice.py` |
| 5 | Connexion écrite en dur dans le budget | `DB_CONFIG` importé de `config_db.py` | `budget/generer_budget.py`, `budget/historique_budgets.py` |
| 7 | Logs « ETAPE 12/11 » | `TOTAL_ETAPES = 12` | `importation/importer_exercice.py` |

## Après déploiement

1. Copier le dossier `pipeline/` (il contient le nouveau fichier `config_db.py`).
2. Définir `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` dans le conteneur `sparkSimp` (sinon : `postgres:5432/sxmxdx5`).
3. Les imports déjà en base avant cette version sans dossier `output/reverse_engineering/import_<id>/` doivent être réimportés avant de générer leur budget.
4. Les lignes orphelines d'anciens imports en ERREUR ne sont pas supprimées rétroactivement :
   `DELETE FROM <table> WHERE import_id IN (SELECT id FROM import_fichier WHERE statut = 'ERREUR');`
   pour chaque table de données (à exécuter après vérification).
