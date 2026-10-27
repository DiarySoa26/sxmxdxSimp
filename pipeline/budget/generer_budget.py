from pathlib import Path
import sys
import psycopg2
from psycopg2.extras import RealDictCursor

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from pipeline.budget.moteur_regles import calculer_budget_mensuel, calculer_budget_annuel, verifier_regles_re

DB_CONFIG = {
    "host": "postgres",
    "port": 5432,
    "dbname": "sxmxdx3",
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


def recuperer_amortissements(
    connexion,
    import_id,
    exercice_id,
    mois_id
):
    """
    Récupère la somme des amortissements
    du mois pour l'importation concernée.
    """

    with connexion.cursor() as curseur:
        curseur.execute("""
            SELECT
                COUNT(*),
                COALESCE(SUM(montant), 0)
            FROM amortissement_mensuel
            WHERE import_id = %s
              AND exercice_id = %s
              AND mois = %s
        """, (
            import_id,
            exercice_id,
            mois_id
        ))

        nombre, montant = curseur.fetchone()

    if nombre == 0:
        raise ValueError(
            "Aucun amortissement trouvé pour "
            f"import={import_id}, "
            f"exercice={exercice_id}, "
            f"mois={mois_id}. "
            "Vérifier l'importation des amortissements."
        )

    return montant


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

# def inserer_budget_mensuel(connexion, budget_id, mois_id, resultat):
#     with connexion.cursor() as curseur:
#         curseur.execute("""
#             INSERT INTO budget_mensuel (
#                 budget_id, mois_id, ca_export, charges_exploitation,
#                 frais_export, masse_salariale, resultat_operationnel,
#                 marge_operationnelle
#             )
#             VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
#         """, (
#             budget_id, mois_id, resultat["ca_export"],
#             resultat["charges_exploitation"], resultat["frais_export"],
#             resultat["masse_salariale"], resultat["resultat_operationnel"],
#             resultat["marge_operationnelle"]
#         ))




def inserer_budget_mensuel(
    connexion,
    budget_id,
    mois_id,
    resultat
):
    with connexion.cursor() as curseur:
        curseur.execute("""
            INSERT INTO budget_mensuel (
                budget_id,
                mois_id,
                ca_export,
                charges_exploitation,
                frais_export,
                masse_salariale,
                amortissements,
                resultat_operationnel,
                marge_operationnelle
            )
            VALUES (
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s
            )
        """, (
            budget_id,
            mois_id,
            resultat["ca_export"],
            resultat["charges_exploitation"],
            resultat["frais_export"],
            resultat["masse_salariale"],
            resultat["amortissements"],
            resultat["resultat_operationnel"],
            resultat["marge_operationnelle"]
        ))


# def finaliser_budget(connexion, budget_id, resultat):
#     with connexion.cursor() as curseur:
#         curseur.execute("""
#             UPDATE budget SET
#                 ca_export = %s,
#                 charges_exploitation = %s,
#                 frais_export = %s,
#                 masse_salariale = %s,
#                 resultat_operationnel = %s,
#                 marge_operationnelle = %s,
#                 statut = 'GENERE'
#             WHERE id = %s
#         """, (
#             resultat["ca_export"], resultat["charges_exploitation"],
#             resultat["frais_export"], resultat["masse_salariale"],
#             resultat["resultat_operationnel"], resultat["marge_operationnelle"],
#             budget_id
#         ))




def finaliser_budget(connexion, budget_id, resultat):
    with connexion.cursor() as curseur:
        curseur.execute("""
            UPDATE budget
            SET
                ca_export = %s,
                charges_exploitation = %s,
                frais_export = %s,
                masse_salariale = %s,
                amortissements = %s,
                resultat_operationnel = %s,
                marge_operationnelle = %s,
                statut = 'GENERE'
            WHERE id = %s
        """, (
            resultat["ca_export"],
            resultat["charges_exploitation"],
            resultat["frais_export"],
            resultat["masse_salariale"],
            resultat["amortissements"],
            resultat["resultat_operationnel"],
            resultat["marge_operationnelle"],
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
            # resultat = calculer_budget_mensuel(exportations, charges, frais_export, employes)
            # budgets_mensuels.append(resultat)
            # inserer_budget_mensuel(connexion, budget_id, m["id"], resultat)

            amortissements = recuperer_amortissements(
                connexion,
                import_id,
                exercice_id,
                m["id"]
            )

            resultat = calculer_budget_mensuel(
                exportations,
                charges,
                frais_export,
                employes,
                amortissements
            )

            budgets_mensuels.append(resultat)

            inserer_budget_mensuel(
                connexion,
                budget_id,
                m["id"],
                resultat
            )

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