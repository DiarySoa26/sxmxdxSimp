
import { API_URL } from "@/config/api-config"

async function requete(url) {
  const response = await fetch(`${API_URL}${url}`, {
    cache: "no-store",
  })

  if (!response.ok) {
    let message = `Erreur HTTP ${response.status}`

    try {
      const erreur = await response.json()
      message = erreur.message || erreur.detail || message
    } catch {}

    throw new Error(message)
  }

  return response.json()
}

export function getBudgetsProspectifs() {
  return requete("/api/comparaisons/prospective/budgets")
}

export function getPrevisionsProspectives() {
  return requete("/api/comparaisons/prospective/previsions")
}

export function comparerProspective(anneeBudget, anneePrevision) {
  const params = new URLSearchParams({
    anneeBudget: String(anneeBudget),
    anneePrevision: String(anneePrevision),
  })

  return requete(`/api/comparaisons/prospective?${params}`)
}
