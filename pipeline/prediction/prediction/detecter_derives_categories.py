"""
SXMXDX - Détection des dérives de charges (étape 6).

Pour chaque catégorie, une régression charge = a × production + b est
ajustée sur ses 5 dernières années (relation coût / activité récente). La
charge « attendue » pour N+1 est déduite de la production PRÉVUE (étape 5)
puis comparée à la charge prévue par catégorie (étape 4).

    écart = prévue - attendue ; z = écart / σ (dispersion habituelle)
    |z| < 1 FAIBLE, < 2 MODERE, < 3 ELEVE, sinon CRITIQUE

Entrées : dataset_ml.csv, charges_categories_historique.csv,
          prediction_charges_categories_<N+1>.csv, prediction_budget_<N+1>_mensuel.csv
Sortie  : derives_categories_<N+1>.csv
"""
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression

BASE = Path(__file__).resolve().parent.parent
OUTPUT = BASE / "output"
ANNEES_RELATION = 5

dataset = pd.read_csv(OUTPUT / "dataset_ml.csv")
ANNEE_PREDICTION = int(dataset["annee"].max()) + 1

prediction = pd.read_csv(OUTPUT / f"prediction_charges_categories_{ANNEE_PREDICTION}.csv")
budget = pd.read_csv(OUTPUT / f"prediction_budget_{ANNEE_PREDICTION}_mensuel.csv")
charges = pd.read_csv(OUTPUT / "charges_categories_historique.csv")
SORTIE = OUTPUT / f"derives_categories_{ANNEE_PREDICTION}.csv"

prediction = prediction.drop(columns=["production_prevue"], errors="ignore").merge(
    budget[["mois", "production_reelle"]].rename(columns={"production_reelle": "production_prevue"}),
    on="mois", how="left",
)
historique = charges.merge(dataset[["annee", "mois", "production_reelle"]], on=["annee", "mois"], how="inner")


def niveau(score):
    score = abs(score)
    if score < 1:
        return "FAIBLE"
    if score < 2:
        return "MODERE"
    if score < 3:
        return "ELEVE"
    return "CRITIQUE"


resultats = []
for categorie in sorted(prediction["categorie"].unique()):
    hist = historique[historique["categorie"] == categorie].dropna()
    annees = sorted(hist["annee"].unique())[-ANNEES_RELATION:]
    hist = hist[hist["annee"].isin(annees)]
    futur = prediction[prediction["categorie"] == categorie].sort_values("mois").copy()
    if len(hist) < 3 or futur.empty:
        continue

    modele = LinearRegression().fit(hist[["production_reelle"]], hist["montant"])
    residus = hist["montant"].to_numpy() - modele.predict(hist[["production_reelle"]])
    ecart_type = float(np.std(residus, ddof=1))

    X = futur[["production_prevue"]].rename(columns={"production_prevue": "production_reelle"})
    futur["charge_attendue"] = np.maximum(modele.predict(X), 0)
    futur["ecart_mga"] = futur["charge_prevue"] - futur["charge_attendue"]
    futur["ecart_pct"] = np.where(futur["charge_attendue"] != 0,
                                  futur["ecart_mga"] / futur["charge_attendue"] * 100, np.nan)
    futur["score_derive"] = futur["ecart_mga"] / ecart_type if ecart_type > 0 else 0.0
    futur["indice_derive"] = (1 - np.exp(-np.abs(futur["score_derive"]))) * 100
    futur["niveau_risque"] = futur["score_derive"].apply(niveau)
    futur["type_derive"] = np.select([futur["ecart_mga"] > 0, futur["ecart_mga"] < 0],
                                     ["SURCOUT", "SOUS-CONSOMMATION"], default="NORMAL")
    resultats.append(futur)

if not resultats:
    raise ValueError("Aucune dérive calculée.")
resultat = pd.concat(resultats, ignore_index=True)[[
    "annee", "mois", "categorie", "production_prevue", "charge_prevue", "charge_attendue",
    "ecart_mga", "ecart_pct", "score_derive", "indice_derive", "niveau_risque", "type_derive",
]]
resultat.to_csv(SORTIE, index=False)

pd.set_option("display.float_format", lambda x: f"{x:,.2f}")
print("=" * 80)
print("SYNTHESE DES DERIVES PAR CATEGORIE")
print("=" * 80)
print(resultat.groupby("categorie").agg(
    charge_prevue=("charge_prevue", "sum"), charge_attendue=("charge_attendue", "sum"),
    ecart=("ecart_mga", "sum"), score_max=("score_derive", lambda s: s.abs().max()),
).to_string())
print("\nDISTRIBUTION")
print(resultat["niveau_risque"].value_counts().to_string())
print(f"\n[OK] {SORTIE}")
