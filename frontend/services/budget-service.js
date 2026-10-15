import { API_URL } from "@/config/api-config"

// export async function genererBudget() {
//   const response = await fetch(`${API_URL}/api/budgets/generer`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//   })

//   const data = await response.json()

//   if (!response.ok || !data.success) {
//     throw new Error(data.message || "La génération du budget a échoué.")
//   }

//   return data
// }



export async function genererBudget() {
  const user = JSON.parse(sessionStorage.getItem("sxmxdx_user") || "null")
  const auteurId = user?.id

  if (!auteurId) {
    throw new Error("Utilisateur non connecté")
  }

  const response = await fetch(
    `${API_URL}/api/budgets/generer?auteurId=${auteurId}`,
    { method: "POST" }
  )

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || "Erreur lors de la génération du budget")
  }

  return data
}