from pathlib import Path
import csv
import json
import sys


OUTPUT_DIR = Path(
    "output/reverse_engineering"
)

FORMULES_FILE = (
    OUTPUT_DIR / "formules.csv"
)

REGLES_FILE = (
    OUTPUT_DIR / "regles_metier.json"
)

SEMANTIQUE_FILE = (
    OUTPUT_DIR / "semantique.json"
)

EXECUTABLES_FILE = (
    OUTPUT_DIR / "regles_executables.json"
)


def lire_json(path):

    with path.open(
        "r",
        encoding="utf-8"
    ) as fichier:

        return json.load(fichier)


def compter_formules():

    with FORMULES_FILE.open(
        "r",
        encoding="utf-8-sig",
        newline=""
    ) as fichier:

        return sum(
            1
            for _ in csv.DictReader(fichier)
        )


def main():

    print()
    print("=" * 70)
    print(
        "SXMXDX - VALIDATION DU REVERSE ENGINEERING"
    )
    print("=" * 70)

    fichiers = [
        FORMULES_FILE,
        REGLES_FILE,
        SEMANTIQUE_FILE,
        EXECUTABLES_FILE
    ]

    for fichier in fichiers:

        if not fichier.exists():

            print(
                f"[ERREUR] Fichier absent : "
                f"{fichier}"
            )

            sys.exit(1)

    nb_formules = compter_formules()

    regles = lire_json(
        REGLES_FILE
    )

    semantique = lire_json(
        SEMANTIQUE_FILE
    )

    executables = lire_json(
        EXECUTABLES_FILE
    )

    nb_occurrences = sum(
        regle.get(
            "nombre_occurrences",
            0
        )
        for regle in regles.get(
            "regles",
            []
        )
    )

    nb_regles = len(
        regles.get(
            "regles",
            []
        )
    )

    nb_semantiques = len(
        semantique.get(
            "regles",
            []
        )
    )

    nb_formalisees = len(
        executables.get(
            "regles",
            []
        )
    )

    nb_a_valider = len(
        executables.get(
            "a_valider",
            []
        )
    )

    print(
        f"\nFormules Excel             : "
        f"{nb_formules}"
    )

    print(
        f"Occurrences dans les règles: "
        f"{nb_occurrences}"
    )

    print(
        f"Règles techniques          : "
        f"{nb_regles}"
    )

    print(
        f"Règles analysées sémantique: "
        f"{nb_semantiques}"
    )

    print(
        f"Règles formalisées         : "
        f"{nb_formalisees}"
    )

    print(
        f"Règles à valider           : "
        f"{nb_a_valider}"
    )

    erreurs = []

    if nb_formules != nb_occurrences:

        erreurs.append(
            "Le nombre de formules Excel "
            "ne correspond pas au nombre "
            "d'occurrences conservées."
        )

    if nb_regles != nb_semantiques:

        erreurs.append(
            "Toutes les règles techniques "
            "n'ont pas été analysées "
            "sémantiquement."
        )

    if (
        nb_regles
        != nb_formalisees + nb_a_valider
    ):

        erreurs.append(
            "Certaines règles ont disparu "
            "pendant la formalisation."
        )

    print()

    if erreurs:

        print("[ERREUR] RE non valide.")

        for erreur in erreurs:
            print(
                f" - {erreur}"
            )

        sys.exit(1)

    print(
        "[OK] Aucune règle n'a été perdue."
    )

    if nb_a_valider:

        print(
            "[ATTENTION] Certaines règles "
            "nécessitent encore une validation "
            "sémantique."
        )

    else:

        print(
            "[OK] Toutes les règles ont été "
            "formalisées."
        )

    print("=" * 70)


if __name__ == "__main__":
    main()