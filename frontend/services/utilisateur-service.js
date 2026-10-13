import { API_URL } from "@/config/api-config"

async function traiterReponse(response) {
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      data.message ||
      data.detail ||
      data.error ||
      `Erreur HTTP ${response.status}`
    )
  }

  return data
}

export async function getUtilisateurs() {
  const response = await fetch(`${API_URL}/api/utilisateurs`, {
    cache: "no-store"
  })
  return traiterReponse(response)
}

export async function creerUtilisateur(data) {
  const response = await fetch(`${API_URL}/api/utilisateurs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  return traiterReponse(response)
}

export async function modifierUtilisateur(id, data) {
  const response = await fetch(`${API_URL}/api/utilisateurs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  return traiterReponse(response)
}

export async function changerStatutUtilisateur(id, actif) {
  const response = await fetch(`${API_URL}/api/utilisateurs/${id}/statut`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ actif })
  })
  return traiterReponse(response)
}
