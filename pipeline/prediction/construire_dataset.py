from pathlib import Path
import pandas as pd
from prediction.database import get_connection

BASE = Path(__file__).resolve().parent
OUTPUT = BASE / "output"
OUTPUT.mkdir(exist_ok=True)
SORTIE = OUTPUT / "dataset_prediction.csv"

print("=" * 80)
print("SXMXDX - CONSTRUCTION DATASET DEPUIS POSTGRESQL")
print("=" * 80)

connexion = get_connection()
print("[OK] Connexion PostgreSQL")

# Dernier import de chaque exercice pour éviter de mélanger plusieurs imports.
CTE = """
WITH dernier_import AS (
    SELECT DISTINCT ON (i.exercice_id)
           i.id AS import_id, i.exercice_id, e.annee
    FROM import_fichier i
    JOIN exercice e ON e.id = i.exercice_id
    ORDER BY i.exercice_id, i.date_import DESC, i.id DESC
)
"""

sql_exportation = CTE + """
SELECT di.annee, ex.mois_id AS mois,
       SUM(COALESCE(ex.quantite,0)) AS ventes,
       SUM(COALESCE(ex.ca_mga,0)) AS ca_export
FROM dernier_import di
JOIN exportation ex ON ex.import_id=di.import_id AND ex.exercice_id=di.exercice_id
GROUP BY di.annee, ex.mois_id
ORDER BY di.annee, ex.mois_id
"""

sql_production = CTE + """
SELECT di.annee, p.mois_id AS mois,
       SUM(COALESCE(p.production_reelle,0)) AS production_reelle
FROM dernier_import di
JOIN production p ON p.import_id=di.import_id AND p.exercice_id=di.exercice_id
GROUP BY di.annee, p.mois_id
ORDER BY di.annee, p.mois_id
"""

sql_charge = CTE + """
SELECT di.annee, c.mois_id AS mois,
       SUM(COALESCE(c.montant,0)) AS charges_exploitation
FROM dernier_import di
JOIN charge c ON c.import_id=di.import_id AND c.exercice_id=di.exercice_id
WHERE UPPER(TRIM(COALESCE(c.categorie,''))) <> 'ADMINISTRATION'
GROUP BY di.annee, c.mois_id
ORDER BY di.annee, c.mois_id
"""

sql_frais = CTE + """
SELECT di.annee, f.mois_id AS mois,
       SUM(COALESCE(f.total,0)) AS frais_export
FROM dernier_import di
JOIN frais_export f ON f.import_id=di.import_id AND f.exercice_id=di.exercice_id
GROUP BY di.annee, f.mois_id
ORDER BY di.annee, f.mois_id
"""

sql_salaires = CTE + """
SELECT di.annee, SUM(COALESCE(emp.cout_total,0)) AS masse_salariale
FROM dernier_import di
JOIN employe emp ON emp.import_id=di.import_id
GROUP BY di.annee
ORDER BY di.annee
"""

exportation = pd.read_sql(sql_exportation, connexion)
production  = pd.read_sql(sql_production, connexion)
charges     = pd.read_sql(sql_charge, connexion)
frais       = pd.read_sql(sql_frais, connexion)
salaires    = pd.read_sql(sql_salaires, connexion)
connexion.close()

print(f"[OK] Exportations : {len(exportation)} mois")
print(f"[OK] Production   : {len(production)} mois")
print(f"[OK] Charges      : {len(charges)} mois")
print(f"[OK] Frais export : {len(frais)} mois")
print(f"[OK] Salaires     : {len(salaires)} exercice(s)")

dataset = exportation.merge(production, on=["annee","mois"], how="inner")
dataset = dataset.merge(charges, on=["annee","mois"], how="inner")
dataset = dataset.merge(frais, on=["annee","mois"], how="inner")
dataset = dataset.merge(salaires, on="annee", how="left")

colonnes = ["ventes","ca_export","production_reelle","charges_exploitation","frais_export","masse_salariale"]
for c in colonnes: dataset[c] = pd.to_numeric(dataset[c], errors="coerce")

dataset["resultat_operationnel"] = dataset["ca_export"]-dataset["charges_exploitation"]-dataset["frais_export"]-dataset["masse_salariale"]
dataset["marge_operationnelle"] = dataset["resultat_operationnel"]/dataset["ca_export"].replace(0,pd.NA)
dataset = dataset.sort_values(["annee","mois"]).reset_index(drop=True)

print("\n" + "=" * 80)
print("VERIFICATION")
print("=" * 80)
print(f"Période             : {dataset['annee'].min()} -> {dataset['annee'].max()}")
print(f"Nombre observations : {len(dataset)}")
print("\nMois par année :")
print(dataset.groupby("annee")["mois"].nunique())
print("\nValeurs manquantes :")
print(dataset.isna().sum())

pd.set_option("display.float_format", lambda x: f"{x:,.2f}")
print("\nAperçu :")
print(dataset.head(12).to_string(index=False))

dataset.to_csv(SORTIE,index=False)
print(f"\n[OK] Dataset créé : {SORTIE}")