import sys
from pathlib import Path

import psycopg2


DB_CONFIG = {
    "host": "localhost",
    "port": 5434,
    "database": "sxmxdx2",
    "user": "sxmxdx",
    "password": "diary"
}


def creer_import(fichier_excel, exercice):

    fichier = Path(fichier_excel)

    if not fichier.exists():
        raise FileNotFoundError(fichier)

    connexion = psycopg2.connect(**DB_CONFIG)

    try:
        curseur = connexion.cursor()

        # --------------------------------------------
        # Créer / récupérer exercice
        # --------------------------------------------

        curseur.execute(
            """
            INSERT INTO exercice (annee)
            VALUES (%s)
            ON CONFLICT (annee)
            DO UPDATE SET annee = EXCLUDED.annee
            RETURNING id;
            """,
            (exercice,)
        )

        exercice_id = curseur.fetchone()[0]

        # --------------------------------------------
        # Créer import
        # --------------------------------------------

        curseur.execute(
            """
            INSERT INTO import_fichier (
                nom_fichier,
                exercice_id,
                statut
            )
            VALUES (%s, %s, %s)
            RETURNING id;
            """,
            (
                fichier.name,
                exercice_id,
                "EN_COURS"
            )
        )

        import_id = curseur.fetchone()[0]

        connexion.commit()

        print("=" * 60)
        print("SXMXDX - CREATION IMPORT")
        print("=" * 60)

        print(f"Fichier      : {fichier.name}")
        print(f"Exercice     : {exercice}")
        print(f"Exercice ID  : {exercice_id}")
        print(f"Import ID    : {import_id}")
        print("Statut       : EN_COURS")

        return import_id

    except Exception:

        connexion.rollback()
        raise

    finally:

        connexion.close()


if __name__ == "__main__":

    if len(sys.argv) != 3:

        print(
            "Utilisation : "
            "python creer_import.py "
            "<fichier.xlsx> <exercice>"
        )

        sys.exit(1)

    creer_import(
        sys.argv[1],
        int(sys.argv[2])
    )