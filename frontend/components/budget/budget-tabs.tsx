"use client"

import {
  Loader2,
} from "lucide-react"

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


// ======================================================
// TYPE
// ======================================================

type OngletBudget =
  | "charges"
  | "exportations"
  | "frais-export"
  | "production"
  | "employes"
  | "budget"


type BudgetTabsProps = {
  value: OngletBudget

  onValueChange: (
    value: OngletBudget
  ) => void

  data: any[]

  loading: boolean
}


// ======================================================
// ONGLETS
// ======================================================

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
      "",
  },
]


// ======================================================
// COMPONENT
// ======================================================

export default function BudgetTabs({
  value,
  onValueChange,
  data,
  loading,
}: BudgetTabsProps) {

  // ====================================================
  // BASE UI : STRING | NULL
  // ====================================================

  function changerOnglet(
    nouvelleValeur:
      string | null
  ) {
    if (
      nouvelleValeur === null
    ) {
      return
    }

    if (
      !estOngletBudget(
        nouvelleValeur
      )
    ) {
      return
    }

    onValueChange(
      nouvelleValeur
    )
  }


  // ====================================================
  // TABLEAU CORRESPONDANT
  // ====================================================

  function afficherTableau(
    onglet: OngletBudget
  ) {
    switch (onglet) {

      case "charges":
        return (
          <ChargesTable
            data={data}
          />
        )

      case "exportations":
        return (
          <ExportationsTable
            data={data}
          />
        )

      case "frais-export":
        return (
          <FraisExportTable
            data={data}
          />
        )

      case "production":
        return (
          <ProductionTable
            data={data}
          />
        )

      case "employes":
        return (
          <EmployesTable
            data={data}
          />
        )

      case "budget":
        return (
          <BudgetTable
            data={data}
          />
        )

      default:
        return null
    }
  }


  return (
    <Tabs
      value={value}
      onValueChange={
        changerOnglet
      }
      className="w-full"
    >

      {/* ============================================== */}
      {/* NAVIGATION */}
      {/* ============================================== */}

      <div className="overflow-x-auto">

        <TabsList className="mb-6 h-auto w-max min-w-full justify-start">

          {onglets.map(
            (onglet) => (

              <TabsTrigger
                key={
                  onglet.value
                }
                value={
                  onglet.value
                }
              >
                {onglet.label}
              </TabsTrigger>

            )
          )}

        </TabsList>

      </div>


      {/* ============================================== */}
      {/* CONTENU */}
      {/* ============================================== */}

      {onglets.map(
        (onglet) => (

          <TabsContent
            key={
              onglet.value
            }
            value={
              onglet.value
            }
            className="mt-0"
          >

            <div className="mb-4">

              <h3 className="text-lg font-semibold">
                {onglet.label}
              </h3>

              <p className="text-sm text-muted-foreground">
                {
                  onglet.description
                }
              </p>

            </div>


            {loading ? (

              <div className="flex min-h-[220px] items-center justify-center">

                <div className="flex items-center gap-2 text-sm text-muted-foreground">

                  <Loader2 className="h-5 w-5 animate-spin" />

                  Chargement des données...

                </div>

              </div>

            ) : (

              afficherTableau(
                onglet.value
              )

            )}

          </TabsContent>

        )
      )}

    </Tabs>
  )
}


// ======================================================
// VERIFICATION ONGLET
// ======================================================

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
  ].includes(value)

}