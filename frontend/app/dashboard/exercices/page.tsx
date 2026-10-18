// "use client"

// import { useEffect, useState } from "react"
// import { rechercherExercices } from "@/services/exercice-service"

// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// import { CalendarDays, Loader2, Search, WalletCards } from "lucide-react"

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

// const ANNEES = Array.from(
//   { length: 2050 - 1950 + 1 },
//   (_, index) => 2050 - index
// )

// export default function ExercicesPage() {
//   const [annee, setAnnee] = useState<string>("TOUS")
//   const [exercices, setExercices] = useState<Exercice[]>([])
//   const [loading, setLoading] = useState(true)
//   const [erreur, setErreur] = useState("")


//   useEffect(() => {
//     async function chargerExercices() {
//       try {
//         setLoading(true)
//         setErreur("")

//         const resultat = await rechercherExercices(null)
//         setExercices(resultat)
//       } catch (error) {
//         setErreur(
//           error instanceof Error
//             ? error.message
//             : "Une erreur est survenue."
//         )
//       } finally {
//         setLoading(false)
//       }
//     }

//     chargerExercices()
//   }, [])

//   async function rechercher() {
//     try {
//       setLoading(true)
//       setErreur("")

//       const resultat = await rechercherExercices(
//         annee === "TOUS" ? null : Number(annee)
//       )

//       setExercices(resultat)
//     } catch (error) {
//       setErreur(
//         error instanceof Error
//           ? error.message
//           : "Erreur pendant la recherche."
//       )
//     } finally {
//       setLoading(false)
//     }
//   }


//   function genererBudget(exercice: Exercice) {
//     console.log("Génération budget :", {
//       idExercice: exercice.idExercice,
//       anneeExercice: exercice.anneeExercice,
//       idImportFichier: exercice.idImportFichier,
//     })
//   }

//   function afficherStatut(statut: string | null) {
//     if (!statut) {
//       return <Badge variant="outline">Aucun statut</Badge>
//     }

//     if (statut === "PRET_GENERATION") {
//       return <Badge>PRET_GENERATION</Badge>
//     }

//     if (statut === "ERREUR") {
//       return <Badge variant="destructive">ERREUR</Badge>
//     }

//     if (statut === "EN_COURS") {
//       return <Badge variant="secondary">EN_COURS</Badge>
//     }

//     return <Badge variant="outline">{statut}</Badge>
//   }


//   function afficherDate(date: string | null) {
//     if (!date) {
//       return "—"
//     }

//     const valeur = new Date(date)

//     if (Number.isNaN(valeur.getTime())) {
//       return date
//     }

//     return valeur.toLocaleString("fr-FR")
//   }


//   return (
//     <div className="flex flex-1 flex-col gap-6 p-6">

//       {/* ENTETE >>>>>>*/}
//       <div>
//         <h1 className="text-3xl font-bold tracking-tight">Exercices</h1>
//         <p className="mt-1 text-sm text-muted-foreground">
//           Recherchez et consultez les exercices importés dans l&apos;application.
//         </p>
//       </div>

//       {/* RECHERCHE */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <CalendarDays className="h-5 w-5" />
//             Rechercher un exercice
//           </CardTitle>

//           <CardDescription>
//             Sélectionnez une année puis cliquez sur Rechercher.
//           </CardDescription>
//         </CardHeader>

//         <CardContent>
//           <div className="flex flex-col gap-4 md:flex-row md:items-end">

//             <div className="w-full space-y-2 md:w-[300px]">
//               <label htmlFor="annee" className="text-sm font-medium">
//                 Année de l&apos;exercice
//               </label>

//               <Select value={annee} onValueChange={(value) => setAnnee(value ?? "TOUS")}>
//                 {/* <SelectTrigger id="annee" className="h-11 w-full">
//                   <div className="flex items-center gap-2">
//                     <CalendarDays className="h-4 w-4 text-muted-foreground" />
//                     <SelectValue placeholder="Sélectionner une année" />
//                   </div>
//                 </SelectTrigger> */}

//                 <SelectTrigger id="annee" className="h-11 w-full">
//   <SelectValue placeholder="Sélectionner une année" />
// </SelectTrigger>

//                 <SelectContent className="max-h-[300px]">
//                   <SelectItem value="TOUS">Toutes les années</SelectItem>

//                   {ANNEES.map((item) => (
//                     <SelectItem key={item} value={String(item)}>
//                       {item}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <Button className="h-11 min-w-[140px]" onClick={rechercher} disabled={loading}>
//               {loading ? (
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//               ) : (
//                 <Search className="mr-2 h-4 w-4" />
//               )}
//               Rechercher
//             </Button>

//           </div>
//         </CardContent>
//       </Card>

//       {/* LISTE */}
//       <Card>
//         <CardHeader>
//           <div className="flex items-center justify-between gap-4">
//             <div>
//               <CardTitle>Liste des exercices</CardTitle>

//               <CardDescription className="mt-1">
//                 {annee === "TOUS"
//                   ? "Tous les exercices disponibles."
//                   : `Exercices de l'année ${annee}.`}
//               </CardDescription>
//             </div>

//             {!loading && (
//               <Badge variant="outline">
//                 {exercices.length} résultat{exercices.length > 1 ? "s" : ""}
//               </Badge>
//             )}
//           </div>
//         </CardHeader>

//         <CardContent>

//           {/* ERREUR */}
//           {erreur && (
//             <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
//               {erreur}
//             </div>
//           )}

//           <div className="overflow-hidden rounded-lg border">
//             <Table>

//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Année</TableHead>
//                   <TableHead>Fichier importé</TableHead>
//                   <TableHead>N° Import</TableHead>
//                   <TableHead>État de l&apos;import</TableHead>
//                   <TableHead>Date import</TableHead>
//                   {/* <TableHead>Message</TableHead> */}
//                   {/* <TableHead className="text-right">Action</TableHead> */}
//                 </TableRow>
//               </TableHeader>

//               <TableBody>

//                 {/* CHARGEMENT */}
//                 {loading ? (
//                   <TableRow>
//                     <TableCell colSpan={7} className="h-40 text-center">
//                       <div className="flex flex-col items-center justify-center gap-3">
//                         <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
//                         <span className="text-sm text-muted-foreground">
//                           Chargement des exercices...
//                         </span>
//                       </div>
//                     </TableCell>
//                   </TableRow>

//                 ) : exercices.length === 0 ? (

//                   /* AUCUN RESULTAT */
//                   <TableRow>
//                     <TableCell colSpan={7} className="h-40 text-center">
//                       <div className="flex flex-col items-center justify-center gap-2">
//                         <CalendarDays className="h-8 w-8 text-muted-foreground" />
//                         <span className="text-sm text-muted-foreground">
//                           Aucun exercice trouvé.
//                         </span>
//                       </div>
//                     </TableCell>
//                   </TableRow>

//                 ) : (

//                   /* RESULTATS */
//                   exercices.map((exercice) => (
//                     <TableRow
//                       key={`${exercice.idExercice}-${exercice.idImportFichier ?? "sans-import"}`}
//                     >

//                       {/* ANNEE */}
//                       <TableCell>
//                         <div className="flex items-center gap-2 font-medium">
//                           <CalendarDays className="h-4 w-4 text-muted-foreground" />
//                           {exercice.anneeExercice}
//                         </div>
//                       </TableCell>

//                       {/* FICHIER */}
//                       <TableCell>
//                         {exercice.nomFichier ? (
//                           <span className="text-sm">{exercice.nomFichier}</span>
//                         ) : (
//                           <span className="text-sm text-muted-foreground">—</span>
//                         )}
//                       </TableCell>

//                       {/* IMPORT */}
//                       <TableCell>
//                         {exercice.idImportFichier !== null ? (
//                           <span className="font-mono text-sm">
//                             #{exercice.idImportFichier}
//                           </span>
//                         ) : (
//                           <span className="text-muted-foreground">—</span>
//                         )}
//                       </TableCell>

//                       {/* STATUT */}
//                       <TableCell>
//                         {afficherStatut(exercice.statut)}
//                       </TableCell>

//                       {/* DATE */}
//                       <TableCell>
//                         <span className="whitespace-nowrap text-sm">
//                           {afficherDate(exercice.dateImport)}
//                         </span>
//                       </TableCell>

//                       {/* MESSAGE
//                       <TableCell>
//                         {exercice.messageErreur ? (
//                           <span className="text-sm text-destructive">
//                             {exercice.messageErreur}
//                           </span>
//                         ) : (
//                           <span className="text-sm text-muted-foreground">—</span>
//                         )}
//                       </TableCell> */}

//                       {/* ACTION */}
//                       {/* <TableCell className="text-right">
//                         <Button
//                           size="sm"
//                           onClick={() => genererBudget(exercice)}
//                         >
//                           <WalletCards className="mr-2 h-4 w-4" />
//                           Générer budget
//                         </Button>
//                       </TableCell> */}

//                     </TableRow>
//                   ))
//                 )}

//               </TableBody>
//             </Table>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }





"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { rechercherExercices } from "@/services/exercice-service"
import { API_URL } from "@/config/api-config"

import {
  CalendarDays,
  Download,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
  Search,
  FolderOpen,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

import { Button } from "@/components/ui/button"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

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

export default function ExercicesPage() {

  const [annee, setAnnee] = useState("TOUS")
  const [exercices, setExercices] = useState<Exercice[]>([])
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState("")
  const [telechargement, setTelechargement] = useState<number | null>(null)
  const [page, setPage] = useState(1)

  // ============================================
  // CHARGEMENT DES EXERCICES
  // ============================================

  const chargerExercices = useCallback(async () => {
    try {
      setLoading(true)
      setErreur("")

      const resultat = await rechercherExercices(null)

      setExercices(
        Array.isArray(resultat) ? resultat : []
      )

    } catch (error) {
      setErreur(
        error instanceof Error
          ? error.message
          : "Impossible de charger les exercices."
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void chargerExercices()
  }, [chargerExercices])

  // ============================================
  // ANNEES DISPONIBLES DANS LA BASE
  // ============================================

  const anneesDisponibles = useMemo(() => {
    return [...new Set(
      exercices
        .map(item => Number(item.anneeExercice))
        .filter(Number.isFinite)
    )].sort((a, b) => b - a)
  }, [exercices])

  // ============================================
  // FILTRAGE PAR ANNEE
  // ============================================

  const exercicesFiltres = useMemo(() => {
    if (annee === "TOUS") {
      return exercices
    }

    return exercices.filter(
      item => String(item.anneeExercice) === annee
    )
  }, [exercices, annee])

  // ============================================
  // TRI PAR ANNEE DECROISSANTE
  // ============================================

  const exercicesTries = useMemo(() => {
    return [...exercicesFiltres].sort((a, b) => {
      const difference = b.anneeExercice - a.anneeExercice

      if (difference !== 0) return difference

      return (b.idImportFichier ?? 0) - (a.idImportFichier ?? 0)
    })
  }, [exercicesFiltres])

  // ============================================
  // PAGINATION
  // ============================================

  const totalPages = Math.max(
    1,
    Math.ceil(exercicesTries.length / PAGE_SIZE)
  )

  const pageCourante = Math.min(page, totalPages)

  const debut = (pageCourante - 1) * PAGE_SIZE

  const exercicesPage = exercicesTries.slice(
    debut,
    debut + PAGE_SIZE
  )

  function changerAnnee(value: string) {
    setAnnee(value)
    setPage(1)
  }

  // ============================================
  // FORMATAGE DATE
  // ============================================

  function afficherDate(date: string | null) {
    if (!date) return "—"

    const valeur = new Date(date)

    if (Number.isNaN(valeur.getTime())) {
      return date
    }

    return valeur.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  // ============================================
  // TELECHARGEMENT FICHIER EXCEL
  // ============================================

  async function telechargerFichier(exercice: Exercice) {
    if (exercice.idImportFichier == null) return

    try {
      setTelechargement(exercice.idImportFichier)
      setErreur("")

      // Nécessite un endpoint Spring Boot correspondant.
      const response = await fetch(
        `${API_URL}/api/importations/${exercice.idImportFichier}/telecharger`
      )

      if (!response.ok) {
        throw new Error(
          "Impossible de télécharger le fichier."
        )
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      try {
        const lien = document.createElement("a")
        lien.href = url
        lien.download =
          exercice.nomFichier ||
          `exercice_${exercice.anneeExercice}.xlsx`

        document.body.appendChild(lien)
        lien.click()
        lien.remove()
      } finally {
        URL.revokeObjectURL(url)
      }

    } catch (error) {
      setErreur(
        error instanceof Error
          ? error.message
          : "Erreur pendant le téléchargement."
      )
    } finally {
      setTelechargement(null)
    }
  }

  // ============================================
  // INTERFACE
  // ============================================

  return (
    <div className="space-y-6 p-4 md:p-6">

      {/* EN-TETE */}
      <div className="flex flex-wrap items-center justify-between gap-4">

        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <CalendarDays className="size-6" />
            Exercices
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Consultation et téléchargement des fichiers
            budgétaires importés dans SXMXDX.
          </p>
        </div>

        <Button
          variant="outline"
          disabled={loading}
          onClick={() => void chargerExercices()}
        >
          <RefreshCw
            className={`mr-2 size-4 ${
              loading ? "animate-spin" : ""
            }`}
          />
          Actualiser
        </Button>
      </div>

      {/* FILTRES */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">

        <div className="mb-4">
          <h2 className="flex items-center gap-2 font-semibold">
            <Search className="size-4" />
            Rechercher un exercice
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Filtrez les exercices selon les années disponibles.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-4">

          <div className="w-full space-y-2 sm:w-[280px]">
            <label
              htmlFor="annee"
              className="text-sm font-medium"
            >
              Année de l'exercice
            </label>

            <Select
              value={annee}
              onValueChange={changerAnnee}
              disabled={loading}
            >
              <SelectTrigger
                id="annee"
                className="h-10 w-full"
              >
                <SelectValue placeholder="Choisir une année" />
              </SelectTrigger>

              <SelectContent className="max-h-[300px]">
                <SelectItem value="TOUS">
                  Toutes les années
                </SelectItem>

                {anneesDisponibles.map(item => (
                  <SelectItem
                    key={item}
                    value={String(item)}
                  >
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

        </div>
      </div>

      {/* ERREUR */}
      {erreur && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {erreur}
        </div>
      )}

      {/* LISTE DES EXERCICES */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">

        {/* TITRE TABLEAU */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">

          <div>
            <h2 className="font-semibold">
              Liste des exercices
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              {annee === "TOUS"
                ? "Ensemble des exercices disponibles."
                : `Exercices de l'année ${annee}.`}
            </p>
          </div>

          <span className="text-sm text-muted-foreground">
            {exercicesTries.length} résultat(s)
          </span>
        </div>

        {/* TABLEAU */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">

            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="p-4 font-medium">
                  Année
                </th>

                <th className="p-4 font-medium">
                  Fichier importé
                </th>

                <th className="p-4 font-medium">
                  Date d'importation
                </th>

                <th className="p-4 text-right font-medium">
                  Téléchargement
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (

                <tr>
                  <td colSpan={4} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="size-6 animate-spin text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Chargement des exercices...
                      </span>
                    </div>
                  </td>
                </tr>

              ) : exercicesPage.length === 0 ? (

                <tr>
                  <td colSpan={4} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <FolderOpen className="size-9 opacity-50" />
                      <span>Aucun exercice trouvé.</span>
                    </div>
                  </td>
                </tr>

              ) : (

                exercicesPage.map(exercice => (
                  <tr
                    key={`${exercice.idExercice}-${exercice.idImportFichier ?? "vide"}`}
                    className="border-t transition-colors hover:bg-muted/30"
                  >

                    {/* ANNEE */}
                    <td className="p-4">
                      <span className="inline-flex items-center gap-2 font-semibold">
                        <CalendarDays className="size-4 text-muted-foreground" />
                        {exercice.anneeExercice}
                      </span>
                    </td>

                    {/* FICHIER */}
                    <td className="p-4">
                      {exercice.nomFichier ? (
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                            <FileSpreadsheet className="size-5 text-emerald-600" />
                          </div>

                          <span
                            className="max-w-[350px] truncate font-medium"
                            title={exercice.nomFichier}
                          >
                            {exercice.nomFichier}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
                          Aucun fichier
                        </span>
                      )}
                    </td>

                    {/* DATE */}
                    <td className="whitespace-nowrap p-4 text-muted-foreground">
                      {afficherDate(exercice.dateImport)}
                    </td>

                    {/* TELECHARGEMENT */}
                    <td className="p-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        disabled={
                          exercice.idImportFichier == null ||
                          telechargement === exercice.idImportFichier
                        }
                        onClick={() => telechargerFichier(exercice)}
                      >
                        {telechargement === exercice.idImportFichier &&
                         telechargement !== null ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Download className="size-4" />
                        )}

                        Télécharger
                      </Button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t p-4">

          <span className="text-sm text-muted-foreground">
            Page {pageCourante} sur {totalPages}

            {exercicesTries.length > 0 &&
              ` · ${debut + 1}–${Math.min(
                debut + PAGE_SIZE,
                exercicesTries.length
              )} sur ${exercicesTries.length}`}
          </span>

          <div className="flex gap-2">

            <Button
              variant="outline"
              size="sm"
              disabled={loading || pageCourante <= 1}
              onClick={() =>
                setPage(p => Math.max(1, p - 1))
              }
            >
              <ChevronLeft className="mr-1 size-4" />
              Précédent
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={loading || pageCourante >= totalPages}
              onClick={() =>
                setPage(p => Math.min(totalPages, p + 1))
              }
            >
              Suivant
              <ChevronRight className="ml-1 size-4" />
            </Button>

          </div>
        </div>

      </div>
    </div>
  )
}
