# Amélioration de la prédiction budgétaire 2026 — rapport

## 1. Ce que les outputs montraient

| Constat dans les outputs | Cause |
|---|---|
| R² négatifs (jusqu'à −24) et MAPE de 8 à 29 % | Le modèle appliquait une **tendance linéaire** (`index_temps`) à des séries qui n'ont pas de tendance : l'activité fait des sauts annuels (+6 %, −7 %, +16 %, −14 %, +7 %) que la droite extrapole mal. |
| Masse salariale : MAPE 29 %, R² = 0 | Série « en escalier » (12 mois identiques par an) : une régression mensuelle n'a aucun sens dessus. |
| Un seul test (2025) | 12 points, une seule année : métrique instable et R² peu informatif (variance intra-annuelle ≈ 3 %). |
| Toutes les dérives « FAIBLE » | La charge attendue et la charge prévue viennent du même historique : l'écart dépasse rarement 1 σ. |
| **2024 = 2022 et 2025 = 2021, valeur pour valeur** (ventes, CA, production, charges, frais) | Probable copie / double import. Les modèles apprennent et sont évalués sur des années dupliquées. **À vérifier à la source.** |

## 2. Ce qui a été changé

- **Nouveau modèle** (`prediction/modeles.py`) : prévision = *niveau annuel lissé (EWM)* × *profil saisonnier atténué de moitié*. La saisonnalité (~2 %) est plus faible que le bruit (~3 %) : on ne la sur-ajuste plus.
- **Backtest glissant** sur toutes les années (2022→2025) au lieu d'une seule ; l'alpha de lissage est choisi **par cible**.
- **Masse salariale** : reconduction de la dernière année (modèle imposé, justifié dans le code ; les recrutements/revalorisations doivent être ajoutés comme hypothèses).
- **Catégories** : même méthode, puis **réconciliation** sur le total des charges du budget (somme des catégories = total, mois par mois).
- **Fourchettes à ~80 %** (`prediction_budget_2026_intervalles.csv`) déduites de l'erreur annuelle observée.
- **Alerte qualité** (`alertes_qualite_donnees.txt`) quand deux années sont strictement identiques.
- `metriques_modeles.csv` garde ses colonnes d'origine et ajoute la comparaison ancien/nouveau modèle.
- Schémas des CSV de budget **inchangés** → `enregistrer_prediction.py` fonctionne sans modification.

## 3. Résultats (erreur annuelle moyenne, backtest 2022→2025)

| Cible | Ancien modèle | Nouveau modèle | Modèle retenu |
|---|---|---|---|
| Ventes | 5,9 % | **2,3 %** | EWM 0,5 |
| CA export | 12,7 % | **5,7 %** | EWM 0,2 |
| Production | 8,5 % | **3,3 %** | EWM 0,3 |
| Charges d'exploitation | 12,4 % | **4,7 %** | EWM 0,2 |
| Frais d'export | 10,6 % | **4,2 %** | EWM 0,2 |
| Masse salariale | 59,0 % | **14,7 %** | Reconduction |

## 4. Budget 2026 : avant → après

| Indicateur | Avant | Après | Fourchette 80 % (après) |
|---|---|---|---|
| Ventes (unités) | 3 159,9 | 3 146,8 | 3 028 – 3 265 |
| CA export (MGA) | 18,775 Md | 18,543 Md | 16,91 – 20,18 Md |
| Charges d'exploitation | 5,644 Md | 5,498 Md | 5,05 – 5,95 Md |
| Frais d'export | 3,251 Md | 3,192 Md | 2,97 – 3,42 Md |
| Masse salariale | 4,349 Md | 4,016 Md | 3,21 – 4,82 Md |
| Résultat opérationnel | 5,531 Md | 5,837 Md | 4,88 – 6,79 Md |

## 5. Limites et à faire

1. **Vérifier les années dupliquées** (2024/2022, 2025/2021). Tant que ce n'est pas corrigé, toutes les métriques sont à prendre avec prudence.
2. Le choix de l'alpha est fait sur 4 plis seulement : il est légèrement optimiste. L'écart avec l'ancien modèle (×2 à ×4) est toutefois bien supérieur à ce biais.
3. Les fichiers **catégories, dérives et résumé** dépendent de PostgreSQL et n'ont pas pu être régénérés ici. Les anciennes versions sont dans `output/avant_amelioration/`. Lancer `python executer_prediction.py` pour tout recalculer et réenregistrer en base.
4. Les dérives resteront majoritairement « FAIBLE » tant que la détection compare deux estimations issues du même historique ; un seuil calibré sur des écarts réels passés (budget vs réalisé) serait la prochaine étape.
