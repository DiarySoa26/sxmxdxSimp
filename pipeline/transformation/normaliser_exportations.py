# from pyspark.sql import SparkSession
# from pyspark.sql import functions as F
# import sys


# MOIS = [
#     "Janvier",
#     "Février",
#     "Mars",
#     "Avril",
#     "Mai",
#     "Juin",
#     "Juillet",
#     "Août",
#     "Septembre",
#     "Octobre",
#     "Novembre",
#     "Décembre"
# ]


# def creer_spark():

#     return (
#         SparkSession.builder
#         .appName("SXMXDX_Exportations")
#         .master("local[*]")
#         .getOrCreate()
#     )


# def normaliser(df):

#     mois_disponibles = [
#         mois
#         for mois in MOIS
#         if mois in df.columns
#     ]

#     if not mois_disponibles:
#         raise ValueError(
#             "Aucune colonne mensuelle détectée."
#         )

#     colonnes_fixes = [
#         c
#         for c in df.columns
#         if c not in MOIS
#         and c.lower() not in [
#             "total",
#             "total annuel"
#         ]
#     ]

#     elements = []

#     for mois in mois_disponibles:

#         elements.extend([
#             F.lit(mois),
#             F.col(f"`{mois}`")
#         ])

#     resultat = df.select(
#         *[
#             F.col(f"`{c}`")
#             for c in colonnes_fixes
#         ],
#         F.explode(
#             F.create_map(*elements)
#         ).alias(
#             "mois",
#             "valeur"
#         )
#     )

#     return resultat


# def main(entree, sortie):

#     spark = creer_spark()

#     spark.sparkContext.setLogLevel("WARN")

#     print("=" * 70)
#     print("SXMXDX - NORMALISATION EXPORTATIONS")
#     print("=" * 70)

#     df = (
#         spark.read
#         .option("header", True)
#         .option("inferSchema", True)
#         .csv(entree)
#     )

#     print("\nColonnes détectées :")

#     for colonne in df.columns:
#         print(f" - {colonne}")

#     resultat = normaliser(df)

#     print("\nRésultat :")

#     resultat.show(
#         30,
#         truncate=False
#     )

#     (
#         resultat
#         .write
#         .mode("overwrite")
#         .option("header", True)
#         .csv(sortie)
#     )

#     print(f"\n[OK] {sortie}")

#     spark.stop()


# if __name__ == "__main__":

#     if len(sys.argv) != 3:

#         print(
#             "spark-submit "
#             "normaliser_exportations.py "
#             "<entree.csv> <sortie>"
#         )

#         sys.exit(1)

#     main(
#         sys.argv[1],
#         sys.argv[2]
#     )





from pyspark.sql import SparkSession
from pyspark.sql import functions as F
import sys
import csv
import os
import tempfile
import unicodedata


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
    "Décembre"
]


# ============================================================
# SPARK
# ============================================================

def creer_spark():

    return (
        SparkSession.builder
        .appName("SXMXDX_Exportations")
        .master("local[*]")
        .getOrCreate()
    )


# ============================================================
# NORMALISATION TEXTE
# ============================================================

def normaliser_texte(valeur):

    if valeur is None:
        return ""

    valeur = str(valeur).strip()

    # Supprime les accents pour faciliter les comparaisons
    valeur = unicodedata.normalize("NFD", valeur)

    valeur = "".join(
        caractere
        for caractere in valeur
        if unicodedata.category(caractere) != "Mn"
    )

    return valeur.lower()


# ============================================================
# DETECTION DE LA LIGNE D'ENTETE
# ============================================================

def detecter_entete(fichier):

    print("\nRecherche de la ligne d'en-tête...")

    with open(
        fichier,
        "r",
        encoding="utf-8-sig",
        errors="replace"
    ) as f:

        lignes = f.readlines()

    mois_normalises = {
        normaliser_texte(mois)
        for mois in MOIS
    }

    meilleure_ligne = None
    meilleur_score = 0

    for numero, ligne in enumerate(lignes):

        ligne_normalisee = normaliser_texte(ligne)

        score = sum(
            1
            for mois in mois_normalises
            if mois in ligne_normalisee
        )

        print(
            f"Ligne {numero + 1:02d} "
            f"-> {score} mois détecté(s)"
        )

        if score > meilleur_score:

            meilleur_score = score
            meilleure_ligne = numero

    if meilleure_ligne is None or meilleur_score < 2:

        raise ValueError(
            "Impossible de détecter automatiquement "
            "la ligne contenant les mois."
        )

    print(
        "\n[OK] Ligne d'en-tête détectée : "
        f"{meilleure_ligne + 1}"
    )

    print(
        f"[OK] {meilleur_score} mois détectés"
    )

    return meilleure_ligne


# ============================================================
# CREATION CSV PROPRE
# ============================================================

def preparer_csv(fichier, ligne_entete):

    print("\nPréparation du CSV...")

    with open(
        fichier,
        "r",
        encoding="utf-8-sig",
        errors="replace"
    ) as source:

        lignes = source.readlines()

    lignes_utiles = lignes[ligne_entete:]

    fichier_temporaire = tempfile.NamedTemporaryFile(
        mode="w",
        suffix=".csv",
        delete=False,
        encoding="utf-8"
    )

    fichier_temporaire.writelines(
        lignes_utiles
    )

    fichier_temporaire.close()

    print(
        "[OK] CSV temporaire créé : "
        f"{fichier_temporaire.name}"
    )

    return fichier_temporaire.name


# ============================================================
# CORRECTION DES NOMS DE COLONNES
# ============================================================

def nettoyer_colonnes(df):

    nouvelles_colonnes = []

    for colonne in df.columns:

        nouvelle = colonne.strip()

        # Recherche si la colonne correspond à un mois
        for mois in MOIS:

            if (
                normaliser_texte(nouvelle)
                == normaliser_texte(mois)
            ):
                nouvelle = mois
                break

        nouvelles_colonnes.append(
            nouvelle
        )

    return df.toDF(
        *nouvelles_colonnes
    )


# ============================================================
# NORMALISATION EXPORTATIONS
# ============================================================

def normaliser(df):

    mois_disponibles = [
        mois
        for mois in MOIS
        if mois in df.columns
    ]

    print("\nMois détectés :")

    for mois in mois_disponibles:
        print(f" - {mois}")

    if not mois_disponibles:

        raise ValueError(
            "Aucune colonne mensuelle détectée."
        )

    # Colonnes qui ne sont pas des mois
    colonnes_fixes = [
        c
        for c in df.columns
        if c not in MOIS
        and normaliser_texte(c)
        not in [
            "total",
            "total annuel"
        ]
    ]

    print("\nColonnes fixes :")

    for colonne in colonnes_fixes:
        print(f" - {colonne}")

    # Construction :
    #
    # Janvier -> valeur
    # Février -> valeur
    # Mars    -> valeur
    # ...

    elements = []

    for mois in mois_disponibles:

        elements.extend([
            F.lit(mois),
            F.col(f"`{mois}`")
        ])

    resultat = df.select(

        *[
            F.col(f"`{c}`")
            for c in colonnes_fixes
        ],

        F.explode(
            F.create_map(
                *elements
            )
        ).alias(
            "mois",
            "valeur"
        )
    )

    return resultat


# ============================================================
# MAIN
# ============================================================

def main(entree, sortie):

    spark = creer_spark()

    spark.sparkContext.setLogLevel(
        "WARN"
    )

    print("=" * 70)
    print(
        "SXMXDX - NORMALISATION EXPORTATIONS"
    )
    print("=" * 70)

    print(
        f"\nFichier source : {entree}"
    )

    # --------------------------------------------------------
    # 1. Détecter la vraie ligne d'en-tête
    # --------------------------------------------------------

    ligne_entete = detecter_entete(
        entree
    )

    # --------------------------------------------------------
    # 2. Créer un CSV commençant à cette ligne
    # --------------------------------------------------------

    fichier_prepare = preparer_csv(
        entree,
        ligne_entete
    )

    try:

        # ----------------------------------------------------
        # 3. Lecture Spark
        # ----------------------------------------------------

        df = (
            spark.read
            .option(
                "header",
                True
            )
            .option(
                "inferSchema",
                True
            )
            .csv(
                fichier_prepare
            )
        )

        # ----------------------------------------------------
        # 4. Nettoyage noms colonnes
        # ----------------------------------------------------

        df = nettoyer_colonnes(
            df
        )

        print(
            "\nColonnes détectées :"
        )

        for colonne in df.columns:

            print(
                f" - {colonne}"
            )

        # ----------------------------------------------------
        # 5. Normalisation
        # ----------------------------------------------------

        resultat = normaliser(
            df
        )

        # ----------------------------------------------------
        # 6. Suppression lignes complètement vides
        # ----------------------------------------------------

        resultat = resultat.filter(
            F.col("valeur").isNotNull()
        )

        print(
            "\nRésultat normalisé :"
        )

        resultat.show(
            50,
            truncate=False
        )

        # ----------------------------------------------------
        # 7. Ecriture
        # ----------------------------------------------------

        (
            resultat
            .write
            .mode(
                "overwrite"
            )
            .option(
                "header",
                True
            )
            .csv(
                sortie
            )
        )

        print(
            f"\n[OK] Export écrit dans : {sortie}"
        )

    finally:

        # Suppression du CSV temporaire

        if os.path.exists(
            fichier_prepare
        ):

            os.remove(
                fichier_prepare
            )

    spark.stop()


# ============================================================
# EXECUTION
# ============================================================

if __name__ == "__main__":

    if len(sys.argv) != 3:

        print(
            "\nUtilisation :\n\n"
            "spark-submit "
            "normaliser_exportations.py "
            "<entree.csv> "
            "<sortie>\n"
        )

        sys.exit(1)

    main(
        sys.argv[1],
        sys.argv[2]
    )