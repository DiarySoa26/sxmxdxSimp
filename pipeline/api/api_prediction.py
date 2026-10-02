from flask import Flask, jsonify
from pathlib import Path
import sys
import traceback

PIPELINE_DIR = Path(__file__).resolve().parent.parent
PREDICTION_DIR = PIPELINE_DIR / "prediction"

if str(PREDICTION_DIR) not in sys.path:
    sys.path.insert(0, str(PREDICTION_DIR))

from executer_prediction import executer_prediction

app = Flask(__name__)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "service": "SXMXDX Prediction API",
        "statut": "OK"
    }), 200


@app.route("/api/predictions/generer", methods=["POST"])
def generer_prediction():
    try:
        resultats = executer_prediction()

        return jsonify({
            "succes": True,
            "message": "Prédiction budgétaire générée avec succès.",
            "annee_reference": resultats["annee_reference"],
            "annee_prediction": resultats["annee_prediction"],
            "duree_secondes": resultats["duree_secondes"],
            "budget_annuel": resultats["budget_annuel"],
            "budget_mensuel": resultats["budget_mensuel"],
            "derives": resultats["derives"],
            "resume": resultats["resume"]
        }), 200

    except Exception as e:
        traceback.print_exc()

        return jsonify({
            "succes": False,
            "message": "La génération de la prédiction a échoué.",
            "erreur": str(e)
        }), 500


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5002,
        debug=False
    )