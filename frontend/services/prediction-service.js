import { API_URL } from "@/config/api-config"

export async function genererPrediction() {
  const response = await fetch(
    `${API_URL}/api/predictions/generer`,
    { method: "POST" }
  )

  const data = await response.json()

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message ||
      "Erreur lors de la génération de la prédiction."
    )
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