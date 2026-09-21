from pathlib import Path
import json


OUTPUT_DIR = Path("output/reverse_engineering")


REGLES_METIER = [

    {
        "code": "RG_PROD_001",
        "domaine": "PRODUCTION",
        "nom": "Production commercialisable",
        "description":
            "La production commercialisable correspond à "
            "la production après prise en compte des pertes.",
        "expression":
            "production_commercialisable = "
            "production_brute - pertes"
    },

    {
        "code": "RG_SAL_001",
        "domaine": "PERSONNEL",
        "nom": "Coût salarial",
        "description":
            "Le coût d'un employé inclut le salaire, "
            "les primes et les charges associées.",
        "expression":
            "cout_salarial = salaire_base + primes + charges"
    },

    {
        "code": "RG_EXP_001",
        "domaine": "EXPORTATION",
        "nom": "Chiffre d'affaires en devise",
        "description":
            "Le chiffre d'affaires en devise est obtenu "
            "à partir de la quantité exportée et du prix unitaire.",
        "expression":
            "ca_devise = quantite_exportee * prix_unitaire_devise"
    },

    {
        "code": "RG_EXP_002",
        "domaine": "EXPORTATION",
        "nom": "Conversion en MGA",
        "description":
            "Les ventes en devise sont converties en ariary "
            "selon le taux de change applicable.",
        "expression":
            "ca_mga = ca_devise * taux_change"
    },

    {
        "code": "RG_EXP_003",
        "domaine": "EXPORTATION",
        "nom": "Coût d'exportation",
        "description":
            "Le coût d'exportation regroupe les différents "
            "frais nécessaires à l'expédition.",
        "expression":
            "cout_export = transport + transit + manutention "
            "+ fret + assurance + frais_bancaires"
    },

    {
        "code": "RG_BUD_001",
        "domaine": "BUDGET",
        "nom": "Charges totales",
        "description":
            "Les charges totales regroupent les charges de production, "
            "les charges de structure et les frais d'exportation.",
        "expression":
            "charges_totales = charges_production "
            "+ charges_structure + frais_export"
    },

    {
        "code": "RG_BUD_002",
        "domaine": "BUDGET",
        "nom": "Résultat opérationnel",
        "description":
            "Le résultat opérationnel correspond au chiffre "
            "d'affaires diminué des charges.",
        "expression":
            "resultat_operationnel = ca_mga - charges_totales"
    },

    {
        "code": "RG_BUD_003",
        "domaine": "BUDGET",
        "nom": "Taux de marge",
        "description":
            "Le taux de marge représente le résultat "
            "rapporté au chiffre d'affaires.",
        "expression":
            "taux_marge = "
            "(resultat_operationnel / ca_mga) * 100"
    }
]


def generer_regles():

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    sortie = OUTPUT_DIR / "regles_metier.json"

    resultat = {
        "modele": "SOMIDA_BUDGET_V1",
        "nombre_regles": len(REGLES_METIER),
        "regles": REGLES_METIER
    }

    with open(
        sortie,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            resultat,
            f,
            indent=4,
            ensure_ascii=False
        )

    print("\n" + "=" * 70)
    print("SXMXDX - REGLES METIER")
    print("=" * 70)

    for regle in REGLES_METIER:

        print(
            f"[{regle['code']}] "
            f"{regle['nom']}"
        )

    print("\n" + "-" * 70)
    print(f"{len(REGLES_METIER)} règles enregistrées.")
    print(f"[OK] {sortie}")


if __name__ == "__main__":
    generer_regles()