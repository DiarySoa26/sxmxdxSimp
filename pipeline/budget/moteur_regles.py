# from decimal import Decimal, InvalidOperation
# from pathlib import Path
# import json

# REGLES_FILE = Path("output/reverse_engineering/regles_executables.json")
# OPERATIONS_AUTORISEES = {"SOMME", "SOMME_CONDITIONNELLE", "SOUSTRACTION", "DIVISION"}

# def decimaliser(valeur):
#     if valeur is None:
#         return Decimal("0")
#     if isinstance(valeur, Decimal):
#         return valeur
#     if isinstance(valeur, bool):
#         return Decimal(int(valeur))
#     texte = str(valeur).strip().replace(" ", "").replace(",", ".")
#     if not texte:
#         return Decimal("0")
#     try:
#         return Decimal(texte)
#     except InvalidOperation as exc:
#         raise ValueError(f"Valeur numérique invalide : {valeur}") from exc

# def somme(valeurs):
#     return sum((decimaliser(v) for v in valeurs), Decimal("0"))

# def soustraction(valeur_initiale, valeurs):
#     resultat = decimaliser(valeur_initiale)
#     for valeur in valeurs:
#         resultat -= decimaliser(valeur)
#     return resultat

# def division(numerateur, denominateur, valeur_si_zero=Decimal("0")):
#     numerateur, denominateur = decimaliser(numerateur), decimaliser(denominateur)
#     return decimaliser(valeur_si_zero) if denominateur == 0 else numerateur / denominateur

# def somme_conditionnelle(lignes, champ_valeur, criteres=None):
#     criteres = criteres or {}
#     return somme(
#         ligne.get(champ_valeur, 0)
#         for ligne in lignes
#         if all(ligne.get(champ) == valeur for champ, valeur in criteres.items())
#     )

# def charger_regles(chemin=REGLES_FILE):
#     if not chemin.exists():
#         raise FileNotFoundError(f"Fichier de règles introuvable : {chemin}")
#     with chemin.open("r", encoding="utf-8") as fichier:
#         regles = json.load(fichier).get("regles", [])
#     if not regles:
#         raise ValueError("Aucune règle exécutable trouvée.")
#     return regles

# def verifier_regles_re():
#     regles = charger_regles()
#     erreurs = [
#         regle.get("operation")
#         for regle in regles
#         if regle.get("operation") not in OPERATIONS_AUTORISEES
#     ]
#     if erreurs:
#         raise RuntimeError(f"Opérations RE non supportées : {', '.join(map(str, erreurs))}")
#     return True

# def calculer_ca_export(exportations):
#     return somme(ligne.get("ca_mga", 0) for ligne in exportations)

# def calculer_charges(charges):
#     return somme(ligne.get("montant", 0) for ligne in charges)

# def calculer_frais_export(frais):
#     return somme(ligne.get("total", 0) for ligne in frais)

# def calculer_masse_salariale(employes):
#     return somme(ligne.get("cout_total", 0) for ligne in employes)

# def calculer_resultat_operationnel(ca_export, charges, frais_export, masse_salariale):
#     return soustraction(ca_export, [charges, frais_export, masse_salariale])

# def calculer_marge_operationnelle(resultat_operationnel, ca_export):
#     return division(resultat_operationnel, ca_export)

# def calculer_budget_mensuel(exportations, charges, frais_export, employes):
#     ca = calculer_ca_export(exportations)
#     charges_exploitation = calculer_charges(charges)
#     frais = calculer_frais_export(frais_export)
#     masse = calculer_masse_salariale(employes)
#     resultat = calculer_resultat_operationnel(ca, charges_exploitation, frais, masse)
#     return {
#         "ca_export": ca,
#         "charges_exploitation": charges_exploitation,
#         "frais_export": frais,
#         "masse_salariale": masse,
#         "resultat_operationnel": resultat,
#         "marge_operationnelle": calculer_marge_operationnelle(resultat, ca)
#     }

# def calculer_budget_annuel(budgets_mensuels):
#     ca = somme(m["ca_export"] for m in budgets_mensuels)
#     charges = somme(m["charges_exploitation"] for m in budgets_mensuels)
#     frais = somme(m["frais_export"] for m in budgets_mensuels)
#     masse = somme(m["masse_salariale"] for m in budgets_mensuels)
#     resultat = somme(m["resultat_operationnel"] for m in budgets_mensuels)
#     return {
#         "ca_export": ca,
#         "charges_exploitation": charges,
#         "frais_export": frais,
#         "masse_salariale": masse,
#         "resultat_operationnel": resultat,
#         "marge_operationnelle": division(resultat, ca)
#     }

# if __name__ == "__main__":
#     print(verifier_regles_re())







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

# def calculer_resultat_operationnel(ca_export, charges, frais_export, masse_salariale):
#     return soustraction(ca_export, [charges, frais_export, masse_salariale])

# def calculer_marge_operationnelle(resultat_operationnel, ca_export):
#     return division(resultat_operationnel, ca_export)

# def calculer_budget_mensuel(exportations, charges, frais_export, employes):
#     ca = calculer_ca_export(exportations)
#     charges_exploitation = calculer_charges(charges)
#     frais = calculer_frais_export(frais_export)
#     masse = calculer_masse_salariale(employes)
#     resultat = calculer_resultat_operationnel(ca, charges_exploitation, frais, masse)
#     return {
#         "ca_export": ca,
#         "charges_exploitation": charges_exploitation,
#         "frais_export": frais,
#         "masse_salariale": masse,
#         "resultat_operationnel": resultat,
#         "marge_operationnelle": calculer_marge_operationnelle(resultat, ca)
#     }

# def calculer_budget_annuel(budgets_mensuels):
#     ca = somme(m["ca_export"] for m in budgets_mensuels)
#     charges = somme(m["charges_exploitation"] for m in budgets_mensuels)
#     frais = somme(m["frais_export"] for m in budgets_mensuels)
#     masse = somme(m["masse_salariale"] for m in budgets_mensuels)
#     resultat = somme(m["resultat_operationnel"] for m in budgets_mensuels)
#     return {
#         "ca_export": ca,
#         "charges_exploitation": charges,
#         "frais_export": frais,
#         "masse_salariale": masse,
#         "resultat_operationnel": resultat,
#         "marge_operationnelle": division(resultat, ca)
#     }



def calculer_resultat_operationnel(
    ca_export,
    charges,
    frais_export,
    masse_salariale,
    amortissements=0
):
    return soustraction(
        ca_export,
        [
            charges,
            frais_export,
            masse_salariale,
            amortissements
        ]
    )


def calculer_marge_operationnelle(
    resultat_operationnel,
    ca_export
):
    return division(resultat_operationnel, ca_export)


def calculer_budget_mensuel(
    exportations,
    charges,
    frais_export,
    employes,
    amortissements=0
):
    ca = calculer_ca_export(exportations)
    charges_exploitation = calculer_charges(charges)
    frais = calculer_frais_export(frais_export)
    masse = calculer_masse_salariale(employes)

    amort = decimaliser(amortissements)

    resultat = calculer_resultat_operationnel(
        ca,
        charges_exploitation,
        frais,
        masse,
        amort
    )

    return {
        "ca_export": ca,
        "charges_exploitation": charges_exploitation,
        "frais_export": frais,
        "masse_salariale": masse,
        "amortissements": amort,
        "resultat_operationnel": resultat,
        "marge_operationnelle":
            calculer_marge_operationnelle(resultat, ca)
    }


def calculer_budget_annuel(budgets_mensuels):
    ca = somme(
        m["ca_export"] for m in budgets_mensuels
    )

    charges = somme(
        m["charges_exploitation"] for m in budgets_mensuels
    )

    frais = somme(
        m["frais_export"] for m in budgets_mensuels
    )

    masse = somme(
        m["masse_salariale"] for m in budgets_mensuels
    )

    amort = somme(
        m.get("amortissements", 0)
        for m in budgets_mensuels
    )

    resultat = somme(
        m["resultat_operationnel"]
        for m in budgets_mensuels
    )

    return {
        "ca_export": ca,
        "charges_exploitation": charges,
        "frais_export": frais,
        "masse_salariale": masse,
        "amortissements": amort,
        "resultat_operationnel": resultat,
        "marge_operationnelle": division(resultat, ca)
    }


if __name__ == "__main__":
    print(verifier_regles_re())