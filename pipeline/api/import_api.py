# from flask import Flask, request, jsonify
# import subprocess
# import os

# app = Flask(__name__)

# IMPORT_SCRIPT = "/app/pipeline/importation/importer_exercice.py"
# DATA_DIRECTORY = "/app/data"


# @app.post("/import")
# def importer():

#     data = request.get_json(silent=True) or {}

#     file_path = data.get("filePath")

#     if not file_path:
#         return jsonify({
#             "success": False,
#             "message": "Le chemin du fichier est obligatoire."
#         }), 400

#     file_path = os.path.abspath(file_path)

#     # Le fichier doit obligatoirement se trouver dans /app/data
#     if not file_path.startswith(DATA_DIRECTORY + "/"):
#         return jsonify({
#             "success": False,
#             "message": "Chemin du fichier non autorisé."
#         }), 400

#     if not os.path.isfile(file_path):
#         return jsonify({
#             "success": False,
#             "message": f"Fichier introuvable : {file_path}"
#         }), 404

#     if not file_path.lower().endswith((".xlsx", ".xlsm")):
#         return jsonify({
#             "success": False,
#             "message": "Format de fichier non autorisé."
#         }), 400

#     if not os.path.isfile(IMPORT_SCRIPT):
#         return jsonify({
#             "success": False,
#             "message": f"Script introuvable : {IMPORT_SCRIPT}"
#         }), 500

#     try:

#         process = subprocess.run(
#             [
#                 "python3",
#                 IMPORT_SCRIPT,
#                 file_path
#             ],
#             capture_output=True,
#             text=True,
#             timeout=1800
#         )

#         if process.returncode != 0:

#             return jsonify({
#                 "success": False,
#                 "message": "Le workflow d'importation a échoué.",
#                 "output": process.stdout,
#                 "error": process.stderr
#             }), 500

#         return jsonify({
#             "success": True,
#             "message": "Importation terminée avec succès.",
#             "filePath": file_path,
#             "output": process.stdout
#         })

#     except subprocess.TimeoutExpired:

#         return jsonify({
#             "success": False,
#             "message": "Le traitement a dépassé le temps maximal autorisé."
#         }), 504

#     except Exception as e:

#         return jsonify({
#             "success": False,
#             "message": str(e)
#         }), 500


# if __name__ == "__main__":
#     app.run(
#         host="0.0.0.0",
#         port=5000
#     )



# from flask import Flask,request,jsonify
# from pathlib import Path
# import subprocess
# import os
# import sys
# import traceback

# app=Flask(__name__)

# IMPORT_SCRIPT="/app/pipeline/importation/importer_exercice.py"
# DATA_DIRECTORY="/app/data"
# PREDICTION_DIRECTORY="/app/pipeline/prediction"

# if PREDICTION_DIRECTORY not in sys.path:
#     sys.path.insert(0,PREDICTION_DIRECTORY)

# from executer_prediction import executer_prediction

# @app.get("/health")
# def health():
#     return jsonify({
#         "success":True,
#         "service":"SXMXDX Python API",
#         "importation":True,
#         "prediction":True
#     }),200

# @app.post("/import")
# def importer():
#     data=request.get_json(silent=True) or {}
#     file_path=data.get("filePath")

#     if not file_path:
#         return jsonify({"success":False,"message":"Le chemin du fichier est obligatoire."}),400

#     file_path=os.path.abspath(file_path)

#     if not file_path.startswith(DATA_DIRECTORY+"/"):
#         return jsonify({"success":False,"message":"Chemin du fichier non autorisé."}),400

#     if not os.path.isfile(file_path):
#         return jsonify({"success":False,"message":f"Fichier introuvable : {file_path}"}),404

#     if not file_path.lower().endswith((".xlsx",".xlsm")):
#         return jsonify({"success":False,"message":"Format de fichier non autorisé."}),400

#     if not os.path.isfile(IMPORT_SCRIPT):
#         return jsonify({"success":False,"message":f"Script introuvable : {IMPORT_SCRIPT}"}),500

#     try:
#         process=subprocess.run(
#             ["python3",IMPORT_SCRIPT,file_path],
#             capture_output=True,
#             text=True,
#             timeout=1800
#         )

#         if process.returncode!=0:
#             return jsonify({
#                 "success":False,
#                 "message":"Le workflow d'importation a échoué.",
#                 "output":process.stdout,
#                 "error":process.stderr
#             }),500

#         return jsonify({
#             "success":True,
#             "message":"Importation terminée avec succès.",
#             "filePath":file_path,
#             "output":process.stdout
#         }),200

#     except subprocess.TimeoutExpired:
#         return jsonify({
#             "success":False,
#             "message":"Le traitement a dépassé le temps maximal autorisé."
#         }),504
#     except Exception as e:
#         return jsonify({"success":False,"message":str(e)}),500

# @app.post("/api/predictions/generer")
# def generer_prediction():
#     try:
#         resultats=executer_prediction()
#         return jsonify({
#             "success":True,
#             "message":"Prévision budgétaire générée avec succès.",
#             "annee_reference":resultats["annee_reference"],
#             "annee_prediction":resultats["annee_prediction"],
#             "duree_secondes":resultats["duree_secondes"],
#             "budget_annuel":resultats["budget_annuel"],
#             "budget_mensuel":resultats["budget_mensuel"],
#             "evolutions":resultats["evolutions"],
#             "derives":resultats["derives"],
#             "resume":resultats["resume"]
#         }),200
#     except Exception as e:
#         traceback.print_exc()
#         return jsonify({
#             "success":False,
#             "message":"La génération de la prévision a échoué.",
#             "error":str(e)
#         }),500

# if __name__=="__main__":
#     app.run(host="0.0.0.0",port=5000)



from flask import Flask,request,jsonify
import subprocess
import os
import sys
import traceback

app=Flask(__name__)

IMPORT_SCRIPT="/app/pipeline/importation/importer_exercice.py"
DATA_DIRECTORY="/app/data"
PREDICTION_DIRECTORY="/app/pipeline/prediction"
BUDGET_DIRECTORY="/app/pipeline/budget"

for directory in [PREDICTION_DIRECTORY,BUDGET_DIRECTORY]:
    if directory not in sys.path:
        sys.path.insert(0,directory)

from executer_prediction import executer_prediction
from executer_budget import executer_workflow_budget
from executer_prediction import executer_prediction

@app.get("/health")
def health():
    return jsonify({
        "success":True,
        "service":"SXMXDX Python API",
        "importation":True,
        "budget":True,
        "prediction":True
    }),200

@app.post("/import")
def importer():
    data=request.get_json(silent=True) or {}
    file_path=data.get("filePath")

    if not file_path:
        return jsonify({"success":False,"message":"Le chemin du fichier est obligatoire."}),400

    file_path=os.path.abspath(file_path)

    if not file_path.startswith(DATA_DIRECTORY+"/"):
        return jsonify({"success":False,"message":"Chemin du fichier non autorisé."}),400

    if not os.path.isfile(file_path):
        return jsonify({"success":False,"message":f"Fichier introuvable : {file_path}"}),404

    if not file_path.lower().endswith((".xlsx",".xlsm")):
        return jsonify({"success":False,"message":"Format de fichier non autorisé."}),400

    if not os.path.isfile(IMPORT_SCRIPT):
        return jsonify({"success":False,"message":f"Script introuvable : {IMPORT_SCRIPT}"}),500

    try:
        process=subprocess.run(
            ["python3",IMPORT_SCRIPT,file_path],
            capture_output=True,
            text=True,
            timeout=1800
        )

        if process.returncode!=0:
            return jsonify({
                "success":False,
                "message":"Le workflow d'importation a échoué.",
                "output":process.stdout,
                "error":process.stderr
            }),500

        return jsonify({
            "success":True,
            "message":"Importation terminée avec succès.",
            "filePath":file_path,
            "output":process.stdout
        }),200

    except subprocess.TimeoutExpired:
        return jsonify({
            "success":False,
            "message":"Le traitement a dépassé le temps maximal autorisé."
        }),504
    except Exception as e:
        return jsonify({"success":False,"message":str(e)}),500

@app.post("/api/budgets/generer")
def generer_budget():
    try:
        resultat=executer_workflow_budget()
        if not resultat["success"]:
            return jsonify(resultat),400
        return jsonify(resultat),200
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            "success":False,
            "message":"La génération du budget a échoué.",
            "error":str(e)
        }),500

@app.post("/api/predictions/generer")
def generer_prediction():
    try:
        resultats=executer_prediction()
        return jsonify({
            "success":True,
            "message":"Prévision budgétaire générée avec succès.",
            "annee_reference":resultats["annee_reference"],
            "annee_prediction":resultats["annee_prediction"],
            "duree_secondes":resultats["duree_secondes"],
            "budget_annuel":resultats["budget_annuel"],
            "budget_mensuel":resultats["budget_mensuel"],
            "evolutions":resultats["evolutions"],
            "derives":resultats["derives"],
            "resume":resultats["resume"]
        }),200
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            "success":False,
            "message":"La génération de la prévision a échoué.",
            "error":str(e)
        }),500


# @app.route("/api/predictions/generer", methods=["POST"])
# def generer_prediction_previsionnelle():
#     try:
#         print("[PREDICTION] Démarrage du pipeline...")

#         resultats = executer_prediction()

#         return jsonify({
#             "success": True,
#             "message": "Prédiction générée avec succès.",
#             "resultats": resultats
#         }), 200

#     except Exception as e:
#         print("[PREDICTION] ERREUR")
#         traceback.print_exc()

#         return jsonify({
#             "success": False,
#             "message": str(e)
#         }), 500

if __name__=="__main__":
    app.run(host="0.0.0.0",port=5000)