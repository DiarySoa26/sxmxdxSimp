"""Convertit la feuille Amortissements en lignes mensuelles, sans site."""
import csv
from pathlib import Path
from openpyxl import load_workbook
MOIS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"]
def normaliser_amortissements(source, destination):
    wb = load_workbook(source, read_only=True, data_only=True)
    try:
        ws = wb["Amortissements"]
        rows = iter(ws.values)
        headers = list(next(rows))
        indices = [(i+1, m, headers.index(m)) for i,m in enumerate(MOIS) if m in headers]
        if len(indices) != 12: raise ValueError("12 mois requis dans Amortissements")
        Path(destination).parent.mkdir(parents=True,exist_ok=True)
        count=0
        with open(destination,"w",newline="",encoding="utf-8") as out:
            w=csv.writer(out)
            w.writerow(["categorie","nature","perimetre_general","unite","mois","numero_mois","montant"])
            for row in rows:
                if not row or len(row)<4 or not row[1]: continue
                for num,month,idx in indices:
                    value=row[idx] if idx<len(row) else None
                    if value is None: continue
                    if not isinstance(value,(int,float)):
                        raise ValueError(f"Amortissement non numérique : {row[1]} / {month}")
                    w.writerow([row[0],row[1],row[2],row[3],month,num,value]);count+=1
        return count
    finally: wb.close()
if __name__=="__main__":
    import sys
    print(normaliser_amortissements(sys.argv[1],sys.argv[2]))
