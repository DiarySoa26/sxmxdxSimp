
import os
from pathlib import Path
from pipeline.config_db import get_connection

DOSSIER_IMPORTS = Path(
    os.getenv("DOSSIER_IMPORTS", "/app/data/uploads")
).resolve()


def rechercher_fichier(import_id):
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT nom_fichier
                FROM import_fichier
                WHERE id = %s
            """, (import_id,))

            resultat = cursor.fetchone()

    if not resultat:
        raise FileNotFoundError("Import introuvable.")

    nom_fichier = resultat[0]

    if not nom_fichier:
        raise FileNotFoundError("Nom du fichier manquant.")

    if Path(nom_fichier).name != nom_fichier:
        raise ValueError("Nom du fichier invalide.")

    fichier = (DOSSIER_IMPORTS / nom_fichier).resolve()

    if not fichier.is_relative_to(DOSSIER_IMPORTS):
        raise PermissionError("Chemin non autorisé.")

    if not fichier.is_file():
        raise FileNotFoundError(
            f"Fichier original introuvable : {nom_fichier}"
        )

    if fichier.suffix.lower() not in (".xls", ".xlsx", ".xlsm"):
        raise ValueError("Format non autorisé.")

    return fichier, nom_fichier
