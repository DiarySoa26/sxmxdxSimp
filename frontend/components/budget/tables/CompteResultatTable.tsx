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

// type FraisExport = {
//   pays?: string | null
//   representant?: string | null
//   nom_mois?: string | null
//   mois?: string | number | null
//   transport_local?: number | string | null
//   transit?: number | string | null
//   manutention?: number | string | null
//   fret?: number | string | null
//   assurance?: number | string | null
//   frais_bancaires?: number | string | null
//   total?: number | string | null
// }

// type CompteResultatTableProps = {
//   data: CompteResultatLigne[]
//   charges: Charge[]
//   fraisExport?: FraisExport[]
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

// function normaliserTexte(valeur: unknown): string {
//   return String(valeur ?? "")
//     .normalize("NFD")
//     .replace(/[\u0300-\u036f]/g, "")
//     .trim()
//     .toUpperCase()
//     .replace(/[_-]/g, " ")
//     .replace(/\s+/g, " ")
// }

// function indiceMois(valeur: unknown): number {
//   const normalise = normaliserTexte(valeur)

//   const numero = Number(normalise)

//   if (
//     normalise !== "" &&
//     Number.isInteger(numero) &&
//     numero >= 1 &&
//     numero <= 12
//   ) {
//     return numero - 1
//   }

//   return mois.findIndex(
//     m => normaliserTexte(m) === normalise
//   )
// }

// function montantNumerique(valeur: unknown): number {
//   if (
//     valeur === null ||
//     valeur === undefined ||
//     valeur === ""
//   ) {
//     return 0
//   }

//   const nombre = Number(valeur)

//   return Number.isFinite(nombre) ? nombre : 0
// }

// function estRubrique(
//   ligne: CompteResultatLigne,
//   codes: string[],
//   rubriques: string[]
// ): boolean {
//   const code = normaliserTexte(ligne.code)
//   const rubrique = normaliserTexte(ligne.rubrique)

//   return (
//     codes.some(c => normaliserTexte(c) === code) ||
//     rubriques.some(r => normaliserTexte(r) === rubrique)
//   )
// }

// function estAchatsConsommes(
//   ligne: CompteResultatLigne
// ): boolean {
//   return estRubrique(
//     ligne,
//     ["ACHATS CONSOMMES", "ACHAT CONSOMME"],
//     ["ACHATS CONSOMMES", "ACHAT CONSOMME"]
//   )
// }

// function estServicesExterieurs(
//   ligne: CompteResultatLigne
// ): boolean {
//   return estRubrique(
//     ligne,
//     [
//       "SERVICES EXTERIEURS",
//       "SERVICE EXTERIEUR",
//       "SERVICES EXTERNES",
//     ],
//     [
//       "SERVICES EXTERIEURS",
//       "SERVICE EXTERIEUR",
//       "SERVICES EXTERNES",
//     ]
//   )
// }

// function estImpotsEtTaxes(
//   ligne: CompteResultatLigne
// ): boolean {
//   return estRubrique(
//     ligne,
//     ["IMPOTS ET TAXES", "IMPOT ET TAXE"],
//     ["IMPOTS ET TAXES", "IMPOT ET TAXE"]
//   )
// }

// function estConsommationExercice(
//   ligne: CompteResultatLigne
// ): boolean {
//   return estRubrique(
//     ligne,
//     ["II"],
//     [
//       "II. CONSOMMATION DE L EXERCICE",
//       "CONSOMMATION DE L EXERCICE",
//     ]
//   )
// }

// function estValeurAjoutee(
//   ligne: CompteResultatLigne
// ): boolean {
//   return estRubrique(
//     ligne,
//     ["III"],
//     [
//       "III. VALEUR AJOUTEE",
//       "VALEUR AJOUTEE",
//     ]
//   )
// }

// function estProductionExercice(
//   ligne: CompteResultatLigne
// ): boolean {
//   return estRubrique(
//     ligne,
//     ["I"],
//     [
//       "I. PRODUCTION DE L EXERCICE",
//       "PRODUCTION DE L EXERCICE",
//     ]
//   )
// }

// // ====================================================
// // CALCUL DES CHARGES PAR CATÉGORIE
// // ====================================================

// function calculerChargesCategories(
//   charges: Charge[],
//   categories: string[]
// ) {
//   const mensuel = Array(12).fill(0) as number[]

//   const categoriesNormalisees = new Set(
//     categories.map(normaliserTexte)
//   )

//   for (const charge of charges) {
//     const categorie = normaliserTexte(
//       charge.categorie
//     )

//     if (!categoriesNormalisees.has(categorie)) {
//       continue
//     }

//     const index = indiceMois(charge.nom_mois)

//     if (index < 0) continue

//     mensuel[index] += montantNumerique(
//       charge.montant
//     )
//   }

//   return {
//     mensuel,
//     totalAnnuel: mensuel.reduce(
//       (somme, montant) => somme + montant,
//       0
//     ),
//   }
// }

// // ====================================================
// // CALCUL DES FRAIS EXPORT
// // Structure réelle : nom_mois, total
// // ====================================================

// function calculerFraisExport(
//   fraisExport: FraisExport[]
// ) {
//   const mensuel = Array(12).fill(0) as number[]

//   for (const frais of fraisExport) {
//     const index = indiceMois(
//       frais.nom_mois ?? frais.mois
//     )

//     if (index < 0) continue

//     // Le champ total regroupe déjà les six types
//     // de frais : ne pas additionner ces types
//     // une seconde fois.
//     const montant = montantNumerique(
//       frais.total
//     )

//     mensuel[index] += montant
//   }

//   return {
//     mensuel,
//     totalAnnuel: mensuel.reduce(
//       (somme, montant) => somme + montant,
//       0
//     ),
//   }
// }

// // ====================================================
// // COMPOSANT PRINCIPAL
// // ====================================================

// export default function CompteResultatTable({
//   data,
//   charges,
//   fraisExport = [],
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

//   const donneesFraisExport = Array.isArray(fraisExport)
//     ? fraisExport
//     : []

//   // ==================================================
//   // ACHATS CONSOMMÉS
//   // ==================================================

//   const achatsProduits = calculerChargesCategories(
//     donneesCharges,
//     ["ACHAT PRODUITS"]
//   )

//   // ==================================================
//   // SERVICES EXTÉRIEURS
//   // Administration + Finance + Logistique
//   // + Frais Export
//   // ==================================================

//   const servicesCharges = calculerChargesCategories(
//     donneesCharges,
//     [
//       "ADMINISTRATION",
//       "FINANCE",
//       "LOGISTIQUE",
//     ]
//   )

//   const fraisExportCalcules = calculerFraisExport(
//     donneesFraisExport
//   )

//   const servicesExterieursMensuel = mois.map(
//     (_, index) =>
//       servicesCharges.mensuel[index] +
//       fraisExportCalcules.mensuel[index]
//   )

//   const servicesExterieursTotal =
//     servicesExterieursMensuel.reduce(
//       (somme, montant) => somme + montant,
//       0
//     )

//   // ==================================================
//   // IMPÔTS ET TAXES
//   // ==================================================

//   const impotsEtTaxes = calculerChargesCategories(
//     donneesCharges,
//     ["FISCAL"]
//   )

//   // ==================================================
//   // CONSOMMATION DE L'EXERCICE
//   // Achats consommés + Services extérieurs
//   // ==================================================

//   const consommationExerciceMensuel = mois.map(
//     (_, index) =>
//       achatsProduits.mensuel[index] +
//       servicesExterieursMensuel[index]
//   )

//   const consommationExerciceTotal =
//     consommationExerciceMensuel.reduce(
//       (somme, montant) => somme + montant,
//       0
//     )

//   // ==================================================
//   // VALEUR AJOUTÉE
//   // Production - Consommation
//   // ==================================================

//   const ligneProduction = data.find(
//     estProductionExercice
//   )

//   const valeurAjouteeMensuel = mois.map(
//     (_, index) => {
//       const production = montantNumerique(
//         ligneProduction?.mensuel?.[index]
//       )

//       return (
//         production -
//         consommationExerciceMensuel[index]
//       )
//     }
//   )

//   const valeurAjouteeTotal =
//     valeurAjouteeMensuel.reduce(
//       (somme, montant) => somme + montant,
//       0
//     )

//   // ==================================================
//   // REMPLACEMENT DES RUBRIQUES CALCULÉES
//   // ==================================================

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
//         mensuel: servicesExterieursMensuel,
//         totalAnnuel: servicesExterieursTotal,
//       }
//     }

//     if (estImpotsEtTaxes(ligne)) {
//       return {
//         ...ligne,
//         mensuel: impotsEtTaxes.mensuel,
//         totalAnnuel: impotsEtTaxes.totalAnnuel,
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

//     return ligne
//   })

//   // ==================================================
//   // AFFICHAGE
//   // ==================================================

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

// // ====================================================
// // FORMATAGE
// // ====================================================

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








// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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
//   nom_mois?: string | null
//   montant?: number | string | null
// }

// type FraisExport = {
//   nom_mois?: string | null
//   mois?: string | number | null
//   total?: number | string | null
// }

// type Props = {
//   data: CompteResultatLigne[]
//   charges: Charge[]
//   fraisExport?: FraisExport[]
// }

// const mois = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]

// const nombre = (v: unknown) => v === null || v === undefined || v === "" ? 0 : Number.isFinite(Number(v)) ? Number(v) : 0
// const normaliser = (v: unknown) => String(v ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[_'’.-]/g, " ").replace(/\s+/g, " ").trim()
// const liste = <T,>(v: T[] | null | undefined): T[] => Array.isArray(v) ? v : []
// const addition = (a: number[], b: number[]) => a.map((v, i) => v + b[i])
// const soustraction = (a: number[], b: number[]) => a.map((v, i) => v - b[i])
// const totalAnnuel = (a: number[]) => a.reduce((s, v) => s + v, 0)

// function indiceMois(v: unknown) {
//   const texte = normaliser(v)
//   const numero = Number(texte)
//   if (texte && Number.isInteger(numero) && numero >= 1 && numero <= 12) return numero - 1
//   return mois.findIndex(m => normaliser(m) === texte)
// }

// function correspond(ligne: CompteResultatLigne, codes: string[], rubriques: string[]) {
//   const code = normaliser(ligne.code)
//   const rubrique = normaliser(ligne.rubrique)
//   return codes.some(c => normaliser(c) === code) || rubriques.some(r => normaliser(r) === rubrique)
// }

// function chercher(data: CompteResultatLigne[], codes: string[], rubriques: string[]) {
//   return data.find(l => correspond(l, codes, rubriques))
// }

// function montantsLigne(ligne?: CompteResultatLigne) {
//   return Array.from({ length: 12 }, (_, i) => nombre(ligne?.mensuel?.[i]))
// }

// function calculerCharges(charges: Charge[], categories: string[]) {
//   const mensuel = Array(12).fill(0) as number[]
//   const noms = new Set(categories.map(normaliser))

//   for (const charge of charges) {
//     if (!noms.has(normaliser(charge.categorie))) continue
//     const index = indiceMois(charge.nom_mois)
//     if (index >= 0) mensuel[index] += nombre(charge.montant)
//   }

//   return mensuel
// }

// function calculerFraisExport(fraisExport: FraisExport[]) {
//   const mensuel = Array(12).fill(0) as number[]

//   for (const frais of fraisExport) {
//     const index = indiceMois(frais.nom_mois ?? frais.mois)
//     if (index >= 0) mensuel[index] += nombre(frais.total)
//   }

//   return mensuel
// }

// function formatMontant(v: number | string | null | undefined) {
//   if (v === null || v === undefined || v === "") return "-"
//   return `${nombre(v).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} MGA`
// }

// function formatPourcentage(v: number | string | null | undefined) {
//   if (v === null || v === undefined || v === "") return "-"
//   return `${nombre(v).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %`
// }

// export default function CompteResultatTable({ data, charges, fraisExport = [] }: Props) {
//   if (!Array.isArray(data) || data.length === 0) {
//     return (
//       <div className="flex min-h-[150px] items-center justify-center rounded-md border border-dashed">
//         <p className="text-sm text-muted-foreground">Aucun compte de résultat disponible.</p>
//       </div>
//     )
//   }

//   const donneesCharges = liste(charges)
//   const donneesFraisExport = liste(fraisExport)

//   // ACHATS CONSOMMÉS
//   const achats = calculerCharges(donneesCharges, ["ACHAT PRODUITS"])

//   // SERVICES EXTÉRIEURS = ADMINISTRATION + FINANCE + LOGISTIQUE + FRAIS EXPORT
//   const servicesCharges = calculerCharges(donneesCharges, ["ADMINISTRATION", "FINANCE", "LOGISTIQUE"])
//   const services = addition(servicesCharges, calculerFraisExport(donneesFraisExport))

//   // IMPÔTS ET TAXES
//   const impots = calculerCharges(donneesCharges, ["FISCAL"])

//   // CONSOMMATION DE L'EXERCICE
//   const consommation = addition(achats, services)

//   // PRODUCTION DE L'EXERCICE
//   const production = montantsLigne(
//     chercher(data, ["I"], ["I PRODUCTION DE L EXERCICE", "PRODUCTION DE L EXERCICE"])
//   )

//   // VALEUR AJOUTÉE = PRODUCTION - CONSOMMATION
//   const valeurAjoutee = soustraction(production, consommation)

//   // SUBVENTIONS D'EXPLOITATION
//   const subventions = montantsLigne(
//     chercher(data, ["SUBVENTIONS_EXPLOITATION", "SUBVENTIONS"],
//       ["SUBVENTIONS D EXPLOITATION", "SUBVENTION D EXPLOITATION"])
//   )

//   // CHARGES DE PERSONNEL
//   const personnel = montantsLigne(
//     chercher(data, ["CHARGES_PERSONNEL", "MASSE_SALARIALE"],
//       ["CHARGES DE PERSONNEL", "CHARGES DU PERSONNEL", "MASSE SALARIALE"])
//   )

//   // EXCÉDENT BRUT D'EXPLOITATION
//   const ebe = soustraction(
//     soustraction(addition(valeurAjoutee, subventions), impots),
//     personnel
//   )

//   // PRODUITS OPÉRATIONNELS
//   const produitsOperationnels = montantsLigne(
//     chercher(data, ["PRODUITS_OPERATIONNELS", "AUTRES_PRODUITS_OPERATIONNELS"],
//       ["PRODUITS OPERATIONNELS", "AUTRES PRODUITS OPERATIONNELS"])
//   )

//   // CHARGES OPÉRATIONNELLES
//   const chargesOperationnelles = montantsLigne(
//     chercher(data, ["CHARGES_OPERATIONNELLES", "AUTRES_CHARGES_OPERATIONNELLES"],
//       ["CHARGES OPERATIONNELLES", "AUTRES CHARGES OPERATIONNELLES"])
//   )

//   // DOTATIONS AUX AMORTISSEMENTS
//   const amortissements = montantsLigne(
//     chercher(data, ["DOTATIONS_AMORTISSEMENTS", "AMORTISSEMENTS"],
//       ["DOTATIONS AUX AMORTISSEMENTS", "DOTATIONS AUX AMORTISSEMENTS ET PROVISIONS"])
//   )

//   // REPRISES SUR PROVISIONS
//   const reprises = montantsLigne(
//     chercher(data, ["REPRISES_PROVISIONS", "REPRISES_SUR_PROVISIONS"],
//       ["REPRISES SUR PROVISIONS", "REPRISES SUR PERTES DE VALEUR ET PROVISIONS"])
//   )

//   // RÉSULTAT OPÉRATIONNEL
//   const resultatOperationnel = addition(
//     soustraction(
//       soustraction(
//         addition(ebe, produitsOperationnels),
//         chargesOperationnelles
//       ),
//       amortissements
//     ),
//     reprises
//   )

//   // PRODUITS FINANCIERS
//   const produitsFinanciers = montantsLigne(
//     chercher(data, ["PRODUITS_FINANCIERS", "PRODUIT_FINANCIER"],
//       ["PRODUITS FINANCIERS", "PRODUIT FINANCIER"])
//   )

//   // CHARGES FINANCIÈRES : CATÉGORIE FINANCIERE
//   const chargesFinancieres = calculerCharges(donneesCharges, ["FINANCIERE"])

//   // RÉSULTAT FINANCIER
//   const resultatFinancier = soustraction(produitsFinanciers, chargesFinancieres)

//   // RÉSULTAT AVANT IMPÔT
//   const resultatAvantImpot = addition(resultatOperationnel, resultatFinancier)

//   // IMPÔT EXIGIBLE SUR LE RÉSULTAT
//   const impotExigible = montantsLigne(
//     chercher(data, ["IMPOT_EXIGIBLE", "IMPOT_EXIGIBLE_RESULTAT"],
//       ["IMPOT EXIGIBLE SUR LE RESULTAT", "IMPOT EXIGIBLE"])
//   )

//   // IMPÔTS DIFFÉRÉS
//   const impotsDifferes = montantsLigne(
//     chercher(data, ["IMPOTS_DIFFERES", "IMPOT_DIFFERE"],
//       ["IMPOTS DIFFERES", "IMPOT DIFFERE"])
//   )

//   // RÉSULTAT NET ORDINAIRE
//   const resultatNetOrdinaire = soustraction(
//     soustraction(resultatAvantImpot, impotExigible),
//     impotsDifferes
//   )

//   // RÉSULTAT NET DE L'EXERCICE = RÉSULTAT NET ORDINAIRE
//   const resultatNetExercice = [...resultatNetOrdinaire]

//   // CHIFFRE D'AFFAIRES
//   const chiffreAffaires = montantsLigne(
//     chercher(data, ["CA_EXPORT", "CHIFFRE_AFFAIRES", "VENTES"],
//       ["CHIFFRE D AFFAIRES", "CHIFFRE D AFFAIRES EXPORT", "VENTES"])
//   )

//   // MARGE NETTE MENSUELLE
//   const margeNette = resultatNetExercice.map((resultat, index) => {
//     const ca = chiffreAffaires[index]
//     return ca !== 0 ? (resultat / ca) * 100 : 0
//   })

//   // MARGE NETTE ANNUELLE
//   const caAnnuel = totalAnnuel(chiffreAffaires)
//   const margeNetteAnnuelle = caAnnuel !== 0
//     ? (totalAnnuel(resultatNetExercice) / caAnnuel) * 100
//     : 0

//   // REMPLACEMENT DES VALEURS CALCULÉES
//   const lignes = data.map(ligne => {
//     let mensuel: number[] | null = null

//     if (correspond(ligne, ["ACHATS_CONSOMMES"], ["ACHATS CONSOMMES", "ACHAT CONSOMME"])) mensuel = achats
//     else if (correspond(ligne, ["SERVICES_EXTERIEURS"], ["SERVICES EXTERIEURS", "SERVICE EXTERIEUR", "SERVICES EXTERNES"])) mensuel = services
//     else if (correspond(ligne, ["IMPOTS_TAXES"], ["IMPOTS ET TAXES", "IMPOT ET TAXE"])) mensuel = impots
//     else if (correspond(ligne, ["II"], ["II CONSOMMATION DE L EXERCICE", "CONSOMMATION DE L EXERCICE"])) mensuel = consommation
//     else if (correspond(ligne, ["III"], ["III VALEUR AJOUTEE", "VALEUR AJOUTEE"])) mensuel = valeurAjoutee
//     else if (correspond(ligne, ["IV", "EBE"], ["IV EXCEDENT BRUT D EXPLOITATION", "EXCEDENT BRUT D EXPLOITATION", "EXCEDENT BRUT D EXPLOITATION EBE"])) mensuel = ebe
//     else if (correspond(ligne, ["V", "RESULTAT_OPERATIONNEL"], ["V RESULTAT OPERATIONNEL", "RESULTAT OPERATIONNEL"])) mensuel = resultatOperationnel
//     else if (correspond(ligne, ["CHARGES_FINANCIERES"], ["CHARGES FINANCIERES", "CHARGES FINANCIERE"])) mensuel = chargesFinancieres
//     else if (correspond(ligne, ["VI", "RESULTAT_FINANCIER"], ["VI RESULTAT FINANCIER", "RESULTAT FINANCIER"])) mensuel = resultatFinancier
//     else if (correspond(ligne, ["VII", "RESULTAT_AVANT_IMPOT", "RESULTAT_AVANT_IMPOTS"], ["VII RESULTAT AVANT IMPOT", "RESULTAT AVANT IMPOT", "RESULTAT AVANT IMPOTS"])) mensuel = resultatAvantImpot
//     else if (correspond(ligne, ["VIII", "RESULTAT_NET_ORDINAIRE"], ["VIII RESULTAT NET ORDINAIRE", "RESULTAT NET ORDINAIRE"])) mensuel = resultatNetOrdinaire
//     else if (correspond(ligne, ["RESULTAT_NET_EXERCICE", "RESULTAT_NET_DE_L_EXERCICE"], ["RESULTAT NET DE L EXERCICE", "RESULTAT NET EXERCICE"])) mensuel = resultatNetExercice
//     else if (correspond(ligne, ["MARGE_NETTE", "MARGE_NET"], ["MARGE NETTE", "TAUX DE MARGE NETTE"])) {
//       return { ...ligne, mensuel: margeNette, totalAnnuel: margeNetteAnnuelle, format: "pourcentage" }
//     }

//     return mensuel ? { ...ligne, mensuel, totalAnnuel: totalAnnuel(mensuel) } : ligne
//   })

//   return (
//     <div className="w-full space-y-4">
//       <div>
//         <h3 className="text-lg font-semibold">Compte de résultat</h3>
//         <p className="text-sm text-muted-foreground">Résultats mensuels et annuels de l'exercice</p>
//       </div>

//       <div className="w-full overflow-x-auto rounded-md border">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead className="min-w-[340px]">Rubrique</TableHead>
//               {mois.map(m => <TableHead key={m} className="min-w-[150px] text-right">{m}</TableHead>)}
//               <TableHead className="min-w-[180px] text-right">Total annuel</TableHead>
//             </TableRow>
//           </TableHeader>

//           <TableBody>
//             {lignes.map((ligne, index) => {
//               const estSousTotal = ligne.type === "sous-total"
//               const estFinal = ligne.type === "resultat-final"
//               const estPourcentage = ligne.format === "pourcentage"
//               const style = estFinal
//                 ? "bg-emerald-700 text-white hover:bg-emerald-700"
//                 : estSousTotal
//                   ? "bg-muted/70 font-semibold hover:bg-muted/70"
//                   : ""

//               return (
//                 <TableRow key={`${ligne.code}-${index}`} className={style}>
//                   <TableCell className={estSousTotal || estFinal ? "font-bold" : "font-medium"}>{ligne.rubrique}</TableCell>
//                   {mois.map((_, i) => (
//                     <TableCell key={i} className="text-right tabular-nums">
//                       {estPourcentage
//                         ? formatPourcentage(ligne.mensuel?.[i])
//                         : formatMontant(ligne.mensuel?.[i])}
//                     </TableCell>
//                   ))}
//                   <TableCell className="text-right font-semibold tabular-nums">
//                     {estPourcentage
//                       ? formatPourcentage(ligne.totalAnnuel)
//                       : formatMontant(ligne.totalAnnuel)}
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
  nom_mois?: string | null
  montant?: number | string | null
}

type FraisExport = {
  nom_mois?: string | null
  mois?: string | number | null
  total?: number | string | null
}

type Props = {
  data: CompteResultatLigne[]
  charges: Charge[]
  fraisExport?: FraisExport[]
}

const mois = [
  "Janvier", "Février", "Mars", "Avril",
  "Mai", "Juin", "Juillet", "Août",
  "Septembre", "Octobre", "Novembre", "Décembre",
]

const nombre = (v: unknown): number => {
  if (v === null || v === undefined || v === "") return 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const normaliser = (v: unknown): string =>
  String(v ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[_'’.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()

const liste = <T,>(v: T[] | null | undefined): T[] =>
  Array.isArray(v) ? v : []

const addition = (a: number[], b: number[]): number[] =>
  a.map((v, i) => v + b[i])

const soustraction = (a: number[], b: number[]): number[] =>
  a.map((v, i) => v - b[i])

const totalAnnuel = (a: number[]): number =>
  a.reduce((s, v) => s + v, 0)

// =====================================================
// IDENTIFICATION DES MOIS
// =====================================================

function indiceMois(v: unknown): number {
  const texte = normaliser(v)
  const numero = Number(texte)

  if (
    texte &&
    Number.isInteger(numero) &&
    numero >= 1 &&
    numero <= 12
  ) {
    return numero - 1
  }

  return mois.findIndex(m => normaliser(m) === texte)
}

// =====================================================
// IDENTIFICATION DES RUBRIQUES
// =====================================================

function correspond(
  ligne: CompteResultatLigne,
  codes: string[],
  rubriques: string[]
): boolean {
  const code = normaliser(ligne.code)
  const rubrique = normaliser(ligne.rubrique)

  return (
    codes.some(c => normaliser(c) === code) ||
    rubriques.some(r => normaliser(r) === rubrique)
  )
}

function chercher(
  data: CompteResultatLigne[],
  codes: string[],
  rubriques: string[]
): CompteResultatLigne | undefined {
  return data.find(ligne =>
    correspond(ligne, codes, rubriques)
  )
}

function montantsLigne(
  ligne?: CompteResultatLigne
): number[] {
  return Array.from(
    { length: 12 },
    (_, i) => nombre(ligne?.mensuel?.[i])
  )
}

// =====================================================
// CALCUL DES CHARGES
// =====================================================

function calculerCharges(
  charges: Charge[],
  categories: string[]
): number[] {
  const mensuel = Array(12).fill(0) as number[]
  const noms = new Set(categories.map(normaliser))

  for (const charge of charges) {
    if (!noms.has(normaliser(charge.categorie))) continue

    const index = indiceMois(charge.nom_mois)

    if (index >= 0) {
      mensuel[index] += nombre(charge.montant)
    }
  }

  return mensuel
}

// =====================================================
// CALCUL DES FRAIS EXPORT
// =====================================================

function calculerFraisExport(
  fraisExport: FraisExport[]
): number[] {
  const mensuel = Array(12).fill(0) as number[]

  for (const frais of fraisExport) {
    const index = indiceMois(
      frais.nom_mois ?? frais.mois
    )

    if (index >= 0) {
      mensuel[index] += nombre(frais.total)
    }
  }

  return mensuel
}

// =====================================================
// FORMATAGE
// =====================================================

function formatMontant(
  v: number | string | null | undefined
): string {
  if (v === null || v === undefined || v === "") {
    return "-"
  }

  return `${nombre(v).toLocaleString("fr-FR", {
    maximumFractionDigits: 2,
  })} MGA`
}

function formatPourcentage(
  v: number | string | null | undefined
): string {
  if (v === null || v === undefined || v === "") {
    return "-"
  }

  return `${nombre(v).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} %`
}

// =====================================================
// COMPOSANT PRINCIPAL
// =====================================================

export default function CompteResultatTable({
  data,
  charges,
  fraisExport = [],
}: Props) {

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex min-h-[150px] items-center justify-center rounded-md border border-dashed">
        <p className="text-sm text-muted-foreground">
          Aucun compte de résultat disponible.
        </p>
      </div>
    )
  }

  const donneesCharges = liste(charges)
  const donneesFraisExport = liste(fraisExport)

  // =====================================================
  // ACHATS CONSOMMÉS
  // =====================================================

  const achats = calculerCharges(
    donneesCharges,
    ["ACHAT PRODUITS"]
  )

  // =====================================================
  // SERVICES EXTÉRIEURS
  // Administration + Finance + Logistique + Frais export
  // =====================================================

  const servicesCharges = calculerCharges(
    donneesCharges,
    ["ADMINISTRATION", "FINANCE", "LOGISTIQUE"]
  )

  const services = addition(
    servicesCharges,
    calculerFraisExport(donneesFraisExport)
  )

  // =====================================================
  // IMPÔTS ET TAXES
  // =====================================================

  const impots = calculerCharges(
    donneesCharges,
    ["FISCAL"]
  )

  // =====================================================
  // CONSOMMATION DE L'EXERCICE
  // =====================================================

  const consommation = addition(
    achats,
    services
  )

  // =====================================================
  // PRODUCTION DE L'EXERCICE
  // =====================================================

  const production = montantsLigne(
    chercher(
      data,
      ["I"],
      [
        "I PRODUCTION DE L EXERCICE",
        "PRODUCTION DE L EXERCICE",
      ]
    )
  )

  // =====================================================
  // VALEUR AJOUTÉE
  // =====================================================

  const valeurAjoutee = soustraction(
    production,
    consommation
  )

  // =====================================================
  // SUBVENTIONS D'EXPLOITATION
  // =====================================================

  const subventions = montantsLigne(
    chercher(
      data,
      ["SUBVENTIONS_EXPLOITATION", "SUBVENTIONS"],
      [
        "SUBVENTIONS D EXPLOITATION",
        "SUBVENTION D EXPLOITATION",
      ]
    )
  )

  // =====================================================
  // CHARGES DE PERSONNEL
  // =====================================================

  const personnel = montantsLigne(
    chercher(
      data,
      ["CHARGES_PERSONNEL", "MASSE_SALARIALE"],
      [
        "CHARGES DE PERSONNEL",
        "CHARGES DU PERSONNEL",
        "MASSE SALARIALE",
      ]
    )
  )

  // =====================================================
  // EXCÉDENT BRUT D'EXPLOITATION
  // =====================================================

  const ebe = soustraction(
    soustraction(
      addition(valeurAjoutee, subventions),
      impots
    ),
    personnel
  )

  // =====================================================
  // PRODUITS OPÉRATIONNELS
  // =====================================================

  const produitsOperationnels = montantsLigne(
    chercher(
      data,
      [
        "PRODUITS_OPERATIONNELS",
        "AUTRES_PRODUITS_OPERATIONNELS",
      ],
      [
        "PRODUITS OPERATIONNELS",
        "AUTRES PRODUITS OPERATIONNELS",
      ]
    )
  )

  // =====================================================
  // CHARGES OPÉRATIONNELLES
  // =====================================================

  const chargesOperationnelles = montantsLigne(
    chercher(
      data,
      [
        "CHARGES_OPERATIONNELLES",
        "AUTRES_CHARGES_OPERATIONNELLES",
      ],
      [
        "CHARGES OPERATIONNELLES",
        "AUTRES CHARGES OPERATIONNELLES",
      ]
    )
  )

  // =====================================================
  // DOTATIONS AUX AMORTISSEMENTS
  // =====================================================

  const amortissements = montantsLigne(
    chercher(
      data,
      ["DOTATIONS_AMORTISSEMENTS", "AMORTISSEMENTS"],
      [
        "DOTATIONS AUX AMORTISSEMENTS",
        "DOTATIONS AUX AMORTISSEMENTS ET PROVISIONS",
      ]
    )
  )

  // =====================================================
  // REPRISES SUR PROVISIONS
  // =====================================================

  const reprises = montantsLigne(
    chercher(
      data,
      [
        "REPRISES_PROVISIONS",
        "REPRISES_SUR_PROVISIONS",
      ],
      [
        "REPRISES SUR PROVISIONS",
        "REPRISES SUR PERTES DE VALEUR ET PROVISIONS",
      ]
    )
  )

  // =====================================================
  // RÉSULTAT OPÉRATIONNEL
  // =====================================================

  const resultatOperationnel = addition(
    soustraction(
      soustraction(
        addition(ebe, produitsOperationnels),
        chargesOperationnelles
      ),
      amortissements
    ),
    reprises
  )

  // =====================================================
  // PRODUITS FINANCIERS
  // =====================================================

  const produitsFinanciers = montantsLigne(
    chercher(
      data,
      [
        "PRODUITS_FINANCIERS",
        "PRODUIT_FINANCIER",
      ],
      [
        "PRODUITS FINANCIERS",
        "PRODUIT FINANCIER",
      ]
    )
  )

  // =====================================================
  // CHARGES FINANCIÈRES
  // =====================================================

  const chargesFinancieres = calculerCharges(
    donneesCharges,
    ["FINANCIERE"]
  )

  // =====================================================
  // RÉSULTAT FINANCIER
  // =====================================================

  const resultatFinancier = soustraction(
    produitsFinanciers,
    chargesFinancieres
  )

  // =====================================================
  // RÉSULTAT AVANT IMPÔT
  // =====================================================

  const resultatAvantImpot = addition(
    resultatOperationnel,
    resultatFinancier
  )

  // =====================================================
  // IMPÔT EXIGIBLE SUR LE RÉSULTAT
  // =====================================================

  const impotExigible = montantsLigne(
    chercher(
      data,
      [
        "IMPOT_EXIGIBLE",
        "IMPOT_EXIGIBLE_RESULTAT",
      ],
      [
        "IMPOT EXIGIBLE SUR LE RESULTAT",
        "IMPOT EXIGIBLE",
      ]
    )
  )

  // =====================================================
  // IMPÔTS DIFFÉRÉS
  // =====================================================

  const impotsDifferes = montantsLigne(
    chercher(
      data,
      [
        "IMPOTS_DIFFERES",
        "IMPOT_DIFFERE",
      ],
      [
        "IMPOTS DIFFERES",
        "IMPOT DIFFERE",
      ]
    )
  )

  // =====================================================
  // VIII. RÉSULTAT NET ORDINAIRE
  // =====================================================

  const resultatNetOrdinaire = soustraction(
    soustraction(
      resultatAvantImpot,
      impotExigible
    ),
    impotsDifferes
  )

  // =====================================================
  // X. RÉSULTAT NET DE L'EXERCICE
  // STRICTEMENT IDENTIQUE AU RÉSULTAT NET ORDINAIRE
  // =====================================================

  const resultatNetExercice = [...resultatNetOrdinaire]

  // =====================================================
  // CHIFFRE D'AFFAIRES
  // =====================================================

  const chiffreAffaires = montantsLigne(
    chercher(
      data,
      [
        "CA_EXPORT",
        "CHIFFRE_AFFAIRES",
        "VENTES",
      ],
      [
        "CHIFFRE D AFFAIRES",
        "CHIFFRE D AFFAIRES EXPORT",
        "VENTES",
      ]
    )
  )

  // =====================================================
  // MARGE NETTE MENSUELLE
  // =====================================================

  const margeNette = resultatNetExercice.map(
    (resultat, index) => {
      const ca = chiffreAffaires[index]

      return ca !== 0
        ? (resultat / ca) * 100
        : 0
    }
  )

  // =====================================================
  // MARGE NETTE ANNUELLE
  // =====================================================

  const caAnnuel = totalAnnuel(chiffreAffaires)

  const margeNetteAnnuelle = caAnnuel !== 0
    ? (totalAnnuel(resultatNetExercice) / caAnnuel) * 100
    : 0

  // =====================================================
  // REMPLACEMENT DES VALEURS CALCULÉES
  // =====================================================

  const lignes = data.map(ligne => {
    let mensuel: number[] | null = null

    if (correspond(
      ligne,
      ["ACHATS_CONSOMMES"],
      ["ACHATS CONSOMMES", "ACHAT CONSOMME"]
    )) {
      mensuel = achats
    }

    else if (correspond(
      ligne,
      ["SERVICES_EXTERIEURS"],
      [
        "SERVICES EXTERIEURS",
        "SERVICE EXTERIEUR",
        "SERVICES EXTERNES",
      ]
    )) {
      mensuel = services
    }

    else if (correspond(
      ligne,
      ["IMPOTS_TAXES"],
      ["IMPOTS ET TAXES", "IMPOT ET TAXE"]
    )) {
      mensuel = impots
    }

    else if (correspond(
      ligne,
      ["II"],
      [
        "II CONSOMMATION DE L EXERCICE",
        "CONSOMMATION DE L EXERCICE",
      ]
    )) {
      mensuel = consommation
    }

    else if (correspond(
      ligne,
      ["III"],
      [
        "III VALEUR AJOUTEE",
        "VALEUR AJOUTEE",
      ]
    )) {
      mensuel = valeurAjoutee
    }

    else if (correspond(
      ligne,
      ["IV", "EBE"],
      [
        "IV EXCEDENT BRUT D EXPLOITATION",
        "EXCEDENT BRUT D EXPLOITATION",
        "EXCEDENT BRUT D EXPLOITATION EBE",
      ]
    )) {
      mensuel = ebe
    }

    else if (correspond(
      ligne,
      ["V", "RESULTAT_OPERATIONNEL"],
      [
        "V RESULTAT OPERATIONNEL",
        "RESULTAT OPERATIONNEL",
      ]
    )) {
      mensuel = resultatOperationnel
    }

    else if (correspond(
      ligne,
      ["CHARGES_FINANCIERES"],
      [
        "CHARGES FINANCIERES",
        "CHARGES FINANCIERE",
      ]
    )) {
      mensuel = chargesFinancieres
    }

    else if (correspond(
      ligne,
      ["VI", "RESULTAT_FINANCIER"],
      [
        "VI RESULTAT FINANCIER",
        "RESULTAT FINANCIER",
      ]
    )) {
      mensuel = resultatFinancier
    }

    else if (correspond(
      ligne,
      [
        "VII",
        "RESULTAT_AVANT_IMPOT",
        "RESULTAT_AVANT_IMPOTS",
      ],
      [
        "VII RESULTAT AVANT IMPOT",
        "VII RESULTAT AVANT IMPOTS",
        "RESULTAT AVANT IMPOT",
        "RESULTAT AVANT IMPOTS",
      ]
    )) {
      mensuel = resultatAvantImpot
    }

    // =================================================
    // VIII. RÉSULTAT NET ORDINAIRE
    // =================================================

    else if (correspond(
      ligne,
      [
        "VIII",
        "RESULTAT_NET_ORDINAIRE",
      ],
      [
        "VIII RESULTAT NET ORDINAIRE",
        "RESULTAT NET ORDINAIRE",
      ]
    )) {
      mensuel = resultatNetOrdinaire
    }

    // =================================================
    // X. RÉSULTAT NET DE L'EXERCICE
    // CORRECTION : RECONNAISSANCE DU PRÉFIXE X.
    // =================================================

    else if (correspond(
      ligne,
      [
        "X",
        "RESULTAT_NET_EXERCICE",
        "RESULTAT_NET_DE_L_EXERCICE",
        "RESULTAT_NET_DE_EXERCICE",
      ],
      [
        "X RESULTAT NET DE L EXERCICE",
        "RESULTAT NET DE L EXERCICE",
        "RESULTAT NET EXERCICE",
      ]
    )) {
      // Reprend exactement le résultat net ordinaire
      mensuel = resultatNetOrdinaire
    }

    // =================================================
    // MARGE NETTE
    // =================================================

    else if (correspond(
      ligne,
      [
        "MARGE_NETTE",
        "MARGE_NET",
      ],
      [
        "MARGE NETTE",
        "TAUX DE MARGE NETTE",
      ]
    )) {
      return {
        ...ligne,
        mensuel: margeNette,
        totalAnnuel: margeNetteAnnuelle,
        format: "pourcentage",
      }
    }

    // =================================================
    // TOTAL ANNUEL DES RUBRIQUES RECALCULÉES
    // =================================================

    return mensuel
      ? {
          ...ligne,
          mensuel: [...mensuel],
          totalAnnuel: totalAnnuel(mensuel),
        }
      : ligne
  })

  // =====================================================
  // AFFICHAGE DU TABLEAU
  // =====================================================

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

              {mois.map(m => (
                <TableHead
                  key={m}
                  className="min-w-[150px] text-right"
                >
                  {m}
                </TableHead>
              ))}

              <TableHead className="min-w-[180px] text-right">
                Total annuel
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {lignes.map((ligne, index) => {
              const estSousTotal = ligne.type === "sous-total"
              const estFinal = ligne.type === "resultat-final"
              const estPourcentage = ligne.format === "pourcentage"

              const style = estFinal
                ? "bg-emerald-700 text-white hover:bg-emerald-700"
                : estSousTotal
                  ? "bg-muted/70 font-semibold hover:bg-muted/70"
                  : ""

              return (
                <TableRow
                  key={`${ligne.code}-${index}`}
                  className={style}
                >
                  <TableCell
                    className={
                      estSousTotal || estFinal
                        ? "font-bold"
                        : "font-medium"
                    }
                  >
                    {ligne.rubrique}
                  </TableCell>

                  {mois.map((_, i) => (
                    <TableCell
                      key={i}
                      className="text-right tabular-nums"
                    >
                      {estPourcentage
                        ? formatPourcentage(ligne.mensuel?.[i])
                        : formatMontant(ligne.mensuel?.[i])}
                    </TableCell>
                  ))}

                  <TableCell className="text-right font-semibold tabular-nums">
                    {estPourcentage
                      ? formatPourcentage(ligne.totalAnnuel)
                      : formatMontant(ligne.totalAnnuel)}
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
