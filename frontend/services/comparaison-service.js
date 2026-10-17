import { API_URL } from "@/config/api-config";

async function getJson(path) {
  const response = await fetch(`${API_URL}${path}`, { cache: "no-store" })
  if (!response.ok) {
    let message = `Erreur HTTP ${response.status}`
    try { const data = await response.json(); message = data.message || data.detail || message } catch {}
    throw new Error(message)
  }
  return response.json()
}

export const getExercicesComparaison = () => getJson("/api/comparaisons/exercices")
export const getComparaisonHistorique = (annee1, annee2) =>
  getJson(`/api/comparaisons/historique?${new URLSearchParams({ annee1, annee2 })}`)
