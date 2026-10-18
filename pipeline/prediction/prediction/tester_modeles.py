from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from modeles import (CANDIDATS, backtest, choisir_modele, evaluer, prevoir,
                     garder_annees_completes, MIN_ANNEES_ENTRAINEMENT)

BASE = Path(__file__).resolve().parent.parent
INPUT = BASE / "output" / "dataset_ml.csv"
OUTPUT = BASE / "output" / "metriques_modeles.csv"

df = pd.read_csv(INPUT).sort_values(["annee", "mois"]).reset_index(drop=True)
ANNEE_TEST = int(df["annee"].max())

CIBLES = ["ventes", "ca_export", "production_reelle", "charges_exploitation", "frais_export", "masse_salariale"]
PREFIXE_LAG = {"ventes": "ventes", "ca_export": "ca_export", "production_reelle": "production",
               "charges_exploitation": "charges", "frais_export": "frais_export",
               "masse_salariale": "masse_salariale"}


def plis_ancien_modele(cible):
    """Ancien modèle (régression linéaire tendance + saisonnalité + lag 12), mêmes plis, pour comparaison."""
    features = ["index_temps", "mois_sin", "mois_cos", f"{PREFIXE_LAG[cible]}_lag_12"]
    data = df[["annee", "mois", cible] + features].dropna()
    plis = []
    for annee in sorted(garder_annees_completes(df)["annee"].unique())[MIN_ANNEES_ENTRAINEMENT:]:
        train, test = data[data["annee"] < annee], data[data["annee"] == annee].sort_values("mois")
        if train.empty or test.empty:
            continue
        pred = np.maximum(LinearRegression().fit(train[features], train[cible]).predict(test[features]), 0)
        plis.append({"annee": int(annee), "reel": test[cible].to_numpy(), "pred": pred})
    return plis


print("=" * 80)
print(f"SXMXDX - BACKTEST GLISSANT (années testées : {sorted(df['annee'].unique())[MIN_ANNEES_ENTRAINEMENT]} -> {ANNEE_TEST})")
print("=" * 80)

resultats = []
for cible in CIBLES:
    choix = choisir_modele(df, cible)
    if choix["eval"] is None:
        print(f"[IGNORÉ] {cible} : données insuffisantes")
        continue

    # Métriques de la dernière année (comparables à l'ancien fichier de métriques)
    plis = backtest(df, cible, choix["alpha"])
    dernier = plis[-1]
    reel, pred = dernier["reel"], dernier["pred"]
    masque = reel != 0
    ancien = evaluer(plis_ancien_modele(cible))

    resultats.append({
        "cible": cible,
        "mae": mean_absolute_error(reel, pred),
        "rmse": float(np.sqrt(mean_squared_error(reel, pred))),
        "mape_pct": float(np.mean(np.abs((reel[masque] - pred[masque]) / reel[masque])) * 100),
        "r2": r2_score(reel, pred),
        "ecart_annuel_pct": (pred.sum() - reel.sum()) / reel.sum() * 100,
        # --- nouvelles colonnes ---
        "modele": choix["modele"],
        "nb_plis": choix["eval"]["nb_plis"],
        "mape_moy_plis_pct": choix["eval"]["mape_moy"],
        "ecart_annuel_moy_plis_pct": choix["eval"]["ecart_annuel_moy"],
        "ecart_annuel_rms_pct": choix["eval"]["ecart_annuel_rms"],
        "ancien_mape_moy_plis_pct": ancien["mape_moy"] if ancien else np.nan,
        "ancien_ecart_annuel_moy_plis_pct": ancien["ecart_annuel_moy"] if ancien else np.nan,
    })

resultats = pd.DataFrame(resultats)
pd.set_option("display.float_format", lambda x: f"{x:,.2f}")
pd.set_option("display.width", 250)
pd.set_option("display.max_columns", 30)

print("\nCOMPARAISON NOUVEAU vs ANCIEN MODELE (moyenne sur tous les plis)")
print(resultats[["cible", "modele", "nb_plis", "ecart_annuel_moy_plis_pct", "ancien_ecart_annuel_moy_plis_pct",
                 "mape_moy_plis_pct", "ancien_mape_moy_plis_pct"]].to_string(index=False))
print("\nDERNIERE ANNEE ({}) - modèle retenu".format(ANNEE_TEST))
print(resultats[["cible", "mae", "rmse", "mape_pct", "ecart_annuel_pct"]].to_string(index=False))
print("\nNote : le R2 sur 12 mois d'une seule année est peu informatif (la variance intra-annuelle "
      "est de ~3 %) ; l'erreur annuelle et le MAPE sont les indicateurs à suivre.")

resultats.to_csv(OUTPUT, index=False)
print(f"\n[OK] {OUTPUT}")
