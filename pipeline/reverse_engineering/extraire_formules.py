from pathlib import Path
from openpyxl import load_workbook
import csv
import sys


OUTPUT_DIR = Path("output/reverse_engineering")


def extraire_formules(chemin_fichier):

    fichier = Path(chemin_fichier)

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    print("\n" + "=" * 70)
    print("SXMXDX - EXTRACTION DES FORMULES")
    print("=" * 70)

    wb = load_workbook(
        fichier,
        data_only=False
    )

    formules = []

    for nom_feuille in wb.sheetnames:

        ws = wb[nom_feuille]

        compteur = 0

        for row in ws.iter_rows():

            for cell in row:

                valeur = cell.value

                if (
                    isinstance(valeur, str)
                    and valeur.startswith("=")
                ):

                    formules.append({
                        "feuille": nom_feuille,
                        "cellule": cell.coordinate,
                        "formule": valeur
                    })

                    compteur += 1

        print(
            f"{nom_feuille:<25} : "
            f"{compteur} formule(s)"
        )

    wb.close()

    sortie = OUTPUT_DIR / "formules.csv"

    with open(
        sortie,
        "w",
        newline="",
        encoding="utf-8"
    ) as f:

        writer = csv.DictWriter(
            f,
            fieldnames=[
                "feuille",
                "cellule",
                "formule"
            ]
        )

        writer.writeheader()

        writer.writerows(formules)

    print("\n" + "-" * 70)
    print(
        f"Total : {len(formules)} formule(s)"
    )

    print(
        f"[OK] Fichier généré : {sortie}"
    )


if __name__ == "__main__":

    if len(sys.argv) != 2:

        print(
            "Utilisation : python extraire_formules.py "
            "<fichier_excel>"
        )

        sys.exit(1)

    try:

        extraire_formules(sys.argv[1])

    except Exception as e:

        print(f"[ERREUR] {e}")
        sys.exit(1)