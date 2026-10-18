
// // import { API_URL } from "@/config/api-config"

// // async function verifierReponse(response) {
// //   if (response.ok) {
// //     return response.json()
// //   }

// //   let message = `Erreur HTTP ${response.status}`

// //   try {
// //     const erreur = await response.json()

// //     message =
// //       erreur?.message ||
// //       erreur?.detail ||
// //       erreur?.error ||
// //       message
// //   } catch {
// //     // Conserver le message HTTP par défaut
// //   }

// //   throw new Error(message)
// // }

// // export async function getExercicesEvaluables() {
// //   const response = await fetch(
// //     `${API_URL}/api/comparaisons/evaluation/exercices`,
// //     { cache: "no-store" }
// //   )

// //   return verifierReponse(response)
// // }

// // export async function evaluerPrediction(annee) {
// //   const response = await fetch(
// //     `${API_URL}/api/comparaisons/evaluation?annee=${encodeURIComponent(annee)}`,
// //     { cache: "no-store" }
// //   )

// //   return verifierReponse(response)
// // }





// import { API_URL } from "@/config/api-config"

// // Récupérer l'identifiant de l'utilisateur connecté
// function getAuteurId() {
//   if (typeof window === "undefined") {
//     throw new Error("Session utilisateur indisponible")
//   }

//   let user

//   try {
//     user = JSON.parse(
//       sessionStorage.getItem("sxmxdx_user") || "null"
//     )
//   } catch {
//     throw new Error("Session utilisateur invalide")
//   }

//   const auteurId = user?.id

//   if (!auteurId) {
//     throw new Error("Utilisateur non connecté")
//   }

//   return auteurId
// }

// // Vérifier les réponses du backend
// async function verifierReponse(response) {
//   if (response.ok) {
//     return response.json()
//   }

//   let message = `Erreur HTTP ${response.status}`

//   try {
//     const erreur = await response.json()

//     message =
//       erreur?.message ||
//       erreur?.detail ||
//       erreur?.error ||
//       message
//   } catch {
//     // Conserver le message HTTP par défaut
//   }

//   throw new Error(message)
// }

// // Récupérer les exercices disponibles pour l'évaluation
// export async function getExercicesEvaluables() {
//   const response = await fetch(
//     `${API_URL}/api/comparaisons/evaluation/exercices`,
//     { cache: "no-store" }
//   )

//   return verifierReponse(response)
// }

// // Évaluer une prédiction avec traçabilité
// export async function evaluerPrediction(annee) {
//   const auteurId = getAuteurId()

//   const params = new URLSearchParams({
//     annee: String(annee),
//     auteurId: String(auteurId),
//   })

//   const response = await fetch(
//     `${API_URL}/api/comparaisons/evaluation?${params.toString()}`,
//     { cache: "no-store" }
//   )

//   return verifierReponse(response)
// }





import { API_URL } from "@/config/api-config"

// Récupérer l'utilisateur connecté
function getAuteurId() {
  if (typeof window === "undefined") {
    throw new Error("Session utilisateur indisponible")
  }

  let user

  try {
    user = JSON.parse(
      sessionStorage.getItem("sxmxdx_user") || "null"
    )
  } catch {
    throw new Error("Session utilisateur invalide")
  }

  const auteurId = user?.id

  if (!auteurId) {
    throw new Error("Utilisateur non connecté")
  }

  return auteurId
}

// Vérifier la réponse du backend
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

// Récupérer les exercices évaluables
export async function getExercicesEvaluables() {
  const response = await fetch(
    `${API_URL}/api/comparaisons/evaluation/exercices`,
    {
      cache: "no-store",
    }
  )

  return verifierReponse(response)
}

// Évaluer une prédiction avec traçabilité
export async function evaluerPrediction(annee) {
  const auteurId = getAuteurId()

  const params = new URLSearchParams({
    annee: String(annee),
    auteurId: String(auteurId),
  })

  const response = await fetch(
    `${API_URL}/api/comparaisons/evaluation?${params.toString()}`,
    {
      cache: "no-store",
    }
  )

  return verifierReponse(response)
}
