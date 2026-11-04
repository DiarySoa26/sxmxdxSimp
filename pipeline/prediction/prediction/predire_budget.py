"""
SXMXDX - Budget prévisionnel N+1 par régression (étape 5).

- ventes, CA export, production, frais export, masse salariale,
  amortissements : régression tendance + saisonnalité ; fenêtre choisie
  en entraînant sur les années < N et en testant sur N ; prévision N+1
  entraînée sur toutes les années ;
- charges d'exploitation : somme des catégories (étape 4) ;
- résultat et marge opérationnels : calculés comme pour le budget réel ;
- fourchettes ~80 % : d'après l'erreur constatée sur l'année de test.

HYPOTHESE_MASSE_SALARIALE : TENDANCE (défaut) ou STABLE (reconduction de N).
Sorties : prediction_budget_<N+1>_mensuel.csv, _annuel.csv, _intervalles.csv
"""
import os
from pathlib import Path

import numpy as np
import pandas as pd

from modeles import (MODELE_NAIF, borne_80, choisir_modele, evaluer_test,
                     prevoir_indicateur, prevoir_naif, separer_train_test, tester_resultat)

BASE = Path(__file__).resolve().parent.parent
OUTPUT = BASE / "output"

df = pd.read_csv(OUTPUT / "dataset_ml.csv").sort_values(["annee", "mois"]).reset_index(drop=True)
ANNEE_REFERENCE = int(df["annee"].max())
ANNEE_PREDICTION = ANNEE_REFERENCE + 1
dernier = df[df["annee"] == ANNEE_REFERENCE].sort_values("mois")
if len(dernier) != 12:
    raise ValueError(f"L'exercice {ANNEE_REFERENCE} doit contenir 12 mois.")

HYPOTHESE_MS = os.getenv("HYPOTHESE_MASSE_SALARIALE", "TENDANCE").strip().upper()
if HYPOTHESE_MS not in ("TENDANCE", "STABLE"):
    raise ValueError("HYPOTHESE_MASSE_SALARIALE doit valoir TENDANCE ou STABLE.")

INDICATEURS = ["ventes", "ca_export", "production_reelle", "frais_export",
               "masse_salariale", "amortissements"]

print("=" * 80)
print(f"SXMXDX - BUDGET PREVISIONNEL {ANNEE_PREDICTION} (régression)")
print("=" * 80)

futur = pd.DataFrame({"annee": ANNEE_PREDICTION, "mois": range(1, 13)})
choix = {}
for cible in INDICATEURS:
    if cible == "masse_salariale" and HYPOTHESE_MS == "STABLE":
        futur[cible] = prevoir_naif(df, cible, futur["mois"])
        train, test, _ = separer_train_test(df)
        ev = evaluer_test(test[cible], prevoir_naif(train, cible, test["mois"])) if not train.empty else None
        choix[cible] = {"modele": MODELE_NAIF, "fenetre": MODELE_NAIF, "eval": ev, "naif": ev}
    else:
        futur[cible], choix[cible] = prevoir_indicateur(df, cible, futur["mois"])
    print(f"[MODELE] {cible:22s} -> {choix[cible]['modele']}")

# Charges d'exploitation = somme des catégories (étape 4)
fichier_categories = OUTPUT / f"prediction_charges_categories_{ANNEE_PREDICTION}.csv"
if not fichier_categories.is_file():
    raise FileNotFoundError(f"Prévision des catégories absente : {fichier_categories}. "
                            "Exécuter predire_charges_categories.py avant predire_budget.py.")
categories = pd.read_csv(fichier_categories)
totaux = categories.groupby("mois")["charge_prevue"].sum().reindex(range(1, 13))
if categories.empty or totaux.isna().any():
    raise ValueError("Les prévisions de charges des 12 mois sont requises.")
futur["charges_exploitation"] = totaux.to_numpy()

futur["resultat_operationnel"] = (futur["ca_export"] - futur["charges_exploitation"]
                                  - futur["frais_export"] - futur["masse_salariale"]
                                  - futur["amortissements"])
futur["marge_operationnelle"] = futur["resultat_operationnel"] / futur["ca_export"].replace(0, np.nan)
futur = futur[["annee", "mois", "ventes", "ca_export", "production_reelle", "charges_exploitation",
               "frais_export", "masse_salariale", "amortissements",
               "resultat_operationnel", "marge_operationnelle"]]

# Synthèse annuelle
def evolution(nouveau, ancien):
    return (nouveau - ancien) / abs(ancien) * 100 if ancien else np.nan

annuel = {
    "annee": ANNEE_PREDICTION, "type_budget": "PREVISIONNEL", "statut": "GENERE",
    "modele": "REGRESSION", "hypothese_masse_salariale": HYPOTHESE_MS,
    "annee_test": ANNEE_REFERENCE,
    "ventes": futur["ventes"].sum(), "ca_export": futur["ca_export"].sum(),
    "production": futur["production_reelle"].sum(),
    "charges_exploitation": futur["charges_exploitation"].sum(),
    "frais_export": futur["frais_export"].sum(), "masse_salariale": futur["masse_salariale"].sum(),
    "amortissements": futur["amortissements"].sum(),
    "resultat_operationnel": futur["resultat_operationnel"].sum(),
}
annuel["marge_operationnelle"] = annuel["resultat_operationnel"] / annuel["ca_export"] if annuel["ca_export"] else 0
for nom, (champ, hist) in {
    "ventes": ("ventes", "ventes"), "ca": ("ca_export", "ca_export"),
    "production": ("production", "production_reelle"),
    "charges": ("charges_exploitation", "charges_exploitation"),
    "frais_export": ("frais_export", "frais_export"),
    "masse_salariale": ("masse_salariale", "masse_salariale"),
    "amortissements": ("amortissements", "amortissements"),
}.items():
    annuel[f"evolution_{nom}_pct"] = evolution(annuel[champ], dernier[hist].sum())

# Erreurs constatées sur l'année de test -> fourchettes
test_charges = OUTPUT / "test_charges_total.csv"
charges_test = pd.read_csv(test_charges) if test_charges.is_file() else pd.DataFrame()
ev_charges = (evaluer_test(charges_test["charges_reelles"], charges_test["charges_prevues"])
              if not charges_test.empty else None)
naif_charges = choisir_modele(df, "charges_exploitation")["naif"]

fenetres = {c: choix[c]["fenetre"] for c in ["ca_export", "frais_export", "masse_salariale", "amortissements"]}
fenetres["charges_exploitation"] = choisir_modele(df, "charges_exploitation")["fenetre"]
ev_resultat = tester_resultat(df, fenetres,
                              charges_test["charges_prevues"] if not charges_test.empty else None)

lignes = []
for cible, valeur in [
    ("ventes", annuel["ventes"]), ("ca_export", annuel["ca_export"]),
    ("production_reelle", annuel["production"]),
    ("charges_exploitation", annuel["charges_exploitation"]),
    ("frais_export", annuel["frais_export"]), ("masse_salariale", annuel["masse_salariale"]),
    ("amortissements", annuel["amortissements"]),
    ("resultat_operationnel", annuel["resultat_operationnel"]),
]:
    if cible == "resultat_operationnel":
        ev, naif, modele = ev_resultat, None, "COMBINAISON"
    elif cible == "charges_exploitation":
        ev, naif, modele = ev_charges, naif_charges, "SOMME_CATEGORIES"
    else:
        ev, naif, modele = choix[cible]["eval"], choix[cible]["naif"], choix[cible]["modele"]
    ev, naif = ev or {}, naif or {}
    erreur = ev.get("erreur_typique", np.nan)
    bas, haut = borne_80(valeur, erreur) if pd.notna(erreur) else (np.nan, np.nan)
    lignes.append({
        "annee": ANNEE_PREDICTION, "indicateur": cible, "prevision_annuelle": valeur,
        "borne_basse_80": bas, "borne_haute_80": haut, "modele": modele,
        "annee_test": ANNEE_REFERENCE,
        "ecart_annuel_test_pct": ev.get("ecart_annuel", np.nan),
        "mape_test_pct": ev.get("mape", np.nan),
        "erreur_typique_pct": erreur,
        "ecart_reconduction_test_pct": naif.get("ecart_annuel", np.nan),
    })
intervalles = pd.DataFrame(lignes)

futur.to_csv(OUTPUT / f"prediction_budget_{ANNEE_PREDICTION}_mensuel.csv", index=False)
pd.DataFrame([annuel]).to_csv(OUTPUT / f"prediction_budget_{ANNEE_PREDICTION}_annuel.csv", index=False)
intervalles.to_csv(OUTPUT / f"prediction_budget_{ANNEE_PREDICTION}_intervalles.csv", index=False)

pd.set_option("display.float_format", lambda x: f"{x:,.2f}")
pd.set_option("display.width", 250)
print("\nPREVISION MENSUELLE")
print(futur.to_string(index=False))
print("\nSYNTHESE ANNUELLE")
print(pd.DataFrame([annuel]).T.to_string(header=False))
print(f"\nERREURS SUR L'ANNÉE DE TEST {ANNEE_REFERENCE} ET FOURCHETTES (~80 %)")
print(intervalles.to_string(index=False))
