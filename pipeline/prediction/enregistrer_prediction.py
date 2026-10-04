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
derives=pd.read_csv(OUTPUT_DIR/f"derives_categories_{ANNEE_PREDICTION}.csv")

with open(OUTPUT_DIR/f"resume_analyse_{ANNEE_PREDICTION}.txt","r",encoding="utf-8") as f:
    resume=f.read()

if len(mensuel)!=12:
    raise ValueError(f"12 mois attendus, {len(mensuel)} trouvés.")

conn=None
try:
    conn=get_connection()
    conn.autocommit=False

    with conn.cursor() as cur:
        # 1. Exercice prévisionnel
        cur.execute("SELECT id FROM exercice WHERE annee=%s",(ANNEE_PREDICTION,))
        row=cur.fetchone()
        if row:
            exercice_id=row[0]
        else:
            cur.execute("INSERT INTO exercice (annee) VALUES (%s) RETURNING id",(ANNEE_PREDICTION,))
            exercice_id=cur.fetchone()[0]

        # 2. Budget annuel
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

        # 3. Budget mensuel
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

        # 4. Evolutions en %
        evolutions=[
            ("VENTES","ventes","evolution_ventes_pct"),
            ("CA_EXPORT","ca_export","evolution_ca_pct"),
            ("PRODUCTION","production","evolution_production_pct"),
            ("CHARGES_EXPLOITATION","charges_exploitation","evolution_charges_pct"),
            ("FRAIS_EXPORT","frais_export","evolution_frais_export_pct"),
            ("MASSE_SALARIALE","masse_salariale","evolution_masse_salariale_pct")
        ]

        for indicateur,colonne,colonne_pct in evolutions:
            valeur_prediction=float(annuel[colonne])
            evolution_pct=float(annuel[colonne_pct])
            valeur_reference=None
            if evolution_pct!=-100:
                valeur_reference=valeur_prediction/(1+(evolution_pct/100))

            cur.execute("""
                INSERT INTO prediction_evolution (
                    budget_id,indicateur,valeur_reference,
                    valeur_prediction,evolution_pct
                ) VALUES (%s,%s,%s,%s,%s)
            """,(budget_id,indicateur,valeur_reference,valeur_prediction,evolution_pct))

        # 5. Dérives
        for _,d in derives.iterrows():
            cur.execute("""
                INSERT INTO prediction_derive (
                    budget_id,mois_id,categorie,charge_prevue,
                    charge_attendue,ecart_mga,ecart_pct,
                    score_derive,indice_derive,niveau_risque,type_derive
                ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """,(
                budget_id,int(d["mois"]),str(d["categorie"]),
                float(d["charge_prevue"]),float(d["charge_attendue"]),
                float(d["ecart_mga"]),float(d["ecart_pct"]),
                float(d["score_derive"]),float(d["indice_derive"]),
                str(d["niveau_risque"]),str(d["type_derive"])
            ))

        # 6. Résumé textuel
        cur.execute("""
            INSERT INTO prediction_analyse (budget_id,resume)
            VALUES (%s,%s)
        """,(budget_id,resume))

    conn.commit()

    print("="*70)
    print("PREDICTION ENREGISTREE")
    print("="*70)
    print(f"Budget ID        : {budget_id}")
    print(f"Année référence  : {ANNEE_REFERENCE}")
    print(f"Année prédiction : {ANNEE_PREDICTION}")
    print(f"Mois             : {len(mensuel)}")
    print(f"Dérives          : {len(derives)}")
    print(f"Résumé           : {len(resume)} caractères")
    print("="*70)

except Exception:
    if conn:
        conn.rollback()
    print("[ERREUR] Transaction annulée.")
    raise
finally:
    if conn:
        conn.close()