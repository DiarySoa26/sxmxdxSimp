import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type EmployesTableProps = {
  data: any[]
}

export default function EmployesTable({
  data,
}: EmployesTableProps) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-md border border-dashed">
        <p className="text-sm text-muted-foreground">
          Aucun employé disponible pour cet exercice.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto rounded-md border">
      <Table className="w-full table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/5 text-left">
              Nom
            </TableHead>

            <TableHead className="w-1/5 text-right">
              Salaire de base mensuel
            </TableHead>

            <TableHead className="w-1/5 text-right">
              Prime
            </TableHead>

            <TableHead className="w-1/5 text-right">
              Charges patronales
            </TableHead>

            <TableHead className="w-1/5 text-right">
              Coût total
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((ligne, index) => (
            <TableRow
              key={
                ligne?.id ??
                `employe-${index}`
              }
            >
              <TableCell className="w-1/5 text-left font-medium">
                {afficherValeur(
                  ligne?.nom
                )}
              </TableCell>

              <TableCell className="w-1/5 text-right">
                {formatMontant(
                  ligne?.salaire_base
                )}
              </TableCell>

              <TableCell className="w-1/5 text-right">
                {formatMontant(
                  ligne?.prime
                )}
              </TableCell>

              <TableCell className="w-1/5 text-right">
                {formatMontant(
                  ligne?.charges_patronales
                )}
              </TableCell>

              <TableCell className="w-1/5 text-right font-medium">
                {formatMontant(
                  ligne?.cout_total
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
  const nombre = Number(valeur)

  if (Number.isNaN(nombre)) {
    return "-"
  }

  return `${nombre.toLocaleString(
    "fr-FR",
    {
      maximumFractionDigits: 2,
    }
  )} MGA`
}