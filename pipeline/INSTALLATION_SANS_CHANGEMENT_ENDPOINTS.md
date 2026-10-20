# SOMIDA — intégration sans modification des endpoints

## Endpoints conservés (Flask)
- `GET /health`
- `POST /import` — JSON avec `filePath` (le champ `annee` éventuellement envoyé reste inchangé)
- `POST /api/budgets/generer`
- `POST /api/predictions/generer`

Aucun contrôleur Spring Boot ni composant Next.js n'a été modifié.

## Installation
1. Sauvegarder le dossier `pipeline` en place.
2. Copier le dossier `pipeline/` de cette archive dans le projet **en préservant le reste du projet**.
3. Vérifier les variables `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` dans le conteneur Spark.
4. Exécuter **une seule fois** `pipeline/migration_amortissements.sql` dans la base de test PostgreSQL avant d'importer.
5. Reconstruire le service Spark seulement si le dossier pipeline est copié dans l'image Docker (`docker compose up -d --build sparkSimp`).
6. Tester l'importation avec un fichier de test et contrôler `SELECT COUNT(*) FROM amortissement_mensuel WHERE import_id = <id>;`.

## Fonctionnement
L'import existant exécute le Reverse Engineering V2, extrait les CSV, lance les cinq normaliseurs Spark historiques, normalise puis charge les amortissements (transaction SQL), et effectue la validation existante.

## Limites importantes
- Les normaliseurs historiques des exportations, charges, production, employés et frais export **n'ont pas été validés** sur la nouvelle structure Excel ; un import complet peut échouer avant le chargement des amortissements.
- La table d'amortissements n'est pas encore prise en compte dans les calculs de résultat du moteur budgétaire.
- Les scripts RE V2 n'ont pas été testés de bout en bout en Docker dans cette livraison.
- Ce ZIP n'inclut pas ton backend Spring Boot, le frontend Next.js ni le fichier docker-compose.
- Ne pas appliquer sur la base de production avant un test intégral.
