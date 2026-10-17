
import { API_URL } from "@/config/api-config"

async function verifierReponse(response) {
  if (response.ok) {
    return response.json()
  }

  let message = `Erreur HTTP ${response.status}`

  try {
    const erreur = await response.json()

    message =
      erreur?.message ||
      erreur?.detail ||
      erreur?.error ||
      message
  } catch {
    // Conserver le message HTTP par défaut
  }

  throw new Error(message)
}

export async function getExercicesEvaluables() {
  const response = await fetch(
    `${API_URL}/api/comparaisons/evaluation/exercices`,
    { cache: "no-store" }
  )

  return verifierReponse(response)
}

export async function evaluerPrediction(annee) {
  const response = await fetch(
    `${API_URL}/api/comparaisons/evaluation?annee=${encodeURIComponent(annee)}`,
    { cache: "no-store" }
  )

  return verifierReponse(response)
}
