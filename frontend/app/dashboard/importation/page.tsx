
"use client"

import { useState } from "react"
import { Info } from "lucide-react"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card"

import ImporterExercice from "@/components/importation/ImporterExercice"
import GenererBudget from "@/components/importation/GenererBudget"
import ProcessusBudgetaire from "@/components/importation/ProcessusBudgetaire"
import FormulaireCampagne from "@/components/campagne/FormulaireCampagne"
import CampagneBudgetaire from "@/components/campagne/CampagneBudgetaire"

type Etape = "IMPORT" | "BUDGET" | "CAMPAGNE"

export default function ImportationPage() {
  const [etape, setEtape] = useState<Etape>("IMPORT")
  const [annee, setAnnee] = useState<number | null>(null)
  const [exerciceId, setExerciceId] = useState<number | null>(null)
  const [message, setMessage] = useState("")
  const [nouvelleId, setNouvelleId] = useState<number | null>(null)

  // const importerTermine = (resultat: any) => {
  //   const anneeResultat = Number(resultat?.annee ?? resultat?.anneeExercice)
  //   const idResultat = Number(
  //     resultat?.exerciceId ?? resultat?.idExercice ?? resultat?.id_exercice
  //   )

  //   setAnnee(Number.isFinite(anneeResultat) && anneeResultat > 0 ? anneeResultat : null)
  //   setExerciceId(Number.isFinite(idResultat) && idResultat > 0 ? idResultat : null)
  //   setMessage("")
  //   setEtape("BUDGET")
  // }


  
  const importerTermine = (resultat: any) => {
    if (resultat?.success === false) {
      console.error("Importation échouée :", resultat?.message)
      return
    }

    const infos = extraireInfosImportation(resultat)

    console.log("Année :", infos.annee)
    console.log("Exercice ID :", infos.exerciceId)
    console.log("Import ID :", infos.importId)

    if (
      !infos.annee ||
      !infos.exerciceId ||
      !Number.isInteger(infos.annee) ||
      !Number.isInteger(infos.exerciceId)
    ) {
      console.error("Impossible d'identifier l'exercice importé :", resultat)
      return
    }

    setAnnee(infos.annee)
    setExerciceId(infos.exerciceId)
    setMessage("")
    setEtape("BUDGET")
  }


  const generationTerminee = (resultat: any) => {
    const id = Number(
      resultat?.exerciceId ?? resultat?.idExercice ?? resultat?.id_exercice
    )
    if (Number.isFinite(id) && id > 0) setExerciceId(id)

    const anneeBudget = Number(resultat?.annee ?? resultat?.anneeExercice)
    if (Number.isFinite(anneeBudget) && anneeBudget > 0) setAnnee(anneeBudget)

    setMessage(resultat?.message || "Budget généré avec succès.")
    setEtape("CAMPAGNE")
  }

  const campagneCreee = (id: number) => {
    setNouvelleId(id)
    setMessage("Budget généré et campagne budgétaire créée avec succès.")
    setAnnee(null)
    setExerciceId(null)
    setEtape("IMPORT")
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b bg-background px-6 py-5 lg:px-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Budgétisation d&apos;un exercice
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Importez un exercice puis générez son budget.
        </p>
      </div>

      <div className="flex-1 bg-muted/20 p-6 lg:p-8">
        <div className="mx-auto max-w-5xl space-y-6">

          <div className="flex gap-3 rounded-lg border bg-background p-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
              <Info className="size-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Processus de budgétisation</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Importez un exercice puis générez son budget avant de créer la campagne.
              </p>
            </div>
          </div>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-lg">
                {etape === "IMPORT"
                  ? "Importation d'un exercice"
                  : etape === "BUDGET"
                    ? annee ? `Génération du budget ${annee}` : "Génération du budget"
                    : annee ? `Campagne budgétaire ${annee}` : "Campagne budgétaire"}
              </CardTitle>
              <CardDescription>
                {etape === "IMPORT"
                  ? "Sélectionnez un fichier Excel au format XLSX ou XLSM."
                  : etape === "BUDGET"
                    ? "L'exercice importé est prêt pour la génération du budget."
                    : "Définissez les échéances de vérification et de validation."}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              {etape === "IMPORT" ? (
                <ImporterExercice message={message} onImporte={importerTermine} />
              ) : etape === "BUDGET" ? (
                <GenererBudget annee={annee} onGenere={generationTerminee} />
              ) : (
                <FormulaireCampagne
                  exerciceId={exerciceId}
                  annee={annee}
                  onSuccess={campagneCreee}
                />
              )}
            </CardContent>
          </Card>

          <ProcessusBudgetaire />
          <CampagneBudgetaire nouvelleId={nouvelleId} />

        </div>
      </div>
    </div>
  )
}


function extraireInfosImportation(resultat: any) {
  const output = String(resultat?.output ?? "")

  const lireNombre = (motif: RegExp) => {
    const valeur = output.match(motif)?.[1]
    return valeur ? Number(valeur) : null
  }

  const annee = resultat?.annee ?? lireNombre(
    /^Exercice\s*:\s*(\d{4})\s*$/m
  )

  const exerciceId = resultat?.exerciceId ??
    resultat?.id_exercice ??
    lireNombre(/^Exercice ID\s*:\s*(\d+)\s*$/m)

  const importId = resultat?.importId ??
    resultat?.import_id ??
    lireNombre(/^Import ID\s*:\s*(\d+)\s*$/m)

  return {
    annee: annee == null ? null : Number(annee),
    exerciceId: exerciceId == null ? null : Number(exerciceId),
    importId: importId == null ? null : Number(importId)
  }
}

