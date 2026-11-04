"""
SXMXDX - Modèles de prévision par régression linéaire.

Modèle (pour chaque indicateur mensuel y) :
    y = a + b·t + c1·sin(2πm/12) + d1·cos(2πm/12) + c2·sin(4πm/12) + d2·cos(4πm/12)
    t = année + (mois - 1) / 12   -> tendance
    harmoniques du mois m         -> saisonnalité

Découpage des données (N = dernière année complète = année à prédire - 1) :
    - ENTRAÎNEMENT : toutes les années existantes sauf N
    - TEST         : l'année N
Chaque fenêtre candidate (3, 5, 8 dernières années d'entraînement, ou toutes)
est entraînée sur les années < N puis évaluée sur N ; la fenêtre qui se
trompe le moins sur le total de N est retenue. Le modèle retenu est ensuite
réentraîné sur toutes les années (N comprise) pour prévoir N+1.
"""
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression

Z_80 = 1.2816  # quantile normal : ~80 % de chances d'être dans la fourchette

CANDIDATS = {
    "REG_LIN_3ANS": 3,
    "REG_LIN_5ANS": 5,
    "REG_LIN_8ANS": 8,
    "REG_LIN_TOUT": None,
}
MODELE_PAR_DEFAUT = "REG_LIN_TOUT"
MODELE_NAIF = "RECONDUCTION"  # référence : l'année précédente recopiée


# ============================================================
# DONNÉES
# ============================================================

def garder_annees_completes(df):
    n = df.groupby("annee")["mois"].nunique()
    return df[df["annee"].isin(n[n == 12].index)].copy()


def separer_train_test(df):
    """Entraînement = toutes les années complètes sauf la dernière ; test = la dernière."""
    df = garder_annees_completes(df)
    annee_test = int(df["annee"].max())
    train = df[df["annee"] < annee_test].copy()
    test = df[df["annee"] == annee_test].sort_values("mois").copy()
    return train, test, annee_test


def variables_explicatives(annees, mois):
    annees = np.asarray(annees, dtype=float)
    mois = np.asarray(mois, dtype=float)
    colonnes = [annees + (mois - 1) / 12]
    for k in (1, 2):
        colonnes.append(np.sin(2 * np.pi * k * mois / 12))
        colonnes.append(np.cos(2 * np.pi * k * mois / 12))
    return np.column_stack(colonnes)


# ============================================================
# PRÉVISION
# ============================================================

def prevoir(hist, cible, mois, fenetre):
    """
    Entraîne la régression sur les `fenetre` dernières années complètes de
    `hist` (toutes si None) et prévoit `cible` pour l'année suivante.
    Avec une seule année, aucune tendance n'est estimable : reconduction.
    Les valeurs négatives sont ramenées à 0.
    """
    hist = garder_annees_completes(hist.dropna(subset=[cible]))
    if hist.empty:
        raise ValueError(f"Aucune année complète pour {cible}")

    annees = sorted(hist["annee"].unique())
    if fenetre:
        annees = annees[-fenetre:]
        hist = hist[hist["annee"].isin(annees)]
    mois = np.asarray(list(mois), dtype=int)

    if len(annees) < 2:
        return np.maximum(prevoir_naif(hist, cible, mois), 0)

    modele = LinearRegression().fit(
        variables_explicatives(hist["annee"], hist["mois"]),
        hist[cible].to_numpy(dtype=float),
    )
    X = variables_explicatives(np.full(len(mois), int(annees[-1]) + 1), mois)
    return np.maximum(modele.predict(X), 0)


def prevoir_naif(hist, cible, mois):
    """Référence : les mois de la dernière année, recopiés."""
    hist = garder_annees_completes(hist)
    derniere = hist[hist["annee"] == hist["annee"].max()].set_index("mois")[cible]
    return derniere.reindex(np.asarray(list(mois), dtype=int)).to_numpy(dtype=float)


# ============================================================
# ÉVALUATION SUR L'ANNÉE DE TEST
# ============================================================

def evaluer_test(reel, pred):
    """
    Erreurs sur l'année de test (en %) :
      ecart_annuel   : (total prévu - total réel) / total réel, signé
      mape           : erreur moyenne absolue des 12 mois
      erreur_typique : sqrt(ecart_annuel² + rmse_mensuel² / 12), qui combine
                       le biais sur l'année et la dispersion des mois ; sert
                       aux fourchettes.
    """
    reel = np.asarray(reel, dtype=float)
    pred = np.asarray(pred, dtype=float)
    total = float(np.nansum(reel))
    if not np.isfinite(total) or abs(total) < 1e-9:
        return None
    masque = np.isfinite(reel) & np.isfinite(pred) & (reel != 0)
    relatif = (pred[masque] - reel[masque]) / np.abs(reel[masque]) * 100
    ecart = (float(np.nansum(pred)) - total) / abs(total) * 100
    rmse = float(np.sqrt(np.mean(relatif ** 2))) if masque.any() else 0.0
    return {
        "ecart_annuel": ecart,
        "ecart_annuel_abs": abs(ecart),
        "mape": float(np.mean(np.abs(relatif))) if masque.any() else np.nan,
        "rmse_mensuel": rmse,
        "erreur_typique": float(np.sqrt(ecart ** 2 + rmse ** 2 / 12)),
        "total_reel": total,
        "total_prevu": float(np.nansum(pred)),
    }


def choisir_modele(df, cible):
    """
    Entraîne chaque fenêtre candidate sur les années < N, l'évalue sur N et
    retient celle de plus petit écart annuel absolu (MAPE en départage).
    Évalue aussi la reconduction de N-1 sur N, pour comparaison.
    """
    train, test, annee_test = separer_train_test(df)
    base = {"annee_test": annee_test, "annees_train": sorted(train["annee"].unique().tolist())}
    if train.empty or test.empty:
        return {**base, "modele": MODELE_PAR_DEFAUT, "fenetre": CANDIDATS[MODELE_PAR_DEFAUT],
                "eval": None, "naif": None, "tableau": pd.DataFrame()}

    mois = test["mois"].to_numpy()
    reel = test[cible].to_numpy(dtype=float)
    lignes = []
    for nom, fenetre in CANDIDATS.items():
        ev = evaluer_test(reel, prevoir(train, cible, mois, fenetre))
        if ev is not None:
            lignes.append({"modele": nom, "fenetre": fenetre, **ev})
    naif = evaluer_test(reel, prevoir_naif(train, cible, mois))

    if not lignes:
        return {**base, "modele": MODELE_PAR_DEFAUT, "fenetre": CANDIDATS[MODELE_PAR_DEFAUT],
                "eval": None, "naif": naif, "tableau": pd.DataFrame()}

    tableau = pd.DataFrame(lignes).sort_values(["ecart_annuel_abs", "mape"]).reset_index(drop=True)
    meilleur = tableau.iloc[0]
    return {**base, "modele": meilleur["modele"], "fenetre": CANDIDATS[meilleur["modele"]],
            "eval": meilleur.to_dict(), "naif": naif, "tableau": tableau}


def prevoir_indicateur(df, cible, mois=range(1, 13)):
    """Choix de la fenêtre sur l'année de test, puis prévision N+1 entraînée sur toutes les années."""
    choix = choisir_modele(df, cible)
    return prevoir(df, cible, mois, choix["fenetre"]), choix


# ============================================================
# CHARGES PAR CATÉGORIE
# ============================================================

def prevoir_categories(charges, annee_reference):
    """
    charges : historique [annee, mois, categorie, montant].
    Chaque catégorie présente sur les 12 mois de `annee_reference` reçoit sa
    propre régression (fenêtre choisie sur l'année de test). Une catégorie
    sans historique avant cette année est reconduite.
    Renvoie (prévisions [annee, mois, categorie, charge_prevue], choix).
    """
    morceaux, choix = [], {}
    for categorie in sorted(charges["categorie"].dropna().unique()):
        hist = garder_annees_completes(
            charges[charges["categorie"] == categorie].dropna(subset=["montant"])
        )
        if len(hist[hist["annee"] == annee_reference]) != 12:
            print(f"[IGNORÉ] {categorie} : absente ou incomplète en {annee_reference}")
            continue
        modele = choisir_modele(hist, "montant")
        if modele["eval"] is None:
            modele["modele"] = MODELE_NAIF
        choix[categorie] = modele
        futur = pd.DataFrame({"annee": annee_reference + 1, "mois": range(1, 13)})
        futur["categorie"] = categorie
        futur["charge_prevue"] = prevoir(hist, "montant", futur["mois"], modele["fenetre"])
        morceaux.append(futur)
    if not morceaux:
        raise ValueError("Aucune prévision par catégorie.")
    return pd.concat(morceaux, ignore_index=True), choix


def tester_charges_categories(charges, choix, annee_test):
    """
    Prévoit les charges de l'année de test, catégorie par catégorie, avec les
    seules années précédentes. Renvoie les 12 totaux mensuels prévus.
    Une catégorie absente l'année avant le test ne peut pas être prévue.
    """
    train = charges[charges["annee"] < annee_test].dropna(subset=["montant"])
    total = np.zeros(12)
    for categorie in sorted(train["categorie"].unique()):
        hist = garder_annees_completes(train[train["categorie"] == categorie])
        if hist.empty or hist["annee"].max() != annee_test - 1:
            continue
        fenetre = choix.get(categorie, {}).get("fenetre", CANDIDATS[MODELE_PAR_DEFAUT])
        total += prevoir(hist, "montant", range(1, 13), fenetre)
    return total


# ============================================================
# RÉSULTAT ET FOURCHETTES
# ============================================================

def tester_resultat(df, fenetres, charges_test=None):
    """
    Résultat opérationnel de l'année de test prévu avec les années
    précédentes (modèles retenus combinés) ; renvoie l'évaluation.
    """
    train, test, _ = separer_train_test(df)
    if train.empty:
        return None
    mois = test["mois"].to_numpy()
    p = {
        c: (prevoir_naif(train, c, mois) if f == MODELE_NAIF else prevoir(train, c, mois, f))
        for c, f in fenetres.items()
    }
    if charges_test is not None:
        p["charges_exploitation"] = np.asarray(charges_test, dtype=float)
    pred = (p["ca_export"] - p["charges_exploitation"] - p["frais_export"]
            - p["masse_salariale"] - p["amortissements"])
    reel = (test["ca_export"] - test["charges_exploitation"] - test["frais_export"]
            - test["masse_salariale"] - test["amortissements"]).to_numpy(dtype=float)
    return evaluer_test(reel, pred)


def borne_80(valeur, erreur_pct):
    """Fourchette ~80 % ; bornes remises dans l'ordre si la valeur est négative."""
    marge = Z_80 * erreur_pct / 100
    a, b = valeur * (1 - marge), valeur * (1 + marge)
    return min(a, b), max(a, b)
