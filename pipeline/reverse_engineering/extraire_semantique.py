from pathlib import Path
import json
import re
import sys
import unicodedata

from openpyxl import load_workbook
from openpyxl.utils.cell import coordinate_from_string



if len(sys.argv) < 2:
    print(
        "Utilisation : "
        "python extraire_semantique.py <fichier_excel>"
    )
    sys.exit(1)

EXCEL_FILE = Path(sys.argv[1]).resolve()


REGLES_FILE = Path(
    "output/reverse_engineering/regles_metier.json"
)

OUTPUT_FILE = Path(
    "output/reverse_engineering/semantique.json"
)


# ============================================================
# VALEURS QUI NE SONT PAS DES CONCEPTS METIER
# ============================================================

VALEURS_NON_SEMANTIQUES = {
    "",
    "mga",
    "usd",
    "jpy",
    "eur",
    "ar",
    "%",
    "t",
    "kg",
    "g",
    "tonne",
    "tonnes",
    "unite",
    "unites",
    "total",
    "total_annuel",
    "annuel",
    "mensuel",
    "janvier",
    "fevrier",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "aout",
    "septembre",
    "octobre",
    "novembre",
    "decembre"
}


# ============================================================
# NORMALISATION
# ============================================================

def normaliser_texte(valeur):

    if valeur is None:
        return None

    texte = str(valeur).strip()

    if not texte:
        return None

    return texte


def normaliser_identifiant(valeur):

    if valeur is None:
        return None

    texte = str(valeur).strip()

    if not texte:
        return None

    # Supprimer les accents
    texte = unicodedata.normalize(
        "NFD",
        texte
    )

    texte = "".join(
        caractere
        for caractere in texte
        if unicodedata.category(caractere) != "Mn"
    )

    texte = texte.lower()

    # Remplacement des caractères non alphanumériques
    texte = re.sub(
        r"[^a-z0-9]+",
        "_",
        texte
    )

    texte = texte.strip("_")

    return texte or None


# ============================================================
# DETECTION DES VALEURS NON SEMANTIQUES
# ============================================================

def chercher_libelle_de_ligne(
    ws,
    cellule
):
    """
    Recherche le concept métier d'une ligne.

    Exemple :
        A2 = CA export
        B2 = MGA
        C2:N2 = mois
        O2 = total annuel

    Pour O2, cette fonction retrouve A2 = CA export.
    """

    cellule_obj = ws[cellule]

    ligne = cellule_obj.row

    # Recherche depuis la première colonne
    # jusqu'à la cellule calculée.
    for colonne in range(
        1,
        cellule_obj.column
    ):

        valeur = ws.cell(
            row=ligne,
            column=colonne
        ).value

        texte = normaliser_texte(
            valeur
        )

        if texte is None:
            continue

        if est_libelle_metier(
            texte
        ):

            return {
                "valeur": texte,
                "ligne": ligne,
                "colonne": colonne,
                "position": "DEBUT_LIGNE",
                "distance":
                    cellule_obj.column - colonne
            }

    return None



def est_libelle_metier(valeur):

    texte = normaliser_texte(
        valeur
    )

    if texte is None:
        return False

    # Une formule Excel n'est pas un libellé
    if texte.startswith("="):
        return False

    identifiant = normaliser_identifiant(
        texte
    )

    if identifiant is None:
        return False

    if identifiant in VALEURS_NON_SEMANTIQUES:
        return False

    # Nombre seul
    try:
        float(
            texte.replace(",", ".")
        )

        return False

    except ValueError:
        pass

    return True


# ============================================================
# CHARGEMENT DES FICHIERS
# ============================================================

def charger_regles():

    if not REGLES_FILE.exists():

        raise FileNotFoundError(
            f"Fichier de règles introuvable : "
            f"{REGLES_FILE}"
        )

    with REGLES_FILE.open(
        "r",
        encoding="utf-8"
    ) as fichier:

        return json.load(
            fichier
        )


def charger_excel():

    if not EXCEL_FILE.exists():

        raise FileNotFoundError(
            f"Fichier Excel introuvable : "
            f"{EXCEL_FILE}"
        )

    return load_workbook(
        EXCEL_FILE,
        data_only=False,
        read_only=False
    )


# ============================================================
# RECHERCHE HORIZONTALE DU LIBELLE
# ============================================================

def chercher_libelle_gauche(
    ws,
    cellule,
    distance_max=10
):

    cellule_obj = ws[cellule]

    ligne = cellule_obj.row
    colonne = cellule_obj.column

    candidats = []

    for distance in range(
        1,
        distance_max + 1
    ):

        colonne_candidate = (
            colonne - distance
        )

        if colonne_candidate < 1:
            break

        valeur = ws.cell(
            row=ligne,
            column=colonne_candidate
        ).value

        texte = normaliser_texte(
            valeur
        )

        if texte is None:
            continue

        candidats.append({
            "valeur": texte,
            "ligne": ligne,
            "colonne": colonne_candidate,
            "position": "GAUCHE",
            "distance": distance,
            "est_semantique":
                est_libelle_metier(texte)
        })

        # IMPORTANT :
        # on ne s'arrête plus sur MGA, %, Total annuel, etc.
        if est_libelle_metier(
            texte
        ):

            return {
                "valeur": texte,
                "ligne": ligne,
                "colonne": colonne_candidate,
                "position": "GAUCHE",
                "distance": distance,
                "candidats": candidats
            }

    return None


# ============================================================
# RECHERCHE VERTICALE
# ============================================================

def chercher_libelle_haut(
    ws,
    cellule,
    distance_max=10
):

    cellule_obj = ws[cellule]

    ligne = cellule_obj.row
    colonne = cellule_obj.column

    candidats = []

    for distance in range(
        1,
        distance_max + 1
    ):

        ligne_candidate = (
            ligne - distance
        )

        if ligne_candidate < 1:
            break

        valeur = ws.cell(
            row=ligne_candidate,
            column=colonne
        ).value

        texte = normaliser_texte(
            valeur
        )

        if texte is None:
            continue

        candidats.append({
            "valeur": texte,
            "ligne": ligne_candidate,
            "colonne": colonne,
            "position": "HAUT",
            "distance": distance,
            "est_semantique":
                est_libelle_metier(texte)
        })

        if est_libelle_metier(
            texte
        ):

            return {
                "valeur": texte,
                "ligne": ligne_candidate,
                "colonne": colonne,
                "position": "HAUT",
                "distance": distance,
                "candidats": candidats
            }

    return None


# ============================================================
# RECHERCHE GENERALE
# ============================================================

def chercher_libelle(
    ws,
    cellule
):

    # --------------------------------------------------------
    # PRIORITE 1 :
    # chercher sur la même ligne à gauche
    #
    # C'est généralement là que se trouve :
    #
    # Chiffre d'affaires | MGA | Janvier ...
    # Charges            | MGA | Janvier ...
    # Taux de marge      | %   | Janvier ...
    # --------------------------------------------------------

    gauche = chercher_libelle_gauche(
        ws,
        cellule
    )

    if gauche is not None:
        return gauche

    # --------------------------------------------------------
    # PRIORITE 2 :
    # chercher au-dessus
    # --------------------------------------------------------

    haut = chercher_libelle_haut(
        ws,
        cellule
    )

    if haut is not None:
        return haut

    return None


# ============================================================
# PERIODICITE SEMANTIQUE
# ============================================================

def determiner_periodicite_semantique(
    feuille,
    cellule,
    periodicite_technique
):

    if not feuille or not cellule:
        return periodicite_technique

    feuille_normalisee = (
        normaliser_identifiant(
            feuille
        )
    )

    colonne, _ = coordinate_from_string(
        cellule
    )

    colonne = colonne.upper()

    # --------------------------------------------------------
    # CAS PARTICULIER DE LA SYNTHESE
    #
    # C:N = janvier à décembre
    # O   = total annuel
    # --------------------------------------------------------

    if feuille_normalisee == "synthese":

        colonnes_mensuelles = {
            "C",
            "D",
            "E",
            "F",
            "G",
            "H",
            "I",
            "J",
            "K",
            "L",
            "M",
            "N"
        }

        if colonne in colonnes_mensuelles:
            return "MENSUELLE"

        if colonne == "O":
            return "ANNUELLE"

    return periodicite_technique


# ============================================================
# TYPE SEMANTIQUE
# ============================================================

def determiner_type_semantique(
    periodicite
):

    if periodicite == "MENSUELLE":
        return "MESURE_MENSUELLE"

    if periodicite == "ANNUELLE":
        return "MESURE_ANNUELLE"

    return "MESURE"


# ============================================================
# ANALYSE D'UNE REGLE
# ============================================================

def analyser_regle(
    workbook,
    regle
):

    feuille = regle.get(
        "feuille"
    )

    cellule = regle.get(
        "cellule_cible_reference"
    )

    periodicite_technique = (
        regle.get("periodicite")
    )

    periodicite_semantique = (
        determiner_periodicite_semantique(
            feuille,
            cellule,
            periodicite_technique
        )
    )

    resultat = {

        "regle_technique":
            regle.get("id"),

        "domaine":
            regle.get("domaine"),

        "feuille":
            feuille,

        "cellule_reference":
            cellule,

        "operation":
            regle.get("operation"),

        "periodicite_technique":
            periodicite_technique,

        "periodicite":
            periodicite_semantique,

        "nombre_occurrences":
            regle.get(
                "nombre_occurrences",
                1
            ),

        "formule":
            regle.get(
                "formule_excel_reference"
            ),

        "dependances":
            regle.get(
                "dependances_reference",
                []
            )
    }

    # --------------------------------------------------------
    # FEUILLE ABSENTE
    # --------------------------------------------------------

    if feuille not in workbook.sheetnames:

        resultat["libelle_excel"] = None

        resultat[
            "identifiant_semantique"
        ] = None

        resultat["statut"] = (
            "FEUILLE_INTROUVABLE"
        )

        return resultat

    ws = workbook[
        feuille
    ]

    # --------------------------------------------------------
    # RECHERCHE DU LIBELLE
    # --------------------------------------------------------

    # ========================================================
    # RECHERCHE SEMANTIQUE
    # ========================================================

    if (
        normaliser_identifiant(feuille) == "synthese"
        and periodicite_semantique == "ANNUELLE"
    ):
        # Une valeur annuelle de Synthese appartient
        # au même concept métier que la ligne mensuelle.
        #
        # Exemple :
        #
        # A2 = CA export
        # C2:N2 = CA mensuel
        # O2 = CA annuel
        #
        # O2 doit donc récupérer "CA export".
        libelle = chercher_libelle_de_ligne(
            ws,
            cellule
        )

    else:
        libelle = chercher_libelle(
            ws,
            cellule
        )

    if libelle is None:

        resultat["libelle_excel"] = None

        resultat[
            "identifiant_semantique"
        ] = None

        resultat["statut"] = (
            "A_VALIDER"
        )

        return resultat

    # --------------------------------------------------------
    # LIBELLE TROUVE
    # --------------------------------------------------------

    texte = libelle[
        "valeur"
    ]

    resultat["libelle_excel"] = (
        texte
    )

    resultat[
        "identifiant_semantique"
    ] = normaliser_identifiant(
        texte
    )

    resultat["position_libelle"] = (
        libelle["position"]
    )

    resultat["distance_libelle"] = (
        libelle["distance"]
    )

    resultat["type_semantique"] = (
        determiner_type_semantique(
            periodicite_semantique
        )
    )

    resultat["statut"] = (
        "SEMANTIQUE_DETECTEE"
    )

    return resultat


# ============================================================
# VALIDATION DES DOUBLONS SEMANTIQUES
# ============================================================

def analyser_doublons(
    resultats
):

    groupes = {}

    for regle in resultats:

        cible = regle.get(
            "identifiant_semantique"
        )

        periodicite = regle.get(
            "periodicite"
        )

        if not cible:
            continue

        cle = (
            cible,
            periodicite
        )

        groupes.setdefault(
            cle,
            []
        ).append(
            regle["regle_technique"]
        )

    doublons = []

    for cle, ids in groupes.items():

        if len(ids) > 1:

            doublons.append({
                "identifiant_semantique":
                    cle[0],

                "periodicite":
                    cle[1],

                "regles":
                    ids
            })

    return doublons


# ============================================================
# STATISTIQUES
# ============================================================

def calculer_statistiques(
    resultats
):

    total = len(
        resultats
    )

    detectees = sum(
        1
        for regle in resultats
        if regle.get("statut")
        == "SEMANTIQUE_DETECTEE"
    )

    a_valider = (
        total - detectees
    )

    mensuelles = sum(
        1
        for regle in resultats
        if regle.get("periodicite")
        == "MENSUELLE"
    )

    annuelles = sum(
        1
        for regle in resultats
        if regle.get("periodicite")
        == "ANNUELLE"
    )

    uniques = sum(
        1
        for regle in resultats
        if regle.get("periodicite")
        == "UNIQUE"
    )

    return {
        "nombre_regles":
            total,

        "semantique_detectee":
            detectees,

        "a_valider":
            a_valider,

        "periodicites": {
            "MENSUELLE":
                mensuelles,

            "ANNUELLE":
                annuelles,

            "UNIQUE":
                uniques
        }
    }


# ============================================================
# PROGRAMME PRINCIPAL
# ============================================================

def main():

    print()
    print("=" * 75)
    print(
        "SXMXDX - EXTRACTION SEMANTIQUE DES REGLES"
    )
    print("=" * 75)

    # --------------------------------------------------------
    # CHARGEMENT
    # --------------------------------------------------------

    document = charger_regles()

    workbook = charger_excel()

    regles = document.get(
        "regles",
        []
    )

    print(
        f"\nRègles techniques à analyser : "
        f"{len(regles)}"
    )

    print()

    # --------------------------------------------------------
    # ANALYSE
    # --------------------------------------------------------

    resultats = []

    for regle in regles:

        resultat = analyser_regle(
            workbook,
            regle
        )

        resultats.append(
            resultat
        )

        id_regle = (
            resultat.get(
                "regle_technique"
            )
        )

        libelle = (
            resultat.get(
                "libelle_excel"
            )
            or "NON DETECTE"
        )

        periodicite = (
            resultat.get(
                "periodicite"
            )
        )

        statut = (
            resultat.get(
                "statut"
            )
        )

        print(
            f"{id_regle:<25} "
            f"{libelle:<35} "
            f"{periodicite:<12} "
            f"{statut}"
        )

    # --------------------------------------------------------
    # STATISTIQUES
    # --------------------------------------------------------

    statistiques = (
        calculer_statistiques(
            resultats
        )
    )

    doublons = (
        analyser_doublons(
            resultats
        )
    )

    # --------------------------------------------------------
    # DOCUMENT FINAL
    # --------------------------------------------------------

    sortie = {

        "modele":
            document.get(
                "modele"
            ),

        "version":
            document.get(
                "version"
            ),

        "origine":
            "EXTRACTION_SEMANTIQUE_EXCEL",

        "source_excel":
            str(EXCEL_FILE),

        "source_regles":
            str(REGLES_FILE),

        "statistiques":
            statistiques,

        "doublons_semantiques":
            doublons,

        "regles":
            resultats
    }

    # --------------------------------------------------------
    # ECRITURE
    # --------------------------------------------------------

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    with OUTPUT_FILE.open(
        "w",
        encoding="utf-8"
    ) as fichier:

        json.dump(
            sortie,
            fichier,
            ensure_ascii=False,
            indent=4
        )

    # --------------------------------------------------------
    # RESULTAT
    # --------------------------------------------------------

    print()
    print("-" * 75)
    print("RESULTAT")
    print("-" * 75)

    print(
        f"Règles analysées      : "
        f"{statistiques['nombre_regles']}"
    )

    print(
        f"Sémantiques détectées : "
        f"{statistiques['semantique_detectee']}"
    )

    print(
        f"À valider             : "
        f"{statistiques['a_valider']}"
    )

    print()
    print("Périodicités :")

    print(
        f"  MENSUELLE : "
        f"{statistiques['periodicites']['MENSUELLE']}"
    )

    print(
        f"  ANNUELLE  : "
        f"{statistiques['periodicites']['ANNUELLE']}"
    )

    print(
        f"  UNIQUE    : "
        f"{statistiques['periodicites']['UNIQUE']}"
    )

    if doublons:

        print()
        print(
            "[INFO] Concepts identiques détectés "
            "dans plusieurs règles :"
        )

        for doublon in doublons:

            print(
                f"  {doublon['identifiant_semantique']} "
                f"({doublon['periodicite']}) "
                f"→ {', '.join(doublon['regles'])}"
            )

    print()
    print(
        f"[OK] Fichier généré : "
        f"{OUTPUT_FILE}"
    )

    print("=" * 75)


if __name__ == "__main__":
    main()