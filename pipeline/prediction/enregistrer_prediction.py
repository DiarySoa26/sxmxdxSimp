# from pathlib import Path
# import pandas as pd
# from database import get_connection

# BASE=Path(__file__).resolve().parent.parent
# OUTPUT_DIR=BASE/"output"

# dataset=pd.read_csv(OUTPUT_DIR/"dataset_ml.csv")
# ANNEE_REFERENCE=int(dataset["annee"].max())
# ANNEE_PREDICTION=ANNEE_REFERENCE+1

# annuel=pd.read_csv(OUTPUT_DIR/f"prediction_budget_{ANNEE_PREDICTION}_annuel.csv").iloc[0]
# mensuel=pd.read_csv(OUTPUT_DIR/f"prediction_budget_{ANNEE_PREDICTION}_mensuel.csv")
# derives=pd.read_csv(OUTPUT_DIR/f"derives_categories_{ANNEE_PREDICTION}.csv")

# with open(OUTPUT_DIR/f"resume_analyse_{ANNEE_PREDICTION}.txt","r",encoding="utf-8") as f:
#     resume=f.read()

# if len(mensuel)!=12:
#     raise ValueError(f"12 mois attendus, {len(mensuel)} trouvés.")

# conn=None
# try:
#     conn=get_connection()
#     conn.autocommit=False

#     with conn.cursor() as cur:
#         # 1. Exercice prévisionnel
#         cur.execute("SELECT id FROM exercice WHERE annee=%s",(ANNEE_PREDICTION,))
#         row=cur.fetchone()
#         if row:
#             exercice_id=row[0]
#         else:
#             cur.execute("INSERT INTO exercice (annee) VALUES (%s) RETURNING id",(ANNEE_PREDICTION,))
#             exercice_id=cur.fetchone()[0]

#         # 2. Budget annuel
#         cur.execute("""
#             INSERT INTO budget (
#                 exercice_id,import_id,type_budget,statut,ca_export,
#                 charges_exploitation,frais_export,masse_salariale,
#                 resultat_operationnel,marge_operationnelle,
#                 annee_reference,modele,version_modele
#             )
#             VALUES (%s,NULL,'PREVISIONNEL','GENERE',%s,%s,%s,%s,%s,%s,%s,'REGRESSION_LINEAIRE','1.0')
#             RETURNING id
#         """,(
#             exercice_id,float(annuel["ca_export"]),
#             float(annuel["charges_exploitation"]),float(annuel["frais_export"]),
#             float(annuel["masse_salariale"]),float(annuel["resultat_operationnel"]),
#             float(annuel["marge_operationnelle"]),ANNEE_REFERENCE
#         ))
#         budget_id=cur.fetchone()[0]

#         # 3. Budget mensuel
#         sql_mensuel="""
#             INSERT INTO budget_mensuel (
#                 budget_id,mois_id,ventes,ca_export,production,
#                 charges_exploitation,frais_export,masse_salariale,
#                 resultat_operationnel,marge_operationnelle
#             ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
#         """
#         for _,ligne in mensuel.iterrows():
#             cur.execute(sql_mensuel,(
#                 budget_id,int(ligne["mois"]),float(ligne["ventes"]),
#                 float(ligne["ca_export"]),float(ligne["production_reelle"]),
#                 float(ligne["charges_exploitation"]),float(ligne["frais_export"]),
#                 float(ligne["masse_salariale"]),float(ligne["resultat_operationnel"]),
#                 float(ligne["marge_operationnelle"])
#             ))

#         # 4. Evolutions en %
#         evolutions=[
#             ("VENTES","ventes","evolution_ventes_pct"),
#             ("CA_EXPORT","ca_export","evolution_ca_pct"),
#             ("PRODUCTION","production","evolution_production_pct"),
#             ("CHARGES_EXPLOITATION","charges_exploitation","evolution_charges_pct"),
#             ("FRAIS_EXPORT","frais_export","evolution_frais_export_pct"),
#             ("MASSE_SALARIALE","masse_salariale","evolution_masse_salariale_pct")
#         ]

#         for indicateur,colonne,colonne_pct in evolutions:
#             valeur_prediction=float(annuel[colonne])
#             evolution_pct=float(annuel[colonne_pct])
#             valeur_reference=None
#             if evolution_pct!=-100:
#                 valeur_reference=valeur_prediction/(1+(evolution_pct/100))

#             cur.execute("""
#                 INSERT INTO prediction_evolution (
#                     budget_id,indicateur,valeur_reference,
#                     valeur_prediction,evolution_pct
#                 ) VALUES (%s,%s,%s,%s,%s)
#             """,(budget_id,indicateur,valeur_reference,valeur_prediction,evolution_pct))

#         # 5. Dérives
#         for _,d in derives.iterrows():
#             cur.execute("""
#                 INSERT INTO prediction_derive (
#                     budget_id,mois_id,categorie,charge_prevue,
#                     charge_attendue,ecart_mga,ecart_pct,
#                     score_derive,indice_derive,niveau_risque,type_derive
#                 ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
#             """,(
#                 budget_id,int(d["mois"]),str(d["categorie"]),
#                 float(d["charge_prevue"]),float(d["charge_attendue"]),
#                 float(d["ecart_mga"]),float(d["ecart_pct"]),
#                 float(d["score_derive"]),float(d["indice_derive"]),
#                 str(d["niveau_risque"]),str(d["type_derive"])
#             ))

#         # 6. Résumé textuel
#         cur.execute("""
#             INSERT INTO prediction_analyse (budget_id,resume)
#             VALUES (%s,%s)
#         """,(budget_id,resume))

#     conn.commit()

#     print("="*70)
#     print("PREDICTION ENREGISTREE")
#     print("="*70)
#     print(f"Budget ID        : {budget_id}")
#     print(f"Année référence  : {ANNEE_REFERENCE}")
#     print(f"Année prédiction : {ANNEE_PREDICTION}")
#     print(f"Mois             : {len(mensuel)}")
#     print(f"Dérives          : {len(derives)}")
#     print(f"Résumé           : {len(resume)} caractères")
#     print("="*70)

# except Exception:
#     if conn:
#         conn.rollback()
#     print("[ERREUR] Transaction annulée.")
#     raise
# finally:
#     if conn:
#         conn.close()






import os
from pathlib import Path
import pandas as pd
import psycopg2

BASE = Path(__file__).resolve().parent
OUTPUT_DIR = BASE / "output"

DB_HOST = os.getenv("DB_HOST", "postgres")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "sxmxdx2")
DB_USER = os.getenv("DB_USER", "sxmxdx")
DB_PASSWORD = os.getenv("DB_PASSWORD", "diary")

MODELE = "REGRESSION"
VERSION_MODELE = "1.0"

def get_connection():
    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )

def valeur(row, colonne, default=0):
    if colonne not in row.index:
        return default
    v = row[colonne]
    if pd.isna(v):
        return default
    return float(v)

def charger_predictions():
    fichiers_annuels = list(OUTPUT_DIR.glob("prediction_budget_*_annuel.csv"))
    if not fichiers_annuels:
        raise FileNotFoundError("Aucun fichier prediction_budget_*_annuel.csv")

    fichier_annuel = max(fichiers_annuels, key=lambda p: p.stat().st_mtime)
    annee_prediction = int(
        fichier_annuel.stem
        .replace("prediction_budget_", "")
        .replace("_annuel", "")
    )

    fichier_mensuel = OUTPUT_DIR / f"prediction_budget_{annee_prediction}_mensuel.csv"
    fichier_categories = OUTPUT_DIR / f"prediction_charges_categories_{annee_prediction}.csv"
    fichier_derives = OUTPUT_DIR / f"derives_categories_{annee_prediction}.csv"
    fichier_resume = OUTPUT_DIR / f"resume_analyse_{annee_prediction}.txt"

    if not fichier_mensuel.exists():
        raise FileNotFoundError(fichier_mensuel)

    annuel = pd.read_csv(fichier_annuel)
    mensuel = pd.read_csv(fichier_mensuel)
    categories = pd.read_csv(fichier_categories) if fichier_categories.exists() else None
    derives = pd.read_csv(fichier_derives) if fichier_derives.exists() else None
    resume = fichier_resume.read_text(encoding="utf-8") if fichier_resume.exists() else None

    print(f"[OK] Annuel : {fichier_annuel}")
    print(f"[OK] Mensuel : {fichier_mensuel}")
    if fichier_categories.exists():
        print(f"[OK] Charges : {fichier_categories}")
    if fichier_derives.exists():
        print(f"[OK] Dérives : {fichier_derives}")
    if fichier_resume.exists():
        print(f"[OK] Résumé : {fichier_resume}")

    return annee_prediction, annuel, mensuel, categories, derives, resume

def obtenir_exercice_id(cursor, annee):
    cursor.execute("SELECT id FROM exercice WHERE annee = %s", (annee,))
    resultat = cursor.fetchone()

    if resultat:
        return resultat[0]

    cursor.execute(
        "INSERT INTO exercice (annee) VALUES (%s) RETURNING id",
        (annee,)
    )
    return cursor.fetchone()[0]

def supprimer_prediction_existante(cursor, exercice_id):
    cursor.execute(
        """
        DELETE FROM budget
        WHERE exercice_id = %s
        AND type_budget = 'PREVISIONNEL'
        """,
        (exercice_id,)
    )

def enregistrer_budget_annuel(cursor, exercice_id, annee_prediction, annuel):
    if annuel.empty:
        raise ValueError("Le fichier annuel est vide.")

    row = annuel.iloc[0]

    cursor.execute(
        """
        INSERT INTO budget (
            exercice_id,
            import_id,
            type_budget,
            statut,
            ca_export,
            charges_exploitation,
            frais_export,
            masse_salariale,
            resultat_operationnel,
            marge_operationnelle,
            annee_reference,
            modele,
            version_modele
        )
        VALUES (
            %s, NULL, 'PREVISIONNEL', 'GENERE',
            %s, %s, %s, %s, %s, %s, %s, %s, %s
        )
        RETURNING id
        """,
        (
            exercice_id,
            valeur(row, "ca_export"),
            valeur(row, "charges_exploitation"),
            valeur(row, "frais_export"),
            valeur(row, "masse_salariale"),
            valeur(row, "resultat_operationnel"),
            valeur(row, "marge_operationnelle"),
            annee_prediction - 1,
            MODELE,
            VERSION_MODELE
        )
    )

    budget_id = cursor.fetchone()[0]
    print(f"[OK] Budget prévisionnel créé : id={budget_id}")
    return budget_id

def enregistrer_budget_mensuel(cursor, budget_id, mensuel):
    nombre = 0

    for _, row in mensuel.iterrows():
        if "mois" in row.index:
            mois_id = int(row["mois"])
        elif "mois_id" in row.index:
            mois_id = int(row["mois_id"])
        else:
            raise ValueError("Colonne mois/mois_id absente du fichier mensuel.")

        ventes = valeur(row, "ventes")
        production = valeur(row, "production_reelle")
        ca_export = valeur(row, "ca_export")
        charges = valeur(row, "charges_exploitation")
        frais = valeur(row, "frais_export")
        masse = valeur(row, "masse_salariale")
        resultat = valeur(row, "resultat_operationnel")

        if "marge_operationnelle" in row.index and not pd.isna(row["marge_operationnelle"]):
            marge = float(row["marge_operationnelle"])
        elif ca_export != 0:
            marge = resultat / ca_export
        else:
            marge = 0

        cursor.execute(
            """
            INSERT INTO budget_mensuel (
                budget_id,
                mois_id,
                ventes,
                production,
                ca_export,
                charges_exploitation,
                frais_export,
                masse_salariale,
                resultat_operationnel,
                marge_operationnelle
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """,
            (
                budget_id,
                mois_id,
                ventes,
                production,
                ca_export,
                charges,
                frais,
                masse,
                resultat,
                marge
            )
        )
        nombre += 1

    print(f"[OK] {nombre} prévisions mensuelles enregistrées.")

def enregistrer_evolutions(cursor, budget_id, annuel):
    if annuel.empty:
        return

    row = annuel.iloc[0]

    correspondances = {
        "VENTES": ("ventes", "evolution_ventes_pct"),
        "CA_EXPORT": ("ca_export", "evolution_ca_pct"),
        "PRODUCTION": ("production", "evolution_production_pct"),
        "CHARGES_EXPLOITATION": ("charges_exploitation", "evolution_charges_pct"),
        "FRAIS_EXPORT": ("frais_export", "evolution_frais_export_pct"),
        "MASSE_SALARIALE": ("masse_salariale", "evolution_masse_salariale_pct")
    }

    nombre = 0

    for indicateur, (colonne_prediction, colonne_evolution) in correspondances.items():
        if colonne_evolution not in row.index:
            continue

        prediction = valeur(row, colonne_prediction)
        evolution = valeur(row, colonne_evolution)
        facteur = 1 + evolution / 100
        reference = prediction / facteur if facteur != 0 else 0

        cursor.execute(
            """
            INSERT INTO prediction_evolution (
                budget_id,
                indicateur,
                valeur_reference,
                valeur_prediction,
                evolution_pct
            )
            VALUES (%s,%s,%s,%s,%s)
            """,
            (
                budget_id,
                indicateur,
                reference,
                prediction,
                evolution
            )
        )
        nombre += 1

    print(f"[OK] {nombre} évolutions enregistrées.")

def enregistrer_derives(cursor, budget_id, derives):
    if derives is None or derives.empty:
        print("[INFO] Aucune dérive à enregistrer.")
        return

    nombre = 0

    for _, row in derives.iterrows():
        if "mois" in row.index:
            mois_id = int(row["mois"])
        elif "mois_id" in row.index:
            mois_id = int(row["mois_id"])
        else:
            continue

        cursor.execute(
            """
            INSERT INTO prediction_derive (
                budget_id,
                mois_id,
                categorie,
                charge_prevue,
                charge_attendue,
                ecart_mga,
                ecart_pct,
                score_derive,
                indice_derive,
                niveau_risque,
                type_derive
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """,
            (
                budget_id,
                mois_id,
                str(row.get("categorie", "INCONNUE")),
                valeur(row, "charge_prevue"),
                valeur(row, "charge_attendue"),
                valeur(row, "ecart_mga"),
                valeur(row, "ecart_pct"),
                valeur(row, "score_derive"),
                valeur(row, "indice_derive"),
                str(row.get("niveau_risque", "")),
                str(row.get("type_derive", ""))
            )
        )
        nombre += 1

    print(f"[OK] {nombre} dérives enregistrées.")

def enregistrer_resume(cursor, budget_id, resume):
    if not resume:
        print("[INFO] Aucun résumé à enregistrer.")
        return

    cursor.execute(
        """
        INSERT INTO prediction_analyse (budget_id, resume)
        VALUES (%s,%s)
        """,
        (budget_id, resume)
    )

    print("[OK] Résumé automatique enregistré.")

def main():
    print("=" * 80)
    print("SXMXDX - ENREGISTREMENT DE LA PREDICTION")
    print("=" * 80)

    annee_prediction, annuel, mensuel, categories, derives, resume = charger_predictions()
    print(f"Année prévisionnelle : {annee_prediction}")

    connexion = None

    try:
        connexion = get_connection()
        cursor = connexion.cursor()

        print("[OK] Connexion PostgreSQL")

        exercice_id = obtenir_exercice_id(cursor, annee_prediction)
        print(f"[OK] exercice_id = {exercice_id}")

        supprimer_prediction_existante(cursor, exercice_id)

        budget_id = enregistrer_budget_annuel(
            cursor,
            exercice_id,
            annee_prediction,
            annuel
        )

        enregistrer_budget_mensuel(cursor, budget_id, mensuel)
        enregistrer_evolutions(cursor, budget_id, annuel)
        enregistrer_derives(cursor, budget_id, derives)
        enregistrer_resume(cursor, budget_id, resume)

        connexion.commit()

        print("=" * 80)
        print("[OK] PREDICTION ENREGISTREE DANS POSTGRESQL")
        print("=" * 80)
        print(f"budget_id : {budget_id}")
        print(f"année : {annee_prediction}")
        print("type_budget : PREVISIONNEL")
        print(f"année référence : {annee_prediction - 1}")

    except Exception as e:
        if connexion:
            connexion.rollback()
        print(f"[ERREUR] {e}")
        raise

    finally:
        if connexion:
            connexion.close()

if __name__ == "__main__":
    main()