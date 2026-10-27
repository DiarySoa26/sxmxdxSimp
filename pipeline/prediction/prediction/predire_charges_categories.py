# from pathlib import Path
# import numpy as np
# import pandas as pd
# from modeles import prevoir_categories
# from database import get_connection

# BASE = Path(__file__).resolve().parent.parent
# OUTPUT = BASE/"output"
# dataset = pd.read_csv(OUTPUT/"dataset_ml.csv")
# ANNEE_REFERENCE = int(dataset["annee"].max())
# ANNEE_PREDICTION = ANNEE_REFERENCE+1
# budget = pd.read_csv(OUTPUT/f"prediction_budget_{ANNEE_PREDICTION}_mensuel.csv").sort_values("mois")
# SORTIE = OUTPUT/f"prediction_charges_categories_{ANNEE_PREDICTION}.csv"

# connexion = get_connection()
# sql = """
# WITH dernier_import AS (
#     SELECT DISTINCT ON (i.exercice_id)
#            i.id AS import_id, i.exercice_id, e.annee
#     FROM import_fichier i
#     JOIN exercice e ON e.id=i.exercice_id
#     ORDER BY i.exercice_id, i.date_import DESC, i.id DESC
# )
# SELECT di.annee, c.mois_id AS mois, UPPER(TRIM(c.categorie)) AS categorie,
#        SUM(COALESCE(c.montant,0)) AS montant
# FROM dernier_import di
# JOIN charge c ON c.import_id=di.import_id AND c.exercice_id=di.exercice_id
# WHERE UPPER(TRIM(COALESCE(c.categorie,''))) <> 'ADMINISTRATION'
# GROUP BY di.annee,c.mois_id,UPPER(TRIM(c.categorie))
# ORDER BY di.annee,c.mois_id,categorie
# """
# charges = pd.read_sql(sql,connexion)
# connexion.close()

# charges["montant"] = pd.to_numeric(charges["montant"],errors="coerce")
# charges = charges.sort_values(["categorie","annee","mois"]).reset_index(drop=True)

# resultat,choix = prevoir_categories(charges,budget,ANNEE_REFERENCE)
# for cat,modele in choix.items(): print(f"[MODELE] {cat:15s} -> {modele}")

# resultat.to_csv(SORTIE,index=False)

# print("\nSYNTHESE PAR CATEGORIE")
# print(resultat.groupby("categorie")["charge_prevue"].sum().to_string())
# print(f"\n[OK] {SORTIE}")






from pathlib import Path
import numpy as np
import pandas as pd

from modeles import prevoir_categories
from database import get_connection

BASE = Path(__file__).resolve().parent.parent
OUTPUT = BASE / "output"

dataset = pd.read_csv(OUTPUT / "dataset_ml.csv")

ANNEE_REFERENCE = int(dataset["annee"].max())
ANNEE_PREDICTION = ANNEE_REFERENCE + 1

budget = (
    dataset[dataset["annee"] == ANNEE_REFERENCE]
    .sort_values("mois")
    .copy()
)

SORTIE = OUTPUT / (
    f"prediction_charges_categories_{ANNEE_PREDICTION}.csv"
)

connexion = get_connection()

sql = """
WITH dernier_import AS (
    SELECT DISTINCT ON (i.exercice_id)
           i.id AS import_id,
           i.exercice_id,
           e.annee
    FROM import_fichier i
    JOIN exercice e
        ON e.id = i.exercice_id
    ORDER BY
        i.exercice_id,
        i.date_import DESC,
        i.id DESC
)
SELECT
    di.annee,
    c.mois_id AS mois,
    UPPER(TRIM(c.categorie)) AS categorie,
    SUM(COALESCE(c.montant, 0)) AS montant
FROM dernier_import di
JOIN charge c
    ON c.import_id = di.import_id
   AND c.exercice_id = di.exercice_id
WHERE UPPER(TRIM(COALESCE(c.categorie, ''))) <> 'ADMINISTRATION'
GROUP BY
    di.annee,
    c.mois_id,
    UPPER(TRIM(c.categorie))
ORDER BY
    di.annee,
    c.mois_id,
    categorie
"""

try:
    charges = pd.read_sql(sql, connexion)
finally:
    connexion.close()

charges["montant"] = pd.to_numeric(
    charges["montant"],
    errors="coerce"
)

charges = (
    charges.sort_values(
        ["categorie", "annee", "mois"]
    )
    .reset_index(drop=True)
)

resultat, choix = prevoir_categories(
    charges,
    budget,
    ANNEE_REFERENCE
)

for categorie, modele in choix.items():
    print(
        f"[MODELE] {categorie:15s} -> {modele}"
    )

resultat.to_csv(SORTIE, index=False)

print("\nSYNTHESE PAR CATEGORIE")

print(
    resultat.groupby("categorie")["charge_prevue"]
    .sum()
    .to_string()
)

print(f"\n[OK] {SORTIE}")
