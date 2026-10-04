# from decimal import Decimal, InvalidOperation
# from pathlib import Path
# import json


# REGLES_FILE = Path(
#     "output/reverse_engineering/regles_executables.json"
# )


# # ============================================================
# # CONVERSION DECIMAL
# # ============================================================

# def decimaliser(valeur):
#     """
#     Convertit une valeur en Decimal.

#     None ou chaîne vide deviennent 0.
#     """

#     if valeur is None:
#         return Decimal("0")

#     if isinstance(valeur, Decimal):
#         return valeur

#     if isinstance(valeur, bool):
#         return Decimal(int(valeur))

#     texte = str(valeur).strip()

#     if not texte:
#         return Decimal("0")

#     texte = texte.replace(" ", "")
#     texte = texte.replace(",", ".")

#     try:
#         return Decimal(texte)

#     except InvalidOperation as exc:
#         raise ValueError(
#             f"Valeur numérique invalide : {valeur}"
#         ) from exc


# # ============================================================
# # OPERATIONS ELEMENTAIRES
# # ============================================================

# def somme(valeurs):
#     """
#     Additionne plusieurs valeurs.
#     """

#     total = Decimal("0")

#     for valeur in valeurs:
#         total += decimaliser(valeur)

#     return total


# def soustraction(valeur_initiale, valeurs_a_soustraire):
#     """
#     Exemple :

#     CA - charges - frais_export - salaires
#     """

#     resultat = decimaliser(
#         valeur_initiale
#     )

#     for valeur in valeurs_a_soustraire:
#         resultat -= decimaliser(
#             valeur
#         )

#     return resultat


# def division(
#     numerateur,
#     denominateur,
#     valeur_si_zero=Decimal("0")
# ):
#     """
#     Division protégée contre une division par zéro.
#     """

#     numerateur = decimaliser(
#         numerateur
#     )

#     denominateur = decimaliser(
#         denominateur
#     )

#     if denominateur == 0:
#         return decimaliser(
#             valeur_si_zero
#         )

#     return numerateur / denominateur


# def somme_conditionnelle(
#     lignes,
#     champ_valeur,
#     criteres=None
# ):
#     """
#     Équivalent applicatif simplifié de SUMIF / SUMIFS.

#     Exemple :

#     lignes = [
#         {
#             "pays": "Japon",
#             "ca_mga": 100
#         },
#         {
#             "pays": "Chine",
#             "ca_mga": 200
#         }
#     ]

#     criteres = {
#         "pays": "Japon"
#     }

#     Résultat = 100
#     """

#     if criteres is None:
#         criteres = {}

#     total = Decimal("0")

#     for ligne in lignes:

#         correspond = True

#         for champ, valeur_attendue in criteres.items():

#             valeur_reelle = ligne.get(
#                 champ
#             )

#             if valeur_reelle != valeur_attendue:
#                 correspond = False
#                 break

#         if correspond:
#             total += decimaliser(
#                 ligne.get(
#                     champ_valeur,
#                     0
#                 )
#             )

#     return total


# # ============================================================
# # OPERATIONS AUTORISEES
# # ============================================================

# OPERATIONS_AUTORISEES = {
#     "SOMME",
#     "SOMME_CONDITIONNELLE",
#     "SOUSTRACTION",
#     "DIVISION"
# }


# def verifier_operation(operation):

#     if operation not in OPERATIONS_AUTORISEES:

#         raise ValueError(
#             f"Opération non autorisée : {operation}"
#         )


# # ============================================================
# # CHARGEMENT DES REGLES
# # ============================================================

# def charger_regles(
#     chemin=REGLES_FILE
# ):

#     if not chemin.exists():

#         raise FileNotFoundError(
#             f"Fichier de règles introuvable : "
#             f"{chemin}"
#         )

#     with chemin.open(
#         "r",
#         encoding="utf-8"
#     ) as fichier:

#         document = json.load(
#             fichier
#         )

#     regles = document.get(
#         "regles",
#         []
#     )

#     if not regles:

#         raise ValueError(
#             "Aucune règle exécutable trouvée."
#         )

#     return regles


# # ============================================================
# # INDEXATION DES REGLES
# # ============================================================

# def indexer_regles(regles):

#     index = {}

#     for regle in regles:

#         identifiant = regle.get(
#             "id"
#         )

#         if not identifiant:
#             continue

#         if identifiant in index:

#             raise ValueError(
#                 f"Règle dupliquée : {identifiant}"
#             )

#         index[identifiant] = regle

#     return index


# # ============================================================
# # FILTRAGE PAR PERIODICITE
# # ============================================================

# def regles_par_periodicite(
#     regles,
#     periodicite
# ):

#     return [
#         regle
#         for regle in regles
#         if regle.get("periodicite")
#         == periodicite
#     ]


# # ============================================================
# # FILTRAGE PAR DOMAINE
# # ============================================================

# def regles_par_domaine(
#     regles,
#     domaine
# ):

#     return [
#         regle
#         for regle in regles
#         if regle.get("domaine")
#         == domaine
#     ]


# # ============================================================
# # CALCULS BUDGETAIRES
# # ============================================================

# def calculer_ca_export(
#     exportations
# ):
#     """
#     CA export total d'un mois.
#     """

#     return somme(
#         ligne.get("ca_mga", 0)
#         for ligne in exportations
#     )


# def calculer_charges(
#     charges
# ):
#     """
#     Charges d'exploitation d'un mois.
#     """

#     return somme(
#         ligne.get("montant", 0)
#         for ligne in charges
#     )


# def calculer_frais_export(
#     frais
# ):
#     """
#     Frais d'exportation d'un mois.
#     """

#     return somme(
#         ligne.get("total", 0)
#         for ligne in frais
#     )


# def calculer_masse_salariale(
#     employes
# ):
#     """
#     Masse salariale mensuelle.

#     Le modèle Excel considère actuellement
#     le coût total des employés comme une charge
#     mensuelle.
#     """

#     return somme(
#         ligne.get("cout_total", 0)
#         for ligne in employes
#     )


# def calculer_resultat_operationnel(
#     ca_export,
#     charges,
#     frais_export,
#     masse_salariale
# ):

#     return soustraction(
#         ca_export,
#         [
#             charges,
#             frais_export,
#             masse_salariale
#         ]
#     )


# def calculer_marge_operationnelle(
#     resultat_operationnel,
#     ca_export
# ):
#     """
#     Retourne un ratio.

#     Exemple :
#     0.25 = 25 %
#     """

#     return division(
#         resultat_operationnel,
#         ca_export
#     )


# # ============================================================
# # CALCUL D'UN MOIS
# # ============================================================

# def calculer_budget_mensuel(
#     exportations,
#     charges,
#     frais_export,
#     employes
# ):

#     ca_export = calculer_ca_export(
#         exportations
#     )

#     charges_exploitation = calculer_charges(
#         charges
#     )

#     total_frais_export = (
#         calculer_frais_export(
#             frais_export
#         )
#     )

#     masse_salariale = (
#         calculer_masse_salariale(
#             employes
#         )
#     )

#     resultat_operationnel = (
#         calculer_resultat_operationnel(
#             ca_export,
#             charges_exploitation,
#             total_frais_export,
#             masse_salariale
#         )
#     )

#     marge_operationnelle = (
#         calculer_marge_operationnelle(
#             resultat_operationnel,
#             ca_export
#         )
#     )

#     return {
#         "ca_export":
#             ca_export,

#         "charges_exploitation":
#             charges_exploitation,

#         "frais_export":
#             total_frais_export,

#         "masse_salariale":
#             masse_salariale,

#         "resultat_operationnel":
#             resultat_operationnel,

#         "marge_operationnelle":
#             marge_operationnelle
#     }


# # ============================================================
# # CALCUL ANNUEL
# # ============================================================

# def calculer_budget_annuel(
#     budgets_mensuels
# ):

#     ca_annuel = somme(
#         mois["ca_export"]
#         for mois in budgets_mensuels
#     )

#     charges_annuelles = somme(
#         mois["charges_exploitation"]
#         for mois in budgets_mensuels
#     )

#     frais_annuels = somme(
#         mois["frais_export"]
#         for mois in budgets_mensuels
#     )

#     salaires_annuels = somme(
#         mois["masse_salariale"]
#         for mois in budgets_mensuels
#     )

#     resultat_annuel = somme(
#         mois["resultat_operationnel"]
#         for mois in budgets_mensuels
#     )

#     marge_annuelle = division(
#         resultat_annuel,
#         ca_annuel
#     )

#     return {
#         "ca_export":
#             ca_annuel,

#         "charges_exploitation":
#             charges_annuelles,

#         "frais_export":
#             frais_annuels,

#         "masse_salariale":
#             salaires_annuels,

#         "resultat_operationnel":
#             resultat_annuel,

#         "marge_operationnelle":
#             marge_annuelle
#     }


# # ============================================================
# # CONTROLE DES REGLES DU RE
# # ============================================================

# def verifier_regles_re():

#     regles = charger_regles()

#     print()
#     print("=" * 70)
#     print(
#         "SXMXDX - MOTEUR DE REGLES"
#     )
#     print("=" * 70)

#     print(
#         f"\nRègles chargées : "
#         f"{len(regles)}"
#     )

#     erreurs = []

#     for regle in regles:

#         operation = regle.get(
#             "operation"
#         )

#         try:

#             verifier_operation(
#                 operation
#             )

#         except ValueError as exc:

#             erreurs.append(
#                 str(exc)
#             )

#     mensuelles = (
#         regles_par_periodicite(
#             regles,
#             "MENSUELLE"
#         )
#     )

#     annuelles = (
#         regles_par_periodicite(
#             regles,
#             "ANNUELLE"
#         )
#     )

#     uniques = (
#         regles_par_periodicite(
#             regles,
#             "UNIQUE"
#         )
#     )

#     print(
#         f"Règles mensuelles : "
#         f"{len(mensuelles)}"
#     )

#     print(
#         f"Règles annuelles  : "
#         f"{len(annuelles)}"
#     )

#     print(
#         f"Règles uniques    : "
#         f"{len(uniques)}"
#     )

#     print()

#     if erreurs:

#         print(
#             "[ERREUR] Certaines opérations "
#             "ne sont pas supportées :"
#         )

#         for erreur in erreurs:
#             print(
#                 f" - {erreur}"
#             )

#         raise RuntimeError(
#             "Règles incompatibles avec "
#             "le moteur."
#         )

#     print(
#         "[OK] Toutes les opérations du RE "
#         "sont supportées par le moteur."
#     )

#     print("=" * 70)

#     return True


# # ============================================================
# # TEST LOCAL
# # ============================================================

# def test_moteur():

#     print()
#     print("-" * 70)
#     print("TEST DU MOTEUR")
#     print("-" * 70)

#     exportations = [
#         {
#             "pays": "Japon",
#             "ca_mga": Decimal("500000")
#         },
#         {
#             "pays": "Chine",
#             "ca_mga": Decimal("300000")
#         }
#     ]

#     charges = [
#         {
#             "montant": Decimal("100000")
#         },
#         {
#             "montant": Decimal("50000")
#         }
#     ]

#     frais_export = [
#         {
#             "total": Decimal("40000")
#         }
#     ]

#     employes = [
#         {
#             "cout_total": Decimal("100000")
#         },
#         {
#             "cout_total": Decimal("80000")
#         }
#     ]

#     resultat = calculer_budget_mensuel(
#         exportations,
#         charges,
#         frais_export,
#         employes
#     )

#     print()

#     for cle, valeur in resultat.items():

#         print(
#             f"{cle:<30} : {valeur}"
#         )

#     print()
#     print("[OK] Test moteur terminé.")


# # ============================================================
# # MAIN
# # ============================================================

# if __name__ == "__main__":

#     verifier_regles_re()

#     test_moteur()




from decimal import Decimal, InvalidOperation
from pathlib import Path
import json

REGLES_FILE = Path("output/reverse_engineering/regles_executables.json")
OPERATIONS_AUTORISEES = {"SOMME", "SOMME_CONDITIONNELLE", "SOUSTRACTION", "DIVISION"}

def decimaliser(valeur):
    if valeur is None:
        return Decimal("0")
    if isinstance(valeur, Decimal):
        return valeur
    if isinstance(valeur, bool):
        return Decimal(int(valeur))
    texte = str(valeur).strip().replace(" ", "").replace(",", ".")
    if not texte:
        return Decimal("0")
    try:
        return Decimal(texte)
    except InvalidOperation as exc:
        raise ValueError(f"Valeur numérique invalide : {valeur}") from exc

def somme(valeurs):
    return sum((decimaliser(v) for v in valeurs), Decimal("0"))

def soustraction(valeur_initiale, valeurs):
    resultat = decimaliser(valeur_initiale)
    for valeur in valeurs:
        resultat -= decimaliser(valeur)
    return resultat

def division(numerateur, denominateur, valeur_si_zero=Decimal("0")):
    numerateur, denominateur = decimaliser(numerateur), decimaliser(denominateur)
    return decimaliser(valeur_si_zero) if denominateur == 0 else numerateur / denominateur

def somme_conditionnelle(lignes, champ_valeur, criteres=None):
    criteres = criteres or {}
    return somme(
        ligne.get(champ_valeur, 0)
        for ligne in lignes
        if all(ligne.get(champ) == valeur for champ, valeur in criteres.items())
    )

def charger_regles(chemin=REGLES_FILE):
    if not chemin.exists():
        raise FileNotFoundError(f"Fichier de règles introuvable : {chemin}")
    with chemin.open("r", encoding="utf-8") as fichier:
        regles = json.load(fichier).get("regles", [])
    if not regles:
        raise ValueError("Aucune règle exécutable trouvée.")
    return regles

def verifier_regles_re():
    regles = charger_regles()
    erreurs = [
        regle.get("operation")
        for regle in regles
        if regle.get("operation") not in OPERATIONS_AUTORISEES
    ]
    if erreurs:
        raise RuntimeError(f"Opérations RE non supportées : {', '.join(map(str, erreurs))}")
    return True

def calculer_ca_export(exportations):
    return somme(ligne.get("ca_mga", 0) for ligne in exportations)

def calculer_charges(charges):
    return somme(ligne.get("montant", 0) for ligne in charges)

def calculer_frais_export(frais):
    return somme(ligne.get("total", 0) for ligne in frais)

def calculer_masse_salariale(employes):
    return somme(ligne.get("cout_total", 0) for ligne in employes)

def calculer_resultat_operationnel(ca_export, charges, frais_export, masse_salariale):
    return soustraction(ca_export, [charges, frais_export, masse_salariale])

def calculer_marge_operationnelle(resultat_operationnel, ca_export):
    return division(resultat_operationnel, ca_export)

def calculer_budget_mensuel(exportations, charges, frais_export, employes):
    ca = calculer_ca_export(exportations)
    charges_exploitation = calculer_charges(charges)
    frais = calculer_frais_export(frais_export)
    masse = calculer_masse_salariale(employes)
    resultat = calculer_resultat_operationnel(ca, charges_exploitation, frais, masse)
    return {
        "ca_export": ca,
        "charges_exploitation": charges_exploitation,
        "frais_export": frais,
        "masse_salariale": masse,
        "resultat_operationnel": resultat,
        "marge_operationnelle": calculer_marge_operationnelle(resultat, ca)
    }

def calculer_budget_annuel(budgets_mensuels):
    ca = somme(m["ca_export"] for m in budgets_mensuels)
    charges = somme(m["charges_exploitation"] for m in budgets_mensuels)
    frais = somme(m["frais_export"] for m in budgets_mensuels)
    masse = somme(m["masse_salariale"] for m in budgets_mensuels)
    resultat = somme(m["resultat_operationnel"] for m in budgets_mensuels)
    return {
        "ca_export": ca,
        "charges_exploitation": charges,
        "frais_export": frais,
        "masse_salariale": masse,
        "resultat_operationnel": resultat,
        "marge_operationnelle": division(resultat, ca)
    }

if __name__ == "__main__":
    print(verifier_regles_re())