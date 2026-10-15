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

// Récupérer l'utilisateur connecté
function getAuteurId() {
  const user = JSON.parse(sessionStorage.getItem("sxmxdx_user") || "null")

  if (!user?.id) {
    throw new Error("Utilisateur non connecté")
  }

  return user.id
}

export async function getUtilisateurs() {
  const response = await fetch(`${API_URL}/api/utilisateurs`, {
    cache: "no-store"
  })
  return traiterReponse(response)
}

export async function creerUtilisateur(data) {
  const auteurId = getAuteurId()

  const response = await fetch(
    `${API_URL}/api/utilisateurs?auteurId=${auteurId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }
  )

  return traiterReponse(response)
}

export async function modifierUtilisateur(id, data) {
  const auteurId = getAuteurId()

  const response = await fetch(
    `${API_URL}/api/utilisateurs/${id}?auteurId=${auteurId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }
  )

  return traiterReponse(response)
}

export async function changerStatutUtilisateur(id, actif) {
  const auteurId = getAuteurId()

  const response = await fetch(
    `${API_URL}/api/utilisateurs/${id}/statut?auteurId=${auteurId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actif })
    }
  )

  return traiterReponse(response)
}
