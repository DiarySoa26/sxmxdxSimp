"""
SXMXDX - Test des modèles de régression (étape 3).

Entraînement : toutes les années sauf N (dernière année complète).
Test         : l'année N.
Pour chaque indicateur, chaque fenêtre de régression est entraînée puis
évaluée sur N ; la meilleure est comparée à la reconduction de N-1.
Sorties : output/metriques_modeles.csv (fenêtre retenue par indicateur)
          output/comparaison_fenetres.csv (toutes les fenêtres testées)
"""
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from modeles import choisir_modele, prevoir, separer_train_test

BASE = Path(__file__).resolve().parent.parent
INPUT = BASE / "output" / "dataset_ml.csv"
OUTPUT = BASE / "output" / "metriques_modeles.csv"
OUTPUT_FENETRES = BASE / "output" / "comparaison_fenetres.csv"

CIBLES = ["ventes", "ca_export", "production_reelle", "charges_exploitation",
          "frais_export", "masse_salariale", "amortissements"]

df = pd.read_csv(INPUT).sort_values(["annee", "mois"]).reset_index(drop=True)
train, test, annee_test = separer_train_test(df)
annees_train = sorted(train["annee"].unique())
if not annees_train:
    raise ValueError("Au moins deux années complètes sont nécessaires (une pour entraîner, une pour tester).")

print("=" * 80)
print("SXMXDX - TEST DES RÉGRESSIONS")
print(f"Entraînement : {annees_train[0]} -> {annees_train[-1]} ({len(annees_train)} années)")
print(f"Test         : {annee_test}")
print("=" * 80)

resultats, fenetres = [], []
for cible in CIBLES:
    choix = choisir_modele(df, cible)
    if choix["eval"] is None:
        print(f"[IGNORÉ] {cible} : données insuffisantes")
        continue
    for _, ligne in choix["tableau"].iterrows():
        fenetres.append({"cible": cible, "modele": ligne["modele"],
                         "ecart_annuel_test_pct": ligne["ecart_annuel"], "mape_test_pct": ligne["mape"],
                         "retenu": ligne["modele"] == choix["modele"]})

    reel = test[cible].to_numpy(dtype=float)
    pred = prevoir(train, cible, test["mois"], choix["fenetre"])
    ev, naif = choix["eval"], choix["naif"] or {}
    resultats.append({
        "cible": cible,
        "modele": choix["modele"],
        "annee_test": annee_test,
        "annees_train": f"{annees_train[0]}-{annees_train[-1]}",
        "ecart_annuel_test_pct": ev["ecart_annuel"],
        "mape_test_pct": ev["mape"],
        "erreur_typique_pct": ev["erreur_typique"],
        "naif_ecart_annuel_test_pct": naif.get("ecart_annuel", np.nan),
        "naif_mape_test_pct": naif.get("mape", np.nan),
        "gain_vs_naif_pts": abs(naif.get("ecart_annuel", np.nan)) - abs(ev["ecart_annuel"]),
        "mae": mean_absolute_error(reel, pred),
        "rmse": float(np.sqrt(mean_squared_error(reel, pred))),
        "r2": r2_score(reel, pred),
    })

resultats = pd.DataFrame(resultats)
pd.set_option("display.float_format", lambda x: f"{x:,.2f}")
pd.set_option("display.width", 250)
print(f"\nERREURS SUR {annee_test} : RÉGRESSION RETENUE vs RECONDUCTION DE {annee_test - 1}")
print(resultats[["cible", "modele", "ecart_annuel_test_pct", "mape_test_pct",
                 "naif_ecart_annuel_test_pct", "gain_vs_naif_pts"]].to_string(index=False))
print("\nNote : les charges du budget sont la somme des catégories ; leur test est fait à l'étape 4.")

resultats.to_csv(OUTPUT, index=False)
pd.DataFrame(fenetres).to_csv(OUTPUT_FENETRES, index=False)
print(f"\n[OK] {OUTPUT}\n[OK] {OUTPUT_FENETRES}")
