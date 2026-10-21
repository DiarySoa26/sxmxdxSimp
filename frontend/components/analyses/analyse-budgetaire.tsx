"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { ElementType } from "react"

import {
  Activity,
  Banknote,
  CircleDollarSign,
  FileText,
  Layers3,
  Loader2,
  TrendingUp,
  WalletCards,
} from "lucide-react"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import {
  getBudgetDetails,
  getBudgetMensuel,
  getExercices,
} from "@/services/budget-details-service"

import { exporterAnalysePDF } from "@/services/analyse-export-service"

import { Button } from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// ======================================================
// TYPES
// ======================================================

type Valeur = number | string | null | undefined

type Exercice = {
  id_exercice: number
  annee_exercice: number
}

type Budget = {
  id?: number
  budget_id?: number
  id_budget?: number
  ca_export?: Valeur
  charges_exploitation?: Valeur
  frais_export?: Valeur
  masse_salariale?: Valeur
  resultat_operationnel?: Valeur
  marge_operationnelle?: Valeur
}

type BudgetMensuel = {
  id?: number
  mois?: number | string
  nom_mois?: string
  mois_nom?: string
  mois_id?: number
  ca_export?: Valeur
  charges_exploitation?: Valeur
  frais_export?: Valeur
  masse_salariale?: Valeur
  resultat_operationnel?: Valeur
  marge_operationnelle?: Valeur
}

type Amortissement = {
  mois?: number | string
  mois_id?: number
  numero_mois?: number
  nom_mois?: string
  montant?: Valeur
}

type LigneGraphique = BudgetMensuel & {
  moisLabel: string
  ordre: number
  ca_export: number
  charges_exploitation: number
  frais_export: number
  masse_salariale: number
  resultat_operationnel: number
  marge_operationnelle: number
  amortissements: number
}

// ======================================================
// CONSTANTES
// ======================================================

const MOIS = [
  "",
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
]

// ======================================================
// FONCTIONS UTILITAIRES
// ======================================================

function nombre(value: unknown): number {
  if (value === null || value === undefined || value === "") {
    return 0
  }

  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function formatMGA(value: unknown): string {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(nombre(value))
}

function formatCompact(value: unknown): string {
  const n = nombre(value)

  if (Math.abs(n) >= 1_000_000_000) {
    return `${(n / 1_000_000_000).toFixed(2)} Md`
  }

  if (Math.abs(n) >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(2)} M`
  }

  if (Math.abs(n) >= 1_000) {
    return `${(n / 1_000).toFixed(2)} k`
  }

  return n.toFixed(0)
}

function formatPourcentage(value: unknown): string {
  let n = nombre(value)

  if (Math.abs(n) <= 1) {
    n *= 100
  }

  return `${n.toFixed(2)} %`
}

function normaliserTexte(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

function numeroMois(value: unknown): number {
  const n = Number(value)

  if (Number.isInteger(n) && n >= 1 && n <= 12) {
    return n
  }

  const texte = normaliserTexte(value)

  const index = MOIS.findIndex(
    (m) => normaliserTexte(m) === texte
  )

  return index >= 1 ? index : 0
}

function getNumeroMois(
  item: BudgetMensuel | Amortissement
): number {
  return numeroMois(
    item.mois_id ??
      item.mois ??
      ("numero_mois" in item ? item.numero_mois : undefined) ??
      item.nom_mois
  )
}

function getNomMois(item: BudgetMensuel): string {
  const n = getNumeroMois(item)

  return (
    MOIS[n] ||
    item.nom_mois ||
    item.mois_nom ||
    "Mois inconnu"
  )
}

// ======================================================
// CARTE KPI
// ======================================================

function KpiCard({
  titre,
  valeur,
  description,
  icon: Icon,
  className,
  iconClassName,
}: {
  titre: string
  valeur: string
  description: string
  icon: ElementType
  className: string
  iconClassName: string
}) {
  return (
    <Card
      className={`relative overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${className}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {titre}
        </CardTitle>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClassName}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold tracking-tight">
          {valeur}
        </div>

        <p className="mt-1 text-xs text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}

// ======================================================
// PAGE ANALYSES BUDGETAIRES
// ======================================================

export default function AnalyseBudgetaire() {
  const [exercices, setExercices] = useState<Exercice[]>([])
  const [exerciceId, setExerciceId] = useState("")

  const [budget, setBudget] = useState<Budget | null>(null)
  const [mensuel, setMensuel] = useState<BudgetMensuel[]>([])
  const [amortissements, setAmortissements] = useState<
    Amortissement[]
  >([])

  const [exerciceCharge, setExerciceCharge] = useState("")

  const [loadingExercices, setLoadingExercices] = useState(true)
  const [loadingAnalyse, setLoadingAnalyse] = useState(false)
  const [exportEnCours, setExportEnCours] = useState(false)

  const [error, setError] = useState("")

  const trajectoireRef = useRef<HTMLDivElement>(null)
  const depensesRef = useRef<HTMLDivElement>(null)

  // ======================================================
  // CHARGEMENT DES EXERCICES
  // ======================================================

  useEffect(() => {
    let actif = true

    async function charger() {
      try {
        setLoadingExercices(true)
        setError("")

        const data = await getExercices()

        if (!actif) return

        const liste = Array.isArray(data) ? data : []

        setExercices(liste)

        if (liste.length > 0) {
          setExerciceId(String(liste[0].id_exercice))
        }
      } catch (err) {
        if (!actif) return

        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les exercices."
        )
      } finally {
        if (actif) setLoadingExercices(false)
      }
    }

    void charger()

    return () => {
      actif = false
    }
  }, [])

  // ======================================================
  // EXERCICES
  // ======================================================

  const exerciceSelectionne = useMemo(
    () =>
      exercices.find(
        (e) => String(e.id_exercice) === exerciceId
      ),
    [exercices, exerciceId]
  )

  const exerciceAffiche = useMemo(
    () =>
      exercices.find(
        (e) => String(e.id_exercice) === exerciceCharge
      ),
    [exercices, exerciceCharge]
  )

  // ======================================================
  // CHARGEMENT DU BUDGET ET DES AMORTISSEMENTS
  // ======================================================

  useEffect(() => {
    if (!exerciceId) return

    let actif = true

    async function charger() {
      setLoadingAnalyse(true)
      setError("")

      try {
        const budgets = await getBudgetDetails(
          "budget",
          Number(exerciceId)
        )

        if (!actif) return

        if (!Array.isArray(budgets) || budgets.length === 0) {
          throw new Error(
            "Aucun budget disponible pour cet exercice."
          )
        }

        const budgetTrouve: Budget = budgets[0]

        const budgetId =
          budgetTrouve.id ??
          budgetTrouve.id_budget ??
          budgetTrouve.budget_id

        if (budgetId == null) {
          throw new Error(
            "L'identifiant du budget est introuvable."
          )
        }

        // Chargement parallèle des données mensuelles
        // et des amortissements de l'exercice.
        const [donneesMensuelles, donneesAmortissements] =
          await Promise.all([
            getBudgetMensuel(budgetId),

            getBudgetDetails(
              "amortissements",
              Number(exerciceId)
            ),
          ])

        if (!actif) return

        setBudget(budgetTrouve)

        setMensuel(
          Array.isArray(donneesMensuelles)
            ? donneesMensuelles
            : []
        )

        setAmortissements(
          Array.isArray(donneesAmortissements)
            ? donneesAmortissements
            : []
        )

        setExerciceCharge(exerciceId)
      } catch (err) {
        if (!actif) return

        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger l'analyse."
        )
      } finally {
        if (actif) setLoadingAnalyse(false)
      }
    }

    void charger()

    return () => {
      actif = false
    }
  }, [exerciceId])

  // ======================================================
  // AMORTISSEMENTS PAR MOIS
  // ======================================================

  const amortissementsParMois = useMemo(() => {
    const totaux = Array(13).fill(0) as number[]

    for (const ligne of amortissements) {
      const mois = getNumeroMois(ligne)

      if (mois >= 1 && mois <= 12) {
        totaux[mois] += nombre(ligne.montant)
      }
    }

    return totaux
  }, [amortissements])

  const totalAmortissements = useMemo(
    () =>
      amortissementsParMois
        .slice(1)
        .reduce((somme, valeur) => somme + valeur, 0),
    [amortissementsParMois]
  )

  const afficherAmortissements = amortissements.length > 0

  // ======================================================
  // DONNEES DES GRAPHIQUES
  // ======================================================

  const graphiqueMensuel = useMemo<LigneGraphique[]>(() => {
    return mensuel
      .map((item) => {
        const mois = getNumeroMois(item)

        return {
          ...item,
          moisLabel: getNomMois(item),
          ordre: mois,
          ca_export: nombre(item.ca_export),
          charges_exploitation: nombre(
            item.charges_exploitation
          ),
          frais_export: nombre(item.frais_export),
          masse_salariale: nombre(item.masse_salariale),
          resultat_operationnel: nombre(
            item.resultat_operationnel
          ),
          marge_operationnelle: nombre(
            item.marge_operationnelle
          ),
          amortissements:
            mois >= 1 && mois <= 12
              ? amortissementsParMois[mois]
              : 0,
        }
      })
      .sort((a, b) => a.ordre - b.ordre)
  }, [mensuel, amortissementsParMois])

  // ======================================================
  // EXPORT PDF
  // ======================================================

  async function exporterPDF() {
    if (
      !budget ||
      !exerciceSelectionne ||
      loadingAnalyse ||
      exportEnCours ||
      exerciceCharge !== exerciceId
    ) {
      return
    }

    try {
      setExportEnCours(true)
      setError("")

      await exporterAnalysePDF({
        annee: exerciceSelectionne.annee_exercice,
        budget,
        mensuel,
        amortissements: afficherAmortissements
          ? amortissements
          : [],
        graphiqueTrajectoire: trajectoireRef.current,
        graphiqueDepenses: depensesRef.current,
      })
    } catch (err) {
      console.error("Erreur export PDF :", err)

      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'exporter les analyses."
      )
    } finally {
      setExportEnCours(false)
    }
  }

  // ======================================================
  // CHANGEMENT D'EXERCICE
  // ======================================================

  function changerExercice(value: string) {
    if (
      !value ||
      value === exerciceId ||
      exportEnCours ||
      loadingAnalyse
    ) {
      return
    }

    setLoadingAnalyse(true)
    setError("")
    setExerciceId(value)
  }

  // ======================================================
  // LOADER INITIAL
  // ======================================================

  if (loadingExercices) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center gap-4 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm">
          Chargement des analyses...
        </p>
      </div>
    )
  }

  // ======================================================
  // INTERFACE
  // ======================================================

  return (
    <div className="relative min-h-screen space-y-6">

      {/* EN-TÊTE */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Analyses budgétaires
          </h1>

          <p className="mt-1 text-muted-foreground">
            Analysez les trajectoires budgétaires et
            l&apos;évolution des principaux indicateurs financiers.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Exercice à analyser
            </p>

            <p className="text-xs text-muted-foreground">
              Choisissez une année pour afficher ses trajectoires budgétaires.
            </p>

            <Select
              value={exerciceId}
              onValueChange={changerExercice}
              disabled={exportEnCours || loadingAnalyse}
            >
              <SelectTrigger className="w-full sm:w-[240px]">
                <span key={exerciceId}>
                  {exerciceSelectionne
                    ? String(exerciceSelectionne.annee_exercice)
                    : "Sélectionner une année"}
                </span>
              </SelectTrigger>

              <SelectContent>
                {exercices.map((exercice) => (
                  <SelectItem
                    key={exercice.id_exercice}
                    value={String(exercice.id_exercice)}
                  >
                    {exercice.annee_exercice}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            disabled={
              !budget ||
              loadingAnalyse ||
              exportEnCours ||
              exerciceCharge !== exerciceId ||
              graphiqueMensuel.length === 0
            }
            onClick={exporterPDF}
          >
            {exportEnCours ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}

            {exportEnCours
              ? "Exportation en cours..."
              : "Exporter PDF"}
          </Button>
        </div>
      </div>

      {/* ERREUR */}
      {error && (
        <Card className="border-rose-200 bg-rose-50/40 dark:border-rose-900/50 dark:bg-rose-950/10">
          <CardContent className="pt-6">
            <p className="text-sm text-rose-700 dark:text-rose-300">
              {error}
            </p>
          </CardContent>
        </Card>
      )}

      {/* RESULTATS */}
      {budget && (
        <>

          {/* CARTES KPI */}
          <div
            className={`grid gap-4 md:grid-cols-2 ${
              afficherAmortissements
                ? "xl:grid-cols-3"
                : "xl:grid-cols-5"
            }`}
          >
            <KpiCard
              titre="CA export"
              valeur={`${formatCompact(budget.ca_export)} MGA`}
              description="Chiffre d'affaires annuel"
              icon={CircleDollarSign}
              className="border-sky-100 bg-sky-50/40 dark:border-sky-900/40 dark:bg-sky-950/10"
              iconClassName="bg-sky-100/70 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300"
            />

            <KpiCard
              titre="Charges d'exploitation"
              valeur={`${formatCompact(budget.charges_exploitation)} MGA`}
              description="Charges annuelles"
              icon={WalletCards}
              className="border-rose-100 bg-rose-50/40 dark:border-rose-900/40 dark:bg-rose-950/10"
              iconClassName="bg-rose-100/70 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300"
            />

            <KpiCard
              titre="Frais export"
              valeur={`${formatCompact(budget.frais_export)} MGA`}
              description="Frais d'exportation"
              icon={Banknote}
              className="border-violet-100 bg-violet-50/40 dark:border-violet-900/40 dark:bg-violet-950/10"
              iconClassName="bg-violet-100/70 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300"
            />

            {afficherAmortissements && (
              <KpiCard
                titre="Amortissements"
                valeur={`${formatCompact(totalAmortissements)} MGA`}
                description="Dotations annuelles aux amortissements"
                icon={Layers3}
                className="border-amber-100 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/10"
                iconClassName="bg-amber-100/70 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300"
              />
            )}

            <KpiCard
              titre="Résultat opérationnel"
              valeur={`${formatCompact(budget.resultat_operationnel)} MGA`}
              description="Résultat annuel"
              icon={TrendingUp}
              className="border-emerald-100 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/10"
              iconClassName="bg-emerald-100/70 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300"
            />

            <KpiCard
              titre="Marge opérationnelle"
              valeur={formatPourcentage(budget.marge_operationnelle)}
              description="Performance opérationnelle"
              icon={Activity}
              className="border-cyan-100 bg-cyan-50/40 dark:border-cyan-900/40 dark:bg-cyan-950/10"
              iconClassName="bg-cyan-100/70 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-300"
            />
          </div>

          {/* TRAJECTOIRE BUDGETAIRE */}
          <Card>
            <CardHeader>
              <CardTitle>Trajectoire budgétaire</CardTitle>
              <CardDescription>
                Évolution mensuelle du chiffre d&apos;affaires
                export et du résultat opérationnel —{" "}
                {exerciceAffiche?.annee_exercice}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {graphiqueMensuel.length > 0 ? (
                <div
                  ref={trajectoireRef}
                  className="h-[400px] w-full bg-white p-2"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={graphiqueMensuel}
                      margin={{
                        top: 10,
                        right: 20,
                        left: 10,
                        bottom: 10,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />

                      <XAxis
                        dataKey="moisLabel"
                        tickFormatter={(v) =>
                          String(v).substring(0, 3)
                        }
                      />

                      <YAxis tickFormatter={formatCompact} />

                      <Tooltip
                        formatter={(value) => [
                          `${formatMGA(value)} MGA`,
                        ]}
                      />

                      <Legend />

                      <Line
                        type="monotone"
                        dataKey="ca_export"
                        name="CA export"
                        stroke="#7da6c7"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        isAnimationActive={false}
                      />

                      <Line
                        type="monotone"
                        dataKey="resultat_operationnel"
                        name="Résultat opérationnel"
                        stroke="#76a995"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                  Aucune donnée mensuelle disponible.
                </div>
              )}
            </CardContent>
          </Card>

          {/* EVOLUTION DES DEPENSES */}
          <Card>
            <CardHeader>
              <CardTitle>Évolution des dépenses</CardTitle>

              <CardDescription>
                Charges d&apos;exploitation, frais d&apos;export,
                masse salariale
                {afficherAmortissements
                  ? " et amortissements"
                  : ""}{" "}
                — {exerciceAffiche?.annee_exercice}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {graphiqueMensuel.length > 0 ? (
                <div
                  ref={depensesRef}
                  className="h-[380px] w-full bg-white p-2"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={graphiqueMensuel}
                      margin={{
                        top: 10,
                        right: 20,
                        left: 10,
                        bottom: 10,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />

                      <XAxis
                        dataKey="moisLabel"
                        tickFormatter={(v) =>
                          String(v).substring(0, 3)
                        }
                      />

                      <YAxis tickFormatter={formatCompact} />

                      <Tooltip
                        formatter={(value) => [
                          `${formatMGA(value)} MGA`,
                        ]}
                      />

                      <Legend />

                      <Bar
                        dataKey="charges_exploitation"
                        name="Charges exploitation"
                        fill="#c998a4"
                        radius={[4, 4, 0, 0]}
                        isAnimationActive={false}
                      />

                      <Bar
                        dataKey="frais_export"
                        name="Frais export"
                        fill="#9e91bd"
                        radius={[4, 4, 0, 0]}
                        isAnimationActive={false}
                      />

                      <Bar
                        dataKey="masse_salariale"
                        name="Masse salariale"
                        fill="#83adb1"
                        radius={[4, 4, 0, 0]}
                        isAnimationActive={false}
                      />

                      {afficherAmortissements && (
                        <Bar
                          dataKey="amortissements"
                          name="Amortissements"
                          fill="#d6a65c"
                          radius={[4, 4, 0, 0]}
                          isAnimationActive={false}
                        />
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                  Aucune donnée mensuelle disponible.
                </div>
              )}
            </CardContent>
          </Card>

          {/* DETAIL MENSUEL */}
          <Card>
            <CardHeader>
              <CardTitle>Détail mensuel</CardTitle>

              <CardDescription>
                Données budgétaires détaillées de
                l&apos;exercice{" "}
                {exerciceAffiche?.annee_exercice}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {graphiqueMensuel.length > 0 ? (
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mois</TableHead>

                        <TableHead className="text-right">
                          CA export
                        </TableHead>

                        <TableHead className="text-right">
                          Charges
                        </TableHead>

                        <TableHead className="text-right">
                          Frais export
                        </TableHead>

                        <TableHead className="text-right">
                          Masse salariale
                        </TableHead>

                        {afficherAmortissements && (
                          <TableHead className="text-right">
                            Amortissements
                          </TableHead>
                        )}

                        <TableHead className="text-right">
                          Résultat
                        </TableHead>

                        <TableHead className="text-right">
                          Marge
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {graphiqueMensuel.map((item, index) => (
                        <TableRow
                          key={
                            item.id ??
                            `${item.moisLabel}-${index}`
                          }
                        >
                          <TableCell className="font-medium">
                            {item.moisLabel}
                          </TableCell>

                          <TableCell className="text-right">
                            {formatMGA(item.ca_export)}
                          </TableCell>

                          <TableCell className="text-right">
                            {formatMGA(item.charges_exploitation)}
                          </TableCell>

                          <TableCell className="text-right">
                            {formatMGA(item.frais_export)}
                          </TableCell>

                          <TableCell className="text-right">
                            {formatMGA(item.masse_salariale)}
                          </TableCell>

                          {afficherAmortissements && (
                            <TableCell className="text-right">
                              {formatMGA(item.amortissements)}
                            </TableCell>
                          )}

                          <TableCell className="text-right font-medium text-emerald-700 dark:text-emerald-400">
                            {formatMGA(item.resultat_operationnel)}
                          </TableCell>

                          <TableCell className="text-right">
                            {formatPourcentage(
                              item.marge_operationnelle
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex h-[150px] items-center justify-center text-sm text-muted-foreground">
                  Aucune donnée mensuelle disponible.
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* LOADER GLOBAL */}
      {loadingAnalyse && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/30 backdrop-blur-[1px]"
          role="status"
          aria-live="polite"
          aria-label="Chargement des analyses budgétaires"
        >
          <div className="flex flex-col items-center gap-5 rounded-2xl border border-border/20 bg-background/20 px-10 py-8 shadow-sm backdrop-blur-[2px]">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
              <Loader2 className="size-9 animate-spin text-primary" />
            </div>

            <div className="space-y-2 text-center">
              <h3 className="text-base font-semibold">
                Chargement des analyses budgétaires
              </h3>

              <p className="text-sm text-muted-foreground">
                Actualisation des données
                {exerciceSelectionne
                  ? ` de l'exercice ${exerciceSelectionne.annee_exercice}`
                  : ""}...
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="size-2 animate-pulse rounded-full bg-primary" />
              <span className="size-2 animate-pulse rounded-full bg-primary [animation-delay:200ms]" />
              <span className="size-2 animate-pulse rounded-full bg-primary [animation-delay:400ms]" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
