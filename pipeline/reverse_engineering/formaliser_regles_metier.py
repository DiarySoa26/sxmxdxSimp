from pathlib import Path
import json


# ============================================================
# CONFIGURATION
# ============================================================

INPUT_FILE = Path(
    "output/reverse_engineering/regles_metier.json"
)

OUTPUT_FILE = Path(
    "output/reverse_engineering/regles_executables.json"
)


# ============================================================
# CORRESPONDANCE ENTRE LES REGLES EXCEL ET LE METIER
# ============================================================

MAPPING_METIER = {

    # --------------------------------------------------------
    # SYNTHESE - MENSUEL
    # --------------------------------------------------------

    "RG_SYNTHESE_001": {
        "code_metier": "RG_BUD_001",
        "nom_metier": "Calcul du chiffre d'affaires mensuel",
        "cible": "chiffre_affaires",
        "source": "exportation.ca_mga",
        "operation_metier": "SOMME",
        "periodicite_metier": "MENSUELLE"
    },

    "RG_SYNTHESE_003": {
        "code_metier": "RG_BUD_002",
        "nom_metier": "Calcul des charges mensuelles",
        "cible": "charges_metier",
        "source": "charge.montant",
        "operation_metier": "SOMME",
        "periodicite_metier": "MENSUELLE"
    },

    "RG_SYNTHESE_005": {
        "code_metier": "RG_BUD_003",
        "nom_metier": "Calcul des frais d'exportation mensuels",
        "cible": "frais_export",
        "source": "frais_export.total",
        "operation_metier": "SOMME",
        "periodicite_metier": "MENSUELLE"
    },

    "RG_SYNTHESE_007": {
        "code_metier": "RG_BUD_004",
        "nom_metier": "Calcul des charges salariales",
        "cible": "charges_salariales",
        "source": "employe.cout_total",
        "operation_metier": "SOMME",
        "periodicite_metier": "MENSUELLE"
    },

    "RG_SYNTHESE_009": {
        "code_metier": "RG_BUD_005",
        "nom_metier": "Calcul du résultat opérationnel mensuel",
        "cible": "resultat_operationnel",
        "sources": [
            "chiffre_affaires",
            "charges_metier",
            "frais_export",
            "charges_salariales"
        ],
        "operation_metier": "SOUSTRACTION",
        "expression": (
            "chiffre_affaires "
            "- charges_metier "
            "- frais_export "
            "- charges_salariales"
        ),
        "periodicite_metier": "MENSUELLE"
    },

    "RG_SYNTHESE_011": {
        "code_metier": "RG_BUD_006",
        "nom_metier": "Calcul du taux de marge mensuel",
        "cible": "taux_marge",
        "numerateur": "resultat_operationnel",
        "denominateur": "chiffre_affaires",
        "operation_metier": "DIVISION",
        "gestion_zero": True,
        "periodicite_metier": "MENSUELLE"
    },


    # --------------------------------------------------------
    # SYNTHESE - ANNUEL
    # --------------------------------------------------------

    "RG_SYNTHESE_002": {
        "code_metier": "RG_BUD_007",
        "nom_metier": "Calcul du chiffre d'affaires annuel",
        "cible": "chiffre_affaires_annuel",
        "source": "chiffre_affaires",
        "operation_metier": "SOMME",
        "periodicite_metier": "ANNUELLE"
    },

    "RG_SYNTHESE_004": {
        "code_metier": "RG_BUD_008",
        "nom_metier": "Calcul des charges annuelles",
        "cible": "charges_metier_annuelles",
        "source": "charges_metier",
        "operation_metier": "SOMME",
        "periodicite_metier": "ANNUELLE"
    },

    "RG_SYNTHESE_006": {
        "code_metier": "RG_BUD_009",
        "nom_metier": "Calcul des frais d'exportation annuels",
        "cible": "frais_export_annuels",
        "source": "frais_export",
        "operation_metier": "SOMME",
        "periodicite_metier": "ANNUELLE"
    },

    "RG_SYNTHESE_008": {
        "code_metier": "RG_BUD_010",
        "nom_metier": "Calcul des charges salariales annuelles",
        "cible": "charges_salariales_annuelles",
        "source": "charges_salariales",
        "operation_metier": "SOMME",
        "periodicite_metier": "ANNUELLE"
    },

    "RG_SYNTHESE_010": {
        "code_metier": "RG_BUD_011",
        "nom_metier": "Calcul du résultat opérationnel annuel",
        "cible": "resultat_operationnel_annuel",
        "source": "resultat_operationnel",
        "operation_metier": "SOMME",
        "periodicite_metier": "ANNUELLE"
    },

    "RG_SYNTHESE_012": {
        "code_metier": "RG_BUD_012",
        "nom_metier": "Calcul du taux de marge annuel",
        "cible": "taux_marge_annuel",
        "numerateur": "resultat_operationnel_annuel",
        "denominateur": "chiffre_affaires_annuel",
        "operation_metier": "DIVISION",
        "gestion_zero": True,
        "periodicite_metier": "ANNUELLE"
    }
}


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

def formaliser_regles(document):

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
        document
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
            "FORMALISATION_REVERSE_ENGINEERING",

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