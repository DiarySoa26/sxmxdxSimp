# from decimal import Decimal
# from pathlib import Path
# import sys

# import psycopg2
# from psycopg2.extras import RealDictCursor


# # ============================================================
# # IMPORT DU MOTEUR
# # ============================================================

# PROJECT_ROOT = Path(__file__).resolve().parents[2]

# if str(PROJECT_ROOT) not in sys.path:
#     sys.path.insert(
#         0,
#         str(PROJECT_ROOT)
#     )

# from pipeline.budget.moteur_regles import (
#     calculer_budget_mensuel,
#     calculer_budget_annuel,
#     verifier_regles_re,
# )


# # ============================================================
# # CONFIGURATION POSTGRESQL
# # ============================================================
# #
# # Exécution depuis le Mac :
# #
# # python pipeline/budget/generer_budget.py
# #
# # PostgreSQL Docker :
# # host = localhost
# # port = 5433
# #
# # ============================================================

# DB_CONFIG = {
#     "host": "localhost",
#     "port": 5434,
#     "dbname": "sxmxdx2",
#     "user": "sxmxdx",
#     "password": "diary",
# }


# # ============================================================
# # CONNEXION
# # ============================================================

# def connecter():

#     return psycopg2.connect(
#         **DB_CONFIG
#     )


# # ============================================================
# # DERNIER IMPORT PRET POUR GENERATION
# # ============================================================

# def recuperer_dernier_import_pret(connexion):

#     with connexion.cursor(
#         cursor_factory=RealDictCursor
#     ) as curseur:

#         curseur.execute(
#             """
#             SELECT
#                 i.id,
#                 i.exercice_id,
#                 i.statut
#             FROM import_fichier i
#             WHERE i.statut = 'PRET_GENERATION'

#               AND NOT EXISTS (
#                   SELECT 1
#                   FROM budget b
#                   WHERE b.import_id = i.id
#                     AND b.type_budget = 'GENERE'
#                     AND b.statut = 'GENERE'
#               )

#             ORDER BY i.id DESC
#             LIMIT 1
#             """
#         )

#         import_fichier = curseur.fetchone()

#     if import_fichier is None:

#         raise ValueError(
#             "Aucun nouvel import PRET_GENERATION "
#             "sans budget généré n'a été trouvé."
#         )

#     return import_fichier


# # ============================================================
# # VERIFICATION IMPORT
# # ============================================================

# def verifier_import(
#     import_fichier
# ):

#     if import_fichier is None:

#         raise ValueError(
#             "Import introuvable."
#         )

#     statut = import_fichier[
#         "statut"
#     ]

#     if statut != "PRET_GENERATION":

#         raise ValueError(
#             "L'import n'est pas prêt pour "
#             "la génération du budget. "
#             f"Statut actuel : {statut}"
#         )


# # ============================================================
# # MOIS
# # ============================================================

# def recuperer_mois(
#     connexion
# ):

#     with connexion.cursor(
#         cursor_factory=RealDictCursor
#     ) as curseur:

#         curseur.execute(
#             """
#             SELECT
#                 id,
#                 nom
#             FROM mois
#             ORDER BY id
#             """
#         )

#         mois = curseur.fetchall()

#     if len(mois) != 12:

#         raise ValueError(
#             "La table mois doit contenir "
#             f"12 mois. Trouvé : {len(mois)}"
#         )

#     return mois


# # ============================================================
# # EXPORTATIONS
# # ============================================================

# def recuperer_exportations(
#     connexion,
#     import_id,
#     exercice_id,
#     mois_id
# ):

#     with connexion.cursor(
#         cursor_factory=RealDictCursor
#     ) as curseur:

#         curseur.execute(
#             """
#             SELECT
#                 *
#             FROM exportation
#             WHERE import_id = %s
#               AND exercice_id = %s
#               AND mois_id = %s
#             """,
#             (
#                 import_id,
#                 exercice_id,
#                 mois_id
#             )
#         )

#         return curseur.fetchall()


# # ============================================================
# # CHARGES
# # ============================================================

# def recuperer_charges(
#     connexion,
#     import_id,
#     exercice_id,
#     mois_id
# ):

#     with connexion.cursor(
#         cursor_factory=RealDictCursor
#     ) as curseur:

#         curseur.execute(
#             """
#             SELECT
#                 *
#             FROM charge
#             WHERE import_id = %s
#               AND exercice_id = %s
#               AND mois_id = %s
#             """,
#             (
#                 import_id,
#                 exercice_id,
#                 mois_id
#             )
#         )

#         return curseur.fetchall()


# # ============================================================
# # FRAIS EXPORT
# # ============================================================

# def recuperer_frais_export(
#     connexion,
#     import_id,
#     exercice_id,
#     mois_id
# ):

#     with connexion.cursor(
#         cursor_factory=RealDictCursor
#     ) as curseur:

#         curseur.execute(
#             """
#             SELECT
#                 *
#             FROM frais_export
#             WHERE import_id = %s
#               AND exercice_id = %s
#               AND mois_id = %s
#             """,
#             (
#                 import_id,
#                 exercice_id,
#                 mois_id
#             )
#         )

#         return curseur.fetchall()


# # ============================================================
# # EMPLOYES
# # ============================================================

# def recuperer_employes(
#     connexion,
#     import_id
# ):
#     """
#     Dans notre modèle actuel, employe ne possède
#     pas de mois_id.

#     Le coût total représente le coût mensuel
#     de l'employé.

#     La même masse salariale est donc utilisée
#     pour chacun des 12 mois, conformément au
#     modèle Excel actuel.
#     """

#     with connexion.cursor(
#         cursor_factory=RealDictCursor
#     ) as curseur:

#         curseur.execute(
#             """
#             SELECT
#                 *
#             FROM employe
#             WHERE import_id = %s
#             """,
#             (
#                 import_id,
#             )
#         )

#         return curseur.fetchall()


# # ============================================================
# # CONTROLE DES DONNEES
# # ============================================================

# def verifier_donnees_mois(
#     nom_mois,
#     exportations,
#     charges,
#     frais_export,
#     employes
# ):

#     erreurs = []

#     if not exportations:
#         erreurs.append(
#             "exportations absentes"
#         )

#     if not charges:
#         erreurs.append(
#             "charges absentes"
#         )

#     if not frais_export:
#         erreurs.append(
#             "frais export absents"
#         )

#     if not employes:
#         erreurs.append(
#             "employés absents"
#         )

#     if erreurs:

#         raise ValueError(
#             f"{nom_mois} : "
#             + ", ".join(erreurs)
#         )


# # ============================================================
# # CREATION DU BUDGET
# # ============================================================

# def creer_budget(
#     connexion,
#     exercice_id,
#     import_id
# ):

#     with connexion.cursor() as curseur:

#         curseur.execute(
#             """
#             INSERT INTO budget (
#                 exercice_id,
#                 import_id,
#                 type_budget,
#                 statut
#             )
#             VALUES (
#                 %s,
#                 %s,
#                 'GENERE',
#                 'EN_COURS'
#             )
#             RETURNING id
#             """,
#             (
#                 exercice_id,
#                 import_id
#             )
#         )

#         budget_id = (
#             curseur.fetchone()[0]
#         )

#     return budget_id


# # ============================================================
# # INSERTION BUDGET MENSUEL
# # ============================================================

# def inserer_budget_mensuel(
#     connexion,
#     budget_id,
#     mois_id,
#     resultat
# ):

#     with connexion.cursor() as curseur:

#         curseur.execute(
#             """
#             INSERT INTO budget_mensuel (
#                 budget_id,
#                 mois_id,
#                 ca_export,
#                 charges_exploitation,
#                 frais_export,
#                 masse_salariale,
#                 resultat_operationnel,
#                 marge_operationnelle
#             )
#             VALUES (
#                 %s,
#                 %s,
#                 %s,
#                 %s,
#                 %s,
#                 %s,
#                 %s,
#                 %s
#             )
#             """,
#             (
#                 budget_id,
#                 mois_id,

#                 resultat[
#                     "ca_export"
#                 ],

#                 resultat[
#                     "charges_exploitation"
#                 ],

#                 resultat[
#                     "frais_export"
#                 ],

#                 resultat[
#                     "masse_salariale"
#                 ],

#                 resultat[
#                     "resultat_operationnel"
#                 ],

#                 resultat[
#                     "marge_operationnelle"
#                 ],
#             )
#         )


# # ============================================================
# # FINALISATION DU BUDGET
# # ============================================================

# def finaliser_budget(
#     connexion,
#     budget_id,
#     resultat_annuel
# ):

#     with connexion.cursor() as curseur:

#         curseur.execute(
#             """
#             UPDATE budget
#             SET
#                 ca_export = %s,
#                 charges_exploitation = %s,
#                 frais_export = %s,
#                 masse_salariale = %s,
#                 resultat_operationnel = %s,
#                 marge_operationnelle = %s,
#                 statut = 'GENERE'
#             WHERE id = %s
#             """,
#             (
#                 resultat_annuel[
#                     "ca_export"
#                 ],

#                 resultat_annuel[
#                     "charges_exploitation"
#                 ],

#                 resultat_annuel[
#                     "frais_export"
#                 ],

#                 resultat_annuel[
#                     "masse_salariale"
#                 ],

#                 resultat_annuel[
#                     "resultat_operationnel"
#                 ],

#                 resultat_annuel[
#                     "marge_operationnelle"
#                 ],

#                 budget_id
#             )
#         )


# # ============================================================
# # AFFICHAGE
# # ============================================================

# def afficher_montant(
#     valeur
# ):

#     if valeur is None:
#         return "0"

#     if not isinstance(
#         valeur,
#         Decimal
#     ):
#         valeur = Decimal(
#             str(valeur)
#         )

#     return f"{valeur:,.2f}"


# def afficher_resultat_mensuel(
#     nom_mois,
#     resultat
# ):

#     print()
#     print(
#         f"{nom_mois}"
#     )

#     print(
#         "-" * 60
#     )

#     print(
#         f"CA export             : "
#         f"{afficher_montant(resultat['ca_export'])}"
#     )

#     print(
#         f"Charges exploitation  : "
#         f"{afficher_montant(resultat['charges_exploitation'])}"
#     )

#     print(
#         f"Frais export          : "
#         f"{afficher_montant(resultat['frais_export'])}"
#     )

#     print(
#         f"Masse salariale       : "
#         f"{afficher_montant(resultat['masse_salariale'])}"
#     )

#     print(
#         f"Résultat opérationnel : "
#         f"{afficher_montant(resultat['resultat_operationnel'])}"
#     )

#     print(
#         f"Marge opérationnelle  : "
#         f"{resultat['marge_operationnelle'] * 100:.2f} %"
#     )


# # ============================================================
# # GENERATION
# # ============================================================

# def generer_budget():

#     connexion = None

#     try:

#         # ----------------------------------------------------
#         # 1. VERIFICATION DES REGLES DU RE
#         # ----------------------------------------------------

#         verifier_regles_re()

#         # ----------------------------------------------------
#         # 2. CONNEXION POSTGRESQL
#         # ----------------------------------------------------

#         connexion = connecter()

#         print()
#         print("=" * 70)
#         print(
#             "SXMXDX - GENERATION DU BUDGET"
#         )
#         print("=" * 70)

#         # ----------------------------------------------------
#         # 3. RECUPERATION AUTOMATIQUE DU DERNIER IMPORT
#         # ----------------------------------------------------

#         import_fichier = (
#             recuperer_dernier_import_pret(
#                 connexion
#             )
#         )

#         verifier_import(
#             import_fichier
#         )

#         import_id = (
#             import_fichier[
#                 "id"
#             ]
#         )

#         exercice_id = (
#             import_fichier[
#                 "exercice_id"
#             ]
#         )

#         print()
#         print(
#             "Import sélectionné automatiquement"
#         )

#         print(
#             f"Import ID   : {import_id}"
#         )

#         print(
#             f"Exercice ID : {exercice_id}"
#         )

#         print(
#             "Statut       : PRET_GENERATION"
#         )

#         # ----------------------------------------------------
#         # 4. MOIS
#         # ----------------------------------------------------

#         mois = recuperer_mois(
#             connexion
#         )

#         # ----------------------------------------------------
#         # 5. EMPLOYES
#         # ----------------------------------------------------

#         employes = (
#             recuperer_employes(
#                 connexion,
#                 import_id
#             )
#         )

#         if not employes:

#             raise ValueError(
#                 "Aucun employé trouvé "
#                 f"pour l'import {import_id}."
#             )

#         print(
#             f"Employés    : "
#             f"{len(employes)}"
#         )

#         # ----------------------------------------------------
#         # 6. CREATION DU BUDGET
#         # ----------------------------------------------------

#         budget_id = creer_budget(
#             connexion,
#             exercice_id,
#             import_id
#         )

#         print(
#             f"Budget ID   : "
#             f"{budget_id}"
#         )

#         # ----------------------------------------------------
#         # 7. CALCUL DES 12 MOIS
#         # ----------------------------------------------------

#         budgets_mensuels = []

#         for mois_ligne in mois:

#             mois_id = (
#                 mois_ligne[
#                     "id"
#                 ]
#             )

#             nom_mois = (
#                 mois_ligne[
#                     "nom"
#                 ]
#             )

#             # -----------------------------------------------
#             # EXPORTATIONS
#             # -----------------------------------------------

#             exportations = (
#                 recuperer_exportations(
#                     connexion,
#                     import_id,
#                     exercice_id,
#                     mois_id
#                 )
#             )

#             # -----------------------------------------------
#             # CHARGES
#             # -----------------------------------------------

#             charges = (
#                 recuperer_charges(
#                     connexion,
#                     import_id,
#                     exercice_id,
#                     mois_id
#                 )
#             )

#             # -----------------------------------------------
#             # FRAIS EXPORT
#             # -----------------------------------------------

#             frais_export = (
#                 recuperer_frais_export(
#                     connexion,
#                     import_id,
#                     exercice_id,
#                     mois_id
#                 )
#             )

#             # -----------------------------------------------
#             # VALIDATION
#             # -----------------------------------------------

#             verifier_donnees_mois(
#                 nom_mois,
#                 exportations,
#                 charges,
#                 frais_export,
#                 employes
#             )

#             # -----------------------------------------------
#             # MOTEUR DES REGLES
#             # -----------------------------------------------

#             resultat = (
#                 calculer_budget_mensuel(
#                     exportations,
#                     charges,
#                     frais_export,
#                     employes
#                 )
#             )

#             # -----------------------------------------------
#             # CONSERVATION EN MEMOIRE
#             # -----------------------------------------------

#             budgets_mensuels.append(
#                 resultat
#             )

#             # -----------------------------------------------
#             # INSERTION BUDGET MENSUEL
#             # -----------------------------------------------

#             inserer_budget_mensuel(
#                 connexion,
#                 budget_id,
#                 mois_id,
#                 resultat
#             )

#             # -----------------------------------------------
#             # AFFICHAGE
#             # -----------------------------------------------

#             afficher_resultat_mensuel(
#                 nom_mois,
#                 resultat
#             )

#         # ----------------------------------------------------
#         # 8. CALCUL ANNUEL
#         # ----------------------------------------------------

#         resultat_annuel = (
#             calculer_budget_annuel(
#                 budgets_mensuels
#             )
#         )

#         # ----------------------------------------------------
#         # 9. FINALISATION
#         # ----------------------------------------------------

#         finaliser_budget(
#             connexion,
#             budget_id,
#             resultat_annuel
#         )

#         # ----------------------------------------------------
#         # 10. COMMIT
#         # ----------------------------------------------------

#         connexion.commit()

#         # ----------------------------------------------------
#         # 11. AFFICHAGE ANNUEL
#         # ----------------------------------------------------

#         print()
#         print("=" * 70)
#         print("TOTAL ANNUEL")
#         print("=" * 70)

#         print(
#             f"CA export             : "
#             f"{afficher_montant(resultat_annuel['ca_export'])}"
#         )

#         print(
#             f"Charges exploitation  : "
#             f"{afficher_montant(resultat_annuel['charges_exploitation'])}"
#         )

#         print(
#             f"Frais export          : "
#             f"{afficher_montant(resultat_annuel['frais_export'])}"
#         )

#         print(
#             f"Masse salariale       : "
#             f"{afficher_montant(resultat_annuel['masse_salariale'])}"
#         )

#         print(
#             f"Résultat opérationnel : "
#             f"{afficher_montant(resultat_annuel['resultat_operationnel'])}"
#         )

#         print(
#             f"Marge opérationnelle  : "
#             f"{resultat_annuel['marge_operationnelle'] * 100:.2f} %"
#         )

#         print()
#         print(
#             f"[OK] Budget {budget_id} "
#             "généré avec succès."
#         )

#         return budget_id

#     except Exception as exc:

#         if connexion is not None:
#             connexion.rollback()

#         print()
#         print("=" * 70)
#         print(
#             "[ERREUR] GENERATION DU BUDGET"
#         )
#         print("=" * 70)

#         print(
#             str(exc)
#         )

#         raise

#     finally:

#         if connexion is not None:
#             connexion.close()


# # ============================================================
# # MAIN
# # ============================================================

# if __name__ == "__main__":

#     generer_budget()






from pathlib import Path
import sys
import psycopg2
from psycopg2.extras import RealDictCursor

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from pipeline.budget.moteur_regles import calculer_budget_mensuel, calculer_budget_annuel, verifier_regles_re

DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "dbname": "sxmxdx2",
    "user": "sxmxdx",
    "password": "diary",
}

def connecter():
    return psycopg2.connect(**DB_CONFIG)

def recuperer_dernier_import_pret(connexion):
    with connexion.cursor(cursor_factory=RealDictCursor) as curseur:
        curseur.execute("""
            SELECT i.id, i.exercice_id, i.statut
            FROM import_fichier i
            WHERE i.statut = 'PRET_GENERATION'
            AND NOT EXISTS (
                SELECT 1 FROM budget b
                WHERE b.import_id = i.id
                AND b.type_budget = 'GENERE'
                AND b.statut = 'GENERE'
            )
            ORDER BY i.id DESC LIMIT 1
        """)
        import_fichier = curseur.fetchone()
    if import_fichier is None:
        raise ValueError("Aucun nouvel import PRET_GENERATION sans budget généré n'a été trouvé.")
    return import_fichier

def verifier_import(import_fichier):
    if import_fichier is None:
        raise ValueError("Import introuvable.")
    if import_fichier["statut"] != "PRET_GENERATION":
        raise ValueError(f"L'import n'est pas prêt pour la génération du budget. Statut actuel : {import_fichier['statut']}")

def recuperer_mois(connexion):
    with connexion.cursor(cursor_factory=RealDictCursor) as curseur:
        curseur.execute("SELECT id, nom FROM mois ORDER BY id")
        mois = curseur.fetchall()
    if len(mois) != 12:
        raise ValueError(f"La table mois doit contenir 12 mois. Trouvé : {len(mois)}")
    return mois

def recuperer_exportations(connexion, import_id, exercice_id, mois_id):
    with connexion.cursor(cursor_factory=RealDictCursor) as curseur:
        curseur.execute("""
            SELECT * FROM exportation
            WHERE import_id = %s AND exercice_id = %s AND mois_id = %s
        """, (import_id, exercice_id, mois_id))
        return curseur.fetchall()

def recuperer_charges(connexion, import_id, exercice_id, mois_id):
    with connexion.cursor(cursor_factory=RealDictCursor) as curseur:
        curseur.execute("""
            SELECT * FROM charge
            WHERE import_id = %s AND exercice_id = %s AND mois_id = %s
        """, (import_id, exercice_id, mois_id))
        return curseur.fetchall()

def recuperer_frais_export(connexion, import_id, exercice_id, mois_id):
    with connexion.cursor(cursor_factory=RealDictCursor) as curseur:
        curseur.execute("""
            SELECT * FROM frais_export
            WHERE import_id = %s AND exercice_id = %s AND mois_id = %s
        """, (import_id, exercice_id, mois_id))
        return curseur.fetchall()

def recuperer_employes(connexion, import_id):
    with connexion.cursor(cursor_factory=RealDictCursor) as curseur:
        curseur.execute("SELECT * FROM employe WHERE import_id = %s", (import_id,))
        return curseur.fetchall()

def verifier_donnees_mois(nom_mois, exportations, charges, frais_export, employes):
    erreurs = []
    if not exportations: erreurs.append("exportations absentes")
    if not charges: erreurs.append("charges absentes")
    if not frais_export: erreurs.append("frais export absents")
    if not employes: erreurs.append("employés absents")
    if erreurs:
        raise ValueError(f"{nom_mois} : {', '.join(erreurs)}")

def creer_budget(connexion, exercice_id, import_id):
    with connexion.cursor() as curseur:
        curseur.execute("""
            INSERT INTO budget (exercice_id, import_id, type_budget, statut)
            VALUES (%s, %s, 'GENERE', 'EN_COURS')
            RETURNING id
        """, (exercice_id, import_id))
        return curseur.fetchone()[0]

def inserer_budget_mensuel(connexion, budget_id, mois_id, resultat):
    with connexion.cursor() as curseur:
        curseur.execute("""
            INSERT INTO budget_mensuel (
                budget_id, mois_id, ca_export, charges_exploitation,
                frais_export, masse_salariale, resultat_operationnel,
                marge_operationnelle
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            budget_id, mois_id, resultat["ca_export"],
            resultat["charges_exploitation"], resultat["frais_export"],
            resultat["masse_salariale"], resultat["resultat_operationnel"],
            resultat["marge_operationnelle"]
        ))

def finaliser_budget(connexion, budget_id, resultat):
    with connexion.cursor() as curseur:
        curseur.execute("""
            UPDATE budget SET
                ca_export = %s,
                charges_exploitation = %s,
                frais_export = %s,
                masse_salariale = %s,
                resultat_operationnel = %s,
                marge_operationnelle = %s,
                statut = 'GENERE'
            WHERE id = %s
        """, (
            resultat["ca_export"], resultat["charges_exploitation"],
            resultat["frais_export"], resultat["masse_salariale"],
            resultat["resultat_operationnel"], resultat["marge_operationnelle"],
            budget_id
        ))

def generer_budget():
    connexion = None
    try:
        verifier_regles_re()
        connexion = connecter()
        import_fichier = recuperer_dernier_import_pret(connexion)
        verifier_import(import_fichier)
        import_id = import_fichier["id"]
        exercice_id = import_fichier["exercice_id"]
        mois = recuperer_mois(connexion)
        employes = recuperer_employes(connexion, import_id)
        if not employes:
            raise ValueError(f"Aucun employé trouvé pour l'import {import_id}.")
        budget_id = creer_budget(connexion, exercice_id, import_id)
        budgets_mensuels = []
        for m in mois:
            exportations = recuperer_exportations(connexion, import_id, exercice_id, m["id"])
            charges = recuperer_charges(connexion, import_id, exercice_id, m["id"])
            frais_export = recuperer_frais_export(connexion, import_id, exercice_id, m["id"])
            verifier_donnees_mois(m["nom"], exportations, charges, frais_export, employes)
            resultat = calculer_budget_mensuel(exportations, charges, frais_export, employes)
            budgets_mensuels.append(resultat)
            inserer_budget_mensuel(connexion, budget_id, m["id"], resultat)
        resultat_annuel = calculer_budget_annuel(budgets_mensuels)
        finaliser_budget(connexion, budget_id, resultat_annuel)
        connexion.commit()
        return {
            "budget_id": budget_id,
            "import_id": import_id,
            "exercice_id": exercice_id,
            "statut": "GENERE"
        }
    except Exception:
        if connexion:
            connexion.rollback()
        raise
    finally:
        if connexion:
            connexion.close()

if __name__ == "__main__":
    print(generer_budget())