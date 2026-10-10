import { API_URL } from "@/config/api-config"

export async function genererBudget() {
  const response = await fetch(`${API_URL}/api/budgets/generer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })

  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.message || "La génération du budget a échoué.")
  }

  return data
}