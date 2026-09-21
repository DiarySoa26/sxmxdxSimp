from pyspark.sql import SparkSession
from pyspark.sql import functions as F
import sys


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


def creer_spark():

    return (
        SparkSession.builder
        .appName("SXMXDX_Normalisation")
        .master("local[*]")
        .getOrCreate()
    )


def normaliser_mois(df):

    colonnes = df.columns

    mois_presents = [
        mois
        for mois in MOIS
        if mois in colonnes
    ]

    if not mois_presents:

        print(
            "[INFO] Aucun mois horizontal détecté."
        )

        return df

    colonnes_fixes = [
        c
        for c in colonnes
        if c not in mois_presents
    ]

    elements = []

    for mois in mois_presents:

        elements.extend([
            F.lit(mois),
            F.col(f"`{mois}`")
        ])

    df_normalise = df.select(
        *[
            F.col(f"`{c}`")
            for c in colonnes_fixes
        ],

        F.explode(
            F.create_map(*elements)
        ).alias("mois", "valeur")
    )

    return df_normalise


def main(fichier_csv, dossier_sortie):

    spark = creer_spark()

    print("\n" + "=" * 70)
    print("SXMXDX - NORMALISATION SPARK")
    print("=" * 70)

    df = (
        spark.read
        .option("header", True)
        .option("inferSchema", True)
        .csv(fichier_csv)
    )

    print("\nStructure avant :")
    df.printSchema()

    df.show(5, truncate=False)

    resultat = normaliser_mois(df)

    print("\nStructure après :")
    resultat.printSchema()

    resultat.show(20, truncate=False)

    (
        resultat
        .write
        .mode("overwrite")
        .option("header", True)
        .csv(dossier_sortie)
    )

    print(
        f"\n[OK] Données normalisées : "
        f"{dossier_sortie}"
    )

    spark.stop()


if __name__ == "__main__":

    if len(sys.argv) != 3:

        print(
            "Utilisation : spark-submit "
            "normaliser_spark.py "
            "<fichier.csv> "
            "<sortie>"
        )

        sys.exit(1)

    main(
        sys.argv[1],
        sys.argv[2]
    )