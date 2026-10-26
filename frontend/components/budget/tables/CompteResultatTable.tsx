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

// type Charge = {
//   categorie?: string | null
//   sous_categorie?: string | null
//   site?: string | null
//   unite?: string | null
//   nom_mois?: string | null
//   montant?: number | string | null
// }

// type CompteResultatTableProps = {
//   data: CompteResultatLigne[]
//   charges: Charge[]
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


// function normaliserTexte(valeur: unknown) {
//   return String(valeur ?? "")
//     .normalize("NFD")
//     .replace(/[\u0300-\u036f]/g, "")
//     .trim()
//     .toUpperCase()
//     .replace(/[_-]/g, " ")
//     .replace(/\s+/g, " ")
// }

// function indiceMois(valeur: unknown) {
//   const normalise = normaliserTexte(valeur)

//   return mois.findIndex(
//     m => normaliserTexte(m) === normalise
//   )
// }

// function montantNumerique(valeur: unknown) {
//   if (
//     valeur === null ||
//     valeur === undefined ||
//     valeur === ""
//   ) {
//     return 0
//   }

//   const n = Number(valeur)

//   return Number.isFinite(n) ? n : 0
// }

// function estAchatsConsommes(
//   ligne: CompteResultatLigne
// ) {
//   const code = normaliserTexte(ligne.code)
//   const rubrique = normaliserTexte(ligne.rubrique)

//   return (
//     code === "ACHATS CONSOMMES" ||
//     code === "ACHAT CONSOMME" ||
//     rubrique === "ACHATS CONSOMMES" ||
//     rubrique === "ACHAT CONSOMME"
//   )
// }

// function estServicesExterieurs(
//   ligne: CompteResultatLigne
// ) {
//   const code = normaliserTexte(ligne.code)
//   const rubrique = normaliserTexte(ligne.rubrique)

//   return (
//     code === "SERVICES EXTERIEURS" ||
//     code === "SERVICE EXTERIEUR" ||
//     rubrique === "SERVICES EXTERIEURS" ||
//     rubrique === "SERVICE EXTERIEUR"
//   )
// }


// function estImpotsEttaxes(
//   ligne: CompteResultatLigne
// ) {
//   const code = normaliserTexte(ligne.code)
//   const rubrique = normaliserTexte(ligne.rubrique)

//   return (
//     code === "IMPOTS ET TAXES" ||
//     code === "IMPOT ET TAXE" ||
//     rubrique === "IMPOTS ET TAXES" ||
//     rubrique === "IMPOT ET TAXE"
//   )
// }


// function estConsommationExercice(
//   ligne: CompteResultatLigne
// ) {
//   const code = normaliserTexte(ligne.code)
//   const rubrique = normaliserTexte(ligne.rubrique)

//   return (
//     code === "II" ||
//     rubrique === "II. CONSOMMATION DE L EXERCICE" ||
//     rubrique === "CONSOMMATION DE L EXERCICE"
//   )
// }


// function estValeurAjoutee(
//   ligne: CompteResultatLigne
// ) {
//   const code = normaliserTexte(ligne.code)
//   const rubrique = normaliserTexte(ligne.rubrique)

//   return (
//     code === "III" ||
//     rubrique === "III. VALEUR AJOUTEE" ||
//     rubrique === "VALEUR AJOUTEE"
//   )
// }

// function calculerChargesCategories(
//   charges: Charge[],
//   categories: string[]
// ) {
//   const mensuel = Array(12).fill(0) as number[]

//   const categoriesNormalisees = new Set(
//     categories.map(normaliserTexte)
//   )

//   charges.forEach(charge => {

//     const categorie = normaliserTexte(
//       charge.categorie
//     )

//     if (!categoriesNormalisees.has(categorie)) {
//       return
//     }

//     const index = indiceMois(charge.nom_mois)

//     if (index < 0) return

//     mensuel[index] += montantNumerique(
//       charge.montant
//     )
//   })

//   const totalAnnuel = mensuel.reduce(
//     (total, montant) => total + montant,
//     0
//   )

//   return {
//     mensuel,
//     totalAnnuel,
//   }
// }

// // ======================================================
// // COMPONENT
// // ======================================================

// export default function CompteResultatTable({
//   data,
//   charges,
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

//   const donneesCharges = Array.isArray(charges)
//     ? charges
//     : []

//   const achatsProduits = calculerChargesCategories(
//     donneesCharges,
//     ["ACHAT PRODUITS"]
//   )

//   const servicesExterieurs = calculerChargesCategories(
//     donneesCharges,
//     [
//       "ADMINISTRATION",
//       "FINANCE",
//       "LOGISTIQUE",
//     ]
//   )

//   const impotsettaxes = calculerChargesCategories(
//     donneesCharges,
//     [
//       "FISCAL",
//     ]
//   )


//   const consommationExerciceMensuel = mois.map((_, index) =>
//     achatsProduits.mensuel[index] + servicesExterieurs.mensuel[index]
//   )

//   const consommationExerciceTotal =
//     consommationExerciceMensuel.reduce(
//       (total, montant) => total + montant,
//       0
//     )


  
//     // ====================================================
// // VALEUR AJOUTÉE
// // Production - Consommation
// // ====================================================

// // Récupérer la production de l'exercice
// const ligneProduction = data.find(ligne => {
//   const code = normaliserTexte(ligne.code)
//   const rubrique = normaliserTexte(ligne.rubrique)

//   return (
//     code === "I" ||
//     rubrique === "I. PRODUCTION DE L EXERCICE" ||
//     rubrique === "PRODUCTION DE L EXERCICE"
//   )
// })

// // Calcul mensuel de la valeur ajoutée
// const valeurAjouteeMensuel = mois.map(
//   (_, index) => {

//     const production = montantNumerique(
//       ligneProduction?.mensuel?.[index]
//     )

//     const consommation =
//       consommationExerciceMensuel[index]

//     return production - consommation
//   }
// )

// // Total annuel
// const valeurAjouteeTotal =
//   valeurAjouteeMensuel.reduce(
//     (total, montant) => total + montant,
//     0
//   )


//   const lignes = data.map(ligne => {

//     if (estAchatsConsommes(ligne)) {
//       return {
//         ...ligne,
//         mensuel: achatsProduits.mensuel,
//         totalAnnuel: achatsProduits.totalAnnuel,
//       }
//     }

//     if (estServicesExterieurs(ligne)) {
//       return {
//         ...ligne,
//         mensuel: servicesExterieurs.mensuel,
//         totalAnnuel: servicesExterieurs.totalAnnuel,
//       }
//     }


//     if (estConsommationExercice(ligne)) {
//       return {
//         ...ligne,
//         mensuel: consommationExerciceMensuel,
//         totalAnnuel: consommationExerciceTotal,
//       }
//     }


//     if (estValeurAjoutee(ligne)) {
//       return {
//         ...ligne,
//         mensuel: valeurAjouteeMensuel,
//         totalAnnuel: valeurAjouteeTotal,
//       }
//     }

//     if (estImpotsEttaxes(ligne)) {
//       return {
//         ...ligne,
//         mensuel: impotsettaxes.mensuel,
//         totalAnnuel: impotsettaxes.totalAnnuel,
//       }
//     }

//     return ligne
//   })

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

//               {mois.map(nomMois => (
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

//             {lignes.map((ligne, index) => {

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

type FraisExport = {
  pays?: string | null
  representant?: string | null
  nom_mois?: string | null
  mois?: string | number | null
  transport_local?: number | string | null
  transit?: number | string | null
  manutention?: number | string | null
  fret?: number | string | null
  assurance?: number | string | null
  frais_bancaires?: number | string | null
  total?: number | string | null
}

type CompteResultatTableProps = {
  data: CompteResultatLigne[]
  charges: Charge[]
  fraisExport?: FraisExport[]
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

function normaliserTexte(valeur: unknown): string {
  return String(valeur ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase()
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
}

function indiceMois(valeur: unknown): number {
  const normalise = normaliserTexte(valeur)

  const numero = Number(normalise)

  if (
    normalise !== "" &&
    Number.isInteger(numero) &&
    numero >= 1 &&
    numero <= 12
  ) {
    return numero - 1
  }

  return mois.findIndex(
    m => normaliserTexte(m) === normalise
  )
}

function montantNumerique(valeur: unknown): number {
  if (
    valeur === null ||
    valeur === undefined ||
    valeur === ""
  ) {
    return 0
  }

  const nombre = Number(valeur)

  return Number.isFinite(nombre) ? nombre : 0
}

function estRubrique(
  ligne: CompteResultatLigne,
  codes: string[],
  rubriques: string[]
): boolean {
  const code = normaliserTexte(ligne.code)
  const rubrique = normaliserTexte(ligne.rubrique)

  return (
    codes.some(c => normaliserTexte(c) === code) ||
    rubriques.some(r => normaliserTexte(r) === rubrique)
  )
}

function estAchatsConsommes(
  ligne: CompteResultatLigne
): boolean {
  return estRubrique(
    ligne,
    ["ACHATS CONSOMMES", "ACHAT CONSOMME"],
    ["ACHATS CONSOMMES", "ACHAT CONSOMME"]
  )
}

function estServicesExterieurs(
  ligne: CompteResultatLigne
): boolean {
  return estRubrique(
    ligne,
    [
      "SERVICES EXTERIEURS",
      "SERVICE EXTERIEUR",
      "SERVICES EXTERNES",
    ],
    [
      "SERVICES EXTERIEURS",
      "SERVICE EXTERIEUR",
      "SERVICES EXTERNES",
    ]
  )
}

function estImpotsEtTaxes(
  ligne: CompteResultatLigne
): boolean {
  return estRubrique(
    ligne,
    ["IMPOTS ET TAXES", "IMPOT ET TAXE"],
    ["IMPOTS ET TAXES", "IMPOT ET TAXE"]
  )
}

function estConsommationExercice(
  ligne: CompteResultatLigne
): boolean {
  return estRubrique(
    ligne,
    ["II"],
    [
      "II. CONSOMMATION DE L EXERCICE",
      "CONSOMMATION DE L EXERCICE",
    ]
  )
}

function estValeurAjoutee(
  ligne: CompteResultatLigne
): boolean {
  return estRubrique(
    ligne,
    ["III"],
    [
      "III. VALEUR AJOUTEE",
      "VALEUR AJOUTEE",
    ]
  )
}

function estProductionExercice(
  ligne: CompteResultatLigne
): boolean {
  return estRubrique(
    ligne,
    ["I"],
    [
      "I. PRODUCTION DE L EXERCICE",
      "PRODUCTION DE L EXERCICE",
    ]
  )
}

// ====================================================
// CALCUL DES CHARGES PAR CATÉGORIE
// ====================================================

function calculerChargesCategories(
  charges: Charge[],
  categories: string[]
) {
  const mensuel = Array(12).fill(0) as number[]

  const categoriesNormalisees = new Set(
    categories.map(normaliserTexte)
  )

  for (const charge of charges) {
    const categorie = normaliserTexte(
      charge.categorie
    )

    if (!categoriesNormalisees.has(categorie)) {
      continue
    }

    const index = indiceMois(charge.nom_mois)

    if (index < 0) continue

    mensuel[index] += montantNumerique(
      charge.montant
    )
  }

  return {
    mensuel,
    totalAnnuel: mensuel.reduce(
      (somme, montant) => somme + montant,
      0
    ),
  }
}

// ====================================================
// CALCUL DES FRAIS EXPORT
// Structure réelle : nom_mois, total
// ====================================================

function calculerFraisExport(
  fraisExport: FraisExport[]
) {
  const mensuel = Array(12).fill(0) as number[]

  for (const frais of fraisExport) {
    const index = indiceMois(
      frais.nom_mois ?? frais.mois
    )

    if (index < 0) continue

    // Le champ total regroupe déjà les six types
    // de frais : ne pas additionner ces types
    // une seconde fois.
    const montant = montantNumerique(
      frais.total
    )

    mensuel[index] += montant
  }

  return {
    mensuel,
    totalAnnuel: mensuel.reduce(
      (somme, montant) => somme + montant,
      0
    ),
  }
}

// ====================================================
// COMPOSANT PRINCIPAL
// ====================================================

export default function CompteResultatTable({
  data,
  charges,
  fraisExport = [],
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

  const donneesCharges = Array.isArray(charges)
    ? charges
    : []

  const donneesFraisExport = Array.isArray(fraisExport)
    ? fraisExport
    : []

  // ==================================================
  // ACHATS CONSOMMÉS
  // ==================================================

  const achatsProduits = calculerChargesCategories(
    donneesCharges,
    ["ACHAT PRODUITS"]
  )

  // ==================================================
  // SERVICES EXTÉRIEURS
  // Administration + Finance + Logistique
  // + Frais Export
  // ==================================================

  const servicesCharges = calculerChargesCategories(
    donneesCharges,
    [
      "ADMINISTRATION",
      "FINANCE",
      "LOGISTIQUE",
    ]
  )

  const fraisExportCalcules = calculerFraisExport(
    donneesFraisExport
  )

  const servicesExterieursMensuel = mois.map(
    (_, index) =>
      servicesCharges.mensuel[index] +
      fraisExportCalcules.mensuel[index]
  )

  const servicesExterieursTotal =
    servicesExterieursMensuel.reduce(
      (somme, montant) => somme + montant,
      0
    )

  // ==================================================
  // IMPÔTS ET TAXES
  // ==================================================

  const impotsEtTaxes = calculerChargesCategories(
    donneesCharges,
    ["FISCAL"]
  )

  // ==================================================
  // CONSOMMATION DE L'EXERCICE
  // Achats consommés + Services extérieurs
  // ==================================================

  const consommationExerciceMensuel = mois.map(
    (_, index) =>
      achatsProduits.mensuel[index] +
      servicesExterieursMensuel[index]
  )

  const consommationExerciceTotal =
    consommationExerciceMensuel.reduce(
      (somme, montant) => somme + montant,
      0
    )

  // ==================================================
  // VALEUR AJOUTÉE
  // Production - Consommation
  // ==================================================

  const ligneProduction = data.find(
    estProductionExercice
  )

  const valeurAjouteeMensuel = mois.map(
    (_, index) => {
      const production = montantNumerique(
        ligneProduction?.mensuel?.[index]
      )

      return (
        production -
        consommationExerciceMensuel[index]
      )
    }
  )

  const valeurAjouteeTotal =
    valeurAjouteeMensuel.reduce(
      (somme, montant) => somme + montant,
      0
    )

  // ==================================================
  // REMPLACEMENT DES RUBRIQUES CALCULÉES
  // ==================================================

  const lignes = data.map(ligne => {

    if (estAchatsConsommes(ligne)) {
      return {
        ...ligne,
        mensuel: achatsProduits.mensuel,
        totalAnnuel: achatsProduits.totalAnnuel,
      }
    }

    if (estServicesExterieurs(ligne)) {
      return {
        ...ligne,
        mensuel: servicesExterieursMensuel,
        totalAnnuel: servicesExterieursTotal,
      }
    }

    if (estImpotsEtTaxes(ligne)) {
      return {
        ...ligne,
        mensuel: impotsEtTaxes.mensuel,
        totalAnnuel: impotsEtTaxes.totalAnnuel,
      }
    }

    if (estConsommationExercice(ligne)) {
      return {
        ...ligne,
        mensuel: consommationExerciceMensuel,
        totalAnnuel: consommationExerciceTotal,
      }
    }

    if (estValeurAjoutee(ligne)) {
      return {
        ...ligne,
        mensuel: valeurAjouteeMensuel,
        totalAnnuel: valeurAjouteeTotal,
      }
    }

    return ligne
  })

  // ==================================================
  // AFFICHAGE
  // ==================================================

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

// ====================================================
// FORMATAGE
// ====================================================

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
