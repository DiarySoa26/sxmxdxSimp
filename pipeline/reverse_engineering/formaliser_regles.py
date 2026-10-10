from pathlib import Path
import json


# ============================================================
# CONFIGURATION
# ============================================================

REGLES_FILE = Path(
    "output/reverse_engineering/regles_metier.json"
)

SEMANTIQUE_FILE = Path(
    "output/reverse_engineering/semantique.json"
)

OUTPUT_FILE = Path(
    "output/reverse_engineering/regles_executables.json"
)


# ============================================================
# LECTURE JSON
# ============================================================

def lire_json(path):

    if not path.exists():

        raise FileNotFoundError(
            f"Fichier introuvable : {path}"
        )

    with path.open(
        "r",
        encoding="utf-8"
    ) as fichier:

        return json.load(fichier)


# ============================================================
# INDEX SEMANTIQUE
# ============================================================

def construire_index_semantique(
    document
):

    index = {}

    for regle in document.get(
        "regles",
        []
    ):

        identifiant = regle.get(
            "regle_technique"
        )

        if identifiant:
            index[identifiant] = regle

    return index


# ============================================================
# FORMALISATION
# ============================================================

def formaliser():

    document_regles = lire_json(
        REGLES_FILE
    )

    document_semantique = lire_json(
        SEMANTIQUE_FILE
    )

    index_semantique = (
        construire_index_semantique(
            document_semantique
        )
    )

    executables = []
    a_valider = []

    compteur = 0

    for regle in document_regles.get(
        "regles",
        []
    ):

        id_technique = regle["id"]

        semantique = (
            index_semantique.get(
                id_technique
            )
        )

        if not semantique:

            a_valider.append({
                "regle_technique":
                    id_technique,

                "raison":
                    "SEMANTIQUE_ABSENTE"
            })

            continue

        champ = semantique.get(
            "identifiant_semantique"
        )

        if not champ:

            a_valider.append({
                "regle_technique":
                    id_technique,

                "feuille":
                    regle.get("feuille"),

                "cellule":
                    regle.get(
                        "cellule_cible_reference"
                    ),

                "raison":
                    "LIBELLE_METIER_NON_IDENTIFIE"
            })

            continue

        compteur += 1

        nouvelle_regle = {

            "id":
                f"RG_METIER_{compteur:03d}",

            "regle_technique_source":
                id_technique,

            "type":
                "REGLE_METIER",

            "origine":
                "REVERSE_ENGINEERING_EXCEL",

            "domaine":
                regle.get("domaine"),

            "nom":
                semantique.get(
                    "libelle_excel"
                ),

            "cible":
                champ,

            "operation":
                regle.get("operation"),

            "periodicite_technique":
                regle.get(
                    "periodicite"
                ),

            "periodicite":
                semantique.get(
                    "periodicite",
                    regle.get("periodicite")
                ),

            "formule_excel_reference":
                regle.get(
                    "formule_excel_reference"
                ),

            "dependances":
                regle.get(
                    "dependances_reference",
                    []
                ),

            "cellules_excel":
                regle.get(
                    "cellules_excel",
                    []
                ),

            "nombre_occurrences":
                regle.get(
                    "nombre_occurrences",
                    1
                )
        }

        executables.append(
            nouvelle_regle
        )

    return (
        document_regles,
        executables,
        a_valider
    )


# ============================================================
# MAIN
# ============================================================

def main():

    print()
    print("=" * 70)
    print(
        "SXMXDX - FORMALISATION DES REGLES"
    )
    print("=" * 70)

    (
        document,
        executables,
        a_valider
    ) = formaliser()

    resultat = {

        "modele":
            document.get("modele"),

        "origine":
            "REVERSE_ENGINEERING_FORMALISE",

        "statistiques": {

            "regles_techniques":
                len(
                    document.get(
                        "regles",
                        []
                    )
                ),

            "regles_formalisees":
                len(executables),

            "regles_a_valider":
                len(a_valider)
        },

        "regles":
            executables,

        "a_valider":
            a_valider
    }

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    with OUTPUT_FILE.open(
        "w",
        encoding="utf-8"
    ) as fichier:

        json.dump(
            resultat,
            fichier,
            ensure_ascii=False,
            indent=4
        )

    print(
        f"\nRègles techniques : "
        f"{resultat['statistiques']['regles_techniques']}"
    )

    print(
        f"Règles formalisées : "
        f"{len(executables)}"
    )

    print(
        f"À valider          : "
        f"{len(a_valider)}"
    )

    print()

    for regle in executables:

        print(
            f"{regle['id']} | "
            f"{regle['domaine']} | "
            f"{regle['cible']} | "
            f"{regle['operation']} | "
            f"{regle['periodicite']}"
        )

    if a_valider:

        print()
        print("REGLES A VALIDER")
        print("-" * 70)

        for regle in a_valider:

            print(
                f"{regle['regle_technique']} "
                f"→ {regle['raison']}"
            )

    print()
    print(
        f"[OK] {OUTPUT_FILE}"
    )

    print("=" * 70)


if __name__ == "__main__":
    main()