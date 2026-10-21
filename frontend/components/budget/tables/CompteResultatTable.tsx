
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type CompteResultatLigne = {
  code: string
  rubrique: string
  mensuel: (number | string | null)[]
  totalAnnuel: number | string | null
  type: string
  format: string
}

type CompteResultatTableProps = {
  data: CompteResultatLigne[]
}

const mois = [
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

export default function CompteResultatTable({
  data,
}: CompteResultatTableProps) {

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex min-h-[150px] items-center justify-center rounded-md border border-dashed">
        <p className="text-sm text-muted-foreground">
          Aucun compte de résultat disponible.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      <div>
        <h3 className="text-lg font-semibold">
          Compte de résultat
        </h3>

        <p className="text-sm text-muted-foreground">
          Résultats mensuels et annuels de l'exercice
        </p>
      </div>

      <div className="w-full overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[340px]">
                Rubrique
              </TableHead>

              {mois.map((nomMois) => (
                <TableHead
                  key={nomMois}
                  className="min-w-[150px] text-right"
                >
                  {nomMois}
                </TableHead>
              ))}

              <TableHead className="min-w-[180px] text-right">
                Total annuel
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.map((ligne, index) => {

              const estSousTotal =
                ligne.type === "sous-total"

              const estResultatFinal =
                ligne.type === "resultat-final"

              const estPourcentage =
                ligne.format === "pourcentage"

              const styleLigne = estResultatFinal
                ? "bg-emerald-700 text-white hover:bg-emerald-700"
                : estSousTotal
                  ? "bg-muted/70 font-semibold hover:bg-muted/70"
                  : ""

              return (
                <TableRow
                  key={`${ligne.code}-${index}`}
                  className={styleLigne}
                >
                  <TableCell
                    className={
                      estSousTotal || estResultatFinal
                        ? "font-bold"
                        : "font-medium"
                    }
                  >
                    {ligne.rubrique}
                  </TableCell>

                  {mois.map((_, i) => (
                    <TableCell
                      key={`${ligne.code}-${i}`}
                      className="text-right tabular-nums"
                    >
                      {estPourcentage
                        ? formatPourcentage(
                            ligne.mensuel?.[i]
                          )
                        : formatMontant(
                            ligne.mensuel?.[i]
                          )}
                    </TableCell>
                  ))}

                  <TableCell className="text-right font-semibold tabular-nums">
                    {estPourcentage
                      ? formatPourcentage(
                          ligne.totalAnnuel
                        )
                      : formatMontant(
                          ligne.totalAnnuel
                        )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function formatMontant(
  valeur: number | string | null | undefined
) {
  if (
    valeur === null ||
    valeur === undefined ||
    valeur === ""
  ) {
    return "-"
  }

  const nombre = Number(valeur)

  if (!Number.isFinite(nombre)) {
    return "-"
  }

  return `${nombre.toLocaleString("fr-FR", {
    maximumFractionDigits: 2,
  })} MGA`
}

function formatPourcentage(
  valeur: number | string | null | undefined
) {
  if (
    valeur === null ||
    valeur === undefined ||
    valeur === ""
  ) {
    return "-"
  }

  const nombre = Number(valeur)

  if (!Number.isFinite(nombre)) {
    return "-"
  }

  return `${nombre.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} %`
}
