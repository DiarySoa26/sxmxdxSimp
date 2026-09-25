# from pyspark.sql import SparkSession
# from pyspark.sql import functions as F
# import sys


# # ============================================================
# # CONFIGURATION
# # ============================================================

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
#     "Janvier": 1,
#     "Février": 2,
#     "Mars": 3,
#     "Avril": 4,
#     "Mai": 5,
#     "Juin": 6,
#     "Juillet": 7,
#     "Août": 8,
#     "Septembre": 9,
#     "Octobre": 10,
#     "Novembre": 11,
#     "Décembre": 12
# }


# # PostgreSQL vu depuis le conteneur Spark
# JDBC_URL = "jdbc:postgresql://postgres:5432/sxmxdx2"


# JDBC_PROPERTIES = {
#     "user": "sxmxdx",
#     "password": "diary",
#     "driver": "org.postgresql.Driver"
# }


# # ============================================================
# # CREATION SPARK
# # ============================================================

# def creer_spark():

#     spark = (
#         SparkSession.builder
#         .appName("SXMXDX_Exportations")
#         .master("local[*]")
#         .getOrCreate()
#     )

#     spark.sparkContext.setLogLevel("WARN")

#     return spark


# # ============================================================
# # AFFICHAGE COLONNES
# # ============================================================

# def afficher_colonnes(df):

#     print("\nColonnes détectées :")

#     for colonne in df.columns:
#         print(f" - {colonne}")


# # ============================================================
# # VERIFICATION DES MOIS
# # ============================================================

# def detecter_mois(df):

#     mois_disponibles = [
#         mois
#         for mois in MOIS
#         if mois in df.columns
#     ]

#     if not mois_disponibles:

#         raise ValueError(
#             "Aucune colonne mensuelle détectée "
#             "dans le fichier."
#         )

#     print("\nMois détectés :")

#     for mois in mois_disponibles:
#         print(f" - {mois}")

#     return mois_disponibles


# # ============================================================
# # ETAPE 1
# # PASSAGE HORIZONTAL -> VERTICAL
# # ============================================================

# def normaliser_mois(df):

#     mois_disponibles = detecter_mois(df)

#     # Colonnes qui ne sont pas des mois
#     colonnes_fixes = [
#         colonne
#         for colonne in df.columns
#         if colonne not in MOIS
#         and colonne.lower() not in [
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
#             F.col(f"`{colonne}`")
#             for colonne in colonnes_fixes
#         ],

#         F.explode(
#             F.create_map(*elements)
#         ).alias(
#             "mois",
#             "valeur"
#         )
#     )

#     return resultat


# # ============================================================
# # ETAPE 2
# # PIVOT DES INDICATEURS
# # ============================================================

# def pivoter_indicateurs(df):

#     colonnes_requises = [
#         "Pays",
#         "Entité représentatrice",
#         "Produit",
#         "Devise",
#         "Indicateur",
#         "mois"
#     ]

#     manquantes = [
#         colonne
#         for colonne in colonnes_requises
#         if colonne not in df.columns
#     ]

#     if manquantes:

#         raise ValueError(
#             "Colonnes manquantes pour le pivot : "
#             + ", ".join(manquantes)
#         )

#     resultat = (
#         df
#         .groupBy(
#             "Pays",
#             "Entité représentatrice",
#             "Produit",
#             "Devise",
#             "mois"
#         )
#         .pivot("Indicateur")
#         .agg(
#             F.first("valeur")
#         )
#     )

#     return resultat


# # ============================================================
# # ETAPE 3
# # CONVERSION MOIS -> mois_id
# # ============================================================

# def ajouter_mois_id(df):

#     mapping_expression = F.create_map(

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

#     resultat = df.withColumn(
#         "mois_id",
#         mapping_expression[F.col("mois")]
#     )

#     return resultat


# # ============================================================
# # ETAPE 4
# # RENOMMAGE DES COLONNES
# # ============================================================

# def renommer_colonnes(df):

#     correspondances = {

#         "Pays":
#             "pays",

#         "Entité représentatrice":
#             "representant",

#         "Produit":
#             "produit",

#         "Devise":
#             "devise",

#         "Quantité exportée":
#             "quantite",

#         "CA devise":
#             "ca_devise",

#         "CA MGA":
#             "ca_mga",

#         "Prix unitaire devise":
#             "prix_unitaire_devise",

#         "Taux de change":
#             "taux_change"
#     }

#     resultat = df

#     for ancien, nouveau in correspondances.items():

#         if ancien in resultat.columns:

#             resultat = resultat.withColumnRenamed(
#                 ancien,
#                 nouveau
#             )

#     return resultat


# # ============================================================
# # ETAPE 5
# # COMPLETER LES COLONNES MANQUANTES
# # ============================================================

# def completer_colonnes(df):

#     resultat = df

#     # Certaines versions Excel peuvent ne pas avoir
#     # directement ces indicateurs.

#     if "quantite" not in resultat.columns:

#         resultat = resultat.withColumn(
#             "quantite",
#             F.lit(0.0)
#         )

#     if "prix_unitaire_devise" not in resultat.columns:

#         resultat = resultat.withColumn(
#             "prix_unitaire_devise",
#             F.lit(0.0)
#         )

#     if "ca_devise" not in resultat.columns:

#         resultat = resultat.withColumn(
#             "ca_devise",
#             F.lit(0.0)
#         )

#     if "taux_change" not in resultat.columns:

#         resultat = resultat.withColumn(
#             "taux_change",
#             F.lit(0.0)
#         )

#     if "ca_mga" not in resultat.columns:

#         resultat = resultat.withColumn(
#             "ca_mga",
#             F.lit(0.0)
#         )

#     return resultat


# # ============================================================
# # ETAPE 6
# # AJOUT import_id ET exercice_id
# # ============================================================

# def ajouter_identifiants(
#     df,
#     import_id,
#     exercice_id
# ):

#     resultat = (
#         df

#         .withColumn(
#             "import_id",
#             F.lit(import_id)
#         )

#         .withColumn(
#             "exercice_id",
#             F.lit(exercice_id)
#         )
#     )

#     return resultat


# # ============================================================
# # ETAPE 7
# # CONVERSION DES TYPES
# # ============================================================

# def convertir_types(df):

#     resultat = (
#         df

#         .withColumn(
#             "import_id",
#             F.col("import_id").cast("integer")
#         )

#         .withColumn(
#             "exercice_id",
#             F.col("exercice_id").cast("integer")
#         )

#         .withColumn(
#             "mois_id",
#             F.col("mois_id").cast("integer")
#         )

#         .withColumn(
#             "quantite",
#             F.col("quantite").cast("double")
#         )

#         .withColumn(
#             "prix_unitaire_devise",
#             F.col("prix_unitaire_devise").cast("double")
#         )

#         .withColumn(
#             "ca_devise",
#             F.col("ca_devise").cast("double")
#         )

#         .withColumn(
#             "taux_change",
#             F.col("taux_change").cast("double")
#         )

#         .withColumn(
#             "ca_mga",
#             F.col("ca_mga").cast("double")
#         )
#     )

#     return resultat


# # ============================================================
# # ETAPE 8
# # PREPARATION POUR POSTGRESQL
# # ============================================================

# def preparer_postgresql(df):

#     colonnes_finales = [

#         "import_id",
#         "exercice_id",
#         "mois_id",

#         "pays",
#         "representant",
#         "produit",
#         "devise",

#         "quantite",
#         "prix_unitaire_devise",
#         "ca_devise",
#         "taux_change",
#         "ca_mga"
#     ]

#     manquantes = [
#         colonne
#         for colonne in colonnes_finales
#         if colonne not in df.columns
#     ]

#     if manquantes:

#         raise ValueError(
#             "Colonnes manquantes avant insertion : "
#             + ", ".join(manquantes)
#         )

#     return df.select(
#         *colonnes_finales
#     )


# # ============================================================
# # ETAPE 9
# # VALIDATION
# # ============================================================

# def valider_donnees(df):

#     print("\nValidation des données...")

#     erreurs_mois = (
#         df
#         .filter(
#             F.col("mois_id").isNull()
#         )
#         .count()
#     )

#     if erreurs_mois > 0:

#         raise ValueError(
#             f"{erreurs_mois} ligne(s) "
#             "avec un mois invalide."
#         )

#     total = df.count()

#     if total == 0:

#         raise ValueError(
#             "Aucune donnée d'exportation "
#             "à insérer."
#         )

#     print(
#         f"[OK] {total} ligne(s) "
#         "prêtes pour PostgreSQL."
#     )


# # ============================================================
# # ETAPE 10
# # INSERTION POSTGRESQL
# # ============================================================

# def inserer_postgresql(df):

#     print("\nInsertion PostgreSQL...")

#     (
#         df.write
#         .mode("append")
#         .jdbc(
#             url=JDBC_URL,
#             table="exportation",
#             properties=JDBC_PROPERTIES
#         )
#     )

#     print(
#         "[OK] Données insérées "
#         "dans la table exportation."
#     )


# # ============================================================
# # PROGRAMME PRINCIPAL
# # ============================================================

# def main(
#     fichier_csv,
#     import_id,
#     exercice_id
# ):

#     spark = creer_spark()

#     try:

#         print("\n" + "=" * 75)
#         print("SXMXDX - IMPORT DES EXPORTATIONS")
#         print("=" * 75)

#         print(
#             f"Fichier      : {fichier_csv}"
#         )

#         print(
#             f"Import ID    : {import_id}"
#         )

#         print(
#             f"Exercice ID  : {exercice_id}"
#         )

#         # ----------------------------------------------------
#         # Lecture CSV
#         # ----------------------------------------------------

#         df = (
#             spark.read
#             .option("header", True)
#             .option("inferSchema", True)
#             .csv(fichier_csv)
#         )

#         afficher_colonnes(df)

#         print("\nAPERÇU DONNEES BRUTES")

#         df.show(
#             10,
#             truncate=False
#         )

#         # ----------------------------------------------------
#         # Horizontal -> vertical
#         # ----------------------------------------------------

#         df = normaliser_mois(df)

#         print("\nAPRES NORMALISATION DES MOIS")

#         df.show(
#             10,
#             truncate=False
#         )

#         # ----------------------------------------------------
#         # Indicateurs -> colonnes
#         # ----------------------------------------------------

#         df = pivoter_indicateurs(df)

#         print("\nAPRES PIVOT DES INDICATEURS")

#         df.show(
#             20,
#             truncate=False
#         )

#         # ----------------------------------------------------
#         # mois -> mois_id
#         # ----------------------------------------------------

#         df = ajouter_mois_id(df)

#         # ----------------------------------------------------
#         # Renommage
#         # ----------------------------------------------------

#         df = renommer_colonnes(df)

#         # ----------------------------------------------------
#         # Colonnes facultatives
#         # ----------------------------------------------------

#         df = completer_colonnes(df)

#         # ----------------------------------------------------
#         # IDs
#         # ----------------------------------------------------

#         df = ajouter_identifiants(
#             df,
#             import_id,
#             exercice_id
#         )

#         # ----------------------------------------------------
#         # Types
#         # ----------------------------------------------------

#         df = convertir_types(df)

#         # ----------------------------------------------------
#         # Structure PostgreSQL
#         # ----------------------------------------------------

#         df = preparer_postgresql(df)

#         print("\nDONNEES FINALES")

#         df.printSchema()

#         df.show(
#             30,
#             truncate=False
#         )

#         # ----------------------------------------------------
#         # Validation
#         # ----------------------------------------------------

#         valider_donnees(df)

#         # ----------------------------------------------------
#         # PostgreSQL
#         # ----------------------------------------------------

#         inserer_postgresql(df)

#         print("\n" + "=" * 75)
#         print("IMPORT EXPORTATIONS TERMINE")
#         print("=" * 75)

#     except Exception as e:

#         print("\n" + "=" * 75)
#         print("ERREUR IMPORT EXPORTATIONS")
#         print("=" * 75)

#         print(e)

#         raise

#     finally:

#         spark.stop()


# # ============================================================
# # EXECUTION
# # ============================================================

# if __name__ == "__main__":

#     if len(sys.argv) != 4:

#         print(
#             "\nUtilisation :\n\n"
#             "spark-submit "
#             "normaliser_exportations.py "
#             "<exportations.csv> "
#             "<import_id> "
#             "<exercice_id>\n"
#         )

#         sys.exit(1)

#     fichier_csv = sys.argv[1]

#     import_id = int(
#         sys.argv[2]
#     )

#     exercice_id = int(
#         sys.argv[3]
#     )

#     main(
#         fichier_csv,
#         import_id,
#         exercice_id
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
    "Janvier": 1,
    "Février": 2,
    "Mars": 3,
    "Avril": 4,
    "Mai": 5,
    "Juin": 6,
    "Juillet": 7,
    "Août": 8,
    "Septembre": 9,
    "Octobre": 10,
    "Novembre": 11,
    "Décembre": 12
}


JDBC_URL = "jdbc:postgresql://postgres:5432/sxmxdx2"


JDBC_PROPERTIES = {
    "user": "sxmxdx",
    "password": "diary",
    "driver": "org.postgresql.Driver"
}


# ============================================================
# CREATION SPARK
# ============================================================

def creer_spark():

    spark = (
        SparkSession.builder
        .appName("SXMXDX_Exportations")
        .master("local[*]")
        .getOrCreate()
    )

    spark.sparkContext.setLogLevel("WARN")

    return spark


# ============================================================
# LECTURE DU CSV SOMIDA
#
# Le fichier contient des lignes de présentation avant
# le véritable tableau :
#
# SOMIDA — TABLEAU DE BORD...
# Pilotage DAF...
# ...
# Pays,Entité représentatrice,...,Janvier,...
#
# Cette fonction recherche automatiquement la vraie ligne
# d'en-tête.
# ============================================================

def lire_csv_exportations(
    spark,
    fichier_csv
):

    print("\nRecherche de l'en-tête du tableau...")

    # --------------------------------------------------------
    # Lecture brute du fichier
    # --------------------------------------------------------

    lignes = (
        spark.sparkContext
        .textFile(fichier_csv)
        .collect()
    )

    if not lignes:

        raise ValueError(
            "Le fichier CSV est vide."
        )

    # --------------------------------------------------------
    # Recherche de la vraie ligne d'en-tête
    # --------------------------------------------------------

    index_entete = None

    for index, ligne in enumerate(lignes):

        ligne_nettoyee = (
            ligne
            .replace("\ufeff", "")
            .strip()
        )

        # On vérifie plusieurs colonnes caractéristiques
        # afin de ne pas confondre avec une ligne de titre.

        if (
            "Pays" in ligne_nettoyee
            and "Entité représentatrice" in ligne_nettoyee
            and "Produit" in ligne_nettoyee
            and "Indicateur" in ligne_nettoyee
            and "Janvier" in ligne_nettoyee
            and "Décembre" in ligne_nettoyee
        ):

            index_entete = index

            print(
                f"[OK] En-tête trouvé "
                f"à la ligne {index + 1}"
            )

            print(
                f"     {ligne_nettoyee}"
            )

            break

    # --------------------------------------------------------
    # Si aucun en-tête n'est trouvé
    # --------------------------------------------------------

    if index_entete is None:

        print("\nPremières lignes du fichier :")

        for index, ligne in enumerate(
            lignes[:20],
            start=1
        ):

            print(
                f"{index:02d} : {ligne}"
            )

        raise ValueError(
            "Impossible de trouver l'en-tête "
            "du tableau d'exportations."
        )

    # --------------------------------------------------------
    # Ne conserver que le tableau à partir de l'en-tête
    # --------------------------------------------------------

    lignes_tableau = lignes[
        index_entete:
    ]

    if len(lignes_tableau) <= 1:

        raise ValueError(
            "L'en-tête a été trouvé, mais aucune "
            "ligne de données n'est présente."
        )

    # --------------------------------------------------------
    # Recréer un RDD contenant uniquement le tableau
    # --------------------------------------------------------

    rdd_tableau = (
        spark.sparkContext
        .parallelize(
            lignes_tableau
        )
    )

    # --------------------------------------------------------
    # Spark peut maintenant considérer la première ligne
    # du RDD comme le véritable header CSV.
    # --------------------------------------------------------

    df = (
        spark.read
        .option("header", "true")
        .option("inferSchema", "true")
        .option("sep", ",")
        .option("quote", '"')
        .option("escape", '"')
        .csv(rdd_tableau)
    )

    return df


# ============================================================
# NETTOYAGE DES NOMS DE COLONNES
# ============================================================

def nettoyer_colonnes(df):

    resultat = df

    for colonne in df.columns:

        nouveau_nom = (
            colonne
            .replace("\ufeff", "")
            .replace("\xa0", " ")
            .strip()
        )

        nouveau_nom = " ".join(
            nouveau_nom.split()
        )

        if nouveau_nom != colonne:

            resultat = (
                resultat
                .withColumnRenamed(
                    colonne,
                    nouveau_nom
                )
            )

    return resultat


# ============================================================
# AFFICHAGE COLONNES
# ============================================================

def afficher_colonnes(df):

    print("\nColonnes détectées :")

    for colonne in df.columns:

        print(
            f" - {colonne}"
        )


# ============================================================
# VERIFICATION DES MOIS
# ============================================================

def detecter_mois(df):

    print(
        "\nDétection des colonnes mensuelles..."
    )

    mois_disponibles = [
        mois
        for mois in MOIS
        if mois in df.columns
    ]

    if not mois_disponibles:

        print(
            "\nColonnes réellement disponibles :"
        )

        for colonne in df.columns:

            print(
                f" - {repr(colonne)}"
            )

        raise ValueError(
            "Aucune colonne mensuelle détectée "
            "dans le fichier."
        )

    print("\nMois détectés :")

    for mois in mois_disponibles:

        print(
            f" - {mois}"
        )

    # --------------------------------------------------------
    # Vérification des 12 mois
    # --------------------------------------------------------

    mois_manquants = [
        mois
        for mois in MOIS
        if mois not in mois_disponibles
    ]

    if mois_manquants:

        print(
            "\nATTENTION : mois manquants :"
        )

        for mois in mois_manquants:

            print(
                f" - {mois}"
            )

    else:

        print(
            "\n[OK] Les 12 mois sont présents."
        )

    return mois_disponibles


# ============================================================
# ETAPE 1
# PASSAGE HORIZONTAL -> VERTICAL
#
# Janvier | Février | Mars
# 26.98   | 20.36   | 16.55
#
# devient :
#
# mois       valeur
# Janvier    26.98
# Février    20.36
# Mars       16.55
# ============================================================

def normaliser_mois(df):

    mois_disponibles = (
        detecter_mois(df)
    )

    # --------------------------------------------------------
    # Colonnes non mensuelles à conserver
    # --------------------------------------------------------

    colonnes_fixes = [
        colonne
        for colonne in df.columns
        if colonne not in MOIS
        and colonne.lower() not in [
            "total",
            "total annuel"
        ]
    ]

    print(
        "\nColonnes fixes conservées :"
    )

    for colonne in colonnes_fixes:

        print(
            f" - {colonne}"
        )

    # --------------------------------------------------------
    # Création de :
    #
    # Janvier -> valeur
    # Février -> valeur
    # ...
    # --------------------------------------------------------

    elements = []

    for mois in mois_disponibles:

        elements.extend(
            [
                F.lit(mois),
                F.col(f"`{mois}`")
            ]
        )

    resultat = (
        df
        .select(
            *[
                F.col(f"`{colonne}`")
                for colonne
                in colonnes_fixes
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
    )

    return resultat


# ============================================================
# ETAPE 2
# PIVOT DES INDICATEURS
# ============================================================

def pivoter_indicateurs(df):

    colonnes_requises = [
        "Pays",
        "Entité représentatrice",
        "Produit",
        "Devise",
        "Indicateur",
        "mois",
        "valeur"
    ]

    manquantes = [
        colonne
        for colonne in colonnes_requises
        if colonne not in df.columns
    ]

    if manquantes:

        raise ValueError(
            "Colonnes manquantes pour le pivot : "
            + ", ".join(manquantes)
        )

    print(
        "\nIndicateurs détectés :"
    )

    indicateurs = (
        df
        .select("Indicateur")
        .where(
            F.col("Indicateur").isNotNull()
        )
        .distinct()
        .collect()
    )

    for ligne in indicateurs:

        print(
            f" - {ligne['Indicateur']}"
        )

    resultat = (
        df
        .groupBy(
            "Pays",
            "Entité représentatrice",
            "Produit",
            "Devise",
            "mois"
        )
        .pivot(
            "Indicateur"
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
# ETAPE 3
# CONVERSION mois -> mois_id
# ============================================================

def ajouter_mois_id(df):

    if "mois" not in df.columns:

        raise ValueError(
            "La colonne 'mois' est absente. "
            "Impossible de créer mois_id."
        )

    elements = []

    for mois, numero in MAPPING_MOIS.items():

        elements.extend(
            [
                F.lit(mois),
                F.lit(numero)
            ]
        )

    mapping_expression = (
        F.create_map(
            *elements
        )
    )

    resultat = (
        df
        .withColumn(
            "mois_id",
            mapping_expression[
                F.col("mois")
            ]
        )
    )

    return resultat


# ============================================================
# ETAPE 4
# RENOMMAGE DES COLONNES
# ============================================================

def renommer_colonnes(df):

    correspondances = {

        "Pays":
            "pays",

        "Entité représentatrice":
            "representant",

        "Produit":
            "produit",

        "Devise":
            "devise",

        "Quantité exportée":
            "quantite",

        # Le fichier SOMIDA montré contient :
        # "Chiffre d'affaires devise"
        "Chiffre d'affaires devise":
            "ca_devise",

        # On garde également cet alias si un autre
        # exercice utilise "CA devise".
        "CA devise":
            "ca_devise",

        "CA MGA":
            "ca_mga",

        "Chiffre d'affaires MGA":
            "ca_mga",

        "Prix unitaire devise":
            "prix_unitaire_devise",

        "Taux de change":
            "taux_change"
    }

    resultat = df

    for ancien, nouveau in correspondances.items():

        if ancien in resultat.columns:

            # Eviter de créer deux colonnes portant
            # exactement le même nom.
            if nouveau not in resultat.columns:

                resultat = (
                    resultat
                    .withColumnRenamed(
                        ancien,
                        nouveau
                    )
                )

    return resultat


# ============================================================
# ETAPE 5
# COMPLETER LES COLONNES MANQUANTES
# ============================================================

def completer_colonnes(df):

    resultat = df

    colonnes_numeriques = [
        "quantite",
        "prix_unitaire_devise",
        "ca_devise",
        "taux_change",
        "ca_mga"
    ]

    for colonne in colonnes_numeriques:

        if colonne not in resultat.columns:

            print(
                f"[INFO] '{colonne}' absent : "
                "valeur NULL utilisée."
            )

            resultat = (
                resultat
                .withColumn(
                    colonne,
                    F.lit(None).cast(
                        "double"
                    )
                )
            )

    return resultat


# ============================================================
# ETAPE 6
# AJOUT import_id ET exercice_id
# ============================================================

def ajouter_identifiants(
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

    return resultat


# ============================================================
# ETAPE 7
# CONVERSION DES TYPES
# ============================================================

def convertir_types(df):

    resultat = (
        df
        .withColumn(
            "import_id",
            F.col(
                "import_id"
            ).cast(
                "integer"
            )
        )
        .withColumn(
            "exercice_id",
            F.col(
                "exercice_id"
            ).cast(
                "integer"
            )
        )
        .withColumn(
            "mois_id",
            F.col(
                "mois_id"
            ).cast(
                "integer"
            )
        )
        .withColumn(
            "quantite",
            F.col(
                "quantite"
            ).cast(
                "double"
            )
        )
        .withColumn(
            "prix_unitaire_devise",
            F.col(
                "prix_unitaire_devise"
            ).cast(
                "double"
            )
        )
        .withColumn(
            "ca_devise",
            F.col(
                "ca_devise"
            ).cast(
                "double"
            )
        )
        .withColumn(
            "taux_change",
            F.col(
                "taux_change"
            ).cast(
                "double"
            )
        )
        .withColumn(
            "ca_mga",
            F.col(
                "ca_mga"
            ).cast(
                "double"
            )
        )
    )

    return resultat


# ============================================================
# ETAPE 8
# PREPARATION POUR POSTGRESQL
# ============================================================

def preparer_postgresql(df):

    colonnes_finales = [
        "import_id",
        "exercice_id",
        "mois_id",

        "pays",
        "representant",
        "produit",
        "devise",

        "quantite",
        "prix_unitaire_devise",
        "ca_devise",
        "taux_change",
        "ca_mga"
    ]

    manquantes = [
        colonne
        for colonne in colonnes_finales
        if colonne not in df.columns
    ]

    if manquantes:

        print(
            "\nColonnes disponibles :"
        )

        for colonne in df.columns:

            print(
                f" - {colonne}"
            )

        raise ValueError(
            "Colonnes manquantes avant insertion : "
            + ", ".join(manquantes)
        )

    return df.select(
        *colonnes_finales
    )


# ============================================================
# ETAPE 9
# VALIDATION
# ============================================================

def valider_donnees(df):

    print(
        "\nValidation des données..."
    )

    total = df.count()

    if total == 0:

        raise ValueError(
            "Aucune donnée d'exportation "
            "à insérer."
        )

    # --------------------------------------------------------
    # mois_id NULL
    # --------------------------------------------------------

    erreurs_mois = (
        df
        .filter(
            F.col(
                "mois_id"
            ).isNull()
        )
        .count()
    )

    if erreurs_mois > 0:

        raise ValueError(
            f"{erreurs_mois} ligne(s) "
            "avec un mois invalide."
        )

    # --------------------------------------------------------
    # mois_id 1 -> 12
    # --------------------------------------------------------

    erreurs_intervalle = (
        df
        .filter(
            (F.col("mois_id") < 1)
            |
            (F.col("mois_id") > 12)
        )
        .count()
    )

    if erreurs_intervalle > 0:

        raise ValueError(
            f"{erreurs_intervalle} ligne(s) "
            "avec mois_id hors intervalle 1..12."
        )

    print(
        f"[OK] {total} ligne(s) "
        "prêtes pour PostgreSQL."
    )


# ============================================================
# ETAPE 10
# INSERTION POSTGRESQL
# ============================================================

def inserer_postgresql(df):

    print(
        "\nInsertion PostgreSQL..."
    )

    (
        df.write
        .mode(
            "append"
        )
        .jdbc(
            url=JDBC_URL,

            # Si ta table est dans le schéma sxmxdx
            table="exportation",

            properties=JDBC_PROPERTIES
        )
    )

    print(
        "[OK] Données insérées dans "
        "sxmxdx2.exportation."
    )


# ============================================================
# PROGRAMME PRINCIPAL
# ============================================================

def main(
    fichier_csv,
    import_id,
    exercice_id
):

    spark = creer_spark()

    try:

        print(
            "\n"
            + "=" * 75
        )

        print(
            "SXMXDX - IMPORT DES EXPORTATIONS"
        )

        print(
            "=" * 75
        )

        print(
            f"Fichier      : {fichier_csv}"
        )

        print(
            f"Import ID    : {import_id}"
        )

        print(
            f"Exercice ID  : {exercice_id}"
        )

        # ====================================================
        # LECTURE INTELLIGENTE DU CSV SOMIDA
        # ====================================================

        df = lire_csv_exportations(
            spark,
            fichier_csv
        )

        # ====================================================
        # NETTOYAGE DES NOMS DE COLONNES
        # ====================================================

        df = nettoyer_colonnes(
            df
        )

        # ====================================================
        # AFFICHAGE
        # ====================================================

        afficher_colonnes(
            df
        )

        print(
            "\nAPERÇU DONNEES BRUTES"
        )

        df.show(
            10,
            truncate=False
        )

        # ====================================================
        # ETAPE 1
        # HORIZONTAL -> VERTICAL
        # ====================================================

        df = normaliser_mois(
            df
        )

        print(
            "\nAPRES NORMALISATION DES MOIS"
        )

        df.show(
            20,
            truncate=False
        )

        # ====================================================
        # ETAPE 2
        # PIVOT DES INDICATEURS
        # ====================================================

        df = pivoter_indicateurs(
            df
        )

        print(
            "\nAPRES PIVOT DES INDICATEURS"
        )

        df.show(
            20,
            truncate=False
        )

        # ====================================================
        # ETAPE 3
        # mois -> mois_id
        # ====================================================

        df = ajouter_mois_id(
            df
        )

        # ====================================================
        # ETAPE 4
        # RENOMMAGE
        # ====================================================

        df = renommer_colonnes(
            df
        )

        # ====================================================
        # ETAPE 5
        # COLONNES FACULTATIVES
        # ====================================================

        df = completer_colonnes(
            df
        )

        # ====================================================
        # ETAPE 6
        # IDENTIFIANTS
        # ====================================================

        df = ajouter_identifiants(
            df,
            import_id,
            exercice_id
        )

        # ====================================================
        # ETAPE 7
        # TYPES
        # ====================================================

        df = convertir_types(
            df
        )

        # ====================================================
        # ETAPE 8
        # STRUCTURE POSTGRESQL
        # ====================================================

        df = preparer_postgresql(
            df
        )

        print(
            "\nDONNEES FINALES"
        )

        df.printSchema()

        df.show(
            50,
            truncate=False
        )

        # ====================================================
        # ETAPE 9
        # VALIDATION
        # ====================================================

        valider_donnees(
            df
        )

        # ====================================================
        # ETAPE 10
        # INSERTION POSTGRESQL
        # ====================================================

        inserer_postgresql(
            df
        )

        print(
            "\n"
            + "=" * 75
        )

        print(
            "IMPORT EXPORTATIONS TERMINE"
        )

        print(
            "=" * 75
        )

    except Exception as e:

        print(
            "\n"
            + "=" * 75
        )

        print(
            "ERREUR IMPORT EXPORTATIONS"
        )

        print(
            "=" * 75
        )

        print(
            f"{type(e).__name__}: {e}"
        )

        raise

    finally:

        spark.stop()


# ============================================================
# EXECUTION
# ============================================================

if __name__ == "__main__":

    if len(sys.argv) != 4:

        print(
            "\nUtilisation :\n\n"
            "spark-submit "
            "normaliser_exportations.py "
            "<exportations.csv> "
            "<import_id> "
            "<exercice_id>\n"
        )

        sys.exit(1)

    fichier_csv = sys.argv[1]

    import_id = int(
        sys.argv[2]
    )

    exercice_id = int(
        sys.argv[3]
    )

    main(
        fichier_csv,
        import_id,
        exercice_id
    )
