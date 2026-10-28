// "use client"

// import { useEffect, useState } from "react"

// import {
//   ArrowLeftRight,
//   Loader2,
//   TrendingUp,
//   TrendingDown,
//   Minus,
// } from "lucide-react"

// import {
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   CartesianGrid,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Legend,
// } from "recharts"

// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
// } from "@/components/ui/card"

// import { Button } from "@/components/ui/button"

// import {
//   getBudgetsProspectifs,
//   getPrevisionsProspectives,
//   comparerProspective,
// } from "@/services/comparaison-prospective-service"

// import {
//   getBudgetDetails,
//   getExercices,
// } from "@/services/budget-details-service"

// // ======================================================
// // TYPES
// // ======================================================

// type Indicateur = {
//   code: string
//   libelle: string
//   unite: string
//   valeur1: number | string | null
//   valeur2: number | string | null
//   ecart: number | string | null
//   evolutionPourcentage: number | string | null
// }

// type Comparaison = {
//   anneeBudget: number
//   anneePrevision: number
//   indicateurs: Indicateur[]
//   interpretations: string[]
//   budgetId: number
//   previsionId: number
// }

// type Exercice = {
//   id?: number
//   id_exercice?: number
//   annee?: number
//   annee_exercice?: number
// }

// type Amortissement = {
//   montant?: number | string | null
// }

// // ======================================================
// // FORMATAGE
// // ======================================================

// const nombre = (value: unknown): number => {
//   if (value == null || value === "") return 0

//   const n = Number(value)

//   return Number.isFinite(n) ? n : 0
// }

// const number = (value: unknown, digits = 0) =>
//   new Intl.NumberFormat("fr-FR", {
//     maximumFractionDigits: digits,
//   }).format(nombre(value))

// const evolution = (i: Indicateur) =>
//   i.evolutionPourcentage == null
//     ? "Non calculable"
//     : `${nombre(i.evolutionPourcentage) > 0 ? "+" : ""}${number(
//         i.evolutionPourcentage,
//         2
//       )} %`

// const valeur = (
//   n: number | string | null,
//   point: boolean
// ) =>
//   n == null
//     ? "—"
//     : `${number(
//         nombre(n) * (point ? 100 : 1),
//         point ? 2 : 0
//       )}${point ? " %" : ""}`

// // ======================================================
// // AMORTISSEMENTS
// // ======================================================

// function trouverExerciceId(
//   exercices: Exercice[],
//   annee: number | string
// ) {
//   const exercice = exercices.find(
//     (e) =>
//       String(e.annee_exercice ?? e.annee) ===
//       String(annee)
//   )

//   return exercice?.id_exercice ?? exercice?.id ?? null
// }

// function totalAmortissements(
//   lignes: Amortissement[]
// ): number {
//   return lignes.reduce(
//     (total, ligne) => total + nombre(ligne.montant),
//     0
//   )
// }

// function creerIndicateurAmortissements(
//   budget: number,
//   prevision: number | null
// ): Indicateur {
//   const ecart =
//     prevision == null ? null : prevision - budget

//   return {
//     code: "AMORTISSEMENTS",
//     libelle: "Dotations aux amortissements",
//     unite: "MGA",
//     valeur1: budget,
//     valeur2: prevision,
//     ecart,
//     evolutionPourcentage:
//       ecart == null || budget === 0
//         ? null
//         : (ecart / Math.abs(budget)) * 100,
//   }
// }

// // ======================================================
// // COMPOSANT
// // ======================================================

// export default function ComparaisonProspective() {
//   const [budgets, setBudgets] = useState<string[]>([])
//   const [previsions, setPrevisions] = useState<string[]>([])
//   const [exercices, setExercices] = useState<Exercice[]>([])

//   const [anneeBudget, setAnneeBudget] = useState("")
//   const [anneePrevision, setAnneePrevision] = useState("")

//   const [resultat, setResultat] =
//     useState<Comparaison | null>(null)

//   const [loading, setLoading] = useState(false)
//   const [initialisation, setInitialisation] =
//     useState(true)

//   const [error, setError] = useState("")

//   // ======================================================
//   // CHARGEMENT DES EXERCICES
//   // ======================================================

//   useEffect(() => {
//     let actif = true

//     async function charger() {
//       try {
//         setInitialisation(true)
//         setError("")

//         const [b, p, e] = await Promise.all([
//           getBudgetsProspectifs(),
//           getPrevisionsProspectives(),
//           getExercices(),
//         ])

//         if (!actif) return

//         const bs = (Array.isArray(b) ? b : [])
//           .map(String)
//           .sort((a, b) => Number(a) - Number(b))

//         const ps = (Array.isArray(p) ? p : [])
//           .map(String)
//           .sort((a, b) => Number(a) - Number(b))

//         setBudgets(bs)
//         setPrevisions(ps)
//         setExercices(Array.isArray(e) ? e : [])

//         const paire = [...bs]
//           .reverse()
//           .flatMap((budget) =>
//             ps
//               .filter(
//                 (prevision) =>
//                   Number(prevision) > Number(budget)
//               )
//               .map((prevision) => ({
//                 budget,
//                 prevision,
//               }))
//           )[0]

//         setAnneeBudget(
//           paire?.budget ?? bs.at(-1) ?? ""
//         )

//         setAnneePrevision(
//           paire?.prevision ?? ps[0] ?? ""
//         )
//       } catch (err) {
//         if (!actif) return

//         setError(
//           err instanceof Error
//             ? err.message
//             : "Erreur de chargement"
//         )
//       } finally {
//         if (actif) setInitialisation(false)
//       }
//     }

//     void charger()

//     return () => {
//       actif = false
//     }
//   }, [])

//   // ======================================================
//   // COMPARAISON PROSPECTIVE
//   // ======================================================

//   async function comparer() {
//     if (
//       loading ||
//       !anneeBudget ||
//       !anneePrevision ||
//       Number(anneePrevision) <= Number(anneeBudget)
//     ) {
//       return
//     }

//     setLoading(true)
//     setError("")
//     setResultat(null)

//     try {
//       // 1. Comparaison générée par Spring Boot
//       const data: Comparaison =
//         await comparerProspective(
//           Number(anneeBudget),
//           Number(anneePrevision)
//         )

//       if (!data) {
//         throw new Error(
//           "Aucun résultat de comparaison disponible."
//         )
//       }

//       const indicateurs = [
//         ...(Array.isArray(data.indicateurs)
//           ? data.indicateurs
//           : []),
//       ]

//       // 2. Chercher les amortissements éventuellement
//       // déjà fournis par le backend de comparaison.
//       const indexAmortissements =
//         indicateurs.findIndex(
//           (i) => i.code === "AMORTISSEMENTS"
//         )

//       if (indexAmortissements < 0) {
//         // 3. Récupérer uniquement les amortissements
//         // du budget de référence.
//         const exerciceId = trouverExerciceId(
//           exercices,
//           anneeBudget
//         )

//         if (exerciceId != null) {
//           const lignes: Amortissement[] =
//             await getBudgetDetails(
//               "amortissements",
//               exerciceId
//             )

//           const amortissements = Array.isArray(lignes)
//             ? lignes
//             : []

//           if (amortissements.length > 0) {
//             const total =
//               totalAmortissements(amortissements)

//             const indicateur =
//               creerIndicateurAmortissements(
//                 total,
//                 null
//               )

//             const indexResultat =
//               indicateurs.findIndex(
//                 (i) => i.code === "RESULTAT"
//               )

//             if (indexResultat >= 0) {
//               indicateurs.splice(
//                 indexResultat,
//                 0,
//                 indicateur
//               )
//             } else {
//               indicateurs.push(indicateur)
//             }
//           }
//         }
//       }

//       setResultat({
//         ...data,
//         indicateurs,
//       })
//     } catch (err) {
//       console.error(
//         "Erreur comparaison prospective :",
//         err
//       )

//       setError(
//         err instanceof Error
//           ? err.message
//           : "Comparaison impossible"
//       )
//     } finally {
//       setLoading(false)
//     }
//   }

//   // ======================================================
//   // INDICATEURS
//   // ======================================================

//   const indicateurs = resultat?.indicateurs ?? []

//   const amortissements = indicateurs.find(
//     (i) => i.code === "AMORTISSEMENTS"
//   )

//   const graphique = indicateurs
//     .filter((i) => i.unite === "MGA")
//     .map((i) => ({
//       nom:
//         (
//           {
//             CA_EXPORT: "CA export",
//             CHARGES: "Charges",
//             FRAIS_EXPORT: "Frais export",
//             MASSE_SALARIALE: "Salaires",
//             AMORTISSEMENTS: "Amortissements",
//             RESULTAT: "Résultat",
//           } as Record<string, string>
//         )[i.code] || i.libelle,

//       budget:
//         i.valeur1 == null
//           ? null
//           : nombre(i.valeur1) / 1e9,

//       prevision:
//         i.valeur2 == null
//           ? null
//           : nombre(i.valeur2) / 1e9,
//     }))

//   const principaux = [
//     {
//       label: "Résultat opérationnel",
//       item: indicateurs.find(
//         (i) => i.code === "RESULTAT"
//       ),
//     },
//     {
//       label: "Marge opérationnelle",
//       item: indicateurs.find(
//         (i) => i.code === "MARGE"
//       ),
//     },
//     ...(amortissements
//       ? [{
//           label: "Amortissements",
//           item: amortissements,
//         }]
//       : []),
//   ]

//   // ======================================================
//   // INTERFACE
//   // ======================================================

//   return (
//     <div className="space-y-5">

//       {/* SELECTION */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-lg">
//             Sélection des exercices
//           </CardTitle>

//           <CardDescription>
//             Choisissez un budget généré et une prévision
//             budgétaire d&apos;une année ultérieure.
//           </CardDescription>
//         </CardHeader>

//         <CardContent className="space-y-3">
//           <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
//             {[
//               {
//                 label: "Budget de référence",
//                 value: anneeBudget,
//                 setter: setAnneeBudget,
//                 options: budgets,
//               },
//               {
//                 label: "Année prévisionnelle",
//                 value: anneePrevision,
//                 setter: setAnneePrevision,
//                 options: previsions,
//               },
//             ].map((field) => (
//               <label
//                 key={field.label}
//                 className="space-y-2 text-sm font-medium"
//               >
//                 {field.label}

//                 <select
//                   value={field.value}
//                   onChange={(e) => {
//                     field.setter(e.target.value)
//                     setResultat(null)
//                   }}
//                   className="block h-10 w-full rounded-md border bg-background px-3 font-normal"
//                   disabled={initialisation || loading}
//                 >
//                   <option value="">
//                     Choisir une année
//                   </option>

//                   {field.options.map((a) => (
//                     <option key={a} value={a}>
//                       {a}
//                     </option>
//                   ))}
//                 </select>
//               </label>
//             ))}

//             <Button
//               onClick={comparer}
//               disabled={
//                 loading ||
//                 initialisation ||
//                 !anneeBudget ||
//                 !anneePrevision ||
//                 Number(anneePrevision) <= Number(anneeBudget)
//               }
//             >
//               {loading ? (
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//               ) : (
//                 <ArrowLeftRight className="mr-2 h-4 w-4" />
//               )}

//               Comparer
//             </Button>
//           </div>

//           {!initialisation &&
//             (!budgets.length || !previsions.length) &&
//             !error && (
//               <p className="text-sm text-muted-foreground">
//                 Un budget généré et une prévision
//                 sont nécessaires.
//               </p>
//             )}

//           {anneeBudget &&
//             anneePrevision &&
//             Number(anneePrevision) <= Number(anneeBudget) && (
//               <p className="text-sm text-amber-700">
//                 La prévision doit porter sur une année
//                 ultérieure à celle du budget.
//               </p>
//             )}

//           {error && (
//             <p
//               role="alert"
//               className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
//             >
//               {error}
//             </p>
//           )}
//         </CardContent>
//       </Card>

//       {/* RESULTATS */}
//       {resultat && (
//         <>

//           {/* CARTES */}
//           <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
//             {principaux.map(({ label, item }) => {
//               if (!item) return null

//               return (
//                 <Card key={label}>
//                   <CardContent className="p-5">
//                     <p className="text-sm text-muted-foreground">
//                       {label} — évolution
//                     </p>

//                     <div className="mt-2 flex items-center gap-2 text-2xl font-semibold">
//                       {item.evolutionPourcentage == null ? (
//                         <Minus className="h-5 w-5" />
//                       ) : nombre(item.evolutionPourcentage) > 0 ? (
//                         <TrendingUp className="h-5 w-5 text-emerald-600" />
//                       ) : nombre(item.evolutionPourcentage) < 0 ? (
//                         <TrendingDown className="h-5 w-5 text-rose-600" />
//                       ) : (
//                         <Minus className="h-5 w-5" />
//                       )}

//                       {evolution(item)}
//                     </div>

//                     {item.code === "AMORTISSEMENTS" &&
//                       item.valeur2 == null && (
//                         <p className="mt-2 text-xs text-muted-foreground">
//                           Amortissements prévisionnels non disponibles.
//                         </p>
//                       )}
//                   </CardContent>
//                 </Card>
//               )
//             })}
//           </div>

//           {/* TABLEAU COMPARATIF */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-lg">
//                 Tableau comparatif
//               </CardTitle>

//               <CardDescription>
//                 Budget {resultat.anneeBudget} et prévision{" "}
//                 {resultat.anneePrevision} — montants en MGA.
//               </CardDescription>
//             </CardHeader>

//             <CardContent>
//               <div className="overflow-x-auto">
//                 <table className="w-full text-sm">
//                   <thead>
//                     <tr className="border-b bg-muted/40 text-left">
//                       <th className="p-3">
//                         Indicateur
//                       </th>

//                       <th className="p-3 text-right">
//                         Budget {resultat.anneeBudget}
//                       </th>

//                       <th className="p-3 text-right">
//                         Prévision {resultat.anneePrevision}
//                       </th>

//                       <th className="p-3 text-right">
//                         Écart
//                       </th>

//                       <th className="p-3 text-right">
//                         Évolution
//                       </th>
//                     </tr>
//                   </thead>

//                   <tbody>
//                     {indicateurs.map((i) => {
//                       const point = i.unite === "POINT"

//                       return (
//                         <tr
//                           key={i.code}
//                           className={
//                             i.code === "AMORTISSEMENTS"
//                               ? "border-b bg-amber-50/50 hover:bg-amber-50 dark:bg-amber-950/10"
//                               : "border-b hover:bg-muted/30"
//                           }
//                         >
//                           <td className="p-3 font-medium">
//                             {i.libelle}
//                           </td>

//                           <td className="whitespace-nowrap p-3 text-right">
//                             {valeur(i.valeur1, point)}
//                           </td>

//                           <td className="whitespace-nowrap p-3 text-right">
//                             {valeur(i.valeur2, point)}
//                           </td>

//                           <td className="whitespace-nowrap p-3 text-right">
//                             {valeur(i.ecart, point)}
//                           </td>

//                           <td className="whitespace-nowrap p-3 text-right">
//                             {evolution(i)}
//                           </td>
//                         </tr>
//                       )
//                     })}
//                   </tbody>
//                 </table>
//               </div>

//               <p className="mt-3 text-xs text-muted-foreground">
//                 Une augmentation des charges n&apos;est pas
//                 nécessairement favorable. Les marges sont
//                 comparées en points de pourcentage.
//                 Une valeur prévisionnelle absente n&apos;est
//                 pas considérée comme égale à zéro.
//               </p>
//             </CardContent>
//           </Card>

//           {/* GRAPHIQUE */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-lg">
//                 Visualisation annuelle
//               </CardTitle>

//               <CardDescription>
//                 Montants en milliards MGA
//               </CardDescription>
//             </CardHeader>

//             <CardContent>
//               <div className="h-[360px] w-full">
//                 <ResponsiveContainer
//                   width="100%"
//                   height="100%"
//                 >
//                   <BarChart
//                     data={graphique}
//                     margin={{
//                       bottom: 55,
//                       left: 8,
//                       right: 10,
//                     }}
//                   >
//                     <CartesianGrid
//                       strokeDasharray="3 3"
//                       vertical={false}
//                     />

//                     <XAxis
//                       dataKey="nom"
//                       angle={-25}
//                       textAnchor="end"
//                       interval={0}
//                       height={75}
//                       fontSize={11}
//                     />

//                     <YAxis fontSize={11} />

//                     <Tooltip
//                       formatter={(v) =>
//                         v == null
//                           ? "Non disponible"
//                           : `${number(v, 2)} Md MGA`
//                       }
//                     />

//                     <Legend />

//                     <Bar
//                       dataKey="budget"
//                       name={`Budget ${resultat.anneeBudget}`}
//                       fill="#94a3b8"
//                       radius={[4, 4, 0, 0]}
//                     />

//                     <Bar
//                       dataKey="prevision"
//                       name={`Prévision ${resultat.anneePrevision}`}
//                       fill="#7c9fcd"
//                       radius={[4, 4, 0, 0]}
//                     />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>
//             </CardContent>
//           </Card>

//           {/* INTERPRETATIONS */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-lg">
//                 Interprétation automatique
//               </CardTitle>
//             </CardHeader>

//             <CardContent className="space-y-2">
//               {(resultat.interpretations ?? []).map(
//                 (texte, index) => (
//                   <p
//                     key={index}
//                     className="rounded-md bg-muted/40 p-3 text-sm"
//                   >
//                     {texte}
//                   </p>
//                 )
//               )}

//               {amortissements && (
//                 <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/20 dark:text-amber-200">
//                   Les dotations aux amortissements
//                   du budget de référence s&apos;élèvent à{" "}
//                   <strong>
//                     {number(amortissements.valeur1)} MGA
//                   </strong>.
//                   {" "}
//                   {amortissements.valeur2 == null
//                     ? "Aucune prévision d'amortissement n'est disponible pour calculer l'écart."
//                     : `Les dotations prévisionnelles s'élèvent à ${number(
//                         amortissements.valeur2
//                       )} MGA, soit une évolution de ${evolution(
//                         amortissements
//                       )}.`}
//                 </p>
//               )}
//             </CardContent>
//           </Card>
//         </>
//       )}
//     </div>
//   )
// }





"use client"

import { useEffect, useState } from "react"

import {
  ArrowLeftRight,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react"

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"

import {
  getBudgetsProspectifs,
  getPrevisionsProspectives,
  comparerProspective,
} from "@/services/comparaison-prospective-service"

import {
  getBudgetDetails,
  getExercices,
} from "@/services/budget-details-service"

import {
  getAmortissementsPrevisionnels,
  getChargesCategoriesPrevisionnelles,
} from "@/services/prediction-details-service"

// =====================================================
// TYPES
// =====================================================

type Indicateur = {
  code: string
  libelle: string
  unite: string
  valeur1: number | string | null
  valeur2: number | string | null
  ecart: number | string | null
  evolutionPourcentage: number | string | null
}

type Comparaison = {
  anneeBudget: number
  anneePrevision: number
  indicateurs: Indicateur[]
  interpretations: string[]
  budgetId: number
  previsionId: number
  autresCategories?: string[]
  avertissements?: string[]
}

type Exercice = {
  id?: number
  id_exercice?: number
  annee?: number
  annee_exercice?: number
}

type Charge = {
  categorie?: string | null
  montant?: number | string | null
}

type FraisExport = {
  total?: number | string | null
}

type Amortissement = {
  montant?: number | string | null
}

type ChargesPrevisionnelles = {
  total_annuel?: number | string | null
  details?: {
    mois_id: number
    categorie: string
    montant_prevu: number | string | null
  }[]
}

type AmortissementsPrevisionnels = {
  total_annuel?: number | string | null
  mensuel?: {
    mois_id: number
    mois: string
    montant: number | string | null
  }[]
}

type GroupeCharge = {
  code: string
  libelle: string
  categories: string[]
}

// =====================================================
// RUBRIQUES COMPTABLES
// =====================================================

const GROUPES_CHARGES: GroupeCharge[] = [
  {
    code: "ACHATS_CONSOMMES",
    libelle: "Achats consommés",
    categories: ["ACHAT PRODUITS"],
  },
  {
    code: "SERVICES_EXTERIEURS",
    libelle: "Services extérieurs",
    categories: [
      "ADMINISTRATION",
      "FINANCE",
      "LOGISTIQUE",
    ],
  },
  {
    code: "IMPOTS_TAXES",
    libelle: "Impôts et taxes",
    categories: ["FISCAL"],
  },
]

const CATEGORIES_FRAIS_EXPORT = [
  "FRAIS EXPORT",
  "FRAIS EXPORTATION",
  "FRAIS D EXPORTATION",
]

const CODES_DETAILS = new Set([
  "ACHATS_CONSOMMES",
  "SERVICES_EXTERIEURS",
  "IMPOTS_TAXES",
  "AUTRES_CHARGES",
])

// =====================================================
// UTILITAIRES
// =====================================================

const nombre = (value: unknown): number => {
  if (value === null || value === undefined || value === "") {
    return 0
  }

  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

const normaliser = (value: unknown): string =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[_'’.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()

const liste = <T,>(value: T[] | null | undefined): T[] =>
  Array.isArray(value) ? value : []

const number = (value: unknown, digits = 0): string =>
  new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: digits,
  }).format(nombre(value))

const evolution = (i: Indicateur): string =>
  i.evolutionPourcentage == null
    ? "Non calculable"
    : `${nombre(i.evolutionPourcentage) > 0 ? "+" : ""}${number(
        i.evolutionPourcentage,
        2
      )} %`

const valeur = (
  n: number | string | null,
  point: boolean
): string =>
  n == null
    ? "—"
    : `${number(
        nombre(n) * (point ? 100 : 1),
        point ? 2 : 0
      )}${point ? " %" : ""}`

function somme<T>(
  lignes: T[],
  montant: (ligne: T) => unknown
): number {
  return liste(lignes).reduce(
    (total, ligne) => total + nombre(montant(ligne)),
    0
  )
}

function creerIndicateur(
  code: string,
  libelle: string,
  budget: number | null,
  prevision: number | null
): Indicateur {
  const ecart =
    budget == null || prevision == null
      ? null
      : prevision - budget

  return {
    code,
    libelle,
    unite: "MGA",
    valeur1: budget,
    valeur2: prevision,
    ecart,
    evolutionPourcentage:
      ecart == null || budget == null || budget === 0
        ? null
        : (ecart / Math.abs(budget)) * 100,
  }
}

function trouverExerciceId(
  exercices: Exercice[],
  annee: number | string
): number | null {
  const exercice = exercices.find(
    e =>
      String(e.annee_exercice ?? e.annee) === String(annee)
  )

  return exercice?.id_exercice ?? exercice?.id ?? null
}

function estFraisExport(i: Indicateur): boolean {
  const codes = CATEGORIES_FRAIS_EXPORT.map(normaliser)

  return (
    codes.includes(normaliser(i.code)) ||
    codes.includes(normaliser(i.libelle)) ||
    normaliser(i.code) === "FRAIS EXPORT"
  )
}

// =====================================================
// IDENTIFICATION DES AUTRES CATÉGORIES
// =====================================================

function trouverAutresCategories(
  chargesBudget: Charge[],
  chargesPrevision: ChargesPrevisionnelles | null
): string[] {
  const categoriesConnues = new Set(
    GROUPES_CHARGES.flatMap(g =>
      g.categories.map(normaliser)
    )
  )

  const frais = new Set(
    CATEGORIES_FRAIS_EXPORT.map(normaliser)
  )

  const disponibles = new Set([
    ...liste(chargesBudget).map(c =>
      normaliser(c.categorie)
    ),
    ...liste(chargesPrevision?.details).map(c =>
      normaliser(c.categorie)
    ),
  ])

  return [...disponibles].filter(
    categorie =>
      categorie &&
      !categoriesConnues.has(categorie) &&
      !frais.has(categorie)
  )
}

// =====================================================
// REGROUPEMENT DES CHARGES
// =====================================================

function sommeCategorieBudget(
  charges: Charge[],
  categories: string[]
): number {
  const ensemble = new Set(
    categories.map(normaliser)
  )

  return liste(charges).reduce(
    (total, charge) =>
      ensemble.has(normaliser(charge.categorie))
        ? total + nombre(charge.montant)
        : total,
    0
  )
}

function sommeCategoriePrevision(
  data: ChargesPrevisionnelles,
  categories: string[]
): number {
  const ensemble = new Set(
    categories.map(normaliser)
  )

  return liste(data.details).reduce(
    (total, charge) =>
      ensemble.has(normaliser(charge.categorie))
        ? total + nombre(charge.montant_prevu)
        : total,
    0
  )
}

function calculerDetailsBudget(
  charges: Charge[],
  frais: FraisExport[],
  autresCategories: string[]
) {
  const details = GROUPES_CHARGES.map(g => ({
    code: g.code,
    libelle: g.libelle,
    montant:
      sommeCategorieBudget(charges, g.categories) +
      (
        g.code === "SERVICES_EXTERIEURS"
          ? somme(frais, f => f.total)
          : 0
      ),
  }))

  return [
    ...details,
    {
      code: "AUTRES_CHARGES",
      libelle: "Autres charges",
      montant: sommeCategorieBudget(
        charges,
        autresCategories
      ),
    },
  ]
}

function calculerDetailsPrevision(
  data: ChargesPrevisionnelles,
  autresCategories: string[],
  fraisExportPrevision: number | null
) {
  const details = GROUPES_CHARGES.map(g => ({
    code: g.code,
    libelle: g.libelle,
    montant:
      sommeCategoriePrevision(data, g.categories) +
      (
        g.code === "SERVICES_EXTERIEURS"
          ? nombre(fraisExportPrevision)
          : 0
      ),
  }))

  return [
    ...details,
    {
      code: "AUTRES_CHARGES",
      libelle: "Autres charges",
      montant: sommeCategoriePrevision(
        data,
        autresCategories
      ),
    },
  ]
}

// =====================================================
// AMORTISSEMENTS
// =====================================================

function totalAmortissementsBudget(
  lignes: Amortissement[]
): number {
  return somme(lignes, ligne => ligne.montant)
}

function totalAmortissementsPrevision(
  data: AmortissementsPrevisionnels
): number | null {
  if (
    data.total_annuel !== null &&
    data.total_annuel !== undefined
  ) {
    return nombre(data.total_annuel)
  }

  if (Array.isArray(data.mensuel)) {
    return somme(
      data.mensuel,
      ligne => ligne.montant
    )
  }

  return null
}

// =====================================================
// COMPOSANT GRAPHIQUE
// =====================================================

function Graphique({
  titre,
  description,
  data,
  anneeBudget,
  anneePrevision,
  hauteur = 380,
}: {
  titre: string
  description: string
  data: {
    nom: string
    budget: number | null
    prevision: number | null
  }[]
  anneeBudget: number
  anneePrevision: number
  hauteur?: number
}) {
  if (!data.length) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {titre}
        </CardTitle>

        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div
          className="w-full"
          style={{ height: hauteur }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 10,
                right: 20,
                left: 10,
                bottom: 65,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="nom"
                angle={-25}
                textAnchor="end"
                interval={0}
                height={90}
                fontSize={11}
              />

              <YAxis
                fontSize={11}
                tickFormatter={v => number(v, 1)}
              />

              <Tooltip
                formatter={(v, name) => [
                  v == null
                    ? "Non disponible"
                    : `${number(v, 3)} Md MGA`,
                  name,
                ]}
              />

              <Legend
                verticalAlign="top"
                height={36}
              />

              <Bar
                dataKey="budget"
                name={`Budget ${anneeBudget}`}
                fill="#94a3b8"
                radius={[4, 4, 0, 0]}
                maxBarSize={55}
              />

              <Bar
                dataKey="prevision"
                name={`Prévision ${anneePrevision}`}
                fill="#7c9fcd"
                radius={[4, 4, 0, 0]}
                maxBarSize={55}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

// =====================================================
// COMPOSANT PRINCIPAL
// =====================================================

export default function ComparaisonProspective() {
  const [budgets, setBudgets] = useState<string[]>([])
  const [previsions, setPrevisions] = useState<string[]>([])
  const [exercices, setExercices] = useState<Exercice[]>([])

  const [anneeBudget, setAnneeBudget] = useState("")
  const [anneePrevision, setAnneePrevision] = useState("")

  const [resultat, setResultat] =
    useState<Comparaison | null>(null)

  const [loading, setLoading] = useState(false)
  const [initialisation, setInitialisation] = useState(true)
  const [error, setError] = useState("")

  // ===================================================
  // CHARGEMENT DES EXERCICES
  // ===================================================

  useEffect(() => {
    let actif = true

    async function charger() {
      try {
        setInitialisation(true)
        setError("")

        const [b, p, e] = await Promise.all([
          getBudgetsProspectifs(),
          getPrevisionsProspectives(),
          getExercices(),
        ])

        if (!actif) return

        const bs = liste(b)
          .map(String)
          .sort((a, b) => Number(a) - Number(b))

        const ps = liste(p)
          .map(String)
          .sort((a, b) => Number(a) - Number(b))

        setBudgets(bs)
        setPrevisions(ps)
        setExercices(liste(e))

        const paire = [...bs]
          .reverse()
          .flatMap(budget =>
            ps
              .filter(
                prevision =>
                  Number(prevision) > Number(budget)
              )
              .map(prevision => ({
                budget,
                prevision,
              }))
          )[0]

        setAnneeBudget(
          paire?.budget ?? bs.at(-1) ?? ""
        )

        setAnneePrevision(
          paire?.prevision ?? ps[0] ?? ""
        )
      } catch (err) {
        if (!actif) return

        setError(
          err instanceof Error
            ? err.message
            : "Erreur de chargement"
        )
      } finally {
        if (actif) setInitialisation(false)
      }
    }

    void charger()

    return () => {
      actif = false
    }
  }, [])

  // ===================================================
  // COMPARAISON PROSPECTIVE
  // ===================================================

  async function comparer() {
    if (
      loading ||
      !anneeBudget ||
      !anneePrevision ||
      Number(anneePrevision) <= Number(anneeBudget)
    ) {
      return
    }

    setLoading(true)
    setError("")
    setResultat(null)

    try {
      // COMPARAISON DU BACKEND
      const data: Comparaison =
        await comparerProspective(
          Number(anneeBudget),
          Number(anneePrevision)
        )

      if (!data) {
        throw new Error(
          "Aucun résultat de comparaison disponible."
        )
      }

      const indicateurs = liste(data.indicateurs)
        .filter(
          i =>
            !estFraisExport(i) &&
            !CODES_DETAILS.has(i.code) &&
            i.code !== "AMORTISSEMENTS"
        )
        .map(i => ({ ...i }))

      const avertissements: string[] = []

      // =================================================
      // BUDGET DE RÉFÉRENCE
      // =================================================

      const exerciceId = trouverExerciceId(
        exercices,
        anneeBudget
      )

      if (exerciceId == null) {
        throw new Error(
          "Identifiant de l'exercice de référence introuvable."
        )
      }

      const [
        chargesBudget,
        fraisBudget,
        amortissementsBudget,
      ] = await Promise.all([
        getBudgetDetails("charges", exerciceId),
        getBudgetDetails("frais-export", exerciceId),
        getBudgetDetails("amortissements", exerciceId),
      ])

      // =================================================
      // DONNÉES PRÉVISIONNELLES
      // =================================================

      const [
        resultatChargesPrevision,
        resultatAmortissementsPrevision,
      ] = await Promise.allSettled([
        getChargesCategoriesPrevisionnelles(
          Number(anneePrevision)
        ),
        getAmortissementsPrevisionnels(
          Number(anneePrevision)
        ),
      ])

      const chargesPrevision: ChargesPrevisionnelles | null =
        resultatChargesPrevision.status === "fulfilled"
          ? resultatChargesPrevision.value
          : null

      const amortissementsPrevision: AmortissementsPrevisionnels | null =
        resultatAmortissementsPrevision.status === "fulfilled"
          ? resultatAmortissementsPrevision.value
          : null

      if (!chargesPrevision) {
        avertissements.push(
          "Les catégories de charges prévisionnelles ne sont pas disponibles."
        )
      }

      if (!amortissementsPrevision) {
        avertissements.push(
          "Les amortissements prévisionnels ne sont pas disponibles."
        )
      }

      // =================================================
      // FRAIS EXPORT PRÉVISIONNELS
      // RÉCUPÉRÉS DE LA COMPARAISON BACKEND
      // =================================================

      const fraisPrevisionBackend = liste(data.indicateurs)
        .find(i => estFraisExport(i))

      const fraisExportPrevision =
        fraisPrevisionBackend?.valeur2 == null
          ? null
          : nombre(fraisPrevisionBackend.valeur2)

      if (fraisExportPrevision == null) {
        avertissements.push(
          "Les frais export prévisionnels ne sont pas disponibles séparément. Le détail des services extérieurs peut être incomplet."
        )
      }

      // =================================================
      // IDENTIFICATION DES AUTRES CHARGES
      // =================================================

      const autresCategories = trouverAutresCategories(
        liste<Charge>(chargesBudget),
        chargesPrevision
      )

      // =================================================
      // REGROUPEMENT BUDGET
      // =================================================

      const detailsBudget = calculerDetailsBudget(
        liste<Charge>(chargesBudget),
        liste<FraisExport>(fraisBudget),
        autresCategories
      )

      // =================================================
      // REGROUPEMENT PRÉVISION
      // =================================================

      const detailsPrevision = chargesPrevision
        ? calculerDetailsPrevision(
            chargesPrevision,
            autresCategories,
            fraisExportPrevision
          )
        : []

      const chargesBudgetDisponibles =
        Array.isArray(chargesBudget) &&
        Array.isArray(fraisBudget)

      const chargesPrevisionDisponibles =
        chargesPrevision != null &&
        Array.isArray(chargesPrevision.details)

      // =================================================
      // INSERTION DES INDICATEURS
      // =================================================

      function inserer(
        indicateur: Indicateur,
        apres: string | null = null
      ) {
        const index = indicateurs.findIndex(
          i => i.code === indicateur.code
        )

        if (index >= 0) {
          indicateurs[index] = indicateur
          return
        }

        const position = apres
          ? indicateurs.findIndex(
              i => i.code === apres
            )
          : -1

        if (position >= 0) {
          indicateurs.splice(
            position + 1,
            0,
            indicateur
          )
        } else {
          indicateurs.push(indicateur)
        }
      }

      // =================================================
      // CHARGES D'EXPLOITATION
      // =================================================

      const totalBudget = chargesBudgetDisponibles
        ? detailsBudget.reduce(
            (s, d) => s + d.montant,
            0
          )
        : null

      const totalPrevision =
        chargesPrevisionDisponibles &&
        fraisExportPrevision != null
          ? detailsPrevision.reduce(
              (s, d) => s + d.montant,
              0
            )
          : null

      inserer(
        creerIndicateur(
          "CHARGES",
          "Charges d'exploitation",
          totalBudget,
          totalPrevision
        )
      )

      const indexCharges = indicateurs.findIndex(
        i => i.code === "CHARGES"
      )

      const detailsIndicateurs = detailsBudget.map(
        (detail, index) => {
          const estServices =
            detail.code === "SERVICES_EXTERIEURS"

          const montantPrevision =
            !chargesPrevisionDisponibles ||
            (estServices && fraisExportPrevision == null)
              ? null
              : detailsPrevision[index]?.montant ?? null

          return creerIndicateur(
            detail.code,
            detail.libelle,
            chargesBudgetDisponibles
              ? detail.montant
              : null,
            montantPrevision
          )
        }
      )

      indicateurs.splice(
        indexCharges + 1,
        0,
        ...detailsIndicateurs
      )

      // =================================================
      // AMORTISSEMENTS DU BUDGET
      // =================================================

      const amortBudget =
        Array.isArray(amortissementsBudget)
          ? totalAmortissementsBudget(
              amortissementsBudget
            )
          : null

      // =================================================
      // AMORTISSEMENTS DE LA PRÉVISION
      // =================================================

      const amortPrevision =
        amortissementsPrevision
          ? totalAmortissementsPrevision(
              amortissementsPrevision
            )
          : null

      inserer(
        creerIndicateur(
          "AMORTISSEMENTS",
          "Dotations aux amortissements",
          amortBudget,
          amortPrevision
        ),
        "MASSE_SALARIALE"
      )

      setResultat({
        ...data,
        indicateurs,
        autresCategories,
        avertissements,
      })
    } catch (err) {
      console.error(
        "Erreur comparaison prospective :",
        err
      )

      setError(
        err instanceof Error
          ? err.message
          : "Comparaison impossible"
      )
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // INDICATEURS
  // =====================================================

  const indicateurs = resultat?.indicateurs ?? []

  const trouver = (code: string) =>
    indicateurs.find(i => i.code === code)

  const amortissements = trouver("AMORTISSEMENTS")

  const principaux = [
    { label: "Chiffre d'affaires", item: trouver("CA_EXPORT") },
    { label: "Charges d'exploitation", item: trouver("CHARGES") },
    { label: "Achats consommés", item: trouver("ACHATS_CONSOMMES") },
    { label: "Services extérieurs", item: trouver("SERVICES_EXTERIEURS") },
    { label: "Impôts et taxes", item: trouver("IMPOTS_TAXES") },
    { label: "Autres charges", item: trouver("AUTRES_CHARGES") },
    { label: "Masse salariale", item: trouver("MASSE_SALARIALE") },
    { label: "Amortissements", item: amortissements },
    { label: "Résultat opérationnel", item: trouver("RESULTAT") },
    { label: "Marge opérationnelle", item: trouver("MARGE") },
  ].filter(
    (c): c is { label: string; item: Indicateur } =>
      c.item !== undefined
  )

  // =====================================================
  // GRAPHIQUES
  // =====================================================

  const libelles: Record<string, string> = {
    CA_EXPORT: "CA export",
    CHARGES: "Charges d'exploitation",
    MASSE_SALARIALE: "Masse salariale",
    AMORTISSEMENTS: "Amortissements",
    RESULTAT: "Résultat opérationnel",
  }

  const convertirGraphique = (i: Indicateur) => ({
    nom: libelles[i.code] || i.libelle,
    budget:
      i.valeur1 == null
        ? null
        : nombre(i.valeur1) / 1e9,
    prevision:
      i.valeur2 == null
        ? null
        : nombre(i.valeur2) / 1e9,
  })

  const graphiquePrincipal = indicateurs
    .filter(
      i =>
        i.unite === "MGA" &&
        !CODES_DETAILS.has(i.code)
    )
    .map(convertirGraphique)

  const graphiqueCharges = indicateurs
    .filter(i => CODES_DETAILS.has(i.code))
    .map(convertirGraphique)

  // =====================================================
  // INTERFACE
  // =====================================================

  return (
    <div className="space-y-5">

      {/* SÉLECTION */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Sélection des exercices
          </CardTitle>

          <CardDescription>
            Choisissez un budget généré et une prévision
            budgétaire d'une année ultérieure.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
            {[
              {
                label: "Budget de référence",
                value: anneeBudget,
                setter: setAnneeBudget,
                options: budgets,
              },
              {
                label: "Année prévisionnelle",
                value: anneePrevision,
                setter: setAnneePrevision,
                options: previsions,
              },
            ].map(field => (
              <label
                key={field.label}
                className="space-y-2 text-sm font-medium"
              >
                {field.label}

                <select
                  value={field.value}
                  onChange={e => {
                    field.setter(e.target.value)
                    setResultat(null)
                  }}
                  className="block h-10 w-full rounded-md border bg-background px-3 font-normal"
                  disabled={initialisation || loading}
                >
                  <option value="">
                    Choisir une année
                  </option>

                  {field.options.map(a => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </label>
            ))}

            <Button
              onClick={comparer}
              disabled={
                loading ||
                initialisation ||
                !anneeBudget ||
                !anneePrevision ||
                Number(anneePrevision) <= Number(anneeBudget)
              }
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowLeftRight className="mr-2 h-4 w-4" />
              )}
              Comparer
            </Button>
          </div>

          {!initialisation &&
            (!budgets.length || !previsions.length) &&
            !error && (
              <p className="text-sm text-muted-foreground">
                Un budget généré et une prévision sont nécessaires.
              </p>
            )}

          {anneeBudget &&
            anneePrevision &&
            Number(anneePrevision) <= Number(anneeBudget) && (
              <p className="text-sm text-amber-700">
                La prévision doit porter sur une année
                ultérieure à celle du budget.
              </p>
            )}

          {error && (
            <p
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}
        </CardContent>
      </Card>

      {resultat && (
        <>

          {/* AVERTISSEMENTS */}
          {resultat.avertissements?.map((message, index) => (
            <p
              key={index}
              className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/20 dark:text-amber-200"
            >
              {message}
            </p>
          ))}

          {/* CARTES D'ÉVOLUTION */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {principaux.map(({ label, item }) => (
              <Card key={label}>
                <CardContent className="p-5">
                  <p className="text-sm text-muted-foreground">
                    {label} — évolution
                  </p>

                  <div className="mt-2 flex items-center gap-2 text-2xl font-semibold">
                    {item.evolutionPourcentage == null ? (
                      <Minus className="h-5 w-5" />
                    ) : nombre(item.evolutionPourcentage) > 0 ? (
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
                    ) : nombre(item.evolutionPourcentage) < 0 ? (
                      <TrendingDown className="h-5 w-5 text-rose-600" />
                    ) : (
                      <Minus className="h-5 w-5" />
                    )}

                    {evolution(item)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* TABLEAU COMPARATIF */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Tableau comparatif
              </CardTitle>

              <CardDescription>
                Budget {resultat.anneeBudget} et prévision{" "}
                {resultat.anneePrevision} — montants en MGA.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-left">
                      <th className="p-3">
                        Indicateur
                      </th>
                      <th className="p-3 text-right">
                        Budget {resultat.anneeBudget}
                      </th>
                      <th className="p-3 text-right">
                        Prévision {resultat.anneePrevision}
                      </th>
                      <th className="p-3 text-right">
                        Écart
                      </th>
                      <th className="p-3 text-right">
                        Évolution
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {indicateurs.map((i, index) => {
                      const point = i.unite === "POINT"
                      const detail = CODES_DETAILS.has(i.code)

                      return (
                        <tr
                          key={`${i.code}-${index}`}
                          className={`border-b hover:bg-muted/30 ${
                            i.code === "CHARGES"
                              ? "bg-muted/70 font-semibold"
                              : detail
                                ? "bg-muted/20"
                                : i.code === "AMORTISSEMENTS"
                                  ? "bg-amber-50/50 dark:bg-amber-950/10"
                                  : ""
                          }`}
                        >
                          <td
                            className={`p-3 ${
                              detail
                                ? "pl-8 text-muted-foreground"
                                : "font-medium"
                            }`}
                          >
                            {i.libelle}
                          </td>

                          <td className="whitespace-nowrap p-3 text-right">
                            {valeur(i.valeur1, point)}
                          </td>

                          <td className="whitespace-nowrap p-3 text-right">
                            {valeur(i.valeur2, point)}
                          </td>

                          <td className="whitespace-nowrap p-3 text-right">
                            {valeur(i.ecart, point)}
                          </td>

                          <td className="whitespace-nowrap p-3 text-right">
                            {evolution(i)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                Les frais export sont intégrés aux services extérieurs.
                Les amortissements et la masse salariale restent séparés
                des charges d'exploitation. Les valeurs indisponibles
                ne sont pas assimilées à zéro.
              </p>
            </CardContent>
          </Card>

          {/* GRAPHIQUE PRINCIPAL */}
          <Graphique
            titre="Visualisation annuelle"
            description="Comparaison des principaux indicateurs en milliards MGA."
            data={graphiquePrincipal}
            anneeBudget={resultat.anneeBudget}
            anneePrevision={resultat.anneePrevision}
            hauteur={410}
          />

          {/* GRAPHIQUE DES CHARGES */}
          <Graphique
            titre="Détail des charges d'exploitation"
            description="Achats consommés, Services extérieurs, Impôts et taxes et Autres charges — milliards MGA."
            data={graphiqueCharges}
            anneeBudget={resultat.anneeBudget}
            anneePrevision={resultat.anneePrevision}
            hauteur={360}
          />

          {/* COMPOSITION DES CHARGES */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Composition des charges d'exploitation
              </CardTitle>

              <CardDescription>
                Catégories prises en compte dans chaque rubrique.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3">Rubrique</th>
                      <th className="p-3">Catégories</th>
                    </tr>
                  </thead>

                  <tbody>
                    {[
                      ...GROUPES_CHARGES,
                      {
                        code: "AUTRES_CHARGES",
                        libelle: "Autres charges",
                        categories: resultat.autresCategories ?? [],
                      },
                    ].map(g => (
                      <tr
                        key={g.code}
                        className="border-b last:border-0"
                      >
                        <td className="p-3 font-medium">
                          {g.libelle}
                        </td>

                        <td className="p-3">
                          {[
                            ...g.categories,
                            ...(g.code === "SERVICES_EXTERIEURS"
                              ? ["FRAIS EXPORT"]
                              : []),
                          ].join(", ") || "Aucune catégorie"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* INTERPRÉTATIONS */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Interprétation automatique
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-2">
              {liste(resultat.interpretations).map(
                (texte, index) => (
                  <p
                    key={index}
                    className="rounded-md bg-muted/40 p-3 text-sm"
                  >
                    {texte}
                  </p>
                )
              )}

              {amortissements && (
                <p className="rounded-md bg-muted/40 p-3 text-sm">
                  Les dotations aux amortissements du budget
                  de référence s'élèvent à{" "}
                  <strong>
                    {valeur(amortissements.valeur1, false)} MGA
                  </strong>
                  .{" "}
                  {amortissements.valeur2 == null
                    ? "Les amortissements prévisionnels ne sont pas disponibles."
                    : `Les dotations prévisionnelles s'élèvent à ${valeur(
                        amortissements.valeur2,
                        false
                      )} MGA, soit une évolution de ${evolution(
                        amortissements
                      )}.`}
                </p>
              )}

              <p className="text-xs text-muted-foreground">
                Les résultats opérationnels et marges provenant
                du backend ne sont pas recalculés par ce composant.
                Ils doivent être cohérents avec les charges
                et amortissements utilisés dans la comparaison.
              </p>
            </CardContent>
          </Card>

        </>
      )}
    </div>
  )
}
