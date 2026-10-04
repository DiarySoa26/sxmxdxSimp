from pathlib import Path
import subprocess
import sys
import time
import pandas as pd

BASE=Path(__file__).resolve().parent
OUTPUT_DIR=BASE/"output"

ETAPES=[
    ("Construction du dataset",BASE/"construire_dataset.py"),
    ("Préparation du dataset ML",BASE/"prediction"/"preparer_dataset.py"),
    ("Backtest des modèles",BASE/"prediction"/"tester_modeles.py"),
    ("Prédiction budgétaire",BASE/"prediction"/"predire_budget.py"),
    ("Prédiction charges par catégorie",BASE/"prediction"/"predire_charges_categories.py"),
    ("Détection des dérives",BASE/"prediction"/"detecter_derives_categories.py"),
    ("Génération du résumé",BASE/"prediction"/"generer_resume_analyse.py")
    # ("Enregistrement PostgreSQL",BASE/"prediction"/"enregistrer_prediction.py")
]

def executer_etape(numero,nom,script):
    print("\n"+"="*80)
    print(f"[ETAPE {numero}/{len(ETAPES)}] {nom}")
    print("="*80)

    resultat=subprocess.run(
        [sys.executable,str(script)],
        cwd=str(BASE),
        capture_output=True,
        text=True
    )

    if resultat.stdout:
        print(resultat.stdout)

    if resultat.returncode!=0:
        if resultat.stderr:
            print(resultat.stderr)
        raise RuntimeError(f"Echec étape {numero} - {nom}\n{resultat.stderr}")

def lire_resultats():
    dataset=pd.read_csv(OUTPUT_DIR/"dataset_ml.csv")
    annee_reference=int(dataset["annee"].max())
    annee_prediction=annee_reference+1

    annuel=pd.read_csv(OUTPUT_DIR/f"prediction_budget_{annee_prediction}_annuel.csv")

    a=annuel.iloc[0]

    evolutions=[
        {"indicateur":"VENTES","evolution_pct":float(a["evolution_ventes_pct"])},
        {"indicateur":"CA_EXPORT","evolution_pct":float(a["evolution_ca_pct"])},
        {"indicateur":"PRODUCTION","evolution_pct":float(a["evolution_production_pct"])},
        {"indicateur":"CHARGES_EXPLOITATION","evolution_pct":float(a["evolution_charges_pct"])},
        {"indicateur":"FRAIS_EXPORT","evolution_pct":float(a["evolution_frais_export_pct"])},
        {"indicateur":"MASSE_SALARIALE","evolution_pct":float(a["evolution_masse_salariale_pct"])}
    ]

    mensuel=pd.read_csv(OUTPUT_DIR/f"prediction_budget_{annee_prediction}_mensuel.csv")
    derives=pd.read_csv(OUTPUT_DIR/f"derives_categories_{annee_prediction}.csv")

    with open(OUTPUT_DIR/f"resume_analyse_{annee_prediction}.txt","r",encoding="utf-8") as f:
        resume=f.read()

    return {
        "annee_reference":annee_reference,
        "annee_prediction":annee_prediction,
        "budget_annuel":annuel.to_dict(orient="records")[0],
        "budget_mensuel":mensuel.to_dict(orient="records"),
        "evolutions":evolutions,
        "derives":derives.to_dict(orient="records"),
        "resume":resume
    }

def executer_prediction():
    print("\n"+"="*80)
    print("SXMXDX - PIPELINE COMPLET DE PREDICTION")
    print("="*80)

    debut=time.time()

    for numero,(nom,script) in enumerate(ETAPES,start=1):
        if not script.exists():
            raise FileNotFoundError(f"Script introuvable : {script}")
        executer_etape(numero,nom,script)

    resultats=lire_resultats()
    resultats["duree_secondes"]=round(time.time()-debut,2)

    print("\n"+"="*80)
    print("PREDICTION TERMINEE")
    print("="*80)
    print(f"Référence  : {resultats['annee_reference']}")
    print(f"Prévision  : {resultats['annee_prediction']}")
    print(f"Durée      : {resultats['duree_secondes']}s")
    print("="*80)

    return resultats

if __name__=="__main__":
    try:
        executer_prediction()
    except Exception as e:
        print(f"\n[ERREUR] {e}")
        sys.exit(1)