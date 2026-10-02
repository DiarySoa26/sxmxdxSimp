"use client"

import { useEffect, useState } from "react"
import { rechercherExercices } from "@/services/exercice-service"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { CalendarDays, Loader2, Search, WalletCards } from "lucide-react"

// ============================================================
// TYPE EXERCICE
// Correspond à ExerciceDTO du backend
// ============================================================

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

// ============================================================
// ANNEES : 2050 -> 1950
// ============================================================

const ANNEES = Array.from(
  { length: 2050 - 1950 + 1 },
  (_, index) => 2050 - index
)

// ============================================================
// PAGE
// ============================================================

export default function ExercicesPage() {
  const [annee, setAnnee] = useState<string>("TOUS")
  const [exercices, setExercices] = useState<Exercice[]>([])
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState("")

  // ==========================================================
  // CHARGEMENT INITIAL : TOUS LES EXERCICES
  // ==========================================================

  useEffect(() => {
    async function chargerExercices() {
      try {
        setLoading(true)
        setErreur("")

        const resultat = await rechercherExercices(null)
        setExercices(resultat)
      } catch (error) {
        setErreur(
          error instanceof Error
            ? error.message
            : "Une erreur est survenue."
        )
      } finally {
        setLoading(false)
      }
    }

    chargerExercices()
  }, [])

  // ==========================================================
  // RECHERCHE
  // TOUS -> null
  // Une année -> Number(annee)
  // ==========================================================

  async function rechercher() {
    try {
      setLoading(true)
      setErreur("")

      const resultat = await rechercherExercices(
        annee === "TOUS" ? null : Number(annee)
      )

      setExercices(resultat)
    } catch (error) {
      setErreur(
        error instanceof Error
          ? error.message
          : "Erreur pendant la recherche."
      )
    } finally {
      setLoading(false)
    }
  }

  // ==========================================================
  // GENERER BUDGET
  // ==========================================================

  function genererBudget(exercice: Exercice) {
    console.log("Génération budget :", {
      idExercice: exercice.idExercice,
      anneeExercice: exercice.anneeExercice,
      idImportFichier: exercice.idImportFichier,
    })
  }

  // ==========================================================
  // STATUT
  // ==========================================================

  function afficherStatut(statut: string | null) {
    if (!statut) {
      return <Badge variant="outline">Aucun statut</Badge>
    }

    if (statut === "PRET_GENERATION") {
      return <Badge>PRET_GENERATION</Badge>
    }

    if (statut === "ERREUR") {
      return <Badge variant="destructive">ERREUR</Badge>
    }

    if (statut === "EN_COURS") {
      return <Badge variant="secondary">EN_COURS</Badge>
    }

    return <Badge variant="outline">{statut}</Badge>
  }

  // ==========================================================
  // DATE
  // ==========================================================

  function afficherDate(date: string | null) {
    if (!date) {
      return "—"
    }

    const valeur = new Date(date)

    if (Number.isNaN(valeur.getTime())) {
      return date
    }

    return valeur.toLocaleString("fr-FR")
  }

  // ==========================================================
  // AFFICHAGE
  // ==========================================================

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">

      {/* ENTETE */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Exercices</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Recherchez et consultez les exercices importés dans l&apos;application.
        </p>
      </div>

      {/* RECHERCHE */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Rechercher un exercice
          </CardTitle>

          <CardDescription>
            Sélectionnez une année puis cliquez sur Rechercher.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-end">

            <div className="w-full space-y-2 md:w-[300px]">
              <label htmlFor="annee" className="text-sm font-medium">
                Année de l&apos;exercice
              </label>

              <Select value={annee} onValueChange={(value) => setAnnee(value ?? "TOUS")}>
                {/* <SelectTrigger id="annee" className="h-11 w-full">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Sélectionner une année" />
                  </div>
                </SelectTrigger> */}

                <SelectTrigger id="annee" className="h-11 w-full">
  <SelectValue placeholder="Sélectionner une année" />
</SelectTrigger>

                <SelectContent className="max-h-[300px]">
                  <SelectItem value="TOUS">Toutes les années</SelectItem>

                  {ANNEES.map((item) => (
                    <SelectItem key={item} value={String(item)}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button className="h-11 min-w-[140px]" onClick={rechercher} disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Rechercher
            </Button>

          </div>
        </CardContent>
      </Card>

      {/* LISTE */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Liste des exercices</CardTitle>

              <CardDescription className="mt-1">
                {annee === "TOUS"
                  ? "Tous les exercices disponibles."
                  : `Exercices de l'année ${annee}.`}
              </CardDescription>
            </div>

            {!loading && (
              <Badge variant="outline">
                {exercices.length} résultat{exercices.length > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent>

          {/* ERREUR */}
          {erreur && (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              {erreur}
            </div>
          )}

          <div className="overflow-hidden rounded-lg border">
            <Table>

              <TableHeader>
                <TableRow>
                  <TableHead>Année</TableHead>
                  <TableHead>Fichier importé</TableHead>
                  <TableHead>N° Import</TableHead>
                  <TableHead>État de l&apos;import</TableHead>
                  <TableHead>Date import</TableHead>
                  {/* <TableHead>Message</TableHead> */}
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>

                {/* CHARGEMENT */}
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Chargement des exercices...
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>

                ) : exercices.length === 0 ? (

                  /* AUCUN RESULTAT */
                  <TableRow>
                    <TableCell colSpan={7} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <CalendarDays className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Aucun exercice trouvé.
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>

                ) : (

                  /* RESULTATS */
                  exercices.map((exercice) => (
                    <TableRow
                      key={`${exercice.idExercice}-${exercice.idImportFichier ?? "sans-import"}`}
                    >

                      {/* ANNEE */}
                      <TableCell>
                        <div className="flex items-center gap-2 font-medium">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                          {exercice.anneeExercice}
                        </div>
                      </TableCell>

                      {/* FICHIER */}
                      <TableCell>
                        {exercice.nomFichier ? (
                          <span className="text-sm">{exercice.nomFichier}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>

                      {/* IMPORT */}
                      <TableCell>
                        {exercice.idImportFichier !== null ? (
                          <span className="font-mono text-sm">
                            #{exercice.idImportFichier}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>

                      {/* STATUT */}
                      <TableCell>
                        {afficherStatut(exercice.statut)}
                      </TableCell>

                      {/* DATE */}
                      <TableCell>
                        <span className="whitespace-nowrap text-sm">
                          {afficherDate(exercice.dateImport)}
                        </span>
                      </TableCell>

                      {/* MESSAGE
                      <TableCell>
                        {exercice.messageErreur ? (
                          <span className="text-sm text-destructive">
                            {exercice.messageErreur}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell> */}

                      {/* ACTION */}
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => genererBudget(exercice)}
                        >
                          <WalletCards className="mr-2 h-4 w-4" />
                          Générer budget
                        </Button>
                      </TableCell>

                    </TableRow>
                  ))
                )}

              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}