from pathlib import Path
import pandas as pd
from database import get_connection

BASE=Path(__file__).resolve().parent.parent
OUTPUT_DIR=BASE/"output"
dataset=pd.read_csv(OUTPUT_DIR/"dataset_ml.csv")
ANNEE_REFERENCE=int(dataset["annee"].max())
ANNEE_PREDICTION=ANNEE_REFERENCE+1

annuel=pd.read_csv(OUTPUT_DIR/f"prediction_budget_{ANNEE_PREDICTION}_annuel.csv").iloc[0]
mensuel=pd.read_csv(OUTPUT_DIR/f"prediction_budget_{ANNEE_PREDICTION}_mensuel.csv")

if len(mensuel)!=12:
    raise ValueError(f"La prédiction doit contenir 12 mois. Nombre trouvé : {len(mensuel)}")

conn=None
try:
    conn=get_connection()
    conn.autocommit=False
    with conn.cursor() as cur:
        cur.execute("SELECT id FROM exercice WHERE annee=%s",(ANNEE_PREDICTION,))
        row=cur.fetchone()
        if row:
            exercice_id=row[0]
            print(f"[OK] Exercice {ANNEE_PREDICTION} existant (id={exercice_id})")
        else:
            cur.execute("INSERT INTO exercice (annee) VALUES (%s) RETURNING id",(ANNEE_PREDICTION,))
            exercice_id=cur.fetchone()[0]
            print(f"[OK] Exercice {ANNEE_PREDICTION} créé (id={exercice_id})")

        cur.execute("""
            INSERT INTO budget (
                exercice_id,import_id,type_budget,statut,ca_export,
                charges_exploitation,frais_export,masse_salariale,
                resultat_operationnel,marge_operationnelle,
                annee_reference,modele,version_modele
            )
            VALUES (%s,NULL,'PREVISIONNEL','GENERE',%s,%s,%s,%s,%s,%s,%s,'REGRESSION_LINEAIRE','1.0')
            RETURNING id
        """,(
            exercice_id,float(annuel["ca_export"]),
            float(annuel["charges_exploitation"]),float(annuel["frais_export"]),
            float(annuel["masse_salariale"]),float(annuel["resultat_operationnel"]),
            float(annuel["marge_operationnelle"]),ANNEE_REFERENCE
        ))
        budget_id=cur.fetchone()[0]
        print(f"[OK] Budget PREVISIONNEL créé (id={budget_id})")

        sql_mensuel="""
            INSERT INTO budget_mensuel (
                budget_id,mois_id,ventes,ca_export,production,
                charges_exploitation,frais_export,masse_salariale,
                resultat_operationnel,marge_operationnelle
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """
        for _,ligne in mensuel.iterrows():
            cur.execute(sql_mensuel,(
                budget_id,int(ligne["mois"]),float(ligne["ventes"]),
                float(ligne["ca_export"]),float(ligne["production_reelle"]),
                float(ligne["charges_exploitation"]),float(ligne["frais_export"]),
                float(ligne["masse_salariale"]),float(ligne["resultat_operationnel"]),
                float(ligne["marge_operationnelle"])
            ))

    conn.commit()
    print("="*70)
    print("PREDICTION ENREGISTREE EN BASE")
    print("="*70)
    print(f"Année référence  : {ANNEE_REFERENCE}")
    print(f"Année prédiction : {ANNEE_PREDICTION}")
    print(f"Exercice ID      : {exercice_id}")
    print(f"Budget ID        : {budget_id}")
    print("Type             : PREVISIONNEL")
    print("Statut           : GENERE")
    print(f"Mois enregistrés : {len(mensuel)}")
except Exception:
    if conn: conn.rollback()
    print("[ERREUR] Insertion annulée.")
    raise
finally:
    if conn: conn.close()