// import { API_URL } from "@/config/api-config"

// export async function importerExercice(file) {
//   const formData = new FormData()

//   formData.append("file", file)

//   const response = await fetch(
//     `${API_URL}/api/imports`,
//     {
//       method: "POST",
//       body: formData,
//     }
//   )

//   let data = null

//   try {
//     data = await response.json()
//   } catch {
//     data = null
//   }

//   if (!response.ok) {
//     throw new Error(
//       data?.message ||
//         "Erreur pendant l'importation."
//     )
//   }

//   return data
// }



import { API_URL } from "@/config/api-config"

export async function importerExercice(file) {
  const user = JSON.parse(sessionStorage.getItem("sxmxdx_user") || "null")
  const auteurId = user?.id

  if (!auteurId) {
    throw new Error("Utilisateur non connecté")
  }

  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(
    `${API_URL}/api/imports?auteurId=${auteurId}`,
    {
      method: "POST",
      body: formData
    }
  )

  const data = await response.json().catch(() => ({}))

  if (!response.ok || data.success === false) {
    throw new Error(data.message || "Erreur lors de l'importation")
  }

  return data
}