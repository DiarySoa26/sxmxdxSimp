# from flask import Flask, request, jsonify
# import subprocess
# import os

# app = Flask(__name__)

# IMPORT_SCRIPT = "/pipeline/importation/importer_exercice.py"


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

#     if not file_path.startswith("/data/"):
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
#                 "python",
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




from flask import Flask, request, jsonify
import subprocess
import os

app = Flask(__name__)

IMPORT_SCRIPT = "/app/pipeline/importation/importer_exercice.py"
DATA_DIRECTORY = "/app/data"


@app.post("/import")
def importer():

    data = request.get_json(silent=True) or {}

    file_path = data.get("filePath")

    if not file_path:
        return jsonify({
            "success": False,
            "message": "Le chemin du fichier est obligatoire."
        }), 400

    file_path = os.path.abspath(file_path)

    # Le fichier doit obligatoirement se trouver dans /app/data
    if not file_path.startswith(DATA_DIRECTORY + "/"):
        return jsonify({
            "success": False,
            "message": "Chemin du fichier non autorisé."
        }), 400

    if not os.path.isfile(file_path):
        return jsonify({
            "success": False,
            "message": f"Fichier introuvable : {file_path}"
        }), 404

    if not file_path.lower().endswith((".xlsx", ".xlsm")):
        return jsonify({
            "success": False,
            "message": "Format de fichier non autorisé."
        }), 400

    if not os.path.isfile(IMPORT_SCRIPT):
        return jsonify({
            "success": False,
            "message": f"Script introuvable : {IMPORT_SCRIPT}"
        }), 500

    try:

        process = subprocess.run(
            [
                "python3",
                IMPORT_SCRIPT,
                file_path
            ],
            capture_output=True,
            text=True,
            timeout=1800
        )

        if process.returncode != 0:

            return jsonify({
                "success": False,
                "message": "Le workflow d'importation a échoué.",
                "output": process.stdout,
                "error": process.stderr
            }), 500

        return jsonify({
            "success": True,
            "message": "Importation terminée avec succès.",
            "filePath": file_path,
            "output": process.stdout
        })

    except subprocess.TimeoutExpired:

        return jsonify({
            "success": False,
            "message": "Le traitement a dépassé le temps maximal autorisé."
        }), 504

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000
    )









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
#     annee = data.get("annee")

#     if not file_path:
#         return jsonify({
#             "success": False,
#             "message": "Le chemin du fichier est obligatoire."
#         }), 400


#     if annee is None:
#         return jsonify({
#             "success": False,
#             "message": "L'année de l'exercice est obligatoire."
#         }), 400

#     try:
#         annee = int(annee)
#     except (TypeError, ValueError):
#         return jsonify({
#             "success": False,
#             "message": "L'année de l'exercice est invalide."
#         }), 400


#     file_path = os.path.abspath(file_path)

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
#                 file_path,
#                 str(annee)
#             ],
#             capture_output=True,
#             text=True,
#             timeout=1800
#         )

#         if process.returncode != 0:

#             return jsonify({
#                 "success": False,
#                 "message": "Le workflow d'importation a échoué.",
#                 "annee": annee,
#                 "filePath": file_path,
#                 "output": process.stdout,
#                 "error": process.stderr
#             }), 500

#         return jsonify({
#             "success": True,
#             "message": "Importation terminée avec succès.",
#             "annee": annee,
#             "filePath": file_path,
#             "output": process.stdout
#         }), 200

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