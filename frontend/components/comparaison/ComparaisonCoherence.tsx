
// "use client"

// import { useEffect, useState } from "react"
// import {
//   BrainCircuit,
//   AlertCircle,
//   Loader2,
//   TrendingUp,
//   TrendingDown,
//   CheckCircle2,
//   BarChart3,
// } from "lucide-react"

// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card"

// import { Button } from "@/components/ui/button"

// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"

// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts"

// import {
//   getExercicesEvaluables,
//   evaluerPrediction,
// } from "@/services/evaluation-prediction-service"

// type Indicateur = {
//   code: string
//   libelle: string
//   unite: string
//   constate: number
//   prevision: number
//   ecart: number
//   erreurAbsolue: number
//   erreurPourcentage: number | null
//   diagnostic: string
// }

// type Evaluation = {
//   annee: number
//   budgetGenereId: number
//   budgetPrevisionnelId: number
//   indicateurs: Indicateur[]
//   interpretations: string[]
// }

// const formatNombre = (value: number) =>
//   new Intl.NumberFormat("fr-FR", {
//     maximumFractionDigits: 0,
//   }).format(Number(value || 0))

// const formatPourcentage = (value: number | null) =>
//   value == null
//     ? "Non calculable"
//     : `${Number(value).toFixed(2)} %`

// const formatValeur = (value: number, unite: string) => {
//   if (unite === "POINT") {
//     return `${(Number(value) * 100).toFixed(2)} %`
//   }

//   return `${formatNombre(value)} MGA`
// }

// const formatEcart = (value: number, unite: string) => {
//   if (unite === "POINT") {
//     return `${(Number(value) * 100).toFixed(2)} %`
//   }

//   return `${formatNombre(value)} MGA`
// }

// export default function EvaluationPrediction() {
//   const [annees, setAnnees] = useState<number[]>([])
//   const [annee, setAnnee] = useState("")
//   const [evaluation, setEvaluation] =
//     useState<Evaluation | null>(null)

//   const [loading, setLoading] = useState(false)
//   const [loadingAnnees, setLoadingAnnees] = useState(true)
//   const [erreur, setErreur] = useState("")

//   useEffect(() => {
//     let actif = true

//     const charger = async () => {
//       try {
//         const data = await getExercicesEvaluables()

//         if (!actif) return

//         const liste = Array.isArray(data)
//           ? data.map(Number).sort((a, b) => b - a)
//           : []

//         setAnnees(liste)

//         if (liste.length > 0) {
//           setAnnee(String(liste[0]))
//         }
//       } catch (error: any) {
//         if (actif) {
//           setErreur(
//             error.message ||
//               "Impossible de récupérer les exercices."
//           )
//         }
//       } finally {
//         if (actif) setLoadingAnnees(false)
//       }
//     }

//     charger()

//     return () => {
//       actif = false
//     }
//   }, [])

//   const lancerEvaluation = async () => {
//     if (!annee || loading) return

//     setLoading(true)
//     setErreur("")
//     setEvaluation(null)

//     try {
//       const data = await evaluerPrediction(Number(annee))
//       setEvaluation(data)
//     } catch (error: any) {
//       setErreur(
//         error.message ||
//           "Impossible d'évaluer les prévisions."
//       )
//     } finally {
//       setLoading(false)
//     }
//   }

//   const resultat = evaluation?.indicateurs.find(
//     (item) => item.code === "RESULTAT"
//   )

//   const marge = evaluation?.indicateurs.find(
//     (item) => item.code === "MARGE"
//   )

//   const graphiques = evaluation?.indicateurs
//     .filter((item) => item.unite === "MGA")
//     .map((item) => ({
//       nom: item.libelle,
//       Constaté: Number(item.constate),
//       Prévision: Number(item.prevision),
//     })) || []

//   return (
//     <div className="space-y-6">
//       <div>
//         <h2 className="text-2xl font-semibold tracking-tight">
//           Évaluation des prévisions
//         </h2>
//         <p className="text-sm text-muted-foreground mt-1">
//           Comparaison des budgets constatés et prévisionnels
//           pour un même exercice.
//         </p>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <BrainCircuit className="h-5 w-5" />
//             Sélection de l'exercice
//           </CardTitle>
//           <CardDescription>
//             Choisissez une année possédant un budget généré
//             et un budget prévisionnel.
//           </CardDescription>
//         </CardHeader>

//         <CardContent>
//           <div className="flex flex-col sm:flex-row gap-3">
//             <div className="w-full sm:w-64">
//               <Select
//                 value={annee}
//                 onValueChange={(value) => {
//                   setAnnee(value)
//                   setEvaluation(null)
//                   setErreur("")
//                 }}
//                 disabled={loadingAnnees || annees.length === 0}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Choisir une année" />
//                 </SelectTrigger>

//                 <SelectContent>
//                   {annees.map((item) => (
//                     <SelectItem
//                       key={item}
//                       value={String(item)}
//                     >
//                       {item}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <Button
//               onClick={lancerEvaluation}
//               disabled={!annee || loading}
//             >
//               {loading ? (
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//               ) : (
//                 <BarChart3 className="mr-2 h-4 w-4" />
//               )}
//               Évaluer les prévisions
//             </Button>
//           </div>
//         </CardContent>
//       </Card>

//       {erreur && (
//         <Card>
//           <CardContent className="pt-6">
//             <div className="flex gap-3 text-destructive">
//               <AlertCircle className="h-5 w-5 shrink-0" />
//               <p className="text-sm">{erreur}</p>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {!loadingAnnees &&
//         annees.length === 0 &&
//         !erreur && (
//           <Card>
//             <CardContent className="py-12">
//               <div className="flex flex-col items-center text-center gap-3">
//                 <BrainCircuit className="h-10 w-10 text-muted-foreground" />

//                 <h3 className="font-semibold">
//                   Aucune évaluation disponible
//                 </h3>

//                 <p className="text-sm text-muted-foreground max-w-lg">
//                   Aucun exercice ne possède actuellement
//                   à la fois un budget GENERE et un budget
//                   PREVISIONNEL.
//                 </p>

//                 <p className="text-sm text-muted-foreground max-w-lg">
//                   La prévision 2026 est déjà enregistrée.
//                   L'évaluation sera disponible lorsque
//                   le budget constaté 2026 aura été généré.
//                 </p>
//               </div>
//             </CardContent>
//           </Card>
//         )}

//       {evaluation && (
//         <>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {[resultat, marge].map((item) => {
//               if (!item) return null

//               return (
//                 <Card key={item.code}>
//                   <CardHeader>
//                     <CardDescription>
//                       {item.libelle}
//                     </CardDescription>
//                     <CardTitle className="text-xl">
//                       {formatPourcentage(
//                         item.erreurPourcentage
//                       )}
//                     </CardTitle>
//                   </CardHeader>

//                   <CardContent className="space-y-2">
//                     <p className="text-sm text-muted-foreground">
//                       Erreur relative absolue
//                     </p>

//                     <p className="text-sm">
//                       Écart :{" "}
//                       <span className="font-medium">
//                         {formatEcart(
//                           item.ecart,
//                           item.unite
//                         )}
//                       </span>
//                     </p>

//                     <p className="text-sm">
//                       {item.diagnostic === "CONFORME"
//                         ? "Prévision conforme"
//                         : item.diagnostic === "SURESTIMATION"
//                         ? "Prévision supérieure au constaté"
//                         : "Prévision inférieure au constaté"}
//                     </p>
//                   </CardContent>
//                 </Card>
//               )
//             })}
//           </div>

//           <Card>
//             <CardHeader>
//               <CardTitle>
//                 Comparaison des indicateurs
//               </CardTitle>
//               <CardDescription>
//                 Exercice {evaluation.annee} —
//                 Budget constaté
//                 {" "}et prévision 
//               </CardDescription>
//             </CardHeader>

//             <CardContent>
//               <div className="overflow-x-auto">
//                 <table className="w-full text-sm">
//                   <thead>
//                     <tr className="border-b">
//                       <th className="text-left p-3">
//                         Indicateur
//                       </th>
//                       <th className="text-right p-3">
//                         Constaté
//                       </th>
//                       <th className="text-right p-3">
//                         Prévision
//                       </th>
//                       <th className="text-right p-3">
//                         Écart
//                       </th>
//                       <th className="text-right p-3">
//                         Erreur (%)
//                       </th>
//                       <th className="text-left p-3">
//                         Diagnostic
//                       </th>
//                     </tr>
//                   </thead>

//                   <tbody>
//                     {evaluation.indicateurs.map((item) => (
//                       <tr
//                         key={item.code}
//                         className="border-b"
//                       >
//                         <td className="p-3 font-medium">
//                           {item.libelle}
//                         </td>
//                         <td className="p-3 text-right whitespace-nowrap">
//                           {formatValeur(
//                             item.constate,
//                             item.unite
//                           )}
//                         </td>
//                         <td className="p-3 text-right whitespace-nowrap">
//                           {formatValeur(
//                             item.prevision,
//                             item.unite
//                           )}
//                         </td>
//                         <td className="p-3 text-right whitespace-nowrap">
//                           {formatEcart(
//                             item.ecart,
//                             item.unite
//                           )}
//                         </td>
//                         <td className="p-3 text-right">
//                           {formatPourcentage(
//                             item.erreurPourcentage
//                           )}
//                         </td>
//                         <td className="p-3">
//                           <span className="inline-flex items-center gap-1">
//                             {item.diagnostic === "CONFORME" ? (
//                               <CheckCircle2 className="h-4 w-4 text-emerald-600" />
//                             ) : item.diagnostic === "SURESTIMATION" ? (
//                               <TrendingUp className="h-4 w-4 text-blue-600" />
//                             ) : (
//                               <TrendingDown className="h-4 w-4 text-slate-500" />
//                             )}
//                             {item.diagnostic.replaceAll("_", " ")}
//                           </span>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>
//                 Visualisation des écarts budgétaires annuels
//               </CardTitle>
//               <CardDescription>
//                 Comparaison des montants en MGA
//               </CardDescription>
//             </CardHeader>

//             <CardContent>
//               <div className="h-[360px] w-full">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart
//                     data={graphiques}
//                     margin={{
//                       top: 10,
//                       right: 10,
//                       left: 10,
//                       bottom: 80,
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
//                       height={100}
//                       tick={{ fontSize: 11 }}
//                     />

//                     <YAxis
//                       tickFormatter={(value) =>
//                         `${(value / 1_000_000_000).toFixed(1)} Md`
//                       }
//                       width={65}
//                     />

//                     <Tooltip
//                       formatter={(value: any) =>
//                         `${formatNombre(Number(value))} MGA`
//                       }
//                     />

//                     <Legend />

//                     <Bar
//                       dataKey="Constaté"
//                       fill="#64748b"
//                       radius={[4, 4, 0, 0]}
//                     />

//                     <Bar
//                       dataKey="Prévision"
//                       fill="#93c5fd"
//                       radius={[4, 4, 0, 0]}
//                     />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>
//                 Interprétation des résultats
//               </CardTitle>
//               <CardDescription>
//                 Analyse automatique des écarts entre
//                 les prévisions et les données constatées.
//               </CardDescription>
//             </CardHeader>

//             <CardContent className="space-y-3">
//               {evaluation.interpretations.map(
//                 (interpretation, index) => (
//                   <div
//                     key={index}
//                     className="rounded-lg border p-4 text-sm leading-relaxed"
//                   >
//                     {interpretation}
//                   </div>
//                 )
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
  BrainCircuit,
  AlertCircle,
  Loader2,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  BarChart3,
  Minus,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

import {
  getExercicesEvaluables,
  evaluerPrediction,
} from "@/services/evaluation-prediction-service"

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
  constate: number | null
  prevision: number | null
  ecart: number | null
  erreurAbsolue: number | null
  erreurPourcentage: number | null
  diagnostic: string
}

type Evaluation = {
  annee: number
  budgetGenereId: number
  budgetPrevisionnelId: number
  indicateurs: Indicateur[]
  interpretations: string[]
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
// CATÉGORIES DE CHARGES
// IDENTIQUES À PREDICTION DETAILS
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

const formatNombre = (
  value: number | null,
  digits = 0
): string =>
  value == null
    ? "—"
    : new Intl.NumberFormat("fr-FR", {
        maximumFractionDigits: digits,
      }).format(value)

const formatPourcentage = (
  value: number | null
): string =>
  value == null
    ? "Non calculable"
    : `${new Intl.NumberFormat("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value)} %`

const formatValeur = (
  value: number | null,
  unite: string
): string => {
  if (value == null) return "—"

  if (unite === "POINT") {
    return `${formatNombre(value * 100, 2)} %`
  }

  return `${formatNombre(value)} MGA`
}

const formatEcart = formatValeur

function somme<T>(
  lignes: T[],
  getMontant: (ligne: T) => unknown
): number {
  return liste(lignes).reduce(
    (total, ligne) => total + nombre(getMontant(ligne)),
    0
  )
}

function trouverExerciceId(
  exercices: Exercice[],
  annee: number
): number | null {
  const exercice = exercices.find(
    e =>
      Number(e.annee_exercice ?? e.annee) === annee
  )

  return exercice?.id_exercice ?? exercice?.id ?? null
}

// =====================================================
// CALCUL DES INDICATEURS D'ÉVALUATION
// =====================================================

function creerIndicateur(
  code: string,
  libelle: string,
  constate: number | null,
  prevision: number | null
): Indicateur {
  if (constate == null || prevision == null) {
    return {
      code,
      libelle,
      unite: "MGA",
      constate,
      prevision,
      ecart: null,
      erreurAbsolue: null,
      erreurPourcentage: null,
      diagnostic: "NON_DISPONIBLE",
    }
  }

  const ecart = prevision - constate
  const erreurAbsolue = Math.abs(ecart)

  const erreurPourcentage =
    constate !== 0
      ? (erreurAbsolue / Math.abs(constate)) * 100
      : null

  const diagnostic =
    Math.abs(ecart) < 0.01
      ? "CONFORME"
      : ecart > 0
        ? "SURESTIMATION"
        : "SOUS_ESTIMATION"

  return {
    code,
    libelle,
    unite: "MGA",
    constate,
    prevision,
    ecart,
    erreurAbsolue,
    erreurPourcentage,
    diagnostic,
  }
}

// =====================================================
// CATÉGORIES RESTANTES
// =====================================================

function trouverAutresCategories(
  charges: Charge[],
  previsions: ChargesPrevisionnelles | null
): string[] {
  const connues = new Set(
    GROUPES_CHARGES.flatMap(g =>
      g.categories.map(normaliser)
    )
  )

  const exclues = new Set(
    CATEGORIES_FRAIS_EXPORT.map(normaliser)
  )

  const disponibles = new Set([
    ...liste(charges).map(c =>
      normaliser(c.categorie)
    ),
    ...liste(previsions?.details).map(c =>
      normaliser(c.categorie)
    ),
  ])

  return [...disponibles].filter(
    categorie =>
      categorie &&
      !connues.has(categorie) &&
      !exclues.has(categorie)
  )
}

// =====================================================
// SOMMES PAR CATÉGORIE
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

// =====================================================
// CALCUL DES CHARGES CONSTATÉES
// =====================================================

function calculerChargesConstatees(
  charges: Charge[],
  frais: FraisExport[],
  autresCategories: string[]
) {
  const groupes = GROUPES_CHARGES.map(g => ({
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
    ...groupes,
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

// =====================================================
// CALCUL DES CHARGES PRÉVISIONNELLES
// =====================================================

function calculerChargesPrevisionnelles(
  data: ChargesPrevisionnelles,
  autresCategories: string[],
  fraisExportPrevision: number
) {
  const groupes = GROUPES_CHARGES.map(g => ({
    code: g.code,
    libelle: g.libelle,
    montant:
      sommeCategoriePrevision(data, g.categories) +
      (
        g.code === "SERVICES_EXTERIEURS"
          ? fraisExportPrevision
          : 0
      ),
  }))

  return [
    ...groupes,
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

function totalAmortissementsPrevision(
  data: AmortissementsPrevisionnels
): number | null {
  if (data.total_annuel != null) {
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
// COMPOSANT PRINCIPAL
// =====================================================

export default function EvaluationPrediction() {
  const [annees, setAnnees] = useState<number[]>([])
  const [exercices, setExercices] = useState<Exercice[]>([])
  const [annee, setAnnee] = useState("")

  const [evaluation, setEvaluation] =
    useState<Evaluation | null>(null)

  const [loading, setLoading] = useState(false)
  const [loadingAnnees, setLoadingAnnees] = useState(true)
  const [erreur, setErreur] = useState("")

  // ===================================================
  // CHARGEMENT DES EXERCICES
  // ===================================================

  useEffect(() => {
    let actif = true

    async function charger() {
      try {
        const [anneesData, exercicesData] =
          await Promise.all([
            getExercicesEvaluables(),
            getExercices(),
          ])

        if (!actif) return

        const anneesDisponibles = liste(anneesData)
          .map(Number)
          .filter(Number.isFinite)
          .sort((a, b) => b - a)

        setAnnees(anneesDisponibles)
        setExercices(liste(exercicesData))

        if (anneesDisponibles.length > 0) {
          setAnnee(String(anneesDisponibles[0]))
        }
      } catch (error) {
        if (actif) {
          setErreur(
            error instanceof Error
              ? error.message
              : "Impossible de récupérer les exercices."
          )
        }
      } finally {
        if (actif) setLoadingAnnees(false)
      }
    }

    void charger()

    return () => {
      actif = false
    }
  }, [])

  // ===================================================
  // LANCEMENT DE L'ÉVALUATION
  // ===================================================

  async function lancerEvaluation() {
    if (!annee || loading) return

    setLoading(true)
    setErreur("")
    setEvaluation(null)

    try {
      const anneeSelectionnee = Number(annee)

      // ÉVALUATION EXISTANTE DU BACKEND
      const data: Evaluation =
        await evaluerPrediction(anneeSelectionnee)

      if (!data) {
        throw new Error(
          "Aucune évaluation disponible."
        )
      }

      const indicateurs = liste(data.indicateurs)
        .filter(
          i =>
            !CODES_DETAILS.has(i.code) &&
            i.code !== "AMORTISSEMENTS" &&
            !CATEGORIES_FRAIS_EXPORT
              .map(normaliser)
              .includes(normaliser(i.code))
        )
        .map(i => ({ ...i }))

      const avertissements: string[] = []

      // =================================================
      // DONNÉES CONSTATÉES
      // =================================================

      const exerciceId = trouverExerciceId(
        exercices,
        anneeSelectionnee
      )

      if (exerciceId == null) {
        throw new Error(
          "Identifiant de l'exercice introuvable."
        )
      }

      const [
        chargesConstatees,
        fraisConstatees,
        amortissementsConstates,
      ] = await Promise.all([
        getBudgetDetails("charges", exerciceId),
        getBudgetDetails("frais-export", exerciceId),
        getBudgetDetails("amortissements", exerciceId),
      ])

      // =================================================
      // DONNÉES PRÉVISIONNELLES
      // =================================================

      const [
        resultatCharges,
        resultatAmortissements,
      ] = await Promise.allSettled([
        getChargesCategoriesPrevisionnelles(
          anneeSelectionnee
        ),
        getAmortissementsPrevisionnels(
          anneeSelectionnee
        ),
      ])

      const chargesPrevisionnelles: ChargesPrevisionnelles | null =
        resultatCharges.status === "fulfilled"
          ? resultatCharges.value
          : null

      const amortissementsPrevisionnels: AmortissementsPrevisionnels | null =
        resultatAmortissements.status === "fulfilled"
          ? resultatAmortissements.value
          : null

      if (!chargesPrevisionnelles) {
        avertissements.push(
          "Les détails des charges prévisionnelles ne sont pas disponibles."
        )
      }

      if (!amortissementsPrevisionnels) {
        avertissements.push(
          "Les amortissements prévisionnels ne sont pas disponibles."
        )
      }

      // =================================================
      // FRAIS EXPORT PRÉVISIONNELS
      // =================================================

      const fraisBackend = liste(data.indicateurs)
        .find(
          i =>
            CATEGORIES_FRAIS_EXPORT
              .map(normaliser)
              .includes(normaliser(i.code))
        )

      const fraisExportPrevision =
        fraisBackend?.prevision == null
          ? null
          : nombre(fraisBackend.prevision)

      if (fraisExportPrevision == null) {
        avertissements.push(
          "Les frais export prévisionnels sont indisponibles. Les services extérieurs prévisionnels ne peuvent pas être calculés complètement."
        )
      }

      // =================================================
      // CATÉGORIES RESTANTES
      // =================================================

      const autresCategories = trouverAutresCategories(
        liste<Charge>(chargesConstatees),
        chargesPrevisionnelles
      )

      // =================================================
      // CALCUL DES CHARGES CONSTATÉES
      // =================================================

      const detailsConstates = calculerChargesConstatees(
        liste<Charge>(chargesConstatees),
        liste<FraisExport>(fraisConstatees),
        autresCategories
      )

      // =================================================
      // CALCUL DES CHARGES PRÉVISIONNELLES
      // =================================================

      const detailsPrevision = chargesPrevisionnelles
        ? calculerChargesPrevisionnelles(
            chargesPrevisionnelles,
            autresCategories,
            nombre(fraisExportPrevision)
          )
        : []

      // =================================================
      // INDICATEURS DES CHARGES
      // =================================================

      const chargesConstateesDisponibles =
        Array.isArray(chargesConstatees) &&
        Array.isArray(fraisConstatees)

      const chargesPrevisionDisponibles =
        chargesPrevisionnelles != null &&
        Array.isArray(chargesPrevisionnelles.details)

      const totalConstate =
        chargesConstateesDisponibles
          ? detailsConstates.reduce(
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

      inserer(
        creerIndicateur(
          "CHARGES",
          "Charges d'exploitation",
          totalConstate,
          totalPrevision
        )
      )

      const indexCharges = indicateurs.findIndex(
        i => i.code === "CHARGES"
      )

      const detailsIndicateurs = detailsConstates.map(
        (detail, index) => {
          const services =
            detail.code === "SERVICES_EXTERIEURS"

          const montantPrevision =
            !chargesPrevisionDisponibles ||
            (services && fraisExportPrevision == null)
              ? null
              : detailsPrevision[index]?.montant ?? null

          return creerIndicateur(
            detail.code,
            detail.libelle,
            chargesConstateesDisponibles
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
      // AMORTISSEMENTS CONSTATÉS ET PRÉVISIONNELS
      // =================================================

      const amortConstate =
        Array.isArray(amortissementsConstates)
          ? somme(
              amortissementsConstates as Amortissement[],
              ligne => ligne.montant
            )
          : null

      const amortPrevision =
        amortissementsPrevisionnels
          ? totalAmortissementsPrevision(
              amortissementsPrevisionnels
            )
          : null

      inserer(
        creerIndicateur(
          "AMORTISSEMENTS",
          "Dotations aux amortissements",
          amortConstate,
          amortPrevision
        ),
        "MASSE_SALARIALE"
      )

      setEvaluation({
        ...data,
        indicateurs,
        autresCategories,
        avertissements,
      })
    } catch (error) {
      console.error(
        "Erreur évaluation des prévisions :",
        error
      )

      setErreur(
        error instanceof Error
          ? error.message
          : "Impossible d'évaluer les prévisions."
      )
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // INDICATEURS ET GRAPHIQUES
  // =====================================================

  const indicateurs = evaluation?.indicateurs ?? []

  const resultat = indicateurs.find(
    item => item.code === "RESULTAT"
  )

  const marge = indicateurs.find(
    item => item.code === "MARGE"
  )

  const amortissements = indicateurs.find(
    item => item.code === "AMORTISSEMENTS"
  )

  const graphiques = indicateurs
    .filter(
      item =>
        item.unite === "MGA" &&
        !CODES_DETAILS.has(item.code)
    )
    .map(item => ({
      nom: item.libelle,
      Constaté: item.constate,
      Prévision: item.prevision,
    }))

  const graphiquesCharges = indicateurs
    .filter(item => CODES_DETAILS.has(item.code))
    .map(item => ({
      nom: item.libelle,
      Constaté: item.constate,
      Prévision: item.prevision,
    }))

  // =====================================================
  // AFFICHAGE
  // =====================================================

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Évaluation des prévisions
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Comparaison des budgets constatés et prévisionnels
          pour un même exercice.
        </p>
      </div>

      {/* SÉLECTION DE L'EXERCICE */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" />
            Sélection de l'exercice
          </CardTitle>

          <CardDescription>
            Choisissez une année possédant un budget généré
            et un budget prévisionnel.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="w-full sm:w-64">
              <Select
                value={annee}
                onValueChange={value => {
                  setAnnee(value)
                  setEvaluation(null)
                  setErreur("")
                }}
                disabled={
                  loadingAnnees ||
                  loading ||
                  annees.length === 0
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une année" />
                </SelectTrigger>

                <SelectContent>
                  {annees.map(item => (
                    <SelectItem
                      key={item}
                      value={String(item)}
                    >
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={lancerEvaluation}
              disabled={!annee || loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <BarChart3 className="mr-2 h-4 w-4" />
              )}
              Évaluer les prévisions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ERREUR */}
      {erreur && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-3 text-destructive">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm">{erreur}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AUCUNE ÉVALUATION */}
      {!loadingAnnees &&
        annees.length === 0 &&
        !erreur && (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center gap-3 text-center">
                <BrainCircuit className="h-10 w-10 text-muted-foreground" />

                <h3 className="font-semibold">
                  Aucune évaluation disponible
                </h3>

                <p className="max-w-lg text-sm text-muted-foreground">
                  Aucun exercice ne possède actuellement
                  à la fois un budget généré et un budget
                  prévisionnel.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

      {evaluation && (
        <>

          {/* AVERTISSEMENTS */}
          {evaluation.avertissements?.map(
            (message, index) => (
              <p
                key={index}
                className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/20 dark:text-amber-200"
              >
                {message}
              </p>
            )
          )}

          {/* CARTES DE DIAGNOSTIC */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[resultat, marge, amortissements].map(item => {
              if (!item) return null

              return (
                <Card key={item.code}>
                  <CardHeader>
                    <CardDescription>
                      {item.libelle}
                    </CardDescription>

                    <CardTitle className="text-xl">
                      {formatPourcentage(
                        item.erreurPourcentage
                      )}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Erreur relative absolue
                    </p>

                    <p className="text-sm">
                      Écart :{" "}
                      <span className="font-medium">
                        {formatEcart(
                          item.ecart,
                          item.unite
                        )}
                      </span>
                    </p>

                    <p className="text-sm">
                      {item.diagnostic === "CONFORME"
                        ? "Prévision conforme"
                        : item.diagnostic === "SURESTIMATION"
                          ? "Prévision supérieure au constaté"
                          : item.diagnostic === "SOUS_ESTIMATION"
                            ? "Prévision inférieure au constaté"
                            : "Données indisponibles"}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* TABLEAU COMPARATIF */}
          <Card>
            <CardHeader>
              <CardTitle>
                Comparaison des indicateurs
              </CardTitle>

              <CardDescription>
                Exercice {evaluation.annee} — Budget constaté
                et prévision
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="p-3 text-left">
                        Indicateur
                      </th>
                      <th className="p-3 text-right">
                        Constaté
                      </th>
                      <th className="p-3 text-right">
                        Prévision
                      </th>
                      <th className="p-3 text-right">
                        Écart
                      </th>
                      <th className="p-3 text-right">
                        Erreur (%)
                      </th>
                      <th className="p-3 text-left">
                        Diagnostic
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {indicateurs.map(item => {
                      const detail = CODES_DETAILS.has(item.code)

                      return (
                        <tr
                          key={item.code}
                          className={`border-b ${
                            item.code === "CHARGES"
                              ? "bg-muted/70 font-semibold"
                              : detail
                                ? "bg-muted/20"
                                : item.code === "AMORTISSEMENTS"
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
                            {item.libelle}
                          </td>

                          <td className="whitespace-nowrap p-3 text-right">
                            {formatValeur(
                              item.constate,
                              item.unite
                            )}
                          </td>

                          <td className="whitespace-nowrap p-3 text-right">
                            {formatValeur(
                              item.prevision,
                              item.unite
                            )}
                          </td>

                          <td className="whitespace-nowrap p-3 text-right">
                            {formatEcart(
                              item.ecart,
                              item.unite
                            )}
                          </td>

                          <td className="p-3 text-right">
                            {formatPourcentage(
                              item.erreurPourcentage
                            )}
                          </td>

                          <td className="p-3">
                            <span className="inline-flex items-center gap-1">
                              {item.diagnostic === "CONFORME" ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                              ) : item.diagnostic === "SURESTIMATION" ? (
                                <TrendingUp className="h-4 w-4 text-blue-600" />
                              ) : item.diagnostic === "SOUS_ESTIMATION" ? (
                                <TrendingDown className="h-4 w-4 text-slate-500" />
                              ) : (
                                <Minus className="h-4 w-4" />
                              )}

                              {item.diagnostic.replaceAll("_", " ")}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* GRAPHIQUE PRINCIPAL */}
          <GraphiqueEvaluation
            titre="Visualisation des écarts budgétaires annuels"
            description="Comparaison des montants constatés et prévisionnels en MGA."
            data={graphiques}
          />

          {/* GRAPHIQUE DES CHARGES */}
          <GraphiqueEvaluation
            titre="Détail des charges d'exploitation"
            description="Achats consommés, Services extérieurs, Impôts et taxes et Autres charges."
            data={graphiquesCharges}
          />

          {/* COMPOSITION DES CHARGES */}
          <Card>
            <CardHeader>
              <CardTitle>
                Composition des charges d'exploitation
              </CardTitle>

              <CardDescription>
                Catégories utilisées pour les deux budgets.
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
                        categories: evaluation.autresCategories ?? [],
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
              <CardTitle>
                Interprétation des résultats
              </CardTitle>

              <CardDescription>
                Analyse automatique des écarts entre
                les prévisions et les données constatées.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {liste(evaluation.interpretations).map(
                (interpretation, index) => (
                  <div
                    key={index}
                    className="rounded-lg border p-4 text-sm leading-relaxed"
                  >
                    {interpretation}
                  </div>
                )
              )}

              {amortissements && (
                <p className="rounded-lg border p-4 text-sm">
                  Dotations aux amortissements constatées :{" "}
                  <strong>
                    {formatValeur(
                      amortissements.constate,
                      "MGA"
                    )}
                  </strong>
                  . Dotations prévisionnelles :{" "}
                  <strong>
                    {formatValeur(
                      amortissements.prevision,
                      "MGA"
                    )}
                  </strong>
                  . Erreur relative :{" "}
                  <strong>
                    {formatPourcentage(
                      amortissements.erreurPourcentage
                    )}
                  </strong>.
                </p>
              )}

              <p className="text-xs text-muted-foreground">
                Les résultats opérationnels et marges
                sont fournis par le backend. Leur cohérence
                avec les regroupements de charges doit
                être vérifiée dans le moteur budgétaire.
              </p>
            </CardContent>
          </Card>

        </>
      )}
    </div>
  )
}

// =====================================================
// GRAPHIQUE RÉUTILISABLE
// =====================================================

function GraphiqueEvaluation({
  titre,
  description,
  data,
}: {
  titre: string
  description: string
  data: {
    nom: string
    Constaté: number | null
    Prévision: number | null
  }[]
}) {
  if (!data.length) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>{titre}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="h-[360px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: 10,
                bottom: 80,
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
                height={100}
                tick={{ fontSize: 11 }}
              />

              <YAxis
                tickFormatter={value =>
                  `${(value / 1_000_000_000).toFixed(1)} Md`
                }
                width={65}
              />

              <Tooltip
                formatter={value =>
                  value == null
                    ? "Non disponible"
                    : `${formatNombre(Number(value))} MGA`
                }
              />

              <Legend />

              <Bar
                dataKey="Constaté"
                fill="#64748b"
                radius={[4, 4, 0, 0]}
              />

              <Bar
                dataKey="Prévision"
                fill="#93c5fd"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
