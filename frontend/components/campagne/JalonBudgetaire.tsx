// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   modifierJalon,
//   terminerJalon
// } from "@/services/campagne-service";

// import { useRouter } from "next/navigation"

// export type Jalon = {
//   id: number;
//   code: string;
//   nom: string;
//   ordre: number;
//   dateLimite: string;
//   dateRealisation: string | null;
//   statut: string;
// };

// const today = () => {
//   const d = new Date();
//   return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
// };

// export default function JalonBudgetaire({
//     campagneId,
//     jalons,
//     fermee,
//     actualiser
//   }: {
//     campagneId: number;
//     jalons: Jalon[];
//     fermee: boolean;
//     actualiser: () => Promise<void>;
//   }) {

//   const [edition, setEdition] = useState<number | null>(null);
//   const [date, setDate] = useState("");
//   const [busy, setBusy] = useState(false);
//   const [error, setError] = useState("");

//   const router = useRouter()

//   const verifierBudget = (exerciceId: number) => {
//     router.push(`/dashboard/budgets?exerciceId=${exerciceId}`)
//   }

//   const action = async (fn: () => Promise<unknown>) => {
//     setBusy(true);
//     setError("");

//     try {
//       await fn();
//       await actualiser();
//       setEdition(null);
//     } catch (e) {
//       setError(e instanceof Error ? e.message : "Erreur");
//     } finally {
//       setBusy(false);
//     }
//   };

//   return (
//     <div className="space-y-3">
//       <h3 className="font-semibold">Jalons</h3>

//       {error && <p className="text-sm text-destructive">{error}</p>}

//       {jalons.map(j => {
//         const fini = j.statut === "TERMINE";
//         const reel = j.dateRealisation?.slice(0, 10);
//         const enRetard = !fini && today() > j.dateLimite;
//         const termineEnRetard = fini && !!reel && reel > j.dateLimite;

//         const statut = termineEnRetard
//           ? "Terminé en retard"
//           : fini
//             ? "Terminé"
//             : enRetard
//               ? "En retard"
//               : today() === j.dateLimite
//                 ? "À échéance"
//                 : "En attente";

//         return (
//           <div key={j.id} className="rounded-lg border p-4">
//             <div className="flex flex-wrap items-center justify-between gap-2">
//               <div>
//                 <p className="text-sm font-medium">
//                   {j.ordre}. {j.nom}
//                 </p>

//                 <p className={`text-xs ${enRetard
//                   ? "text-rose-600"
//                   : "text-muted-foreground"}`}>
//                   {statut} · Limite : {j.dateLimite}
//                   {reel ? ` · Réalisé : ${reel}` : ""}
//                 </p>
//               </div>

//               {!fermee && (
//                 <div className="flex gap-2">
//                   {["VERIFICATION", "VALIDATION"].includes(j.code) && (
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       disabled={busy}
//                       onClick={() => {
//                         setEdition(edition === j.id ? null : j.id);
//                         setDate(j.dateLimite);
//                       }}
//                     >
//                       Échéance
//                     </Button>
//                   )}

//                   {j.code === "VERIFICATION" && !fini && (
//                     <Button
//                       size="sm"
//                       disabled={
//                         busy ||
//                         !jalons
//                           .filter(x => ["IMPORTATION", "GENERATION"].includes(x.code))
//                           .every(x => x.statut === "TERMINE")
//                       }
//                       onClick={() => action(
//                         () => terminerJalon(campagneId, j.id)
//                       )}
//                     >
//                       Vérification terminée
//                     </Button>
//                   )}
//                 </div>
//               )}
//             </div>

//             {edition === j.id && (
//               <div className="mt-3 flex gap-2">
//                 <Input
//                   className="max-w-52"
//                   type="date"
//                   value={date}
//                   onChange={e => setDate(e.target.value)}
//                 />

//                 <Button
//                   size="sm"
//                   disabled={busy || !date}
//                   onClick={() => action(
//                     () => modifierJalon(campagneId, j.id, date)
//                   )}
//                 >
//                   Enregistrer
//                 </Button>
//               </div>
//             )}
//           </div>
//         );
//       })}
//     </div>
//   );
// }










// "use client"

// import { useEffect, useState } from "react"
// import { useRouter, useSearchParams } from "next/navigation"
// import { CalendarDays, CheckCircle2, ClipboardCheck, Clock3, FileSpreadsheet, ShieldCheck, WalletCards } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// export type Jalon = {
//   id: number
//   code: string
//   nom: string
//   ordre: number
//   statut: string
//   dateLimite?: string | null
//   dateRealisation?: string | null
// }

// type Props = {
//   campagneId: number
//   exerciceId: number
//   jalons: Jalon[]
//   busy: boolean
//   action: (operation: () => Promise<unknown>) => void | Promise<void>
//   terminerJalon: (campagneId: number, jalonId: number) => Promise<unknown>
// }

// const icones = {
//   IMPORTATION: FileSpreadsheet,
//   GENERATION: WalletCards,
//   VERIFICATION: ClipboardCheck,
//   VALIDATION: ShieldCheck
// }

// function dateFR(date?: string | null) {
//   if (!date) return "Non définie"
//   const [annee, mois, jour] = date.substring(0, 10).split("-")
//   return annee && mois && jour ? `${jour}/${mois}/${annee}` : date
// }

// export default function JalonBudgetaire({
//   campagneId, exerciceId, jalons = [], busy, action, terminerJalon
// }: Props) {
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const [jalonConsulte, setJalonConsulte] = useState<number | null>(null)

//   const jalonsTries = [...jalons].sort((a, b) => a.ordre - b.ordre)
//   const prerequisTermines = jalons
//     .filter(x => ["IMPORTATION", "GENERATION"].includes(x.code))
//     .every(x => x.statut === "TERMINE")

//   useEffect(() => {
//     const retour = searchParams.get("retourVerification") === "1"
//     const campagneRetour = searchParams.get("campagneId")
//     const jalonRetour = Number(searchParams.get("jalonId"))

//     if (
//       retour &&
//       campagneRetour === String(campagneId) &&
//       Number.isInteger(jalonRetour) &&
//       jalonRetour > 0 &&
//       sessionStorage.getItem(
//         `verification-consultee-${campagneId}-${jalonRetour}`
//       ) === "true"
//     ) {
//       setJalonConsulte(jalonRetour)
//     }
//   }, [searchParams, campagneId])

//   // function consulterBudget(jalonId: number) {
//   //   if (!Number.isInteger(Number(exerciceId)) || Number(exerciceId) <= 0) return

//   //   const params = new URLSearchParams({
//   //     exerciceId: String(exerciceId),
//   //     campagneId: String(campagneId),
//   //     jalonId: String(jalonId),
//   //     verification: "1"
//   //   })

//   //   router.push(`/dashboard/budgets?${params.toString()}`)
//   // }


//   function consulterBudget(jalonId: number) {
//   console.log("Navigation vers BudgetDetails :", {
//     campagneId,
//     exerciceId,
//     jalonId
//   })

//   const id = Number(exerciceId)

//   if (!Number.isInteger(id) || id <= 0) {
//     console.error("Identifiant d'exercice invalide :", exerciceId)
//     alert("Impossible d'ouvrir le budget : identifiant de l'exercice manquant.")
//     return
//   }

//   const params = new URLSearchParams({
//     exerciceId: String(id),
//     campagneId: String(campagneId),
//     jalonId: String(jalonId),
//     verification: "1"
//   })

//   const url = `/dashboard/budgets?${params.toString()}`

//   console.log("URL de destination :", url)
//   router.push(url)
// }

//   function validerVerification(jalonId: number) {
//     action(async () => {
//       await terminerJalon(campagneId, jalonId)
//       sessionStorage.removeItem(`verification-consultee-${campagneId}-${jalonId}`)
//       setJalonConsulte(null)
//     })
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="text-base">Jalons budgétaires</CardTitle>
//         <p className="text-sm text-muted-foreground">
//           Suivi des étapes de la campagne budgétaire
//         </p>
//       </CardHeader>

//       <CardContent className="space-y-3">
//         {jalonsTries.map(j => {
//           const Icone = icones[j.code as keyof typeof icones] ?? CalendarDays
//           const termine = j.statut === "TERMINE"
//           const estVerification = j.code === "VERIFICATION"
//           const peutVerifier = prerequisTermines && !termine
//           const consultationEffectuee = jalonConsulte === j.id

//           return (
//             <div
//               key={j.id}
//               className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
//             >
//               <div className="flex items-start gap-3">
//                 <div className="rounded-lg bg-muted p-2.5">
//                   <Icone className="h-5 w-5 text-muted-foreground" />
//                 </div>

//                 <div className="space-y-1">
//                   <div className="flex flex-wrap items-center gap-2">
//                     <p className="font-medium">{j.ordre}. {j.nom}</p>
//                     <span className={`rounded-full px-2 py-0.5 text-xs ${
//                       termine
//                         ? "bg-emerald-100 text-emerald-700"
//                         : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
//                     }`}>
//                       {termine ? "Terminé" : j.statut === "EN_ATTENTE" ? "En attente" : j.statut}
//                     </span>
//                   </div>

//                   <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
//                     <span className="inline-flex items-center gap-1">
//                       <CalendarDays className="h-3.5 w-3.5" />
//                       Échéance : {dateFR(j.dateLimite)}
//                     </span>
//                     {j.dateRealisation && (
//                       <span className="inline-flex items-center gap-1">
//                         <CheckCircle2 className="h-3.5 w-3.5" />
//                         Réalisé le {dateFR(j.dateRealisation)}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               <div className="flex shrink-0 flex-wrap items-center gap-2">
//                 {termine ? (
//                   <CheckCircle2 className="h-5 w-5 text-emerald-600" />
//                 ) : estVerification ? (
//                   <>
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       // disabled={busy || !peutVerifier || !Number.isInteger(Number(exerciceId)) || Number(exerciceId) <= 0}
//                       onClick={() => consulterBudget(j.id)}
//                     >
//                       <ClipboardCheck className="mr-2 h-4 w-4" />
//                       Vérifier les détails
//                     </Button>

//                     {consultationEffectuee && (
//                       <Button
//                         size="sm"
//                         disabled={busy || !peutVerifier}
//                         onClick={() => validerVerification(j.id)}
//                       >
//                         <CheckCircle2 className="mr-2 h-4 w-4" />
//                         Vérification terminée
//                       </Button>
//                     )}
//                   </>
//                 ) : (
//                   <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
//                     <Clock3 className="h-4 w-4" />
//                     {j.code === "VALIDATION" ? "En attente de validation" : "Étape enregistrée"}
//                   </span>
//                 )}
//               </div>
//             </div>
//           )
//         })}

//         {jalonsTries.length === 0 && (
//           <p className="py-6 text-center text-sm text-muted-foreground">
//             Aucun jalon disponible.
//           </p>
//         )}
//       </CardContent>
//     </Card>
//   )
// }









"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  CalendarDays, CheckCircle2, ClipboardCheck, Clock3,
  FileSpreadsheet, ShieldCheck, WalletCards, Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { terminerJalon } from "@/services/campagne-service"

export type Jalon = {
  id: number
  code: string
  nom: string
  ordre: number
  statut: string
  dateLimite?: string | null
  dateRealisation?: string | null
}

type Props = {
  campagneId: number
  exerciceId: number
  jalons: Jalon[]
  busy?: boolean
  onJalonTermine?: () => void | Promise<void>
}

const icones = {
  IMPORTATION: FileSpreadsheet,
  GENERATION: WalletCards,
  VERIFICATION: ClipboardCheck,
  VALIDATION: ShieldCheck
}

function dateFR(date?: string | null) {
  if (!date) return "Non définie"
  const [annee, mois, jour] = date.substring(0, 10).split("-")
  return annee && mois && jour ? `${jour}/${mois}/${annee}` : date
}

export default function JalonBudgetaire({
  campagneId,
  exerciceId,
  jalons = [],
  busy = false,
  onJalonTermine
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [jalonConsulte, setJalonConsulte] = useState<number | null>(null)
  const [validationEnCours, setValidationEnCours] = useState(false)
  const [erreurValidation, setErreurValidation] = useState("")
  const [jalonsValides, setJalonsValides] = useState<number[]>([])

  const jalonsTries = [...jalons].sort((a, b) => a.ordre - b.ordre)

  const prerequisTermines = ["IMPORTATION", "GENERATION"].every(code =>
    jalons.some(j =>
      j.code?.toUpperCase() === code &&
      j.statut?.toUpperCase() === "TERMINE"
    )
  )

  useEffect(() => {
    const retour = searchParams.get("retourVerification") === "1"
    const campagneRetour = searchParams.get("campagneId")
    const jalonRetour = Number(searchParams.get("jalonId"))

    if (
      retour &&
      campagneRetour === String(campagneId) &&
      Number.isInteger(jalonRetour) &&
      jalonRetour > 0 &&
      sessionStorage.getItem(
        `verification-consultee-${campagneId}-${jalonRetour}`
      ) === "true"
    ) {
      setJalonConsulte(jalonRetour)
    }
  }, [searchParams, campagneId])

  function consulterBudget(jalonId: number) {
    const id = Number(exerciceId)

    if (!Number.isInteger(id) || id <= 0) {
      setErreurValidation(
        "Impossible d'ouvrir le budget : identifiant de l'exercice manquant."
      )
      console.error("Exercice ID invalide :", exerciceId)
      return
    }

    setErreurValidation("")

    const params = new URLSearchParams({
      exerciceId: String(id),
      campagneId: String(campagneId),
      jalonId: String(jalonId),
      verification: "1"
    })

    router.push(`/dashboard/budgets?${params.toString()}`)
  }

  // async function validerVerification(jalonId: number) {
  //   if (validationEnCours || busy) return

  //   if (typeof terminerJalon !== "function") {
  //     setErreurValidation(
  //       "La fonction terminerJalon n'est pas disponible. Vérifiez sa transmission depuis CampagneBudgetaire."
  //     )
  //     return
  //   }

  //   if (!prerequisTermines) {
  //     setErreurValidation(
  //       "L'importation et la génération doivent être terminées avant la validation."
  //     )
  //     return
  //   }

  //   try {
  //     setValidationEnCours(true)
  //     setErreurValidation("")

  //     const resultat = await terminerJalon(campagneId, jalonId)

  //     if (
  //       resultat &&
  //       typeof resultat === "object" &&
  //       "success" in resultat &&
  //       resultat.success === false
  //     ) {
  //       throw new Error(
  //         "message" in resultat && typeof resultat.message === "string"
  //           ? resultat.message
  //           : "La validation du jalon a échoué."
  //       )
  //     }

  //     sessionStorage.removeItem(
  //       `verification-consultee-${campagneId}-${jalonId}`
  //     )

  //     setJalonConsulte(null)
  //     setJalonsValides(anciens =>
  //       anciens.includes(jalonId) ? anciens : [...anciens, jalonId]
  //     )

  //     if (onJalonTermine) await onJalonTermine()
  //     router.refresh()
  //   } catch (error) {
  //     console.error("Erreur validation du jalon :", error)
  //     setErreurValidation(
  //       error instanceof Error
  //         ? error.message
  //         : "Impossible de terminer la vérification."
  //     )
  //   } finally {
  //     setValidationEnCours(false)
  //   }
  // }



async function validerVerification(jalonId: number) {
  if (validationEnCours || busy) return

  if (!prerequisTermines) {
    setErreurValidation(
      "L'importation et la génération doivent être terminées avant la validation."
    )
    return
  }

  try {
    setValidationEnCours(true)
    setErreurValidation("")

    const resultat = await terminerJalon(campagneId, jalonId)

    if (
      resultat &&
      typeof resultat === "object" &&
      "success" in resultat &&
      resultat.success === false
    ) {
      throw new Error(
        "message" in resultat && typeof resultat.message === "string"
          ? resultat.message
          : "La validation du jalon a échoué."
      )
    }

    sessionStorage.removeItem(
      `verification-consultee-${campagneId}-${jalonId}`
    )

    setJalonConsulte(null)

    setJalonsValides(anciens =>
      anciens.includes(jalonId) ? anciens : [...anciens, jalonId]
    )

    if (onJalonTermine) await onJalonTermine()
    router.refresh()
  } catch (error) {
    console.error("Erreur validation du jalon :", error)
    setErreurValidation(
      error instanceof Error
        ? error.message
        : "Impossible de terminer la vérification."
    )
  } finally {
    setValidationEnCours(false)
  }
}


  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Jalons budgétaires
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Suivi des étapes de la campagne budgétaire
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        {erreurValidation && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/20 dark:text-red-300">
            {erreurValidation}
          </div>
        )}

        {jalonsTries.map(j => {
          const code = j.code?.toUpperCase()
          const Icone = icones[code as keyof typeof icones] ?? CalendarDays

          const termine =
            j.statut?.toUpperCase() === "TERMINE" ||
            jalonsValides.includes(j.id)

          const estVerification = code === "VERIFICATION"
          const peutVerifier = prerequisTermines && !termine
          const consultationEffectuee = jalonConsulte === j.id

          return (
            <div
              key={j.id}
              className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-muted p-2.5">
                  <Icone className="h-5 w-5 text-muted-foreground" />
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">
                      {j.ordre}. {j.nom}
                    </p>

                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      termine
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    }`}>
                      {termine
                        ? "Terminé"
                        : j.statut?.toUpperCase() === "EN_ATTENTE"
                          ? "En attente"
                          : j.statut}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Échéance : {dateFR(j.dateLimite)}
                    </span>

                    {j.dateRealisation && (
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Réalisé le {dateFR(j.dateRealisation)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {termine ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : estVerification ? (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busy || validationEnCours}
                      onClick={() => consulterBudget(j.id)}
                    >
                      <ClipboardCheck className="mr-2 h-4 w-4" />
                      Vérifier les détails
                    </Button>

                    {consultationEffectuee && (
                      <Button
                        type="button"
                        size="sm"
                        disabled={busy || validationEnCours || !peutVerifier}
                        onClick={() => validerVerification(j.id)}
                      >
                        {validationEnCours ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Validation...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Vérification terminée
                          </>
                        )}
                      </Button>
                    )}
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock3 className="h-4 w-4" />
                    {code === "VALIDATION"
                      ? "En attente de validation"
                      : "Étape enregistrée"}
                  </span>
                )}
              </div>
            </div>
          )
        })}

        {jalonsTries.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Aucun jalon disponible.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

