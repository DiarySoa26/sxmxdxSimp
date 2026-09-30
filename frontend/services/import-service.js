import { API_URL } from "@/config/api-config"

export async function importerExercice(file) {
  const formData = new FormData()

  formData.append("file", file)

  const response = await fetch(
    `${API_URL}/api/imports`,
    {
      method: "POST",
      body: formData,
    }
  )

  let data = null

  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Erreur pendant l'importation."
    )
  }

  return data
}