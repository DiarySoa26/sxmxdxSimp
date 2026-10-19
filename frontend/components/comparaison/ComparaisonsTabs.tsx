// "use client"

// import { useState } from "react"
// import {
//   GitCompareArrows,
//   CalendarRange,
//   ChartNoAxesCombined,
//   Target
// } from "lucide-react"

// import ComparaisonHistorique from "./ComparaisonHistorique"
// import ComparaisonProspective from "./ComparaisonProspective"
// import ComparaisonCoherence from "./ComparaisonCoherence"

// const tabs = [
//   {
//     id: "historique",
//     label: "Historique",
//     icon: CalendarRange
//   },
//   {
//     id: "prospective",
//     label: "Prospective",
//     icon: ChartNoAxesCombined
//   },
//   {
//     id: "coherence",
//     label: "Cohérence budgétaire",
//     icon: Target
//   }
// ]

// export default function ComparaisonsTabs() {
//   const [active, setActive] = useState("historique")

//   return (
//     <div className="space-y-6 p-4 md:p-6">

//       {/* En-tête */}
//       <div>
//         <h1 className="flex items-center gap-2 text-2xl font-semibold">
//           <GitCompareArrows className="size-6" />
//           Comparaisons budgétaires
//         </h1>

//         <p className="mt-1 text-sm text-muted-foreground">
//           Analyse historique, évolution prospective et cohérence des prévisions.
//         </p>
//       </div>

//       {/* Onglets */}
//       <div
//         role="tablist"
//         aria-label="Méthodes de comparaison"
//         className="flex w-fit max-w-full flex-wrap gap-1 rounded-lg bg-muted p-1"
//       >
//         {tabs.map(item => {
//           const Icon = item.icon

//           return (
//             <button
//               key={item.id}
//               type="button"
//               role="tab"
//               aria-selected={active === item.id}
//               onClick={() => setActive(item.id)}
//               className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm transition-colors ${
//                 active === item.id
//                   ? "bg-background font-medium shadow-sm"
//                   : "text-muted-foreground hover:text-foreground"
//               }`}
//             >
//               <Icon className="size-4" />
//               {item.label}
//             </button>
//           )
//         })}
//       </div>

//       {/* Contenu */}
//       <div
//         role="tabpanel"
//         aria-label={tabs.find(t => t.id === active)?.label}
//       >
//         {active === "historique" && (
//           <ComparaisonHistorique />
//         )}

//         {active === "prospective" && (
//           <ComparaisonProspective />
//         )}

//         {active === "coherence" && (
//           <ComparaisonCoherence />
//         )}
//       </div>

//     </div>
//   )
// }




"use client"

import { useEffect, useRef, useState } from "react"
import {
  GitCompareArrows,
  CalendarRange,
  ChartNoAxesCombined,
  Target,
  Loader2
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
] as const

type TabId = (typeof tabs)[number]["id"]

export default function ComparaisonsTabs() {
  const [active, setActive] = useState<TabId>("historique")
  const [loading, setLoading] = useState(false)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const changerOnglet = (nouvelOnglet: TabId) => {
    if (nouvelOnglet === active || loading) return

    setLoading(true)
    setActive(nouvelOnglet)

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      setLoading(false)
      timerRef.current = null
    }, 2000)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const ongletActif = tabs.find(item => item.id === active)

  return (
    <div className="relative min-h-[500px] space-y-6 p-4 md:p-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <GitCompareArrows className="size-6" />
          Comparaisons budgétaires
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Analyse historique, évolution prospective et cohérence des prévisions.
        </p>
      </div>

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
              disabled={loading}
              onClick={() => changerOnglet(item.id)}
              className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm transition-colors disabled:cursor-not-allowed ${
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

      <div
        role="tabpanel"
        aria-label={ongletActif?.label}
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

      {loading && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/30 backdrop-blur-[1px]"
          role="status"
          aria-live="polite"
          aria-label="Chargement des comparaisons budgétaires"
        >
          <div className="flex flex-col items-center gap-5 rounded-2xl border border-border/20 bg-background/20 px-10 py-8 shadow-sm backdrop-blur-[2px]">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
              <Loader2 className="size-9 animate-spin text-primary" />
            </div>

            <div className="space-y-2 text-center">
              <h3 className="text-base font-semibold">
                Chargement des comparaisons budgétaires
              </h3>

              <p className="text-sm text-muted-foreground">
                Actualisation de l'onglet {ongletActif?.label}...
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="size-2 animate-pulse rounded-full bg-primary" />
              <span className="size-2 animate-pulse rounded-full bg-primary [animation-delay:200ms]" />
              <span className="size-2 animate-pulse rounded-full bg-primary [animation-delay:400ms]" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
