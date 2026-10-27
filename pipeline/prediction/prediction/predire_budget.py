# from pathlib import Path
# import numpy as np
# import pandas as pd
# from modeles import choisir_modele, prevoir, backtest_resultat, borne_80

# BASE = Path(__file__).resolve().parent.parent
# OUTPUT = BASE/"output"
# df = pd.read_csv(OUTPUT/"dataset_ml.csv").sort_values(["annee","mois"]).reset_index(drop=True)

# ANNEE_REFERENCE = int(df["annee"].max())
# ANNEE_PREDICTION = ANNEE_REFERENCE+1
# dernier = df[df["annee"]==ANNEE_REFERENCE].sort_values("mois").copy()
# if len(dernier)!=12: raise ValueError(f"L'exercice {ANNEE_REFERENCE} doit contenir 12 mois.")

# config = {
#     "ventes":"ventes_lag_12",
#     "ca_export":"ca_export_lag_12",
#     "production_reelle":"production_lag_12",
#     "charges_exploitation":"charges_lag_12",
#     "frais_export":"frais_export_lag_12",
#     "masse_salariale":"masse_salariale_lag_12",
#     "amortissements":"amortissements_lag_12"
# }

# print("="*80)
# print(f"SXMXDX - BUDGET PREVISIONNEL {ANNEE_PREDICTION}")
# print("="*80)

# futur = pd.DataFrame({"annee":[ANNEE_PREDICTION]*12,"mois":range(1,13)})
# futur["index_temps"] = np.arange(int(df["index_temps"].max())+1,int(df["index_temps"].max())+13)
# futur["mois_sin"] = np.sin(2*np.pi*futur["mois"]/12)
# futur["mois_cos"] = np.cos(2*np.pi*futur["mois"]/12)

# choix = {}
# for cible,lag in config.items():
#     futur[lag] = dernier[cible].to_numpy()
#     choix[cible] = choisir_modele(df,cible)
#     futur[cible] = prevoir(df,cible,futur["mois"],choix[cible]["alpha"])
#     print(f"[MODELE] {cible:22s} -> {choix[cible]['modele']}")

# futur["resultat_operationnel"] = futur["ca_export"]-futur["charges_exploitation"]-futur["frais_export"]-futur["masse_salariale"]-futur["amortissements"]
# futur["marge_operationnelle"] = futur["resultat_operationnel"]/futur["ca_export"].replace(0,np.nan)

# def evolution(nouveau,ancien): return ((nouveau-ancien)/ancien*100) if ancien else np.nan

# annuel = {
#     "annee":ANNEE_PREDICTION,"type_budget":"PREVISIONNEL","statut":"GENERE",
#     "ventes":futur["ventes"].sum(),"ca_export":futur["ca_export"].sum(),
#     "production":futur["production_reelle"].sum(),"charges_exploitation":futur["charges_exploitation"].sum(),
#     "frais_export":futur["frais_export"].sum(),"masse_salariale":futur["masse_salariale"].sum(),
#     "amortissements":futur["amortissements"].sum(),
#     "resultat_operationnel":futur["resultat_operationnel"].sum()
# }

# annuel["marge_operationnelle"] = annuel["resultat_operationnel"]/annuel["ca_export"] if annuel["ca_export"] else 0
# annuel["evolution_ventes_pct"] = evolution(annuel["ventes"],dernier["ventes"].sum())
# annuel["evolution_ca_pct"] = evolution(annuel["ca_export"],dernier["ca_export"].sum())
# annuel["evolution_production_pct"] = evolution(annuel["production"],dernier["production_reelle"].sum())
# annuel["evolution_charges_pct"] = evolution(annuel["charges_exploitation"],dernier["charges_exploitation"].sum())
# annuel["evolution_frais_export_pct"] = evolution(annuel["frais_export"],dernier["frais_export"].sum())
# annuel["evolution_masse_salariale_pct"] = evolution(annuel["masse_salariale"],dernier["masse_salariale"].sum())
# annuel["evolution_amortissements_pct"] = evolution(annuel["amortissements"],dernier["amortissements"].sum())

# # --- Fourchettes indicatives (~80 %) déduites de l'erreur annuelle observée en backtest ---
# erreurs_resultat = backtest_resultat(df,{c:m["alpha"] for c,m in choix.items() if c in
#                                          ["ca_export","charges_exploitation","frais_export","masse_salariale","amortissements"]})
# rms_resultat = float(np.sqrt(np.mean(np.square(erreurs_resultat)))) if erreurs_resultat else np.nan
# lignes = []
# for cible,valeur in [("ventes",annuel["ventes"]),("ca_export",annuel["ca_export"]),("production_reelle",annuel["production"]),
#                      ("charges_exploitation",annuel["charges_exploitation"]),("frais_export",annuel["frais_export"]),
#                      ("masse_salariale",annuel["masse_salariale"]),("amortissements",annuel["amortissements"]),("resultat_operationnel",annuel["resultat_operationnel"])]:
#     rms = rms_resultat if cible=="resultat_operationnel" else (choix[cible]["eval"] or {}).get("ecart_annuel_rms",np.nan)
#     bas,haut = borne_80(valeur,rms) if pd.notna(rms) else (np.nan,np.nan)
#     if cible=="resultat_operationnel" and pd.notna(bas) and bas>haut: bas,haut = haut,bas
#     lignes.append({"annee":ANNEE_PREDICTION,"indicateur":cible,"prevision_annuelle":valeur,
#                    "borne_basse_80":bas,"borne_haute_80":haut,"erreur_typique_pct":rms,
#                    "modele":choix[cible]["modele"] if cible in choix else "COMBINAISON"})
# intervalles = pd.DataFrame(lignes)

# annuel = pd.DataFrame([annuel])
# mensuel_file = OUTPUT/f"prediction_budget_{ANNEE_PREDICTION}_mensuel.csv"
# annuel_file = OUTPUT/f"prediction_budget_{ANNEE_PREDICTION}_annuel.csv"
# intervalles_file = OUTPUT/f"prediction_budget_{ANNEE_PREDICTION}_intervalles.csv"

# futur.to_csv(mensuel_file,index=False)
# annuel.to_csv(annuel_file,index=False)
# intervalles.to_csv(intervalles_file,index=False)

# pd.set_option("display.float_format",lambda x:f"{x:,.2f}")
# pd.set_option("display.width",250)
# print("\nPREVISION MENSUELLE")
# print(futur[["mois","ventes","ca_export","production_reelle","charges_exploitation","frais_export","masse_salariale","amortissements","resultat_operationnel"]].to_string(index=False))
# print("\nSYNTHESE ANNUELLE")
# print(annuel.to_string(index=False))
# print("\nFOURCHETTES INDICATIVES (~80 %, d'après l'erreur annuelle en backtest)")
# print(intervalles.to_string(index=False))
# print(f"\n[OK] {mensuel_file}\n[OK] {annuel_file}\n[OK] {intervalles_file}")






from pathlib import Path
import numpy as np
import pandas as pd

from modeles import (
    choisir_modele,
    prevoir,
    backtest_resultat,
    borne_80
)

BASE = Path(__file__).resolve().parent.parent
OUTPUT = BASE / "output"

df = (
    pd.read_csv(OUTPUT / "dataset_ml.csv")
    .sort_values(["annee", "mois"])
    .reset_index(drop=True)
)

ANNEE_REFERENCE = int(df["annee"].max())
ANNEE_PREDICTION = ANNEE_REFERENCE + 1

dernier = (
    df[df["annee"] == ANNEE_REFERENCE]
    .sort_values("mois")
    .copy()
)

if len(dernier) != 12:
    raise ValueError(
        f"L'exercice {ANNEE_REFERENCE} "
        "doit contenir 12 mois."
    )

config = {
    "ventes": "ventes_lag_12",
    "ca_export": "ca_export_lag_12",
    "production_reelle": "production_lag_12",
    "frais_export": "frais_export_lag_12",
    "masse_salariale": "masse_salariale_lag_12",
    "amortissements": "amortissements_lag_12"
}

print("=" * 80)
print(
    f"SXMXDX - BUDGET PREVISIONNEL {ANNEE_PREDICTION}"
)
print("=" * 80)

futur = pd.DataFrame({
    "annee": [ANNEE_PREDICTION] * 12,
    "mois": range(1, 13)
})

futur["index_temps"] = np.arange(
    int(df["index_temps"].max()) + 1,
    int(df["index_temps"].max()) + 13
)

futur["mois_sin"] = np.sin(
    2 * np.pi * futur["mois"] / 12
)

futur["mois_cos"] = np.cos(
    2 * np.pi * futur["mois"] / 12
)

choix = {}

for cible, lag in config.items():

    futur[lag] = dernier[cible].to_numpy()

    choix[cible] = choisir_modele(
        df,
        cible
    )

    futur[cible] = prevoir(
        df,
        cible,
        futur["mois"],
        choix[cible]["alpha"]
    )

    print(
        f"[MODELE] {cible:22s} "
        f"-> {choix[cible]['modele']}"
    )


# ============================================================
# CHARGES = SOMME DES CATEGORIES
# ============================================================

fichier_categories = OUTPUT / (
    f"prediction_charges_categories_"
    f"{ANNEE_PREDICTION}.csv"
)

if not fichier_categories.is_file():
    raise FileNotFoundError(
        f"Prévision des catégories absente : {fichier_categories}. "
        "Exécuter predire_charges_categories.py avant predire_budget.py."
    )
categories = pd.read_csv(fichier_categories)

if categories.empty:
    raise ValueError(
        "Aucune prévision de charges par catégorie."
    )

if categories["charge_prevue"].isna().any():
    raise ValueError(
        "Certaines prévisions de charges sont invalides."
    )

totaux = (
    categories.groupby("mois")["charge_prevue"]
    .sum()
    .reindex(range(1, 13))
)

if totaux.isna().any():
    raise ValueError(
        "Les prévisions des 12 mois sont requises."
    )

futur["charges_exploitation"] = totaux.to_numpy()

# Modèle conservé pour les indicateurs de backtest
choix["charges_exploitation"] = choisir_modele(
    df,
    "charges_exploitation"
)

print(
    "[OK] Charges d'exploitation = "
    "somme des catégories prévisionnelles"
)


# ============================================================
# RESULTAT ET MARGE
# ============================================================

futur["resultat_operationnel"] = (
    futur["ca_export"]
    - futur["charges_exploitation"]
    - futur["frais_export"]
    - futur["masse_salariale"]
    - futur["amortissements"]
)

futur["marge_operationnelle"] = (
    futur["resultat_operationnel"]
    / futur["ca_export"].replace(0, np.nan)
)


# ============================================================
# SYNTHESE ANNUELLE
# ============================================================

def evolution(nouveau, ancien):
    if ancien == 0:
        return np.nan
    return (nouveau - ancien) / ancien * 100


annuel = {
    "annee": ANNEE_PREDICTION,
    "type_budget": "PREVISIONNEL",
    "statut": "GENERE",
    "ventes": futur["ventes"].sum(),
    "ca_export": futur["ca_export"].sum(),
    "production": futur["production_reelle"].sum(),
    "charges_exploitation":
        futur["charges_exploitation"].sum(),
    "frais_export": futur["frais_export"].sum(),
    "masse_salariale": futur["masse_salariale"].sum(),
    "amortissements": futur["amortissements"].sum(),
    "resultat_operationnel":
        futur["resultat_operationnel"].sum()
}

annuel["marge_operationnelle"] = (
    annuel["resultat_operationnel"]
    / annuel["ca_export"]
    if annuel["ca_export"] else 0
)

evolutions = {
    "ventes": ("ventes", "ventes"),
    "ca": ("ca_export", "ca_export"),
    "production": ("production", "production_reelle"),
    "charges": ("charges_exploitation", "charges_exploitation"),
    "frais_export": ("frais_export", "frais_export"),
    "masse_salariale": ("masse_salariale", "masse_salariale"),
    "amortissements": ("amortissements", "amortissements")
}

for nom, (champ_annuel, champ_historique) in evolutions.items():
    annuel[f"evolution_{nom}_pct"] = evolution(
        annuel[champ_annuel],
        dernier[champ_historique].sum()
    )


# ============================================================
# INTERVALLES INDICATIFS
# ============================================================

alphas = {
    cible: modele["alpha"]
    for cible, modele in choix.items()
    if cible in [
        "ca_export",
        "charges_exploitation",
        "frais_export",
        "masse_salariale",
        "amortissements"
    ]
}

erreurs_resultat = backtest_resultat(
    df,
    alphas
)

rms_resultat = (
    float(np.sqrt(np.mean(
        np.square(erreurs_resultat)
    )))
    if erreurs_resultat else np.nan
)

indicateurs = [
    ("ventes", annuel["ventes"]),
    ("ca_export", annuel["ca_export"]),
    ("production_reelle", annuel["production"]),
    ("charges_exploitation", annuel["charges_exploitation"]),
    ("frais_export", annuel["frais_export"]),
    ("masse_salariale", annuel["masse_salariale"]),
    ("amortissements", annuel["amortissements"]),
    ("resultat_operationnel", annuel["resultat_operationnel"])
]

lignes = []

for cible, valeur in indicateurs:

    if cible == "resultat_operationnel":
        rms = rms_resultat
    else:
        evaluation = (
            choix[cible]["eval"]
            if cible in choix else None
        ) or {}

        rms = evaluation.get(
            "ecart_annuel_rms",
            np.nan
        )

    if pd.notna(rms):
        bas, haut = borne_80(valeur, rms)
    else:
        bas, haut = np.nan, np.nan

    lignes.append({
        "annee": ANNEE_PREDICTION,
        "indicateur": cible,
        "prevision_annuelle": valeur,
        "borne_basse_80": bas,
        "borne_haute_80": haut,
        "erreur_typique_pct": rms,
        "modele": (
            choix[cible]["modele"]
            if cible in choix else "COMBINAISON"
        )
    })

intervalles = pd.DataFrame(lignes)


# ============================================================
# EXPORT CSV
# ============================================================

annuel_df = pd.DataFrame([annuel])

mensuel_file = OUTPUT / (
    f"prediction_budget_{ANNEE_PREDICTION}_mensuel.csv"
)

annuel_file = OUTPUT / (
    f"prediction_budget_{ANNEE_PREDICTION}_annuel.csv"
)

intervalles_file = OUTPUT / (
    f"prediction_budget_{ANNEE_PREDICTION}_intervalles.csv"
)

futur.to_csv(mensuel_file, index=False)
annuel_df.to_csv(annuel_file, index=False)
intervalles.to_csv(intervalles_file, index=False)

print("\nPREVISION MENSUELLE")

print(
    futur[
        [
            "mois",
            "ventes",
            "ca_export",
            "production_reelle",
            "charges_exploitation",
            "frais_export",
            "masse_salariale",
            "amortissements",
            "resultat_operationnel"
        ]
    ].to_string(index=False)
)

print("\nSYNTHESE ANNUELLE")
print(annuel_df.to_string(index=False))

print(f"\n[OK] {mensuel_file}")
print(f"[OK] {annuel_file}")
print(f"[OK] {intervalles_file}")
