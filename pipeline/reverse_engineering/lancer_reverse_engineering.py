"""
SXMXDX - Reverse engineering : lanceur unique, valable pour N'IMPORTE QUEL classeur Excel.

Utilisation :
    python lancer_reverse_engineering.py <fichier.xlsx> [autre.xlsx ...]
    python lancer_reverse_engineering.py <dossier_de_classeurs>

Options :
    --sortie DOSSIER   dossier de sortie (1 fichier : ce dossier ; plusieurs : un sous-dossier par fichier)
    --config FICHIER   fichier re_config.json (facultatif)
    --mapping FICHIER  mapping metier JSON (facultatif, etape formaliser_regles_metier)
    --sous-dossier     force un sous-dossier par fichier meme pour un seul classeur
    --verbeux          affiche le detail de chaque etape

Chaque classeur est analyse dans son propre dossier : plusieurs fichiers ne s'ecrasent jamais.
"""
import json
import os
import subprocess
import sys
from pathlib import Path

from re_commun import (
    DOSSIER_SORTIE_DEFAUT, EXTENSIONS_EXCEL, normaliser_nom, decrire_mise_en_page,
    mise_en_page_depuis_json,
)

DOSSIER_SCRIPTS = Path(__file__).resolve().parent


def lire_options(argv):
    options = {"sortie": None, "config": None, "mapping": None,
               "sous_dossier": False, "verbeux": False, "fichiers": []}
    i = 1
    while i < len(argv):
        a = argv[i]
        if a in ("--sortie", "--config", "--mapping") and i + 1 < len(argv):
            options[a[2:]] = argv[i + 1]
            i += 2
        elif a == "--sous-dossier":
            options["sous_dossier"] = True
            i += 1
        elif a == "--verbeux":
            options["verbeux"] = True
            i += 1
        elif a.startswith("--"):
            raise SystemExit(f"Option inconnue : {a}")
        else:
            options["fichiers"].append(a)
            i += 1
    return options


def collecter_classeurs(chemins):
    classeurs = []
    for chemin in chemins:
        p = Path(chemin)
        if p.is_dir():
            classeurs += sorted(
                f for f in p.iterdir()
                if f.suffix.lower() in EXTENSIONS_EXCEL and not f.name.startswith("~$")
            )
        else:
            classeurs.append(p)
    return classeurs


def lancer_etape(script, arguments, env, verbeux):
    commande = [sys.executable, str(DOSSIER_SCRIPTS / script), *arguments]
    resultat = subprocess.run(commande, env=env, capture_output=True, text=True, encoding="utf-8")
    if verbeux or resultat.returncode != 0:
        print(resultat.stdout, end="")
        print(resultat.stderr, end="", file=sys.stderr)
    return resultat.returncode, resultat.stdout


def lire_json(chemin):
    if not chemin.exists():
        return None
    with chemin.open("r", encoding="utf-8") as f:
        return json.load(f)


def ecrire_rapport(classeur, sortie):
    structure = lire_json(sortie / "structure.json") or {}
    regles = lire_json(sortie / "regles_metier.json") or {}
    executables = lire_json(sortie / "regles_executables.json") or {}

    lignes = [f"# Reverse engineering : {classeur.name}", ""]

    lignes += ["## Feuilles", "", "| Feuille | Formules | Mise en page temporelle |", "|---|---|---|"]
    for nom, info in structure.get("feuilles", {}).items():
        mep = mise_en_page_depuis_json(info.get("mise_en_page"))
        lignes.append(f"| {nom} | {info.get('formules', 0)} | {decrire_mise_en_page(mep)} |")

    stats = regles.get("statistiques", {})
    lignes += ["", "## Resultat", "",
               f"- Formules Excel : {stats.get('nombre_formules_excel', 0)}",
               f"- Regles uniques apres regroupement : {stats.get('nombre_regles_uniques', 0)}",
               f"- Regles formalisees (avec libelle metier) : {len(executables.get('regles', []))}",
               f"- Regles a valider (libelle non identifie) : {len(executables.get('a_valider', []))}"]

    exemples = [r for r in executables.get("regles", []) if r.get("expression_metier")][:10]
    if exemples:
        lignes += ["", "## Exemples de regles metier detectees", ""]
        for r in exemples:
            lignes.append(f"- **{r['cible']}** ({r['periodicite']}) = `{r['expression_metier']}`")

    irreguliers = [r for r in regles.get("regles", []) if r.get("anomalies_regroupement")]
    if irreguliers:
        lignes += ["", "## Points d'attention : formules differentes dans un meme regroupement", ""]
        for r in irreguliers:
            cellules = ", ".join(a["cellule"] for a in r["anomalies_regroupement"])
            lignes.append(f"- {r['id']} ({r['feuille']}) : formule differente en {cellules}")

    a_valider = executables.get("a_valider", [])
    if a_valider:
        lignes += ["", "## Regles a valider manuellement", ""]
        for r in a_valider[:30]:
            lignes.append(f"- {r['regle_technique']} : {r['raison']}"
                          + (f" ({r.get('feuille')}!{r.get('cellule')})" if r.get("feuille") else ""))
        if len(a_valider) > 30:
            lignes.append(f"- ... et {len(a_valider) - 30} autre(s)")

    (sortie / "rapport_reverse_engineering.md").write_text("\n".join(lignes) + "\n", encoding="utf-8")


def traiter_classeur(classeur, sortie, options):
    sortie.mkdir(parents=True, exist_ok=True)

    env = os.environ.copy()
    env["RE_SORTIE"] = str(sortie)
    if options["config"]:
        env["RE_CONFIG"] = options["config"]

    fichier = str(classeur)
    etapes = [
        ("Structure",            "analyser_structure.py",    [fichier]),
        ("Formules",             "extraire_formules.py",     [fichier]),
        ("Dependances",          "analyser_dependances.py",  [fichier]),
        ("Regles techniques",    "generer_regles.py",        []),
        ("Semantique",           "extraire_semantique.py",   [fichier]),
        ("Formalisation",        "formaliser_regles.py",     []),
    ]
    if options["mapping"]:
        etapes.append(("Mapping metier", "formaliser_regles_metier.py", [options["mapping"]]))
    etapes.append(("Validation", "valider_reverse_engineering.py", []))

    print(f"\n=== {classeur.name} -> {sortie} ===")

    for nom, script, arguments in etapes:
        code, sortie_texte = lancer_etape(script, arguments, env, options["verbeux"])
        if code != 0:
            print(f"  [ERREUR] {nom} : arret de la chaine pour ce fichier.")
            return False

        extrait = ""
        if script == "extraire_formules.py":
            nb = sum(1 for _ in (sortie / "formules.csv").open(encoding="utf-8")) - 1
            extrait = f"{nb} formule(s)"
            if nb == 0:
                print(f"  [OK] {nom:<18} {extrait}")
                print("  [ATTENTION] Classeur sans formule : rien a reconstituer (valeurs uniquement).")
                return True
        elif script == "generer_regles.py":
            stats = (lire_json(sortie / "regles_metier.json") or {}).get("statistiques", {})
            extrait = f"{stats.get('nombre_regles_uniques', 0)} regle(s)"
            if stats.get("regroupements_irreguliers"):
                extrait += f", {stats['regroupements_irreguliers']} regroupement(s) irregulier(s)"
        elif script == "formaliser_regles.py":
            ex = lire_json(sortie / "regles_executables.json") or {}
            extrait = f"{len(ex.get('regles', []))} formalisee(s), {len(ex.get('a_valider', []))} a valider"
        elif script == "valider_reverse_engineering.py":
            extrait = "aucune regle perdue"

        print(f"  [OK] {nom:<18} {extrait}")

    ecrire_rapport(classeur, sortie)
    print(f"  Rapport : {sortie / 'rapport_reverse_engineering.md'}")
    return True


def main():
    options = lire_options(sys.argv)

    if not options["fichiers"]:
        print(__doc__)
        sys.exit(1)

    classeurs = collecter_classeurs(options["fichiers"])
    if not classeurs:
        print("[ERREUR] Aucun classeur Excel trouve.")
        sys.exit(1)

    racine = Path(options["sortie"]) if options["sortie"] else DOSSIER_SORTIE_DEFAUT
    un_seul = len(classeurs) == 1 and not options["sous_dossier"]

    print("=" * 70)
    print(f"SXMXDX - REVERSE ENGINEERING ({len(classeurs)} classeur(s))")
    print("=" * 70)

    echecs = []
    for classeur in classeurs:
        sortie = racine if un_seul else racine / normaliser_nom(classeur.stem).lower()
        try:
            from re_commun import verifier_fichier_excel
            verifier_fichier_excel(classeur)
            ok = traiter_classeur(classeur, sortie, options)
        except (FileNotFoundError, ValueError) as e:
            print(f"\n=== {classeur.name} ===\n  [ERREUR] {e}")
            ok = False
        if not ok:
            echecs.append(classeur.name)

    print("\n" + "=" * 70)
    if echecs:
        print(f"[ERREUR] {len(echecs)} fichier(s) en echec : {', '.join(echecs)}")
        sys.exit(1)
    print(f"[OK] {len(classeurs)} fichier(s) traite(s).")


if __name__ == "__main__":
    main()
