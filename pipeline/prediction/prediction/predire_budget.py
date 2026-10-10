from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression

BASE = Path(__file__).resolve().parent.parent
OUTPUT = BASE/"output"
df = pd.read_csv(OUTPUT/"dataset_ml.csv").sort_values(["annee","mois"]).reset_index(drop=True)

ANNEE_REFERENCE = int(df["annee"].max())
ANNEE_PREDICTION = ANNEE_REFERENCE+1
dernier = df[df["annee"]==ANNEE_REFERENCE].sort_values("mois").copy()
if len(dernier)!=12: raise ValueError(f"L'exercice {ANNEE_REFERENCE} doit contenir 12 mois.")

config = {
    "ventes":(["index_temps","mois_sin","mois_cos","ventes_lag_12"],"ventes"),
    "ca_export":(["index_temps","mois_sin","mois_cos","ca_export_lag_12"],"ca_export"),
    "production_reelle":(["index_temps","mois_sin","mois_cos","production_lag_12"],"production_reelle"),
    "charges_exploitation":(["index_temps","mois_sin","mois_cos","charges_lag_12"],"charges_exploitation"),
    "frais_export":(["index_temps","mois_sin","mois_cos","frais_export_lag_12"],"frais_export"),
    "masse_salariale":(["index_temps","mois_sin","mois_cos","masse_salariale_lag_12"],"masse_salariale")
}

print("="*80)
print(f"SXMXDX - BUDGET PREVISIONNEL {ANNEE_PREDICTION}")
print("="*80)

futur = pd.DataFrame({"annee":[ANNEE_PREDICTION]*12,"mois":range(1,13)})
futur["index_temps"] = np.arange(int(df["index_temps"].max())+1,int(df["index_temps"].max())+13)
futur["mois_sin"] = np.sin(2*np.pi*futur["mois"]/12)
futur["mois_cos"] = np.cos(2*np.pi*futur["mois"]/12)

for cible,(features,source) in config.items():
    lag = features[-1]
    futur[lag] = dernier[source].to_numpy()
    train = df[[cible]+features].dropna()
    if train.empty: raise ValueError(f"Données insuffisantes : {cible}")
    modele = LinearRegression().fit(train[features],train[cible])
    futur[cible] = np.maximum(modele.predict(futur[features]),0)

futur["resultat_operationnel"] = futur["ca_export"]-futur["charges_exploitation"]-futur["frais_export"]-futur["masse_salariale"]
futur["marge_operationnelle"] = futur["resultat_operationnel"]/futur["ca_export"].replace(0,np.nan)

def evolution(nouveau,ancien): return ((nouveau-ancien)/ancien*100) if ancien else np.nan

annuel = {
    "annee":ANNEE_PREDICTION,"type_budget":"PREVISIONNEL","statut":"GENERE",
    "ventes":futur["ventes"].sum(),"ca_export":futur["ca_export"].sum(),
    "production":futur["production_reelle"].sum(),"charges_exploitation":futur["charges_exploitation"].sum(),
    "frais_export":futur["frais_export"].sum(),"masse_salariale":futur["masse_salariale"].sum(),
    "resultat_operationnel":futur["resultat_operationnel"].sum()
}

annuel["marge_operationnelle"] = annuel["resultat_operationnel"]/annuel["ca_export"] if annuel["ca_export"] else 0
annuel["evolution_ventes_pct"] = evolution(annuel["ventes"],dernier["ventes"].sum())
annuel["evolution_ca_pct"] = evolution(annuel["ca_export"],dernier["ca_export"].sum())
annuel["evolution_production_pct"] = evolution(annuel["production"],dernier["production_reelle"].sum())
annuel["evolution_charges_pct"] = evolution(annuel["charges_exploitation"],dernier["charges_exploitation"].sum())
annuel["evolution_frais_export_pct"] = evolution(annuel["frais_export"],dernier["frais_export"].sum())
annuel["evolution_masse_salariale_pct"] = evolution(annuel["masse_salariale"],dernier["masse_salariale"].sum())

annuel = pd.DataFrame([annuel])
mensuel_file = OUTPUT/f"prediction_budget_{ANNEE_PREDICTION}_mensuel.csv"
annuel_file = OUTPUT/f"prediction_budget_{ANNEE_PREDICTION}_annuel.csv"

futur.to_csv(mensuel_file,index=False)
annuel.to_csv(annuel_file,index=False)

pd.set_option("display.float_format",lambda x:f"{x:,.2f}")
print("\nPREVISION MENSUELLE")
print(futur[["mois","ventes","ca_export","production_reelle","charges_exploitation","frais_export","masse_salariale","resultat_operationnel"]].to_string(index=False))
print("\nSYNTHESE ANNUELLE")
print(annuel.to_string(index=False))
print(f"\n[OK] {mensuel_file}")
print(f"[OK] {annuel_file}")