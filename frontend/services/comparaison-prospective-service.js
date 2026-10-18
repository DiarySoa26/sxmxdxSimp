
import { API_URL } from "@/config/api-config"

function getAuteurId() {
  if (typeof window === "undefined") {
    throw new Error("Session utilisateur indisponible")
  }

  let user

  try {
    user = JSON.parse(
      sessionStorage.getItem("sxmxdx_user") || "null"
    )
  } catch {
    throw new Error("Session utilisateur invalide")
  }

  const auteurId = user?.id

  if (!auteurId) {
    throw new Error("Utilisateur non connecté")
  }

  return auteurId
}

async function requete(url) {
  const response = await fetch(`${API_URL}${url}`, {
    cache: "no-store",
  })

  if (!response.ok) {
    let message = `Erreur HTTP ${response.status}`

    try {
      const erreur = await response.json()

      message =
        erreur?.message ||
        erreur?.detail ||
        erreur?.error ||
        message
    } catch {}

    throw new Error(message)
  }

  return response.json()
}

// Budgets générés
export function getBudgetsProspectifs() {
  return requete(
    "/api/comparaisons/prospective/budgets"
  )
}

// Prévisions
export function getPrevisionsProspectives() {
  return requete(
    "/api/comparaisons/prospective/previsions"
  )
}

// Comparaison avec traçabilité
export function comparerProspective(
  anneeBudget,
  anneePrevision
) {
  const auteurId = getAuteurId()

  const params = new URLSearchParams({
    anneeBudget: String(anneeBudget),
    anneePrevision: String(anneePrevision),
    auteurId: String(auteurId),
  })

  return requete(
    `/api/comparaisons/prospective?${params.toString()}`
  )
}





