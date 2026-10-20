from pathlib import Path
from openpyxl import load_workbook
from openpyxl.formula.tokenizer import Tokenizer
from openpyxl.utils import get_column_letter
import csv
import re
import sys

from re_commun import (
    lire_arguments, dossier_sortie, verifier_fichier_excel,
    texte_formule, feuilles_lisibles,
)

# Cellule, plage, colonne entière (A:A) ou ligne entière (1:1)
FORME_REFERENCE = re.compile(
    r"^([A-Z]{1,3}\d+(:[A-Z]{1,3}\d+)?|[A-Z]{1,3}:[A-Z]{1,3}|\d+:\d+)$",
    re.IGNORECASE
)


def nettoyer_reference(valeur):
    """
    Ex:
    'Exportations'!$N$20 -> Exportations!N20
    """
    valeur = valeur.replace("$", "")
    valeur = valeur.replace("'", "")
    return valeur


# ------------------------------------------------------------
# NOMS DEFINIS ET TABLEAUX STRUCTURES
# ------------------------------------------------------------

def collecter_noms(wb):
    """{NOM_EN_MAJUSCULES: [(feuille, plage), ...]} pour les noms définis du classeur."""
    noms = {}
    try:
        for nom, defn in wb.defined_names.items():
            destinations = []
            try:
                for feuille, plage in defn.destinations:
                    destinations.append((feuille, plage.replace("$", "")))
            except Exception:
                pass
            if destinations:
                noms[nom.upper()] = destinations
    except Exception:
        pass
    return noms


def collecter_tableaux(wb):
    """{NOM_TABLEAU: (feuille, ligne_en_tete, derniere_ligne, premiere_col, {colonne: lettre})}"""
    tableaux = {}
    for ws in feuilles_lisibles(wb):
        for table in getattr(ws, "tables", {}).values():
            try:
                nom = table.displayName or table.name
                debut, fin = table.ref.split(":")
                col1 = re.match(r"[A-Z]+", debut).group(0)
                ligne1 = int(re.search(r"\d+", debut).group(0))
                ligne2 = int(re.search(r"\d+", fin).group(0))
                from openpyxl.utils import column_index_from_string
                idx1 = column_index_from_string(col1)
                colonnes = {
                    c.name.upper(): get_column_letter(idx1 + i)
                    for i, c in enumerate(table.tableColumns)
                }
                tableaux[nom.upper()] = (ws.title, ligne1, ligne2, colonnes, table.ref.replace("$", ""))
            except Exception:
                continue
    return tableaux


def resoudre_operande(valeur, feuille_courante, noms, tableaux):
    """Retourne [(feuille_source, cellule_source)] pour une opérande de formule."""
    valeur = nettoyer_reference(valeur)

    # Tableau structuré : Table1[Colonne] / Table1[[#This Row],[Colonne]]
    base = re.split(r"\[", valeur, maxsplit=1)[0].upper()
    if base in tableaux:
        feuille, ligne1, ligne2, colonnes, ref = tableaux[base]
        nom_col = re.findall(r"\[([^\[\]#]+)\]", valeur)
        if nom_col and nom_col[-1].upper() in colonnes:
            lettre = colonnes[nom_col[-1].upper()]
            return [(feuille, f"{lettre}{ligne1 + 1}:{lettre}{ligne2}")]
        return [(feuille, ref)]

    if "!" in valeur:
        feuille_source, cellule_source = valeur.rsplit("!", 1)
    else:
        feuille_source, cellule_source = feuille_courante, valeur

    if FORME_REFERENCE.match(cellule_source):
        return [(feuille_source, cellule_source)]

    # Nom défini
    if cellule_source.upper() in noms:
        return list(noms[cellule_source.upper()])

    return []


def extraire_references(formule, feuille_courante, noms=None, tableaux=None):
    references = []
    noms = noms or {}
    tableaux = tableaux or {}

    try:
        tokens = Tokenizer(formule).items

        for token in tokens:
            if token.type == "OPERAND" and token.subtype == "RANGE":
                for feuille_source, cellule_source in resoudre_operande(
                    token.value, feuille_courante, noms, tableaux
                ):
                    ref = {
                        "feuille_source": feuille_source,
                        "cellule_source": cellule_source
                    }
                    if ref not in references:
                        references.append(ref)

    except Exception as e:
        print(f"[ATTENTION] Formule non analysée : {formule} -> {e}")

    return references


def analyser_dependances(chemin_fichier):

    fichier = verifier_fichier_excel(chemin_fichier)
    OUTPUT_DIR = dossier_sortie()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print("\n" + "=" * 75)
    print("SXMXDX - ANALYSE DES DEPENDANCES")
    print("=" * 75)

    wb = load_workbook(fichier, data_only=False)

    noms = collecter_noms(wb)
    tableaux = collecter_tableaux(wb)
    if noms:
        print(f"Noms définis détectés : {len(noms)}")
    if tableaux:
        print(f"Tableaux structurés détectés : {len(tableaux)}")

    dependances = []

    for ws in feuilles_lisibles(wb):

        compteur = 0

        for row in ws.iter_rows():
            for cell in row:

                formule = texte_formule(cell.value)
                if not formule:
                    continue

                for ref in extraire_references(formule, ws.title, noms, tableaux):
                    dependances.append({
                        "feuille_destination": ws.title,
                        "cellule_destination": cell.coordinate,
                        "feuille_source": ref["feuille_source"],
                        "cellule_source": ref["cellule_source"],
                        "formule": formule
                    })
                    compteur += 1

        print(f"{ws.title:<25} : {compteur} dépendance(s)")

    wb.close()

    sortie = OUTPUT_DIR / "dependances.csv"

    with open(sortie, "w", newline="", encoding="utf-8") as f:
        champs = ["feuille_destination", "cellule_destination",
                  "feuille_source", "cellule_source", "formule"]
        writer = csv.DictWriter(f, fieldnames=champs)
        writer.writeheader()
        writer.writerows(dependances)

    print("\n" + "-" * 75)
    print(f"Total dépendances : {len(dependances)}")
    print(f"[OK] Généré : {sortie}")


if __name__ == "__main__":

    args = lire_arguments()

    if len(args) != 1:
        print("Utilisation : python analyser_dependances.py <fichier_excel> "
              "[--sortie DOSSIER] [--config FICHIER.json]")
        sys.exit(1)

    try:
        analyser_dependances(args[0])
    except Exception as e:
        print(f"[ERREUR] {e}")
        sys.exit(1)
