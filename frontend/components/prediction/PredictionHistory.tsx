
// "use client"

// import { useEffect, useState } from "react"
// import { Loader2, History } from "lucide-react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { getPredictions, getPredictionById } from "@/services/prediction-service"
// import PredictionDetails, { type Prediction } from "@/components/prediction/PredictionDetails"
// import PredictionCharts from "@/components/prediction/PredictionCharts"

// type PredictionItem = {
//   id: number
//   annee: number
//   annee_reference: number
//   date_generation?: string
// }

// export default function PredictionHistory({ refreshKey = 0 }: { refreshKey?: number }) {
//   const [liste, setListe] = useState<PredictionItem[]>([])
//   const [id, setId] = useState("")
//   const [prediction, setPrediction] = useState<Prediction | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState("")

//   useEffect(() => {
//     let actif = true
//     setLoading(true)
//     setError("")
//     getPredictions()
//       .then((data: PredictionItem[]) => {
//         if (!actif) return
//         setListe(data)
//         setId(prev => data.some(p => String(p.id) === prev) ? prev : data.length ? String(data[0].id) : "")
//       })
//       .catch(e => actif && setError(e.message))
//       .finally(() => { if (actif) setLoading(false) })
//     return () => { actif = false }
//   }, [refreshKey])

//   useEffect(() => {
//     if (!id) { setPrediction(null); return }
//     let actif = true
//     setLoading(true)
//     setError("")
//     setPrediction(null)
//     getPredictionById(Number(id))
//       .then((data: Prediction) => { if (actif) setPrediction(data) })
//       .catch(e => { if (actif) setError(e.message) })
//       .finally(() => { if (actif) setLoading(false) })
//     return () => { actif = false }
//   }, [id, refreshKey])

//   return (
//     <div className="space-y-6">
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <History className="size-5" />
//             Historique des prédictions
//           </CardTitle>
//           <CardDescription>
//             Consultez les prévisions budgétaires déjà enregistrées dans la base de données.
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="flex flex-wrap items-center gap-4">
//             <label htmlFor="prediction-annee" className="text-sm font-medium">
//               Année prévisionnelle
//             </label>
//             <select
//               id="prediction-annee"
//               className="min-w-52 rounded-md border bg-background px-3 py-2 text-sm"
//               value={id}
//               onChange={e => setId(e.target.value)}
//               disabled={!liste.length}
//             >
//               {!liste.length && <option value="">Aucune prévision</option>}
//               {liste.map(p => (
//                 <option key={p.id} value={p.id}>
//                   {p.annee} — référence {p.annee_reference}
//                 </option>
//               ))}
//             </select>
//             {loading && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
//           </div>
//           {/* {error && <p className="mt-4 text-sm text-destructive">{error}</p>} */}
//           {error && (
//   <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
//     <p className="text-sm font-medium text-destructive">
//       Impossible de récupérer les prédictions.
//     </p>
//     <p className="mt-1 text-sm text-muted-foreground">
//       {error}
//     </p>
//   </div>
// )}
//           {!loading && !liste.length && !error && (
//             <p className="mt-4 text-sm text-muted-foreground">Aucune prédiction enregistrée.</p>
//           )}
//         </CardContent>
//       </Card>

//       {prediction && (
//         <>
//           <PredictionCharts prediction={prediction} />
//           <PredictionDetails prediction={prediction} />
//         </>
//       )}
//     </div>
//   )
// }







// "use client"

// import { useEffect, useRef, useState } from "react"
// import { FileText, History, Loader2 } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { getPredictions, getPredictionById } from "@/services/prediction-service"
// import { exporterPredictionPDF } from "@/services/prediction-export-service"
// import PredictionDetails, { type Prediction } from "@/components/prediction/PredictionDetails"
// import PredictionCharts from "@/components/prediction/PredictionCharts"

// type PredictionItem = {
//   id: number
//   annee: number
//   annee_reference: number
//   date_generation?: string
// }

// export default function PredictionHistory({ refreshKey = 0 }: { refreshKey?: number }) {
//   const [liste, setListe] = useState<PredictionItem[]>([])
//   const [id, setId] = useState("")
//   const [prediction, setPrediction] = useState<Prediction | null>(null)
//   const [loadingListe, setLoadingListe] = useState(true)
//   const [loadingPrediction, setLoadingPrediction] = useState(false)
//   const [exportEnCours, setExportEnCours] = useState(false)
//   const [error, setError] = useState("")

//   const trajectoireRef = useRef<HTMLDivElement>(null)
//   const depensesRef = useRef<HTMLDivElement>(null)

//   useEffect(() => {
//     let actif = true
//     setLoadingListe(true)
//     setError("")

//     getPredictions()
//       .then((data: PredictionItem[]) => {
//         if (!actif) return
//         const resultats = Array.isArray(data) ? data : []
//         setListe(resultats)
//         setId(prev => resultats.some(p => String(p.id) === prev)
//           ? prev
//           : resultats.length ? String(resultats[0].id) : "")
//       })
//       .catch(e => {
//         if (actif) setError(e instanceof Error ? e.message : "Erreur de récupération.")
//       })
//       .finally(() => {
//         if (actif) setLoadingListe(false)
//       })

//     return () => { actif = false }
//   }, [refreshKey])

//   useEffect(() => {
//     if (!id) {
//       setPrediction(null)
//       return
//     }

//     let actif = true
//     setLoadingPrediction(true)
//     setError("")
//     setPrediction(null)

//     getPredictionById(Number(id))
//       .then((data: Prediction) => {
//         if (actif) setPrediction(data)
//       })
//       .catch(e => {
//         if (actif) setError(e instanceof Error ? e.message : "Erreur de récupération.")
//       })
//       .finally(() => {
//         if (actif) setLoadingPrediction(false)
//       })

//     return () => { actif = false }
//   }, [id, refreshKey])

//   const exporterPDF = async () => {
//     if (!prediction || exportEnCours || loadingPrediction) return

//     try {
//       setExportEnCours(true)
//       setError("")

//       await exporterPredictionPDF({
//         prediction,
//         graphiqueTrajectoire: trajectoireRef.current,
//         graphiqueDepenses: depensesRef.current
//       })
//     } catch (e) {
//       setError(e instanceof Error ? e.message : "Impossible d'exporter le PDF.")
//     } finally {
//       setExportEnCours(false)
//     }
//   }

//   return (
//     <div className="space-y-6">
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <History className="size-5" />
//             Historique des prédictions
//           </CardTitle>
//           <CardDescription>
//             Consultez les prévisions budgétaires enregistrées et exportez leurs résultats en PDF.
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="flex flex-wrap items-center justify-between gap-4">
//             <div className="flex flex-wrap items-center gap-3">
//               <label htmlFor="prediction-annee" className="text-sm font-medium">
//                 Année prévisionnelle
//               </label>
//               <select
//                 id="prediction-annee"
//                 className="min-w-56 rounded-md border bg-background px-3 py-2 text-sm"
//                 value={id}
//                 onChange={e => setId(e.target.value)}
//                 disabled={loadingListe || exportEnCours || liste.length === 0}
//               >
//                 {liste.length === 0 && <option value="">Aucune prédiction</option>}
//                 {liste.map(p => (
//                   <option key={p.id} value={String(p.id)}>
//                     {p.annee} — référence {p.annee_reference}
//                   </option>
//                 ))}
//               </select>
//               {(loadingListe || loadingPrediction) && (
//                 <Loader2 className="size-4 animate-spin text-muted-foreground" />
//               )}
//             </div>

//             <Button
//               variant="outline"
//               disabled={!prediction || loadingPrediction || exportEnCours}
//               onClick={exporterPDF}
//             >
//               {exportEnCours
//                 ? <Loader2 className="mr-2 size-4 animate-spin" />
//                 : <FileText className="mr-2 size-4" />}
//               {exportEnCours ? "Exportation en cours..." : "Exporter PDF"}
//             </Button>
//           </div>

//           {error && (
//             <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
//               {error}
//             </div>
//           )}

//           {!loadingListe && !error && liste.length === 0 && (
//             <p className="mt-4 text-sm text-muted-foreground">
//               Aucune prédiction enregistrée.
//             </p>
//           )}
//         </CardContent>
//       </Card>

//       {prediction && !loadingPrediction && (
//         <>
//           <PredictionCharts
//             prediction={prediction}
//             trajectoireRef={trajectoireRef}
//             depensesRef={depensesRef}
//           />
//           <PredictionDetails prediction={prediction} />
//         </>
//       )}
//     </div>
//   )
// }








"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { FileText, History, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card, CardContent, CardDescription,
  CardHeader, CardTitle
} from "@/components/ui/card"
import {
  getPredictions,
  getPredictionById
} from "@/services/prediction-service"
import { exporterPredictionPDF } from "@/services/prediction-export-service"
import PredictionDetails, {
  type Prediction
} from "@/components/prediction/PredictionDetails"

const PredictionCharts = dynamic(
  () => import("@/components/prediction/PredictionCharts"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }
)

type PredictionItem = {
  id: number
  annee: number
  annee_reference: number
  date_generation?: string
}

type Props = {
  refreshKey?: number
}

export default function PredictionHistory({ refreshKey = 0 }: Props) {
  const [mounted, setMounted] = useState(false)
  const [liste, setListe] = useState<PredictionItem[]>([])
  const [id, setId] = useState("")
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [loadingListe, setLoadingListe] = useState(true)
  const [loadingPrediction, setLoadingPrediction] = useState(false)
  const [exportEnCours, setExportEnCours] = useState(false)
  const [errorListe, setErrorListe] = useState("")
  const [errorPrediction, setErrorPrediction] = useState("")
  const [errorExport, setErrorExport] = useState("")

  const trajectoireRef = useRef<HTMLDivElement>(null)
  const depensesRef = useRef<HTMLDivElement>(null)
  const requeteDetailsRef = useRef(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    let actif = true

    const chargerHistorique = async () => {
      setLoadingListe(true)
      setErrorListe("")

      try {
        const data = await getPredictions()
        if (!actif) return

        const resultats: PredictionItem[] = Array.isArray(data)
          ? data.filter(
              (item: PredictionItem) =>
                item && item.id != null
            )
          : []

        setListe(resultats)

        setId(ancienId => {
          if (
            ancienId &&
            resultats.some(
              item => String(item.id) === ancienId
            )
          ) {
            return ancienId
          }

          return resultats.length > 0
            ? String(resultats[0].id)
            : ""
        })
      } catch (e) {
        if (!actif) return

        setListe([])
        setId("")
        setErrorListe(
          e instanceof Error
            ? e.message
            : "Impossible de récupérer les prédictions."
        )
      } finally {
        if (actif) setLoadingListe(false)
      }
    }

    chargerHistorique()

    return () => {
      actif = false
    }
  }, [mounted, refreshKey])

  useEffect(() => {
    if (!mounted) return

    const numeroRequete = ++requeteDetailsRef.current

    if (!id) {
      setPrediction(null)
      setLoadingPrediction(false)
      setErrorPrediction("")
      return
    }

    let actif = true

    const chargerDetails = async () => {
      setLoadingPrediction(true)
      setErrorPrediction("")
      setPrediction(null)

      try {
        const data = await getPredictionById(Number(id))

        if (!actif || numeroRequete !== requeteDetailsRef.current) {
          return
        }

        if (!data || typeof data !== "object") {
          throw new Error("Données de prédiction invalides.")
        }

        setPrediction(data as Prediction)
      } catch (e) {
        if (!actif || numeroRequete !== requeteDetailsRef.current) {
          return
        }

        setErrorPrediction(
          e instanceof Error
            ? e.message
            : "Impossible de charger la prédiction."
        )
      } finally {
        if (actif && numeroRequete === requeteDetailsRef.current) {
          setLoadingPrediction(false)
        }
      }
    }

    chargerDetails()

    return () => {
      actif = false
    }
  }, [mounted, id, refreshKey])

  const changerPrediction = (nouvelId: string) => {
    if (nouvelId === id || exportEnCours) return

    setPrediction(null)
    setErrorPrediction("")
    setErrorExport("")
    setId(nouvelId)
  }

  // const exporterPDF = async () => {
  //   if (
  //     !prediction ||
  //     !mounted ||
  //     loadingPrediction ||
  //     loadingListe ||
  //     exportEnCours
  //   ) return

  //   try {
  //     setExportEnCours(true)
  //     setErrorExport("")

  //     await exporterPredictionPDF({
  //       prediction,
  //       graphiqueTrajectoire: trajectoireRef.current,
  //       graphiqueDepenses: depensesRef.current
  //     })
  //   } catch (e) {
  //     setErrorExport(
  //       e instanceof Error
  //         ? e.message
  //         : "Erreur lors de l'exportation PDF."
  //     )
  //   } finally {
  //     setExportEnCours(false)
  //   }
  // }



const exporterPDF = async () => {
  if (
    !prediction ||
    !mounted ||
    loadingPrediction ||
    loadingListe ||
    exportEnCours
  ) return

  try {
    setExportEnCours(true)
    setErrorExport("")

    const graphiques = [
      trajectoireRef.current,
      depensesRef.current
    ].filter((element): element is HTMLDivElement => element !== null)

    await exporterPredictionPDF({
      prediction,
      graphiques
    })
  } catch (e) {
    console.error("Erreur export PDF :", e)
    setErrorExport(
      e instanceof Error
        ? e.message
        : "Erreur lors de l'exportation PDF."
    )
  } finally {
    setExportEnCours(false)
  }
}


  const enChargement = loadingListe || loadingPrediction
  const afficherResultats =
    mounted && !enChargement && prediction !== null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="size-5" />
            Historique des prédictions
          </CardTitle>
          <CardDescription>
            Consultez les prévisions budgétaires enregistrées et exportez les résultats en PDF.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <label
                htmlFor="prediction-annee"
                className="text-sm font-medium"
              >
                Année prévisionnelle
              </label>

              <select
                id="prediction-annee"
                value={id}
                onChange={e => changerPrediction(e.target.value)}
                disabled={
                  !mounted ||
                  loadingListe ||
                  exportEnCours ||
                  liste.length === 0
                }
                className="min-w-56 rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="" disabled>
                  Sélectionner une prédiction
                </option>

                {liste.map(item => (
                  <option
                    key={String(item.id)}
                    value={String(item.id)}
                  >
                    {item.annee} — référence {item.annee_reference}
                  </option>
                ))}
              </select>

              <Loader2
                className={`size-4 animate-spin text-muted-foreground ${
                  enChargement ? "visible" : "invisible"
                }`}
                aria-hidden={!enChargement}
              />
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={
                !afficherResultats ||
                exportEnCours ||
                !prediction?.mois?.length
              }
              onClick={exporterPDF}
            >
              <span className="relative mr-2 size-4">
                <FileText
                  className={`absolute inset-0 size-4 ${
                    exportEnCours ? "invisible" : "visible"
                  }`}
                />
                <Loader2
                  className={`absolute inset-0 size-4 animate-spin ${
                    exportEnCours ? "visible" : "invisible"
                  }`}
                />
              </span>
              {exportEnCours
                ? "Exportation en cours..."
                : "Exporter PDF"}
            </Button>
          </div>

          {errorListe && (
            <div
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            >
              {errorListe}
            </div>
          )}

          {errorPrediction && (
            <div
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            >
              {errorPrediction}
            </div>
          )}

          {errorExport && (
            <div
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            >
              {errorExport}
            </div>
          )}

          {!loadingListe && !errorListe && liste.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Aucune prédiction enregistrée.
            </p>
          )}
        </CardContent>
      </Card>

      <div className={enChargement ? "block" : "hidden"}>
        <Card>
          <CardContent className="flex min-h-40 items-center justify-center gap-3">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Chargement des résultats prévisionnels...
            </span>
          </CardContent>
        </Card>
      </div>

      {afficherResultats && prediction && (
        <div className="space-y-6">
          <PredictionCharts
            prediction={prediction}
            trajectoireRef={trajectoireRef}
            depensesRef={depensesRef}
          />

          <PredictionDetails prediction={prediction} />
        </div>
      )}
    </div>
  )
}
