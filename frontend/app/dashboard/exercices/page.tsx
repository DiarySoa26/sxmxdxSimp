// "use client"

// import { useCallback, useEffect, useMemo, useState } from "react"
// import { rechercherExercices } from "@/services/exercice-service"
// import { API_URL } from "@/config/api-config"

// import {
//   CalendarDays,
//   Download,
//   FileSpreadsheet,
//   Loader2,
//   RefreshCw,
//   Search,
//   FolderOpen,
//   ChevronLeft,
//   ChevronRight
// } from "lucide-react"

// import { Button } from "@/components/ui/button"

// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue
// } from "@/components/ui/select"
// import { telechargerFichierExercice } from "@/services/import-service"

// type Exercice = {
//   idExercice: number
//   anneeExercice: number
//   idImportFichier: number | null
//   nomFichier: string | null
//   exerciceId: number | null
//   statut: string | null
//   dateImport: string | null
//   messageErreur: string | null
// }

// const PAGE_SIZE = 10

// export default function ExercicesPage() {

//   const [annee, setAnnee] = useState("TOUS")
//   const [exercices, setExercices] = useState<Exercice[]>([])
//   const [loading, setLoading] = useState(true)
//   const [erreur, setErreur] = useState("")
//   const [telechargement, setTelechargement] = useState<number | null>(null)
//   const [page, setPage] = useState(1)

//   // ============================================
//   // CHARGEMENT DES EXERCICES
//   // ============================================

//   const chargerExercices = useCallback(async () => {
//     try {
//       setLoading(true)
//       setErreur("")

//       const resultat = await rechercherExercices(null)

//       setExercices(
//         Array.isArray(resultat) ? resultat : []
//       )

//     } catch (error) {
//       setErreur(
//         error instanceof Error
//           ? error.message
//           : "Impossible de charger les exercices."
//       )
//     } finally {
//       setLoading(false)
//     }
//   }, [])

//   useEffect(() => {
//     void chargerExercices()
//   }, [chargerExercices])

//   // ============================================
//   // ANNEES DISPONIBLES DANS LA BASE
//   // ============================================

//   const anneesDisponibles = useMemo(() => {
//     return [...new Set(
//       exercices
//         .map(item => Number(item.anneeExercice))
//         .filter(Number.isFinite)
//     )].sort((a, b) => b - a)
//   }, [exercices])

//   // ============================================
//   // FILTRAGE PAR ANNEE
//   // ============================================

//   const exercicesFiltres = useMemo(() => {
//     if (annee === "TOUS") {
//       return exercices
//     }

//     return exercices.filter(
//       item => String(item.anneeExercice) === annee
//     )
//   }, [exercices, annee])

//   // ============================================
//   // TRI PAR ANNEE DECROISSANTE
//   // ============================================

//   const exercicesTries = useMemo(() => {
//     return [...exercicesFiltres].sort((a, b) => {
//       const difference = b.anneeExercice - a.anneeExercice

//       if (difference !== 0) return difference

//       return (b.idImportFichier ?? 0) - (a.idImportFichier ?? 0)
//     })
//   }, [exercicesFiltres])

//   // ============================================
//   // PAGINATION
//   // ============================================

//   const totalPages = Math.max(
//     1,
//     Math.ceil(exercicesTries.length / PAGE_SIZE)
//   )

//   const pageCourante = Math.min(page, totalPages)

//   const debut = (pageCourante - 1) * PAGE_SIZE

//   const exercicesPage = exercicesTries.slice(
//     debut,
//     debut + PAGE_SIZE
//   )

//   function changerAnnee(value: string) {
//     setAnnee(value)
//     setPage(1)
//   }

//   // ============================================
//   // FORMATAGE DATE
//   // ============================================

//   function afficherDate(date: string | null) {
//     if (!date) return "—"

//     const valeur = new Date(date)

//     if (Number.isNaN(valeur.getTime())) {
//       return date
//     }

//     return valeur.toLocaleString("fr-FR", {
//       day: "2-digit",
//       month: "long",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit"
//     })
//   }

 
// async function telechargerFichier(exercice: Exercice) {
//   if (exercice.idImportFichier == null) return

//   try {
//     setTelechargement(exercice.idImportFichier)
//     setErreur("")

//     await telechargerFichierExercice(exercice.idImportFichier)

//   } catch (error) {
//     setErreur(
//       error instanceof Error
//         ? error.message
//         : "Erreur pendant le téléchargement."
//     )
//   } finally {
//     setTelechargement(null)
//   }
// }


//   return (
//     <div className="space-y-6 p-4 md:p-6">
//       <div className="flex flex-wrap items-center justify-between gap-4">
//         <div>
//           <h1 className="flex items-center gap-2 text-2xl font-semibold">
//             <CalendarDays className="size-6" />
//             Exercices
//           </h1>

//           <p className="mt-1 text-sm text-muted-foreground">
//             Consultation et téléchargement des fichiers
//             budgétaires importés dans SXMXDX.
//           </p>
//         </div>

//         <Button
//           variant="outline"
//           disabled={loading}
//           onClick={() => void chargerExercices()}
//         >
//           <RefreshCw
//             className={`mr-2 size-4 ${
//               loading ? "animate-spin" : ""
//             }`}
//           />
//           Actualiser
//         </Button>
//       </div>
//       <div className="rounded-xl border bg-card p-5 shadow-sm">

//         <div className="mb-4">
//           <h2 className="flex items-center gap-2 font-semibold">
//             <Search className="size-4" />
//             Rechercher un exercice
//           </h2>

//           <p className="mt-1 text-sm text-muted-foreground">
//             Filtrez les exercices selon les années disponibles.
//           </p>
//         </div>

//         <div className="flex flex-wrap items-end gap-4">

//           <div className="w-full space-y-2 sm:w-[280px]">
//             <label
//               htmlFor="annee"
//               className="text-sm font-medium"
//             >
//               Année de l'exercice
//             </label>

//             <Select
//               value={annee}
//               onValueChange={changerAnnee}
//               disabled={loading}
//             >
//               <SelectTrigger
//                 id="annee"
//                 className="h-10 w-full"
//               >
//                 <SelectValue placeholder="Choisir une année" />
//               </SelectTrigger>

//               <SelectContent className="max-h-[300px]">
//                 <SelectItem value="TOUS">
//                   Toutes les années
//                 </SelectItem>

//                 {anneesDisponibles.map(item => (
//                   <SelectItem
//                     key={item}
//                     value={String(item)}
//                   >
//                     {item}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//         </div>
//       </div>
//       {erreur && (
//         <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
//           {erreur}
//         </div>
//       )}
//       <div className="overflow-hidden rounded-xl border bg-card shadow-sm">

//         <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">

//           <div>
//             <h2 className="font-semibold">
//               Liste des exercices
//             </h2>

//             <p className="mt-1 text-xs text-muted-foreground">
//               {annee === "TOUS"
//                 ? "Ensemble des exercices disponibles."
//                 : `Exercices de l'année ${annee}.`}
//             </p>
//           </div>

//           <span className="text-sm text-muted-foreground">
//             {exercicesTries.length} résultat(s)
//           </span>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full text-left text-sm">

//             <thead className="bg-muted/50 text-muted-foreground">
//               <tr>
//                 <th className="p-4 font-medium">
//                   Année
//                 </th>

//                 <th className="p-4 font-medium">
//                   Fichier importé
//                 </th>

//                 <th className="p-4 font-medium">
//                   Date d'importation
//                 </th>

//                 <th className="p-4 text-right font-medium">
//                   Téléchargement
//                 </th>
//               </tr>
//             </thead>

//             <tbody>
//               {loading ? (

//                 <tr>
//                   <td colSpan={4} className="p-12 text-center">
//                     <div className="flex flex-col items-center gap-3">
//                       <Loader2 className="size-6 animate-spin text-muted-foreground" />
//                       <span className="text-muted-foreground">
//                         Chargement des exercices...
//                       </span>
//                     </div>
//                   </td>
//                 </tr>

//               ) : exercicesPage.length === 0 ? (

//                 <tr>
//                   <td colSpan={4} className="p-12 text-center">
//                     <div className="flex flex-col items-center gap-3 text-muted-foreground">
//                       <FolderOpen className="size-9 opacity-50" />
//                       <span>Aucun exercice trouvé.</span>
//                     </div>
//                   </td>
//                 </tr>

//               ) : (

//                 exercicesPage.map(exercice => (
//                   <tr
//                     key={`${exercice.idExercice}-${exercice.idImportFichier ?? "vide"}`}
//                     className="border-t transition-colors hover:bg-muted/30"
//                   >

//                     <td className="p-4">
//                       <span className="inline-flex items-center gap-2 font-semibold">
//                         <CalendarDays className="size-4 text-muted-foreground" />
//                         {exercice.anneeExercice}
//                       </span>
//                     </td>

//                     <td className="p-4">
//                       {exercice.nomFichier ? (
//                         <div className="flex items-center gap-3">
//                           <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
//                             <FileSpreadsheet className="size-5 text-emerald-600" />
//                           </div>

//                           <span
//                             className="max-w-[350px] truncate font-medium"
//                             title={exercice.nomFichier}
//                           >
//                             {exercice.nomFichier}
//                           </span>
//                         </div>
//                       ) : (
//                         <span className="text-muted-foreground">
//                           Aucun fichier
//                         </span>
//                       )}
//                     </td>

//                     <td className="whitespace-nowrap p-4 text-muted-foreground">
//                       {afficherDate(exercice.dateImport)}
//                     </td>

//                     {/* TELECHARGEMENT */}
//                     <td className="p-4 text-right">
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         className="gap-2"
//                         disabled={
//                           exercice.idImportFichier == null ||
//                           telechargement === exercice.idImportFichier
//                         }
//                         onClick={() => telechargerFichier(exercice)}
//                       >
//                         {telechargement === exercice.idImportFichier &&
//                          telechargement !== null ? (
//                           <Loader2 className="size-4 animate-spin" />
//                         ) : (
//                           <Download className="size-4" />
//                         )}

//                         Télécharger
//                       </Button>
//                     </td>

//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//         <div className="flex flex-wrap items-center justify-between gap-3 border-t p-4">

//           <span className="text-sm text-muted-foreground">
//             Page {pageCourante} sur {totalPages}

//             {exercicesTries.length > 0 &&
//               ` · ${debut + 1}–${Math.min(
//                 debut + PAGE_SIZE,
//                 exercicesTries.length
//               )} sur ${exercicesTries.length}`}
//           </span>

//           <div className="flex gap-2">

//             <Button
//               variant="outline"
//               size="sm"
//               disabled={loading || pageCourante <= 1}
//               onClick={() =>
//                 setPage(p => Math.max(1, p - 1))
//               }
//             >
//               <ChevronLeft className="mr-1 size-4" />
//               Précédent
//             </Button>

//             <Button
//               variant="outline"
//               size="sm"
//               disabled={loading || pageCourante >= totalPages}
//               onClick={() =>
//                 setPage(p => Math.min(totalPages, p + 1))
//               }
//             >
//               Suivant
//               <ChevronRight className="ml-1 size-4" />
//             </Button>

//           </div>
//         </div>

//       </div>
//     </div>
//   )
// }











"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { rechercherExercices } from "@/services/exercice-service"
import { telechargerFichierExercice } from "@/services/import-service"
import { CalendarDays, Download, FileSpreadsheet, Loader2, RefreshCw, Search, FolderOpen, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Exercice = {
  idExercice: number
  anneeExercice: number
  idImportFichier: number | null
  nomFichier: string | null
  exerciceId: number | null
  statut: string | null
  dateImport: string | null
  messageErreur: string | null
}

const PAGE_SIZE = 10

function afficherDate(date: string | null) {
  if (!date) return "—"
  const valeur = new Date(date)
  return Number.isNaN(valeur.getTime()) ? date : valeur.toLocaleString("fr-FR", {
    day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
  })
}

export default function ExercicesPage() {
  const [annee, setAnnee] = useState("TOUS")
  const [exercices, setExercices] = useState<Exercice[]>([])
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState("")
  const [telechargement, setTelechargement] = useState<number | null>(null)
  const [page, setPage] = useState(1)

  const chargerExercices = useCallback(async () => {
    setLoading(true)
    setErreur("")
    try {
      const resultat = await rechercherExercices(null)
      setExercices(Array.isArray(resultat) ? resultat : [])
    } catch (error) {
      setErreur(error instanceof Error ? error.message : "Impossible de charger les exercices.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void chargerExercices() }, [chargerExercices])

  const anneesDisponibles = useMemo(() => [...new Set(exercices.map(e => Number(e.anneeExercice)).filter(Number.isFinite))].sort((a, b) => b - a), [exercices])
  const exercicesTries = useMemo(() => exercices
    .filter(e => annee === "TOUS" || String(e.anneeExercice) === annee)
    .sort((a, b) => b.anneeExercice - a.anneeExercice || (b.idImportFichier ?? 0) - (a.idImportFichier ?? 0)), [exercices, annee])
  const totalPages = Math.max(1, Math.ceil(exercicesTries.length / PAGE_SIZE))
  const pageCourante = Math.min(page, totalPages)
  const debut = (pageCourante - 1) * PAGE_SIZE
  const exercicesPage = exercicesTries.slice(debut, debut + PAGE_SIZE)

  async function telechargerFichier(exercice: Exercice) {
    const importId = exercice.idImportFichier
    if (importId == null || telechargement !== null) return
    setTelechargement(importId)
    setErreur("")
    try {
      await telechargerFichierExercice(importId, exercice.nomFichier ?? undefined)
    } catch (error) {
      setErreur(error instanceof Error ? error.message : "Erreur pendant le téléchargement.")
    } finally {
      setTelechargement(null)
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold"><CalendarDays className="size-6" />Exercices</h1>
          <p className="mt-1 text-sm text-muted-foreground">Consultation et téléchargement des fichiers budgétaires importés dans SXMXDX.</p>
        </div>
        <Button variant="outline" disabled={loading} onClick={() => void chargerExercices()}>
          <RefreshCw className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`} />Actualiser
        </Button>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="flex items-center gap-2 font-semibold"><Search className="size-4" />Rechercher un exercice</h2>
          <p className="mt-1 text-sm text-muted-foreground">Filtrez les exercices selon les années disponibles.</p>
        </div>
        <div className="w-full space-y-2 sm:w-[280px]">
          <label htmlFor="annee" className="text-sm font-medium">Année de l'exercice</label>
          <Select value={annee} onValueChange={value => { setAnnee(value); setPage(1) }} disabled={loading}>
            <SelectTrigger id="annee" className="h-10 w-full"><SelectValue placeholder="Choisir une année" /></SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectItem value="TOUS">Toutes les années</SelectItem>
              {anneesDisponibles.map(item => <SelectItem key={item} value={String(item)}>{item}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {erreur && <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{erreur}</div>}

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
          <div>
            <h2 className="font-semibold">Liste des exercices</h2>
            <p className="mt-1 text-xs text-muted-foreground">{annee === "TOUS" ? "Ensemble des exercices disponibles." : `Exercices de l'année ${annee}.`}</p>
          </div>
          <span className="text-sm text-muted-foreground">{exercicesTries.length} résultat(s)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="p-4 font-medium">Année</th>
                <th className="p-4 font-medium">Fichier importé</th>
                <th className="p-4 font-medium">Date d'importation</th>
                <th className="p-4 text-right font-medium">Téléchargement</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="p-12 text-center"><div className="flex flex-col items-center gap-3 text-muted-foreground"><Loader2 className="size-6 animate-spin" />Chargement des exercices...</div></td></tr>
              ) : exercicesPage.length === 0 ? (
                <tr><td colSpan={4} className="p-12 text-center"><div className="flex flex-col items-center gap-3 text-muted-foreground"><FolderOpen className="size-9 opacity-50" />Aucun exercice trouvé.</div></td></tr>
              ) : exercicesPage.map(exercice => (
                <tr key={`${exercice.idExercice}-${exercice.idImportFichier ?? "vide"}`} className="border-t transition-colors hover:bg-muted/30">
                  <td className="p-4"><span className="inline-flex items-center gap-2 font-semibold"><CalendarDays className="size-4 text-muted-foreground" />{exercice.anneeExercice}</span></td>
                  <td className="p-4">
                    {exercice.nomFichier ? (
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10"><FileSpreadsheet className="size-5 text-emerald-600" /></div>
                        <span className="max-w-[350px] truncate font-medium" title={exercice.nomFichier}>{exercice.nomFichier}</span>
                      </div>
                    ) : <span className="text-muted-foreground">Aucun fichier</span>}
                  </td>
                  <td className="whitespace-nowrap p-4 text-muted-foreground">{afficherDate(exercice.dateImport)}</td>
                  <td className="p-4 text-right">
                    <Button size="sm" variant="outline" className="gap-2" disabled={exercice.idImportFichier == null || telechargement !== null} onClick={() => void telechargerFichier(exercice)}>
                      {telechargement === exercice.idImportFichier && telechargement !== null ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                      Télécharger
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t p-4">
          <span className="text-sm text-muted-foreground">Page {pageCourante} sur {totalPages}{exercicesTries.length > 0 && ` · ${debut + 1}–${Math.min(debut + PAGE_SIZE, exercicesTries.length)} sur ${exercicesTries.length}`}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={loading || pageCourante <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}><ChevronLeft className="mr-1 size-4" />Précédent</Button>
            <Button variant="outline" size="sm" disabled={loading || pageCourante >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Suivant<ChevronRight className="ml-1 size-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  )
}
