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
# SPARK
# ============================================================

def creer_spark():

    spark = (
        SparkSession.builder
        .appName("SXMXDX_Frais_Export")
        .master("local[*]")
        .getOrCreate()
    )

    spark.sparkContext.setLogLevel(
        "WARN"
    )

    return spark


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
# UNPIVOT DES MOIS
# ============================================================

def normaliser_mois(df):

    mois_disponibles = detecter_mois(
        df
    )

    colonnes_fixes = [
        colonne
        for colonne in df.columns

        if colonne not in MOIS

        and colonne.lower()
        not in [
            "total",
            "total annuel"
        ]
    ]

    elements = []

    for mois in mois_disponibles:

        elements.extend([
            F.lit(mois),
            F.col(f"`{mois}`")
        ])

    resultat = df.select(

        *[
            F.col(f"`{colonne}`")
            for colonne
            in colonnes_fixes
        ],

        F.explode(
            F.create_map(*elements)
        ).alias(
            "mois",
            "valeur"
        )
    )

    return resultat


# ============================================================
# PIVOT DES INDICATEURS
# ============================================================

def pivoter_indicateurs(df):

    colonnes_requises = [
        "Pays",
        "Nature frais",
        "mois",
        "valeur"
    ]

    for colonne in colonnes_requises:

        if colonne not in df.columns:

            raise ValueError(
                f"Colonne manquante : {colonne}"
            )

    # ========================================================
    # Colonnes servant à identifier une ligne mensuelle
    # ========================================================

    cles = [
        "Pays",
        "mois"
    ]

    if "Entité représentatrice" in df.columns:

        cles.append(
            "Entité représentatrice"
        )

    elif "Representant" in df.columns:

        cles.append(
            "Representant"
        )

    # ========================================================
    # Afficher les natures de frais trouvées
    # ========================================================

    print(
        "\nNatures de frais détectées :"
    )

    natures = (
        df
        .select("Nature frais")
        .where(
            F.col("Nature frais").isNotNull()
        )
        .distinct()
        .collect()
    )

    for ligne in natures:

        print(
            f" - {ligne['Nature frais']}"
        )

    # ========================================================
    # PIVOT
    #
    # AVANT :
    #
    # Japon | GOODEIS | Janvier | Transport local | 15459000
    # Japon | GOODEIS | Janvier | Transit         | ...
    # Japon | GOODEIS | Janvier | Manutention     | ...
    #
    # APRES :
    #
    # Japon | GOODEIS | Janvier |
    # Transport local | Transit | Manutention | ...
    # ========================================================

    resultat = (
        df

        .groupBy(
            *cles
        )

        .pivot(
            "Nature frais"
        )

        .agg(
            F.first(
                "valeur",
                ignorenulls=True
            )
        )
    )

    return resultat

# ============================================================
# AJOUT mois_id
# ============================================================

def ajouter_mois_id(df):

    expression = F.create_map(

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

    return df.withColumn(
        "mois_id",
        expression[
            F.col("mois")
        ]
    )


# ============================================================
# RENOMMAGE
# ============================================================

def renommer_colonnes(df):

    correspondances = {

        "Pays":
            "pays",

        "Entité représentatrice":
            "representant",

        "Representant":
            "representant",

        # ====================================================
        # NATURES DE FRAIS DU CSV
        # ====================================================

        "Transport local":
            "transport_local",

        "Transit & documents":
            "transit",

        "Manutention portuaire":
            "manutention",

        "Fret international":
            "fret",

        "Assurance transport":
            "assurance",

        "Frais bancaires export":
            "frais_bancaires"
    }

    resultat = df

    for ancien, nouveau in correspondances.items():

        if ancien in resultat.columns:

            resultat = (
                resultat
                .withColumnRenamed(
                    ancien,
                    nouveau
                )
            )

    return resultat


# ============================================================
# COMPLETER LES COLONNES
# ============================================================

def completer_colonnes(df):

    resultat = df

    colonnes_numeriques = [
        "transport_local",
        "transit",
        "manutention",
        "fret",
        "assurance",
        "frais_bancaires"
    ]

    for colonne in colonnes_numeriques:

        if colonne not in resultat.columns:

            print(
                f"[INFO] Nature de frais absente : "
                f"{colonne}"
            )

            resultat = (
                resultat
                .withColumn(
                    colonne,
                    F.lit(None).cast("double")
                )
            )

    if "representant" not in resultat.columns:

        resultat = (
            resultat
            .withColumn(
                "representant",
                F.lit(None).cast("string")
            )
        )

    return resultat

# ============================================================
# CALCUL TOTAL
# ============================================================

def calculer_total(df):

    return df.withColumn(

        "total",

        F.coalesce(
            F.col("transport_local").cast("double"),
            F.lit(0.0)
        )

        +

        F.coalesce(
            F.col("transit").cast("double"),
            F.lit(0.0)
        )

        +

        F.coalesce(
            F.col("manutention").cast("double"),
            F.lit(0.0)
        )

        +

        F.coalesce(
            F.col("fret").cast("double"),
            F.lit(0.0)
        )

        +

        F.coalesce(
            F.col("assurance").cast("double"),
            F.lit(0.0)
        )

        +

        F.coalesce(
            F.col("frais_bancaires").cast("double"),
            F.lit(0.0)
        )
    )

# ============================================================
# PREPARATION POSTGRESQL
# ============================================================

def preparer(
    df,
    import_id,
    exercice_id
):

    resultat = (
        df

        .withColumn(
            "import_id",
            F.lit(import_id)
        )

        .withColumn(
            "exercice_id",
            F.lit(exercice_id)
        )
    )

    colonnes_numeriques = [
        "transport_local",
        "transit",
        "manutention",
        "fret",
        "assurance",
        "frais_bancaires",
        "total"
    ]

    for colonne in colonnes_numeriques:

        resultat = (
            resultat
            .withColumn(
                colonne,
                F.col(colonne)
                .cast("double")
            )
        )

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
    )

    return resultat.select(

        "import_id",
        "exercice_id",
        "mois_id",

        "pays",
        "representant",

        "transport_local",
        "transit",
        "manutention",
        "fret",
        "assurance",
        "frais_bancaires",

        "total"
    )


# ============================================================
# VALIDATION
# ============================================================

def valider(df):

    total = df.count()

    if total == 0:

        raise ValueError(
            "Aucun frais export à importer."
        )

    mois_invalides = (
        df
        .filter(
            F.col("mois_id").isNull()
        )
        .count()
    )

    if mois_invalides > 0:

        raise ValueError(
            f"{mois_invalides} "
            "mois invalide(s)."
        )

    print(
        f"\n[OK] {total} ligne(s) "
        "de frais export valides."
    )


# ============================================================
# INSERTION
# ============================================================

def inserer(df):

    print(
        "\nInsertion PostgreSQL..."
    )

    (
        df.write

        .mode("append")

        .jdbc(
            url=JDBC_URL,
            table="frais_export",
            properties=JDBC_PROPERTIES
        )
    )

    print(
        "[OK] Table frais_export alimentée."
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
        print("SXMXDX - IMPORT FRAIS EXPORT")
        print("=" * 70)

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

        print(
            "\nColonnes détectées :"
        )

        for colonne in df.columns:
            print(
                f" - {colonne}"
            )

        print(
            "\nDonnées brutes :"
        )

        df.show(
            10,
            truncate=False
        )

        df = normaliser_mois(
            df
        )

        df = pivoter_indicateurs(
            df
        )

        df = ajouter_mois_id(
            df
        )

        df = renommer_colonnes(
            df
        )

        df = completer_colonnes(
            df
        )

        df = calculer_total(
            df
        )

        df = preparer(
            df,
            import_id,
            exercice_id
        )

        print(
            "\nDonnées finales :"
        )

        df.printSchema()

        df.show(
            30,
            truncate=False
        )

        valider(
            df
        )

        inserer(
            df
        )

        print("\n" + "=" * 70)
        print("IMPORT FRAIS EXPORT TERMINE")
        print("=" * 70)

    finally:

        spark.stop()


# ============================================================
# EXECUTION
# ============================================================

if __name__ == "__main__":

    if len(sys.argv) != 4:

        print(
            "spark-submit "
            "normaliser_frais_export.py "
            "<frais_export.csv> "
            "<import_id> "
            "<exercice_id>"
        )

        sys.exit(1)

    main(
        sys.argv[1],
        int(sys.argv[2]),
        int(sys.argv[3])
    )