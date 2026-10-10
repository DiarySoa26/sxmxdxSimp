from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from database import get_connection

BASE = Path(__file__).resolve().parent.parent
OUTPUT = BASE/"output"
dataset = pd.read_csv(OUTPUT/"dataset_ml.csv")
ANNEE_PREDICTION = int(dataset["annee"].max())+1
prediction = pd.read_csv(OUTPUT/f"prediction_charges_categories_{ANNEE_PREDICTION}.csv")
SORTIE = OUTPUT/f"derives_categories_{ANNEE_PREDICTION}.csv"

connexion = get_connection()
CTE = """
WITH dernier_import AS (
    SELECT DISTINCT ON (i.exercice_id) i.id AS import_id,i.exercice_id,e.annee
    FROM import_fichier i JOIN exercice e ON e.id=i.exercice_id
    ORDER BY i.exercice_id,i.date_import DESC,i.id DESC
)
"""

charges = pd.read_sql(CTE+"""
SELECT di.annee,c.mois_id AS mois,UPPER(TRIM(c.categorie)) AS categorie,
       SUM(COALESCE(c.montant,0)) AS montant
FROM dernier_import di
JOIN charge c ON c.import_id=di.import_id AND c.exercice_id=di.exercice_id
WHERE UPPER(TRIM(COALESCE(c.categorie,''))) <> 'ADMINISTRATION'
GROUP BY di.annee,c.mois_id,UPPER(TRIM(c.categorie))
""",connexion)

production = pd.read_sql(CTE+"""
SELECT di.annee,p.mois_id AS mois,SUM(COALESCE(p.production_reelle,0)) AS production_reelle
FROM dernier_import di
JOIN production p ON p.import_id=di.import_id AND p.exercice_id=di.exercice_id
GROUP BY di.annee,p.mois_id
""",connexion)
connexion.close()

historique = charges.merge(production,on=["annee","mois"],how="inner")
resultats = []

def niveau(score):
    score=abs(score)
    if score<1:return "FAIBLE"
    if score<2:return "MODERE"
    if score<3:return "ELEVE"
    return "CRITIQUE"

for categorie in sorted(prediction["categorie"].unique()):
    hist = historique[historique["categorie"]==categorie].dropna()
    futur = prediction[prediction["categorie"]==categorie].sort_values("mois").copy()
    if len(hist)<3 or futur.empty: continue

    modele = LinearRegression().fit(hist[["production_reelle"]],hist["montant"])
    residus = hist["montant"].to_numpy()-modele.predict(hist[["production_reelle"]])
    ecart_type = np.std(residus,ddof=1)

    X = futur[["production_prevue"]].rename(columns={"production_prevue":"production_reelle"})
    futur["charge_attendue"] = np.maximum(modele.predict(X),0)
    futur["ecart_mga"] = futur["charge_prevue"]-futur["charge_attendue"]
    futur["ecart_pct"] = np.where(futur["charge_attendue"]!=0,futur["ecart_mga"]/futur["charge_attendue"]*100,np.nan)
    futur["score_derive"] = futur["ecart_mga"]/ecart_type if pd.notna(ecart_type) and ecart_type>0 else 0
    futur["indice_derive"] = (1-np.exp(-np.abs(futur["score_derive"])))*100
    futur["niveau_risque"] = futur["score_derive"].apply(niveau)
    futur["type_derive"] = np.select([futur["ecart_mga"]>0,futur["ecart_mga"]<0],["SURCOUT","SOUS-CONSOMMATION"],default="NORMAL")
    resultats.append(futur)

if not resultats: raise ValueError("Aucune dérive calculée.")
resultat = pd.concat(resultats,ignore_index=True)
resultat.to_csv(SORTIE,index=False)

synthese = resultat.groupby("categorie").agg(
    charge_prevue_annuelle=("charge_prevue","sum"),charge_attendue_annuelle=("charge_attendue","sum"),
    ecart_total_mga=("ecart_mga","sum"),indice_moyen=("indice_derive","mean"),indice_max=("indice_derive","max")
).reset_index()
synthese["ecart_annuel_pct"] = np.where(synthese["charge_attendue_annuelle"]!=0,synthese["ecart_total_mga"]/synthese["charge_attendue_annuelle"]*100,np.nan)

print("\n"+"="*80)
print("SYNTHESE PAR CATEGORIE")
print("="*80)
print(synthese.to_string(index=False))
print("\nDISTRIBUTION")
print(resultat["niveau_risque"].value_counts())
print(f"\n[OK] {SORTIE}")