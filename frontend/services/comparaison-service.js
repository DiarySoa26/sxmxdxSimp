import { API_URL } from "@/config/api-config";

function getAuteurId() {
  const user = JSON.parse(sessionStorage.getItem("sxmxdx_user") || "null");
  const auteurId = user?.id;

  if (!auteurId) {
    throw new Error("Utilisateur non connecté");
  }

  return auteurId;
}

async function getJson(path) {
  const response = await fetch(`${API_URL}${path}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    let message = `Erreur HTTP ${response.status}`;

    try {
      const data = await response.json();
      message = data.message || data.detail || message;
    } catch {}

    throw new Error(message);
  }

  return response.json();
}

export const getExercicesComparaison = () =>
  getJson("/api/comparaisons/exercices");

export const getComparaisonHistorique = (annee1, annee2) => {
  const auteurId = getAuteurId();

  const params = new URLSearchParams({
    annee1: String(annee1),
    annee2: String(annee2),
    auteurId: String(auteurId)
  });

  return getJson(`/api/comparaisons/historique?${params}`);
};
