"use client"

import { useRef, useState } from "react"
import {
  CheckCircle2,
  FileSpreadsheet,
  Info,
  Upload,
  WalletCards,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { importerExercice } from "@/services/import-service"
import { genererBudget } from "@/services/budget-service"

import { useRouter } from "next/navigation"

export default function ImportationPage() {
  const inputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [etape, setEtape] = useState<"IMPORT" | "BUDGET">("IMPORT")
  const [annee, setAnnee] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const router = useRouter()
  
  const choisirFichier = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return

    const ext = f.name.split(".").pop()?.toLowerCase()

    if (!["xlsx", "xlsm"].includes(ext || "")) {
      setError("Format autorisé : XLSX ou XLSM.")
      e.target.value = ""
      return
    }

    setFile(f)
    setError("")
    setMessage("")
  }

  const retirerFichier = () => {
    setFile(null)
    setError("")

    if (inputRef.current)
      inputRef.current.value = ""
  }

  const importer = async () => {
    if (!file || loading) return

    setLoading(true)
    setError("")

    try {
      const result = await importerExercice(file)

      setAnnee(result?.annee ?? null)
      setFile(null)
      setEtape("BUDGET")
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Échec de l'importation."
      )
    } finally {
      setLoading(false)
    }
  }

  const generer = async () => {
    if (loading) return

    setLoading(true)
    setError("")

    try {
      const result = await genererBudget()

      setMessage(
        result?.message || "Budget généré avec succès."
      )

      setAnnee(null)
      setEtape("IMPORT")

      if (inputRef.current)
        inputRef.current.value = ""
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Échec de la génération du budget."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col">

      {/* EN-TÊTE */}
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

          {/* INFORMATION */}
          <div className="flex gap-3 rounded-lg border bg-background p-4">

            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
              <Info className="size-4" />
            </div>

            <div>
              <p className="text-sm font-medium">
                Processus de budgétisation
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Importez un exercice puis générez son budget
                avant d&apos;importer un nouvel exercice.
              </p>
            </div>

          </div>

          {/* CARTE PRINCIPALE */}
          <Card>

            <CardHeader className="border-b">

              <CardTitle className="text-lg">
                {etape === "IMPORT"
                  ? "Importation d'un exercice"
                  : annee
                    ? `Génération du budget ${annee}`
                    : "Génération du budget"}
              </CardTitle>

              <CardDescription>
                {etape === "IMPORT"
                  ? "Sélectionnez un fichier Excel au format XLSX ou XLSM."
                  : "L'exercice importé est prêt pour la génération du budget."}
              </CardDescription>

            </CardHeader>

            <CardContent className="p-6">

              {/* ================================================= */}
              {/* ÉTAPE IMPORTATION */}
              {/* ================================================= */}

              {etape === "IMPORT" ? (

                <div key="import" className="space-y-6">

                  <input
                    ref={inputRef}
                    type="file"
                    accept=".xlsx,.xlsm"
                    className="hidden"
                    onChange={choisirFichier}
                  />

                  {!file ? (

                    <div
                      className="flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/20 p-8 text-center transition hover:bg-muted/40"
                      onClick={() => inputRef.current?.click()}
                    >

                      <div className="mb-5 flex size-14 items-center justify-center rounded-xl border bg-background">
                        <Upload className="size-6 text-muted-foreground" />
                      </div>

                      <h2 className="font-semibold">
                        Sélectionner un fichier Excel
                      </h2>

                      <p className="mt-2 text-sm text-muted-foreground">
                        Sélectionnez le fichier correspondant
                        à l&apos;exercice.
                      </p>

                      <Button
                        type="button"
                        variant="outline"
                        className="mt-5"
                        onClick={(e) => {
                          e.stopPropagation()
                          inputRef.current?.click()
                        }}
                      >
                        <FileSpreadsheet className="mr-2 size-4" />
                        Parcourir
                      </Button>

                      <p className="mt-4 text-xs text-muted-foreground">
                        Formats autorisés : XLSX, XLSM
                      </p>

                    </div>

                  ) : (

                    <div
                      key="selected-file"
                      className="rounded-xl border bg-muted/20 p-5"
                    >

                      <div className="flex items-center gap-4">

                        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border bg-background">
                          <FileSpreadsheet className="size-6" />
                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="truncate font-medium">
                            {file.name}
                          </div>

                          <div className="mt-1 text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} Mo
                            {" — "}
                            Prêt à être importé
                          </div>

                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={loading}
                          onClick={retirerFichier}
                        >
                          <X className="size-4" />
                        </Button>

                      </div>

                    </div>

                  )}

                  {/* ERREUR */}
                  {error ? (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                      {error}
                    </div>
                  ) : null}

                  {/* SUCCÈS BUDGET PRÉCÉDENT
                  {message ? (
                    <div className="flex gap-3 rounded-lg border bg-muted/20 p-4">

                      <CheckCircle2 className="size-5 shrink-0" />

                      <div>
                        <div className="text-sm font-medium">
                          Budget généré
                        </div>

                        <div className="mt-1 text-sm text-muted-foreground">
                          {message}
                        </div>
                      </div>

                    </div>
                  ) : null} */}

                  {message ? (
  <div className="flex items-center gap-3 rounded-lg border bg-muted/20 p-4">
    <CheckCircle2 className="size-5 shrink-0" />

    <div className="min-w-0 flex-1">
      <div className="text-sm font-medium">Budget généré</div>
      <div className="mt-1 text-sm text-muted-foreground">{message}</div>
    </div>

    <Button
      type="button"
      variant="outline"
      onClick={() => router.push("/dashboard/exercices")}
    >
      Voir détails
    </Button>
  </div>
) : null}

                  <div className="flex justify-end border-t pt-5">

                    <Button
                      type="button"
                      disabled={!file || loading}
                      onClick={importer}
                    >
                      <Upload className="mr-2 size-4" />

                      {loading
                        ? "Importation..."
                        : "Importer"}
                    </Button>

                  </div>

                </div>

              ) : (

                /* ================================================= */
                /* ÉTAPE GÉNÉRATION */
                /* ================================================= */

                <div
                  key="budget"
                  className="flex min-h-72 flex-col items-center justify-center text-center"
                >

                  <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-muted">
                    <CheckCircle2 className="size-7" />
                  </div>

                  <h2 className="text-lg font-semibold">
                    {annee
                      ? `Exercice ${annee} importé avec succès`
                      : "Exercice importé avec succès"}
                  </h2>

                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    Générez maintenant le budget de cet exercice
                    pour pouvoir effectuer une nouvelle importation.
                  </p>

                  {error ? (
                    <div className="mt-5 w-full max-w-lg rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                      {error}
                    </div>
                  ) : null}

                  <Button
                    type="button"
                    className="mt-6"
                    disabled={loading}
                    onClick={generer}
                  >
                    <WalletCards className="mr-2 size-4" />

                    {loading
                      ? "Génération..."
                      : annee
                        ? `Générer le budget ${annee}`
                        : "Générer le budget"}
                  </Button>

                </div>

              )}

            </CardContent>

          </Card>

          {/* PROCESSUS */}
          <Card>

            <CardHeader>
              <CardTitle className="text-base">
                Processus de budgétisation
              </CardTitle>

              <CardDescription>
                Le traitement comporte deux étapes.
              </CardDescription>
            </CardHeader>

            <CardContent>

              <div className="grid gap-4 md:grid-cols-2">

                <Etape
                  numero="01"
                  titre="Importation"
                  texte="Importation et validation du fichier Excel de l'exercice."
                />

                <Etape
                  numero="02"
                  titre="Génération du budget"
                  texte="Calcul et génération du budget de l'exercice importé."
                />

              </div>

            </CardContent>

          </Card>

        </div>

      </div>

    </div>
  )
}

function Etape({
  numero,
  titre,
  texte,
}: {
  numero: string
  titre: string
  texte: string
}) {
  return (
    <div className="flex gap-3 rounded-lg border p-4">

      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold">
        {numero}
      </div>

      <div>
        <div className="text-sm font-medium">
          {titre}
        </div>

        <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {texte}
        </div>
      </div>

    </div>
  )
}