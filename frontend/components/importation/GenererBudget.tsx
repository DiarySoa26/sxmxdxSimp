
"use client"

import { useState } from "react"
import { CheckCircle2, WalletCards } from "lucide-react"
import { Button } from "@/components/ui/button"
import { genererBudget } from "@/services/budget-service"

type Props = {
  annee: number | null
  onGenere: (resultat: any) => void
}

export default function GenererBudget({ annee, onGenere }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const generer = async () => {
    if (loading) return

    setLoading(true)
    setError("")

    try {
      const result = await genererBudget()
      onGenere(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de la génération du budget.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-72 flex-col items-center justify-center text-center">
      <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-muted">
        <CheckCircle2 className="size-7" />
      </div>

      <h2 className="text-lg font-semibold">
        {annee ? `Exercice ${annee} importé avec succès` : "Exercice importé avec succès"}
      </h2>

      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Générez maintenant le budget de cet exercice pour poursuivre le processus.
      </p>

      {error && (
        <div className="mt-5 w-full max-w-lg rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button type="button" className="mt-6" disabled={loading} onClick={generer}>
        <WalletCards className="mr-2 size-4" />
        {loading ? "Génération..." : annee
          ? `Générer le budget ${annee}`
          : "Générer le budget"}
      </Button>
    </div>
  )
}
