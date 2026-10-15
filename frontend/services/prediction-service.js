import { API_URL } from "@/config/api-config"

export async function genererPrediction() {
  const user = JSON.parse(sessionStorage.getItem("sxmxdx_user") || "null")
  const auteurId = user?.id

  if (!auteurId) {
    throw new Error("Utilisateur non connecté")
  }

  const response = await fetch(
    `${API_URL}/api/predictions/generer?auteurId=${auteurId}`,
    { method: "POST" }
  )

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || "Erreur de génération de la prédiction")
  }

  return data
}


export async function getLastPrediction() {
  const response = await fetch(
    `${API_URL}/api/predictions/last`,
    {
      method: "GET",
      cache: "no-store",
    }
  )

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(
      "Erreur lors de la récupération de la prédiction."
    )
  }

  return await response.json()
}


export async function getPredictions() {
  const response = await fetch(`${API_URL}/api/predictions`, {
    cache: "no-store",
  })
  if (!response.ok) throw new Error("Impossible de charger les prédictions.")
  return response.json()
}

export async function getPredictionById(id) {
  const response = await fetch(`${API_URL}/api/predictions/${id}`, {
    cache: "no-store",
  })
  if (!response.ok) throw new Error("Impossible de charger cette prédiction.")
  return response.json()
}