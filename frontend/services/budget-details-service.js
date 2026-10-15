// import { API_URL } from "@/config/api-config"

// async function verifierResponse(response) {
//   if (response.ok) {
//     return
//   }

//   let message = `Erreur HTTP ${response.status}`

//   try {
//     const texte = await response.text()

//     if (texte) {
//       try {
//         const erreur = JSON.parse(texte)

//         message =
//           erreur?.message ||
//           erreur?.error ||
//           texte
//       } catch {
//         message = texte
//       }
//     }
//   } catch {
//     message = `Erreur HTTP ${response.status}`
//   }

//   throw new Error(message)
// }

// export async function getExercices() {
//   const response = await fetch(
//     `${API_URL}/api/exercices`
//   )

//   await verifierResponse(response)

//   const data = await response.json()

//   const liste =
//     Array.isArray(data)
//       ? data
//       : Array.isArray(data?.data)
//         ? data.data
//         : []

//   return liste
//     .map((exercice) => ({
//       ...exercice,

//       id_exercice:
//         exercice?.id_exercice ??
//         exercice?.idExercice ??
//         exercice?.id,

//       annee_exercice:
//         exercice?.annee_exercice ??
//         exercice?.anneeExercice ??
//         exercice?.annee,
//     }))
//     .sort(
//       (a, b) =>
//         Number(b.annee_exercice ?? 0) -
//         Number(a.annee_exercice ?? 0)
//     )
// }

// export async function getBudgetDetails(
//   onglet,
//   exerciceId
// ) {
//   const response = await fetch(
//     `${API_URL}/api/budget-details/${onglet}/${exerciceId}`
//   )

//   await verifierResponse(response)

//   const data = await response.json()

//   if (Array.isArray(data)) {
//     return data
//   }

//   if (Array.isArray(data?.data)) {
//     return data.data
//   }

//   if (Array.isArray(data?.resultats)) {
//     return data.resultats
//   }

//   return data ? [data] : []
// }

// export async function getBudgetMensuel(
//   budgetId
// ) {
//   const response = await fetch(
//     `${API_URL}/api/budget-details/budget-mensuel/${budgetId}`
//   )

//   await verifierResponse(response)

//   const data = await response.json()

//   if (Array.isArray(data)) {
//     return data
//   }

//   if (Array.isArray(data?.data)) {
//     return data.data
//   }

//   if (Array.isArray(data?.resultats)) {
//     return data.resultats
//   }

//   return data ? [data] : []
// }





import { API_URL } from "@/config/api-config"

function getAuteurId() {
  const user = JSON.parse(sessionStorage.getItem("sxmxdx_user") || "null")
  const auteurId = user?.id

  if (!auteurId) {
    throw new Error("Utilisateur non connecté")
  }

  return auteurId
}

async function verifierResponse(response) {
  if (response.ok) return

  let message = `Erreur HTTP ${response.status}`

  try {
    const texte = await response.text()

    if (texte) {
      try {
        const erreur = JSON.parse(texte)
        message = erreur?.message || erreur?.error || texte
      } catch {
        message = texte
      }
    }
  } catch {
    message = `Erreur HTTP ${response.status}`
  }

  throw new Error(message)
}

function normaliserListe(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.resultats)) return data.resultats
  return data ? [data] : []
}

export async function getExercices() {
  const response = await fetch(
    `${API_URL}/api/exercices`
  )

  await verifierResponse(response)

  const data = await response.json()

  const liste = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : []

  return liste
    .map((exercice) => ({
      ...exercice,
      id_exercice:
        exercice?.id_exercice ??
        exercice?.idExercice ??
        exercice?.id,
      annee_exercice:
        exercice?.annee_exercice ??
        exercice?.anneeExercice ??
        exercice?.annee,
    }))
    .sort(
      (a, b) =>
        Number(b.annee_exercice ?? 0) -
        Number(a.annee_exercice ?? 0)
    )
}

export async function getBudgetDetails(onglet, exerciceId) {
  const auteurId = getAuteurId()

  const response = await fetch(
    `${API_URL}/api/budget-details/${onglet}/${exerciceId}?auteurId=${encodeURIComponent(auteurId)}`,
    { cache: "no-store" }
  )

  await verifierResponse(response)

  const data = await response.json()
  return normaliserListe(data)
}

export async function getBudgetMensuel(budgetId) {
  const auteurId = getAuteurId()

  const response = await fetch(
    `${API_URL}/api/budget-details/budget-mensuel/${budgetId}?auteurId=${encodeURIComponent(auteurId)}`,
    { cache: "no-store" }
  )

  await verifierResponse(response)

  const data = await response.json()
  return normaliserListe(data)
}
