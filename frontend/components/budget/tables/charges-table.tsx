import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type ChargesTableProps = {
  data: any[]
}

type LigneCharge = {
  categorie: string
  sous_categorie: string
  site: string
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

export default function ChargesTable({
  data,
}: ChargesTableProps) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-md border border-dashed">
        <p className="text-sm text-muted-foreground">
          Aucune charge disponible pour cet exercice.
        </p>
      </div>
    )
  }

  const lignes = regrouperCharges(data)
  const categories = regrouperParCategorie(lignes)

  return (
    <div className="w-full overflow-x-auto rounded-md border">
      <Table>
        <TableBody>
          {Object.entries(categories).map(
            ([categorie, lignesCategorie]) => {
              const totalCategorie =
                calculerTotalCategorie(lignesCategorie)

              return (
                <>
                  {/* <TableRow
                    key={`categorie-${categorie}`}
                    className="border-y-2 bg-primary/10 hover:bg-primary/10"
                  >
                    <TableCell
                      colSpan={mois.length + 4}
                      className="py-4 text-base font-bold uppercase tracking-wide"
                    >
                      {categorie}
                    </TableCell>
                  </TableRow> */}

                  <TableRow
  key={`categorie-${categorie}`}
  className="border-y-2 bg-primary/10 hover:bg-primary/10"
>
  <TableCell
    colSpan={mois.length + 4}
    className="py-4 text-base font-bold uppercase tracking-wide"
  >
    {categorie}
  </TableCell>
</TableRow>

                  <TableRow
                    key={`header-${categorie}`}
                    className="bg-muted/70 hover:bg-muted/70"
                  >
                    <TableHead className="min-w-[190px] font-semibold text-foreground">
                      Sous-catégorie
                    </TableHead>

                    <TableHead className="min-w-[150px] font-semibold text-foreground">
                      Site
                    </TableHead>

                    <TableHead className="min-w-[100px] font-semibold text-foreground">
                      Unité
                    </TableHead>

                    {mois.map((nomMois) => (
                      <TableHead
                        key={`${categorie}-${nomMois}`}
                        className="min-w-[130px] text-right font-semibold text-foreground"
                      >
                        {nomMois}
                      </TableHead>
                    ))}

                    <TableHead className="min-w-[150px] text-right font-bold text-foreground">
                      Total
                    </TableHead>
                  </TableRow>

                  {lignesCategorie.map((ligne, index) => (
                    <TableRow
                      key={`${categorie}-${ligne.sous_categorie}-${ligne.site}-${ligne.unite}-${index}`}
                    >
                      <TableCell className="font-medium">
                        {afficherValeur(ligne.sous_categorie)}
                      </TableCell>

                      <TableCell>
                        {afficherValeur(ligne.site)}
                      </TableCell>

                      <TableCell>
                        {afficherValeur(ligne.unite)}
                      </TableCell>

                      {mois.map((nomMois) => (
                        <TableCell
                          key={`${categorie}-${index}-${nomMois}`}
                          className="text-right"
                        >
                          {formatMontant(
                            ligne.mois[nomMois]
                          )}
                        </TableCell>
                      ))}

                      <TableCell className="text-right font-semibold">
                        {formatMontant(ligne.total)}
                      </TableCell>
                    </TableRow>
                  ))}

                  <TableRow
                    key={`total-${categorie}`}
                    className="border-b-4 bg-muted/40 hover:bg-muted/40"
                  >
                    <TableCell
                      colSpan={3}
                      className="font-bold"
                    >
                      Total {categorie}
                    </TableCell>

                    {mois.map((nomMois) => (
                      <TableCell
                        key={`total-${categorie}-${nomMois}`}
                        className="text-right font-bold"
                      >
                        {formatMontant(
                          totalCategorie.mois[nomMois]
                        )}
                      </TableCell>
                    ))}

                    <TableCell className="text-right font-bold">
                      {formatMontant(
                        totalCategorie.total
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

function regrouperCharges(
  data: any[]
): LigneCharge[] {
  const resultat =
    new Map<string, LigneCharge>()

  data.forEach((ligne) => {
    const categorie =
      afficherValeur(ligne?.categorie)

    const sousCategorie =
      afficherValeur(ligne?.sous_categorie)

    const site =
      afficherValeur(ligne?.site)

    const unite =
      afficherValeur(ligne?.unite)

    const nomMois =
      normaliserMois(ligne?.nom_mois)

    const montant =
      Number(ligne?.montant ?? 0)

    const cle = [
      categorie,
      sousCategorie,
      site,
      unite,
    ].join("|")

    if (!resultat.has(cle)) {
      const valeursMois:
        Record<string, number> = {}

      mois.forEach((m) => {
        valeursMois[m] = 0
      })

      resultat.set(cle, {
        categorie,
        sous_categorie: sousCategorie,
        site,
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

    const montantValide =
      Number.isNaN(montant)
        ? 0
        : montant

    if (
      nomMois &&
      mois.includes(nomMois)
    ) {
      ligneGroupee.mois[nomMois] +=
        montantValide
    }

    ligneGroupee.total +=
      montantValide
  })

  return Array.from(
    resultat.values()
  ).sort((a, b) => {
    const comparaisonCategorie =
      a.categorie.localeCompare(
        b.categorie,
        "fr"
      )

    if (comparaisonCategorie !== 0) {
      return comparaisonCategorie
    }

    const comparaisonSousCategorie =
      a.sous_categorie.localeCompare(
        b.sous_categorie,
        "fr"
      )

    if (
      comparaisonSousCategorie !== 0
    ) {
      return comparaisonSousCategorie
    }

    return a.site.localeCompare(
      b.site,
      "fr"
    )
  })
}

function regrouperParCategorie(
  lignes: LigneCharge[]
) {
  const resultat:
    Record<string, LigneCharge[]> = {}

  lignes.forEach((ligne) => {
    if (!resultat[ligne.categorie]) {
      resultat[ligne.categorie] = []
    }

    resultat[ligne.categorie].push(
      ligne
    )
  })

  return resultat
}

function calculerTotalCategorie(
  lignes: LigneCharge[]
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
    correspondances[valeurNormalisee] ??
    String(valeur)
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