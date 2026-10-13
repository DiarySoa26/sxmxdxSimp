// "use client"

// import { useState } from "react"
// import {
//   BrainCircuit,
//   CheckCircle2,
//   Loader2,
//   TrendingUp,
// } from "lucide-react"

// import { Button } from "@/components/ui/button"
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card"

// import {
//   genererPrediction,
//   getLastPrediction,
// } from "@/services/prediction-service"

// import PredictionHistory from "@/components/prediction/PredictionHistory"
// import type { Prediction } from "@/components/prediction/PredictionDetails"

// export default function PredictionPage() {
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState("")
//   const [prediction, setPrediction] = useState<Prediction | null>(null)
//   const [refreshKey, setRefreshKey] = useState(0)

//   const generer = async () => {
//     if (loading) return

//     setLoading(true)
//     setError("")

//     try {
//       await genererPrediction()

//       const data = await getLastPrediction()

//       if (!data) {
//         throw new Error(
//           "La prédiction a été générée, mais aucun budget prévisionnel n'a été trouvé."
//         )
//       }

//       setPrediction(data)
//       setRefreshKey(prev => prev + 1)
//     } catch (e) {
//       setError(
//         e instanceof Error
//           ? e.message
//           : "Échec de la génération de la prédiction."
//       )
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="flex flex-1 flex-col">
//       <div className="border-b px-6 py-5 lg:px-8">
//         <h1 className="text-2xl font-semibold">
//           Prédiction budgétaire
//         </h1>
//         <p className="mt-1 text-sm text-muted-foreground">
//           Générez automatiquement les prévisions budgétaires à partir des exercices historiques et consultez les résultats des prédictions.
//         </p>
//       </div>

//       <div className="flex-1 bg-muted/20 p-6 lg:p-8">
//         <div className="mx-auto max-w-7xl space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Génération de la prédiction</CardTitle>
//               <CardDescription>
//                 Le prochain exercice est déterminé automatiquement à partir des données historiques disponibles.
//               </CardDescription>
//             </CardHeader>

//             <CardContent>
//               {!prediction ? (
//                 <div className="flex min-h-64 flex-col items-center justify-center text-center">
//                   <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
//                     <BrainCircuit className="size-7" />
//                   </div>

//                   <h2 className="text-lg font-semibold">
//                     Prédiction budgétaire automatique
//                   </h2>

//                   <p className="mt-2 max-w-lg text-sm text-muted-foreground">
//                     Le système analysera les données historiques, entraînera les modèles de prédiction et générera les prévisions budgétaires ainsi que l&apos;analyse des dérives.
//                   </p>

//                   <Button
//                     className="mt-6 min-w-48"
//                     disabled={loading}
//                     onClick={generer}
//                   >
//                     <span className="relative mr-2 size-4">
//                       <TrendingUp
//                         className={`absolute inset-0 size-4 ${
//                           loading ? "invisible" : "visible"
//                         }`}
//                       />
//                       <Loader2
//                         className={`absolute inset-0 size-4 animate-spin ${
//                           loading ? "visible" : "invisible"
//                         }`}
//                       />
//                     </span>
//                     <span>
//                       {loading ? "Génération..." : "Générer la prédiction"}
//                     </span>
//                   </Button>
//                 </div>
//               ) : (
//                 <div className="space-y-5">
//                   <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50/40 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/10">
//                     <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
//                     <div>
//                       <p className="text-sm font-medium">
//                         Prédiction générée avec succès
//                       </p>
//                       <p className="mt-1 text-sm text-muted-foreground">
//                         Le budget prévisionnel {prediction.annee} a été généré à partir de l&apos;exercice {prediction.annee_reference}.
//                       </p>
//                     </div>
//                   </div>

//                   <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//                     <Info
//                       titre="Année de référence"
//                       valeur={prediction.annee_reference}
//                     />
//                     <Info
//                       titre="Année prévisionnelle"
//                       valeur={prediction.annee}
//                     />
//                     <Info
//                       titre="Statut"
//                       valeur={prediction.statut}
//                     />
//                   </div>

//                   <div className="flex justify-end">
//                     <Button
//                       variant="outline"
//                       disabled={loading}
//                       onClick={generer}
//                     >
//                       <span className="relative mr-2 size-4">
//                         <TrendingUp
//                           className={`absolute inset-0 size-4 ${
//                             loading ? "invisible" : "visible"
//                           }`}
//                         />
//                         <Loader2
//                           className={`absolute inset-0 size-4 animate-spin ${
//                             loading ? "visible" : "invisible"
//                           }`}
//                         />
//                       </span>
//                       <span>
//                         {loading ? "Génération..." : "Regénérer"}
//                       </span>
//                     </Button>
//                   </div>
//                 </div>
//               )}

//               {error && (
//                 <div className="mt-5 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
//                   {error}
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           <PredictionHistory refreshKey={refreshKey} />
//         </div>
//       </div>
//     </div>
//   )
// }

// function Info({
//   titre,
//   valeur,
// }: {
//   titre: string
//   valeur: string | number
// }) {
//   return (
//     <div className="rounded-lg border p-4">
//       <p className="text-xs text-muted-foreground">{titre}</p>
//       <p className="mt-1 text-lg font-semibold">{valeur}</p>
//     </div>
//   )
// }








"use client"

import { useState } from "react"
import { BrainCircuit, CheckCircle2, Loader2, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { genererPrediction, getLastPrediction } from "@/services/prediction-service"
import PredictionHistory from "@/components/prediction/PredictionHistory"
import type { Prediction } from "@/components/prediction/PredictionDetails"

export default function PredictionPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const generer = async () => {
    if (loading) return
    setLoading(true)
    setError("")

    try {
      await genererPrediction()
      const data = await getLastPrediction()

      if (!data) {
        throw new Error("La prédiction a été générée, mais aucun budget prévisionnel n'a été trouvé.")
      }

      setPrediction(data)
      setRefreshKey(prev => prev + 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de la génération de la prédiction.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b px-6 py-5 lg:px-8">
        <h1 className="text-2xl font-semibold">Prédiction budgétaire</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Générez automatiquement les prévisions budgétaires à partir des exercices historiques et consultez les résultats des prédictions.
        </p>
      </div>

      <div className="flex-1 bg-muted/20 p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Génération de la prédiction</CardTitle>
              <CardDescription>
                Le prochain exercice est déterminé automatiquement à partir des données historiques disponibles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!prediction ? (
                <div className="flex min-h-64 flex-col items-center justify-center text-center">
                  <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
                    <BrainCircuit className="size-7" />
                  </div>
                  <h2 className="text-lg font-semibold">Prédiction budgétaire automatique</h2>
                  <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                    Le système analysera les données historiques, entraînera les modèles de prédiction et générera les prévisions budgétaires ainsi que l&apos;analyse des dérives.
                  </p>
                  <Button className="mt-6 min-w-48" disabled={loading} onClick={generer}>
                    <span className="relative mr-2 size-4">
                      <TrendingUp className={`absolute inset-0 size-4 ${loading ? "invisible" : "visible"}`} />
                      <Loader2 className={`absolute inset-0 size-4 animate-spin ${loading ? "visible" : "invisible"}`} />
                    </span>
                    {loading ? "Génération..." : "Générer la prédiction"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50/40 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/10">
                    <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
                    <div>
                      <p className="text-sm font-medium">Prédiction générée avec succès</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Le budget prévisionnel {prediction.annee} a été généré à partir de l&apos;exercice {prediction.annee_reference}.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <Info titre="Année de référence" valeur={prediction.annee_reference} />
                    <Info titre="Année prévisionnelle" valeur={prediction.annee} />
                    <Info titre="Statut" valeur={prediction.statut} />
                  </div>

                  <div className="flex justify-end">
                    <Button variant="outline" disabled={loading} onClick={generer}>
                      <span className="relative mr-2 size-4">
                        <TrendingUp className={`absolute inset-0 size-4 ${loading ? "invisible" : "visible"}`} />
                        <Loader2 className={`absolute inset-0 size-4 animate-spin ${loading ? "visible" : "invisible"}`} />
                      </span>
                      {loading ? "Génération..." : "Regénérer"}
                    </Button>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-5 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          <PredictionHistory refreshKey={refreshKey} />
        </div>
      </div>
    </div>
  )
}

function Info({ titre, valeur }: { titre: string; valeur: string | number }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs text-muted-foreground">{titre}</p>
      <p className="mt-1 text-lg font-semibold">{valeur}</p>
    </div>
  )
}
