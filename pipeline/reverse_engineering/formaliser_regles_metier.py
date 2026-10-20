from pathlib import Path
import json
import sys

from re_commun import lire_arguments, dossier_sortie, charger_config

ARGUMENTS = lire_arguments()  # --sortie / --config ; reste : [mapping.json]


# ============================================================
# CONFIGURATION
# ============================================================

INPUT_FILE = dossier_sortie() / "regles_metier.json"

# Sortie distincte de regles_executables.json (formaliser_regles.py) :
# les deux formalisations ne s'ecrasent plus mutuellement.
OUTPUT_FILE = dossier_sortie() / "regles_executables_metier.json"


# ============================================================
# CORRESPONDANCE ENTRE LES REGLES EXCEL ET LE METIER
#
# Etape FACULTATIVE : elle sert a donner des codes/noms metier
# choisis a la main (RG_BUD_001 ...) a certaines regles.
# Le mapping n'est plus dans le code : c'est un fichier JSON
# { "RG_FEUILLE_001": { "code_metier": ..., "nom_metier": ..., ... } }
#
# Recherche : 1. argument  2. cle "mapping_metier" de re_config.json
#             3. <dossier de sortie>/mapping_metier.json
# Exemple fourni : exemples/mapping_metier_somida_budget.json
# ============================================================

def trouver_fichier_mapping():

    if ARGUMENTS:
        return Path(ARGUMENTS[0])

    configure = charger_config().get("mapping_metier")

    if configure:
        return Path(configure)

    return dossier_sortie() / "mapping_metier.json"


def charger_mapping():

    chemin = trouver_fichier_mapping()

    if not chemin.exists():
        return None, chemin

    with chemin.open("r", encoding="utf-8") as fichier:
        return json.load(fichier), chemin


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
# FORMALISATION
# ============================================================

def formaliser_regles(document, MAPPING_METIER):

    regles_techniques = document.get(
        "regles",
        []
    )

    regles_executables = []
    regles_non_mappees = []

    for regle in regles_techniques:

        id_technique = regle.get("id")

        mapping = MAPPING_METIER.get(
            id_technique
        )

        if mapping is None:

            regles_non_mappees.append({
                "id": id_technique,
                "feuille": regle.get("feuille"),
                "cellule": regle.get(
                    "cellule_cible_reference"
                ),
                "formule": regle.get(
                    "formule_excel_reference"
                )
            })

            continue

        nouvelle_regle = {
            "id": mapping["code_metier"],

            "nom": mapping["nom_metier"],

            "type": "REGLE_METIER",

            "origine": "REVERSE_ENGINEERING_EXCEL",

            "regle_technique_source": id_technique,

            "feuille_excel_source":
                regle.get("feuille"),

            "cellules_excel_source":
                regle.get("cellules_excel", []),

            "formule_excel_reference":
                regle.get(
                    "formule_excel_reference"
                ),

            "cible": mapping["cible"],

            "operation":
                mapping["operation_metier"],

            "periodicite":
                mapping["periodicite_metier"]
        }

        # ----------------------------------------------------
        # SOURCE UNIQUE
        # ----------------------------------------------------

        if "source" in mapping:
            nouvelle_regle["source"] = (
                mapping["source"]
            )

        # ----------------------------------------------------
        # SOURCES MULTIPLES
        # ----------------------------------------------------

        if "sources" in mapping:
            nouvelle_regle["sources"] = (
                mapping["sources"]
            )

        # ----------------------------------------------------
        # EXPRESSION
        # ----------------------------------------------------

        if "expression" in mapping:
            nouvelle_regle["expression"] = (
                mapping["expression"]
            )

        # ----------------------------------------------------
        # DIVISION
        # ----------------------------------------------------

        if "numerateur" in mapping:
            nouvelle_regle["numerateur"] = (
                mapping["numerateur"]
            )

        if "denominateur" in mapping:
            nouvelle_regle["denominateur"] = (
                mapping["denominateur"]
            )

        if "gestion_zero" in mapping:
            nouvelle_regle["gestion_zero"] = (
                mapping["gestion_zero"]
            )

        regles_executables.append(
            nouvelle_regle
        )

    return (
        regles_executables,
        regles_non_mappees
    )


# ============================================================
# VALIDATION
# ============================================================

def valider_regles(regles):

    erreurs = []

    ids = set()

    for regle in regles:

        id_regle = regle.get("id")

        if not id_regle:
            erreurs.append(
                "Une règle ne possède pas d'identifiant."
            )
            continue

        if id_regle in ids:
            erreurs.append(
                f"Identifiant dupliqué : {id_regle}"
            )

        ids.add(id_regle)

        if not regle.get("cible"):
            erreurs.append(
                f"{id_regle} : cible absente."
            )

        if not regle.get("operation"):
            erreurs.append(
                f"{id_regle} : opération absente."
            )

        if not regle.get("periodicite"):
            erreurs.append(
                f"{id_regle} : périodicité absente."
            )

    return erreurs


# ============================================================
# PROGRAMME PRINCIPAL
# ============================================================

def main():

    print()
    print("=" * 70)
    print("SXMXDX - FORMALISATION DES REGLES METIER")
    print("=" * 70)

    mapping, chemin_mapping = charger_mapping()

    if mapping is None:

        print(
            f"\n[INFO] Aucun fichier de mapping metier ({chemin_mapping})."
        )
        print(
            "Etape facultative ignoree : les regles formalisees "
            "automatiquement sont dans regles_executables.json "
            "(formaliser_regles.py)."
        )
        print("=" * 70)
        return

    print(f"\nMapping : {chemin_mapping} ({len(mapping)} regle(s))")

    document = lire_json(
        INPUT_FILE
    )

    print(
        f"\nModèle  : "
        f"{document.get('modele')}"
    )

    print(
        f"Version : "
        f"{document.get('version')}"
    )

    print(
        f"Règles techniques : "
        f"{len(document.get('regles', []))}"
    )

    (
        regles_executables,
        regles_non_mappees
    ) = formaliser_regles(
        document,
        mapping
    )

    erreurs = valider_regles(
        regles_executables
    )

    if erreurs:

        print(
            "\n[ERREUR] Formalisation invalide :"
        )

        for erreur in erreurs:
            print(
                f" - {erreur}"
            )

        raise RuntimeError(
            "Les règles métier générées "
            "ne sont pas valides."
        )

    resultat = {

        "modele": document.get(
            "modele"
        ),

        "version": document.get(
            "version"
        ),

        "origine":
            "FORMALISATION_REVERSE_ENGINEERING_MAPPING",

        "source":
            str(INPUT_FILE),

        "statistiques": {
            "nombre_regles_techniques":
                len(
                    document.get(
                        "regles",
                        []
                    )
                ),

            "nombre_regles_executables":
                len(regles_executables),

            "nombre_regles_non_mappees":
                len(regles_non_mappees)
        },

        "regles":
            regles_executables,

        "regles_non_mappees":
            regles_non_mappees
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

    print()
    print("-" * 70)
    print("RESULTAT")
    print("-" * 70)

    print(
        f"Règles métier exécutables : "
        f"{len(regles_executables)}"
    )

    print(
        f"Règles non mappées         : "
        f"{len(regles_non_mappees)}"
    )

    print()

    for regle in regles_executables:

        print(
            f"{regle['id']:<12} "
            f"{regle['cible']:<35} "
            f"{regle['periodicite']}"
        )

    if regles_non_mappees:

        print()
        print(
            "Règles techniques conservées "
            "mais non utilisées par le moteur :"
        )

        for regle in regles_non_mappees:

            print(
                f" - {regle['id']} "
                f"({regle['feuille']}!"
                f"{regle['cellule']})"
            )

    print()
    print(
        f"[OK] Fichier généré : "
        f"{OUTPUT_FILE}"
    )

    print("=" * 70)


if __name__ == "__main__":
    main()