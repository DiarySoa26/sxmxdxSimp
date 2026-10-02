import { API_URL } from "@/config/api-config"

/**
 * @param {number|null} annee
 */
export async function rechercherExercices(
  annee = null
) {

  let url =
    `${API_URL}/api/exercices`

  if (annee !== null) {

    url += `?annee=${annee}`

  }

  console.log(
    "URL recherche exercices :",
    url
  )

  const response =
    await fetch(
      url,
      {
        cache: "no-store",
      }
    )

  if (!response.ok) {

    throw new Error(
      "Impossible de récupérer les exercices."
    )

  }

  return response.json()
}