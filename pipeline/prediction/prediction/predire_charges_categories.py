from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from database import get_connection

BASE = Path(__file__).resolve().parent.parent
OUTPUT = BASE/"output"
dataset = pd.read_csv(OUTPUT/"dataset_ml.csv")
ANNEE_REFERENCE = int(dataset["annee"].max())
ANNEE_PREDICTION = ANNEE_REFERENCE+1
budget = pd.read_csv(OUTPUT/f"prediction_budget_{ANNEE_PREDICTION}_mensuel.csv").sort_values("mois")
SORTIE = OUTPUT/f"prediction_charges_categories_{ANNEE_PREDICTION}.csv"

connexion = get_connection()
sql = """
WITH dernier_import AS (
    SELECT DISTINCT ON (i.exercice_id)
           i.id AS import_id, i.exercice_id, e.annee
    FROM import_fichier i
    JOIN exercice e ON e.id=i.exercice_id
    ORDER BY i.exercice_id, i.date_import DESC, i.id DESC
)
SELECT di.annee, c.mois_id AS mois, UPPER(TRIM(c.categorie)) AS categorie,
       SUM(COALESCE(c.montant,0)) AS montant
FROM dernier_import di
JOIN charge c ON c.import_id=di.import_id AND c.exercice_id=di.exercice_id
WHERE UPPER(TRIM(COALESCE(c.categorie,''))) <> 'ADMINISTRATION'
GROUP BY di.annee,c.mois_id,UPPER(TRIM(c.categorie))
ORDER BY di.annee,c.mois_id,categorie
"""
charges = pd.read_sql(sql,connexion)
connexion.close()

charges["montant"] = pd.to_numeric(charges["montant"],errors="coerce")
charges = charges.sort_values(["categorie","annee","mois"]).reset_index(drop=True)
annee_min = int(charges["annee"].min())
charges["index_temps"] = (charges["annee"]-annee_min)*12+charges["mois"]-1
charges["mois_sin"] = np.sin(2*np.pi*charges["mois"]/12)
charges["mois_cos"] = np.cos(2*np.pi*charges["mois"]/12)
charges["montant_lag_12"] = charges.groupby("categorie")["montant"].shift(12)

resultats = []
for categorie in sorted(charges["categorie"].dropna().unique()):
    hist = charges[charges["categorie"]==categorie].copy()
    train = hist.dropna(subset=["montant","montant_lag_12"])
    reference = hist[hist["annee"]==ANNEE_REFERENCE].sort_values("mois")
    if train.empty or len(reference)!=12:
        print(f"[IGNORÉ] {categorie} : historique insuffisant")
        continue

    features = ["index_temps","mois_sin","mois_cos","montant_lag_12"]
    modele = LinearRegression().fit(train[features],train["montant"])

    futur = pd.DataFrame({"annee":[ANNEE_PREDICTION]*12,"mois":range(1,13)})
    futur["index_temps"] = np.arange(int(hist["index_temps"].max())+1,int(hist["index_temps"].max())+13)
    futur["mois_sin"] = np.sin(2*np.pi*futur["mois"]/12)
    futur["mois_cos"] = np.cos(2*np.pi*futur["mois"]/12)
    futur["montant_lag_12"] = reference["montant"].to_numpy()
    futur["categorie"] = categorie
    futur["production_prevue"] = budget["production_reelle"].to_numpy()
    futur["charge_prevue"] = np.maximum(modele.predict(futur[features]),0)
    resultats.append(futur[["annee","mois","categorie","production_prevue","charge_prevue"]])

if not resultats: raise ValueError("Aucune prévision par catégorie.")
resultat = pd.concat(resultats,ignore_index=True)
resultat.to_csv(SORTIE,index=False)

print("\nSYNTHESE PAR CATEGORIE")
print(resultat.groupby("categorie")["charge_prevue"].sum().to_string())
print(f"\n[OK] {SORTIE}")