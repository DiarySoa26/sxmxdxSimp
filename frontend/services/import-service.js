// import { API_URL } from "@/config/api-config"

// export async function importerExercice(file) {
//   const user = JSON.parse(sessionStorage.getItem("sxmxdx_user") || "null")
//   const auteurId = user?.id

//   if (!auteurId) {
//     throw new Error("Utilisateur non connecté")
//   }

//   const formData = new FormData()
//   formData.append("file", file)

//   const response = await fetch(
//     `${API_URL}/api/imports?auteurId=${auteurId}`,
//     {
//       method: "POST",
//       body: formData
//     }
//   )

//   const data = await response.json().catch(() => ({}))

//   if (!response.ok || data.success === false) {
//     throw new Error(data.message || "Erreur lors de l'importation")
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

export async function telechargerFichierExercice(importId) {
  const response = await fetch(
    `${API_URL}/api/imports/${importId}/original`
  )

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.message || "Téléchargement impossible")
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const lien = document.createElement("a")

  lien.href = url
  lien.download = `import_${importId}.xlsx`

  document.body.appendChild(lien)
  lien.click()
  lien.remove()

  setTimeout(() => URL.revokeObjectURL(url), 1000)
}