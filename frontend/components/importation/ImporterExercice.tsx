
"use client"

import { useRef, useState } from "react"
import { CheckCircle2, FileSpreadsheet, Upload, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { importerExercice } from "@/services/import-service"

type Props = {
  message: string
  onImporte: (resultat: any) => void
}

export default function ImporterExercice({ message, onImporte }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

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
  }

  const retirerFichier = () => {
    setFile(null)
    setError("")
    if (inputRef.current) inputRef.current.value = ""
  }

  const importer = async () => {
    if (!file || loading) return

    setLoading(true)
    setError("")

    try {
      const result = await importerExercice(file)
      onImporte(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de l'importation.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <input ref={inputRef} type="file" accept=".xlsx,.xlsm"
        className="hidden" onChange={choisirFichier} />

      {!file ? (
        <div
          className="flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/20 p-8 text-center transition hover:bg-muted/40"
          onClick={() => inputRef.current?.click()}
        >
          <div className="mb-5 flex size-14 items-center justify-center rounded-xl border bg-background">
            <Upload className="size-6 text-muted-foreground" />
          </div>

          <h2 className="font-semibold">Sélectionner un fichier Excel</h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Sélectionnez le fichier correspondant à l&apos;exercice.
          </p>

          <Button type="button" variant="outline" className="mt-5"
            onClick={e => { e.stopPropagation(); inputRef.current?.click() }}>
            <FileSpreadsheet className="mr-2 size-4" />
            Parcourir
          </Button>

          <p className="mt-4 text-xs text-muted-foreground">
            Formats autorisés : XLSX, XLSM
          </p>
        </div>
      ) : (
        <div className="rounded-xl border bg-muted/20 p-5">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border bg-background">
              <FileSpreadsheet className="size-6" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">{file.name}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} Mo — Prêt à être importé
              </div>
            </div>

            <Button type="button" variant="ghost" size="icon"
              disabled={loading} onClick={retirerFichier}>
              <X className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {message && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/20 p-4">
          <CheckCircle2 className="size-5 shrink-0" />

          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium">Budget généré</div>
            <div className="mt-1 text-sm text-muted-foreground">{message}</div>
          </div>

          <Button type="button" variant="outline"
            onClick={() => router.push("/dashboard/exercices")}>
            Voir détails
          </Button>
        </div>
      )}

      <div className="flex justify-end border-t pt-5">
        <Button type="button" disabled={!file || loading} onClick={importer}>
          <Upload className="mr-2 size-4" />
          {loading ? "Importation..." : "Importer"}
        </Button>
      </div>
    </div>
  )
}
