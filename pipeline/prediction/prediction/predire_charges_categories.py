"""
SXMXDX - Prévision des charges d'exploitation par catégorie (étape 4).

Pour chaque catégorie active en N : fenêtre de régression choisie en
entraînant sur les années < N et en testant sur N, puis prévision de N+1
entraînée sur toutes les années. Charges d'exploitation = somme des catégories.

Entrées : output/dataset_ml.csv, output/charges_categories_historique.csv
Sorties : prediction_charges_categories_<N+1>.csv
          metriques_charges_categories.csv   (une ligne par catégorie)
          test_charges_total.csv             (12 mois de N : prévu vs réel)
"""
from pathlib import Path
import pandas as pd

from modeles import evaluer_test, prevoir_categories, tester_charges_categories

BASE = Path(__file__).resolve().parent.parent
OUTPUT = BASE / "output"

dataset = pd.read_csv(OUTPUT / "dataset_ml.csv")
ANNEE_REFERENCE = int(dataset["annee"].max())
ANNEE_PREDICTION = ANNEE_REFERENCE + 1

HISTORIQUE = OUTPUT / "charges_categories_historique.csv"
if not HISTORIQUE.is_file():
    raise FileNotFoundError(f"Historique des charges par catégorie absent : {HISTORIQUE}. "
                            "Relancer construire_dataset.py.")

charges = pd.read_csv(HISTORIQUE)
charges["montant"] = pd.to_numeric(charges["montant"], errors="coerce")
charges = charges[charges["annee"].isin(dataset["annee"].unique())]
charges = charges.sort_values(["categorie", "annee", "mois"]).reset_index(drop=True)

print("=" * 80)
print(f"SXMXDX - CHARGES PAR CATÉGORIE {ANNEE_PREDICTION}")
print(f"Entraînement : années < {ANNEE_REFERENCE} ; test : {ANNEE_REFERENCE}")
print("=" * 80)

previsions, choix = prevoir_categories(charges, ANNEE_REFERENCE)

lignes = []
for categorie, modele in choix.items():
    cat = charges[charges["categorie"] == categorie]
    reference = cat[cat["annee"] == ANNEE_REFERENCE]["montant"].sum()
    prevu = previsions[previsions["categorie"] == categorie]["charge_prevue"].sum()
    ev, naif = modele["eval"] or {}, modele["naif"] or {}
    lignes.append({
        "categorie": categorie,
        "modele": modele["modele"],
        "nb_annees": int(cat["annee"].nunique()),
        "montant_reference": reference,
        "montant_prevu": prevu,
        "evolution_pct": (prevu - reference) / reference * 100 if reference else float("nan"),
        "ecart_annuel_test_pct": ev.get("ecart_annuel"),
        "naif_ecart_annuel_test_pct": naif.get("ecart_annuel"),
    })
    print(f"[MODELE] {categorie:18s} -> {modele['modele']}")
metriques = pd.DataFrame(lignes)

# Test de la méthode « somme des catégories » sur l'année N
reel = dataset[dataset["annee"] == ANNEE_REFERENCE].sort_values("mois")["charges_exploitation"].to_numpy()
prevu_test = tester_charges_categories(charges, choix, ANNEE_REFERENCE)
test_total = pd.DataFrame({"annee": ANNEE_REFERENCE, "mois": range(1, 13),
                           "charges_prevues": prevu_test, "charges_reelles": reel})
ev = evaluer_test(reel, prevu_test)
if ev:
    print(f"\n[TEST {ANNEE_REFERENCE}] Total des charges : écart annuel {ev['ecart_annuel']:+.2f} %, "
          f"MAPE {ev['mape']:.2f} %")

previsions.to_csv(OUTPUT / f"prediction_charges_categories_{ANNEE_PREDICTION}.csv", index=False)
metriques.to_csv(OUTPUT / "metriques_charges_categories.csv", index=False)
test_total.to_csv(OUTPUT / "test_charges_total.csv", index=False)

pd.set_option("display.float_format", lambda x: f"{x:,.2f}")
pd.set_option("display.width", 200)
print("\nSYNTHESE PAR CATEGORIE")
print(metriques.to_string(index=False))
print(f"\n[OK] {OUTPUT / f'prediction_charges_categories_{ANNEE_PREDICTION}.csv'}")
