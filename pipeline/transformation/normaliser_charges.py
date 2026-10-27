
# import sys

# from pyspark.sql import SparkSession
# from pyspark.sql import functions as F


# # ============================================================
# # CONFIGURATION
# # ============================================================

# MOIS = [
#     "Janvier", "Février", "Mars", "Avril",
#     "Mai", "Juin", "Juillet", "Août",
#     "Septembre", "Octobre", "Novembre", "Décembre"
# ]

# MAPPING_MOIS = {
#     mois: index + 1
#     for index, mois in enumerate(MOIS)
# }

# JDBC_URL = "jdbc:postgresql://postgres:5432/sxmxdx3"

# JDBC_PROPERTIES = {
#     "user": "sxmxdx",
#     "password": "diary",
#     "driver": "org.postgresql.Driver"
# }


# # ============================================================
# # SESSION SPARK
# # ============================================================

# def creer_spark():
#     spark = (
#         SparkSession.builder
#         .appName("SXMXDX_Charges")
#         .master("local[*]")
#         .getOrCreate()
#     )

#     spark.sparkContext.setLogLevel("WARN")
#     return spark


# # ============================================================
# # DETECTION DES COLONNES
# # ============================================================

# def trouver_colonne(df, noms_possibles, obligatoire=True):
#     for nom in noms_possibles:
#         if nom in df.columns:
#             return nom

#     if obligatoire:
#         raise ValueError(
#             "Colonne introuvable. "
#             f"Noms recherchés : {noms_possibles}"
#         )

#     return None


# def detecter_mois(df):
#     mois_disponibles = [
#         mois for mois in MOIS
#         if mois in df.columns
#     ]

#     if not mois_disponibles:
#         raise ValueError(
#             "Aucune colonne mensuelle détectée."
#         )

#     print("\nMois détectés :")
#     for mois in mois_disponibles:
#         print(f" - {mois}")

#     return mois_disponibles


# # ============================================================
# # NETTOYAGE DES LIGNES VIDES
# # ============================================================

# def nettoyer_lignes_vides(
#     df,
#     colonnes_metier,
#     mois_disponibles
# ):
#     """
#     Supprime uniquement les lignes entièrement vides.

#     Une ligne avec un montant mais sans catégorie
#     reste présente pour être signalée à la validation.
#     """

#     def est_vide(colonne):
#         valeur = F.col(f"`{colonne}`")

#         return (
#             valeur.isNull()
#             | (F.trim(valeur.cast("string")) == "")
#         )

#     toutes_metier_vides = F.lit(True)

#     for colonne in colonnes_metier:
#         toutes_metier_vides = (
#             toutes_metier_vides & est_vide(colonne)
#         )

#     tous_montants_vides = F.lit(True)

#     for mois in mois_disponibles:
#         tous_montants_vides = (
#             tous_montants_vides & est_vide(mois)
#         )

#     ligne_totalement_vide = (
#         toutes_metier_vides & tous_montants_vides
#     )

#     nb_avant = df.count()

#     resultat = df.filter(~ligne_totalement_vide)

#     nb_apres = resultat.count()

#     print("\nNettoyage des lignes vides :")
#     print(f" - Lignes initiales : {nb_avant}")
#     print(f" - Lignes supprimées : {nb_avant - nb_apres}")
#     print(f" - Lignes conservées : {nb_apres}")

#     return resultat


# # ============================================================
# # NORMALISATION
# # ============================================================

# def normaliser(df, import_id, exercice_id):

#     mois_disponibles = detecter_mois(df)

#     colonne_categorie = trouver_colonne(
#         df, ["Catégorie", "Categorie"]
#     )

#     colonne_nature = trouver_colonne(
#         df,
#         ["Nature", "Sous-catégorie", "Sous-categorie"]
#     )

#     colonne_site = trouver_colonne(
#         df, ["Site"]
#     )

#     colonne_unite = trouver_colonne(
#         df, ["Unité", "Unite"]
#     )

#     print("\nColonnes métier utilisées :")
#     print(f" - Catégorie : {colonne_categorie}")
#     print(f" - Nature : {colonne_nature}")
#     print(f" - Site : {colonne_site}")
#     print(f" - Unité : {colonne_unite}")

#     # Nettoyage avant transformation mensuelle

#     df = nettoyer_lignes_vides(
#         df,
#         [
#             colonne_categorie,
#             colonne_nature,
#             colonne_site,
#             colonne_unite
#         ],
#         mois_disponibles
#     )

#     # Construction de la map mois / montant

#     elements = []

#     for mois in mois_disponibles:
#         elements.extend([
#             F.lit(mois),
#             F.col(f"`{mois}`")
#         ])

#     # Transformation des colonnes mensuelles en lignes

#     resultat = df.select(
#         F.col(f"`{colonne_categorie}`").alias(
#             "categorie"
#         ),
#         F.col(f"`{colonne_nature}`").alias(
#             "sous_categorie"
#         ),
#         F.col(f"`{colonne_site}`").alias(
#             "site"
#         ),
#         F.col(f"`{colonne_unite}`").alias(
#             "unite"
#         ),
#         F.explode(
#             F.create_map(*elements)
#         ).alias("mois", "montant")
#     )

#     # Correspondance des mois

#     expression_mois = F.create_map(
#         *[
#             element
#             for mois, numero in MAPPING_MOIS.items()
#             for element in (
#                 F.lit(mois),
#                 F.lit(numero)
#             )
#         ]
#     )

#     resultat = (
#         resultat
#         .withColumn(
#             "mois_id",
#             expression_mois[F.col("mois")]
#         )
#         .withColumn(
#             "import_id",
#             F.lit(import_id).cast("integer")
#         )
#         .withColumn(
#             "exercice_id",
#             F.lit(exercice_id).cast("integer")
#         )
#         .withColumn(
#             "mois_id",
#             F.col("mois_id").cast("integer")
#         )
#         .withColumn(
#             "categorie",
#             F.trim(F.col("categorie"))
#         )
#         .withColumn(
#             "sous_categorie",
#             F.trim(F.col("sous_categorie"))
#         )
#         .withColumn(
#             "site",
#             F.trim(F.col("site"))
#         )
#         .withColumn(
#             "unite",
#             F.trim(F.col("unite"))
#         )
#         .withColumn(
#             "montant",
#             F.col("montant").cast("double")
#         )
#     )

#     return resultat.select(
#         "import_id",
#         "exercice_id",
#         "mois_id",
#         "categorie",
#         "sous_categorie",
#         "site",
#         "unite",
#         "montant"
#     )


# # ============================================================
# # VALIDATION
# # ============================================================

# def valider(df):

#     total = df.count()

#     if total == 0:
#         raise ValueError(
#             "Aucune charge à importer."
#         )

#     # Vérification des mois

#     mois_invalides = df.filter(
#         F.col("mois_id").isNull()
#     ).count()

#     if mois_invalides > 0:
#         raise ValueError(
#             f"{mois_invalides} ligne(s) avec mois_id invalide."
#         )

#     # Vérification des catégories

#     condition_categorie_invalide = (
#         F.col("categorie").isNull()
#         | (F.trim(F.col("categorie")) == "")
#     )

#     categories_invalides = df.filter(
#         condition_categorie_invalide
#     ).count()

#     if categories_invalides > 0:

#         print("\n[ERREUR] Lignes sans catégorie :")

#         df.filter(
#             condition_categorie_invalide
#         ).show(20, truncate=False)

#         raise ValueError(
#             f"{categories_invalides} ligne(s) sans catégorie."
#         )

#     # Vérification des natures

#     sous_categories_invalides = df.filter(
#         F.col("sous_categorie").isNull()
#         | (F.trim(F.col("sous_categorie")) == "")
#     ).count()

#     if sous_categories_invalides > 0:
#         print(
#             f"[ATTENTION] {sous_categories_invalides} "
#             "ligne(s) sans nature."
#         )

#     # Vérification des sites

#     sites_invalides = df.filter(
#         F.col("site").isNull()
#         | (F.trim(F.col("site")) == "")
#     ).count()

#     if sites_invalides > 0:
#         print(
#             f"[ATTENTION] {sites_invalides} "
#             "ligne(s) sans site."
#         )

#     # Vérification des unités

#     unites_invalides = df.filter(
#         F.col("unite").isNull()
#         | (F.trim(F.col("unite")) == "")
#     ).count()

#     if unites_invalides > 0:
#         print(
#             f"[ATTENTION] {unites_invalides} "
#             "ligne(s) sans unité."
#         )

#     # Vérification des montants

#     montants_invalides = df.filter(
#         F.col("montant").isNull()
#         | F.isnan(F.col("montant"))
#     ).count()

#     if montants_invalides > 0:

#         print("\n[ATTENTION] Montants invalides :")

#         df.filter(
#             F.col("montant").isNull()
#             | F.isnan(F.col("montant"))
#         ).show(20, truncate=False)

#         raise ValueError(
#             f"{montants_invalides} montant(s) invalides."
#         )

#     print(
#         f"\n[OK] {total} ligne(s) "
#         "de charges normalisées et validées."
#     )


# # ============================================================
# # INSERTION POSTGRESQL
# # ============================================================

# def inserer(df):

#     print("\nInsertion dans PostgreSQL...")

#     (
#         df.write
#         .mode("append")
#         .jdbc(
#             url=JDBC_URL,
#             table="charge",
#             properties=JDBC_PROPERTIES
#         )
#     )

#     print("[OK] Table charge alimentée.")


# # ============================================================
# # MAIN
# # ============================================================

# def main(fichier_csv, import_id, exercice_id):

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

#         print("\nDonnées sources :")
#         df.show(10, truncate=False)

#         resultat = normaliser(
#             df,
#             import_id,
#             exercice_id
#         )

#         print("\nDonnées normalisées :")
#         resultat.printSchema()
#         resultat.show(50, truncate=False)

#         # Validation avant insertion
#         valider(resultat)

#         # Insertion
#         inserer(resultat)

#         print("\n" + "=" * 70)
#         print("IMPORT CHARGES TERMINE")
#         print("=" * 70)

#     finally:
#         spark.stop()


# # ============================================================
# # EXECUTION
# # ============================================================

# if __name__ == "__main__":

#     if len(sys.argv) != 4:
#         print(
#             "Utilisation : spark-submit "
#             "normaliser_charges.py "
#             "<charges.csv> <import_id> <exercice_id>"
#         )
#         sys.exit(1)

#     main(
#         sys.argv[1],
#         int(sys.argv[2]),
#         int(sys.argv[3])
#     )









import os
import sys
import unicodedata
from pyspark.sql import SparkSession, functions as F

MOIS = [
    "Janvier", "Février", "Mars", "Avril",
    "Mai", "Juin", "Juillet", "Août",
    "Septembre", "Octobre", "Novembre", "Décembre"
]


def nettoyer_nom(nom):
    nom = unicodedata.normalize("NFKD", str(nom).strip())
    return "".join(
        c for c in nom if not unicodedata.combining(c)
    ).lower().replace(" ", "").replace("_", "")


def colonne(df, *noms, obligatoire=True):
    index = {nettoyer_nom(c): c for c in df.columns}

    for nom in noms:
        if nettoyer_nom(nom) in index:
            return index[nettoyer_nom(nom)]

    if obligatoire:
        raise ValueError(
            f"Colonne obligatoire absente : {noms}. "
            f"Colonnes reçues : {df.columns}"
        )
    return None


def expr_texte(nom):
    if nom is None:
        return F.lit(None).cast("string")
    return F.trim(F.col(f"`{nom}`").cast("string"))


def texte_vide(nom):
    c = F.col(nom)
    return c.isNull() | (F.trim(c.cast("string")) == "")


def montant_numerique(nom):
    brut = F.trim(F.col(f"`{nom}`").cast("string"))

    # Espaces et séparateurs français
    brut = F.regexp_replace(brut, r"[\s\u00a0\u202f]", "")
    brut = F.regexp_replace(brut, ",", ".")

    return F.when(
        brut.isNull() | (brut == ""),
        F.lit(None).cast("double")
    ).otherwise(brut.cast("double"))


def normaliser(df, import_id, exercice_id):
    cat = colonne(df, "Catégorie", "Categorie")

    nature = colonne(
        df,
        "Nature",
        "Sous-catégorie",
        "Sous-categorie",
        "Libellé",
        "Libelle",
        obligatoire=False
    )

    site = colonne(df, "Site", obligatoire=False)
    unite = colonne(df, "Unité", "Unite", obligatoire=False)
    rc = colonne(df, "RC", "R.C.", "R.C", obligatoire=True)

    mois = [
        (i, colonne(df, nom, obligatoire=False))
        for i, nom in enumerate(MOIS, 1)
    ]
    mois = [(i, c) for i, c in mois if c is not None]

    if not mois:
        raise ValueError(
            "Aucune colonne mensuelle détectée."
        )

    print(
        f"[CHARGES] Catégorie={cat}, Nature={nature}, "
        f"Site={site}, Unité={unite}, RC={rc}"
    )

    source = df.select(
        expr_texte(cat).alias("categorie"),
        expr_texte(nature).alias("sous_categorie"),
        expr_texte(site).alias("site"),
        expr_texte(unite).alias("unite"),
        expr_texte(rc).alias("rc"),
        *[
            montant_numerique(c).alias(f"montant_{i}")
            for i, c in mois
        ]
    )

    struct_mois = [
        F.struct(
            F.lit(i).alias("mois_id"),
            F.col(f"montant_{i}").alias("montant")
        )
        for i, _ in mois
    ]

    resultat = (
        source
        .withColumn(
            "mensuel",
            F.explode(F.array(*struct_mois))
        )
        .select(
            F.lit(int(import_id)).alias("import_id"),
            F.lit(int(exercice_id)).alias("exercice_id"),
            F.col("mensuel.mois_id").alias("mois_id"),
            "categorie",
            "sous_categorie",
            "site",
            "unite",
            F.col("mensuel.montant").alias("montant"),
            "rc"
        )
    )

    # Supprimer seulement les lignes réellement vides.
    # Une valeur RC seule ne constitue pas une charge.
    ligne_vide = (
        texte_vide("categorie")
        & texte_vide("sous_categorie")
        & texte_vide("site")
        & texte_vide("unite")
        & (
            F.col("montant").isNull()
            | (F.col("montant") == 0)
        )
    )

    nb_vides = resultat.filter(ligne_vide).count()

    print(
        f"[CHARGES] {nb_vides} ligne(s) "
        "mensuelle(s) vides écartées."
    )

    return resultat.filter(~ligne_vide)


def valider(df):
    if df.limit(1).count() == 0:
        raise ValueError(
            "Aucune charge valide à importer."
        )

    sans_categorie = df.filter(
        texte_vide("categorie")
    )

    nb = sans_categorie.count()

    if nb:
        print(
            "[ERREUR] Charges sans catégorie :"
        )
        sans_categorie.show(30, truncate=False)

        raise ValueError(
            f"{nb} ligne(s) sans catégorie "
            "contenant des informations métier "
            "ou un montant. Corriger la feuille Charges."
        )

    montants_invalides = df.filter(
        F.col("montant").isNull()
        | F.isnan("montant")
    )

    nb = montants_invalides.count()

    if nb:
        print(
            "[ERREUR] Montants absents ou invalides :"
        )
        montants_invalides.show(
            30, truncate=False
        )

        raise ValueError(
            f"{nb} montant(s) absent(s) ou invalide(s)."
        )

    print(
        f"[OK] {df.count()} ligne(s) "
        "de charges validées."
    )


def inserer(df):
    url = os.getenv(
        "JDBC_URL",
        "jdbc:postgresql://postgres:5432/sxmxdx3"
    )

    proprietes = {
        "user": os.getenv("DB_USER", "sxmxdx"),
        "password": os.getenv("DB_PASSWORD", "diary"),
        "driver": "org.postgresql.Driver"
    }

    (
        df.select(
            "import_id",
            "exercice_id",
            "mois_id",
            "categorie",
            "sous_categorie",
            "site",
            "unite",
            "montant",
            "rc"
        )
        .write
        .mode("append")
        .jdbc(
            url=url,
            table="charge",
            properties=proprietes
        )
    )

    print(
        "[OK] Insertion des charges avec RC terminée."
    )


def main(fichier_csv, import_id, exercice_id):
    spark = (
        SparkSession.builder
        .appName("SXMXDX_Normaliser_Charges")
        .getOrCreate()
    )

    spark.sparkContext.setLogLevel("WARN")

    try:
        df = (
            spark.read
            .option("header", True)
            .option("inferSchema", False)
            .csv(fichier_csv)
        )

        print(
            "[CHARGES] Colonnes CSV :",
            df.columns
        )

        resultat = normaliser(
            df,
            import_id,
            exercice_id
        )

        valider(resultat)
        inserer(resultat)

    finally:
        spark.stop()


if __name__ == "__main__":
    if len(sys.argv) != 4:
        raise SystemExit(
            "Usage: normaliser_charges.py "
            "<charges.csv> <import_id> <exercice_id>"
        )

    main(
        sys.argv[1],
        int(sys.argv[2]),
        int(sys.argv[3])
    )
