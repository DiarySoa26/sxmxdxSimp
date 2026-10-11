
"use client"

import { useState } from "react"
import { CalendarDays, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { creerCampagneApresBudget } from "@/services/campagne-service"

type Props = {
  exerciceId: number | null
  annee: number | null
  onSuccess: (id: number) => void
}

function dateLocale() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export default function FormulaireCampagne({ exerciceId, annee, onSuccess }: Props) {
  const [verification, setVerification] = useState(dateLocale())
  const [validation, setValidation] = useState(dateLocale())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const creer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    if (exerciceId == null || annee == null) {
      setError("Identifiant ou année de l'exercice indisponible.")
      return
    }

    if (validation < verification) {
      setError("La validation doit suivre la vérification.")
      return
    }

    setLoading(true)

    try {
      const resultat = await creerCampagneApresBudget({
        exerciceId,
        anneeExercice: annee,
        dateVerification: verification,
        dateValidation: validation
      })

      onSuccess(resultat.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de création de la campagne.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-lg border bg-muted/20 p-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background">
          <CheckCircle2 className="size-5" />
        </div>
        <div>
          <p className="text-sm font-medium">Budget généré avec succès</p>
          <p className="mt-1 text-sm text-muted-foreground">
            L&apos;importation et la génération sont terminées.
            Définissez les échéances restantes.
          </p>
        </div>
      </div>

      <form onSubmit={creer} className="space-y-5">
        <div className="rounded-lg border bg-muted/20 p-4">
          <p className="text-sm font-medium">
            {annee ? `Campagne ${annee}` : "Campagne budgétaire"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Nom de campagne et exercice définis automatiquement.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <CalendarDays className="size-4" />
              Échéance de vérification
            </label>
            <Input type="date" required value={verification}
              onChange={e => {
                setVerification(e.target.value)
                if (validation < e.target.value) setValidation(e.target.value)
              }} />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <CalendarDays className="size-4" />
              Échéance de validation
            </label>
           <Input
  type="date"
  required
  value={validation}
  onChange={e => setValidation(e.target.value)}
/>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex justify-end border-t pt-5">
          <Button
  type="submit"
  disabled={loading || exerciceId == null || annee == null}
>
  <CalendarDays className="mr-2 size-4" />
  {loading ? "Création..." : "Créer la campagne"}
</Button>
        </div>
      </form>
    </div>
  )
}
