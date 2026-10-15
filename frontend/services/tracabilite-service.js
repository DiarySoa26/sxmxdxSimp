import { API_URL } from "@/config/api-config"

async function requete(endpoint) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "GET",
    cache: "no-store"
  })

  if (!response.ok) {
    throw new Error(`Erreur HTTP ${response.status} : impossible de charger le journal.`)
  }

  return response.json()
}

export function getJournalConnexions() {
  return requete("/api/tracabilite/connexions")
}

export function getJournalActions() {
  return requete("/api/tracabilite/actions")
}
