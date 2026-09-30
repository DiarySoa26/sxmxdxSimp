# from pathlib import Path
# import subprocess
# import sys
# import traceback


# # ============================================================
# # RACINE DU PROJET
# # ============================================================

# PROJECT_ROOT = Path(__file__).resolve().parents[2]

# if str(PROJECT_ROOT) not in sys.path:
#     sys.path.insert(
#         0,
#         str(PROJECT_ROOT)
#     )


# # ============================================================
# # IMPORT DES MODULES SXMXDX
# # ============================================================

# from pipeline.importation.recevoir_fichier import (
#     recevoir_fichier,
# )

# from pipeline.importation.valider_structure import (
#     valider_structure,
# )

# from pipeline.importation.creer_import import (
#     creer_import,
# )

# from pipeline.importation.extraire_donnees import (
#     extraire_donnees,
# )

# from pipeline.validation.valider_import import (
#     valider_import,
# )


# # ============================================================
# # CONFIGURATION
# # ============================================================

# SPARK_CONTAINER = "sparkSimp"

# SPARK_SUBMIT = "/opt/spark/bin/spark-submit"

# CONTAINER_PROJECT_ROOT = "/app"


# # ============================================================
# # AFFICHAGE
# # ============================================================

# def afficher_etape(numero, total, titre):

#     print()
#     print("=" * 70)

#     print(
#         f"[ETAPE {numero}/{total}] "
#         f"{titre}"
#     )

#     print("=" * 70)


# # ============================================================
# # CONVERSION CHEMIN MAC -> CONTENEUR
# # ============================================================

# def chemin_conteneur(chemin):

#     chemin = Path(
#         chemin
#     ).resolve()

#     try:

#         relatif = chemin.relative_to(
#             PROJECT_ROOT.resolve()
#         )

#     except ValueError:

#         raise ValueError(
#             "Le fichier doit se trouver "
#             "dans le projet SXMXDX."
#         )

#     return (
#         f"{CONTAINER_PROJECT_ROOT}/"
#         f"{relatif.as_posix()}"
#     )


# # ============================================================
# # EXECUTION SPARK
# # ============================================================

# def executer_spark(
#     script,
#     *arguments
# ):

#     script_conteneur = (
#         f"{CONTAINER_PROJECT_ROOT}/"
#         f"{script}"
#     )

#     commande = [
#         "docker",
#         "exec",
#         SPARK_CONTAINER,

#         SPARK_SUBMIT,

#         "--master",
#         "local[*]",

#         script_conteneur,

#         *[
#             str(argument)
#             for argument in arguments
#         ]
#     ]

#     print()
#     print(
#         "Commande Spark :"
#     )

#     print(
#         " ".join(commande)
#     )

#     print()

#     resultat = subprocess.run(
#         commande,
#         cwd=PROJECT_ROOT
#     )

#     if resultat.returncode != 0:

#         raise RuntimeError(
#             f"Echec du script Spark : "
#             f"{script}"
#         )


# # ============================================================
# # MARQUER IMPORT EN ERREUR
# # ============================================================

# def marquer_import_erreur(
#     import_id,
#     message
# ):

#     if import_id is None:
#         return

#     try:

#         import psycopg2

#         from pipeline.importation.creer_import import (
#             DB_CONFIG
#         )

#         connexion = psycopg2.connect(
#             **DB_CONFIG
#         )

#         try:

#             with connexion.cursor() as curseur:

#                 curseur.execute(
#                     """
#                     UPDATE import_fichier
#                     SET
#                         statut = 'ERREUR',
#                         message_erreur = %s
#                     WHERE id = %s
#                     """,
#                     (
#                         str(message)[:2000],
#                         import_id
#                     )
#                 )

#             connexion.commit()

#         finally:

#             connexion.close()

#     except Exception as erreur:

#         print(
#             "[ATTENTION] Impossible de "
#             "mettre l'import en ERREUR : "
#             f"{erreur}"
#         )


# # ============================================================
# # VERIFIER FICHIERS CSV
# # ============================================================

# def verifier_csv(
#     dossier_staging
# ):

#     fichiers = {

#         "exportations":
#             dossier_staging /
#             "exportations.csv",

#         "production":
#             dossier_staging /
#             "production.csv",

#         "charges":
#             dossier_staging /
#             "charges.csv",

#         "frais_export":
#             dossier_staging /
#             "frais_export.csv",

#         "employes":
#             dossier_staging /
#             "employes.csv",
#     }

#     manquants = []

#     for nom, chemin in fichiers.items():

#         if chemin.exists():

#             print(
#                 f"[OK] {nom:<20} "
#                 f"{chemin}"
#             )

#         else:

#             print(
#                 f"[ERREUR] {nom:<20} "
#                 f"{chemin}"
#             )

#             manquants.append(
#                 str(chemin)
#             )

#     if manquants:

#         raise FileNotFoundError(
#             "CSV manquant(s) : "
#             + ", ".join(manquants)
#         )

#     return fichiers


# # ============================================================
# # IMPORT COMPLET
# # ============================================================

# def importer_exercice(
#     fichier_source,
#     annee
# ):

#     import_id = None
#     exercice_id = None

#     TOTAL_ETAPES = 11

#     try:

#         print()
#         print("#" * 70)
#         print("SXMXDX - IMPORT COMPLET D'UN EXERCICE")
#         print("#" * 70)

#         print(
#             f"Fichier  : {fichier_source}"
#         )

#         print(
#             f"Exercice : {annee}"
#         )

#         # ====================================================
#         # ETAPE 1
#         # RECEPTION
#         # ====================================================

#         afficher_etape(
#             1,
#             TOTAL_ETAPES,
#             "Réception du fichier"
#         )

#         fichier_upload = recevoir_fichier(
#             fichier_source
#         )

#         fichier_upload = Path(
#             fichier_upload
#         ).resolve()

#         # ====================================================
#         # ETAPE 2
#         # VALIDATION STRUCTURE
#         # ====================================================

#         afficher_etape(
#             2,
#             TOTAL_ETAPES,
#             "Validation de la structure Excel"
#         )

#         valide = valider_structure(
#             fichier_upload
#         )

#         if not valide:

#             raise ValueError(
#                 "Structure Excel incompatible."
#             )

#         # ====================================================
#         # ETAPE 3
#         # CREATION IMPORT
#         # ====================================================

#         afficher_etape(
#             3,
#             TOTAL_ETAPES,
#             "Création exercice et import PostgreSQL"
#         )

#         ids = creer_import(
#             fichier_upload,
#             annee
#         )

#         import_id = ids[
#             "import_id"
#         ]

#         exercice_id = ids[
#             "exercice_id"
#         ]

#         print()
#         print(
#             f"[OK] IMPORT_ID   = "
#             f"{import_id}"
#         )

#         print(
#             f"[OK] EXERCICE_ID = "
#             f"{exercice_id}"
#         )

#         # ====================================================
#         # ETAPE 4
#         # EXTRACTION
#         # ====================================================

#         afficher_etape(
#             4,
#             TOTAL_ETAPES,
#             "Extraction Excel vers CSV"
#         )

#         dossier_staging = (
#             extraire_donnees(
#                 fichier_upload
#             )
#         )

#         dossier_staging = Path(
#             dossier_staging
#         ).resolve()

#         # ====================================================
#         # ETAPE 5
#         # VERIFICATION CSV
#         # ====================================================

#         afficher_etape(
#             5,
#             TOTAL_ETAPES,
#             "Vérification des CSV"
#         )

#         fichiers = verifier_csv(
#             dossier_staging
#         )

#         # ====================================================
#         # CONVERSION DES CHEMINS POUR DOCKER
#         # ====================================================

#         csv_exportations = (
#             chemin_conteneur(
#                 fichiers[
#                     "exportations"
#                 ]
#             )
#         )

#         csv_production = (
#             chemin_conteneur(
#                 fichiers[
#                     "production"
#                 ]
#             )
#         )

#         csv_charges = (
#             chemin_conteneur(
#                 fichiers[
#                     "charges"
#                 ]
#             )
#         )

#         csv_frais_export = (
#             chemin_conteneur(
#                 fichiers[
#                     "frais_export"
#                 ]
#             )
#         )

#         csv_employes = (
#             chemin_conteneur(
#                 fichiers[
#                     "employes"
#                 ]
#             )
#         )

#         # ====================================================
#         # ETAPE 6
#         # EXPORTATIONS
#         # ====================================================

#         afficher_etape(
#             6,
#             TOTAL_ETAPES,
#             "Normalisation des exportations"
#         )

#         executer_spark(

#             "pipeline/transformation/"
#             "normaliser_exportations.py",

#             csv_exportations,

#             import_id,

#             exercice_id
#         )

#         # ====================================================
#         # ETAPE 7
#         # PRODUCTION
#         # ====================================================

#         afficher_etape(
#             7,
#             TOTAL_ETAPES,
#             "Normalisation de la production"
#         )

#         executer_spark(

#             "pipeline/transformation/"
#             "normaliser_production.py",

#             csv_production,

#             import_id,

#             exercice_id
#         )

#         # ====================================================
#         # ETAPE 8
#         # CHARGES
#         # ====================================================

#         afficher_etape(
#             8,
#             TOTAL_ETAPES,
#             "Normalisation des charges"
#         )

#         executer_spark(

#             "pipeline/transformation/"
#             "normaliser_charges.py",

#             csv_charges,

#             import_id,

#             exercice_id
#         )

#         # ====================================================
#         # ETAPE 9
#         # FRAIS EXPORT
#         # ====================================================

#         afficher_etape(
#             9,
#             TOTAL_ETAPES,
#             "Normalisation des frais export"
#         )

#         executer_spark(

#             "pipeline/transformation/"
#             "normaliser_frais_export.py",

#             csv_frais_export,

#             import_id,

#             exercice_id
#         )

#         # ====================================================
#         # ETAPE 10
#         # EMPLOYES
#         # ====================================================

#         afficher_etape(
#             10,
#             TOTAL_ETAPES,
#             "Normalisation des employés"
#         )

#         executer_spark(

#             "pipeline/transformation/"
#             "normaliser_employes.py",

#             csv_employes,

#             import_id
#         )

#         # ====================================================
#         # ETAPE 11
#         # VALIDATION FINALE
#         # ====================================================

#         afficher_etape(
#             11,
#             TOTAL_ETAPES,
#             "Validation globale de l'import"
#         )

#         resultat = valider_import(
#             import_id
#         )

#         if not resultat:

#             raise RuntimeError(
#                 "La validation finale "
#                 "de l'import a échoué."
#             )

#         # ====================================================
#         # SUCCES
#         # ====================================================

#         print()
#         print("#" * 70)
#         print(
#             "IMPORT TERMINE AVEC SUCCES"
#         )
#         print("#" * 70)

#         print(
#             f"Exercice       : {annee}"
#         )

#         print(
#             f"Exercice ID    : "
#             f"{exercice_id}"
#         )

#         print(
#             f"Import ID      : "
#             f"{import_id}"
#         )

#         print(
#             "Statut         : "
#             "PRET_GENERATION"
#         )

#         print(
#             f"Fichier        : "
#             f"{fichier_upload}"
#         )

#         print(
#             f"Staging        : "
#             f"{dossier_staging}"
#         )

#         print("#" * 70)

#         return {
#             "import_id":
#                 import_id,

#             "exercice_id":
#                 exercice_id,

#             "annee":
#                 annee,

#             "fichier":
#                 str(
#                     fichier_upload
#                 ),

#             "staging":
#                 str(
#                     dossier_staging
#                 ),

#             "statut":
#                 "PRET_GENERATION"
#         }

#     except Exception as erreur:

#         # ====================================================
#         # ERREUR
#         # ====================================================

#         marquer_import_erreur(
#             import_id,
#             erreur
#         )

#         print()
#         print("#" * 70)
#         print(
#             "ECHEC DE L'IMPORT"
#         )
#         print("#" * 70)

#         print(
#             f"Exercice : {annee}"
#         )

#         if exercice_id is not None:

#             print(
#                 f"Exercice ID : "
#                 f"{exercice_id}"
#             )

#         if import_id is not None:

#             print(
#                 f"Import ID   : "
#                 f"{import_id}"
#             )

#         print(
#             f"Erreur      : "
#             f"{erreur}"
#         )

#         print("#" * 70)

#         raise


# # ============================================================
# # MAIN
# # ============================================================

# if __name__ == "__main__":

#     if len(sys.argv) != 3:

#         print()
#         print(
#             "Utilisation :"
#         )

#         print(
#             "python "
#             "pipeline/importation/"
#             "importer_exercice.py "
#             "<fichier_excel> "
#             "<annee>"
#         )

#         print()

#         print(
#             "Exemple :"
#         )

#         print(
#             "python "
#             "pipeline/importation/"
#             "importer_exercice.py "
#             "\"data/SOMIDA_2025.xlsx\" "
#             "2025"
#         )

#         sys.exit(1)

#     fichier = sys.argv[1]

#     try:

#         annee = int(
#             sys.argv[2]
#         )

#     except ValueError:

#         print(
#             "[ERREUR] L'année doit "
#             "être un entier."
#         )

#         sys.exit(1)

#     try:

#         importer_exercice(
#             fichier,
#             annee
#         )

#     except Exception:

#         traceback.print_exc()

#         sys.exit(1)







from pathlib import Path
import subprocess
import sys
import traceback
import re


# ============================================================
# RACINE DU PROJET
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(
        0,
        str(PROJECT_ROOT)
    )


# ============================================================
# IMPORT DES MODULES SXMXDX
# ============================================================

from pipeline.importation.recevoir_fichier import (
    recevoir_fichier,
)

from pipeline.importation.valider_structure import (
    valider_structure,
)

from pipeline.importation.creer_import import (
    creer_import,
)

from pipeline.importation.extraire_donnees import (
    extraire_donnees,
)

from pipeline.validation.valider_import import (
    valider_import,
)


# ============================================================
# CONFIGURATION
# ============================================================

SPARK_CONTAINER = "sparkSimp"

SPARK_SUBMIT = "/opt/spark/bin/spark-submit"

CONTAINER_PROJECT_ROOT = "/app"


# ============================================================
# DETECTION AUTOMATIQUE DE L'ANNEE
# ============================================================

def detecter_annee_exercice(
    fichier_excel
):

    fichier_excel = Path(
        fichier_excel
    )

    nom_fichier = (
        fichier_excel.name
    )

    print()
    print(
        "[INFO] Détection automatique "
        "de l'exercice..."
    )

    print(
        f"[INFO] Fichier analysé : "
        f"{nom_fichier}"
    )

    # ========================================================
    # RECHERCHE D'UNE ANNEE DANS LE NOM DU FICHIER
    #
    # Exemples :
    #
    # SOMIDA_DAF_2023.xlsx
    # SOMIDA_DAF_2024.xlsx
    # SOMIDA_2025.xlsm
    # Budget_SOMIDA_2026.xlsx
    #
    # ========================================================

    correspondances = re.findall(
        r"(?<!\d)(20\d{2})(?!\d)",
        nom_fichier
    )

    if not correspondances:

        raise ValueError(
            "Impossible de déterminer "
            "automatiquement l'exercice "
            "depuis le nom du fichier : "
            f"{nom_fichier}. "
            "Le nom doit contenir une année "
            "comme 2023, 2024, 2025, etc."
        )

    # ========================================================
    # EVITER LES NOMS AMBIGUS
    #
    # Exemple :
    # SOMIDA_2024_COPIE_2025.xlsx
    #
    # ========================================================

    annees_uniques = list(
        dict.fromkeys(
            correspondances
        )
    )

    if len(annees_uniques) > 1:

        raise ValueError(
            "Plusieurs années ont été "
            "détectées dans le nom du fichier : "
            f"{', '.join(annees_uniques)}. "
            "Impossible de déterminer "
            "automatiquement l'exercice."
        )

    annee = int(
        annees_uniques[0]
    )

    # ========================================================
    # CONTROLE SIMPLE
    # ========================================================

    if annee < 2000 or annee > 2100:

        raise ValueError(
            f"Année détectée invalide : "
            f"{annee}"
        )

    print(
        f"[OK] Exercice détecté "
        f"automatiquement : {annee}"
    )

    return annee


# ============================================================
# AFFICHAGE
# ============================================================

def afficher_etape(
    numero,
    total,
    titre
):

    print()
    print("=" * 70)

    print(
        f"[ETAPE {numero}/{total}] "
        f"{titre}"
    )

    print("=" * 70)


# ============================================================
# CONVERSION CHEMIN MAC -> CONTENEUR
# ============================================================

def chemin_conteneur(
    chemin
):

    chemin = Path(
        chemin
    ).resolve()

    try:

        relatif = chemin.relative_to(
            PROJECT_ROOT.resolve()
        )

    except ValueError:

        raise ValueError(
            "Le fichier doit se trouver "
            "dans le projet SXMXDX."
        )

    return (
        f"{CONTAINER_PROJECT_ROOT}/"
        f"{relatif.as_posix()}"
    )


# ============================================================
# EXECUTION SPARK
# ============================================================

# def executer_spark(
#     script,
#     *arguments
# ):

#     script_conteneur = (
#         f"{CONTAINER_PROJECT_ROOT}/"
#         f"{script}"
#     )

#     commande = [
#         "docker",
#         "exec",
#         SPARK_CONTAINER,

#         SPARK_SUBMIT,

#         "--master",
#         "local[*]",

#         script_conteneur,

#         *[
#             str(argument)
#             for argument in arguments
#         ]
#     ]

#     print()
#     print(
#         "Commande Spark :"
#     )

#     print(
#         " ".join(
#             commande
#         )
#     )

#     print()

#     resultat = subprocess.run(
#         commande,
#         cwd=PROJECT_ROOT
#     )

#     if resultat.returncode != 0:

#         raise RuntimeError(
#             f"Echec du script Spark : "
#             f"{script}"
#         )



def executer_spark(
    script,
    *arguments
):

    # ========================================================
    # CHEMIN DU SCRIPT DANS LE CONTENEUR
    # ========================================================

    script_conteneur = (
        f"{CONTAINER_PROJECT_ROOT}/"
        f"{script}"
    )

    # ========================================================
    # IMPORTER_EXERCICE.PY EST DEJA EXECUTE DANS sparkSimp
    #
    # Il ne faut donc PAS faire :
    #
    # docker exec sparkSimp ...
    #
    # On lance directement spark-submit.
    # ========================================================

    commande = [
        SPARK_SUBMIT,

        "--master",
        "local[*]",

        script_conteneur,

        *[
            str(argument)
            for argument in arguments
        ]
    ]

    print()
    print(
        "Commande Spark :"
    )

    print(
        " ".join(commande)
    )

    print()

    resultat = subprocess.run(
        commande
    )

    if resultat.returncode != 0:

        raise RuntimeError(
            f"Echec du script Spark : "
            f"{script}"
        )


# ============================================================
# MARQUER IMPORT EN ERREUR
# ============================================================

def marquer_import_erreur(
    import_id,
    message
):

    if import_id is None:
        return

    try:

        import psycopg2

        from pipeline.importation.creer_import import (
            DB_CONFIG
        )

        connexion = psycopg2.connect(
            **DB_CONFIG
        )

        try:

            with connexion.cursor() as curseur:

                curseur.execute(
                    """
                    UPDATE import_fichier
                    SET
                        statut = 'ERREUR',
                        message_erreur = %s
                    WHERE id = %s
                    """,
                    (
                        str(message)[:2000],
                        import_id
                    )
                )

            connexion.commit()

        finally:

            connexion.close()

    except Exception as erreur:

        print(
            "[ATTENTION] Impossible de "
            "mettre l'import en ERREUR : "
            f"{erreur}"
        )


# ============================================================
# VERIFIER FICHIERS CSV
# ============================================================

def verifier_csv(
    dossier_staging
):

    fichiers = {

        "exportations":
            dossier_staging /
            "exportations.csv",

        "production":
            dossier_staging /
            "production.csv",

        "charges":
            dossier_staging /
            "charges.csv",

        "frais_export":
            dossier_staging /
            "frais_export.csv",

        "employes":
            dossier_staging /
            "employes.csv",
    }

    manquants = []

    for nom, chemin in fichiers.items():

        if chemin.exists():

            print(
                f"[OK] {nom:<20} "
                f"{chemin}"
            )

        else:

            print(
                f"[ERREUR] {nom:<20} "
                f"{chemin}"
            )

            manquants.append(
                str(chemin)
            )

    if manquants:

        raise FileNotFoundError(
            "CSV manquant(s) : "
            + ", ".join(
                manquants
            )
        )

    return fichiers


# ============================================================
# IMPORT COMPLET
# ============================================================

def importer_exercice(
    fichier_source,
    annee
):

    import_id = None
    exercice_id = None

    TOTAL_ETAPES = 11

    try:

        print()
        print("#" * 70)
        print(
            "SXMXDX - IMPORT COMPLET "
            "D'UN EXERCICE"
        )
        print("#" * 70)

        print(
            f"Fichier  : "
            f"{fichier_source}"
        )

        print(
            f"Exercice : "
            f"{annee}"
        )

        # ====================================================
        # ETAPE 1
        # RECEPTION
        # ====================================================

        afficher_etape(
            1,
            TOTAL_ETAPES,
            "Réception du fichier"
        )

        fichier_upload = recevoir_fichier(
            fichier_source
        )

        fichier_upload = Path(
            fichier_upload
        ).resolve()

        # ====================================================
        # ETAPE 2
        # VALIDATION STRUCTURE
        # ====================================================

        afficher_etape(
            2,
            TOTAL_ETAPES,
            "Validation de la structure Excel"
        )

        valide = valider_structure(
            fichier_upload
        )

        if not valide:

            raise ValueError(
                "Structure Excel incompatible."
            )

        # ====================================================
        # ETAPE 3
        # CREATION IMPORT
        # ====================================================

        afficher_etape(
            3,
            TOTAL_ETAPES,
            "Création exercice et import PostgreSQL"
        )

        ids = creer_import(
            fichier_upload,
            annee
        )

        import_id = ids[
            "import_id"
        ]

        exercice_id = ids[
            "exercice_id"
        ]

        print()
        print(
            f"[OK] IMPORT_ID   = "
            f"{import_id}"
        )

        print(
            f"[OK] EXERCICE_ID = "
            f"{exercice_id}"
        )

        # ====================================================
        # ETAPE 4
        # EXTRACTION
        # ====================================================

        afficher_etape(
            4,
            TOTAL_ETAPES,
            "Extraction Excel vers CSV"
        )

        dossier_staging = (
            extraire_donnees(
                fichier_upload
            )
        )

        dossier_staging = Path(
            dossier_staging
        ).resolve()

        # ====================================================
        # ETAPE 5
        # VERIFICATION CSV
        # ====================================================

        afficher_etape(
            5,
            TOTAL_ETAPES,
            "Vérification des CSV"
        )

        fichiers = verifier_csv(
            dossier_staging
        )

        # ====================================================
        # CONVERSION DES CHEMINS POUR DOCKER
        # ====================================================

        csv_exportations = (
            chemin_conteneur(
                fichiers[
                    "exportations"
                ]
            )
        )

        csv_production = (
            chemin_conteneur(
                fichiers[
                    "production"
                ]
            )
        )

        csv_charges = (
            chemin_conteneur(
                fichiers[
                    "charges"
                ]
            )
        )

        csv_frais_export = (
            chemin_conteneur(
                fichiers[
                    "frais_export"
                ]
            )
        )

        csv_employes = (
            chemin_conteneur(
                fichiers[
                    "employes"
                ]
            )
        )

        # ====================================================
        # ETAPE 6
        # EXPORTATIONS
        # ====================================================

        afficher_etape(
            6,
            TOTAL_ETAPES,
            "Normalisation des exportations"
        )

        executer_spark(

            "pipeline/transformation/"
            "normaliser_exportations.py",

            csv_exportations,

            import_id,

            exercice_id
        )

        # ====================================================
        # ETAPE 7
        # PRODUCTION
        # ====================================================

        afficher_etape(
            7,
            TOTAL_ETAPES,
            "Normalisation de la production"
        )

        executer_spark(

            "pipeline/transformation/"
            "normaliser_production.py",

            csv_production,

            import_id,

            exercice_id
        )

        # ====================================================
        # ETAPE 8
        # CHARGES
        # ====================================================

        afficher_etape(
            8,
            TOTAL_ETAPES,
            "Normalisation des charges"
        )

        executer_spark(

            "pipeline/transformation/"
            "normaliser_charges.py",

            csv_charges,

            import_id,

            exercice_id
        )

        # ====================================================
        # ETAPE 9
        # FRAIS EXPORT
        # ====================================================

        afficher_etape(
            9,
            TOTAL_ETAPES,
            "Normalisation des frais export"
        )

        executer_spark(

            "pipeline/transformation/"
            "normaliser_frais_export.py",

            csv_frais_export,

            import_id,

            exercice_id
        )

        # ====================================================
        # ETAPE 10
        # EMPLOYES
        # ====================================================

        afficher_etape(
            10,
            TOTAL_ETAPES,
            "Normalisation des employés"
        )

        executer_spark(

            "pipeline/transformation/"
            "normaliser_employes.py",

            csv_employes,

            import_id
        )

        # ====================================================
        # ETAPE 11
        # VALIDATION FINALE
        # ====================================================

        afficher_etape(
            11,
            TOTAL_ETAPES,
            "Validation globale de l'import"
        )

        resultat = valider_import(
            import_id
        )

        if not resultat:

            raise RuntimeError(
                "La validation finale "
                "de l'import a échoué."
            )

        # ====================================================
        # SUCCES
        # ====================================================

        print()
        print("#" * 70)

        print(
            "IMPORT TERMINE AVEC SUCCES"
        )

        print("#" * 70)

        print(
            f"Exercice       : "
            f"{annee}"
        )

        print(
            f"Exercice ID    : "
            f"{exercice_id}"
        )

        print(
            f"Import ID      : "
            f"{import_id}"
        )

        print(
            "Statut         : "
            "PRET_GENERATION"
        )

        print(
            f"Fichier        : "
            f"{fichier_upload}"
        )

        print(
            f"Staging        : "
            f"{dossier_staging}"
        )

        print("#" * 70)

        return {

            "import_id":
                import_id,

            "exercice_id":
                exercice_id,

            "annee":
                annee,

            "fichier":
                str(
                    fichier_upload
                ),

            "staging":
                str(
                    dossier_staging
                ),

            "statut":
                "PRET_GENERATION"
        }

    except Exception as erreur:

        # ====================================================
        # ERREUR
        # ====================================================

        marquer_import_erreur(
            import_id,
            erreur
        )

        print()
        print("#" * 70)

        print(
            "ECHEC DE L'IMPORT"
        )

        print("#" * 70)

        print(
            f"Exercice : "
            f"{annee}"
        )

        if exercice_id is not None:

            print(
                f"Exercice ID : "
                f"{exercice_id}"
            )

        if import_id is not None:

            print(
                f"Import ID   : "
                f"{import_id}"
            )

        print(
            f"Erreur      : "
            f"{erreur}"
        )

        print("#" * 70)

        raise


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    # ========================================================
    # UN SEUL ARGUMENT :
    # LE FICHIER EXCEL
    # ========================================================

    if len(sys.argv) != 2:

        print()
        print(
            "Utilisation :"
        )

        print(
            "python3 "
            "pipeline/importation/"
            "importer_exercice.py "
            "<fichier_excel>"
        )

        print()

        print(
            "Exemple :"
        )

        print(
            "python3 "
            "pipeline/importation/"
            "importer_exercice.py "
            "\"data/SOMIDA_DAF_2025.xlsx\""
        )

        sys.exit(1)

    # ========================================================
    # FICHIER RECU
    # ========================================================

    fichier = Path(
        sys.argv[1]
    ).resolve()

    # ========================================================
    # VERIFICATION DU FICHIER
    # ========================================================

    if not fichier.exists():

        print(
            "[ERREUR] Fichier introuvable : "
            f"{fichier}"
        )

        sys.exit(1)

    if not fichier.is_file():

        print(
            "[ERREUR] Le chemin indiqué "
            "n'est pas un fichier : "
            f"{fichier}"
        )

        sys.exit(1)

    if fichier.suffix.lower() not in (
        ".xlsx",
        ".xlsm"
    ):

        print(
            "[ERREUR] Format Excel "
            "non supporté : "
            f"{fichier.suffix}"
        )

        sys.exit(1)

    # ========================================================
    # DETECTION AUTOMATIQUE DE L'EXERCICE
    # ========================================================

    try:

        annee = detecter_annee_exercice(
            fichier
        )

    except Exception as erreur:

        print()
        print(
            "[ERREUR] Impossible de "
            "déterminer automatiquement "
            "l'exercice."
        )

        print(
            f"[ERREUR] {erreur}"
        )

        sys.exit(1)

    # ========================================================
    # LANCEMENT DU WORKFLOW
    # ========================================================

    try:

        importer_exercice(
            fichier,
            annee
        )

    except Exception:

        traceback.print_exc()

        sys.exit(1)