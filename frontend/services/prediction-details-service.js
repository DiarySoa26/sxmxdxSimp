
import { API_URL } from "@/config/api-config"

// Récupérer les amortissements prévisionnels
export async function getAmortissementsPrevisionnels(annee) {
  const response = await fetch(
    `${API_URL}/api/predictions/details/${annee}/amortissements`,
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
      "Erreur lors de la récupération des amortissements prévisionnels."
    )
  }

  return await response.json()
}

// Récupérer les charges prévisionnelles par catégorie
export async function getChargesCategoriesPrevisionnelles(annee) {
  const response = await fetch(
    `${API_URL}/api/predictions/details/${annee}/charges-categories`,
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
      "Erreur lors de la récupération des charges prévisionnelles par catégorie."
    )
  }

  return await response.json()
}
