
// "use client"

// import { useEffect, useState } from "react"
// import {
//   GitCompareArrows,
//   Loader2,
//   TrendingUp,
//   AlertCircle,
//   BrainCircuit,
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
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
// } from "recharts"

// import {
//   getBudgetsProspectifs,
//   getPrevisionsProspectives,
//   comparerProspective,
// } from "@/services/comparaison-prospective-service"

// const formatNombre = (valeur) =>
//   new Intl.NumberFormat("fr-FR", {
//     maximumFractionDigits: 0,
//   }).format(Number(valeur ?? 0))

// const formatValeur = (valeur, unite) => {
//   if (valeur == null) return "—"

//   if (unite === "POINT") {
//     return `${(Number(valeur) * 100).toFixed(2)} %`
//   }

//   return `${formatNombre(valeur)} MGA`
// }

// const formatEvolution = (valeur, unite) => {
//   if (valeur == null) return "—"

//   return `${Number(valeur) > 0 ? "+" : ""}${Number(valeur).toFixed(2)} ${
//     unite === "POINT" ? "pts" : "%"
//   }`
// }

// export default function ComparaisonProspective() {
//   const [budgets, setBudgets] = useState([])
//   const [previsions, setPrevisions] = useState([])

//   const [anneeBudget, setAnneeBudget] = useState("")
//   const [anneePrevision, setAnneePrevision] = useState("")

//   const [resultat, setResultat] = useState(null)
//   const [loading, setLoading] = useState(false)
//   const [loadingAnnees, setLoadingAnnees] = useState(true)
//   const [erreur, setErreur] = useState("")

//   useEffect(() => {
//     let actif = true

//     async function chargerAnnees() {
//       try {
//         const [listeBudgets, listePrevisions] = await Promise.all([
//           getBudgetsProspectifs(),
//           getPrevisionsProspectives(),
//         ])

//         if (!actif) return

//         setBudgets(listeBudgets)
//         setPrevisions(listePrevisions)

//         if (listeBudgets.length) {
//           setAnneeBudget(String(listeBudgets[0]))
//         }

//         if (listePrevisions.length) {
//           setAnneePrevision(String(listePrevisions[0]))
//         }
//       } catch (err) {
//         if (actif) {
//           setErreur(err.message || "Erreur de chargement")
//         }
//       } finally {
//         if (actif) setLoadingAnnees(false)
//       }
//     }

//     chargerAnnees()

//     return () => {
//       actif = false
//     }
//   }, [])

//   const comparer = async () => {
//     if (!anneeBudget || !anneePrevision || loading) return

//     setLoading(true)
//     setErreur("")
//     setResultat(null)

//     try {
//       const data = await comparerProspective(
//         Number(anneeBudget),
//         Number(anneePrevision)
//       )

//       setResultat(data)
//     } catch (err) {
//       setErreur(err.message || "Comparaison impossible")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const indicateurs = resultat?.indicateurs ?? []

//   const graphiques = indicateurs
//     .filter((i) => i.unite === "MGA")
//     .map((i) => ({
//       nom: i.libelle,
//       budget: Number(i.valeur1 ?? 0),
//       prevision: Number(i.valeur2 ?? 0),
//     }))

//   return (
//     <div className="space-y-6">
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <GitCompareArrows className="h-5 w-5" />
//             Comparaison prospective
//           </CardTitle>
//           <CardDescription>
//             Comparaison entre un budget planifié et une prévision
//             budgétaire générée par le Machine Learning.
//           </CardDescription>
//         </CardHeader>

//         <CardContent className="space-y-4">
//           <div className="grid gap-4 md:grid-cols-3 md:items-end">
//             <div className="space-y-2">
//               <label className="text-sm font-medium">
//                 Budget de référence
//               </label>

//               <Select
//                 value={anneeBudget}
//                 onValueChange={(value) => {
//                   setAnneeBudget(value)
//                   setResultat(null)
//                 }}
//                 disabled={loadingAnnees || loading}
//               >
//                 <SelectTrigger className="w-full">
//                   <SelectValue placeholder="Sélectionner l'année" />
//                 </SelectTrigger>

//                 <SelectContent>
//                   {budgets.map((annee) => (
//                     <SelectItem key={annee} value={String(annee)}>
//                       Budget {annee}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="space-y-2">
//               <label className="text-sm font-medium">
//                 Année prévisionnelle
//               </label>

//               <Select
//                 value={anneePrevision}
//                 onValueChange={(value) => {
//                   setAnneePrevision(value)
//                   setResultat(null)
//                 }}
//                 disabled={loadingAnnees || loading}
//               >
//                 <SelectTrigger className="w-full">
//                   <SelectValue placeholder="Sélectionner l'année" />
//                 </SelectTrigger>

//                 <SelectContent>
//                   {previsions.map((annee) => (
//                     <SelectItem key={annee} value={String(annee)}>
//                       Prévision {annee}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <Button
//               onClick={comparer}
//               disabled={
//                 loading ||
//                 loadingAnnees ||
//                 !anneeBudget ||
//                 !anneePrevision ||
//                 Number(anneePrevision) <= Number(anneeBudget)
//               }
//               className="w-full"
//             >
//               {loading ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   Comparaison...
//                 </>
//               ) : (
//                 <>
//                   <GitCompareArrows className="mr-2 h-4 w-4" />
//                   Comparer
//                 </>
//               )}
//             </Button>
//           </div>

//           {erreur && (
//             <div
//               role="alert"
//               className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
//             >
//               <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
//               <span>{erreur}</span>
//             </div>
//           )}

//           {!loadingAnnees &&
//             (!budgets.length || !previsions.length) && (
//               <p className="text-sm text-muted-foreground">
//                 Aucun budget ou aucune prévision disponible
//                 pour effectuer cette comparaison.
//               </p>
//             )}
//         </CardContent>
//       </Card>

//       {resultat && (
//         <>
//           <div>
//             <h3 className="text-lg font-semibold">
//               Résultats : {resultat.anneeBudget} vs{" "}
//               {resultat.anneePrevision}
//             </h3>
//             <p className="text-sm text-muted-foreground">
//               Budget planifié comparé aux estimations prévisionnelles.
//             </p>
//           </div>

//           <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//             {indicateurs.map((i) => (
//               <Card key={i.code}>
//                 <CardHeader className="pb-2">
//                   <CardDescription>{i.libelle}</CardDescription>
//                   <CardTitle className="text-xl">
//                     {formatValeur(i.valeur2, i.unite)}
//                   </CardTitle>
//                 </CardHeader>

//                 <CardContent className="space-y-2">
//                   <p className="text-xs text-muted-foreground">
//                     Budget : {formatValeur(i.valeur1, i.unite)}
//                   </p>

//                   <div className="flex items-center gap-2">
//                     <TrendingUp className="h-4 w-4 text-muted-foreground" />

//                     <span className="text-sm font-medium">
//                       {formatEvolution(
//                         i.evolutionPourcentage,
//                         i.unite
//                       )}
//                     </span>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>

//           <Card>
//             <CardHeader>
//               <CardTitle>Analyse graphique</CardTitle>
//               <CardDescription>
//                 Comparaison des montants en MGA
//               </CardDescription>
//             </CardHeader>

//             <CardContent>
//               <div className="h-[360px] w-full">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart
//                     data={graphiques}
//                     margin={{ top: 10, right: 20, left: 15, bottom: 65 }}
//                   >
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis
//                       dataKey="nom"
//                       angle={-25}
//                       textAnchor="end"
//                       height={90}
//                       interval={0}
//                       tick={{ fontSize: 11 }}
//                     />
//                     <YAxis
//                       width={85}
//                       tickFormatter={(v) =>
//                         new Intl.NumberFormat("fr-FR", {
//                           notation: "compact",
//                           maximumFractionDigits: 1,
//                         }).format(v)
//                       }
//                     />
//                     <Tooltip
//                       formatter={(value) => `${formatNombre(value)} MGA`}
//                     />
//                     <Legend />
//                     <Bar
//                       dataKey="budget"
//                       name={`Budget ${resultat.anneeBudget}`}
//                       fill="#64748b"
//                       radius={[4, 4, 0, 0]}
//                     />
//                     <Bar
//                       dataKey="prevision"
//                       name={`Prévision ${resultat.anneePrevision}`}
//                       fill="#2563eb"
//                       radius={[4, 4, 0, 0]}
//                     />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Tableau comparatif</CardTitle>
//             </CardHeader>

//             <CardContent>
//               <div className="overflow-x-auto">
//                 <table className="w-full text-sm">
//                   <thead>
//                     <tr className="border-b text-left">
//                       <th className="p-3">Indicateur</th>
//                       <th className="p-3 text-right">
//                         Budget {resultat.anneeBudget}
//                       </th>
//                       <th className="p-3 text-right">
//                         Prévision {resultat.anneePrevision}
//                       </th>
//                       <th className="p-3 text-right">Écart</th>
//                       <th className="p-3 text-right">Évolution</th>
//                     </tr>
//                   </thead>

//                   <tbody>
//                     {indicateurs.map((i) => (
//                       <tr key={i.code} className="border-b">
//                         <td className="p-3 font-medium">{i.libelle}</td>
//                         <td className="p-3 text-right">
//                           {formatValeur(i.valeur1, i.unite)}
//                         </td>
//                         <td className="p-3 text-right">
//                           {formatValeur(i.valeur2, i.unite)}
//                         </td>
//                         <td className="p-3 text-right">
//                           {i.unite === "POINT"
//                             ? `${(Number(i.ecart) * 100).toFixed(2)} pts`
//                             : formatValeur(i.ecart, i.unite)}
//                         </td>
//                         <td className="p-3 text-right">
//                           {formatEvolution(
//                             i.evolutionPourcentage,
//                             i.unite
//                           )}
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
//               <CardTitle className="flex items-center gap-2">
//                 <BrainCircuit className="h-5 w-5" />
//                 Interprétation automatique
//               </CardTitle>
//               <CardDescription>
//                 Synthèse des évolutions budgétaires
//               </CardDescription>
//             </CardHeader>

//             <CardContent>
//               <ul className="space-y-3">
//                 {(resultat.interpretations ?? []).map((texte, index) => (
//                   <li
//                     key={index}
//                     className="rounded-lg border p-3 text-sm"
//                   >
//                     {texte}
//                   </li>
//                 ))}
//               </ul>
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
}

const number = (value: unknown, digits = 0) =>
  new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: digits,
  }).format(Number(value ?? 0))

const evolution = (i: Indicateur) =>
  i.evolutionPourcentage == null
    ? "Non calculable"
    : `${Number(i.evolutionPourcentage) > 0 ? "+" : ""}${number(
        i.evolutionPourcentage,
        2
      )} ${i.unite === "POINT" ? "pts" : "%"}`

const valeur = (
  n: number | string | null,
  point: boolean
) =>
  n == null
    ? "—"
    : `${number(
        Number(n) * (point ? 100 : 1),
        point ? 2 : 0
      )}${point ? " %" : ""}`

export default function ComparaisonProspective() {
  const [budgets, setBudgets] = useState<string[]>([])
  const [previsions, setPrevisions] = useState<string[]>([])

  const [anneeBudget, setAnneeBudget] = useState("")
  const [anneePrevision, setAnneePrevision] = useState("")

  const [resultat, setResultat] = useState<Comparaison | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialisation, setInitialisation] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let actif = true

    Promise.all([
      getBudgetsProspectifs(),
      getPrevisionsProspectives(),
    ])
      .then(([b, p]) => {
        if (!actif) return

        const bs = [...b]
          .map(String)
          .sort((a, b) => Number(a) - Number(b))

        const ps = [...p]
          .map(String)
          .sort((a, b) => Number(a) - Number(b))

        setBudgets(bs)
        setPrevisions(ps)

        const paire = [...bs]
          .reverse()
          .flatMap((budget) =>
            ps
              .filter(
                (prevision) =>
                  Number(prevision) > Number(budget)
              )
              .map((prevision) => ({
                budget,
                prevision,
              }))
          )[0]

        setAnneeBudget(paire?.budget ?? bs.at(-1) ?? "")
        setAnneePrevision(paire?.prevision ?? ps[0] ?? "")
      })
      .catch((err) => {
        if (actif) {
          setError(err?.message || "Erreur de chargement")
        }
      })
      .finally(() => {
        if (actif) setInitialisation(false)
      })

    return () => {
      actif = false
    }
  }, [])

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
      const data = await comparerProspective(
        Number(anneeBudget),
        Number(anneePrevision)
      )

      setResultat(data)
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Comparaison impossible"
      )
    } finally {
      setLoading(false)
    }
  }

  const indicateurs = resultat?.indicateurs ?? []

  const graphique = indicateurs
    .filter((i) => i.unite === "MGA")
    .map((i) => ({
      nom:
        (
          {
            CA_EXPORT: "CA export",
            CHARGES: "Charges",
            FRAIS_EXPORT: "Frais export",
            MASSE_SALARIALE: "Salaires",
            RESULTAT: "Résultat",
          } as Record<string, string>
        )[i.code] || i.libelle,
      budget: Number(i.valeur1 ?? 0) / 1e9,
      prevision: Number(i.valeur2 ?? 0) / 1e9,
    }))

  const principaux = [
    {
      label: "Résultat opérationnel",
      item: indicateurs.find((i) => i.code === "RESULTAT"),
    },
    {
      label: "Marge opérationnelle",
      item: indicateurs.find((i) => i.code === "MARGE"),
    },
  ]

  return (
    <div className="space-y-5">
      {/* SÉLECTION DES EXERCICES */}
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
            ].map((field) => (
              <label
                key={field.label}
                className="space-y-2 text-sm font-medium"
              >
                {field.label}

                <select
                  value={field.value}
                  onChange={(e) => {
                    field.setter(e.target.value)
                    setResultat(null)
                  }}
                  className="block h-10 w-full rounded-md border bg-background px-3 font-normal"
                  disabled={initialisation || loading}
                >
                  <option value="">Choisir une année</option>
                  {field.options.map((a) => (
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
                Un budget généré et une prévision sont
                nécessaires.
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
          {/* CARTES DE SYNTHÈSE */}
          <div className="grid gap-4 md:grid-cols-2">
            {principaux.map(
              ({ label, item }) =>
                item && (
                  <Card key={label}>
                    <CardContent className="p-5">
                      <p className="text-sm text-muted-foreground">
                        {label} — évolution
                      </p>

                      <div className="mt-2 flex items-center gap-2 text-2xl font-semibold">
                        {item.evolutionPourcentage == null ? (
                          <Minus className="h-5 w-5" />
                        ) : Number(item.evolutionPourcentage) > 0 ? (
                          <TrendingUp className="h-5 w-5 text-emerald-600" />
                        ) : Number(item.evolutionPourcentage) < 0 ? (
                          <TrendingDown className="h-5 w-5 text-rose-600" />
                        ) : (
                          <Minus className="h-5 w-5" />
                        )}

                        {evolution(item)}
                      </div>
                    </CardContent>
                  </Card>
                )
            )}
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
                      <th className="p-3">Indicateur</th>
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
                    {indicateurs.map((i) => {
                      const point = i.unite === "POINT"

                      return (
                        <tr
                          key={i.code}
                          className="border-b hover:bg-muted/30"
                        >
                          <td className="p-3 font-medium">
                            {i.libelle}
                          </td>

                          <td className="p-3 text-right whitespace-nowrap">
                            {valeur(i.valeur1, point)}
                          </td>

                          <td className="p-3 text-right whitespace-nowrap">
                            {valeur(i.valeur2, point)}
                          </td>

                          <td className="p-3 text-right whitespace-nowrap">
                            {i.ecart == null
                              ? "—"
                              : `${number(
                                  Number(i.ecart) *
                                    (point ? 100 : 1),
                                  point ? 2 : 0
                                )}${point ? " pts" : ""}`}
                          </td>

                          <td className="p-3 text-right whitespace-nowrap">
                            {evolution(i)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                Une augmentation des charges n'est pas
                nécessairement favorable. Les marges sont
                comparées en points de pourcentage.
              </p>
            </CardContent>
          </Card>

          {/* VISUALISATION ANNUELLE */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Visualisation annuelle
              </CardTitle>
              <CardDescription>
                Montants en milliards MGA
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="h-[360px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={graphique}
                    margin={{
                      bottom: 55,
                      left: 8,
                      right: 10,
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
                      height={75}
                      fontSize={11}
                    />

                    <YAxis fontSize={11} />

                    <Tooltip
                      formatter={(v) =>
                        `${number(v, 2)} Md MGA`
                      }
                    />

                    <Legend />

                    <Bar
                      dataKey="budget"
                      name={`Budget ${resultat.anneeBudget}`}
                      fill="#94a3b8"
                      radius={[4, 4, 0, 0]}
                    />

                    <Bar
                      dataKey="prevision"
                      name={`Prévision ${resultat.anneePrevision}`}
                      fill="#7c9fcd"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* INTERPRÉTATION AUTOMATIQUE */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Interprétation automatique
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-2">
              {(resultat.interpretations ?? []).map(
                (texte, index) => (
                  <p
                    key={index}
                    className="rounded-md bg-muted/40 p-3 text-sm"
                  >
                    {texte}
                  </p>
                )
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
