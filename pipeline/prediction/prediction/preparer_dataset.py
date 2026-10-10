from pathlib import Path
import numpy as np
import pandas as pd

BASE = Path(__file__).resolve().parent.parent
INPUT = BASE/"output"/"dataset_prediction.csv"
OUTPUT = BASE/"output"/"dataset_ml.csv"

print("="*80)
print("SXMXDX - PREPARATION DATASET ML")
print("="*80)

df = pd.read_csv(INPUT)

requises = ["annee","mois","ventes","ca_export","production_reelle","charges_exploitation",
            "frais_export","masse_salariale","resultat_operationnel","marge_operationnelle"]
manquantes = [c for c in requises if c not in df.columns]
if manquantes: raise ValueError(f"Colonnes manquantes : {manquantes}")

for c in requises: df[c] = pd.to_numeric(df[c],errors="coerce")
df = df.sort_values(["annee","mois"]).reset_index(drop=True)

if df.duplicated(["annee","mois"]).sum(): raise ValueError("Doublons année/mois détectés.")
if not df[df["mois"].between(1,12)==False].empty: raise ValueError("Mois invalides détectés.")

print(f"[OK] Observations : {len(df)}")
print(f"[OK] Période       : {df['annee'].min()} -> {df['annee'].max()}")
print("\nMois par année :")
print(df.groupby("annee")["mois"].nunique())

df["date"] = pd.to_datetime(dict(year=df["annee"],month=df["mois"],day=1))
df["index_temps"] = np.arange(len(df))
df["mois_sin"] = np.sin(2*np.pi*df["mois"]/12)
df["mois_cos"] = np.cos(2*np.pi*df["mois"]/12)

for cible,prefixe in [
    ("ventes","ventes"),("ca_export","ca_export"),("production_reelle","production"),
    ("charges_exploitation","charges"),("frais_export","frais_export"),("masse_salariale","masse_salariale")
]:
    df[f"{prefixe}_lag_1"] = df[cible].shift(1)
    df[f"{prefixe}_lag_12"] = df[cible].shift(12)

df["evolution_ventes"] = df["ventes"].pct_change(fill_method=None)*100
df["evolution_ca"] = df["ca_export"].pct_change(fill_method=None)*100
df["evolution_production"] = df["production_reelle"].pct_change(fill_method=None)*100
df["evolution_charges"] = df["charges_exploitation"].pct_change(fill_method=None)*100
df["charges_par_unite"] = df["charges_exploitation"]/df["production_reelle"].replace(0,np.nan)


df.to_csv(OUTPUT,index=False)
print(f"\n[OK] Colonnes : {len(df.columns)}")
print(f"[OK] Dataset ML : {OUTPUT}")