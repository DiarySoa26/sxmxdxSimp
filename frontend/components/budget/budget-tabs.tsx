// "use client"

// import { Loader2 } from "lucide-react"

// import {
//   Tabs,
//   TabsContent,
//   TabsList,
//   TabsTrigger,
// } from "@/components/ui/tabs"

// import ChargesTable from "./tables/charges-table"
// import FraisExportTable from "./tables/frais-export-table"
// import ExportationsTable from "./tables/exportations-table"
// import ProductionTable from "./tables/production-table"
// import EmployesTable from "./tables/employes-table"
// import BudgetTable from "./tables/budget-table"
// import AmortissementsTable from "./tables/AmortissementsTable"
// import CompteResultatTable from "./tables/CompteResultatTable"


// export type OngletBudget =
//   | "charges"
//   | "exportations"
//   | "frais-export"
//   | "production"
//   | "employes"
//   | "budget"
//   | "amortissements"
//   | "compte-resultat"

// type BudgetTabsProps = {
//   value: OngletBudget

//   onValueChange: (
//     value: OngletBudget
//   ) => void

//   data: any[]

//   // Données brutes des charges du même exercice
//   chargesData: any[]

//   loading: boolean

//   // Chargement des charges, si effectué séparément
//   loadingCharges?: boolean
// }


// const onglets: {
//   value: OngletBudget
//   label: string
//   description: string
// }[] = [
//   {
//     value: "charges",
//     label: "Charges",
//     description:
//       "Charges liées à l'exercice sélectionné.",
//   },
//   {
//     value: "exportations",
//     label: "Exportations",
//     description:
//       "Exportations réalisées durant l'exercice.",
//   },
//   {
//     value: "frais-export",
//     label: "Frais export",
//     description:
//       "Frais liés aux opérations d'exportation.",
//   },
//   {
//     value: "production",
//     label: "Production",
//     description:
//       "Production prévue et production réalisée.",
//   },
//   {
//     value: "employes",
//     label: "Employés",
//     description:
//       "Informations salariales des employés.",
//   },
//   {
//     value: "budget",
//     label: "Budget",
//     description:
//       "Synthèse budgétaire de l'exercice sélectionné.",
//   },
//   {
//     value: "amortissements",
//     label: "Amortissements",
//     description:
//       "Détail des dotations aux amortissements, avec les montants mensuels et le total annuel.",
//   },
//   {
//     value: "compte-resultat",
//     label: "Compte de résultat",
//     description:
//       "Présentation mensuelle et annuelle des produits, charges et résultats de l'exercice.",
//   },
// ]


// export default function BudgetTabs({
//   value,
//   onValueChange,
//   data,
//   chargesData,
//   loading,
//   loadingCharges = false,
// }: BudgetTabsProps) {


//   function changerOnglet(
//     nouvelleValeur: string | null
//   ) {
//     if (nouvelleValeur === null) {
//       return
//     }

//     if (!estOngletBudget(nouvelleValeur)) {
//       return
//     }

//     if (nouvelleValeur === value) {
//       return
//     }

//     onValueChange(nouvelleValeur)
//   }

//   // ====================================================
//   // TABLEAU CORRESPONDANT
//   // ====================================================

//   function afficherTableau(
//     onglet: OngletBudget
//   ) {
//     switch (onglet) {

//       case "charges":
//         return (
//           <ChargesTable
//             data={data}
//           />
//         )

//       case "exportations":
//         return (
//           <ExportationsTable
//             data={data}
//           />
//         )

//       case "frais-export":
//         return (
//           <FraisExportTable
//             data={data}
//           />
//         )

//       case "production":
//         return (
//           <ProductionTable
//             data={data}
//           />
//         )

//       case "employes":
//         return (
//           <EmployesTable
//             data={data}
//           />
//         )

//       case "budget":
//         return (
//           <BudgetTable
//             data={data}
//           />
//         )

//       case "amortissements":
//         return (
//           <AmortissementsTable
//             data={data}
//           />
//         )

//       case "compte-resultat":
//         return (
//           <CompteResultatTable
//             data={data}
//             charges={chargesData}
//           />
//         )

//       default:
//         return null
//     }
//   }


//   return (
//     <Tabs
//       value={value}
//       onValueChange={changerOnglet}
//       className="w-full"
//     >

//       {/* NAVIGATION */}

//       <div className="w-full overflow-x-auto">

//         <TabsList className="mb-6 h-auto w-max min-w-full justify-start gap-1">

//           {onglets.map(onglet => (

//             <TabsTrigger
//               key={onglet.value}
//               value={onglet.value}
//               className="whitespace-nowrap px-4 py-2"
//             >
//               {onglet.label}
//             </TabsTrigger>

//           ))}

//         </TabsList>

//       </div>

//       {/* CONTENU */}

//       {onglets.map(onglet => {

//         const chargement =
//           loading ||
//           (
//             onglet.value === "compte-resultat" &&
//             loadingCharges
//           )

//         return (
//           <TabsContent
//             key={onglet.value}
//             value={onglet.value}
//             className="mt-0"
//           >

//             {/* TITRE ET DESCRIPTION */}

//             <div className="mb-4 space-y-1">

//               <h3 className="text-lg font-semibold">
//                 {onglet.label}
//               </h3>

//               <p className="text-sm text-muted-foreground">
//                 {onglet.description}
//               </p>

//             </div>

//             {/* CHARGEMENT */}

//             {chargement ? (

//               <div className="flex min-h-[220px] items-center justify-center">

//                 <div className="flex items-center gap-2 text-sm text-muted-foreground">

//                   <Loader2 className="h-5 w-5 animate-spin" />

//                   <span>
//                     Chargement des données...
//                   </span>

//                 </div>

//               </div>

//             ) : (

//               afficherTableau(onglet.value)

//             )}

//           </TabsContent>
//         )
//       })}

//     </Tabs>
//   )
// }

// function estOngletBudget(
//   value: string
// ): value is OngletBudget {

//   return [
//     "charges",
//     "exportations",
//     "frais-export",
//     "production",
//     "employes",
//     "budget",
//     "amortissements",
//     "compte-resultat",
//   ].includes(value)
// }







"use client"

import { Loader2 } from "lucide-react"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import ChargesTable from "./tables/charges-table"
import FraisExportTable from "./tables/frais-export-table"
import ExportationsTable from "./tables/exportations-table"
import ProductionTable from "./tables/production-table"
import EmployesTable from "./tables/employes-table"
import BudgetTable from "./tables/budget-table"
import AmortissementsTable from "./tables/AmortissementsTable"
import CompteResultatTable from "./tables/CompteResultatTable"

export type OngletBudget =
  | "charges"
  | "exportations"
  | "frais-export"
  | "production"
  | "employes"
  | "budget"
  | "amortissements"
  | "compte-resultat"

type BudgetTabsProps = {
  value: OngletBudget
  onValueChange: (value: OngletBudget) => void
  data: any[]
  chargesData: any[]
  fraisExportData: any[]
  loading: boolean
  loadingCharges?: boolean
  loadingFraisExport?: boolean
}

const onglets: {
  value: OngletBudget
  label: string
  description: string
}[] = [
  {
    value: "charges",
    label: "Charges",
    description:
      "Charges liées à l'exercice sélectionné.",
  },
  {
    value: "exportations",
    label: "Exportations",
    description:
      "Exportations réalisées durant l'exercice.",
  },
  {
    value: "frais-export",
    label: "Frais export",
    description:
      "Frais liés aux opérations d'exportation.",
  },
  {
    value: "production",
    label: "Production",
    description:
      "Production prévue et production réalisée.",
  },
  {
    value: "employes",
    label: "Employés",
    description:
      "Informations salariales des employés.",
  },
  {
    value: "budget",
    label: "Budget",
    description:
      "Synthèse budgétaire de l'exercice sélectionné.",
  },
  {
    value: "amortissements",
    label: "Amortissements",
    description:
      "Détail des dotations aux amortissements, avec les montants mensuels et le total annuel.",
  },
  {
    value: "compte-resultat",
    label: "Compte de résultat",
    description:
      "Présentation mensuelle et annuelle des produits, charges et résultats de l'exercice.",
  },
]

export default function BudgetTabs({
  value,
  onValueChange,
  data,
  chargesData,
  fraisExportData,
  loading,
  loadingCharges = false,
  loadingFraisExport = false,
}: BudgetTabsProps) {

  function changerOnglet(
    nouvelleValeur: string | null
  ) {
    if (nouvelleValeur === null) return

    if (!estOngletBudget(nouvelleValeur)) {
      return
    }

    if (nouvelleValeur === value) return

    onValueChange(nouvelleValeur)
  }

  // ====================================================
  // AFFICHER LE TABLEAU CORRESPONDANT
  // ====================================================

  function afficherTableau(
    onglet: OngletBudget
  ) {
    switch (onglet) {

      case "charges":
        return (
          <ChargesTable data={data} />
        )

      case "exportations":
        return (
          <ExportationsTable data={data} />
        )

      case "frais-export":
        return (
          <FraisExportTable data={data} />
        )

      case "production":
        return (
          <ProductionTable data={data} />
        )

      case "employes":
        return (
          <EmployesTable data={data} />
        )

      case "budget":
        return (
          <BudgetTable data={data} />
        )

      case "amortissements":
        return (
          <AmortissementsTable data={data} />
        )

      case "compte-resultat":
        return (
          <CompteResultatTable
            data={data}
            charges={chargesData}
            fraisExport={fraisExportData}
          />
        )

      default:
        return null
    }
  }

  // ====================================================
  // AFFICHAGE
  // ====================================================

  return (
    <Tabs
      value={value}
      onValueChange={changerOnglet}
      className="w-full"
    >

      {/* NAVIGATION */}

      <div className="w-full overflow-x-auto">

        <TabsList className="mb-6 h-auto w-max min-w-full justify-start gap-1">

          {onglets.map(onglet => (

            <TabsTrigger
              key={onglet.value}
              value={onglet.value}
              className="whitespace-nowrap px-4 py-2"
            >
              {onglet.label}
            </TabsTrigger>

          ))}

        </TabsList>

      </div>

      {/* CONTENU */}

      {onglets.map(onglet => {

        const chargement =
          loading ||
          (
            onglet.value === "compte-resultat" &&
            (
              loadingCharges ||
              loadingFraisExport
            )
          )

        return (
          <TabsContent
            key={onglet.value}
            value={onglet.value}
            className="mt-0"
          >

            {/* TITRE ET DESCRIPTION */}

            <div className="mb-4 space-y-1">

              <h3 className="text-lg font-semibold">
                {onglet.label}
              </h3>

              <p className="text-sm text-muted-foreground">
                {onglet.description}
              </p>

            </div>

            {/* CHARGEMENT */}

            {chargement ? (

              <div className="flex min-h-[220px] items-center justify-center">

                <div className="flex items-center gap-2 text-sm text-muted-foreground">

                  <Loader2 className="h-5 w-5 animate-spin" />

                  <span>
                    Chargement des données...
                  </span>

                </div>

              </div>

            ) : (

              afficherTableau(onglet.value)

            )}

          </TabsContent>
        )
      })}

    </Tabs>
  )
}

// ====================================================
// VALIDATION DES ONGLETS
// ====================================================

function estOngletBudget(
  value: string
): value is OngletBudget {

  return [
    "charges",
    "exportations",
    "frais-export",
    "production",
    "employes",
    "budget",
    "amortissements",
    "compte-resultat",
  ].includes(value)
}
