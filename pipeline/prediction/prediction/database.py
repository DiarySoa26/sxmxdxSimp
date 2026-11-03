from pathlib import Path as _Path
import sys as _sys
_RACINE_PROJET = str(_Path(__file__).resolve().parents[3])
if _RACINE_PROJET not in _sys.path:
    _sys.path.append(_RACINE_PROJET)

# Même configuration que le reste du pipeline (pipeline/config_db.py) :
# la prédiction lit et écrit désormais dans la même base.
from pipeline.config_db import get_connection  # noqa: E402,F401