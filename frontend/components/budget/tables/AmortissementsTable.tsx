
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Amortissement = {
  id?: number
  import_id?: number
  categorie?: string
  nature?: string
  perimetre_general?: string
  unite?: string
  mois?: number | string
  nom_mois?: string
  montant?: number | string
}

type AmortissementsTableProps = {
  data: Amortissement[]
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

type LigneAmortissement = {
  categorie: string
  nature: string
  perimetre: string
  unite: string
  mensuel: number[]
  totalAnnuel: number
}

export default function AmortissementsTable({
  data,
}: AmortissementsTableProps) {

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex min-h-[150px] items-center justify-center rounded-md border border-dashed">
        <p className="text-sm text-muted-foreground">
          Aucun amortissement disponible.
        </p>
      </div>
    )
  }

  const lignes = construireDonnees(data)

  const totauxMensuels = mois.map((_, index) =>
    lignes.reduce(
      (total, ligne) =>
        total + ligne.mensuel[index],
      0
    )
  )

  const totalAnnuel = totauxMensuels.reduce(
    (total, montant) => total + montant,
    0
  )

  return (
    <div className="w-full space-y-4">
      {/* <div>
        <h3 className="text-lg font-semibold">
          Amortissements
        </h3>
        <p className="text-sm text-muted-foreground">
          Répartition mensuelle des dotations aux amortissements
        </p>
      </div> */}

      <div className="w-full overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[170px]">
                Catégorie
              </TableHead>

              <TableHead className="min-w-[260px]">
                Nature
              </TableHead>

              {/* <TableHead className="min-w-[160px]">
                Périmètre
              </TableHead> */}

              <TableHead className="min-w-[80px]">
                Unité
              </TableHead>

              {mois.map((nomMois) => (
                <TableHead
                  key={nomMois}
                  className="min-w-[150px] text-right"
                >
                  {nomMois}
                </TableHead>
              ))}

              <TableHead className="min-w-[180px] text-right font-bold">
                Total annuel
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {lignes.map((ligne, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {ligne.categorie}
                </TableCell>

                <TableCell>
                  {ligne.nature}
                </TableCell>

                {/* <TableCell>
                  {ligne.perimetre || "-"}
                </TableCell> */}

                <TableCell>
                  {ligne.unite || "MGA"}
                </TableCell>

                {ligne.mensuel.map((valeur, i) => (
                  <TableCell
                    key={i}
                    className="text-right"
                  >
                    {formatMontant(valeur)}
                  </TableCell>
                ))}

                <TableCell className="bg-muted/40 text-right font-semibold">
                  {formatMontant(ligne.totalAnnuel)}
                </TableCell>
              </TableRow>
            ))}

            <TableRow className="bg-muted/60 font-bold hover:bg-muted/60">
              <TableCell colSpan={3}>
                TOTAL AMORTISSEMENTS
              </TableCell>

              {totauxMensuels.map((valeur, index) => (
                <TableCell
                  key={index}
                  className="text-right"
                >
                  {formatMontant(valeur)}
                </TableCell>
              ))}

              <TableCell className="text-right">
                {formatMontant(totalAnnuel)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function construireDonnees(
  data: Amortissement[]
): LigneAmortissement[] {

  const groupes = new Map<
    string,
    LigneAmortissement
  >()

  data.forEach((item) => {

    const categorie = item.categorie ?? ""
    const nature = item.nature ?? ""
    const perimetre = item.perimetre_general ?? ""
    const unite = item.unite ?? "MGA"

    const cle = JSON.stringify([
      item.import_id,
      categorie,
      nature,
      perimetre,
      unite,
    ])

    if (!groupes.has(cle)) {
      groupes.set(cle, {
        categorie,
        nature,
        perimetre,
        unite,
        mensuel: Array(12).fill(0),
        totalAnnuel: 0,
      })
    }

    const ligne = groupes.get(cle)!

    const indexMois = normaliserMois(
      item.mois ?? item.nom_mois
    )

    const montant = Number(item.montant ?? 0)

    if (
      indexMois >= 0 &&
      indexMois < 12 &&
      Number.isFinite(montant)
    ) {
      ligne.mensuel[indexMois] += montant
    }
  })

  return Array.from(groupes.values()).map(
    (ligne) => ({
      ...ligne,
      totalAnnuel: ligne.mensuel.reduce(
        (total, valeur) => total + valeur,
        0
      ),
    })
  )
}

function normaliserMois(
  valeur: number | string | undefined
): number {

  if (valeur === null || valeur === undefined) {
    return -1
  }

  const numero = Number(valeur)

  if (
    Number.isInteger(numero) &&
    numero >= 1 &&
    numero <= 12
  ) {
    return numero - 1
  }

  const nom = String(valeur)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")

  const index = mois.findIndex(
    (m) =>
      m.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") === nom
  )

  return index
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
