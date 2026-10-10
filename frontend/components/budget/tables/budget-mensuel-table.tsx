import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type BudgetMensuelTableProps = {
  data: any[]
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

const indicateurs = [
  {
    key: "ca_export",
    label: "CA export",
    type: "montant",
  },
  {
    key: "charges_exploitation",
    label: "Charges d'exploitation",
    type: "montant",
  },
  {
    key: "frais_export",
    label: "Frais export",
    type: "montant",
  },
  {
    key: "masse_salariale",
    label: "Masse salariale",
    type: "montant",
  },
  {
    key: "resultat_operationnel",
    label: "Résultat opérationnel",
    type: "montant",
  },
  {
    key: "marge_operationnelle",
    label: "Marge opérationnelle",
    type: "pourcentage",
  },
]

export default function BudgetMensuelTable({
  data,
}: BudgetMensuelTableProps) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex min-h-[150px] items-center justify-center rounded-md border border-dashed">
        <p className="text-sm text-muted-foreground">
          Aucun budget mensuel disponible.
        </p>
      </div>
    )
  }

  const donneesParMois = construireDonneesParMois(data)

  return (
    <div className="w-full overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[220px]">
              Indicateur
            </TableHead>

            {mois.map((nomMois) => (
              <TableHead
                key={nomMois}
                className="min-w-[150px] text-right"
              >
                {nomMois}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {indicateurs.map((indicateur) => (
            <TableRow key={indicateur.key}>
              <TableCell className="font-medium">
                {indicateur.label}
              </TableCell>

              {mois.map((nomMois) => {
                const ligne =
                  donneesParMois[nomMois]

                const valeur =
                  ligne?.[indicateur.key]

                return (
                  <TableCell
                    key={`${indicateur.key}-${nomMois}`}
                    className={
                      indicateur.key ===
                      "resultat_operationnel"
                        ? "text-right"
                        : indicateur.key ===
                            "marge_operationnelle"
                          ? "text-right"
                          : "text-right"
                    }
                  >
                    {indicateur.type ===
                    "pourcentage"
                      ? formatPourcentage(
                          valeur
                        )
                      : formatMontant(
                          valeur
                        )}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function construireDonneesParMois(
  data: any[]
) {
  const resultat: Record<
    string,
    any
  > = {}

  data.forEach((ligne) => {
    const nomMois =
      normaliserMois(
        ligne?.nom_mois ??
          ligne?.mois
      )

    if (!nomMois) {
      return
    }

    resultat[nomMois] =
      ligne
  })

  return resultat
}

function normaliserMois(
  valeur: any
) {
  if (!valeur) {
    return ""
  }

  const valeurNormalisee =
    String(valeur)
      .trim()
      .toLowerCase()

  const correspondances: Record<
    string,
    string
  > = {
    janvier: "Janvier",
    fevrier: "Février",
    février: "Février",
    mars: "Mars",
    avril: "Avril",
    mai: "Mai",
    juin: "Juin",
    juillet: "Juillet",
    aout: "Août",
    août: "Août",
    septembre: "Septembre",
    octobre: "Octobre",
    novembre: "Novembre",
    decembre: "Décembre",
    décembre: "Décembre",
  }

  return (
    correspondances[
      valeurNormalisee
    ] ?? ""
  )
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

  if (Number.isNaN(nombre)) {
    return "-"
  }

  return `${nombre.toLocaleString(
    "fr-FR",
    {
      maximumFractionDigits: 2,
    }
  )} %`
}