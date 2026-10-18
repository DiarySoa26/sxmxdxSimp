// "use client"

// import { useEffect, useRef, useState } from "react"
// import dynamic from "next/dynamic"
// import { FileText, History, Loader2 } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import {
//   Card, CardContent, CardDescription,
//   CardHeader, CardTitle
// } from "@/components/ui/card"
// import {
//   getPredictions,
//   getPredictionById
// } from "@/services/prediction-service"
// import { exporterPredictionPDF } from "@/services/prediction-export-service"
// import PredictionDetails, {
//   type Prediction
// } from "@/components/prediction/PredictionDetails"

// const PredictionCharts = dynamic(
//   () => import("@/components/prediction/PredictionCharts"),
//   {
//     ssr: false,
//     loading: () => (
//       <div className="flex h-48 items-center justify-center">
//         <Loader2 className="size-5 animate-spin text-muted-foreground" />
//       </div>
//     )
//   }
// )

// type PredictionItem = {
//   id: number
//   annee: number
//   annee_reference: number
//   date_generation?: string
// }

// type Props = {
//   refreshKey?: number
// }

// export default function PredictionHistory({ refreshKey = 0 }: Props) {
//   const [mounted, setMounted] = useState(false)
//   const [liste, setListe] = useState<PredictionItem[]>([])
//   const [id, setId] = useState("")
//   const [prediction, setPrediction] = useState<Prediction | null>(null)
//   const [loadingListe, setLoadingListe] = useState(true)
//   const [loadingPrediction, setLoadingPrediction] = useState(false)
//   const [exportEnCours, setExportEnCours] = useState(false)
//   const [errorListe, setErrorListe] = useState("")
//   const [errorPrediction, setErrorPrediction] = useState("")
//   const [errorExport, setErrorExport] = useState("")

//   const trajectoireRef = useRef<HTMLDivElement>(null)
//   const depensesRef = useRef<HTMLDivElement>(null)
//   const requeteDetailsRef = useRef(0)

//   useEffect(() => {
//     setMounted(true)
//   }, [])

//   useEffect(() => {
//     if (!mounted) return

//     let actif = true

//     const chargerHistorique = async () => {
//       setLoadingListe(true)
//       setErrorListe("")

//       try {
//         const data = await getPredictions()
//         if (!actif) return

//         const resultats: PredictionItem[] = Array.isArray(data)
//           ? data.filter(
//               (item: PredictionItem) =>
//                 item && item.id != null
//             )
//           : []

//         setListe(resultats)

//         setId(ancienId => {
//           if (
//             ancienId &&
//             resultats.some(
//               item => String(item.id) === ancienId
//             )
//           ) {
//             return ancienId
//           }

//           return resultats.length > 0
//             ? String(resultats[0].id)
//             : ""
//         })
//       } catch (e) {
//         if (!actif) return

//         setListe([])
//         setId("")
//         setErrorListe(
//           e instanceof Error
//             ? e.message
//             : "Impossible de récupérer les prédictions."
//         )
//       } finally {
//         if (actif) setLoadingListe(false)
//       }
//     }

//     chargerHistorique()

//     return () => {
//       actif = false
//     }
//   }, [mounted, refreshKey])

//   useEffect(() => {
//     if (!mounted) return

//     const numeroRequete = ++requeteDetailsRef.current

//     if (!id) {
//       setPrediction(null)
//       setLoadingPrediction(false)
//       setErrorPrediction("")
//       return
//     }

//     let actif = true

//     const chargerDetails = async () => {
//       setLoadingPrediction(true)
//       setErrorPrediction("")
//       setPrediction(null)

//       try {
//         const data = await getPredictionById(Number(id))

//         if (!actif || numeroRequete !== requeteDetailsRef.current) {
//           return
//         }

//         if (!data || typeof data !== "object") {
//           throw new Error("Données de prédiction invalides.")
//         }

//         setPrediction(data as Prediction)
//       } catch (e) {
//         if (!actif || numeroRequete !== requeteDetailsRef.current) {
//           return
//         }

//         setErrorPrediction(
//           e instanceof Error
//             ? e.message
//             : "Impossible de charger la prédiction."
//         )
//       } finally {
//         if (actif && numeroRequete === requeteDetailsRef.current) {
//           setLoadingPrediction(false)
//         }
//       }
//     }

//     chargerDetails()

//     return () => {
//       actif = false
//     }
//   }, [mounted, id, refreshKey])

//   const changerPrediction = (nouvelId: string) => {
//     if (nouvelId === id || exportEnCours) return

//     setPrediction(null)
//     setErrorPrediction("")
//     setErrorExport("")
//     setId(nouvelId)
//   }

//   // const exporterPDF = async () => {
//   //   if (
//   //     !prediction ||
//   //     !mounted ||
//   //     loadingPrediction ||
//   //     loadingListe ||
//   //     exportEnCours
//   //   ) return

//   //   try {
//   //     setExportEnCours(true)
//   //     setErrorExport("")

//   //     await exporterPredictionPDF({
//   //       prediction,
//   //       graphiqueTrajectoire: trajectoireRef.current,
//   //       graphiqueDepenses: depensesRef.current
//   //     })
//   //   } catch (e) {
//   //     setErrorExport(
//   //       e instanceof Error
//   //         ? e.message
//   //         : "Erreur lors de l'exportation PDF."
//   //     )
//   //   } finally {
//   //     setExportEnCours(false)
//   //   }
//   // }



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

//     const graphiques = [
//       trajectoireRef.current,
//       depensesRef.current
//     ].filter((element): element is HTMLDivElement => element !== null)

//     await exporterPredictionPDF({
//       prediction,
//       graphiques
//     })
//   } catch (e) {
//     console.error("Erreur export PDF :", e)
//     setErrorExport(
//       e instanceof Error
//         ? e.message
//         : "Erreur lors de l'exportation PDF."
//     )
//   } finally {
//     setExportEnCours(false)
//   }
// }


//   const enChargement = loadingListe || loadingPrediction
//   const afficherResultats =
//     mounted && !enChargement && prediction !== null

//   return (
//     <div className="space-y-6">
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <History className="size-5" />
//             Historique des prédictions
//           </CardTitle>
//           <CardDescription>
//             Consultez les prévisions budgétaires enregistrées et exportez les résultats en PDF.
//           </CardDescription>
//         </CardHeader>

//         <CardContent className="space-y-4">
//           <div className="flex flex-wrap items-center justify-between gap-4">
//             <div className="flex flex-wrap items-center gap-3">
//               <label
//                 htmlFor="prediction-annee"
//                 className="text-sm font-medium"
//               >
//                 Année prévisionnelle
//               </label>

//               <select
//                 id="prediction-annee"
//                 value={id}
//                 onChange={e => changerPrediction(e.target.value)}
//                 disabled={
//                   !mounted ||
//                   loadingListe ||
//                   exportEnCours ||
//                   liste.length === 0
//                 }
//                 className="min-w-56 rounded-md border bg-background px-3 py-2 text-sm"
//               >
//                 <option value="" disabled>
//                   Sélectionner une prédiction
//                 </option>

//                 {liste.map(item => (
//                   <option
//                     key={String(item.id)}
//                     value={String(item.id)}
//                   >
//                     {item.annee} — référence {item.annee_reference}
//                   </option>
//                 ))}
//               </select>

//               <Loader2
//                 className={`size-4 animate-spin text-muted-foreground ${
//                   enChargement ? "visible" : "invisible"
//                 }`}
//                 aria-hidden={!enChargement}
//               />
//             </div>

//             <Button
//               type="button"
//               variant="outline"
//               disabled={
//                 !afficherResultats ||
//                 exportEnCours ||
//                 !prediction?.mois?.length
//               }
//               onClick={exporterPDF}
//             >
//               <span className="relative mr-2 size-4">
//                 <FileText
//                   className={`absolute inset-0 size-4 ${
//                     exportEnCours ? "invisible" : "visible"
//                   }`}
//                 />
//                 <Loader2
//                   className={`absolute inset-0 size-4 animate-spin ${
//                     exportEnCours ? "visible" : "invisible"
//                   }`}
//                 />
//               </span>
//               {exportEnCours
//                 ? "Exportation en cours..."
//                 : "Exporter PDF"}
//             </Button>
//           </div>

//           {errorListe && (
//             <div
//               role="alert"
//               className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
//             >
//               {errorListe}
//             </div>
//           )}

//           {errorPrediction && (
//             <div
//               role="alert"
//               className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
//             >
//               {errorPrediction}
//             </div>
//           )}

//           {errorExport && (
//             <div
//               role="alert"
//               className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
//             >
//               {errorExport}
//             </div>
//           )}

//           {!loadingListe && !errorListe && liste.length === 0 && (
//             <p className="text-sm text-muted-foreground">
//               Aucune prédiction enregistrée.
//             </p>
//           )}
//         </CardContent>
//       </Card>

//       <div className={enChargement ? "block" : "hidden"}>
//         <Card>
//           <CardContent className="flex min-h-40 items-center justify-center gap-3">
//             <Loader2 className="size-5 animate-spin text-muted-foreground" />
//             <span className="text-sm text-muted-foreground">
//               Chargement des résultats prévisionnels...
//             </span>
//           </CardContent>
//         </Card>
//       </div>

//       {afficherResultats && prediction && (
//         <div className="space-y-6">
//           <PredictionCharts
//             prediction={prediction}
//             trajectoireRef={trajectoireRef}
//             depensesRef={depensesRef}
//           />

//           <PredictionDetails prediction={prediction} />
//         </div>
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
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
  const [idAffiche, setIdAffiche] = useState("")

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
        if (actif) {
          setLoadingListe(false)
        }
      }
    }

    void chargerHistorique()

    return () => {
      actif = false
    }
  }, [mounted, refreshKey])

  useEffect(() => {
    if (!mounted) return

    const numeroRequete = ++requeteDetailsRef.current

    if (!id) {
      setPrediction(null)
      setIdAffiche("")
      setLoadingPrediction(false)
      setErrorPrediction("")
      return
    }

    let actif = true

    const chargerDetails = async () => {
      setLoadingPrediction(true)
      setErrorPrediction("")

      try {
        const data = await getPredictionById(Number(id))

        if (
          !actif ||
          numeroRequete !== requeteDetailsRef.current
        ) {
          return
        }

        if (!data || typeof data !== "object") {
          throw new Error("Données de prédiction invalides.")
        }

        setPrediction(data as Prediction)
        setIdAffiche(id)
      } catch (e) {
        if (
          !actif ||
          numeroRequete !== requeteDetailsRef.current
        ) {
          return
        }

        setErrorPrediction(
          e instanceof Error
            ? e.message
            : "Impossible de charger la prédiction."
        )
      } finally {
        if (
          actif &&
          numeroRequete === requeteDetailsRef.current
        ) {
          setLoadingPrediction(false)
        }
      }
    }

    void chargerDetails()

    return () => {
      actif = false
    }
  }, [mounted, id, refreshKey])

  const changerPrediction = (nouvelId: string) => {
    if (
      nouvelId === id ||
      exportEnCours ||
      loadingPrediction
    ) {
      return
    }

    setLoadingPrediction(true)
    setErrorPrediction("")
    setErrorExport("")
    setId(nouvelId)
  }

  const exporterPDF = async () => {
    if (
      !prediction ||
      !mounted ||
      loadingPrediction ||
      loadingListe ||
      exportEnCours ||
      idAffiche !== id
    ) {
      return
    }

    try {
      setExportEnCours(true)
      setErrorExport("")

      const graphiques = [
        trajectoireRef.current,
        depensesRef.current
      ].filter(
        (element): element is HTMLDivElement =>
          element !== null
      )

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

  const enChargement =
    loadingListe || loadingPrediction

  const afficherResultats =
    mounted && prediction !== null

  const predictionAffichee = liste.find(
    item => String(item.id) === idAffiche
  )

  const predictionSelectionnee = liste.find(
    item => String(item.id) === id
  )

  return (
    <div className="relative min-h-[500px] space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="size-5" />
            Historique des prédictions
          </CardTitle>

          <CardDescription>
            Consultez les prévisions budgétaires enregistrées
            et exportez les résultats en PDF.
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
                onChange={e =>
                  changerPrediction(e.target.value)
                }
                disabled={
                  !mounted ||
                  loadingListe ||
                  loadingPrediction ||
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
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={
                !afficherResultats ||
                enChargement ||
                exportEnCours ||
                idAffiche !== id ||
                !prediction?.mois?.length
              }
              onClick={exporterPDF}
            >
              {exportEnCours ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <FileText className="mr-2 size-4" />
              )}

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

          {!loadingListe &&
            !errorListe &&
            liste.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Aucune prédiction enregistrée.
              </p>
            )}
        </CardContent>
      </Card>

      {afficherResultats && prediction && (
        <div className="space-y-6">
          {predictionAffichee && (
            <div className="text-sm text-muted-foreground">
              Résultats prévisionnels de l'exercice{" "}
              <span className="font-semibold text-foreground">
                {predictionAffichee.annee}
              </span>
            </div>
          )}

          <PredictionCharts
            prediction={prediction}
            trajectoireRef={trajectoireRef}
            depensesRef={depensesRef}
          />

          <PredictionDetails prediction={prediction} />
        </div>
      )}

      {enChargement && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/30 backdrop-blur-[1px]"
          role="status"
          aria-live="polite"
          aria-label="Chargement des résultats prévisionnels"
        >
          <div className="flex flex-col items-center gap-5 rounded-2xl border border-border/20 bg-background/20 px-10 py-8 shadow-sm backdrop-blur-[2px]">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
              <Loader2 className="size-9 animate-spin text-primary" />
            </div>

            <div className="space-y-2 text-center">
              <h3 className="text-base font-semibold">
                Chargement des résultats prévisionnels
              </h3>

              <p className="text-sm text-muted-foreground">
                {predictionSelectionnee
                  ? `Actualisation des données de l'exercice ${predictionSelectionnee.annee}...`
                  : "Récupération des prédictions enregistrées..."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="size-2 animate-pulse rounded-full bg-primary" />
              <span className="size-2 animate-pulse rounded-full bg-primary [animation-delay:200ms]" />
              <span className="size-2 animate-pulse rounded-full bg-primary [animation-delay:400ms]" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
