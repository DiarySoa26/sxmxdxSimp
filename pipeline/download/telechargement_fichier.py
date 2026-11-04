import argparse
import re
import shutil
import sys
from pathlib import Path

RACINE_PROJET = Path(__file__).resolve().parents[2]
if str(RACINE_PROJET) not in sys.path:
    sys.path.append(str(RACINE_PROJET))

from pipeline.config_db import get_connection  # noqa: E402
from pipeline.importation.recevoir_fichier import UPLOAD_DIR  # noqa: E402

TYPES_EXCEL = {
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".xlsm": "application/vnd.ms-excel.sheet.macroEnabled.12",
}
STATUTS_IMPORT = {"EN_COURS", "PRET_GENERATION", "ERREUR"}
PREFIXE_STOCKAGE = re.compile(r"^[0-9a-f]{8}_", re.IGNORECASE)


class ImportIntrouvable(Exception):
    """Aucun import ne porte cet identifiant."""


class FichierIntrouvable(Exception):
    """L'import existe mais son fichier n'est plus sur le serveur."""


class FiltreInvalide(ValueError):
    """Paramètre de recherche refusé (statut inconnu, année hors bornes)."""


# ============================================================
# NOMS ET CHEMINS
# ============================================================

def nom_original(nom_stocke):
    """'a1b2c3d4_SOMIDA_2025.xlsx' -> 'SOMIDA_2025.xlsx'."""
    return PREFIXE_STOCKAGE.sub("", nom_stocke or "", count=1)


def chemin_fichier(nom_stocke):
    """
    Chemin du fichier dans UPLOAD_DIR, ou None s'il est refusé.
    Seul le nom de fichier est utilisé (jamais un chemin venant de la base)
    et le résultat doit rester dans UPLOAD_DIR, avec une extension Excel.
    """
    nom = Path(nom_stocke or "").name
    if not nom:
        return None
    racine = Path(UPLOAD_DIR).resolve()
    chemin = (racine / nom).resolve()
    if chemin.parent != racine or chemin.suffix.lower() not in TYPES_EXCEL:
        return None
    return chemin


# ============================================================
# LECTURE EN BASE
# ============================================================

def lire_imports(import_id=None, annee=None, statut=None):
    """Lignes (id, nom_fichier, statut, date_import, annee), plus récentes d'abord."""
    sql = """
        SELECT i.id, i.nom_fichier, i.statut, i.date_import, e.annee
        FROM import_fichier i
        JOIN exercice e ON e.id = i.exercice_id
    """
    conditions, parametres = [], []
    if import_id is not None:
        conditions.append("i.id = %s")
        parametres.append(int(import_id))
    if annee is not None:
        conditions.append("e.annee = %s")
        parametres.append(int(annee))
    if statut is not None:
        conditions.append("i.statut = %s")
        parametres.append(statut)
    if conditions:
        sql += " WHERE " + " AND ".join(conditions)
    sql += " ORDER BY i.id DESC"

    connexion = get_connection()
    try:
        with connexion.cursor() as curseur:
            curseur.execute(sql, parametres)
            return curseur.fetchall()
    finally:
        connexion.close()


def valider_filtres(annee=None, statut=None):
    if annee is not None and not 2000 <= int(annee) <= 2100:
        raise FiltreInvalide("L'année doit être comprise entre 2000 et 2100.")
    if statut is not None:
        statut = str(statut).strip().upper()
        if statut not in STATUTS_IMPORT:
            raise FiltreInvalide(
                f"Statut inconnu : {statut}. Valeurs : {', '.join(sorted(STATUTS_IMPORT))}."
            )
    return annee, statut


# ============================================================
# FONCTIONS PUBLIQUES
# ============================================================

def decrire_import(ligne):
    import_id, nom_stocke, statut, date_import, annee = ligne
    chemin = chemin_fichier(nom_stocke)
    disponible = bool(chemin and chemin.is_file())
    return {
        "importId": import_id,
        "annee": annee,
        "statut": statut,
        "dateImport": date_import.isoformat() if date_import else None,
        "nomFichier": nom_original(nom_stocke),
        "nomStocke": nom_stocke,
        "disponible": disponible,
        "tailleOctets": chemin.stat().st_size if disponible else None,
        "urlTelechargement": f"/api/imports/{import_id}/fichier",
    }


def lister_fichiers_importes(annee=None, statut=None):
    """Liste des imports avec l'état de leur fichier."""
    annee, statut = valider_filtres(annee, statut)
    return [decrire_import(ligne) for ligne in lire_imports(annee=annee, statut=statut)]


def trouver_fichier_import(import_id):
    """
    Renvoie {"chemin", "nomFichier", "typeMime", "tailleOctets"} pour l'import.
    Lève ImportIntrouvable ou FichierIntrouvable.
    """
    lignes = lire_imports(import_id=import_id)
    if not lignes:
        raise ImportIntrouvable(f"Import {import_id} introuvable.")
    nom_stocke = lignes[0][1]
    chemin = chemin_fichier(nom_stocke)
    if chemin is None or not chemin.is_file():
        raise FichierIntrouvable(
            f"Le fichier de l'import {import_id} ({nom_stocke}) n'est plus disponible sur le serveur."
        )
    return {
        "chemin": chemin,
        "nomFichier": nom_original(nom_stocke),
        "typeMime": TYPES_EXCEL[chemin.suffix.lower()],
        "tailleOctets": chemin.stat().st_size,
    }


# ============================================================
# LIGNE DE COMMANDE
# ============================================================

def main():
    parser = argparse.ArgumentParser(description="Fichiers Excel importés")
    parser.add_argument("--liste", action="store_true", help="lister les imports")
    parser.add_argument("--annee", type=int)
    parser.add_argument("--statut")
    parser.add_argument("--import", dest="import_id", type=int, help="copier le fichier de cet import")
    parser.add_argument("--sortie", default=".", help="dossier de destination de la copie")
    args = parser.parse_args()

    if args.import_id is not None:
        fichier = trouver_fichier_import(args.import_id)
        destination = Path(args.sortie) / fichier["nomFichier"]
        shutil.copyfile(fichier["chemin"], destination)
        print(f"[OK] {destination} ({fichier['tailleOctets']} octets)")
        return
    for f in lister_fichiers_importes(args.annee, args.statut):
        etat = "disponible" if f["disponible"] else "ABSENT"
        print(f"{f['importId']:>5}  {f['annee']}  {f['statut']:<16} {etat:<11} {f['nomFichier']}")


if __name__ == "__main__":
    try:
        main()
    except (ImportIntrouvable, FichierIntrouvable, FiltreInvalide) as e:
        print(f"[ERREUR] {e}")
        sys.exit(1)