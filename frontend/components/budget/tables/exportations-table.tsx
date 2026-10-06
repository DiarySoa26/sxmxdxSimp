import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type ExportationsTableProps = {
  data: any[]
}

type ValeursMois = {
  quantite: number
  ca_devise: number
  ca_mga: number
}

type LigneExportation = {
  pays: string
  representant: string
  produit: string
  devise: string
  mois: Record<string, ValeursMois>
  totalQuantite: number
  totalCaDevise: number
  totalCaMga: number
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

export default function ExportationsTable({
  data,
}: ExportationsTableProps) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-md border border-dashed">
        <p className="text-sm text-muted-foreground">
          Aucune exportation disponible pour cet exercice.
        </p>
      </div>
    )
  }

  const lignes = regrouperExportations(data)
  const paysGroupes = regrouperParPays(lignes)

  return (
    <div className="w-full overflow-x-auto rounded-md border">
      <Table>
        <TableBody>
          {Object.entries(paysGroupes).map(
            ([pays, lignesPays]) => {
              const totalPays =
                calculerTotalPays(lignesPays)

              return (
                <>
                  <TableRow
                    key={`pays-${pays}`}
                    className="border-y-2 bg-primary/10 hover:bg-primary/10"
                  >
                    <TableCell
                      colSpan={43}
                      className="py-4 text-base font-bold uppercase tracking-wide"
                    >
                      {pays}
                    </TableCell>
                  </TableRow>

                  <TableRow
                    key={`mois-${pays}`}
                    className="bg-muted/70 hover:bg-muted/70"
                  >
                    <TableHead
                      rowSpan={2}
                      className="min-w-[160px] align-middle font-semibold text-foreground"
                    >
                      Représentant
                    </TableHead>

                    <TableHead
                      rowSpan={2}
                      className="min-w-[160px] align-middle font-semibold text-foreground"
                    >
                      Produit
                    </TableHead>

                    <TableHead
                      rowSpan={2}
                      className="min-w-[90px] align-middle font-semibold text-foreground"
                    >
                      Devise
                    </TableHead>

                    {mois.map((nomMois) => (
                      <TableHead
                        key={`${pays}-${nomMois}`}
                        colSpan={3}
                        className="border-l text-center font-bold text-foreground"
                      >
                        {nomMois}
                      </TableHead>
                    ))}

                    <TableHead
                      colSpan={4}
                      className="border-l text-center font-bold text-foreground"
                    >
                      Total
                    </TableHead>
                  </TableRow>

                  <TableRow
                    key={`colonnes-${pays}`}
                    className="bg-muted/50 hover:bg-muted/50"
                  >
                    {mois.map((nomMois) => (
                      <>
                        <TableHead
                          key={`${pays}-${nomMois}-quantite`}
                          className="min-w-[110px] border-l text-right text-xs"
                        >
                          Quantité
                        </TableHead>

                        <TableHead
                          key={`${pays}-${nomMois}-devise`}
                          className="min-w-[130px] text-right text-xs"
                        >
                          CA devise
                        </TableHead>

                        <TableHead
                          key={`${pays}-${nomMois}-mga`}
                          className="min-w-[150px] text-right text-xs"
                        >
                          CA MGA
                        </TableHead>
                      </>
                    ))}

                    <TableHead className="min-w-[120px] border-l text-right text-xs">
                      Quantité
                    </TableHead>

                    <TableHead className="min-w-[140px] text-right text-xs">
                      CA devise
                    </TableHead>

                    <TableHead className="min-w-[160px] text-right text-xs">
                      CA MGA
                    </TableHead>
                  </TableRow>

                  {lignesPays.map((ligne, index) => (
                    <TableRow
                      key={`${pays}-${ligne.representant}-${ligne.produit}-${ligne.devise}-${index}`}
                    >
                      <TableCell className="font-medium">
                        {afficherValeur(
                          ligne.representant
                        )}
                      </TableCell>

                      <TableCell>
                        {afficherValeur(
                          ligne.produit
                        )}
                      </TableCell>

                      <TableCell>
                        {afficherValeur(
                          ligne.devise
                        )}
                      </TableCell>

                      {mois.map((nomMois) => (
                        <>
                          <TableCell
                            key={`${index}-${nomMois}-quantite`}
                            className="border-l text-right"
                          >
                            {formatNombre(
                              ligne.mois[nomMois]
                                .quantite
                            )}
                          </TableCell>

                          <TableCell
                            key={`${index}-${nomMois}-devise`}
                            className="text-right"
                          >
                            {formatNombre(
                              ligne.mois[nomMois]
                                .ca_devise
                            )}
                          </TableCell>

                          <TableCell
                            key={`${index}-${nomMois}-mga`}
                            className="text-right font-medium"
                          >
                            {formatNombre(
                              ligne.mois[nomMois]
                                .ca_mga
                            )}
                          </TableCell>
                        </>
                      ))}

                      <TableCell className="border-l text-right font-semibold">
                        {formatNombre(
                          ligne.totalQuantite
                        )}
                      </TableCell>

                      <TableCell className="text-right font-semibold">
                        {formatNombre(
                          ligne.totalCaDevise
                        )}
                      </TableCell>

                      <TableCell className="text-right font-bold">
                        {formatNombre(
                          ligne.totalCaMga
                        )}
                      </TableCell>
                    </TableRow>
                  ))}

                  <TableRow
                    key={`total-${pays}`}
                    className="border-b-4 bg-muted/40 hover:bg-muted/40"
                  >
                    <TableCell
                      colSpan={3}
                      className="font-bold"
                    >
                      Total {pays}
                    </TableCell>

                    {mois.map((nomMois) => (
                      <>
                        <TableCell
                          key={`total-${pays}-${nomMois}-quantite`}
                          className="border-l text-right font-semibold"
                        >
                          {formatNombre(
                            totalPays.mois[
                              nomMois
                            ].quantite
                          )}
                        </TableCell>

                        <TableCell
                          key={`total-${pays}-${nomMois}-devise`}
                          className="text-right font-semibold"
                        >
                          {formatNombre(
                            totalPays.mois[
                              nomMois
                            ].ca_devise
                          )}
                        </TableCell>

                        <TableCell
                          key={`total-${pays}-${nomMois}-mga`}
                          className="text-right font-bold"
                        >
                          {formatNombre(
                            totalPays.mois[
                              nomMois
                            ].ca_mga
                          )}
                        </TableCell>
                      </>
                    ))}

                    <TableCell className="border-l text-right font-bold">
                      {formatNombre(
                        totalPays.totalQuantite
                      )}
                    </TableCell>

                    <TableCell className="text-right font-bold">
                      {formatNombre(
                        totalPays.totalCaDevise
                      )}
                    </TableCell>

                    <TableCell className="text-right font-bold">
                      {formatNombre(
                        totalPays.totalCaMga
                      )}
                    </TableCell>
                  </TableRow>
                </>
              )
            }
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function creerValeursMois() {
  const valeurs:
    Record<string, ValeursMois> = {}

  mois.forEach((nomMois) => {
    valeurs[nomMois] = {
      quantite: 0,
      ca_devise: 0,
      ca_mga: 0,
    }
  })

  return valeurs
}

function regrouperExportations(
  data: any[]
): LigneExportation[] {
  const resultat =
    new Map<string, LigneExportation>()

  data.forEach((ligne) => {
    const pays =
      afficherValeur(ligne?.pays)

    const representant =
      afficherValeur(ligne?.representant)

    const produit =
      afficherValeur(ligne?.produit)

    const devise =
      afficherValeur(ligne?.devise)

    const nomMois =
      normaliserMois(ligne?.nom_mois)

    const quantite =
      convertirNombre(ligne?.quantite)

    const caDevise =
      convertirNombre(ligne?.ca_devise)

    const caMga =
      convertirNombre(ligne?.ca_mga)

    const cle = [
      pays,
      representant,
      produit,
      devise,
    ].join("|")

    if (!resultat.has(cle)) {
      resultat.set(cle, {
        pays,
        representant,
        produit,
        devise,
        mois: creerValeursMois(),
        totalQuantite: 0,
        totalCaDevise: 0,
        totalCaMga: 0,
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
      ].quantite += quantite

      ligneGroupee.mois[
        nomMois
      ].ca_devise += caDevise

      ligneGroupee.mois[
        nomMois
      ].ca_mga += caMga
    }

    ligneGroupee.totalQuantite +=
      quantite

    ligneGroupee.totalCaDevise +=
      caDevise

    ligneGroupee.totalCaMga +=
      caMga
  })

  return Array.from(
    resultat.values()
  ).sort((a, b) => {
    const comparaisonPays =
      a.pays.localeCompare(
        b.pays,
        "fr"
      )

    if (comparaisonPays !== 0) {
      return comparaisonPays
    }

    const comparaisonRepresentant =
      a.representant.localeCompare(
        b.representant,
        "fr"
      )

    if (
      comparaisonRepresentant !== 0
    ) {
      return comparaisonRepresentant
    }

    return a.produit.localeCompare(
      b.produit,
      "fr"
    )
  })
}

function regrouperParPays(
  lignes: LigneExportation[]
) {
  const resultat:
    Record<string, LigneExportation[]> = {}

  lignes.forEach((ligne) => {
    if (!resultat[ligne.pays]) {
      resultat[ligne.pays] = []
    }

    resultat[ligne.pays].push(
      ligne
    )
  })

  return resultat
}

function calculerTotalPays(
  lignes: LigneExportation[]
) {
  const valeursMois =
    creerValeursMois()

  let totalQuantite = 0
  let totalCaDevise = 0
  let totalCaMga = 0

  lignes.forEach((ligne) => {
    mois.forEach((nomMois) => {
      valeursMois[
        nomMois
      ].quantite +=
        ligne.mois[
          nomMois
        ].quantite

      valeursMois[
        nomMois
      ].ca_devise +=
        ligne.mois[
          nomMois
        ].ca_devise

      valeursMois[
        nomMois
      ].ca_mga +=
        ligne.mois[
          nomMois
        ].ca_mga
    })

    totalQuantite +=
      ligne.totalQuantite

    totalCaDevise +=
      ligne.totalCaDevise

    totalCaMga +=
      ligne.totalCaMga
  })

  return {
    mois: valeursMois,
    totalQuantite,
    totalCaDevise,
    totalCaMga,
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