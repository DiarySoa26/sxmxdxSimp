
"use client"

import { useEffect } from "react"
import { ShieldCheck, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

type ConfirmationModalProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  loading?: boolean
}

export default function ConfirmationModal({
  open,
  onClose,
  onConfirm,
  loading = false,
}: ConfirmationModalProps) {
  useEffect(() => {
    if (!open) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [open, loading, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose()
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-title"
        aria-describedby="confirmation-description"
        className="w-full max-w-md animate-in fade-in zoom-in-95 rounded-2xl border bg-background p-6 shadow-2xl duration-200"
      >
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Fermer"
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/40">
            <ShieldCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>

          <h2
            id="confirmation-title"
            className="text-xl font-semibold tracking-tight"
          >
            Confirmer la validation
          </h2>

          <p
            id="confirmation-description"
            className="mt-3 text-sm leading-relaxed text-muted-foreground"
          >
            Souhaitez-vous valider définitivement le budget
            et terminer cette campagne budgétaire ?
          </p>

          <div className="mt-7 flex w-full gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl"
              disabled={loading}
              onClick={onClose}
            >
              Annuler
            </Button>

            <Button
              type="button"
              className="flex-1 rounded-xl"
              disabled={loading}
              onClick={onConfirm}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validation...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Valider
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
