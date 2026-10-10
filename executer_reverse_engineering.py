from pathlib import Path
import subprocess
import sys


# ============================================================
# SXMXDX
# PIPELINE COMPLET DE REVERSE ENGINEERING
# ============================================================


# ============================================================
# CONFIGURATION
# ============================================================

# Modifier uniquement cette variable si le fichier de référence change.
FICHIER_EXCEL = Path(
    "data/uploads/f6c08b08_SOMIDA_DAF_2024.xlsx"
)

DOSSIER_REVERSE_ENGINEERING = Path(
    "pipeline/reverse_engineering"
)


# ============================================================
# SCRIPTS
# ============================================================

ANALYSER_STRUCTURE = (
    DOSSIER_REVERSE_ENGINEERING
    / "analyser_structure.py"
)

EXTRAIRE_FORMULES = (
    DOSSIER_REVERSE_ENGINEERING
    / "extraire_formules.py"
)

ANALYSER_DEPENDANCES = (
    DOSSIER_REVERSE_ENGINEERING
    / "analyser_dependances.py"
)

GENERER_REGLES = (
    DOSSIER_REVERSE_ENGINEERING
    / "generer_regles.py"
)

EXTRAIRE_SEMANTIQUE = (
    DOSSIER_REVERSE_ENGINEERING
    / "extraire_semantique.py"
)

FORMALISER_REGLES = (
    DOSSIER_REVERSE_ENGINEERING
    / "formaliser_regles.py"
)

VALIDER_REVERSE_ENGINEERING = (
    DOSSIER_REVERSE_ENGINEERING
    / "valider_reverse_engineering.py"
)

 
# ============================================================
# EXECUTION D'UN SCRIPT
# ============================================================

def executer(script, arguments=None):

    if arguments is None:
        arguments = []

    print("\n" + "=" * 70)
    print(f"EXECUTION : {script}")
    print("=" * 70)

    if not script.exists():

        print(
            f"\n[ERREUR] Script introuvable : {script}"
        )

        sys.exit(1)

    commande = [
        sys.executable,
        str(script),
        *[str(argument) for argument in arguments]
    ]

    print(
        "\nCommande :",
        " ".join(commande)
    )

    resultat = subprocess.run(
        commande
    )

    if resultat.returncode != 0:

        print(
            f"\n[ERREUR] Échec : {script}"
        )

        sys.exit(
            resultat.returncode
        )

    print(
        f"\n[OK] Terminé : {script}"
    )


# ============================================================
# MAIN
# ============================================================

def main():

    print("\n" + "#" * 70)
    print(
        "SXMXDX - PIPELINE COMPLET DE REVERSE ENGINEERING"
    )
    print("#" * 70)

    # --------------------------------------------------------
    # Vérification du fichier Excel
    # --------------------------------------------------------

    if not FICHIER_EXCEL.exists():

        print(
            "\n[ERREUR] Fichier Excel introuvable :"
        )

        print(
            FICHIER_EXCEL
        )

        print(
            "\nModifie la variable FICHIER_EXCEL "
            "dans executer_reverse_engineering.py."
        )

        sys.exit(1)

    print(
        f"\nFichier Excel : {FICHIER_EXCEL}"
    )

    # --------------------------------------------------------
    # 1. Analyse structure
    # --------------------------------------------------------

    executer(
        ANALYSER_STRUCTURE,
        [
            FICHIER_EXCEL
        ]
    )

    # --------------------------------------------------------
    # 2. Extraction formules
    # --------------------------------------------------------

    executer(
        EXTRAIRE_FORMULES,
        [
            FICHIER_EXCEL
        ]
    )

    # --------------------------------------------------------
    # 3. Analyse dépendances
    # --------------------------------------------------------

    executer(
        ANALYSER_DEPENDANCES,
        [
            FICHIER_EXCEL
        ]
    )

    # --------------------------------------------------------
    # 4. Génération règles
    # --------------------------------------------------------

    executer(
        GENERER_REGLES
    )

    executer(
        EXTRAIRE_SEMANTIQUE,
        [
            FICHIER_EXCEL
        ]
    )

    executer(

        FORMALISER_REGLES
    )
    executer(
        VALIDER_REVERSE_ENGINEERING
    )

    # --------------------------------------------------------
    # FIN
    # --------------------------------------------------------

    print("\n" + "#" * 70)
    print(
        "REVERSE ENGINEERING TERMINE AVEC SUCCES"
    )
    print("#" * 70)

    print(
        "\nRésultats : output/reverse_engineering/"
    )


# ============================================================
# EXECUTION
# ============================================================

if __name__ == "__main__":
    main()