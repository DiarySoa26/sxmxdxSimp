from pathlib import Path
import numpy as np
import pandas as pd
from modeles import choisir_modele, prevoir, backtest_resultat, borne_80

BASE = Path(__file__).resolve().parent.parent
OUTPUT = BASE/"output"
df = pd.read_csv(OUTPUT/"dataset_ml.csv").sort_values(["annee","mois"]).reset_index(drop=True)

ANNEE_REFERENCE = int(df["annee"].max())
ANNEE_PREDICTION = ANNEE_REFERENCE+1
dernier = df[df["annee"]==ANNEE_REFERENCE].sort_values("mois").copy()
if len(dernier)!=12: raise ValueError(f"L'exercice {ANNEE_REFERENCE} doit contenir 12 mois.")

# cible -> nom de la colonne lag_12 conservée dans le fichier de sortie (compatibilité)
config = {
    "ventes":"ventes_lag_12",
    "ca_export":"ca_export_lag_12",
    "production_reelle":"production_lag_12",
    "charges_exploitation":"charges_lag_12",
    "frais_export":"frais_export_lag_12",
    "masse_salariale":"masse_salariale_lag_12"
}

print("="*80)
print(f"SXMXDX - BUDGET PREVISIONNEL {ANNEE_PREDICTION}")
print("="*80)

futur = pd.DataFrame({"annee":[ANNEE_PREDICTION]*12,"mois":range(1,13)})
futur["index_temps"] = np.arange(int(df["index_temps"].max())+1,int(df["index_temps"].max())+13)
futur["mois_sin"] = np.sin(2*np.pi*futur["mois"]/12)
futur["mois_cos"] = np.cos(2*np.pi*futur["mois"]/12)

choix = {}
for cible,lag in config.items():
    futur[lag] = dernier[cible].to_numpy()
    choix[cible] = choisir_modele(df,cible)
    futur[cible] = prevoir(df,cible,futur["mois"],choix[cible]["alpha"])
    print(f"[MODELE] {cible:22s} -> {choix[cible]['modele']}")

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

# --- Fourchettes indicatives (~80 %) déduites de l'erreur annuelle observée en backtest ---
erreurs_resultat = backtest_resultat(df,{c:m["alpha"] for c,m in choix.items() if c in
                                         ["ca_export","charges_exploitation","frais_export","masse_salariale"]})
rms_resultat = float(np.sqrt(np.mean(np.square(erreurs_resultat)))) if erreurs_resultat else np.nan
lignes = []
for cible,valeur in [("ventes",annuel["ventes"]),("ca_export",annuel["ca_export"]),("production_reelle",annuel["production"]),
                     ("charges_exploitation",annuel["charges_exploitation"]),("frais_export",annuel["frais_export"]),
                     ("masse_salariale",annuel["masse_salariale"]),("resultat_operationnel",annuel["resultat_operationnel"])]:
    rms = rms_resultat if cible=="resultat_operationnel" else (choix[cible]["eval"] or {}).get("ecart_annuel_rms",np.nan)
    bas,haut = borne_80(valeur,rms) if pd.notna(rms) else (np.nan,np.nan)
    if cible=="resultat_operationnel" and pd.notna(bas) and bas>haut: bas,haut = haut,bas
    lignes.append({"annee":ANNEE_PREDICTION,"indicateur":cible,"prevision_annuelle":valeur,
                   "borne_basse_80":bas,"borne_haute_80":haut,"erreur_typique_pct":rms,
                   "modele":choix[cible]["modele"] if cible in choix else "COMBINAISON"})
intervalles = pd.DataFrame(lignes)

annuel = pd.DataFrame([annuel])
mensuel_file = OUTPUT/f"prediction_budget_{ANNEE_PREDICTION}_mensuel.csv"
annuel_file = OUTPUT/f"prediction_budget_{ANNEE_PREDICTION}_annuel.csv"
intervalles_file = OUTPUT/f"prediction_budget_{ANNEE_PREDICTION}_intervalles.csv"

futur.to_csv(mensuel_file,index=False)
annuel.to_csv(annuel_file,index=False)
intervalles.to_csv(intervalles_file,index=False)

pd.set_option("display.float_format",lambda x:f"{x:,.2f}")
pd.set_option("display.width",250)
print("\nPREVISION MENSUELLE")
print(futur[["mois","ventes","ca_export","production_reelle","charges_exploitation","frais_export","masse_salariale","resultat_operationnel"]].to_string(index=False))
print("\nSYNTHESE ANNUELLE")
print(annuel.to_string(index=False))
print("\nFOURCHETTES INDICATIVES (~80 %, d'après l'erreur annuelle en backtest)")
print(intervalles.to_string(index=False))
print(f"\n[OK] {mensuel_file}\n[OK] {annuel_file}\n[OK] {intervalles_file}")
