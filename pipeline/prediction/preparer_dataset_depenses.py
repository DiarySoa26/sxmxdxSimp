from pathlib import Path
from decimal import Decimal
import csv
import math
import sys

import psycopg2
from psycopg2.extras import RealDictCursor


# ============================================================
# PROJET
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

OUTPUT_DIR = (
    PROJECT_ROOT
    / "output"
    / "prediction"
)

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# POSTGRESQL
# ============================================================

DB_CONFIG = {
    "host": "localhost",
    "port": 5434,
    "dbname": "sxmxdx2",
    "user": "sxmxdx",
    "password": "diary",
}


def connecter():

    return psycopg2.connect(
        **DB_CONFIG
    )


# ============================================================
# CONVERSION
# ============================================================

def nombre(valeur):

    if valeur is None:
        return 0.0

    if isinstance(valeur, Decimal):
        return float(valeur)

    return float(valeur)


# ============================================================
# IMPORTS HISTORIQUES
# ============================================================

def recuperer_imports(connexion):

    """
    Prend le dernier import PRET_GENERATION
    de chaque exercice.
    """

    with connexion.cursor(
        cursor_factory=RealDictCursor
    ) as curseur:

        curseur.execute(
            """
            SELECT DISTINCT ON (i.exercice_id)

                i.id AS import_id,
                i.exercice_id,
                e.annee

            FROM import_fichier i

            JOIN exercice e
                ON e.id = i.exercice_id

            WHERE i.statut = 'PRET_GENERATION'

            ORDER BY
                i.exercice_id,
                i.id DESC
            """
        )

        return curseur.fetchall()


# ============================================================
# MOIS
# ============================================================

def recuperer_mois(connexion):

    with connexion.cursor(
        cursor_factory=RealDictCursor
    ) as curseur:

        curseur.execute(
            """
            SELECT
                id,
                nom
            FROM mois
            ORDER BY id
            """
        )

        lignes = curseur.fetchall()

    if len(lignes) != 12:

        raise ValueError(
            "La table mois doit contenir 12 mois. "
            f"Trouvé : {len(lignes)}"
        )

    return lignes


# ============================================================
# PRODUCTION DU MOIS
# ============================================================

def recuperer_production(
    connexion,
    import_id,
    exercice_id,
    mois_id
):

    with connexion.cursor(
        cursor_factory=RealDictCursor
    ) as curseur:

        curseur.execute(
            """
            SELECT
                COALESCE(
                    SUM(production_commercialisable),
                    0
                ) AS production

            FROM production

            WHERE import_id = %s
              AND exercice_id = %s
              AND mois_id = %s
            """,
            (
                import_id,
                exercice_id,
                mois_id,
            )
        )

        ligne = curseur.fetchone()

    return nombre(
        ligne["production"]
    )


# ============================================================
# DEPENSES DU MOIS
# ============================================================

def recuperer_depenses(
    connexion,
    import_id,
    exercice_id,
    mois_id
):

    """
    IMPORTANT :
    on ne fait volontairement PAS ici un seul
    SUM(montant) pour toutes les charges.

    On conserve chaque catégorie / sous-catégorie.
    """

    with connexion.cursor(
        cursor_factory=RealDictCursor
    ) as curseur:

        curseur.execute(
            """
            SELECT
                categorie,
                sous_categorie,
                SUM(montant) AS montant

            FROM charge

            WHERE import_id = %s
              AND exercice_id = %s
              AND mois_id = %s

            GROUP BY
                categorie,
                sous_categorie

            ORDER BY
                categorie,
                sous_categorie
            """,
            (
                import_id,
                exercice_id,
                mois_id,
            )
        )

        return curseur.fetchall()


# ============================================================
# CONSTRUCTION DU DATASET
# ============================================================

def construire_dataset():

    connexion = connecter()

    try:

        imports = recuperer_imports(
            connexion
        )

        mois = recuperer_mois(
            connexion
        )

        if not imports:

            raise ValueError(
                "Aucun exercice historique exploitable."
            )

        print()
        print("=" * 80)
        print(
            "SXMXDX - DATASET D'ANALYSE DES DEPENSES"
        )
        print("=" * 80)

        print(
            f"Exercices trouvés : {len(imports)}"
        )

        lignes = []

        for import_ligne in imports:

            import_id = import_ligne[
                "import_id"
            ]

            exercice_id = import_ligne[
                "exercice_id"
            ]

            annee = int(
                import_ligne[
                    "annee"
                ]
            )

            print()
            print(
                f"[EXERCICE {annee}] "
                f"import_id={import_id}"
            )

            for numero_mois, mois_ligne in enumerate(
                mois,
                start=1
            ):

                mois_id = mois_ligne[
                    "id"
                ]

                mois_nom = mois_ligne[
                    "nom"
                ]

                # --------------------------------------------
                # PRODUCTION
                # --------------------------------------------

                production = recuperer_production(
                    connexion,
                    import_id,
                    exercice_id,
                    mois_id
                )

                # --------------------------------------------
                # DEPENSES
                # --------------------------------------------

                depenses = recuperer_depenses(
                    connexion,
                    import_id,
                    exercice_id,
                    mois_id
                )

                if not depenses:

                    print(
                        f"  [ATTENTION] "
                        f"{mois_nom}: aucune dépense"
                    )

                    continue

                # --------------------------------------------
                # SAISONNALITE
                # --------------------------------------------

                angle = (
                    2
                    * math.pi
                    * numero_mois
                    / 12
                )

                mois_sin = math.sin(
                    angle
                )

                mois_cos = math.cos(
                    angle
                )

                # --------------------------------------------
                # UNE LIGNE PAR DEPENSE
                # --------------------------------------------

                for depense in depenses:

                    montant = nombre(
                        depense[
                            "montant"
                        ]
                    )

                    if production > 0:

                        depense_par_tonne = (
                            montant /
                            production
                        )

                    else:

                        depense_par_tonne = 0.0

                    ligne = {
                        "annee":
                            annee,

                        "mois":
                            numero_mois,

                        "mois_nom":
                            mois_nom,

                        "categorie":
                            depense[
                                "categorie"
                            ],

                        "sous_categorie":
                            depense[
                                "sous_categorie"
                            ],

                        "production":
                            production,

                        "depense":
                            montant,

                        "depense_par_tonne":
                            depense_par_tonne,

                        "mois_sin":
                            mois_sin,

                        "mois_cos":
                            mois_cos,
                    }

                    lignes.append(
                        ligne
                    )

                print(
                    f"  {mois_nom:<12} "
                    f"Production={production:,.2f} "
                    f"Lignes dépenses={len(depenses)}"
                )

        return lignes

    finally:

        connexion.close()


# ============================================================
# VALIDATION
# ============================================================

def valider_dataset(lignes):

    if not lignes:

        raise ValueError(
            "Le dataset des dépenses est vide."
        )

    annees = sorted(
        {
            ligne["annee"]
            for ligne in lignes
        }
    )

    categories = {
        (
            ligne["categorie"],
            ligne["sous_categorie"]
        )
        for ligne in lignes
    }

    production_zero = sum(
        1
        for ligne in lignes
        if ligne["production"] <= 0
    )

    print()
    print("=" * 80)
    print(
        "CONTROLE DU DATASET DEPENSES"
    )
    print("=" * 80)

    print(
        f"Observations          : {len(lignes)}"
    )

    print(
        f"Exercices             : {len(annees)}"
    )

    print(
        "Années                : "
        + ", ".join(
            str(annee)
            for annee in annees
        )
    )

    print(
        f"Lignes de dépenses    : {len(categories)}"
    )

    print(
        f"Production nulle      : {production_zero}"
    )

    if production_zero > 0:

        print()
        print(
            "[ATTENTION] Certaines observations "
            "ont une production nulle."
        )

        print(
            "Elles devront être traitées avant "
            "l'entraînement du modèle de dérive."
        )

    print()
    print(
        "[OK] Dataset dépenses construit."
    )


# ============================================================
# EXPORT
# ============================================================

def exporter_dataset(lignes):

    fichier = (
        OUTPUT_DIR
        / "dataset_depenses.csv"
    )

    colonnes = [
        "annee",
        "mois",
        "mois_nom",
        "categorie",
        "sous_categorie",
        "production",
        "depense",
        "depense_par_tonne",
        "mois_sin",
        "mois_cos",
    ]

    with fichier.open(
        "w",
        newline="",
        encoding="utf-8"
    ) as sortie:

        writer = csv.DictWriter(
            sortie,
            fieldnames=colonnes
        )

        writer.writeheader()

        writer.writerows(
            lignes
        )

    return fichier


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    try:

        lignes = construire_dataset()

        valider_dataset(
            lignes
        )

        fichier = exporter_dataset(
            lignes
        )

        print()
        print("=" * 80)
        print(
            "[OK] DATASET DEPENSES GENERE"
        )
        print("=" * 80)

        print(
            f"Fichier : {fichier}"
        )

        print(
            f"Lignes  : {len(lignes)}"
        )

    except Exception as exc:

        print()
        print("=" * 80)
        print(
            "[ERREUR] DATASET DEPENSES"
        )
        print("=" * 80)

        print(
            str(exc)
        )

        sys.exit(1)