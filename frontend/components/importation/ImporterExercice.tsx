
// "use client"

// import { useRef, useState } from "react"
// import { CheckCircle2, FileSpreadsheet, Upload, X } from "lucide-react"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { importerExercice } from "@/services/import-service"

// type Props = {
//   message: string
//   onImporte: (resultat: any) => void
// }

// export default function ImporterExercice({ message, onImporte }: Props) {
//   const inputRef = useRef<HTMLInputElement>(null)
//   const router = useRouter()
//   const [file, setFile] = useState<File | null>(null)
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState("")

//   const choisirFichier = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const f = e.target.files?.[0]
//     if (!f) return

//     const ext = f.name.split(".").pop()?.toLowerCase()

//     if (!["xlsx", "xlsm"].includes(ext || "")) {
//       setError("Format autorisé : XLSX ou XLSM.")
//       e.target.value = ""
//       return
//     }

//     setFile(f)
//     setError("")
//   }

//   const retirerFichier = () => {
//     setFile(null)
//     setError("")
//     if (inputRef.current) inputRef.current.value = ""
//   }

//   const importer = async () => {
//     if (!file || loading) return

//     setLoading(true)
//     setError("")

//     try {
//       const result = await importerExercice(file)
//       onImporte(result)
//     } catch (e) {
//       setError(e instanceof Error ? e.message : "Échec de l'importation.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="space-y-6">
//       <input ref={inputRef} type="file" accept=".xlsx,.xlsm"
//         className="hidden" onChange={choisirFichier} />

//       {!file ? (
//         <div
//           className="flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/20 p-8 text-center transition hover:bg-muted/40"
//           onClick={() => inputRef.current?.click()}
//         >
//           <div className="mb-5 flex size-14 items-center justify-center rounded-xl border bg-background">
//             <Upload className="size-6 text-muted-foreground" />
//           </div>

//           <h2 className="font-semibold">Sélectionner un fichier Excel</h2>

//           <p className="mt-2 text-sm text-muted-foreground">
//             Sélectionnez le fichier correspondant à l&apos;exercice.
//           </p>

//           <Button type="button" variant="outline" className="mt-5"
//             onClick={e => { e.stopPropagation(); inputRef.current?.click() }}>
//             <FileSpreadsheet className="mr-2 size-4" />
//             Parcourir
//           </Button>

//           <p className="mt-4 text-xs text-muted-foreground">
//             Formats autorisés : XLSX, XLSM
//           </p>
//         </div>
//       ) : (
//         <div className="rounded-xl border bg-muted/20 p-5">
//           <div className="flex items-center gap-4">
//             <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border bg-background">
//               <FileSpreadsheet className="size-6" />
//             </div>

//             <div className="min-w-0 flex-1">
//               <div className="truncate font-medium">{file.name}</div>
//               <div className="mt-1 text-xs text-muted-foreground">
//                 {(file.size / 1024 / 1024).toFixed(2)} Mo — Prêt à être importé
//               </div>
//             </div>

//             <Button type="button" variant="ghost" size="icon"
//               disabled={loading} onClick={retirerFichier}>
//               <X className="size-4" />
//             </Button>
//           </div>
//         </div>
//       )}

//       {error && (
//         <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
//           {error}
//         </div>
//       )}

//       {message && (
//         <div className="flex items-center gap-3 rounded-lg border bg-muted/20 p-4">
//           <CheckCircle2 className="size-5 shrink-0" />

//           <div className="min-w-0 flex-1">
//             <div className="text-sm font-medium">Budget généré</div>
//             <div className="mt-1 text-sm text-muted-foreground">{message}</div>
//           </div>

//           <Button type="button" variant="outline"
//             onClick={() => router.push("/dashboard/exercices")}>
//             Voir détails
//           </Button>
//         </div>
//       )}

//       <div className="flex justify-end border-t pt-5">
//         <Button type="button" disabled={!file || loading} onClick={importer}>
//           <Upload className="mr-2 size-4" />
//           {loading ? "Importation..." : "Importer"}
//         </Button>
//       </div>
//     </div>
//   )
// }






"use client"

import { useRef, useState } from "react"
import {
  CheckCircle2,
  FileSpreadsheet,
  Upload,
  X,
  Loader2
} from "lucide-react"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { importerExercice } from "@/services/import-service"

type Props = {
  message: string
  onImporte: (resultat: any) => void | Promise<void>
}

const attendre = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms))

export default function ImporterExercice({
  message,
  onImporte
}: Props) {

  const inputRef = useRef<HTMLInputElement>(null)
  const traitementRef = useRef(false)

  const router = useRouter()

  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // ==============================
  // SÉLECTION DU FICHIER
  // ==============================

  const choisirFichier = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (traitementRef.current) return

    const f = e.target.files?.[0]
    if (!f) return

    const ext = f.name
      .split(".")
      .pop()
      ?.toLowerCase()

    if (!["xlsx", "xlsm"].includes(ext || "")) {
      setError("Format autorisé : XLSX ou XLSM.")
      e.target.value = ""
      return
    }

    setFile(f)
    setError("")
  }

  // ==============================
  // RETIRER LE FICHIER
  // ==============================

  const retirerFichier = () => {
    if (traitementRef.current) return

    setFile(null)
    setError("")

    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  // ==============================
  // IMPORTATION AVEC LOADER
  // ==============================

  const importer = async () => {

    if (!file || traitementRef.current) return

    traitementRef.current = true

    const debut = Date.now()

    setLoading(true)
    setError("")

    try {

      // 1. Envoyer le fichier au backend
      const result = await importerExercice(file)

      // 2. Actualiser le parent après importation
      await onImporte(result)

    } catch (e) {

      console.error("Erreur d'importation :", e)

      setError(
        e instanceof Error
          ? e.message
          : "Échec de l'importation."
      )

    } finally {

      // 3. Garder le loader visible au moins 2 secondes
      const tempsEcoule = Date.now() - debut
      const restant = Math.max(
        0,
        2000 - tempsEcoule
      )

      if (restant > 0) {
        await attendre(restant)
      }

      setLoading(false)
      traitementRef.current = false
    }
  }

  // ==============================
  // AFFICHAGE
  // ==============================

  return (
    <div className="space-y-6">

      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xlsm"
        className="hidden"
        disabled={loading}
        onChange={choisirFichier}
      />

      {/* SÉLECTION DU FICHIER */}

      {!file ? (

        <div
          className={`flex min-h-72 flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/20 p-8 text-center transition ${
            loading
              ? "cursor-not-allowed opacity-60"
              : "cursor-pointer hover:bg-muted/40"
          }`}
          onClick={() => {
            if (!loading) {
              inputRef.current?.click()
            }
          }}
        >

          <div className="mb-5 flex size-14 items-center justify-center rounded-xl border bg-background">
            <Upload className="size-6 text-muted-foreground" />
          </div>

          <h2 className="font-semibold">
            Sélectionner un fichier Excel
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Sélectionnez le fichier correspondant à l&apos;exercice.
          </p>

          <Button
            type="button"
            variant="outline"
            className="mt-5"
            disabled={loading}
            onClick={e => {
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

        <div className="rounded-xl border bg-muted/20 p-5">

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
                {loading
                  ? "Importation en cours..."
                  : "Prêt à être importé"}
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

      {/* LOADER

      {loading && (

        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-3 rounded-lg border bg-muted/40 p-4"
        >

          <Loader2 className="size-5 shrink-0 animate-spin" />

          <div className="space-y-1">

            <p className="text-sm font-medium">
              Importation en cours...
            </p>

            <p className="text-xs text-muted-foreground">
              Traitement du fichier Excel et actualisation
              des données. Veuillez patienter.
            </p>

          </div>

        </div>

      )} */}

      {/* ERREUR */}

      {error && (

        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          {error}
        </div>

      )}

      {/* MESSAGE DE SUCCÈS */}

      {message && !loading && (

        <div className="flex items-center gap-3 rounded-lg border bg-muted/20 p-4">

          <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />

          <div className="min-w-0 flex-1">

            <div className="text-sm font-medium">
              Budget généré
            </div>

            <div className="mt-1 text-sm text-muted-foreground">
              {message}
            </div>

          </div>

          {/* <Button
            type="button"
            variant="outline"
            onClick={() =>
              router.push("/dashboard/exercices")
            }
          >
            Voir détails
          </Button> */}

        </div>

      )}

      {/* BOUTON IMPORTER */}

      <div className="flex justify-end border-t pt-5">

        <Button
          type="button"
          disabled={!file || loading}
          onClick={importer}
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

    </div>
  )
}
