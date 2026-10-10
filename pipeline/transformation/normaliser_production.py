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
        .appName("SXMXDX_Production")
        .master("local[*]")
        .getOrCreate()
    )

    spark.sparkContext.setLogLevel("WARN")

    return spark


# ============================================================
# DETECTION COLONNE
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
    # 2. Détection des colonnes source
    # --------------------------------------------------------

    colonne_site = trouver_colonne(
        df,
        [
            "Site"
        ]
    )

    colonne_produit = trouver_colonne(
        df,
        [
            "Produit"
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
    print(f" - Site    : {colonne_site}")
    print(f" - Produit : {colonne_produit}")
    print(f" - Unité   : {colonne_unite}")

    # --------------------------------------------------------
    # 3. Construction mois -> valeur
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
    # SOURCE :
    #
    # Site | Produit | Unité |
    # Janvier | Février | ... | Décembre
    #
    # DEVIENT :
    #
    # site
    # produit
    # unite
    # mois
    # production_reelle
    # --------------------------------------------------------

    resultat = df.select(

        F.col(
            f"`{colonne_site}`"
        ).alias(
            "site"
        ),

        F.col(
            f"`{colonne_produit}`"
        ).alias(
            "produit"
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
            "production_reelle"
        )
    )

    # --------------------------------------------------------
    # 5. Conversion du mois en mois_id
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
    # 6. Ajout import_id / exercice_id
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
    # 7. Nettoyage et conversion des types
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
            "Site",
            F.trim(
                F.col("site")
            )
        )

        .withColumn(
            "produit",
            F.trim(
                F.col("produit")
            )
        )

        .withColumn(
            "unite",
            F.trim(
                F.col("unite")
            )
        )

        .withColumn(
            "production_reelle",
            F.col("production_reelle")
            .cast("double")
        )
    )

    # --------------------------------------------------------
    # 8. Colonnes NON présentes dans le CSV
    #
    # IMPORTANT :
    # On ne met PAS 0.
    # On ne calcule PAS ces valeurs.
    #
    # Elles restent NULL.
    # --------------------------------------------------------

    resultat = (
        resultat

        .withColumn(
            "production_prevue",
            F.lit(None).cast("double")
        )

        .withColumn(
            "pertes",
            F.lit(None).cast("double")
        )

        .withColumn(
            "production_commercialisable",
            F.lit(None).cast("double")
        )
    )

    # --------------------------------------------------------
    # 9. Structure finale
    # --------------------------------------------------------

    resultat = resultat.select(

        "import_id",
        "exercice_id",
        "mois_id",

        "site",
        "produit",
        "unite",

        "production_prevue",
        "production_reelle",
        "pertes",
        "production_commercialisable"
    )

    return resultat


# ============================================================
# VALIDATION
# ============================================================

def valider(df):

    total = df.count()

    if total == 0:

        raise ValueError(
            "Aucune production à importer."
        )

    # --------------------------------------------------------
    # mois_id obligatoire
    # --------------------------------------------------------

    invalides = (
        df
        .filter(
            F.col("mois_id").isNull()
        )
        .count()
    )

    if invalides > 0:

        raise ValueError(
            f"{invalides} ligne(s) "
            "avec mois_id invalide."
        )

    # --------------------------------------------------------
    # site obligatoire
    # --------------------------------------------------------

    invalides = (
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

    if invalides > 0:

        raise ValueError(
            f"{invalides} ligne(s) "
            "sans site."
        )

    # --------------------------------------------------------
    # produit obligatoire
    # --------------------------------------------------------

    invalides = (
        df
        .filter(
            F.col("produit").isNull()
            |
            (
                F.trim(
                    F.col("produit")
                ) == ""
            )
        )
        .count()
    )

    if invalides > 0:

        raise ValueError(
            f"{invalides} ligne(s) "
            "sans produit."
        )

    # --------------------------------------------------------
    # unité
    # --------------------------------------------------------

    invalides = (
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

    if invalides > 0:

        print(
            f"[ATTENTION] "
            f"{invalides} ligne(s) "
            "sans unité."
        )

    # --------------------------------------------------------
    # production réelle
    # --------------------------------------------------------

    invalides = (
        df
        .filter(
            F.col(
                "production_reelle"
            ).isNull()
        )
        .count()
    )

    if invalides > 0:

        print(
            f"[ATTENTION] "
            f"{invalides} ligne(s) "
            "avec production_reelle NULL."
        )

    print(
        f"\n[OK] {total} ligne(s) "
        "de production normalisées et validées."
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
            table="production",
            properties=JDBC_PROPERTIES
        )
    )

    print(
        "[OK] Table production alimentée."
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
        print("SXMXDX - IMPORT PRODUCTION")
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
        # Affichage source
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
        # Insertion PostgreSQL
        # ----------------------------------------------------

        inserer(
            resultat
        )

        print(
            "\n" + "=" * 70
        )

        print(
            "IMPORT PRODUCTION TERMINE"
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
            "normaliser_production.py "
            "<production.csv> "
            "<import_id> "
            "<exercice_id>"
        )

        sys.exit(1)

    main(
        sys.argv[1],
        int(sys.argv[2]),
        int(sys.argv[3])
    )