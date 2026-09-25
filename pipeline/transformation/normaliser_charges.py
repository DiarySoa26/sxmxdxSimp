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


# MAPPING_MOIS = {
#     mois: index + 1
#     for index, mois in enumerate(MOIS)
# }


# JDBC_URL = (
#     "jdbc:postgresql://postgres:5432/sxmxdx2"
# )


# JDBC_PROPERTIES = {
#     "user": "sxmxdx",
#     "password": "diary",
#     "driver": "org.postgresql.Driver"
# }


# def creer_spark():

#     spark = (
#         SparkSession.builder
#         .appName("SXMXDX_Charges")
#         .master("local[*]")
#         .getOrCreate()
#     )

#     spark.sparkContext.setLogLevel(
#         "WARN"
#     )

#     return spark


# def normaliser(
#     df,
#     import_id,
#     exercice_id
# ):

#     mois_disponibles = [
#         mois
#         for mois in MOIS
#         if mois in df.columns
#     ]

#     if not mois_disponibles:

#         raise ValueError(
#             "Aucune colonne mensuelle détectée."
#         )

#     print("\nMois détectés :")

#     for mois in mois_disponibles:
#         print(f" - {mois}")

#     elements = []

#     for mois in mois_disponibles:

#         elements.extend([
#             F.lit(mois),
#             F.col(f"`{mois}`")
#         ])

#     # -----------------------------------------
#     # Déterminer les colonnes métier
#     # -----------------------------------------

#     if "Catégorie" in df.columns:

#         categorie = "Catégorie"

#     elif "Categorie" in df.columns:

#         categorie = "Categorie"

#     else:

#         raise ValueError(
#             "Colonne Catégorie introuvable."
#         )

#     # if "Sous-catégorie" in df.columns:

#     #     sous_categorie = "Sous-catégorie"

#     # elif "Sous-categorie" in df.columns:

#     #     sous_categorie = "Sous-categorie"

#     # else:

#     #     raise ValueError(
#     #         "Colonne Sous-catégorie introuvable."
#     #     )

#     # -----------------------------------------
#     # Unpivot
#     # -----------------------------------------

#     resultat = df.select(

#         F.col(
#             f"`{categorie}`"
#         ).alias("categorie"),

#         # F.col(
#         #     f"`{sous_categorie}`"
#         # ).alias("sous_categorie"),

#         F.explode(
#             F.create_map(*elements)
#         ).alias(
#             "mois",
#             "montant"
#         )
#     )

#     # -----------------------------------------
#     # mois_id
#     # -----------------------------------------

#     expression = F.create_map(
#         *[
#             element
#             for mois, numero
#             in MAPPING_MOIS.items()
#             for element in (
#                 F.lit(mois),
#                 F.lit(numero)
#             )
#         ]
#     )

#     resultat = resultat.withColumn(
#         "mois_id",
#         expression[F.col("mois")]
#     )

#     # -----------------------------------------
#     # IDs
#     # -----------------------------------------

#     resultat = (
#         resultat

#         .withColumn(
#             "import_id",
#             F.lit(import_id)
#         )

#         .withColumn(
#             "exercice_id",
#             F.lit(exercice_id)
#         )

#         .withColumn(
#             "montant",
#             F.col("montant").cast("double")
#         )
#     )

#     # -----------------------------------------
#     # Structure finale
#     # -----------------------------------------

#     resultat = resultat.select(
#         "import_id",
#         "exercice_id",
#         "mois_id",
#         "categorie",
#         # "sous_categorie",
#         "montant"
#     )

#     return resultat


# def main(
#     fichier_csv,
#     import_id,
#     exercice_id
# ):

#     spark = creer_spark()

#     try:

#         print("\n" + "=" * 70)
#         print("SXMXDX - IMPORT CHARGES")
#         print("=" * 70)

#         df = (
#             spark.read
#             .option("header", True)
#             .option("inferSchema", True)
#             .csv(fichier_csv)
#         )

#         print("\nColonnes détectées :")

#         for colonne in df.columns:
#             print(f" - {colonne}")

#         df.show(
#             10,
#             truncate=False
#         )

#         resultat = normaliser(
#             df,
#             import_id,
#             exercice_id
#         )

#         print("\nDonnées normalisées :")

#         resultat.printSchema()

#         resultat.show(
#             30,
#             truncate=False
#         )

#         total = resultat.count()

#         if total == 0:

#             raise ValueError(
#                 "Aucune charge à importer."
#             )

#         print(
#             f"\n[OK] {total} charge(s) "
#             "prête(s)."
#         )

#         (
#             resultat.write
#             .mode("append")
#             .jdbc(
#                 url=JDBC_URL,
#                 table="charge",
#                 properties=JDBC_PROPERTIES
#             )
#         )

#         print(
#             "[OK] Table charge alimentée."
#         )

#     finally:

#         spark.stop()


# if __name__ == "__main__":

#     if len(sys.argv) != 4:

#         print(
#             "spark-submit "
#             "normaliser_charges.py "
#             "<charges.csv> "
#             "<import_id> "
#             "<exercice_id>"
#         )

#         sys.exit(1)

#     main(
#         sys.argv[1],
#         int(sys.argv[2]),
#         int(sys.argv[3])
#     )


from pyspark.sql import SparkSession
from pyspark.sql import functions as F
import sys


# ============================================================
# CONFIGURATION
# ============================================================

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


MAPPING_MOIS = {
    mois: index + 1
    for index, mois in enumerate(MOIS)
}


JDBC_URL = (
    "jdbc:postgresql://postgres:5432/sxmxdx2"
)


JDBC_PROPERTIES = {
    "user": "sxmxdx",
    "password": "diary",
    "driver": "org.postgresql.Driver"
}


# ============================================================
# CREATION SESSION SPARK
# ============================================================

def creer_spark():

    spark = (
        SparkSession.builder
        .appName("SXMXDX_Charges")
        .master("local[*]")
        .getOrCreate()
    )

    spark.sparkContext.setLogLevel("WARN")

    return spark


# ============================================================
# DETECTION DES COLONNES
# ============================================================

def trouver_colonne(
    df,
    noms_possibles,
    obligatoire=True
):

    for nom in noms_possibles:

        if nom in df.columns:
            return nom

    if obligatoire:

        raise ValueError(
            "Colonne introuvable. "
            f"Noms recherchés : {noms_possibles}"
        )

    return None


# ============================================================
# DETECTION DES MOIS
# ============================================================

def detecter_mois(df):

    mois_disponibles = [
        mois
        for mois in MOIS
        if mois in df.columns
    ]

    if not mois_disponibles:

        raise ValueError(
            "Aucune colonne mensuelle détectée."
        )

    print("\nMois détectés :")

    for mois in mois_disponibles:
        print(f" - {mois}")

    return mois_disponibles


# ============================================================
# NORMALISATION
# ============================================================

def normaliser(
    df,
    import_id,
    exercice_id
):

    # --------------------------------------------------------
    # 1. Détection des mois
    # --------------------------------------------------------

    mois_disponibles = detecter_mois(df)

    # --------------------------------------------------------
    # 2. Détection des colonnes métier
    # --------------------------------------------------------

    colonne_categorie = trouver_colonne(
        df,
        [
            "Catégorie",
            "Categorie"
        ]
    )

    colonne_nature = trouver_colonne(
        df,
        [
            "Nature",
            "Sous-catégorie",
            "Sous-categorie"
        ]
    )

    colonne_site = trouver_colonne(
        df,
        [
            "Site"
        ]
    )

    colonne_unite = trouver_colonne(
        df,
        [
            "Unité",
            "Unite"
        ]
    )

    print("\nColonnes métier utilisées :")
    print(
        f" - Catégorie      : "
        f"{colonne_categorie}"
    )
    print(
        f" - Sous-catégorie : "
        f"{colonne_nature}"
    )
    print(
        f" - Site           : "
        f"{colonne_site}"
    )
    print(
        f" - Unité          : "
        f"{colonne_unite}"
    )

    # --------------------------------------------------------
    # 3. Construction de la map mois -> montant
    # --------------------------------------------------------

    elements = []

    for mois in mois_disponibles:

        elements.extend([
            F.lit(mois),
            F.col(f"`{mois}`")
        ])

    # --------------------------------------------------------
    # 4. UNPIVOT
    #
    # AVANT :
    #
    # Catégorie | Nature | Site | Unité |
    # Janvier | Février | ...
    #
    # APRES :
    #
    # categorie
    # sous_categorie
    # site
    # unite
    # mois
    # montant
    # --------------------------------------------------------

    resultat = df.select(

        F.col(
            f"`{colonne_categorie}`"
        ).alias(
            "categorie"
        ),

        F.col(
            f"`{colonne_nature}`"
        ).alias(
            "sous_categorie"
        ),

        F.col(
            f"`{colonne_site}`"
        ).alias(
            "site"
        ),

        F.col(
            f"`{colonne_unite}`"
        ).alias(
            "unite"
        ),

        F.explode(
            F.create_map(*elements)
        ).alias(
            "mois",
            "montant"
        )
    )

    # --------------------------------------------------------
    # 5. AJOUT mois_id
    # --------------------------------------------------------

    expression_mois = F.create_map(
        *[
            element
            for mois, numero
            in MAPPING_MOIS.items()
            for element in (
                F.lit(mois),
                F.lit(numero)
            )
        ]
    )

    resultat = resultat.withColumn(
        "mois_id",
        expression_mois[
            F.col("mois")
        ]
    )

    # --------------------------------------------------------
    # 6. AJOUT DES IDENTIFIANTS
    # --------------------------------------------------------

    resultat = (
        resultat

        .withColumn(
            "import_id",
            F.lit(import_id)
        )

        .withColumn(
            "exercice_id",
            F.lit(exercice_id)
        )
    )

    # --------------------------------------------------------
    # 7. CONVERSION DES TYPES
    # --------------------------------------------------------

    resultat = (
        resultat

        .withColumn(
            "import_id",
            F.col("import_id")
            .cast("integer")
        )

        .withColumn(
            "exercice_id",
            F.col("exercice_id")
            .cast("integer")
        )

        .withColumn(
            "mois_id",
            F.col("mois_id")
            .cast("integer")
        )

        .withColumn(
            "categorie",
            F.trim(
                F.col("categorie")
            )
        )

        .withColumn(
            "sous_categorie",
            F.trim(
                F.col("sous_categorie")
            )
        )

        .withColumn(
            "site",
            F.trim(
                F.col("site")
            )
        )

        .withColumn(
            "unite",
            F.trim(
                F.col("unite")
            )
        )

        .withColumn(
            "montant",
            F.col("montant")
            .cast("double")
        )
    )

    # --------------------------------------------------------
    # 8. STRUCTURE FINALE
    # --------------------------------------------------------

    resultat = resultat.select(

        "import_id",
        "exercice_id",
        "mois_id",

        "categorie",
        "sous_categorie",

        "site",
        "unite",

        "montant"
    )

    return resultat


# ============================================================
# VALIDATION
# ============================================================

def valider(df):

    total = df.count()

    if total == 0:

        raise ValueError(
            "Aucune charge à importer."
        )

    # --------------------------------------------------------
    # Vérification mois
    # --------------------------------------------------------

    mois_invalides = (
        df
        .filter(
            F.col("mois_id").isNull()
        )
        .count()
    )

    if mois_invalides > 0:

        raise ValueError(
            f"{mois_invalides} ligne(s) "
            "avec mois_id invalide."
        )

    # --------------------------------------------------------
    # Vérification catégorie
    # --------------------------------------------------------

    categories_invalides = (
        df
        .filter(
            F.col("categorie").isNull()
            |
            (
                F.trim(
                    F.col("categorie")
                ) == ""
            )
        )
        .count()
    )

    if categories_invalides > 0:

        raise ValueError(
            f"{categories_invalides} ligne(s) "
            "sans catégorie."
        )

    # --------------------------------------------------------
    # Vérification sous-catégorie / nature
    # --------------------------------------------------------

    sous_categories_invalides = (
        df
        .filter(
            F.col(
                "sous_categorie"
            ).isNull()
            |
            (
                F.trim(
                    F.col("sous_categorie")
                ) == ""
            )
        )
        .count()
    )

    if sous_categories_invalides > 0:

        print(
            f"[ATTENTION] "
            f"{sous_categories_invalides} ligne(s) "
            "sans sous-catégorie."
        )

    # --------------------------------------------------------
    # Vérification site
    # --------------------------------------------------------

    sites_invalides = (
        df
        .filter(
            F.col("site").isNull()
            |
            (
                F.trim(
                    F.col("site")
                ) == ""
            )
        )
        .count()
    )

    if sites_invalides > 0:

        print(
            f"[ATTENTION] "
            f"{sites_invalides} ligne(s) "
            "sans site."
        )

    # --------------------------------------------------------
    # Vérification unité
    # --------------------------------------------------------

    unites_invalides = (
        df
        .filter(
            F.col("unite").isNull()
            |
            (
                F.trim(
                    F.col("unite")
                ) == ""
            )
        )
        .count()
    )

    if unites_invalides > 0:

        print(
            f"[ATTENTION] "
            f"{unites_invalides} ligne(s) "
            "sans unité."
        )

    # --------------------------------------------------------
    # Vérification montant
    # --------------------------------------------------------

    montants_invalides = (
        df
        .filter(
            F.col("montant").isNull()
        )
        .count()
    )

    if montants_invalides > 0:

        print(
            f"[ATTENTION] "
            f"{montants_invalides} ligne(s) "
            "avec montant NULL."
        )

    print(
        f"\n[OK] {total} ligne(s) "
        "de charges normalisées et validées."
    )


# ============================================================
# INSERTION POSTGRESQL
# ============================================================

def inserer(df):

    print(
        "\nInsertion dans PostgreSQL..."
    )

    (
        df.write

        .mode("append")

        .jdbc(
            url=JDBC_URL,
            table="charge",
            properties=JDBC_PROPERTIES
        )
    )

    print(
        "[OK] Table charge alimentée."
    )


# ============================================================
# MAIN
# ============================================================

def main(
    fichier_csv,
    import_id,
    exercice_id
):

    spark = creer_spark()

    try:

        print("\n" + "=" * 70)
        print("SXMXDX - IMPORT CHARGES")
        print("=" * 70)

        # ----------------------------------------------------
        # Lecture CSV
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
                fichier_csv
            )
        )

        # ----------------------------------------------------
        # Affichage structure source
        # ----------------------------------------------------

        print(
            "\nColonnes détectées :"
        )

        for colonne in df.columns:
            print(
                f" - {colonne}"
            )

        print(
            "\nDonnées sources :"
        )

        df.show(
            10,
            truncate=False
        )

        # ----------------------------------------------------
        # Normalisation
        # ----------------------------------------------------

        resultat = normaliser(
            df,
            import_id,
            exercice_id
        )

        # ----------------------------------------------------
        # Affichage résultat
        # ----------------------------------------------------

        print(
            "\nDonnées normalisées :"
        )

        resultat.printSchema()

        resultat.show(
            50,
            truncate=False
        )

        # ----------------------------------------------------
        # Validation
        # ----------------------------------------------------

        valider(
            resultat
        )

        # ----------------------------------------------------
        # Insertion
        # ----------------------------------------------------

        inserer(
            resultat
        )

        print(
            "\n" + "=" * 70
        )

        print(
            "IMPORT CHARGES TERMINE"
        )

        print(
            "=" * 70
        )

    finally:

        spark.stop()


# ============================================================
# EXECUTION
# ============================================================

if __name__ == "__main__":

    if len(sys.argv) != 4:

        print(
            "Utilisation : "
            "spark-submit "
            "normaliser_charges.py "
            "<charges.csv> "
            "<import_id> "
            "<exercice_id>"
        )

        sys.exit(1)

    main(
        sys.argv[1],
        int(sys.argv[2]),
        int(sys.argv[3])
    )