from pathlib import Path
import shutil
import sys
import uuid


UPLOAD_DIR = Path("data/uploads")


def recevoir_fichier(chemin_fichier: str):
    source = Path(chemin_fichier)

    print("\n" + "=" * 70)
    print("SXMXDX - RECEPTION DU FICHIER")
    print("=" * 70)

    # 1. Vérifier l'existence
    if not source.exists():
        raise FileNotFoundError(
            f"Le fichier n'existe pas : {source}"
        )

    # 2. Vérifier l'extension
    extensions_acceptees = [".xlsx", ".xlsm"]

    if source.suffix.lower() not in extensions_acceptees:
        raise ValueError(
            f"Format non accepté : {source.suffix}"
        )

    # 3. Créer le dossier uploads
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    # 4. Générer un identifiant d'import
    import_id = str(uuid.uuid4())[:8]

    # 5. Nouveau nom
    destination = (
        UPLOAD_DIR /
        f"{import_id}_{source.name}"
    )

    # 6. Copier le fichier
    shutil.copy2(source, destination)

    print(f"[OK] Fichier sélectionné : {source.name}")
    print(f"[OK] Import ID          : {import_id}")
    print(f"[OK] Fichier enregistré : {destination}")

    return destination


if __name__ == "__main__":

    if len(sys.argv) != 2:
        print(
            "Utilisation : python recevoir_fichier.py "
            "<chemin_fichier>"
        )
        sys.exit(1)

    try:
        fichier = recevoir_fichier(sys.argv[1])

        print("\nSTATUT : FICHIER RECU")
        print(f"CHEMIN : {fichier}")

    except Exception as e:
        print(f"\n[ERREUR] {e}")
        sys.exit(1)