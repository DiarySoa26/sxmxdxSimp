import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table"

type FraisExportTableProps = {
  data: any[]
}

type ValeursMois = {
  transport_local: number
  transit: number
  manutention: number
  fret: number
  assurance: number
  frais_bancaires: number
  total: number
}

type LigneFraisExport = {
  pays: string
  representant: string
  mois: Record<string, ValeursMois>
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

const typesFrais = [
  {
    key: "transport_local",
    label: "Transport local",
  },
  {
    key: "transit",
    label: "Transit",
  },
  {
    key: "manutention",
    label: "Manutention",
  },
  {
    key: "fret",
    label: "Fret",
  },
  {
    key: "assurance",
    label: "Assurance",
  },
  {
    key: "frais_bancaires",
    label: "Frais bancaires",
  },
  {
    key: "total",
    label: "Total",
  },
] as const

export default function FraisExportTable({
  data,
}: FraisExportTableProps) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-md border border-dashed">
        <p className="text-sm text-muted-foreground">
          Aucun frais export disponible pour cet exercice.
        </p>
      </div>
    )
  }

  const lignes =
    regrouperFraisExport(data)

  const paysGroupes =
    regrouperParPays(lignes)

  return (
    <div className="w-full overflow-x-auto rounded-md border">
      <Table>
        <TableBody>
          {Object.entries(
            paysGroupes
          ).map(
            ([pays, lignesPays]) => (
              <>
                <TableRow
                  key={`pays-${pays}`}
                  className="border-y-2 bg-primary/10 hover:bg-primary/10"
                >
                  <TableCell
                    colSpan={14}
                    className="py-4 text-base font-bold uppercase tracking-wide"
                  >
                    {pays}
                  </TableCell>
                </TableRow>

                <TableRow
                  key={`header-${pays}`}
                  className="bg-muted/70 hover:bg-muted/70"
                >
                  <TableHead className="min-w-[180px] font-semibold text-foreground">
                    Représentant
                  </TableHead>

                  <TableHead className="min-w-[150px] font-semibold text-foreground">
                    Frais
                  </TableHead>

                  {mois.map(
                    (nomMois) => (
                      <TableHead
                        key={`${pays}-${nomMois}`}
                        className="min-w-[150px] text-right font-bold text-foreground"
                      >
                        {nomMois}
                      </TableHead>
                    )
                  )}
                </TableRow>

                {lignesPays.map(
                  (ligne, index) => (
                    <>
                      {typesFrais.map(
                        (
                          typeFrais,
                          fraisIndex
                        ) => (
                          <TableRow
                            key={`${pays}-${ligne.representant}-${typeFrais.key}-${index}`}
                            className={
                              typeFrais.key ===
                              "total"
                                ? "bg-muted/30 font-semibold"
                                : ""
                            }
                          >
                            {fraisIndex ===
                              0 && (
                              <TableCell
                                rowSpan={
                                  typesFrais.length
                                }
                                className="border-r align-middle font-medium"
                              >
                                {
                                  ligne.representant
                                }
                              </TableCell>
                            )}

                            <TableCell
                              className={
                                typeFrais.key ===
                                "total"
                                  ? "font-bold"
                                  : "text-muted-foreground"
                              }
                            >
                              {
                                typeFrais.label
                              }
                            </TableCell>

                            {mois.map(
                              (
                                nomMois
                              ) => (
                                <TableCell
                                  key={`${pays}-${ligne.representant}-${typeFrais.key}-${nomMois}`}
                                  className={
                                    typeFrais.key ===
                                    "total"
                                      ? "text-right font-bold"
                                      : "text-right"
                                  }
                                >
                                  {formatMontant(
                                    ligne.mois[
                                      nomMois
                                    ][
                                      typeFrais.key
                                    ]
                                  )}
                                </TableCell>
                              )
                            )}
                          </TableRow>
                        )
                      )}
                    </>
                  )
                )}

                {/* <TotalPays
                  pays={pays}
                  lignes={
                    lignesPays
                  }
                /> */}
              </>
            )
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function TotalPays({
  pays,
  lignes,
}: {
  pays: string
  lignes: LigneFraisExport[]
}) {
  const totalPays =
    calculerTotalPays(lignes)

  return (
    <>
      {typesFrais.map(
        (
          typeFrais,
          index
        ) => (
          <TableRow
            key={`total-${pays}-${typeFrais.key}`}
            className={
              typeFrais.key ===
              "total"
                ? "border-b-4 bg-muted/60"
                : "bg-muted/40"
            }
          >
            {index === 0 && (
              <TableCell
                rowSpan={
                  typesFrais.length
                }
                className="border-r align-middle font-bold"
              >
                Total {pays}
              </TableCell>
            )}

            <TableCell
              className={
                typeFrais.key ===
                "total"
                  ? "font-bold"
                  : "font-semibold"
              }
            >
              {typeFrais.label}
            </TableCell>

            {mois.map(
              (nomMois) => (
                <TableCell
                  key={`total-${pays}-${typeFrais.key}-${nomMois}`}
                  className={
                    typeFrais.key ===
                    "total"
                      ? "text-right font-bold"
                      : "text-right font-semibold"
                  }
                >
                  {formatMontant(
                    totalPays[
                      nomMois
                    ][
                      typeFrais.key
                    ]
                  )}
                </TableCell>
              )
            )}
          </TableRow>
        )
      )}
    </>
  )
}

function creerValeursVides(): ValeursMois {
  return {
    transport_local: 0,
    transit: 0,
    manutention: 0,
    fret: 0,
    assurance: 0,
    frais_bancaires: 0,
    total: 0,
  }
}

function creerMoisVides() {
  const resultat:
    Record<
      string,
      ValeursMois
    > = {}

  mois.forEach(
    (nomMois) => {
      resultat[nomMois] =
        creerValeursVides()
    }
  )

  return resultat
}

function regrouperFraisExport(
  data: any[]
): LigneFraisExport[] {
  const resultat =
    new Map<
      string,
      LigneFraisExport
    >()

  data.forEach(
    (ligne) => {
      const pays =
        afficherValeur(
          ligne?.pays
        )

      const representant =
        afficherValeur(
          ligne?.representant
        )

      const nomMois =
        normaliserMois(
          ligne?.nom_mois
        )

      const cle = [
        pays,
        representant,
      ].join("|")

      if (
        !resultat.has(cle)
      ) {
        resultat.set(
          cle,
          {
            pays,
            representant,
            mois:
              creerMoisVides(),
          }
        )
      }

      const ligneGroupee =
        resultat.get(cle)

      if (!ligneGroupee) {
        return
      }

      if (
        !nomMois ||
        !mois.includes(
          nomMois
        )
      ) {
        return
      }

      const valeurs =
        ligneGroupee.mois[
          nomMois
        ]

      valeurs.transport_local +=
        convertirNombre(
          ligne?.transport_local
        )

      valeurs.transit +=
        convertirNombre(
          ligne?.transit
        )

      valeurs.manutention +=
        convertirNombre(
          ligne?.manutention
        )

      valeurs.fret +=
        convertirNombre(
          ligne?.fret
        )

      valeurs.assurance +=
        convertirNombre(
          ligne?.assurance
        )

      valeurs.frais_bancaires +=
        convertirNombre(
          ligne?.frais_bancaires
        )

      valeurs.total +=
        convertirNombre(
          ligne?.total
        )
    }
  )

  return Array.from(
    resultat.values()
  ).sort(
    (a, b) => {
      const comparaisonPays =
        a.pays.localeCompare(
          b.pays,
          "fr"
        )

      if (
        comparaisonPays !==
        0
      ) {
        return comparaisonPays
      }

      return a.representant
        .localeCompare(
          b.representant,
          "fr"
        )
    }
  )
}

function regrouperParPays(
  lignes: LigneFraisExport[]
) {
  const resultat:
    Record<
      string,
      LigneFraisExport[]
    > = {}

  lignes.forEach(
    (ligne) => {
      if (
        !resultat[
          ligne.pays
        ]
      ) {
        resultat[
          ligne.pays
        ] = []
      }

      resultat[
        ligne.pays
      ].push(ligne)
    }
  )

  return resultat
}

function calculerTotalPays(
  lignes: LigneFraisExport[]
) {
  const resultat =
    creerMoisVides()

  lignes.forEach(
    (ligne) => {
      mois.forEach(
        (nomMois) => {
          const source =
            ligne.mois[
              nomMois
            ]

          const destination =
            resultat[
              nomMois
            ]

          destination.transport_local +=
            source.transport_local

          destination.transit +=
            source.transit

          destination.manutention +=
            source.manutention

          destination.fret +=
            source.fret

          destination.assurance +=
            source.assurance

          destination.frais_bancaires +=
            source.frais_bancaires

          destination.total +=
            source.total
        }
      )
    }
  )

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

  const correspondances:
    Record<
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
      septembre:
        "Septembre",
      octobre:
        "Octobre",
      novembre:
        "Novembre",
      decembre:
        "Décembre",
      décembre:
        "Décembre",
    }

  return (
    correspondances[
      valeurNormalisee
    ] ??
    String(valeur)
  )
}

function convertirNombre(
  valeur: any
) {
  const nombre =
    Number(
      valeur ?? 0
    )

  return Number.isNaN(
    nombre
  )
    ? 0
    : nombre
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
  const nombre =
    Number(
      valeur ?? 0
    )

  if (
    Number.isNaN(
      nombre
    )
  ) {
    return "-"
  }

  return nombre.toLocaleString(
    "fr-FR",
    {
      maximumFractionDigits: 2,
    }
  )
}