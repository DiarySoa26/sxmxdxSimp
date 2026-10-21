"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import {
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileSpreadsheet,
  ShieldCheck,
  WalletCards,
  Loader2
} from "lucide-react"

import { Button } from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

import { terminerJalon } from "@/services/campagne-service"

export type Jalon = {
  id: number
  code: string
  nom: string
  ordre: number
  statut: string
  dateLimite?: string | null
  dateRealisation?: string | null
}

type Props = {
  campagneId: number
  exerciceId: number
  jalons: Jalon[]
  busy?: boolean
  onJalonTermine?: () => void | Promise<void>
}

const icones = {
  IMPORTATION: FileSpreadsheet,
  GENERATION: WalletCards,
  VERIFICATION: ClipboardCheck,
  VALIDATION: ShieldCheck
}

function dateFR(date?: string | null) {
  if (!date) return "Non définie"

  const [annee, mois, jour] =
    date.substring(0, 10).split("-")

  return annee && mois && jour
    ? `${jour}/${mois}/${annee}`
    : date
}

const attendre = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms))

export default function JalonBudgetaire({
  campagneId,
  exerciceId,
  jalons = [],
  busy = false,
  onJalonTermine
}: Props) {

  const router = useRouter()
  const searchParams = useSearchParams()

  const traitementRef = useRef(false)

  const [jalonConsulte, setJalonConsulte] =
    useState<number | null>(null)

  const [validationEnCours, setValidationEnCours] =
    useState(false)

  const [actualisationEnCours, setActualisationEnCours] =
    useState(false)

  const [erreurValidation, setErreurValidation] =
    useState("")

  const [avertissement, setAvertissement] =
    useState("")

  const [jalonsLocaux, setJalonsLocaux] =
    useState<Jalon[]>(jalons)

  // Synchronisation avec les données du parent
  useEffect(() => {
    setJalonsLocaux(jalons)
  }, [jalons])

  const jalonsTries = useMemo(
    () =>
      [...jalonsLocaux].sort(
        (a, b) => a.ordre - b.ordre
      ),
    [jalonsLocaux]
  )

  const prerequisTermines = useMemo(
    () =>
      ["IMPORTATION", "GENERATION"].every(code =>
        jalonsLocaux.some(
          j =>
            j.code?.toUpperCase() === code &&
            j.statut?.toUpperCase() === "TERMINE"
        )
      ),
    [jalonsLocaux]
  )

  const verificationTerminee = useMemo(
    () =>
      jalonsLocaux.some(
        j =>
          j.code?.toUpperCase() === "VERIFICATION" &&
          j.statut?.toUpperCase() === "TERMINE"
      ),
    [jalonsLocaux]
  )

  // Retour depuis la consultation du budget
  useEffect(() => {
    const retour =
      searchParams.get("retourVerification") === "1"

    const campagneRetour =
      searchParams.get("campagneId")

    const jalonRetour =
      Number(searchParams.get("jalonId"))

    if (
      retour &&
      campagneRetour === String(campagneId) &&
      Number.isInteger(jalonRetour) &&
      jalonRetour > 0 &&
      sessionStorage.getItem(
        `verification-consultee-${campagneId}-${jalonRetour}`
      ) === "true"
    ) {
      setJalonConsulte(jalonRetour)
    }
  }, [searchParams, campagneId])

  function consulterBudget(jalonId: number) {

    const id = Number(exerciceId)

    if (!Number.isInteger(id) || id <= 0) {
      setErreurValidation(
        "Impossible d'ouvrir le budget : identifiant de l'exercice manquant."
      )
      return
    }

    setErreurValidation("")
    setAvertissement("")

    const params = new URLSearchParams({
      exerciceId: String(id),
      campagneId: String(campagneId),
      jalonId: String(jalonId),
      verification: "1"
    })

    router.push(
      `/dashboard/budgets?${params.toString()}`
    )
  }

  async function validerVerification(jalonId: number) {

    if (traitementRef.current || busy) return

    if (!prerequisTermines) {
      setErreurValidation(
        "L'importation et la génération doivent être terminées avant la vérification."
      )
      return
    }

    traitementRef.current = true

    const debut = Date.now()
    let verificationEnregistree = false

    setValidationEnCours(true)
    setActualisationEnCours(false)
    setErreurValidation("")
    setAvertissement("")

    try {

      // 1. Enregistrer la vérification
      const resultat = await terminerJalon(
        campagneId,
        jalonId
      )

      if (
        resultat &&
        typeof resultat === "object" &&
        "success" in resultat &&
        resultat.success === false
      ) {
        throw new Error(
          "message" in resultat &&
          typeof resultat.message === "string"
            ? resultat.message
            : "La vérification a échoué."
        )
      }

      verificationEnregistree = true

      // 2. Mettre à jour immédiatement le jalon
      const dateRealisation =
        resultat &&
        typeof resultat === "object" &&
        "dateRealisation" in resultat &&
        typeof resultat.dateRealisation === "string"
          ? resultat.dateRealisation
          : new Date().toISOString()

      setJalonsLocaux(anciens =>
        anciens.map(j =>
          j.id === jalonId
            ? {
                ...j,
                statut: "TERMINE",
                dateRealisation
              }
            : j
        )
      )

      // 3. Nettoyer l'état de consultation
      sessionStorage.removeItem(
        `verification-consultee-${campagneId}-${jalonId}`
      )

      setJalonConsulte(null)

      // 4. Recharger les données du parent
      setValidationEnCours(false)
      setActualisationEnCours(true)

      if (onJalonTermine) {
        try {
          await onJalonTermine()
        } catch (erreur) {
          console.error(
            "Erreur d'actualisation de la campagne :",
            erreur
          )

          setAvertissement(
            "La vérification a été enregistrée, mais l'actualisation des statistiques a échoué. Actualisez la page."
          )
        }
      } else {
        setAvertissement(
          "La vérification est enregistrée. Le composant parent doit fournir onJalonTermine pour actualiser les statistiques et activer la validation."
        )
      }

      router.refresh()

    } catch (error) {

      console.error(
        "Erreur de vérification :",
        error
      )

      if (!verificationEnregistree) {
        setErreurValidation(
          error instanceof Error
            ? error.message
            : "Impossible de terminer la vérification."
        )
      }

    } finally {

      // Loader visible au moins 2 secondes
      const tempsEcoule = Date.now() - debut
      const restant = Math.max(
        0,
        2000 - tempsEcoule
      )

      if (restant > 0) {
        await attendre(restant)
      }

      setValidationEnCours(false)
      setActualisationEnCours(false)
      traitementRef.current = false
    }
  }

  const chargement =
    validationEnCours ||
    actualisationEnCours ||
    busy

  return (
    <Card>

      <CardHeader>
        <CardTitle className="text-base">
          Jalons budgétaires
        </CardTitle>

        <p className="text-sm text-muted-foreground">
          Suivi des étapes de la campagne budgétaire
        </p>
      </CardHeader>

      <CardContent className="space-y-3">

        {erreurValidation && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/20 dark:text-red-300"
          >
            {erreurValidation}
          </div>
        )}

        {avertissement && (
          <div
            role="status"
            className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-300"
          >
            {avertissement}
          </div>
        )}

        {chargement && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-center gap-3 rounded-lg border bg-muted/40 p-4"
          >
            <Loader2 className="h-5 w-5 animate-spin" />

            <div className="space-y-1">
              <p className="text-sm font-medium">
                {validationEnCours
                  ? "Enregistrement de la vérification..."
                  : "Actualisation de la campagne..."}
              </p>

              <p className="text-xs text-muted-foreground">
                Mise à jour des jalons et des statistiques
              </p>
            </div>
          </div>
        )}

        {jalonsTries.map(j => {

          const code = j.code?.toUpperCase()

          const Icone =
            icones[code as keyof typeof icones] ??
            CalendarDays

          const termine =
            j.statut?.toUpperCase() === "TERMINE"

          const estVerification =
            code === "VERIFICATION"

          const consultationEffectuee =
            jalonConsulte === j.id

          const peutVerifier =
            prerequisTermines && !termine

          return (
            <div
              key={j.id}
              className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
            >

              <div className="flex items-start gap-3">

                <div className="rounded-lg bg-muted p-2.5">
                  <Icone className="h-5 w-5 text-muted-foreground" />
                </div>

                <div className="space-y-1">

                  <div className="flex flex-wrap items-center gap-2">

                    <p className="font-medium">
                      {j.ordre}. {j.nom}
                    </p>

                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        termine
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {termine
                        ? "Terminé"
                        : j.statut?.toUpperCase() === "EN_ATTENTE"
                          ? "En attente"
                          : j.statut}
                    </span>

                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">

                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Échéance : {dateFR(j.dateLimite)}
                    </span>

                    {j.dateRealisation && (
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Réalisé le {dateFR(j.dateRealisation)}
                      </span>
                    )}

                  </div>

                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">

                {termine ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : estVerification ? (
                  <>

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={chargement}
                      onClick={() => consulterBudget(j.id)}
                    >
                      <ClipboardCheck className="mr-2 h-4 w-4" />
                      Vérifier les détails
                    </Button>

                    {consultationEffectuee && (
                      <Button
                        type="button"
                        size="sm"
                        disabled={
                          chargement ||
                          !peutVerifier
                        }
                        onClick={() =>
                          validerVerification(j.id)
                        }
                      >
                        {chargement ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Traitement...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Vérification terminée
                          </>
                        )}
                      </Button>
                    )}

                  </>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock3 className="h-4 w-4" />

                    {code === "VALIDATION"
                      ? verificationTerminee
                        ? "Prêt pour validation"
                        : "En attente de validation"
                      : "Étape enregistrée"}
                  </span>
                )}

              </div>
            </div>
          )
        })}

        {jalonsTries.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Aucun jalon disponible.
          </p>
        )}

      </CardContent>
    </Card>
  )
}
