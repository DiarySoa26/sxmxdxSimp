"""Charge les amortissements mensuels en PostgreSQL sans modifier les endpoints."""
import csv
from decimal import Decimal, InvalidOperation
from pathlib import Path
import psycopg2
from pipeline.importation.creer_import import DB_CONFIG

SQL = """INSERT INTO amortissement_mensuel
(import_id, exercice_id, categorie, nature, perimetre_general, unite, mois, montant)
VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
ON CONFLICT (import_id, nature, mois) DO UPDATE SET
exercice_id=EXCLUDED.exercice_id,
categorie=EXCLUDED.categorie,
perimetre_general=EXCLUDED.perimetre_general,
unite=EXCLUDED.unite,
montant=EXCLUDED.montant"""

def charger_amortissements(chemin_csv, import_id, exercice_id):
    with Path(chemin_csv).open(encoding="utf-8", newline="") as f:
        donnees = list(csv.DictReader(f))
    if not donnees:
        raise ValueError("Aucun amortissement dans le CSV")
    cles = set()
    valeurs = []
    for r in donnees:
        mois = int(r["numero_mois"])
        if mois not in range(1, 13):
            raise ValueError(f"Mois invalide: {mois}")
        nature = r["nature"].strip()
        if not nature:
            raise ValueError("Nature vide")
        cle = (nature, mois)
        if cle in cles:
            raise ValueError(f"Amortissement dupliqué: {cle}")
        cles.add(cle)
        montant = Decimal(r["montant"]).quantize(Decimal("0.0001"))
        valeurs.append((import_id, exercice_id, r["categorie"], nature,
                        r["perimetre_general"] or None, r["unite"], mois, montant))
    with psycopg2.connect(**DB_CONFIG) as connexion:
        with connexion.cursor() as curseur:
            for v in valeurs:
                curseur.execute(SQL, v)
    return len(valeurs)
