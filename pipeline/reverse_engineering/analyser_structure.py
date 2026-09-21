from pathlib import Path
from openpyxl import load_workbook
import json
import sys


MOIS = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
]


OUTPUT_DIR = Path("output/reverse_engineering")


def analyser_structure(chemin_fichier):

    fichier = Path(chemin_fichier)

    if not fichier.exists():
        raise FileNotFoundError(fichier)

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    print("\n" + "=" * 70)
    print("SXMXDX - REVERSE ENGINEERING")
    print("ANALYSE STRUCTURELLE")
    print("=" * 70)

    wb = load_workbook(
        fichier,
        data_only=False,
        read_only=False
    )

    resultat = {
        "fichier": fichier.name,
        "nombre_feuilles": len(wb.sheetnames),
        "feuilles": {}
    }

    for nom_feuille in wb.sheetnames:

        ws = wb[nom_feuille]

        print(f"\nAnalyse : {nom_feuille}")

        nb_formules = 0
        nb_textes = 0
        nb_nombres = 0
        mois_detectes = []

        for row in ws.iter_rows():

            for cell in row:

                valeur = cell.value

                if valeur is None:
                    continue

                # Formule
                if (
                    isinstance(valeur, str)
                    and valeur.startswith("=")
                ):
                    nb_formules += 1

                # Texte
                elif isinstance(valeur, str):

                    nb_textes += 1

                    texte = valeur.strip()

                    if (
                        texte in MOIS
                        and texte not in mois_detectes
                    ):
                        mois_detectes.append(texte)

                # Nombre
                elif isinstance(valeur, (int, float)):
                    nb_nombres += 1

        resultat["feuilles"][nom_feuille] = {
            "lignes": ws.max_row,
            "colonnes": ws.max_column,
            "formules": nb_formules,
            "textes": nb_textes,
            "nombres": nb_nombres,
            "mois_detectes": mois_detectes
        }

        print(
            f"  Dimensions : "
            f"{ws.max_row} lignes x "
            f"{ws.max_column} colonnes"
        )

        print(
            f"  Formules   : {nb_formules}"
        )

        print(
            f"  Mois       : "
            f"{', '.join(mois_detectes)}"
        )

    wb.close()

    sortie = OUTPUT_DIR / "structure.json"

    with open(
        sortie,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            resultat,
            f,
            indent=4,
            ensure_ascii=False
        )

    print("\n" + "=" * 70)
    print("[OK] ANALYSE TERMINEE")
    print(f"[OK] Résultat : {sortie}")
    print("=" * 70)


if __name__ == "__main__":

    if len(sys.argv) != 2:

        print(
            "Utilisation : python analyser_structure.py "
            "<fichier_excel>"
        )

        sys.exit(1)

    try:

        analyser_structure(sys.argv[1])

    except Exception as e:

        print(f"[ERREUR] {e}")
        sys.exit(1)