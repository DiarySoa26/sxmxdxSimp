"use client"

import {
  useEffect,
  useState,
} from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import BudgetMensuelTable from "./budget-mensuel-table"

import {
  getBudgetMensuel,
} from "@/services/budget-details-service"

type BudgetTableProps = {
  data: any[]
}

export default function BudgetTable({
  data,
}: BudgetTableProps) {
  const [
    budgetMensuel,
    setBudgetMensuel,
  ] = useState<any[]>([])

  const [
    loadingBudgetMensuel,
    setLoadingBudgetMensuel,
  ] = useState(false)

  const [
    errorBudgetMensuel,
    setErrorBudgetMensuel,
  ] = useState("")

  const budgetAnnuel =
    Array.isArray(data) &&
    data.length > 0
      ? data[0]
      : null

  const budgetId =
    budgetAnnuel?.id ??
    budgetAnnuel?.id_budget ??
    budgetAnnuel?.budget_id

  useEffect(() => {
    if (!budgetId) {
      setBudgetMensuel([])
      setErrorBudgetMensuel("")
      return
    }

    let actif = true

    async function chargerBudgetMensuel() {
      setLoadingBudgetMensuel(
        true
      )

      setErrorBudgetMensuel("")

      try {
        const resultat =
          await getBudgetMensuel(
            budgetId
          )

        if (!actif) {
          return
        }

        setBudgetMensuel(
          Array.isArray(resultat)
            ? resultat
            : []
        )
      } catch (error: any) {
        if (!actif) {
          return
        }

        setBudgetMensuel([])

        setErrorBudgetMensuel(
          error?.message ??
            "Impossible de charger le budget mensuel."
        )
      } finally {
        if (actif) {
          setLoadingBudgetMensuel(
            false
          )
        }
      }
    }

    chargerBudgetMensuel()

    return () => {
      actif = false
    }
  }, [budgetId])

  if (!budgetAnnuel) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-md border border-dashed">
        <p className="text-sm text-muted-foreground">
          Aucun budget disponible pour cet exercice.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">
            Budget annuel
          </h3>

          <p className="text-sm text-muted-foreground">
            Synthèse annuelle du budget.
          </p>
        </div>

        <div className="w-full overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  Type
                </TableHead>

                <TableHead>
                  Statut
                </TableHead>

                <TableHead className="text-right">
                  CA export
                </TableHead>

                <TableHead className="text-right">
                  Charges d'exploitation
                </TableHead>

                <TableHead className="text-right">
                  Frais export
                </TableHead>

                <TableHead className="text-right">
                  Masse salariale
                </TableHead>

                <TableHead className="text-right">
                  Résultat opérationnel
                </TableHead>

                <TableHead className="text-right">
                  Marge opérationnelle
                </TableHead>
{/* 
                <TableHead>
                  Date génération
                </TableHead> */}
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.map(
                (
                  ligne,
                  index
                ) => (
                  <TableRow
                    key={
                      ligne?.id ??
                      ligne?.id_budget ??
                      `budget-${index}`
                    }
                  >
                    <TableCell>
                      {afficherValeur(
                        ligne?.type_budget
                      )}
                    </TableCell>

                    <TableCell>
                      {afficherValeur(
                        ligne?.statut
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      {formatMontant(
                        ligne?.ca_export
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      {formatMontant(
                        ligne?.charges_exploitation
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      {formatMontant(
                        ligne?.frais_export
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      {formatMontant(
                        ligne?.masse_salariale
                      )}
                    </TableCell>

                    <TableCell className="text-right font-semibold">
                      {formatMontant(
                        ligne?.resultat_operationnel
                      )}
                    </TableCell>

                    <TableCell className="text-right font-semibold">
                      {formatPourcentage(
                        ligne?.marge_operationnelle
                      )}
                    </TableCell>

                    {/* <TableCell>
                      {formatDate(
                        ligne?.date_generation
                      )}
                    </TableCell> */}
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="space-y-4 border-t pt-8">
        <div>
          <h3 className="text-lg font-semibold">
            Budget mensuel
          </h3>

          <p className="text-sm text-muted-foreground">
            Détail du budget mois par mois.
          </p>
        </div>

        {loadingBudgetMensuel && (
          <div className="flex min-h-[150px] items-center justify-center rounded-md border border-dashed">
            <p className="text-sm text-muted-foreground">
              Chargement du budget mensuel...
            </p>
          </div>
        )}

        {!loadingBudgetMensuel &&
          errorBudgetMensuel && (
            <div className="rounded-md border border-destructive/50 p-4">
              <p className="text-sm text-destructive">
                {errorBudgetMensuel}
              </p>
            </div>
          )}

        {!loadingBudgetMensuel &&
          !errorBudgetMensuel && (
            <BudgetMensuelTable
              data={
                budgetMensuel
              }
            />
          )}
      </section>
    </div>
  )
}

function afficherValeur(
  valeur: any
) {
  if (
    valeur === null ||
    valeur === undefined ||
    valeur === ""
  ) {
    return "-"
  }

  return String(valeur)
}

function formatMontant(
  valeur: any
) {
  if (
    valeur === null ||
    valeur === undefined ||
    valeur === ""
  ) {
    return "-"
  }

  const nombre =
    Number(valeur)

  if (
    Number.isNaN(nombre)
  ) {
    return "-"
  }

  return `${nombre.toLocaleString(
    "fr-FR",
    {
      maximumFractionDigits: 2,
    }
  )} MGA`
}

function formatPourcentage(
  valeur: any
) {
  if (
    valeur === null ||
    valeur === undefined ||
    valeur === ""
  ) {
    return "-"
  }

  const nombre =
    Number(valeur)

  if (
    Number.isNaN(nombre)
  ) {
    return "-"
  }

  return `${nombre.toLocaleString(
    "fr-FR",
    {
      maximumFractionDigits: 2,
    }
  )} %`
}

function formatDate(
  valeur: any
) {
  if (!valeur) {
    return "-"
  }

  const date =
    new Date(valeur)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(valeur)
  }

  return date.toLocaleString(
    "fr-FR"
  )
}