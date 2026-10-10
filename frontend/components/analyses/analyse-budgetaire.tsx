"use client"

import { useEffect, useMemo, useState } from "react"
import { Activity, Banknote, CircleDollarSign, Loader2, TrendingUp, WalletCards } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { getBudgetDetails, getBudgetMensuel, getExercices } from "@/services/budget-details-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Exercice = {
  id_exercice: number
  annee_exercice: number
}

type Budget = {
  id?: number
  budget_id?: number
  id_budget?: number
  ca_export?: number
  charges_exploitation?: number
  frais_export?: number
  masse_salariale?: number
  resultat_operationnel?: number
  marge_operationnelle?: number
}

type BudgetMensuel = {
  id?: number
  mois?: string
  nom_mois?: string
  mois_nom?: string
  mois_id?: number
  ca_export?: number
  charges_exploitation?: number
  frais_export?: number
  masse_salariale?: number
  resultat_operationnel?: number
  marge_operationnelle?: number
}

const MOIS = ["", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]

function nombre(value: unknown) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function formatMGA(value: unknown) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(nombre(value))
}

function formatCompact(value: unknown) {
  const n = nombre(value)

  if (Math.abs(n) >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)} Md`
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(2)} M`
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(2)} k`

  return n.toFixed(0)
}

function formatPourcentage(value: unknown) {
  let n = nombre(value)
  if (Math.abs(n) <= 1) n *= 100
  return `${n.toFixed(2)} %`
}

function getNomMois(item: BudgetMensuel) {
  if (item.nom_mois) return item.nom_mois
  if (item.mois_nom) return item.mois_nom
  if (typeof item.mois === "string" && item.mois.trim()) return item.mois

  const id = nombre(item.mois_id)
  return MOIS[id] || `Mois ${id}`
}

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
  icon: React.ElementType
  className: string
  iconClassName: string
}) {
  return (
    <Card className={`relative overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{titre}</CardTitle>

        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClassName}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{valeur}</div>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

export default function AnalyseBudgetaire() {
  const [exercices, setExercices] = useState<Exercice[]>([])
  const [exerciceId, setExerciceId] = useState("")
  const [budget, setBudget] = useState<Budget | null>(null)
  const [mensuel, setMensuel] = useState<BudgetMensuel[]>([])
  const [loadingExercices, setLoadingExercices] = useState(true)
  const [loadingAnalyse, setLoadingAnalyse] = useState(false)
  const [error, setError] = useState("")

  // Chargement des exercices
  useEffect(() => {
    const charger = async () => {
      try {
        setLoadingExercices(true)
        setError("")

        const data = await getExercices()
        setExercices(data)

        // Le premier exercice est automatiquement sélectionné.
        if (Array.isArray(data) && data.length > 0) {
          setExerciceId(String(data[0].id_exercice))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Impossible de charger les exercices.")
      } finally {
        setLoadingExercices(false)
      }
    }

    charger()
  }, [])

  // Exercice actuellement sélectionné
  const exerciceSelectionne = useMemo(
    () => exercices.find((e) => String(e.id_exercice) === exerciceId),
    [exercices, exerciceId]
  )

  // Chargement du budget annuel + mensuel
  useEffect(() => {
    if (!exerciceId) return

    const charger = async () => {
      try {
        setLoadingAnalyse(true)
        setError("")
        setBudget(null)
        setMensuel([])

        const budgets = await getBudgetDetails("budget", exerciceId)

        if (!budgets?.length) {
          throw new Error("Aucun budget disponible pour cet exercice.")
        }

        const budgetTrouve = budgets[0]
        setBudget(budgetTrouve)

        const budgetId = budgetTrouve.id ?? budgetTrouve.id_budget ?? budgetTrouve.budget_id

        if (!budgetId) {
          throw new Error("L'identifiant du budget est introuvable.")
        }

        const donneesMensuelles = await getBudgetMensuel(budgetId)
        setMensuel(Array.isArray(donneesMensuelles) ? donneesMensuelles : [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Impossible de charger l'analyse.")
      } finally {
        setLoadingAnalyse(false)
      }
    }

    charger()
  }, [exerciceId])

  // Préparation des données mensuelles
  const graphiqueMensuel = useMemo(() => {
    return mensuel
      .map((item) => {
        const moisLabel = getNomMois(item)
        const ordre = nombre(item.mois_id) || MOIS.indexOf(moisLabel)

        return {
          ...item,
          moisLabel,
          ordre,
          ca_export: nombre(item.ca_export),
          charges_exploitation: nombre(item.charges_exploitation),
          frais_export: nombre(item.frais_export),
          masse_salariale: nombre(item.masse_salariale),
          resultat_operationnel: nombre(item.resultat_operationnel),
          marge_operationnelle: nombre(item.marge_operationnelle),
        }
      })
      .sort((a, b) => a.ordre - b.ordre)
  }, [mensuel])

  if (loadingExercices) {
    return (
      <div className="flex min-h-[500px] items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Chargement des analyses...
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analyses budgétaires</h1>
          <p className="mt-1 text-muted-foreground">
            Analysez les trajectoires budgétaires et l&apos;évolution des principaux indicateurs financiers.
          </p>
        </div>

        <div className="space-y-2">
          <div>
            <p className="text-sm font-medium">Exercice à analyser</p>
            <p className="text-xs text-muted-foreground">
              Choisissez une année pour afficher ses trajectoires budgétaires.
            </p>
          </div>

          <Select
            value={exerciceId}
            onValueChange={(value) => {
              if (value !== null) setExerciceId(value)
            }}
          >
            <SelectTrigger className="w-full lg:w-[240px]">
              {exerciceSelectionne ? exerciceSelectionne.annee_exercice : "Sélectionner une année"}
            </SelectTrigger>

            <SelectContent>
              {exercices.map((exercice) => (
                <SelectItem key={exercice.id_exercice} value={String(exercice.id_exercice)}>
                  {exercice.annee_exercice}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <Card className="border-rose-200 bg-rose-50/40 dark:border-rose-900/50 dark:bg-rose-950/10">
          <CardContent className="pt-6">
            <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Chargement */}
      {loadingAnalyse && (
        <div className="flex min-h-[350px] items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Chargement des trajectoires budgétaires
          {exerciceSelectionne ? ` de ${exerciceSelectionne.annee_exercice}` : ""}...
        </div>
      )}

      {!loadingAnalyse && budget && (
        <>
          {/* Statistiques */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
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

          {/* Trajectoire CA / Résultat */}
          <Card>
            <CardHeader>
              <CardTitle>Trajectoire budgétaire</CardTitle>
              <CardDescription>
                Évolution mensuelle du chiffre d&apos;affaires export et du résultat opérationnel — {exerciceSelectionne?.annee_exercice}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {graphiqueMensuel.length > 0 ? (
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={graphiqueMensuel} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="moisLabel" tickFormatter={(value) => String(value).substring(0, 3)} />
                      <YAxis tickFormatter={formatCompact} />
                      <Tooltip formatter={(value) => [`${formatMGA(value)} MGA`]} />
                      <Legend />

                      <Line
                        type="monotone"
                        dataKey="ca_export"
                        name="CA export"
                        stroke="#7da6c7"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />

                      <Line
                        type="monotone"
                        dataKey="resultat_operationnel"
                        name="Résultat opérationnel"
                        stroke="#76a995"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
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

          {/* Évolution des dépenses */}
          <Card>
            <CardHeader>
              <CardTitle>Évolution des dépenses</CardTitle>
              <CardDescription>
                Charges d&apos;exploitation, frais d&apos;export et masse salariale — {exerciceSelectionne?.annee_exercice}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {graphiqueMensuel.length > 0 ? (
                <div className="h-[380px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={graphiqueMensuel} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="moisLabel" tickFormatter={(value) => String(value).substring(0, 3)} />
                      <YAxis tickFormatter={formatCompact} />
                      <Tooltip formatter={(value) => [`${formatMGA(value)} MGA`]} />
                      <Legend />

                      <Bar
                        dataKey="charges_exploitation"
                        name="Charges exploitation"
                        fill="#c998a4"
                        radius={[4, 4, 0, 0]}
                      />

                      <Bar
                        dataKey="frais_export"
                        name="Frais export"
                        fill="#9e91bd"
                        radius={[4, 4, 0, 0]}
                      />

                      <Bar
                        dataKey="masse_salariale"
                        name="Masse salariale"
                        fill="#83adb1"
                        radius={[4, 4, 0, 0]}
                      />
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

          {/* Tableau mensuel */}
          <Card>
            <CardHeader>
              <CardTitle>Détail mensuel</CardTitle>
              <CardDescription>
                Données budgétaires détaillées de l&apos;exercice {exerciceSelectionne?.annee_exercice}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {graphiqueMensuel.length > 0 ? (
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mois</TableHead>
                        <TableHead className="text-right">CA export</TableHead>
                        <TableHead className="text-right">Charges</TableHead>
                        <TableHead className="text-right">Frais export</TableHead>
                        <TableHead className="text-right">Masse salariale</TableHead>
                        <TableHead className="text-right">Résultat</TableHead>
                        <TableHead className="text-right">Marge</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {graphiqueMensuel.map((item, index) => (
                        <TableRow key={item.id ?? `${item.moisLabel}-${index}`}>
                          <TableCell className="font-medium">{item.moisLabel}</TableCell>
                          <TableCell className="text-right">{formatMGA(item.ca_export)}</TableCell>
                          <TableCell className="text-right">{formatMGA(item.charges_exploitation)}</TableCell>
                          <TableCell className="text-right">{formatMGA(item.frais_export)}</TableCell>
                          <TableCell className="text-right">{formatMGA(item.masse_salariale)}</TableCell>
                          <TableCell className="text-right font-medium text-emerald-700 dark:text-emerald-400">
                            {formatMGA(item.resultat_operationnel)}
                          </TableCell>
                          <TableCell className="text-right">{formatPourcentage(item.marge_operationnelle)}</TableCell>
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
    </div>
  )
}