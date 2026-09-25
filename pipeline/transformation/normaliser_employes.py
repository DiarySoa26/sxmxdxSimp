from pyspark.sql import SparkSession
from pyspark.sql import functions as F
import sys


JDBC_URL = (
    "jdbc:postgresql://postgres:5432/sxmxdx2"
)


JDBC_PROPERTIES = {
    "user": "sxmxdx",
    "password": "diary",
    "driver": "org.postgresql.Driver"
}


def creer_spark():

    spark = (
        SparkSession.builder
        .appName("SXMXDX_Employes")
        .master("local[*]")
        .getOrCreate()
    )

    spark.sparkContext.setLogLevel(
        "WARN"
    )

    return spark


# ============================================================
# RENOMMAGE
# ============================================================

def renommer(df):

    correspondances = {

        "Matricule":
            "matricule",

        "Nom simulé":
            "nom",

        "Site":
            "site",

        "Département":
            "departement",

        "Departement":
            "departement",

        "Poste":
            "poste",

        "Salaire base mensuel (MGA)":
            "salaire_base",

        "Prime mensuelle (MGA)":
            "prime",

        "Charges patronales (MGA)":
            "charges_patronales",

        "Statut":
            "statut"
            
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
# COMPLETER
# ============================================================

def completer(df):

    resultat = df

    colonnes_texte = [
        "matricule",
        "nom",
        "site",
        "departement",
        "poste"
    ]

    for colonne in colonnes_texte:

        if colonne not in resultat.columns:

            resultat = (
                resultat
                .withColumn(
                    colonne,
                    F.lit(None)
                    .cast("string")
                )
            )

    colonnes_numeriques = [
        "salaire_base",
        "prime",
        "charges_patronales"
    ]

    for colonne in colonnes_numeriques:

        if colonne not in resultat.columns:

            resultat = (
                resultat
                .withColumn(
                    colonne,
                    F.lit(0.0)
                )
            )

    return resultat


# ============================================================
# CALCUL COUT TOTAL
# ============================================================

def calculer_cout(df):

    return df.withColumn(

        "cout_total",

        F.coalesce(
            F.col("salaire_base"),
            F.lit(0)
        )

        +

        F.coalesce(
            F.col("prime"),
            F.lit(0)
        )

        +

        F.coalesce(
            F.col("charges_patronales"),
            F.lit(0)
        )
    )


# ============================================================
# PREPARATION
# ============================================================

def preparer(
    df,
    import_id
):

    resultat = (
        df
        .withColumn(
            "import_id",
            F.lit(import_id)
        )
    )

    colonnes_numeriques = [
        "salaire_base",
        "prime",
        "charges_patronales",
        "cout_total"
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

    resultat = resultat.withColumn(
        "import_id",
        F.col("import_id")
        .cast("integer")
    )

    return resultat.select(
        "import_id",
        "matricule",
        "nom",
        "site",
        "departement",
        "poste",
        "salaire_base",
        "prime",
        "charges_patronales",
        "cout_total"
    )


# ============================================================
# VALIDATION
# ============================================================

def valider(df):

    total = df.count()

    if total == 0:

        raise ValueError(
            "Aucun employé à importer."
        )

    sans_nom = (
        df
        .filter(
            F.col("nom").isNull()
        )
        .count()
    )

    if sans_nom > 0:

        print(
            f"[ATTENTION] "
            f"{sans_nom} ligne(s) "
            "sans nom."
        )

    print(
        f"[OK] {total} employé(s) "
        "prêt(s)."
    )


# ============================================================
# INSERTION
# ============================================================

def inserer(df):

    (
        df.write

        .mode("append")

        .jdbc(
            url=JDBC_URL,
            table="employe",
            properties=JDBC_PROPERTIES
        )
    )

    print(
        "[OK] Table employe alimentée."
    )


# ============================================================
# MAIN
# ============================================================

def main(
    fichier_csv,
    import_id
):

    spark = creer_spark()

    try:

        print("\n" + "=" * 70)
        print("SXMXDX - IMPORT EMPLOYES")
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

        df = renommer(
            df
        )

        df = completer(
            df
        )

        df = calculer_cout(
            df
        )

        df = preparer(
            df,
            import_id
        )

        print(
            "\nDonnées finales :"
        )

        df.printSchema()

        df.show(
            20,
            truncate=False
        )

        valider(
            df
        )

        inserer(
            df
        )

        print("\n" + "=" * 70)
        print("IMPORT EMPLOYES TERMINE")
        print("=" * 70)

    finally:

        spark.stop()


if __name__ == "__main__":

    if len(sys.argv) != 3:

        print(
            "spark-submit "
            "normaliser_employes.py "
            "<employes.csv> "
            "<import_id>"
        )

        sys.exit(1)

    main(
        sys.argv[1],
        int(sys.argv[2])
    )