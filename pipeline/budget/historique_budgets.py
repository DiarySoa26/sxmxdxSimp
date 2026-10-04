# from decimal import Decimal
# from pathlib import Path
# import sys

# import psycopg2
# from psycopg2.extras import RealDictCursor


# # ============================================================
# # PROJET
# # ============================================================

# PROJECT_ROOT = Path(__file__).resolve().parents[2]

# if str(PROJECT_ROOT) not in sys.path:
#     sys.path.insert(0, str(PROJECT_ROOT))


# # ============================================================
# # POSTGRESQL
# # ============================================================

# DB_CONFIG = {
#     "host": "localhost",
#     "port": 5434,
#     "dbname": "sxmxdx2",
#     "user": "sxmxdx",
#     "password": "diary",
# }


# def connecter():

#     return psycopg2.connect(
#         **DB_CONFIG
#     )


# # ============================================================
# # FORMATAGE
# # ============================================================

# def afficher_montant(valeur):

#     if valeur is None:
#         return "0.00"

#     if not isinstance(valeur, Decimal):
#         valeur = Decimal(str(valeur))

#     return f"{valeur:,.2f}"


# def afficher_pourcentage(valeur):

#     if valeur is None:
#         return "0.00 %"

#     if not isinstance(valeur, Decimal):
#         valeur = Decimal(str(valeur))

#     return f"{valeur * 100:.2f} %"


# # ============================================================
# # HISTORIQUE
# # ============================================================

# def recuperer_historique():

#     connexion = connecter()

#     try:

#         with connexion.cursor(
#             cursor_factory=RealDictCursor
#         ) as curseur:

#             curseur.execute(
#                 """
#                 SELECT
#                     b.id AS budget_id,
#                     b.import_id,
#                     b.exercice_id,
#                     e.annee,
#                     b.type_budget,
#                     b.statut,
#                     b.ca_export,
#                     b.charges_exploitation,
#                     b.frais_export,
#                     b.masse_salariale,
#                     b.resultat_operationnel,
#                     b.marge_operationnelle,
#                     b.date_generation

#                 FROM budget b

#                 JOIN exercice e
#                     ON e.id = b.exercice_id

#                 WHERE b.statut = 'GENERE'

#                 ORDER BY
#                     e.annee ASC,
#                     b.id ASC
#                 """
#             )

#             return curseur.fetchall()

#     finally:

#         connexion.close()


# # ============================================================
# # AFFICHAGE
# # ============================================================

# def afficher_historique(budgets):

#     print()
#     print("=" * 100)
#     print("SXMXDX - HISTORIQUE DES BUDGETS")
#     print("=" * 100)

#     if not budgets:

#         print(
#             "Aucun budget généré."
#         )

#         return

#     for budget in budgets:

#         print()
#         print("-" * 100)

#         print(
#             f"Exercice              : {budget['annee']}"
#         )

#         print(
#             f"Budget ID             : {budget['budget_id']}"
#         )

#         print(
#             f"Import ID             : {budget['import_id']}"
#         )

#         print(
#             f"Type                   : {budget['type_budget']}"
#         )

#         print(
#             f"Date génération       : {budget['date_generation']}"
#         )

#         print(
#             f"CA export              : "
#             f"{afficher_montant(budget['ca_export'])}"
#         )

#         print(
#             f"Charges exploitation   : "
#             f"{afficher_montant(budget['charges_exploitation'])}"
#         )

#         print(
#             f"Frais export           : "
#             f"{afficher_montant(budget['frais_export'])}"
#         )

#         print(
#             f"Masse salariale        : "
#             f"{afficher_montant(budget['masse_salariale'])}"
#         )

#         print(
#             f"Résultat opérationnel  : "
#             f"{afficher_montant(budget['resultat_operationnel'])}"
#         )

#         print(
#             f"Marge opérationnelle   : "
#             f"{afficher_pourcentage(budget['marge_operationnelle'])}"
#         )

#     print()
#     print("=" * 100)

#     print(
#         f"Nombre de budgets : {len(budgets)}"
#     )

#     print("=" * 100)


# # ============================================================
# # MAIN
# # ============================================================

# if __name__ == "__main__":

#     try:

#         budgets = recuperer_historique()

#         afficher_historique(
#             budgets
#         )

#     except Exception as exc:

#         print()
#         print("=" * 70)
#         print(
#             "[ERREUR] HISTORIQUE DES BUDGETS"
#         )
#         print("=" * 70)

#         print(
#             str(exc)
#         )

#         sys.exit(1)



from pathlib import Path
import sys
import psycopg2
from psycopg2.extras import RealDictCursor

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "dbname": "sxmxdx2",
    "user": "sxmxdx",
    "password": "diary",
}

def connecter():
    return psycopg2.connect(**DB_CONFIG)

def recuperer_historique():
    connexion = connecter()
    try:
        with connexion.cursor(cursor_factory=RealDictCursor) as curseur:
            curseur.execute("""
                SELECT
                    b.id AS budget_id,
                    b.import_id,
                    b.exercice_id,
                    e.annee,
                    b.type_budget,
                    b.statut,
                    b.ca_export,
                    b.charges_exploitation,
                    b.frais_export,
                    b.masse_salariale,
                    b.resultat_operationnel,
                    b.marge_operationnelle,
                    b.date_generation
                FROM budget b
                JOIN exercice e ON e.id = b.exercice_id
                WHERE b.statut = 'GENERE'
                ORDER BY e.annee ASC, b.id ASC
            """)
            return curseur.fetchall()
    finally:
        connexion.close()

if __name__ == "__main__":
    print(recuperer_historique())