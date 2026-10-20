# Intégration Reverse Engineering V2
- 10 scripts V2 installés.
- L'import lance le RE par import et produit les fichiers de règles dans output/reverse_engineering/import_ID.
- 9 feuilles exigées.
- Amortissements normalisés en CSV indépendant dans data/staging/<classeur>/amortissements_normalises.csv.
- Migration PostgreSQL proposée mais **non exécutée**.

## Limites
- Le CSV des amortissements n'est pas encore chargé en PostgreSQL : aucune table n'est créée automatiquement.
- Les règles RE ne sont pas encore utilisées comme code exécutable dans le moteur budgétaire.
- Les autres normaliseurs Spark restent inchangés : leur compatibilité doit être validée en environnement Docker et PostgreSQL.
- Les formules Excel calculées doivent être contrôlées (openpyxl ne recalcule pas les formules).
- Désactivation temporaire RE : SOMIDA_REVERSE_ENGINEERING=0.
