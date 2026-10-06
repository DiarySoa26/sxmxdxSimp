import { Fragment } from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table"

type ProductionTableProps = {
  data: any[]
}

type LigneProduction = {
  site: string
  produit: string
  unite: string
  mois: Record<string, number>
  total: number
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

export default function ProductionTable({
  data,
}: ProductionTableProps) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-md border border-dashed">
        <p className="text-sm text-muted-foreground">
          Aucune donnée de production disponible pour cet exercice.
        </p>
      </div>
    )
  }

  const lignes = regrouperProduction(data)
  const sites = regrouperParSite(lignes)

  return (
    <div className="w-full overflow-x-auto rounded-md border">
      <Table>
        <TableBody>
          {Object.entries(sites).map(
            ([site, lignesSite]) => {
              const totalSite =
                calculerTotalSite(lignesSite)

              return (
                <Fragment key={site}>
                  <TableRow className="border-y-2 bg-primary/10 hover:bg-primary/10">
                    <TableCell
                      colSpan={15}
                      className="py-4 text-center text-base font-bold uppercase tracking-wide"
                    >
                      {site}
                    </TableCell>
                  </TableRow>

                  <TableRow className="bg-muted/70 hover:bg-muted/70">
                    <TableHead className="min-w-[180px] font-semibold text-foreground">
                      Produit
                    </TableHead>

                    <TableHead className="min-w-[110px] font-semibold text-foreground">
                      Unité
                    </TableHead>

                    {mois.map((nomMois) => (
                      <TableHead
                        key={`${site}-${nomMois}`}
                        className="min-w-[130px] text-right font-semibold text-foreground"
                      >
                        {nomMois}
                      </TableHead>
                    ))}

                    <TableHead className="min-w-[140px] text-right font-bold text-foreground">
                      Total
                    </TableHead>
                  </TableRow>

                  {lignesSite.map(
                    (ligne, index) => (
                      <TableRow
                        key={`${site}-${ligne.produit}-${ligne.unite}-${index}`}
                      >
                        <TableCell className="font-medium">
                          {afficherValeur(
                            ligne.produit
                          )}
                        </TableCell>

                        <TableCell>
                          {afficherValeur(
                            ligne.unite
                          )}
                        </TableCell>

                        {mois.map(
                          (nomMois) => (
                            <TableCell
                              key={`${site}-${ligne.produit}-${nomMois}`}
                              className="text-right"
                            >
                              {formatNombre(
                                ligne.mois[
                                  nomMois
                                ]
                              )}
                            </TableCell>
                          )
                        )}

                        <TableCell className="text-right font-bold">
                          {formatNombre(
                            ligne.total
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  )}

                  <TableRow className="border-b-4 bg-muted/40 hover:bg-muted/40">
                    <TableCell
                      colSpan={2}
                      className="font-bold"
                    >
                      Total {site}
                    </TableCell>

                    {mois.map(
                      (nomMois) => (
                        <TableCell
                          key={`total-${site}-${nomMois}`}
                          className="text-right font-bold"
                        >
                          {formatNombre(
                            totalSite.mois[
                              nomMois
                            ]
                          )}
                        </TableCell>
                      )
                    )}

                    <TableCell className="text-right font-bold">
                      {formatNombre(
                        totalSite.total
                      )}
                    </TableCell>
                  </TableRow>
                </Fragment>
              )
            }
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function regrouperProduction(
  data: any[]
): LigneProduction[] {
  const resultat =
    new Map<string, LigneProduction>()

  data.forEach((ligne) => {
    const site =
      afficherValeur(ligne?.site)

    const produit =
      afficherValeur(ligne?.produit)

    const unite =
      afficherValeur(ligne?.unite)

    const nomMois =
      normaliserMois(ligne?.nom_mois)

    const production =
      convertirNombre(
        ligne?.production_reelle
      )

    const cle = [
      site,
      produit,
      unite,
    ].join("|")

    if (!resultat.has(cle)) {
      const valeursMois:
        Record<string, number> = {}

      mois.forEach((nomMois) => {
        valeursMois[nomMois] = 0
      })

      resultat.set(cle, {
        site,
        produit,
        unite,
        mois: valeursMois,
        total: 0,
      })
    }

    const ligneGroupee =
      resultat.get(cle)

    if (!ligneGroupee) {
      return
    }

    if (
      nomMois &&
      mois.includes(nomMois)
    ) {
      ligneGroupee.mois[
        nomMois
      ] += production
    }

    ligneGroupee.total +=
      production
  })

  return Array.from(
    resultat.values()
  ).sort((a, b) => {
    const comparaisonSite =
      a.site.localeCompare(
        b.site,
        "fr"
      )

    if (comparaisonSite !== 0) {
      return comparaisonSite
    }

    const comparaisonProduit =
      a.produit.localeCompare(
        b.produit,
        "fr"
      )

    if (comparaisonProduit !== 0) {
      return comparaisonProduit
    }

    return a.unite.localeCompare(
      b.unite,
      "fr"
    )
  })
}

function regrouperParSite(
  lignes: LigneProduction[]
) {
  const resultat:
    Record<string, LigneProduction[]> = {}

  lignes.forEach((ligne) => {
    if (!resultat[ligne.site]) {
      resultat[ligne.site] = []
    }

    resultat[ligne.site].push(
      ligne
    )
  })

  return resultat
}

function calculerTotalSite(
  lignes: LigneProduction[]
) {
  const valeursMois:
    Record<string, number> = {}

  mois.forEach((nomMois) => {
    valeursMois[nomMois] = 0
  })

  let total = 0

  lignes.forEach((ligne) => {
    mois.forEach((nomMois) => {
      valeursMois[nomMois] +=
        ligne.mois[nomMois] ?? 0
    })

    total += ligne.total
  })

  return {
    mois: valeursMois,
    total,
  }
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
    Record<string, string> = {
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
    ] ?? String(valeur)
  )
}

function convertirNombre(
  valeur: any
) {
  const nombre =
    Number(valeur ?? 0)

  return Number.isNaN(nombre)
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

function formatNombre(
  valeur: any
) {
  const nombre =
    Number(valeur ?? 0)

  if (Number.isNaN(nombre)) {
    return "-"
  }

  return nombre.toLocaleString(
    "fr-FR",
    {
      maximumFractionDigits: 2,
    }
  )
}