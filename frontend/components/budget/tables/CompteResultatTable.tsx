
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table"

// type CompteResultatLigne = {
//   code: string
//   rubrique: string
//   mensuel: (number | string | null)[]
//   totalAnnuel: number | string | null
//   type: string
//   format: string
// }

// type CompteResultatTableProps = {
//   data: CompteResultatLigne[]
// }

// const mois = [
//   "Janvier",
//   "Février",
//   "Mars",
//   "Avril",
//   "Mai",
//   "Juin",
//   "Juillet",
//   "Août",
//   "Septembre",
//   "Octobre",
//   "Novembre",
//   "Décembre",
// ]

// export default function CompteResultatTable({
//   data,
// }: CompteResultatTableProps) {

//   if (!Array.isArray(data) || data.length === 0) {
//     return (
//       <div className="flex min-h-[150px] items-center justify-center rounded-md border border-dashed">
//         <p className="text-sm text-muted-foreground">
//           Aucun compte de résultat disponible.
//         </p>
//       </div>
//     )
//   }

//   return (
//     <div className="w-full space-y-4">
//       <div>
//         <h3 className="text-lg font-semibold">
//           Compte de résultat
//         </h3>

//         <p className="text-sm text-muted-foreground">
//           Résultats mensuels et annuels de l'exercice
//         </p>
//       </div>

//       <div className="w-full overflow-x-auto rounded-md border">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead className="min-w-[340px]">
//                 Rubrique
//               </TableHead>

//               {mois.map((nomMois) => (
//                 <TableHead
//                   key={nomMois}
//                   className="min-w-[150px] text-right"
//                 >
//                   {nomMois}
//                 </TableHead>
//               ))}

//               <TableHead className="min-w-[180px] text-right">
//                 Total annuel
//               </TableHead>
//             </TableRow>
//           </TableHeader>

//           <TableBody>
//             {data.map((ligne, index) => {

//               const estSousTotal =
//                 ligne.type === "sous-total"

//               const estResultatFinal =
//                 ligne.type === "resultat-final"

//               const estPourcentage =
//                 ligne.format === "pourcentage"

//               const styleLigne = estResultatFinal
//                 ? "bg-emerald-700 text-white hover:bg-emerald-700"
//                 : estSousTotal
//                   ? "bg-muted/70 font-semibold hover:bg-muted/70"
//                   : ""

//               return (
//                 <TableRow
//                   key={`${ligne.code}-${index}`}
//                   className={styleLigne}
//                 >
//                   <TableCell
//                     className={
//                       estSousTotal || estResultatFinal
//                         ? "font-bold"
//                         : "font-medium"
//                     }
//                   >
//                     {ligne.rubrique}
//                   </TableCell>

//                   {mois.map((_, i) => (
//                     <TableCell
//                       key={`${ligne.code}-${i}`}
//                       className="text-right tabular-nums"
//                     >
//                       {estPourcentage
//                         ? formatPourcentage(
//                             ligne.mensuel?.[i]
//                           )
//                         : formatMontant(
//                             ligne.mensuel?.[i]
//                           )}
//                     </TableCell>
//                   ))}

//                   <TableCell className="text-right font-semibold tabular-nums">
//                     {estPourcentage
//                       ? formatPourcentage(
//                           ligne.totalAnnuel
//                         )
//                       : formatMontant(
//                           ligne.totalAnnuel
//                         )}
//                   </TableCell>
//                 </TableRow>
//               )
//             })}
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//   )
// }

// function formatMontant(
//   valeur: number | string | null | undefined
// ) {
//   if (
//     valeur === null ||
//     valeur === undefined ||
//     valeur === ""
//   ) {
//     return "-"
//   }

//   const nombre = Number(valeur)

//   if (!Number.isFinite(nombre)) {
//     return "-"
//   }

//   return `${nombre.toLocaleString("fr-FR", {
//     maximumFractionDigits: 2,
//   })} MGA`
// }

// function formatPourcentage(
//   valeur: number | string | null | undefined
// ) {
//   if (
//     valeur === null ||
//     valeur === undefined ||
//     valeur === ""
//   ) {
//     return "-"
//   }

//   const nombre = Number(valeur)

//   if (!Number.isFinite(nombre)) {
//     return "-"
//   }

//   return `${nombre.toLocaleString("fr-FR", {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   })} %`
// }







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

type Charge = {
  categorie?: string | null
  sous_categorie?: string | null
  site?: string | null
  unite?: string | null
  nom_mois?: string | null
  montant?: number | string | null
}

type CompteResultatTableProps = {
  data: CompteResultatLigne[]
  charges: Charge[]
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

function normaliserTexte(valeur: unknown) {
  return String(valeur ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase()
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
}

function indiceMois(valeur: unknown) {
  const normalise = normaliserTexte(valeur)

  const index = mois.findIndex(
    m => normaliserTexte(m) === normalise
  )

  return index
}

function montantNumerique(valeur: unknown) {
  if (valeur === null || valeur === undefined || valeur === "") {
    return 0
  }

  const n = Number(valeur)

  return Number.isFinite(n) ? n : 0
}

function estAchatsConsommes(ligne: CompteResultatLigne) {
  const code = normaliserTexte(ligne.code)
  const rubrique = normaliserTexte(ligne.rubrique)

  return (
    code === "ACHATS CONSOMMES" ||
    code === "ACHAT CONSOMME" ||
    rubrique === "ACHATS CONSOMMES" ||
    rubrique === "ACHAT CONSOMME"
  )
}

function calculerAchatsProduits(charges: Charge[]) {
  const mensuel = Array(12).fill(0) as number[]

  charges.forEach(charge => {
    if (normaliserTexte(charge.categorie) !== "ACHAT PRODUITS") {
      return
    }

    const index = indiceMois(charge.nom_mois)

    if (index < 0) return

    mensuel[index] += montantNumerique(charge.montant)
  })

  return {
    mensuel,
    totalAnnuel: mensuel.reduce(
      (total, montant) => total + montant,
      0
    ),
  }
}

export default function CompteResultatTable({
  data,
  charges,
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

  const achatsProduits = calculerAchatsProduits(
    Array.isArray(charges) ? charges : []
  )

  // Remplacer uniquement la ligne Achats consommés
  // par les totaux de la catégorie ACHAT PRODUITS.
  const lignes = data.map(ligne => {
    if (!estAchatsConsommes(ligne)) {
      return ligne
    }

    return {
      ...ligne,
      mensuel: achatsProduits.mensuel,
      totalAnnuel: achatsProduits.totalAnnuel,
    }
  })

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

              {mois.map(nomMois => (
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
            {lignes.map((ligne, index) => {

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
