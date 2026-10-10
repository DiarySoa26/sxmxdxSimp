from pathlib import Path
import csv
import json
import re
import unicodedata
from collections import defaultdict
from openpyxl.utils.cell import (
    coordinate_from_string,
    column_index_from_string,
)


# ============================================================
# CONFIGURATION
# ============================================================

OUTPUT_DIR = Path("output/reverse_engineering")

FORMULES_FILE = OUTPUT_DIR / "formules.csv"
DEPENDANCES_FILE = OUTPUT_DIR / "dependances.csv"
REGLES_FILE = OUTPUT_DIR / "regles_metier.json"


# ============================================================
# OUTILS TEXTE
# ============================================================

def normaliser_texte(valeur):
    if valeur is None:
        return ""

    valeur = str(valeur).strip()

    valeur = unicodedata.normalize("NFD", valeur)
    valeur = "".join(
        c for c in valeur
        if unicodedata.category(c) != "Mn"
    )

    return valeur


def normaliser_nom(valeur):
    valeur = normaliser_texte(valeur)
    valeur = valeur.upper()

    valeur = re.sub(r"[^A-Z0-9]+", "_", valeur)

    return valeur.strip("_")


# ============================================================
# LECTURE CSV
# ============================================================

def lire_csv(path):
    if not path.exists():
        raise FileNotFoundError(
            f"Fichier introuvable : {path}"
        )

    with path.open(
        "r",
        encoding="utf-8-sig",
        newline=""
    ) as fichier:

        lecteur = csv.DictReader(fichier)

        return list(lecteur)


# ============================================================
# ANALYSE CELLULE
# ============================================================

def analyser_cellule(cellule):
    """
    Exemple :
        C6 -> colonne=3, ligne=6
        O7 -> colonne=15, ligne=7
    """

    try:
        colonne, ligne = coordinate_from_string(cellule)

        return {
            "colonne_lettre": colonne,
            "colonne_numero": column_index_from_string(colonne),
            "ligne": int(ligne)
        }

    except Exception:
        return None


# ============================================================
# DETECTION OPERATION
# ============================================================

def detecter_operation(formule):
    formule_upper = formule.upper().replace(" ", "")

    if "SUMIFS(" in formule_upper or "SUMIF(" in formule_upper:
        return "SOMME_CONDITIONNELLE"

    if "SUM(" in formule_upper or "SOMME(" in formule_upper:
        return "SOMME"

    if "IFERROR(" in formule_upper and "/" in formule_upper:
        return "DIVISION"

    if "/" in formule_upper and "*100" in formule_upper:
        return "POURCENTAGE"

    if "-" in formule_upper:
        return "SOUSTRACTION"

    if "*" in formule_upper:
        return "MULTIPLICATION"

    if "/" in formule_upper:
        return "DIVISION"

    if "+" in formule_upper:
        return "SOMME"

    return "REFERENCE"


# ============================================================
# EXTRACTION REFERENCES EXCEL
# ============================================================

REFERENCE_RE = re.compile(
    r"""
    (?:
        '(?P<sheet_quoted>[^']+)'
        |
        (?P<sheet_simple>[A-Za-zÀ-ÿ0-9_ ]+)
    )?
    !?
    (?P<cell>
        \$?[A-Z]{1,3}\$?\d+
        (?:
            :
            \$?[A-Z]{1,3}\$?\d+
        )?
    )
    """,
    re.VERBOSE
)


def extraire_references(formule, feuille_defaut):
    references = []

    for match in REFERENCE_RE.finditer(formule):

        feuille = (
            match.group("sheet_quoted")
            or match.group("sheet_simple")
            or feuille_defaut
        )

        cellule = match.group("cell")

        cellule = cellule.replace("$", "")

        ref = {
            "feuille": feuille.strip(),
            "cellule": cellule
        }

        if ref not in references:
            references.append(ref)

    return references


# ============================================================
# INDEX DES DEPENDANCES
# ============================================================

def construire_index_dependances(dependances):
    index = defaultdict(list)

    for dep in dependances:

        feuille_destination = (
            dep.get("feuille_destination")
            or dep.get("feuille")
            or ""
        ).strip()

        cellule_destination = (
            dep.get("cellule_destination")
            or dep.get("cellule")
            or ""
        ).strip()

        feuille_source = (
            dep.get("feuille_source")
            or ""
        ).strip()

        cellule_source = (
            dep.get("cellule_source")
            or ""
        ).strip()

        if not feuille_destination or not cellule_destination:
            continue

        if feuille_source and cellule_source:

            valeur = {
                "feuille": feuille_source,
                "cellule": cellule_source.replace("$", "")
            }

            if valeur not in index[
                (feuille_destination, cellule_destination)
            ]:
                index[
                    (feuille_destination, cellule_destination)
                ].append(valeur)

    return index


# ============================================================
# NORMALISATION DES FORMULES
# ============================================================

def normaliser_formule_exacte(formule):
    """
    Utilisé pour détecter les formules strictement identiques.

    Exemple :

    C5 = SUM(Employes!$I$2:$I$61)
    D5 = SUM(Employes!$I$2:$I$61)

    deviennent exactement la même signature.
    """

    formule = formule.upper()
    formule = formule.replace(" ", "")

    return formule


def normaliser_formule_relative(formule, cellule_cible):
    """
    Transforme les références relatives en déplacements
    par rapport à la cellule cible.

    Exemple :

        C6 = C2-C3-C4-C5

    devient :

        =CELL(COL[0],ROW[-4])
         -CELL(COL[0],ROW[-3])
         -CELL(COL[0],ROW[-2])
         -CELL(COL[0],ROW[-1])

    D6 produit la même signature.
    """

    info_cible = analyser_cellule(cellule_cible)

    if not info_cible:
        return normaliser_formule_exacte(formule)

    col_cible = info_cible["colonne_numero"]
    row_cible = info_cible["ligne"]

    formule_normalisee = formule.upper().replace(" ", "")

    # --------------------------------------------------------
    # REFERENCES AVEC FEUILLE
    # --------------------------------------------------------

    pattern_sheet = re.compile(
        r"(?:'([^']+)'|([A-ZÀ-Ÿ0-9_ ]+))!"
        r"(\$?)([A-Z]{1,3})(\$?)(\d+)"
        r"(?:"
        r":"
        r"(\$?)([A-Z]{1,3})(\$?)(\d+)"
        r")?"
    )

    def remplacer_sheet(match):

        sheet = match.group(1) or match.group(2)

        abs_col_1 = match.group(3)
        col_1 = match.group(4)
        abs_row_1 = match.group(5)
        row_1 = int(match.group(6))

        abs_col_2 = match.group(7)
        col_2 = match.group(8)
        abs_row_2 = match.group(9)
        row_2 = match.group(10)

        sheet = normaliser_nom(sheet)

        col_num_1 = column_index_from_string(col_1)

        if abs_col_1 == "$":
            col_repr_1 = f"ABS_COL[{col_1}]"
        else:
            col_repr_1 = f"COL[{col_num_1 - col_cible}]"

        if abs_row_1 == "$":
            row_repr_1 = f"ABS_ROW[{row_1}]"
        else:
            row_repr_1 = f"ROW[{row_1 - row_cible}]"

        if col_2:

            col_num_2 = column_index_from_string(col_2)
            row_2 = int(row_2)

            if abs_col_2 == "$":
                col_repr_2 = f"ABS_COL[{col_2}]"
            else:
                col_repr_2 = f"COL[{col_num_2 - col_cible}]"

            if abs_row_2 == "$":
                row_repr_2 = f"ABS_ROW[{row_2}]"
            else:
                row_repr_2 = f"ROW[{row_2 - row_cible}]"

            return (
                f"{sheet}!"
                f"RANGE("
                f"{col_repr_1},{row_repr_1},"
                f"{col_repr_2},{row_repr_2}"
                f")"
            )

        return (
            f"{sheet}!"
            f"CELL({col_repr_1},{row_repr_1})"
        )

    formule_normalisee = pattern_sheet.sub(
        remplacer_sheet,
        formule_normalisee
    )

    # --------------------------------------------------------
    # REFERENCES LOCALES
    # --------------------------------------------------------

    pattern_local = re.compile(
        r"(?<![A-Z0-9_!])"
        r"(\$?)([A-Z]{1,3})(\$?)(\d+)"
        r"(?:"
        r":"
        r"(\$?)([A-Z]{1,3})(\$?)(\d+)"
        r")?"
    )

    def remplacer_local(match):

        abs_col_1 = match.group(1)
        col_1 = match.group(2)
        abs_row_1 = match.group(3)
        row_1 = int(match.group(4))

        abs_col_2 = match.group(5)
        col_2 = match.group(6)
        abs_row_2 = match.group(7)
        row_2 = match.group(8)

        col_num_1 = column_index_from_string(col_1)

        if abs_col_1 == "$":
            col_repr_1 = f"ABS_COL[{col_1}]"
        else:
            col_repr_1 = f"COL[{col_num_1 - col_cible}]"

        if abs_row_1 == "$":
            row_repr_1 = f"ABS_ROW[{row_1}]"
        else:
            row_repr_1 = f"ROW[{row_1 - row_cible}]"

        if col_2:

            col_num_2 = column_index_from_string(col_2)
            row_2 = int(row_2)

            if abs_col_2 == "$":
                col_repr_2 = f"ABS_COL[{col_2}]"
            else:
                col_repr_2 = f"COL[{col_num_2 - col_cible}]"

            if abs_row_2 == "$":
                row_repr_2 = f"ABS_ROW[{row_2}]"
            else:
                row_repr_2 = f"ROW[{row_2 - row_cible}]"

            return (
                f"RANGE("
                f"{col_repr_1},{row_repr_1},"
                f"{col_repr_2},{row_repr_2}"
                f")"
            )

        return (
            f"CELL({col_repr_1},{row_repr_1})"
        )

    formule_normalisee = pattern_local.sub(
        remplacer_local,
        formule_normalisee
    )

    return formule_normalisee


# ============================================================
# SIGNATURE METIER
# ============================================================

def creer_signature_regroupement(
    feuille,
    cellule,
    formule,
    operation
):
    """
    Cette fonction décide si plusieurs formules représentent
    la même règle.

    Priorités :

    1. Formules strictement identiques
    2. Formules mensuelles avec même structure
    3. Même ligne métier dans Synthese
    """

    info = analyser_cellule(cellule)

    if not info:
        return (
            feuille,
            operation,
            normaliser_formule_exacte(formule)
        )

    ligne = info["ligne"]
    colonne = info["colonne_numero"]

    feuille_norm = normaliser_nom(feuille)

    # ========================================================
    # CAS SPECIAL : SYNTHESE
    #
    # Dans le modèle actuel :
    #
    # C:N = Janvier -> Décembre
    # O   = Total annuel
    #
    # Une ligne représente une même logique métier.
    # ========================================================

    if feuille_norm == "SYNTHESE":

        # Colonnes mensuelles C -> N
        if 3 <= colonne <= 14:

            return (
                feuille_norm,
                "MENSUEL",
                ligne,
                operation
            )

        # Colonne O = annuel
        if colonne == 15:

            return (
                feuille_norm,
                "ANNUEL",
                ligne,
                operation
            )

    # ========================================================
    # FORMULES STRICTEMENT IDENTIQUES
    # ========================================================

    signature_exacte = normaliser_formule_exacte(formule)

    return (
        feuille_norm,
        operation,
        signature_exacte
    )


# ============================================================
# PERIODICITE
# ============================================================

def determiner_periodicite(occurrences):
    if len(occurrences) == 1:
        return "UNIQUE"

    cellules = []

    for occurrence in occurrences:
        info = analyser_cellule(
            occurrence["cellule"]
        )

        if info:
            cellules.append(info)

    if not cellules:
        return "REPETEE"

    lignes = {
        c["ligne"]
        for c in cellules
    }

    colonnes = sorted(
        c["colonne_numero"]
        for c in cellules
    )

    # Même ligne C:N
    if (
        len(lignes) == 1
        and colonnes == list(range(3, 15))
    ):
        return "MENSUELLE"

    return "REPETEE"


# ============================================================
# DOMAINE
# ============================================================

def determiner_domaine(feuille):
    nom = normaliser_nom(feuille)

    if "PRODUCTION" in nom:
        return "PRODUCTION"

    if "EXPORT" in nom:
        return "EXPORTATION"

    if "EMPLOYE" in nom or "SALAIRE" in nom:
        return "SALAIRES"

    if "CHARGE" in nom:
        return "CHARGES"

    if "SYNTHESE" in nom or "BUDGET" in nom:
        return "BUDGET"

    return "AUTRE"


# ============================================================
# PREFIXE REGLE
# ============================================================

def prefixe_regle(feuille):
    nom = normaliser_nom(feuille)

    if not nom:
        return "RG_AUTRE"

    return f"RG_{nom}"


# ============================================================
# GENERATION DES REGLES
# ============================================================

def generer_regles_techniques(
    formules,
    index_dependances
):
    groupes = defaultdict(list)

    # --------------------------------------------------------
    # CREATION DES GROUPES
    # --------------------------------------------------------

    for ligne in formules:

        feuille = (
            ligne.get("feuille")
            or ligne.get("sheet")
            or ""
        ).strip()

        cellule = (
            ligne.get("cellule")
            or ligne.get("cell")
            or ""
        ).strip()

        formule = (
            ligne.get("formule")
            or ligne.get("formula")
            or ""
        ).strip()

        if not feuille or not cellule or not formule:
            continue

        operation = detecter_operation(formule)

        signature = creer_signature_regroupement(
            feuille,
            cellule,
            formule,
            operation
        )

        dependances = index_dependances.get(
            (feuille, cellule),
            []
        )

        if not dependances:
            dependances = extraire_references(
                formule,
                feuille
            )

        groupes[signature].append({
            "feuille": feuille,
            "cellule": cellule,
            "formule": formule,
            "operation": operation,
            "dependances": dependances
        })

    # --------------------------------------------------------
    # TRANSFORMATION DES GROUPES EN REGLES
    # --------------------------------------------------------

    compteurs = defaultdict(int)
    regles = []

    groupes_tries = sorted(
        groupes.values(),
        key=lambda groupe: (
            groupe[0]["feuille"],
            analyser_cellule(
                groupe[0]["cellule"]
            )["ligne"]
            if analyser_cellule(groupe[0]["cellule"])
            else 999999,
            analyser_cellule(
                groupe[0]["cellule"]
            )["colonne_numero"]
            if analyser_cellule(groupe[0]["cellule"])
            else 999999
        )
    )

    for occurrences in groupes_tries:

        occurrences = sorted(
            occurrences,
            key=lambda x: (
                analyser_cellule(x["cellule"])["ligne"],
                analyser_cellule(x["cellule"])["colonne_numero"]
            )
            if analyser_cellule(x["cellule"])
            else (999999, 999999)
        )

        reference = occurrences[0]

        feuille = reference["feuille"]
        operation = reference["operation"]

        prefixe = prefixe_regle(feuille)

        compteurs[prefixe] += 1

        id_regle = (
            f"{prefixe}_"
            f"{compteurs[prefixe]:03d}"
        )

        periodicite = determiner_periodicite(
            occurrences
        )

        cellules = [
            occ["cellule"]
            for occ in occurrences
        ]

        # Signature informative
        signature_structurelle = (
            normaliser_formule_relative(
                reference["formule"],
                reference["cellule"]
            )
        )

        regle = {
            "id": id_regle,

            "nom": (
                f"Calcul Excel "
                f"{feuille}!"
                f"{reference['cellule']}"
            ),

            "type": "CALCUL_EXCEL",

            "origine": "REVERSE_ENGINEERING",

            "domaine": determiner_domaine(
                feuille
            ),

            "feuille": feuille,

            "cellule_cible_reference":
                reference["cellule"],

            "formule_excel_reference":
                reference["formule"],

            "operation": operation,

            "signature_structurelle":
                signature_structurelle,

            "nombre_occurrences":
                len(occurrences),

            "periodicite":
                periodicite,

            "cellules_excel":
                cellules,

            "dependances_reference":
                reference["dependances"],

            "occurrences_excel": [
                {
                    "cellule": occ["cellule"],
                    "formule": occ["formule"],
                    "dependances": occ["dependances"]
                }
                for occ in occurrences
            ]
        }

        regles.append(regle)

    return regles


# ============================================================
# STATISTIQUES
# ============================================================

def calculer_statistiques(
    formules,
    regles
):
    operations = defaultdict(int)
    domaines = defaultdict(int)
    periodicites = defaultdict(int)

    for regle in regles:

        operations[
            regle["operation"]
        ] += 1

        domaines[
            regle["domaine"]
        ] += 1

        periodicites[
            regle["periodicite"]
        ] += 1

    return {
        "nombre_formules_excel":
            len(formules),

        "nombre_regles_uniques":
            len(regles),

        "nombre_repetitions_regroupees":
            len(formules) - len(regles),

        "operations":
            dict(operations),

        "domaines":
            dict(domaines),

        "periodicites":
            dict(periodicites)
    }


# ============================================================
# AFFICHAGE
# ============================================================

def afficher_resultat(
    statistiques,
    regles
):
    print()
    print("=" * 75)
    print(
        "SXMXDX - REVERSE ENGINEERING DES REGLES"
    )
    print("=" * 75)

    print()
    print(
        f"Formules Excel analysées : "
        f"{statistiques['nombre_formules_excel']}"
    )

    print(
        f"Règles uniques           : "
        f"{statistiques['nombre_regles_uniques']}"
    )

    print(
        f"Répétitions regroupées   : "
        f"{statistiques['nombre_repetitions_regroupees']}"
    )

    print()
    print("Périodicités :")

    for periodicite, nombre in (
        statistiques["periodicites"].items()
    ):
        print(
            f"  {periodicite:<20} {nombre}"
        )

    print()
    print("-" * 75)
    print("REGLES REGROUPEES")
    print("-" * 75)

    for regle in regles:

        if regle["nombre_occurrences"] <= 1:
            continue

        print()
        print(regle["id"])

        print(
            f"  feuille      : "
            f"{regle['feuille']}"
        )

        print(
            f"  opération    : "
            f"{regle['operation']}"
        )

        print(
            f"  périodicité  : "
            f"{regle['periodicite']}"
        )

        print(
            f"  occurrences  : "
            f"{regle['nombre_occurrences']}"
        )

        print(
            "  cellules     : "
            + ", ".join(
                regle["cellules_excel"]
            )
        )


# ============================================================
# PROGRAMME PRINCIPAL
# ============================================================

def generer_regles():

    print()
    print("=" * 75)
    print(
        "SXMXDX - GENERATION DES REGLES METIER"
    )
    print("=" * 75)

    print()
    print(
        f"Lecture : {FORMULES_FILE}"
    )

    formules = lire_csv(
        FORMULES_FILE
    )

    print(
        f"Formules détectées : {len(formules)}"
    )

    print()
    print(
        f"Lecture : {DEPENDANCES_FILE}"
    )

    dependances = lire_csv(
        DEPENDANCES_FILE
    )

    print(
        f"Dépendances détectées : "
        f"{len(dependances)}"
    )

    index_dependances = (
        construire_index_dependances(
            dependances
        )
    )

    regles = generer_regles_techniques(
        formules,
        index_dependances
    )

    statistiques = calculer_statistiques(
        formules,
        regles
    )

    resultat = {
        "modele": "SOMIDA_BUDGET",

        "version": "SOMIDA_BUDGET_V1",

        "origine":
            "REVERSE_ENGINEERING_EXCEL",

        "sources": {
            "formules": str(
                FORMULES_FILE
            ),

            "dependances": str(
                DEPENDANCES_FILE
            )
        },

        "statistiques":
            statistiques,

        "regles":
            regles
    }

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    with REGLES_FILE.open(
        "w",
        encoding="utf-8"
    ) as fichier:

        json.dump(
            resultat,
            fichier,
            ensure_ascii=False,
            indent=4
        )

    afficher_resultat(
        statistiques,
        regles
    )

    print()
    print("=" * 75)

    print(
        f"Fichier généré : "
        f"{REGLES_FILE}"
    )

    print("=" * 75)
    print()


# ============================================================
# EXECUTION
# ============================================================

if __name__ == "__main__":
    generer_regles()