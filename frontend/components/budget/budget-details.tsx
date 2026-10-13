"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  CalendarDays,
  ClipboardCheck,
  Loader2,
  FileText,
  FileSpreadsheet
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger
} from "@/components/ui/select"

import BudgetTabs from "./budget-tabs"
import BudgetError from "./budget-error"

import {
  getBudgetDetails,
  getExercices
} from "@/services/budget-details-service"

import { exporterBudget } from "@/services/budget-export-service"

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
  const router = useRouter()
  const searchParams = useSearchParams()

  const exerciceIdUrl = searchParams.get("exerciceId")
  const campagneIdUrl = searchParams.get("campagneId")
  const jalonIdUrl = searchParams.get("jalonId")
  const modeVerification = searchParams.get("verification") === "1"

  const retourDisponible =
    modeVerification && !!campagneIdUrl && !!jalonIdUrl

  const [exercices, setExercices] = useState<Exercice[]>([])
  const [exerciceId, setExerciceId] = useState("")
  const [anneeSelectionnee, setAnneeSelectionnee] = useState("")
  const [onglet, setOnglet] = useState<OngletBudget>("charges")
  const [data, setData] = useState<any[]>([])

  const [loadingExercices, setLoadingExercices] = useState(true)
  const [loadingData, setLoadingData] = useState(false)
  const [error, setError] = useState("")

  const [exportEnCours, setExportEnCours] =
    useState<"pdf" | "excel" | null>(null)

  // Charger les exercices
  useEffect(() => {
    let actif = true

    async function chargerExercices() {
      try {
        setLoadingExercices(true)
        setError("")
        setExerciceId("")
        setAnneeSelectionnee("")
        setData([])

        const liste = await getExercices()
        if (!actif) return

        if (!Array.isArray(liste) || liste.length === 0) {
          setExercices([])
          return
        }

        setExercices(liste)

        const exerciceCampagne = exerciceIdUrl
          ? liste.find(
              (e: Exercice) =>
                String(e.id_exercice) === exerciceIdUrl
            )
          : null

        if (exerciceIdUrl && !exerciceCampagne) {
          setError(
            "L'exercice associé à cette campagne est introuvable."
          )
          return
        }

        const selection = exerciceCampagne ?? liste[0]

        setExerciceId(String(selection.id_exercice))
        setAnneeSelectionnee(
          String(selection.annee_exercice)
        )
      } catch (erreur) {
        if (!actif) return

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
        if (actif) setLoadingExercices(false)
      }
    }

    chargerExercices()

    return () => {
      actif = false
    }
  }, [exerciceIdUrl])

  // Charger les données de l'exercice
  useEffect(() => {
    if (!exerciceId) return

    let actif = true

    async function chargerDonnees() {
      const debut = Date.now()

      try {
        setLoadingData(true)
        setError("")
        setData([])

        const resultat = await getBudgetDetails(
          onglet,
          Number(exerciceId)
        )

        // Chargement minimum de 3 secondes
        const tempsRestant = Math.max(
          0,
          3000 - (Date.now() - debut)
        )

        if (tempsRestant > 0) {
          await attendre(tempsRestant)
        }

        if (!actif) return

        setData(
          Array.isArray(resultat)
            ? resultat
            : []
        )
      } catch (erreur) {
        const tempsRestant = Math.max(
          0,
          3000 - (Date.now() - debut)
        )

        if (tempsRestant > 0) {
          await attendre(tempsRestant)
        }

        if (!actif) return

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
        if (actif) setLoadingData(false)
      }
    }

    chargerDonnees()

    return () => {
      actif = false
    }
  }, [exerciceId, onglet])

  // Changer l'exercice sélectionné
  function changerExercice(value: string | null) {
    if (value === null) return

    const exercice = exercices.find(
      e => String(e.id_exercice) === value
    )

    if (!exercice) return

    setError("")
    setData([])
    setExerciceId(String(exercice.id_exercice))
    setAnneeSelectionnee(
      String(exercice.annee_exercice)
    )
  }

  // Changer l'onglet budgétaire
  function changerOnglet(value: OngletBudget) {
    setError("")
    setData([])
    setOnglet(value)
  }

  // Export PDF ou Excel directement dans Next.js
  async function exporter(format: "pdf" | "excel") {
    if (
      !exerciceId ||
      !anneeSelectionnee ||
      exportEnCours ||
      loadingData
    ) return

    try {
      setExportEnCours(format)
      setError("")

      await exporterBudget(
        Number(exerciceId),
        Number(anneeSelectionnee),
        format
      )
    } catch (erreur) {
      console.error(
        "Erreur exportation :",
        erreur
      )

      setError(
        erreur instanceof Error
          ? erreur.message
          : "Impossible d'exporter le budget."
      )
    } finally {
      setExportEnCours(null)
    }
  }

  // Retour à la campagne budgétaire
  function retournerAuxJalons() {
    if (
      !campagneIdUrl ||
      !jalonIdUrl ||
      !exerciceIdUrl
    ) return

    if (
      exerciceId !== exerciceIdUrl ||
      loadingData ||
      error
    ) return

    sessionStorage.setItem(
      `verification-consultee-${campagneIdUrl}-${jalonIdUrl}`,
      "true"
    )

    const params = new URLSearchParams({
      campagneId: campagneIdUrl,
      jalonId: jalonIdUrl,
      retourVerification: "1"
    })

    router.push(
      `/dashboard/importation?${params.toString()}`
    )
  }

  return (
    <div className="space-y-6">
      <BudgetError message={error} />

      {/* Sélection de l'exercice */}
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
                {modeVerification
                  ? "Exercice associé à la campagne budgétaire."
                  : "Sélectionnez l'exercice à consulter."}
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
                onValueChange={changerExercice}
              >
                <SelectTrigger className="w-full">
                  <span>
                    {anneeSelectionnee ||
                      "Sélectionner un exercice"}
                  </span>
                </SelectTrigger>

                <SelectContent>
                  {exercices.map(exercice => (
                    <SelectItem
                      key={exercice.id_exercice}
                      value={String(exercice.id_exercice)}
                    >
                      {exercice.annee_exercice}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Données budgétaires */}
      {exerciceId && (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* <div>
                <CardTitle>
                  Données de l&apos;exercice{" "}
                  {anneeSelectionnee}
                </CardTitle>

                <CardDescription className="mt-1">
                  Consultation des données financières et budgétaires. {anneeSelectionnee}
                </CardDescription>
              </div> */}

              {/* Boutons d'exportation */}
              <div className="flex flex-wrap items-center gap-2">

                <Button
                  size="sm"
                  variant="outline"
                  disabled={loadingData || !!exportEnCours || !anneeSelectionnee}
                  onClick={() => exporter("pdf")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Exporter PDF
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  disabled={loadingData || !!exportEnCours || !anneeSelectionnee}
                  onClick={() => exporter("excel")}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Exporter Excel
                </Button>


                {/* Vérification de campagne */}
                {retourDisponible && (
                  <Button
                    size="sm"
                    disabled={
                      loadingData ||
                      !!error ||
                      exerciceId !== exerciceIdUrl
                    }
                    onClick={retournerAuxJalons}
                  >
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    Vérifier
                  </Button>
                )}
              </div>
            </div>
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
                onValueChange={changerOnglet}
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

function attendre(millisecondes: number) {
  return new Promise<void>(
    resolve => setTimeout(resolve, millisecondes)
  )
}
