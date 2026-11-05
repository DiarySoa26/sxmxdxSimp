from datetime import date
from pathlib import Path

import numpy as np
import pandas as pd

BASE = Path(__file__).resolve().parent.parent
OUT = BASE / "output"

dataset = pd.read_csv(OUT / "dataset_ml.csv")
N = int(dataset["annee"].max())
ANNEE = N + 1
PREMIERE = int(dataset["annee"].min())

budget = pd.read_csv(OUT / f"prediction_budget_{ANNEE}_annuel.csv").iloc[0]
mensuel = pd.read_csv(OUT / f"prediction_budget_{ANNEE}_mensuel.csv")
derives = pd.read_csv(OUT / f"derives_categories_{ANNEE}.csv")
intervalles = pd.read_csv(OUT / f"prediction_budget_{ANNEE}_intervalles.csv").set_index("indicateur")


def lire_csv(nom):
    chemin = OUT / nom
    return pd.read_csv(chemin) if chemin.is_file() else pd.DataFrame()


metriques_cat = lire_csv("metriques_charges_categories.csv")
alertes = []
if (OUT / "alertes_qualite_donnees.txt").is_file():
    alertes = [l.strip() for l in (OUT / "alertes_qualite_donnees.txt").read_text(encoding="utf-8").splitlines()
               if l.strip() and not l.lower().startswith("aucune alerte")]

reference = dataset[dataset["annee"] == N]
ref = {
    "ventes": reference["ventes"].sum(),
    "ca_export": reference["ca_export"].sum(),
    "production": reference["production_reelle"].sum(),
    "charges_exploitation": reference["charges_exploitation"].sum(),
    "frais_export": reference["frais_export"].sum(),
    "masse_salariale": reference["masse_salariale"].sum(),
    "amortissements": reference["amortissements"].sum(),
}
ref["resultat_operationnel"] = (ref["ca_export"] - ref["charges_exploitation"] - ref["frais_export"]
                                - ref["masse_salariale"] - ref["amortissements"])
ref["marge_operationnelle"] = ref["resultat_operationnel"] / ref["ca_export"] if ref["ca_export"] else 0

MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet",
        "août", "septembre", "octobre", "novembre", "décembre"]
NOMS_CATEGORIES = {"ACHAT PRODUITS": "achats de produits", "SECURITE": "sécurité",
                   "LOGISTIQUE": "logistique", "FINANCE": "finance", "FISCAL": "fiscalité",
                   "PRODUCTION": "production"}
NIVEAUX = ["FAIBLE", "MODERE", "ELEVE", "CRITIQUE"]
LIBELLE_NIVEAU = {"FAIBLE": "rien d'anormal", "MODERE": "à surveiller",
                  "ELEVE": "à examiner en priorité", "CRITIQUE": "à vérifier sans attendre"}


# ------------------------------------------------------------
# Mise en forme
# ------------------------------------------------------------
def fr(v, d=2):
    return f"{float(v):,.{d}f}".replace(",", "\u202f").replace(".", ",")


def montant(v, signe=False):
    v = float(v)
    s = "+" if signe and v > 0 else ("−" if v < 0 else "")
    a = abs(v)
    if a >= 1e9:
        texte = f"{fr(a / 1e9, 2)} {'milliard' if a < 2e9 else 'milliards'} MGA"
    elif a >= 1e6:
        texte = f"{fr(a / 1e6, 1)} {'million' if a < 2e6 else 'millions'} MGA"
    else:
        texte = f"{fr(a, 0)} MGA"
    return s + texte


def pct(v, signe=True):
    v = float(v)
    if not np.isfinite(v):
        return "n.d."
    s = "+" if signe and v > 0 else ("−" if v < 0 else "")
    return f"{s}{fr(abs(v), 1)} %"


def variation(nouveau, ancien):
    return (nouveau - ancien) / abs(ancien) * 100 if ancien else np.nan


def tendance(v, feminin=False, pluriel=False):
    """'en hausse de 2,6 %', 'stable', 'en forte baisse de 18,0 %'."""
    v = float(v)
    if not np.isfinite(v):
        return "non comparable"
    if abs(v) < 0.5:
        return "stable" + ("s" if pluriel else "")
    force = "légère " if abs(v) < 3 else ("forte " if abs(v) >= 15 else "")
    return f"en {force}{'hausse' if v > 0 else 'baisse'} de {pct(abs(v), False)}"


def nom_cat(c):
    return NOMS_CATEGORIES.get(str(c).upper(), str(c).lower())


def fourchette(indicateur):
    if indicateur not in intervalles.index:
        return None
    l = intervalles.loc[indicateur]
    if pd.isna(l["borne_basse_80"]) or pd.isna(l["borne_haute_80"]):
        return None
    return f"entre {montant(l['borne_basse_80'])} et {montant(l['borne_haute_80'])}"


# ------------------------------------------------------------
# Chiffres clés
# ------------------------------------------------------------
ca, ca_n = float(budget["ca_export"]), ref["ca_export"]
resultat, resultat_n = float(budget["resultat_operationnel"]), ref["resultat_operationnel"]
marge = float(budget["marge_operationnelle"]) * 100
depenses = sum(float(budget[c]) for c in ["charges_exploitation", "frais_export",
                                         "masse_salariale", "amortissements"])
depenses_n = sum(ref[c] for c in ["charges_exploitation", "frais_export",
                                  "masse_salariale", "amortissements"])
hypothese_ms = str(budget.get("hypothese_masse_salariale", "TENDANCE")).upper()

distribution = derives["niveau_risque"].value_counts()
nb = {n: int(distribution.get(n, 0)) for n in NIVEAUX}
pire = max((n for n in NIVEAUX if nb[n]), key=NIVEAUX.index, default="FAIBLE")


def phrase_resultat(valeur):
    if valeur >= 0:
        return f"un bénéfice d'exploitation de {montant(valeur)}"
    return f"une perte d'exploitation de {montant(abs(valeur))}"


lignes = [
    # f"BUDGET PRÉVISIONNEL {ANNEE} — RÉSUMÉ DE L'ANALYSE",
    f"BUDGET PRÉVISIONNEL {ANNEE}",
    # f"Prévision établie le {date.today():%d/%m/%Y}. Modèle entraîné sur les exercices {PREMIERE} à {N - 1}, "
    # f"testé sur {N}, puis réentraîné sur {PREMIERE}–{N}. Comparaisons faites avec l'exercice {N}.",
    "",
    # "EN BREF",
    "",
    f"En {ANNEE}, le chiffre d'affaires à l'exportation atteindrait {montant(ca)}, "
    f"{tendance(variation(ca, ca_n))} par rapport à {N}. L'ensemble des dépenses d'exploitation "
    f"(charges, frais d'exportation, masse salariale et amortissements) s'élèverait à {montant(depenses)}, "
    f"{tendance(variation(depenses, depenses_n), feminin=True)}.",
    "",
]

if resultat >= 0:
    texte = (f"L'exercice {ANNEE} dégagerait {phrase_resultat(resultat)}, soit une marge de {pct(marge, False)} : ")
            #  f"sur 100 MGA de chiffre d'affaires, il resterait environ {fr(marge, 0)} MGA après toutes les dépenses.")
else:
    # texte = (f"L'exercice {ANNEE} se solderait par {phrase_resultat(resultat)}, "
    #          f"soit une marge de {pct(marge)} : pour 100 MGA de chiffre d'affaires, l'entreprise dépenserait "
    #          f"environ {fr(100 - marge, 0)} MGA.")
    texte = (f"L'exercice {ANNEE} se solderait par {phrase_resultat(resultat)}, "
                 f"soit une marge de {pct(marge)}")
texte += f" Pour comparaison, l'exercice {N} s'est terminé sur {phrase_resultat(resultat_n)}."
lignes += [texte, ""]

points = []
if alertes:
    points.append("des données historiques semblent recopiées d'une année sur l'autre (voir la partie 7), "
                  "ce qui fragilise la prévision")
if pire in ("ELEVE", "CRITIQUE"):
    points.append("certains postes de dépenses s'écartent nettement de ce que l'activité prévue justifie (partie 6)")
if points:
    lignes += ["Points d'attention : " + " ; ".join(points) + ".", ""]

# ------------------------------------------------------------
# 1. Prévisions
# ------------------------------------------------------------
def ligne_indicateur(libelle, cle_budget, cle_ref, unite_montant=True):
    prevu, avant = float(budget[cle_budget]), ref[cle_ref]
    valeur = montant(prevu) if unite_montant else f"{fr(prevu, 0)} unités"
    valeur_n = montant(avant) if unite_montant else f"{fr(avant, 0)} unités"
    return f"- {libelle} : {valeur} ({N} : {valeur_n} ; {pct(variation(prevu, avant))})"


lignes += [
    f"1. PRÉVISIONS POUR {ANNEE}",
    "",
    ligne_indicateur("Ventes à l'exportation", "ventes", "ventes", False),
    ligne_indicateur("Production", "production", "production", False),
    ligne_indicateur("Chiffre d'affaires à l'exportation", "ca_export", "ca_export"),
    ligne_indicateur("Charges d'exploitation", "charges_exploitation", "charges_exploitation"),
    ligne_indicateur("Frais d'exportation", "frais_export", "frais_export"),
    ligne_indicateur("Masse salariale", "masse_salariale", "masse_salariale"),
    ligne_indicateur("Dotations aux amortissements", "amortissements", "amortissements"),
    f"- Résultat opérationnel : {montant(resultat)} ({N} : {montant(resultat_n)})",
    f"- Marge opérationnelle : {pct(marge)} ({N} : {pct(ref['marge_operationnelle'] * 100)})",
    "",
]

# ------------------------------------------------------------
# 2. Explication de l'évolution du résultat
# ------------------------------------------------------------
effets = [
    ("du chiffre d'affaires", ca - ca_n, +1),
    ("des charges d'exploitation", float(budget["charges_exploitation"]) - ref["charges_exploitation"], -1),
    ("des frais d'exportation", float(budget["frais_export"]) - ref["frais_export"], -1),
    ("de la masse salariale", float(budget["masse_salariale"]) - ref["masse_salariale"], -1),
    ("des amortissements", float(budget["amortissements"]) - ref["amortissements"], -1),
]
delta = resultat - resultat_n
lignes += [
    "2. CE QUI FAIT ÉVOLUER LE RÉSULTAT",
    "",
    f"Le résultat opérationnel passe de {montant(resultat_n)} à {montant(resultat)}, "
    f"soit {'une amélioration' if delta >= 0 else 'une dégradation'} de {montant(abs(delta))}. "
    # "Contribution de chaque poste (un montant positif améliore le résultat) :",
]
for libelle, ecart, sens in sorted(effets, key=lambda e: -abs(e[1])):
    effet = sens * ecart
    mouvement = "hausse" if ecart > 0 else "baisse"
    lignes.append(f"- {mouvement.capitalize()} {libelle} : {montant(effet, signe=True)}")
lignes.append("")

# ------------------------------------------------------------
# 3. Charges par poste
# ------------------------------------------------------------
if not metriques_cat.empty:
    total_cat = metriques_cat["montant_prevu"].sum()
    lignes += ["3. CHARGES D'EXPLOITATION PAR POSTE", "",
               f"Les charges d'exploitation sont la somme de prévisions établies poste par poste "
               f"({montant(total_cat)} au total) :"]
    for _, c in metriques_cat.sort_values("montant_prevu", ascending=False).iterrows():
        part = c["montant_prevu"] / total_cat * 100 if total_cat else np.nan
        lignes.append(f"- {nom_cat(c['categorie']).capitalize()} : {montant(c['montant_prevu'])} "
                      f"({fr(part, 0)} % du total ; {pct(c['evolution_pct'])} par rapport à {N})")
    # lignes += ["Le poste « administration » n'est pas inclus dans ces charges.", ""]

# ------------------------------------------------------------
# 4. Profil mensuel
# ------------------------------------------------------------
ca_max = mensuel.loc[mensuel["ca_export"].idxmax()]
ca_min = mensuel.loc[mensuel["ca_export"].idxmin()]
ecart_mois = (ca_max["ca_export"] - ca_min["ca_export"]) / mensuel["ca_export"].mean() * 100
mois_negatifs = mensuel[mensuel["resultat_operationnel"] < 0]["mois"].astype(int).tolist()
lignes += ["4. MOIS PAR MOIS", "",
           f"Le chiffre d'affaires le plus élevé est attendu en {MOIS[int(ca_max['mois']) - 1]} "
           f"({montant(ca_max['ca_export'])}) et le plus faible en {MOIS[int(ca_min['mois']) - 1]} "
           f"({montant(ca_min['ca_export'])}), soit un écart de {fr(ecart_mois, 0)} % : l'activité serait "
           + ("assez régulière sur l'année." if ecart_mois < 10 else "nettement saisonnière.")]
if len(mois_negatifs) == 12:
    lignes.append("Le résultat opérationnel serait négatif tous les mois de l'année.")
elif mois_negatifs:
    lignes.append("Le résultat opérationnel serait négatif en " + ", ".join(MOIS[m - 1] for m in mois_negatifs) + ".")
else:
    lignes.append("Le résultat opérationnel serait positif chaque mois.")
lignes.append("")

# ------------------------------------------------------------
# 5. Méthode et fiabilité
# ------------------------------------------------------------
NOMS_INDIC = {"ventes": "Ventes", "ca_export": "Chiffre d'affaires", "production_reelle": "Production",
              "charges_exploitation": "Charges d'exploitation", "frais_export": "Frais d'exportation",
              "masse_salariale": "Masse salariale", "amortissements": "Amortissements",
              "resultat_operationnel": "Résultat opérationnel"}
PERIODES = {"REG_LIN_3ANS": "3 dernières années", "REG_LIN_5ANS": "5 dernières années",
            "REG_LIN_8ANS": "8 dernières années", "REG_LIN_TOUT": "toutes les années",
            "SOMME_CATEGORIES": "somme des postes", "RECONDUCTION": f"reconduction de {N - 1}",
            "COMBINAISON": "combinaison des postes"}
lignes += [
    "5. MÉTHODE ET FIABILITÉ", "",
    # "Chaque indicateur est prévu par une régression linéaire qui combine une tendance (l'évolution moyenne "
    # "d'une année sur l'autre) et un profil saisonnier (les mois habituellement plus forts ou plus faibles). "
    # "Les charges d'exploitation sont la somme de régressions établies poste par poste.",
    # "",
    # f"Pour vérifier le modèle avant de l'utiliser, les données sont séparées en deux : les exercices {PREMIERE} "
    # f"à {N - 1} servent à l'entraînement, l'exercice {N} sert de test. Le modèle « prévoit » {N} sans le "
    # f"connaître, puis la prévision est comparée au réel. Plusieurs périodes d'apprentissage sont essayées "
    # "(les 3, 5 ou 8 dernières années, ou toutes) et la plus juste sur l'année de test est retenue. "
    # f"Le modèle retenu est enfin réentraîné sur toutes les années, {N} comprise, pour prévoir {ANNEE}.",
    # "",
    # f"Écart entre la prévision et le réel de {N} (année de test) :",
]
# meilleurs, comparables = 0, 0
# for cle, nom in NOMS_INDIC.items():
#     if cle not in intervalles.index:
#         continue
#     l = intervalles.loc[cle]
#     if pd.isna(l["ecart_annuel_test_pct"]):
#         continue
#     texte = (f"- {nom} : {pct(l['ecart_annuel_test_pct'])} sur l'année, "
#              f"{pct(l['mape_test_pct'], False)} en moyenne par mois ({PERIODES.get(l['modele'], l['modele'])})")
#     if pd.notna(l.get("ecart_reconduction_test_pct")) and l["modele"] not in ("RECONDUCTION", "COMBINAISON"):
#         comparables += 1
#         if abs(l["ecart_annuel_test_pct"]) < abs(l["ecart_reconduction_test_pct"]):
#             meilleurs += 1
#         texte += f" ; recopier {N - 1} aurait donné {pct(l['ecart_reconduction_test_pct'])}"
#     lignes.append(texte)
# if comparables:
#     if meilleurs == comparables:
#         lignes.append(f"Sur {N}, la régression a été plus juste que la simple reconduction pour les {comparables} indicateurs.")
#     else:
#         lignes.append(f"Sur {N}, la régression a été plus juste que la simple reconduction pour {meilleurs} "
#                       f"indicateur(s) sur {comparables}.")
lignes += [
    # f"Ce test ne porte que sur une année : il donne un ordre de grandeur de la précision, pas une garantie.",
    "",
    # f"Fourchettes probables pour {ANNEE} (environ 8 chances sur 10, d'après l'erreur constatée sur {N}) :",
    f"Fourchettes probables pour {ANNEE}",

]
for cle, nom in [("ca_export", "Chiffre d'affaires"), ("charges_exploitation", "Charges d'exploitation"),
                 ("resultat_operationnel", "Résultat opérationnel")]:
    f = fourchette(cle)
    if f:
        lignes.append(f"- {nom} : {f}")
lignes.append("")

# ------------------------------------------------------------
# 6. Surveillance des dépenses
# ------------------------------------------------------------
dm = derives.loc[derives["score_derive"].abs().idxmax()]
lignes += [
    "6. SURVEILLANCE DES DÉPENSES", "",
    "Pour chaque poste, la dépense prévue est comparée à ce que le niveau de production prévu justifie, "
    "d'après la relation entre ce poste et la production observée sur les 5 dernières années.",
    # f"Sur {len(derives)} contrôles (postes × mois) : " + ", ".join(
    #     f"{nb[n]} {l}" for n, l in [("FAIBLE", "sans anomalie"), ("MODERE", "à surveiller"),
    #                                  ("ELEVE", "à examiner en priorité"), ("CRITIQUE", "critiques")] if nb[n]
    # ) + ".",
    f"Le plus grand écart concerne « {nom_cat(dm['categorie'])} » en {MOIS[int(dm['mois']) - 1]} : "
    f"{montant(dm['charge_prevue'])} prévus contre {montant(dm['charge_attendue'])} attendus "
    f"({montant(dm['ecart_mga'], signe=True)}, {pct(dm['ecart_pct'])}) — {LIBELLE_NIVEAU[dm['niveau_risque']]}.",
    "",
    "Poste par poste, sur l'année :",
]
par_cat = derives.groupby("categorie").agg(
    ecart=("ecart_mga", "sum"), attendu=("charge_attendue", "sum"),
    pire=("niveau_risque", lambda s: max(s, key=NIVEAUX.index))).reset_index()
par_cat["rang"] = par_cat["pire"].map(NIVEAUX.index)
for _, c in par_cat.sort_values(["rang", "ecart"], ascending=[False, False]).iterrows():
    sens = "au-dessus" if c["ecart"] > 0 else "en dessous"
    lignes.append(f"- {nom_cat(c['categorie']).capitalize()} : {montant(abs(c['ecart']))} {sens} du niveau attendu "
                  f"({pct(variation(c['attendu'] + c['ecart'], c['attendu']))}) — {LIBELLE_NIVEAU[c['pire']]}")
lignes.append("")

# ------------------------------------------------------------
# 7. Hypothèses et points d'attention
# ------------------------------------------------------------
lignes += ["7. HYPOTHÈSES ET POINTS D'ATTENTION", ""]
if hypothese_ms == "STABLE":
    lignes.append(f"- Masse salariale : reconduite au niveau de {N}. Toute embauche ou augmentation décidée "
                  f"pour {ANNEE} devra s'y ajouter.")
else:
    lignes.append(f"- Masse salariale : elle prolonge l'évolution des années passées "
                  f"({pct(budget['evolution_masse_salariale_pct'])}). Elle doit être remplacée par les décisions "
                  "réelles d'embauche et d'augmentation dès qu'elles sont connues.")
lignes.append("- Les prévisions prolongent les tendances observées : elles n'anticipent pas une rupture "
              "(nouveau contrat, perte d'un client, variation brutale du taux de change).")
if alertes:
    constats = "; ".join(a[0].lower() + a[1:] for a in sorted(alertes))
    lignes.append(f"- Qualité des données : {constats}. Des années recopiées faussent l'apprentissage des tendances : "
                  "vérifier les fichiers importés avant de s'appuyer sur cette prévision.")

texte_final = "\n".join(lignes).rstrip() + "\n"
SORTIE = OUT / f"resume_analyse_{ANNEE}.txt"
SORTIE.write_text(texte_final, encoding="utf-8")
print(texte_final)
print(f"[OK] {SORTIE}")
