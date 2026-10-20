
import sys

from pyspark.sql import SparkSession
from pyspark.sql import functions as F


# ============================================================
# CONFIGURATION
# ============================================================

MOIS = [
    "Janvier", "Février", "Mars", "Avril",
    "Mai", "Juin", "Juillet", "Août",
    "Septembre", "Octobre", "Novembre", "Décembre"
]

MAPPING_MOIS = {
    mois: index + 1
    for index, mois in enumerate(MOIS)
}

JDBC_URL = "jdbc:postgresql://postgres:5432/sxmxdx2"

JDBC_PROPERTIES = {
    "user": "sxmxdx",
    "password": "diary",
    "driver": "org.postgresql.Driver"
}


# ============================================================
# SESSION SPARK
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

def trouver_colonne(df, noms_possibles, obligatoire=True):
    for nom in noms_possibles:
        if nom in df.columns:
            return nom

    if obligatoire:
        raise ValueError(
            "Colonne introuvable. "
            f"Noms recherchés : {noms_possibles}"
        )

    return None


def detecter_mois(df):
    mois_disponibles = [
        mois for mois in MOIS
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
# NETTOYAGE DES LIGNES VIDES
# ============================================================

def nettoyer_lignes_vides(
    df,
    colonnes_metier,
    mois_disponibles
):
    """
    Supprime uniquement les lignes entièrement vides.

    Une ligne avec un montant mais sans catégorie
    reste présente pour être signalée à la validation.
    """

    def est_vide(colonne):
        valeur = F.col(f"`{colonne}`")

        return (
            valeur.isNull()
            | (F.trim(valeur.cast("string")) == "")
        )

    toutes_metier_vides = F.lit(True)

    for colonne in colonnes_metier:
        toutes_metier_vides = (
            toutes_metier_vides & est_vide(colonne)
        )

    tous_montants_vides = F.lit(True)

    for mois in mois_disponibles:
        tous_montants_vides = (
            tous_montants_vides & est_vide(mois)
        )

    ligne_totalement_vide = (
        toutes_metier_vides & tous_montants_vides
    )

    nb_avant = df.count()

    resultat = df.filter(~ligne_totalement_vide)

    nb_apres = resultat.count()

    print("\nNettoyage des lignes vides :")
    print(f" - Lignes initiales : {nb_avant}")
    print(f" - Lignes supprimées : {nb_avant - nb_apres}")
    print(f" - Lignes conservées : {nb_apres}")

    return resultat


# ============================================================
# NORMALISATION
# ============================================================

def normaliser(df, import_id, exercice_id):

    mois_disponibles = detecter_mois(df)

    colonne_categorie = trouver_colonne(
        df, ["Catégorie", "Categorie"]
    )

    colonne_nature = trouver_colonne(
        df,
        ["Nature", "Sous-catégorie", "Sous-categorie"]
    )

    colonne_site = trouver_colonne(
        df, ["Site"]
    )

    colonne_unite = trouver_colonne(
        df, ["Unité", "Unite"]
    )

    print("\nColonnes métier utilisées :")
    print(f" - Catégorie : {colonne_categorie}")
    print(f" - Nature : {colonne_nature}")
    print(f" - Site : {colonne_site}")
    print(f" - Unité : {colonne_unite}")

    # Nettoyage avant transformation mensuelle

    df = nettoyer_lignes_vides(
        df,
        [
            colonne_categorie,
            colonne_nature,
            colonne_site,
            colonne_unite
        ],
        mois_disponibles
    )

    # Construction de la map mois / montant

    elements = []

    for mois in mois_disponibles:
        elements.extend([
            F.lit(mois),
            F.col(f"`{mois}`")
        ])

    # Transformation des colonnes mensuelles en lignes

    resultat = df.select(
        F.col(f"`{colonne_categorie}`").alias(
            "categorie"
        ),
        F.col(f"`{colonne_nature}`").alias(
            "sous_categorie"
        ),
        F.col(f"`{colonne_site}`").alias(
            "site"
        ),
        F.col(f"`{colonne_unite}`").alias(
            "unite"
        ),
        F.explode(
            F.create_map(*elements)
        ).alias("mois", "montant")
    )

    # Correspondance des mois

    expression_mois = F.create_map(
        *[
            element
            for mois, numero in MAPPING_MOIS.items()
            for element in (
                F.lit(mois),
                F.lit(numero)
            )
        ]
    )

    resultat = (
        resultat
        .withColumn(
            "mois_id",
            expression_mois[F.col("mois")]
        )
        .withColumn(
            "import_id",
            F.lit(import_id).cast("integer")
        )
        .withColumn(
            "exercice_id",
            F.lit(exercice_id).cast("integer")
        )
        .withColumn(
            "mois_id",
            F.col("mois_id").cast("integer")
        )
        .withColumn(
            "categorie",
            F.trim(F.col("categorie"))
        )
        .withColumn(
            "sous_categorie",
            F.trim(F.col("sous_categorie"))
        )
        .withColumn(
            "site",
            F.trim(F.col("site"))
        )
        .withColumn(
            "unite",
            F.trim(F.col("unite"))
        )
        .withColumn(
            "montant",
            F.col("montant").cast("double")
        )
    )

    return resultat.select(
        "import_id",
        "exercice_id",
        "mois_id",
        "categorie",
        "sous_categorie",
        "site",
        "unite",
        "montant"
    )


# ============================================================
# VALIDATION
# ============================================================

def valider(df):

    total = df.count()

    if total == 0:
        raise ValueError(
            "Aucune charge à importer."
        )

    # Vérification des mois

    mois_invalides = df.filter(
        F.col("mois_id").isNull()
    ).count()

    if mois_invalides > 0:
        raise ValueError(
            f"{mois_invalides} ligne(s) avec mois_id invalide."
        )

    # Vérification des catégories

    condition_categorie_invalide = (
        F.col("categorie").isNull()
        | (F.trim(F.col("categorie")) == "")
    )

    categories_invalides = df.filter(
        condition_categorie_invalide
    ).count()

    if categories_invalides > 0:

        print("\n[ERREUR] Lignes sans catégorie :")

        df.filter(
            condition_categorie_invalide
        ).show(20, truncate=False)

        raise ValueError(
            f"{categories_invalides} ligne(s) sans catégorie."
        )

    # Vérification des natures

    sous_categories_invalides = df.filter(
        F.col("sous_categorie").isNull()
        | (F.trim(F.col("sous_categorie")) == "")
    ).count()

    if sous_categories_invalides > 0:
        print(
            f"[ATTENTION] {sous_categories_invalides} "
            "ligne(s) sans nature."
        )

    # Vérification des sites

    sites_invalides = df.filter(
        F.col("site").isNull()
        | (F.trim(F.col("site")) == "")
    ).count()

    if sites_invalides > 0:
        print(
            f"[ATTENTION] {sites_invalides} "
            "ligne(s) sans site."
        )

    # Vérification des unités

    unites_invalides = df.filter(
        F.col("unite").isNull()
        | (F.trim(F.col("unite")) == "")
    ).count()

    if unites_invalides > 0:
        print(
            f"[ATTENTION] {unites_invalides} "
            "ligne(s) sans unité."
        )

    # Vérification des montants

    montants_invalides = df.filter(
        F.col("montant").isNull()
        | F.isnan(F.col("montant"))
    ).count()

    if montants_invalides > 0:

        print("\n[ATTENTION] Montants invalides :")

        df.filter(
            F.col("montant").isNull()
            | F.isnan(F.col("montant"))
        ).show(20, truncate=False)

        raise ValueError(
            f"{montants_invalides} montant(s) invalides."
        )

    print(
        f"\n[OK] {total} ligne(s) "
        "de charges normalisées et validées."
    )


# ============================================================
# INSERTION POSTGRESQL
# ============================================================

def inserer(df):

    print("\nInsertion dans PostgreSQL...")

    (
        df.write
        .mode("append")
        .jdbc(
            url=JDBC_URL,
            table="charge",
            properties=JDBC_PROPERTIES
        )
    )

    print("[OK] Table charge alimentée.")


# ============================================================
# MAIN
# ============================================================

def main(fichier_csv, import_id, exercice_id):

    spark = creer_spark()

    try:
        print("\n" + "=" * 70)
        print("SXMXDX - IMPORT CHARGES")
        print("=" * 70)

        df = (
            spark.read
            .option("header", True)
            .option("inferSchema", True)
            .csv(fichier_csv)
        )

        print("\nColonnes détectées :")

        for colonne in df.columns:
            print(f" - {colonne}")

        print("\nDonnées sources :")
        df.show(10, truncate=False)

        resultat = normaliser(
            df,
            import_id,
            exercice_id
        )

        print("\nDonnées normalisées :")
        resultat.printSchema()
        resultat.show(50, truncate=False)

        # Validation avant insertion
        valider(resultat)

        # Insertion
        inserer(resultat)

        print("\n" + "=" * 70)
        print("IMPORT CHARGES TERMINE")
        print("=" * 70)

    finally:
        spark.stop()


# ============================================================
# EXECUTION
# ============================================================

if __name__ == "__main__":

    if len(sys.argv) != 4:
        print(
            "Utilisation : spark-submit "
            "normaliser_charges.py "
            "<charges.csv> <import_id> <exercice_id>"
        )
        sys.exit(1)

    main(
        sys.argv[1],
        int(sys.argv[2]),
        int(sys.argv[3])
    )
