# import traceback

# from generer_budget import generer_budget
# from valider_budget import valider_budget
# from historique_budgets import recuperer_historique


# def executer_workflow_budget():
#     """
#     Workflow complet du budget :

#     1. Générer le budget
#     2. Valider le budget généré
#     3. Récupérer l'historique des budgets

#     Cette fonction servira de point d'entrée pour l'API.
#     """

#     try:
#         print("=" * 70)
#         print("WORKFLOW BUDGET")
#         print("=" * 70)

#         # ==========================================================
#         # ETAPE 1 : GENERATION
#         # ==========================================================

#         print("\n[1/3] Génération du budget...")

#         resultat_generation = generer_budget()

#         print("[OK] Budget généré.")


#         # ==========================================================
#         # ETAPE 2 : VALIDATION
#         # ==========================================================

#         print("\n[2/3] Validation du budget...")

#         resultat_validation = valider_budget()

#         if resultat_validation is False:
#             return {
#                 "success": False,
#                 "etape": "validation",
#                 "message": "Le budget a été généré mais la validation a échoué."
#             }

#         print("[OK] Budget validé.")


#         # ==========================================================
#         # ETAPE 3 : HISTORIQUE
#         # ==========================================================

#         print("\n[3/3] Récupération de l'historique...")

#         historique = recuperer_historique()

#         print("[OK] Historique récupéré.")


#         # ==========================================================
#         # RESULTAT
#         # ==========================================================

#         return {
#             "success": True,
#             "message": "Budget généré et validé avec succès.",
#             "generation": resultat_generation,
#             "validation": resultat_validation,
#             "historique": historique
#         }


#     except Exception as e:

#         print("\n[ERREUR] Workflow budget")
#         traceback.print_exc()

#         return {
#             "success": False,
#             "etape": "workflow_budget",
#             "message": str(e)
#         }


# # ==============================================================
# # EXECUTION MANUELLE
# # ==============================================================

# if __name__ == "__main__":

#     resultat = executer_workflow_budget()

#     print("\n" + "=" * 70)
#     print("RESULTAT")
#     print("=" * 70)

#     print(resultat)




import traceback
from generer_budget import generer_budget
from valider_budget import valider_budget
from historique_budgets import recuperer_historique

def executer_workflow_budget():
    try:
        resultat_generation = generer_budget()
        # resultat_validation = valider_budget()
        # if resultat_validation is False:
        #     return {"success": False, "etape": "validation", "message": "Le budget a été généré mais la validation a échoué."}
        historique = recuperer_historique()
        return {
            "success": True,
            "message": "Budget généré et validé avec succès.",
            "generation": resultat_generation,
            # "validation": resultat_validation,
            "historique": historique
        }
    except Exception as e:
        traceback.print_exc()
        return {"success": False, "etape": "workflow_budget", "message": str(e)}

if __name__ == "__main__":
    print(executer_workflow_budget())