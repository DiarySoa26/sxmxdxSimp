import psycopg2
import sys


DB_CONFIG = {
    "host": "localhost",
    "port": 5434,
    "database": "sxmxdx2",
    "user": "sxmxdx",
    "password": "diary"
}


TABLES_OBLIGATOIRES = [
    "employe",
    "production",
    "charge",
    "exportation",
    "frais_export"
]


def compter(
    curseur,
    table,
    import_id
):

    requete = f"""
        SELECT COUNT(*)
        FROM {table}
        WHERE import_id = %s
    """

    curseur.execute(
        requete,
        (import_id,)
    )

    return curseur.fetchone()[0]


def valider_import(
    import_id
):

    connexion = psycopg2.connect(
        **DB_CONFIG
    )

    try:

        curseur = (
            connexion.cursor()
        )

        print("\n" + "=" * 70)
        print("SXMXDX - VALIDATION GLOBALE IMPORT")
        print("=" * 70)

        # ----------------------------------------------------
        # Vérifier existence import
        # ----------------------------------------------------

        curseur.execute(
            """
            SELECT
                id,
                nom_fichier,
                exercice_id,
                statut
            FROM import_fichier
            WHERE id = %s
            """,
            (import_id,)
        )

        ligne_import = (
            curseur.fetchone()
        )

        if not ligne_import:

            raise ValueError(
                f"Import {import_id} introuvable."
            )

        _, nom_fichier, exercice_id, statut = (
            ligne_import
        )

        print(
            f"Import ID    : {import_id}"
        )

        print(
            f"Fichier      : {nom_fichier}"
        )

        print(
            f"Exercice ID  : {exercice_id}"
        )

        print(
            f"Statut actuel: {statut}"
        )

        print("\nDONNEES IMPORTEES")
        print("-" * 70)

        # ----------------------------------------------------
        # Contrôle tables
        # ----------------------------------------------------

        import_valide = True

        resultats = {}

        for table in TABLES_OBLIGATOIRES:

            nombre = compter(
                curseur,
                table,
                import_id
            )

            resultats[table] = nombre

            if nombre > 0:

                symbole = "[OK]"

            else:

                symbole = "[ERREUR]"
                import_valide = False

            print(
                f"{symbole} "
                f"{table:<20} "
                f"{nombre} ligne(s)"
            )

        print("-" * 70)

        # ----------------------------------------------------
        # Import valide
        # ----------------------------------------------------

        if import_valide:

            curseur.execute(
                """
                UPDATE import_fichier

                SET
                    statut = 'PRET_GENERATION',
                    message_erreur = NULL

                WHERE id = %s
                """,
                (import_id,)
            )

            connexion.commit()

            print(
                "\n[OK] IMPORT VALIDE"
            )

            print(
                "[OK] Nouveau statut : "
                "PRET_GENERATION"
            )

            print(
                "\nLe budget peut maintenant "
                "être généré."
            )

            return True

        # ----------------------------------------------------
        # Import invalide
        # ----------------------------------------------------

        tables_vides = [
            table
            for table, nombre
            in resultats.items()
            if nombre == 0
        ]

        message = (
            "Données absentes : "
            + ", ".join(
                tables_vides
            )
        )

        curseur.execute(
            """
            UPDATE import_fichier

            SET
                statut = 'ERREUR',
                message_erreur = %s

            WHERE id = %s
            """,
            (
                message,
                import_id
            )
        )

        connexion.commit()

        print(
            "\n[ERREUR] IMPORT INCOMPLET"
        )

        print(
            message
        )

        return False

    except Exception:

        connexion.rollback()
        raise

    finally:

        connexion.close()


if __name__ == "__main__":

    if len(sys.argv) != 2:

        print(
            "Utilisation : "
            "python "
            "pipeline/validation/"
            "valider_import.py "
            "<import_id>"
        )

        sys.exit(1)

    try:

        resultat = valider_import(
            int(
                sys.argv[1]
            )
        )

        if not resultat:
            sys.exit(1)

    except Exception as e:

        print(
            f"\n[ERREUR] {e}"
        )

        sys.exit(1)