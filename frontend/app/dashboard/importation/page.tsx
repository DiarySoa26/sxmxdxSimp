"use client"

import { useRef, useState } from "react"
import {
  CheckCircle2,
  FileSpreadsheet,
  Info,
  Loader2,
  Upload,
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

export default function ImportationPage() {
  const inputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setError("")
    setSuccess("")

    const selectedFile = event.target.files?.[0]

    if (!selectedFile) {
      return
    }

    const extension = selectedFile.name
      .split(".")
      .pop()
      ?.toLowerCase()

    if (extension !== "xlsx" && extension !== "xlsm") {
      setError(
        "Format non accepté. Sélectionnez un fichier Excel .xlsx ou .xlsm."
      )

      event.target.value = ""
      return
    }

    setFile(selectedFile)
  }

  function removeFile() {
    setFile(null)
    setError("")
    setSuccess("")

    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  function openFileSelector() {
    inputRef.current?.click()
  }

  async function handleImport() {
    if (!file) {
      setError(
        "Sélectionnez un fichier Excel avant de lancer l'importation."
      )
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const result = await importerExercice(file)

      setSuccess(
        result.message ||
          "Le fichier a été importé avec succès."
      )
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError(
          "Une erreur est survenue pendant l'importation."
        )
      }
    } finally {
      setLoading(false)
    }
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024) {
      return `${bytes} octets`
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} Ko`
    }

    return `${(bytes / 1024 / 1024).toFixed(2)} Mo`
  }

  return (
    <div className="flex flex-1 flex-col">

      {/* ==================================================== */}
      {/* En-tête */}
      {/* ==================================================== */}

      <div className="border-b bg-background">
        <div className="px-6 py-5 lg:px-8">

          <h1 className="text-2xl font-semibold tracking-tight">
            Importation d&apos;un exercice
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Importez le fichier Excel contenant les données
            budgétaires d&apos;un nouvel exercice.
          </p>

        </div>
      </div>


      {/* ==================================================== */}
      {/* Contenu */}
      {/* ==================================================== */}

      <div className="flex-1 bg-muted/20 p-6 lg:p-8">

        <div className="mx-auto w-full max-w-5xl space-y-6">

          {/* ================================================= */}
          {/* Informations */}
          {/* ================================================= */}

          <div className="flex gap-3 rounded-lg border bg-background p-4">

            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
              <Info className="size-4" />
            </div>

            <div className="space-y-1">

              <p className="text-sm font-medium">
                Importation des données budgétaires
              </p>

              <p className="text-sm leading-relaxed text-muted-foreground">
                Sélectionnez le fichier Excel correspondant
                à l&apos;exercice que vous souhaitez intégrer.
                Le fichier doit respecter la structure utilisée
                par SOMIDA.
              </p>

            </div>

          </div>


          {/* ================================================= */}
          {/* Carte principale */}
          {/* ================================================= */}

          <Card>

            <CardHeader className="border-b">

              <CardTitle className="text-lg">
                Fichier de l&apos;exercice
              </CardTitle>

              <CardDescription>
                Sélectionnez un fichier Excel au format
                .xlsx ou .xlsm.
              </CardDescription>

            </CardHeader>


            <CardContent className="p-6">

              <input
                ref={inputRef}
                id="excel-file"
                type="file"
                accept=".xlsx,.xlsm"
                className="hidden"
                onChange={handleFileChange}
              />


              {/* ============================================= */}
              {/* Aucun fichier sélectionné */}
              {/* ============================================= */}

              {!file && (

                <div
                  onClick={openFileSelector}
                  className="
                    group
                    flex
                    min-h-72
                    cursor-pointer
                    flex-col
                    items-center
                    justify-center
                    rounded-xl
                    border-2
                    border-dashed
                    bg-muted/20
                    px-6
                    py-12
                    text-center
                    transition
                    hover:border-foreground/30
                    hover:bg-muted/40
                  "
                >

                  <div className="
                    mb-5
                    flex
                    size-14
                    items-center
                    justify-center
                    rounded-xl
                    border
                    bg-background
                    shadow-sm
                  ">
                    <Upload className="size-6 text-muted-foreground" />
                  </div>


                  <h2 className="text-base font-semibold">
                    Sélectionner un fichier Excel
                  </h2>


                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    Cliquez dans cette zone pour sélectionner
                    le fichier correspondant à l&apos;exercice
                    à importer.
                  </p>


                  <Button
                    type="button"
                    variant="outline"
                    className="mt-5"
                    onClick={(event) => {
                      event.stopPropagation()
                      openFileSelector()
                    }}
                  >
                    <FileSpreadsheet className="mr-2 size-4" />

                    Parcourir les fichiers
                  </Button>


                  <p className="mt-4 text-xs text-muted-foreground">
                    Formats autorisés : XLSX, XLSM
                  </p>

                </div>

              )}


              {/* ============================================= */}
              {/* Fichier sélectionné */}
              {/* ============================================= */}

              {file && (

                <div className="space-y-6">

                  <div className="rounded-xl border bg-muted/20 p-5">

                    <div className="flex items-center gap-4">

                      <div className="
                        flex
                        size-12
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        border
                        bg-background
                      ">
                        <FileSpreadsheet className="size-6" />
                      </div>


                      <div className="min-w-0 flex-1">

                        <p className="truncate font-medium">
                          {file.name}
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">

                          <span>
                            {formatFileSize(file.size)}
                          </span>

                          <span>
                            •
                          </span>

                          <span>
                            Fichier Excel
                          </span>

                          <span>
                            •
                          </span>

                          <span>
                            Prêt à être importé
                          </span>

                        </div>

                      </div>


                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={loading}
                        onClick={removeFile}
                      >
                        <X className="size-4" />

                        <span className="sr-only">
                          Retirer le fichier
                        </span>
                      </Button>

                    </div>

                  </div>


                  {/* Changer de fichier */}

                  <Button
                    type="button"
                    variant="outline"
                    disabled={loading}
                    onClick={openFileSelector}
                  >
                    <FileSpreadsheet className="mr-2 size-4" />
                    Changer de fichier
                  </Button>

                </div>

              )}


              {/* ============================================= */}
              {/* Messages */}
              {/* ============================================= */}

              {error && (

                <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4">

                  <p className="text-sm font-medium text-destructive">
                    Importation impossible
                  </p>

                  <p className="mt-1 text-sm text-destructive/90">
                    {error}
                  </p>

                </div>

              )}


              {success && (

                <div className="mt-6 flex gap-3 rounded-lg border bg-muted/20 p-4">

                  <CheckCircle2 className="mt-0.5 size-5 shrink-0" />

                  <div>

                    <p className="text-sm font-medium">
                      Importation terminée
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {success}
                    </p>

                  </div>

                </div>

              )}

            </CardContent>


            {/* =============================================== */}
            {/* Pied de carte / action principale */}
            {/* =============================================== */}

            <div className="flex items-center justify-between border-t px-6 py-4">

              <p className="text-xs text-muted-foreground">
                {/* Un seul fichier peut être importé à la fois. */}
              </p>


              <Button
                type="button"
                disabled={!file || loading}
                onClick={handleImport}
                className="min-w-32"
              >

                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Importation...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 size-4" />
                    Importer
                  </>
                )}

              </Button>

            </div>

          </Card>


          {/* ================================================= */}
          {/* Étapes */}
          {/* ================================================= */}

          <Card>

            <CardHeader>

              <CardTitle className="text-base">
                Processus d&apos;importation
              </CardTitle>

              <CardDescription>
                Le fichier sera contrôlé avant son intégration
                dans les données budgétaires.
              </CardDescription>

            </CardHeader>


            <CardContent>

              <div className="grid gap-4 md:grid-cols-3">

                <ProcessStep
                  number="01"
                  title="Sélection"
                  description="Sélection du fichier Excel de l'exercice."
                />

                <ProcessStep
                  number="02"
                  title="Validation"
                  description="Contrôle de la structure et des données."
                />

                <ProcessStep
                  number="03"
                  title="Intégration"
                  description="Importation des données validées."
                />

              </div>

            </CardContent>

          </Card>

        </div>

      </div>

    </div>
  )
}


function ProcessStep({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <div className="flex gap-3 rounded-lg border p-4">

      <div className="
        flex
        size-8
        shrink-0
        items-center
        justify-center
        rounded-md
        bg-muted
        text-xs
        font-semibold
      ">
        {number}
      </div>

      <div>
        <p className="text-sm font-medium">
          {title}
        </p>

        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

    </div>
  )
}