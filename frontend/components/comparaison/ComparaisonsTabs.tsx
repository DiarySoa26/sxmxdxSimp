// "use client"

// import { useState } from "react"
// import { GitCompareArrows, CalendarRange, ChartNoAxesCombined, Target } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import ComparaisonHistorique from "./ComparaisonHistorique"
// import ComparaisonProspective from "./ComparaisonProspective"
// import ComparaisonCoherence from "./ComparaisonCoherence"

// const tabs = [
//   { id: "historique", label: "Historique", icon: CalendarRange },
//   { id: "prospective", label: "Prospective", icon: ChartNoAxesCombined },
//   { id: "coherence", label: "Cohérence budgétaire", icon: Target },
// ]

// export default function ComparaisonsTabs() {
//   const [active, setActive] = useState("historique")
//   return <div className="space-y-6">
//     <div><h1 className="flex items-center gap-2 text-2xl font-semibold"><GitCompareArrows className="h-6 w-6" />Comparaisons budgétaires</h1><p className="mt-1 text-sm text-muted-foreground">Analyse historique, évolution prospective et cohérence des prévisions.</p></div>
//     <div role="tablist" aria-label="Méthodes de comparaison" className="flex flex-wrap gap-2 rounded-lg border bg-muted/30 p-2">
//       {tabs.map(({ id, label, icon: Icon }) => <Button key={id} role="tab" aria-selected={active === id} variant={active === id ? "default" : "ghost"} size="sm" onClick={() => setActive(id)} className="gap-2"><Icon className="h-4 w-4" />{label}</Button>)}
//     </div>
//     <div role="tabpanel" aria-label={tabs.find(t => t.id === active)?.label}>
//       {active === "historique" && <ComparaisonHistorique />}
//       {active === "prospective" && <ComparaisonProspective />}
//       {active === "coherence" && <ComparaisonCoherence />}
//     </div>
//   </div>
// }





"use client"

import { useState } from "react"
import {
  GitCompareArrows,
  CalendarRange,
  ChartNoAxesCombined,
  Target
} from "lucide-react"

import ComparaisonHistorique from "./ComparaisonHistorique"
import ComparaisonProspective from "./ComparaisonProspective"
import ComparaisonCoherence from "./ComparaisonCoherence"

const tabs = [
  {
    id: "historique",
    label: "Historique",
    icon: CalendarRange
  },
  {
    id: "prospective",
    label: "Prospective",
    icon: ChartNoAxesCombined
  },
  {
    id: "coherence",
    label: "Cohérence budgétaire",
    icon: Target
  }
]

export default function ComparaisonsTabs() {
  const [active, setActive] = useState("historique")

  return (
    <div className="space-y-6 p-4 md:p-6">

      {/* En-tête */}
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <GitCompareArrows className="size-6" />
          Comparaisons budgétaires
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Analyse historique, évolution prospective et cohérence des prévisions.
        </p>
      </div>

      {/* Onglets */}
      <div
        role="tablist"
        aria-label="Méthodes de comparaison"
        className="flex w-fit max-w-full flex-wrap gap-1 rounded-lg bg-muted p-1"
      >
        {tabs.map(item => {
          const Icon = item.icon

          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active === item.id}
              onClick={() => setActive(item.id)}
              className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm transition-colors ${
                active === item.id
                  ? "bg-background font-medium shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {item.label}
            </button>
          )
        })}
      </div>

      {/* Contenu */}
      <div
        role="tabpanel"
        aria-label={tabs.find(t => t.id === active)?.label}
      >
        {active === "historique" && (
          <ComparaisonHistorique />
        )}

        {active === "prospective" && (
          <ComparaisonProspective />
        )}

        {active === "coherence" && (
          <ComparaisonCoherence />
        )}
      </div>

    </div>
  )
}
