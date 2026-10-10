// "use client"

// import {
//   useEffect,
//   useState,
// } from "react"

// import {
//   CalendarDays,
//   Loader2,
// } from "lucide-react"

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card"

// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"

// import BudgetTabs from "./budget-tabs"
// import BudgetError from "./budget-error"

// import {
//   getBudgetDetails,
//   getExercices,
// } from "@/services/budget-details-service"


// type Exercice = {
//   id_exercice: number
//   annee_exercice: number
// }


// type OngletBudget =
//   | "charges"
//   | "exportations"
//   | "frais-export"
//   | "production"
//   | "employes"
//   | "budget"


// export default function BudgetDetails() {

//   const [
//     exercices,
//     setExercices,
//   ] = useState<Exercice[]>([])

//   const [
//     exerciceId,
//     setExerciceId,
//   ] = useState<string>("")

//   const [
//     onglet,
//     setOnglet,
//   ] = useState<OngletBudget>(
//     "charges"
//   )

//   const [
//     data,
//     setData,
//   ] = useState<any[]>([])

//   const [
//     loadingExercices,
//     setLoadingExercices,
//   ] = useState(true)

//   const [
//     loadingData,
//     setLoadingData,
//   ] = useState(false)

//   const [
//     error,
//     setError,
//   ] = useState("")


//   useEffect(() => {

//     let actif = true

//     async function chargerExercices() {

//       try {

//         setLoadingExercices(true)
//         setError("")

//         const liste =
//           await getExercices()

//         if (!actif) {
//           return
//         }

//         if (
//           !Array.isArray(liste)
//         ) {
//           setExercices([])
//           return
//         }

//         setExercices(liste)

//         if (
//           liste.length > 0
//         ) {

//           setExerciceId(
//             String(
//               liste[0].id_exercice
//             )
//           )

//         }

//       } catch (erreur) {

//         if (!actif) {
//           return
//         }

//         console.error(
//           "Erreur chargement exercices :",
//           erreur
//         )

//         setExercices([])

//         setError(
//           erreur instanceof Error
//             ? erreur.message
//             : "Impossible de charger les exercices."
//         )

//       } finally {

//         if (actif) {
//           setLoadingExercices(false)
//         }

//       }

//     }

//     chargerExercices()

//     return () => {
//       actif = false
//     }

//   }, [])


//   useEffect(() => {

//     if (!exerciceId) {
//       return
//     }

//     let actif = true

//     async function chargerDonnees() {

//       try {

//         setLoadingData(true)
//         setError("")
//         setData([])

//         const resultat =
//           await getBudgetDetails(
//             onglet,
//             Number(
//               exerciceId
//             )
//           )

//         if (!actif) {
//           return
//         }

//         setData(
//           Array.isArray(
//             resultat
//           )
//             ? resultat
//             : []
//         )

//       } catch (erreur) {

//         if (!actif) {
//           return
//         }

//         console.error(
//           "Erreur chargement budget :",
//           erreur
//         )

//         setData([])

//         setError(
//           erreur instanceof Error
//             ? erreur.message
//             : "Impossible de charger les données."
//         )

//       } finally {

//         if (actif) {
//           setLoadingData(false)
//         }

//       }

//     }

//     chargerDonnees()

//     return () => {
//       actif = false
//     }

//   }, [
//     exerciceId,
//     onglet,
//   ])


//   const exerciceSelectionne =
//     exercices.find(
//       (item) =>
//         String(
//           item.id_exercice
//         ) === exerciceId
//     )


//   function changerExercice(
//     value: string | null
//   ) {

//     if (value === null) {
//       return
//     }

//     setError("")
//     setData([])

//     setExerciceId(value)

//   }

//   function changerOnglet(
//     value: OngletBudget
//   ) {

//     setError("")
//     setData([])

//     setOnglet(value)

//   }


//   return (
//     <div className="space-y-6">

//       <BudgetError
//         message={error}
//       />

//       <Card>

//         <CardHeader>

//           <div className="flex items-center gap-3">

//             <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-muted">

//               <CalendarDays className="h-5 w-5" />

//             </div>

//             <div>

//               <CardTitle className="text-base">
//                 Exercice
//               </CardTitle>

//               <CardDescription>
//                 Sélectionnez l&apos;exercice à consulter.
//               </CardDescription>

//             </div>

//           </div>

//         </CardHeader>


//         <CardContent>

//           <div className="w-full max-w-xs">

//             {loadingExercices ? (

//               <div className="flex h-10 items-center gap-2 text-sm text-muted-foreground">

//                 <Loader2 className="h-4 w-4 animate-spin" />

//                 Chargement des exercices...

//               </div>

//             ) : exercices.length === 0 ? (

//               <div className="text-sm text-muted-foreground">
//                 Aucun exercice disponible.
//               </div>

//             ) : (

//               <Select
//                 value={
//                   exerciceId
//                 }
//                 onValueChange={
//                   changerExercice
//                 }
//               >

//                 <SelectTrigger className="w-full">

//                   <SelectValue
//                     placeholder="Sélectionner un exercice"
//                   />

//                 </SelectTrigger>


//                 <SelectContent>

//                   {exercices.map(
//                     (exercice) => (

//                       <SelectItem
//                         key={
//                           exercice.id_exercice
//                         }
//                         value={String(
//                           exercice.id_exercice
//                         )}
//                       >
//                         {
//                           exercice.annee_exercice
//                         }
//                       </SelectItem>

//                     )
//                   )}

//                 </SelectContent>

//               </Select>

//             )}

//           </div>

//         </CardContent>

//       </Card>

//       {exerciceId && (

//         <Card>

//           <CardHeader>

//             <CardTitle>

//               Données de l&apos;exercice{" "}

//               {
//                 exerciceSelectionne
//                   ?.annee_exercice
//               }

//             </CardTitle>

//             <CardDescription>
//               Consultation des données financières et budgétaires.
//             </CardDescription>

//           </CardHeader>


//           <CardContent>

//             <BudgetTabs
//               value={onglet}
//               onValueChange={
//                 changerOnglet
//               }
//               data={data}
//               loading={
//                 loadingData
//               }
//             />

//           </CardContent>

//         </Card>

//       )}

//     </div>
//   )
// }




"use client"

import {
  useEffect,
  useState,
} from "react"

import {
  CalendarDays,
  Loader2,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"

import BudgetTabs from "./budget-tabs"
import BudgetError from "./budget-error"

import {
  getBudgetDetails,
  getExercices,
} from "@/services/budget-details-service"

type Exercice = {
  id_exercice: number
  annee_exercice: number
}

type OngletBudget =
  | "charges"
  | "exportations"
  | "frais-export"
  | "production"
  | "employes"
  | "budget"

export default function BudgetDetails() {
  const [
    exercices,
    setExercices,
  ] = useState<Exercice[]>([])

  const [
    exerciceId,
    setExerciceId,
  ] = useState<string>("")

  const [
    anneeSelectionnee,
    setAnneeSelectionnee,
  ] = useState<string>("")

  const [
    onglet,
    setOnglet,
  ] = useState<OngletBudget>(
    "charges"
  )

  const [
    data,
    setData,
  ] = useState<any[]>([])

  const [
    loadingExercices,
    setLoadingExercices,
  ] = useState(true)

  const [
    loadingData,
    setLoadingData,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState("")

  useEffect(() => {
    let actif = true

    async function chargerExercices() {
      try {
        setLoadingExercices(true)
        setError("")

        const liste =
          await getExercices()

        if (!actif) {
          return
        }

        if (
          !Array.isArray(liste) ||
          liste.length === 0
        ) {
          setExercices([])
          setExerciceId("")
          setAnneeSelectionnee("")
          return
        }

        setExercices(liste)

        const premierExercice =
          liste[0]

        setExerciceId(
          String(
            premierExercice.id_exercice
          )
        )

        setAnneeSelectionnee(
          String(
            premierExercice.annee_exercice
          )
        )
      } catch (erreur) {
        if (!actif) {
          return
        }

        console.error(
          "Erreur chargement exercices :",
          erreur
        )

        setExercices([])
        setExerciceId("")
        setAnneeSelectionnee("")

        setError(
          erreur instanceof Error
            ? erreur.message
            : "Impossible de charger les exercices."
        )
      } finally {
        if (actif) {
          setLoadingExercices(false)
        }
      }
    }

    chargerExercices()

    return () => {
      actif = false
    }
  }, [])

  useEffect(() => {
    if (!exerciceId) {
      return
    }

    let actif = true

    async function chargerDonnees() {
      const debut =
        Date.now()

      try {
        setLoadingData(true)
        setError("")
        setData([])

        const resultat =
          await getBudgetDetails(
            onglet,
            Number(exerciceId)
          )

        const tempsEcoule =
          Date.now() - debut

        const tempsRestant =
          Math.max(
            0,
            3000 - tempsEcoule
          )

        if (tempsRestant > 0) {
          await attendre(
            tempsRestant
          )
        }

        if (!actif) {
          return
        }

        setData(
          Array.isArray(resultat)
            ? resultat
            : []
        )
      } catch (erreur) {
        const tempsEcoule =
          Date.now() - debut

        const tempsRestant =
          Math.max(
            0,
            3000 - tempsEcoule
          )

        if (tempsRestant > 0) {
          await attendre(
            tempsRestant
          )
        }

        if (!actif) {
          return
        }

        console.error(
          "Erreur chargement budget :",
          erreur
        )

        setData([])

        setError(
          erreur instanceof Error
            ? erreur.message
            : "Impossible de charger les données."
        )
      } finally {
        if (actif) {
          setLoadingData(false)
        }
      }
    }

    chargerDonnees()

    return () => {
      actif = false
    }
  }, [
    exerciceId,
    onglet,
  ])

  function changerExercice(
    value: string | null
  ) {
    if (value === null) {
      return
    }

    const exercice =
      exercices.find(
        (item) =>
          String(
            item.id_exercice
          ) === String(value)
      )

    if (!exercice) {
      console.error(
        "Exercice introuvable :",
        value
      )

      return
    }

    setError("")
    setData([])

    setExerciceId(
      String(
        exercice.id_exercice
      )
    )

    setAnneeSelectionnee(
      String(
        exercice.annee_exercice
      )
    )
  }

  function changerOnglet(
    value: OngletBudget
  ) {
    setError("")
    setData([])
    setOnglet(value)
  }

  return (
    <div className="space-y-6">
      <BudgetError
        message={error}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-muted">
              <CalendarDays className="h-5 w-5" />
            </div>

            <div>
              <CardTitle className="text-base">
                Exercice
              </CardTitle>

              <CardDescription>
                Sélectionnez l&apos;exercice à consulter.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="w-full max-w-xs">
            {loadingExercices ? (
              <div className="flex h-10 items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />

                Chargement des exercices...
              </div>
            ) : exercices.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Aucun exercice disponible.
              </div>
            ) : (
              <Select
                value={exerciceId}
                onValueChange={
                  changerExercice
                }
              >
                <SelectTrigger className="w-full">
                  <span>
                    {anneeSelectionnee ||
                      "Sélectionner un exercice"}
                  </span>
                </SelectTrigger>

                <SelectContent>
                  {exercices.map(
                    (exercice) => (
                      <SelectItem
                        key={
                          exercice.id_exercice
                        }
                        value={String(
                          exercice.id_exercice
                        )}
                      >
                        {
                          exercice.annee_exercice
                        }
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {exerciceId && (
        <Card>
          <CardHeader>
            <CardTitle>
              Données de l&apos;exercice{" "}
              {anneeSelectionnee}
            </CardTitle>

            <CardDescription>
              Consultation des données financières et budgétaires.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {loadingData ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin" />

                <p className="text-sm text-muted-foreground">
                  Chargement des données de
                  l&apos;exercice{" "}
                  {anneeSelectionnee}...
                </p>
              </div>
            ) : (
              <BudgetTabs
                value={onglet}
                onValueChange={
                  changerOnglet
                }
                data={data}
                loading={false}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function attendre(
  millisecondes: number
) {
  return new Promise<void>(
    (resolve) => {
      setTimeout(
        resolve,
        millisecondes
      )
    }
  )
}