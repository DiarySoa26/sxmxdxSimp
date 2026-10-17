
"use client"

import { useEffect, useState } from "react"
import {
  BrainCircuit,
  AlertCircle,
  Loader2,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  BarChart3,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

import {
  getExercicesEvaluables,
  evaluerPrediction,
} from "@/services/evaluation-prediction-service"

type Indicateur = {
  code: string
  libelle: string
  unite: string
  constate: number
  prevision: number
  ecart: number
  erreurAbsolue: number
  erreurPourcentage: number | null
  diagnostic: string
}

type Evaluation = {
  annee: number
  budgetGenereId: number
  budgetPrevisionnelId: number
  indicateurs: Indicateur[]
  interpretations: string[]
}

const formatNombre = (value: number) =>
  new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

const formatPourcentage = (value: number | null) =>
  value == null
    ? "Non calculable"
    : `${Number(value).toFixed(2)} %`

const formatValeur = (value: number, unite: string) => {
  if (unite === "POINT") {
    return `${(Number(value) * 100).toFixed(2)} %`
  }

  return `${formatNombre(value)} MGA`
}

const formatEcart = (value: number, unite: string) => {
  if (unite === "POINT") {
    return `${(Number(value) * 100).toFixed(2)} pts`
  }

  return `${formatNombre(value)} MGA`
}

export default function EvaluationPrediction() {
  const [annees, setAnnees] = useState<number[]>([])
  const [annee, setAnnee] = useState("")
  const [evaluation, setEvaluation] =
    useState<Evaluation | null>(null)

  const [loading, setLoading] = useState(false)
  const [loadingAnnees, setLoadingAnnees] = useState(true)
  const [erreur, setErreur] = useState("")

  useEffect(() => {
    let actif = true

    const charger = async () => {
      try {
        const data = await getExercicesEvaluables()

        if (!actif) return

        const liste = Array.isArray(data)
          ? data.map(Number).sort((a, b) => b - a)
          : []

        setAnnees(liste)

        if (liste.length > 0) {
          setAnnee(String(liste[0]))
        }
      } catch (error: any) {
        if (actif) {
          setErreur(
            error.message ||
              "Impossible de récupérer les exercices."
          )
        }
      } finally {
        if (actif) setLoadingAnnees(false)
      }
    }

    charger()

    return () => {
      actif = false
    }
  }, [])

  const lancerEvaluation = async () => {
    if (!annee || loading) return

    setLoading(true)
    setErreur("")
    setEvaluation(null)

    try {
      const data = await evaluerPrediction(Number(annee))
      setEvaluation(data)
    } catch (error: any) {
      setErreur(
        error.message ||
          "Impossible d'évaluer les prévisions."
      )
    } finally {
      setLoading(false)
    }
  }

  const resultat = evaluation?.indicateurs.find(
    (item) => item.code === "RESULTAT"
  )

  const marge = evaluation?.indicateurs.find(
    (item) => item.code === "MARGE"
  )

  const graphiques = evaluation?.indicateurs
    .filter((item) => item.unite === "MGA")
    .map((item) => ({
      nom: item.libelle,
      Constaté: Number(item.constate),
      Prévision: Number(item.prevision),
    })) || []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Évaluation des prévisions ML
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Comparaison des budgets constatés et prévisionnels
          pour un même exercice.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" />
            Sélection de l'exercice
          </CardTitle>
          <CardDescription>
            Choisissez une année possédant un budget généré
            et un budget prévisionnel.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="w-full sm:w-64">
              <Select
                value={annee}
                onValueChange={(value) => {
                  setAnnee(value)
                  setEvaluation(null)
                  setErreur("")
                }}
                disabled={loadingAnnees || annees.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une année" />
                </SelectTrigger>

                <SelectContent>
                  {annees.map((item) => (
                    <SelectItem
                      key={item}
                      value={String(item)}
                    >
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={lancerEvaluation}
              disabled={!annee || loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <BarChart3 className="mr-2 h-4 w-4" />
              )}
              Évaluer les prévisions
            </Button>
          </div>
        </CardContent>
      </Card>

      {erreur && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-3 text-destructive">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm">{erreur}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!loadingAnnees &&
        annees.length === 0 &&
        !erreur && (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center text-center gap-3">
                <BrainCircuit className="h-10 w-10 text-muted-foreground" />

                <h3 className="font-semibold">
                  Aucune évaluation disponible
                </h3>

                <p className="text-sm text-muted-foreground max-w-lg">
                  Aucun exercice ne possède actuellement
                  à la fois un budget GENERE et un budget
                  PREVISIONNEL.
                </p>

                <p className="text-sm text-muted-foreground max-w-lg">
                  La prévision 2026 est déjà enregistrée.
                  L'évaluation sera disponible lorsque
                  le budget constaté 2026 aura été généré.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

      {evaluation && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[resultat, marge].map((item) => {
              if (!item) return null

              return (
                <Card key={item.code}>
                  <CardHeader>
                    <CardDescription>
                      {item.libelle}
                    </CardDescription>
                    <CardTitle className="text-xl">
                      {formatPourcentage(
                        item.erreurPourcentage
                      )}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Erreur relative absolue
                    </p>

                    <p className="text-sm">
                      Écart :{" "}
                      <span className="font-medium">
                        {formatEcart(
                          item.ecart,
                          item.unite
                        )}
                      </span>
                    </p>

                    <p className="text-sm">
                      {item.diagnostic === "CONFORME"
                        ? "Prévision conforme"
                        : item.diagnostic === "SURESTIMATION"
                        ? "Prévision supérieure au constaté"
                        : "Prévision inférieure au constaté"}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                Comparaison des indicateurs
              </CardTitle>
              <CardDescription>
                Exercice {evaluation.annee} —
                Budget constaté #{evaluation.budgetGenereId}
                {" "}et prévision #{evaluation.budgetPrevisionnelId}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">
                        Indicateur
                      </th>
                      <th className="text-right p-3">
                        Constaté
                      </th>
                      <th className="text-right p-3">
                        Prévision
                      </th>
                      <th className="text-right p-3">
                        Écart
                      </th>
                      <th className="text-right p-3">
                        Erreur (%)
                      </th>
                      <th className="text-left p-3">
                        Diagnostic
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {evaluation.indicateurs.map((item) => (
                      <tr
                        key={item.code}
                        className="border-b"
                      >
                        <td className="p-3 font-medium">
                          {item.libelle}
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          {formatValeur(
                            item.constate,
                            item.unite
                          )}
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          {formatValeur(
                            item.prevision,
                            item.unite
                          )}
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          {formatEcart(
                            item.ecart,
                            item.unite
                          )}
                        </td>
                        <td className="p-3 text-right">
                          {formatPourcentage(
                            item.erreurPourcentage
                          )}
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1">
                            {item.diagnostic === "CONFORME" ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            ) : item.diagnostic === "SURESTIMATION" ? (
                              <TrendingUp className="h-4 w-4 text-blue-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-slate-500" />
                            )}
                            {item.diagnostic.replaceAll("_", " ")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Visualisation des écarts budgétaires
              </CardTitle>
              <CardDescription>
                Comparaison des montants en MGA
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="h-[360px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={graphiques}
                    margin={{
                      top: 10,
                      right: 10,
                      left: 10,
                      bottom: 80,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="nom"
                      angle={-25}
                      textAnchor="end"
                      interval={0}
                      height={100}
                      tick={{ fontSize: 11 }}
                    />

                    <YAxis
                      tickFormatter={(value) =>
                        `${(value / 1_000_000_000).toFixed(1)} Md`
                      }
                      width={65}
                    />

                    <Tooltip
                      formatter={(value: any) =>
                        `${formatNombre(Number(value))} MGA`
                      }
                    />

                    <Legend />

                    <Bar
                      dataKey="Constaté"
                      fill="#64748b"
                      radius={[4, 4, 0, 0]}
                    />

                    <Bar
                      dataKey="Prévision"
                      fill="#93c5fd"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Interprétation des résultats
              </CardTitle>
              <CardDescription>
                Analyse automatique des écarts entre
                les prévisions ML et les données constatées.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {evaluation.interpretations.map(
                (interpretation, index) => (
                  <div
                    key={index}
                    className="rounded-lg border p-4 text-sm leading-relaxed"
                  >
                    {interpretation}
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
