"""
SXMXDX - Module de prévision partagé.

Principe (remplace la régression linéaire avec tendance index_temps + lag_12) :
    prévision du mois m = NIVEAU ANNUEL LISSÉ x PROFIL SAISONNIER(m)

- NIVEAU : moyenne mensuelle des années passées, lissée exponentiellement (EWM).
  alpha élevé = on suit surtout la dernière année ; alpha faible = on lisse davantage.
- PROFIL SAISONNIER : poids moyen de chaque mois dans l'année, ATTÉNUÉ de moitié
  (sur 6 ans la saisonnalité est du même ordre que le bruit, on évite de la sur-ajuster).
- Le paramètre alpha est choisi PAR CIBLE par backtest glissant (rolling origin) :
  on prévoit chaque année N à partir des années < N, pour toutes les années possibles.
"""
import numpy as np
import pandas as pd

INTENSITE_SAISON = 0.5
MIN_ANNEES_ENTRAINEMENT = 2
Z_80 = 1.2816  # quantile pour un intervalle à ~80 %

CANDIDATS = {
    "EWM_0.2": 0.2,
    "EWM_0.3": 0.3,
    "EWM_0.5": 0.5,
    "EWM_0.7": 0.7,
    "DERNIERE_ANNEE": 1.0,
}
ALPHA_PAR_DEFAUT = 0.5  # utilisé si l'historique est trop court pour un backtest

# Modèles imposés par raison métier (le backtest reste calculé et affiché).
# La masse salariale est un coût "en escalier" piloté par des décisions RH (embauches,
# augmentations) : le point de départ logique d'un budget est la reconduction de la dernière
# année. Sur le backtest elle est statistiquement à égalité avec EWM_0.5 (4 plis seulement).
# Les variations prévues (recrutements, revalorisations) doivent être ajoutées comme hypothèses.
MODELES_IMPOSES = {"masse_salariale": "DERNIERE_ANNEE"}


def garder_annees_completes(df):
    n = df.groupby("annee")["mois"].nunique()
    return df[df["annee"].isin(n[n == 12].index)].copy()


def profil_saisonnier(hist, cible, intensite=INTENSITE_SAISON):
    moyenne = hist.groupby("annee")[cible].transform("mean").replace(0, np.nan)
    rapport = hist[cible] / moyenne
    profil = rapport.groupby(hist["mois"]).mean().reindex(range(1, 13)).fillna(1.0)
    profil = 1 + (profil - 1) * intensite
    return profil / profil.mean()  # moyenne 1 : la somme annuelle = 12 x niveau


def niveau(hist, cible, alpha):
    annuel = hist.groupby("annee")[cible].mean().sort_index()
    return float(annuel.ewm(alpha=alpha, adjust=False).mean().iloc[-1])


def prevoir(hist, cible, mois, alpha):
    hist = garder_annees_completes(hist)
    if hist.empty:
        raise ValueError(f"Aucune année complète pour {cible}")
    profil = profil_saisonnier(hist, cible)
    valeurs = niveau(hist, cible, alpha) * pd.Series(list(mois)).map(profil).to_numpy()
    return np.maximum(valeurs, 0)


def backtest(df, cible, alpha):
    """Prévoit chaque année (à partir de la 3e) avec les seules années antérieures."""
    df = garder_annees_completes(df)
    annees = sorted(df["annee"].unique())
    plis = []
    for annee in annees[MIN_ANNEES_ENTRAINEMENT:]:
        train = df[df["annee"] < annee]
        test = df[df["annee"] == annee].sort_values("mois")
        pred = prevoir(train, cible, test["mois"].to_numpy(), alpha)
        plis.append({"annee": int(annee), "reel": test[cible].to_numpy(), "pred": pred})
    return plis


def evaluer(plis):
    """Métriques agrégées sur l'ensemble des plis."""
    if not plis:
        return None
    mape, ecarts = [], []
    for p in plis:
        masque = p["reel"] != 0
        mape.append(np.mean(np.abs(p["reel"][masque] - p["pred"][masque]) / p["reel"][masque]) * 100)
        ecarts.append((p["pred"].sum() - p["reel"].sum()) / p["reel"].sum() * 100)
    ecarts = np.array(ecarts)
    return {
        "nb_plis": len(plis),
        "mape_moy": float(np.mean(mape)),
        "ecart_annuel_moy": float(np.mean(np.abs(ecarts))),
        "ecart_annuel_rms": float(np.sqrt(np.mean(ecarts ** 2))),
        "ecart_annuel_dernier": float(ecarts[-1]),
    }


def choisir_modele(df, cible):
    """Retient l'alpha qui minimise l'erreur annuelle moyenne (le budget est annuel),
    sauf modèle imposé par raison métier (MODELES_IMPOSES)."""
    lignes = []
    for nom, alpha in CANDIDATS.items():
        ev = evaluer(backtest(df, cible, alpha))
        if ev is not None:
            lignes.append({"modele": nom, "alpha": alpha, **ev})
    if not lignes:
        return {"modele": f"EWM_{ALPHA_PAR_DEFAUT}", "alpha": ALPHA_PAR_DEFAUT, "eval": None,
                "tableau": pd.DataFrame()}
    tableau = pd.DataFrame(lignes).sort_values(["ecart_annuel_moy", "mape_moy"]).reset_index(drop=True)
    meilleur = tableau.iloc[0]
    impose = MODELES_IMPOSES.get(cible)
    if impose in set(tableau["modele"]):
        meilleur = tableau[tableau["modele"] == impose].iloc[0]
    return {"modele": meilleur["modele"], "alpha": float(meilleur["alpha"]),
            "eval": meilleur.to_dict(), "tableau": tableau}


def backtest_resultat(df, alphas):
    """Erreur relative (signée, %) sur le résultat opérationnel annuel, avec les modèles retenus."""
    df = garder_annees_completes(df)
    annees = sorted(df["annee"].unique())
    erreurs = []
    for annee in annees[MIN_ANNEES_ENTRAINEMENT:]:
        train = df[df["annee"] < annee]
        test = df[df["annee"] == annee].sort_values("mois")
        m = test["mois"].to_numpy()
        p = {c: prevoir(train, c, m, a) for c, a in alphas.items()}
        pred = p["ca_export"].sum() - p["charges_exploitation"].sum() - p["frais_export"].sum() - p["masse_salariale"].sum()
        reel = (test["ca_export"] - test["charges_exploitation"] - test["frais_export"] - test["masse_salariale"]).sum()
        erreurs.append((pred - reel) / abs(reel) * 100)
    return erreurs


def borne_80(valeur, erreur_rms_pct):
    marge = Z_80 * erreur_rms_pct / 100
    return valeur * (1 - marge), valeur * (1 + marge)


# ---------------------------------------------------------------------------
# Charges par catégorie (utilisé par predire_charges_categories.py)
# ---------------------------------------------------------------------------
def prevoir_categories(charges, budget, annee_reference):
    """
    charges : DataFrame [annee, mois, categorie, montant] (historique)
    budget  : DataFrame prévisionnel mensuel [mois, production_reelle, charges_exploitation]
    Retourne [annee, mois, categorie, production_prevue, charge_prevue].
    Les catégories sont prévues individuellement puis RÉCONCILIÉES sur le total
    charges_exploitation du budget, pour que somme(catégories) = total, mois par mois.
    """
    budget = budget.sort_values("mois")
    annee_prediction = annee_reference + 1
    morceaux, choix = [], {}

    for categorie in sorted(charges["categorie"].dropna().unique()):
        hist = charges[charges["categorie"] == categorie].dropna(subset=["montant"])
        hist = garder_annees_completes(hist)
        reference = hist[hist["annee"] == annee_reference]
        if len(reference) != 12:
            print(f"[IGNORÉ] {categorie} : historique insuffisant")
            continue
        modele = choisir_modele(hist, "montant")
        choix[categorie] = modele["modele"]
        futur = pd.DataFrame({"annee": annee_prediction, "mois": range(1, 13)})
        futur["categorie"] = categorie
        futur["production_prevue"] = budget["production_reelle"].to_numpy()
        futur["charge_prevue"] = prevoir(hist, "montant", futur["mois"], modele["alpha"])
        morceaux.append(futur)

    if not morceaux:
        raise ValueError("Aucune prévision par catégorie.")
    res = pd.concat(morceaux, ignore_index=True)

    total_cat = res.groupby("mois")["charge_prevue"].sum()
    total_budget = budget.set_index("mois")["charges_exploitation"]
    facteur = (total_budget / total_cat).reindex(range(1, 13))
    if facteur.between(0.85, 1.15).all():
        res["charge_prevue"] = res["charge_prevue"] * res["mois"].map(facteur)
        print(f"[OK] Réconciliation sur le total budget (facteur moyen {facteur.mean():.4f})")
    else:
        print("[ALERTE] Écart catégories/total > 15 % : réconciliation non appliquée "
              "(catégorie manquante ?)")
    return res, choix
