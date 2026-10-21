// "use client"

// import { useEffect, useState } from "react"
// import { ArrowLeftRight, Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react"
// import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts"
// import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { getExercicesComparaison, getComparaisonHistorique } from "@/services/comparaison-service"

// const number = (value, digits = 0) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: digits }).format(Number(value ?? 0))
// const compact = (value) => `${number(Number(value) / 1e9, 2)} Md`

// export default function ComparaisonHistorique() {
//   const [annees, setAnnees] = useState([])
//   const [annee1, setAnnee1] = useState("")
//   const [annee2, setAnnee2] = useState("")
//   const [resultat, setResultat] = useState(null)
//   const [loading, setLoading] = useState(false)
//   const [initialisation, setInitialisation] = useState(true)
//   const [error, setError] = useState("")

//   useEffect(() => {
//     let actif = true
//     getExercicesComparaison().then(data => {
//       if (!actif) return
//       const liste = [...data].sort((a, b) => a - b).map(String)
//       setAnnees(liste)
//       if (liste.length >= 2) { setAnnee1(liste[liste.length - 2]); setAnnee2(liste[liste.length - 1]) }
//     }).catch(err => { if (actif) setError(err.message) }).finally(() => { if (actif) setInitialisation(false) })
//     return () => { actif = false }
//   }, [])

//   async function comparer() {
//     if (!annee1 || !annee2 || annee1 === annee2) return
//     setLoading(true); setError(""); setResultat(null)
//     try { setResultat(await getComparaisonHistorique(annee1, annee2)) }
//     catch (err) { setError(err.message) }
//     finally { setLoading(false) }
//   }

//   const indicateurs = resultat?.indicateurs || []
//   const graphique = indicateurs.filter(i => i.unite === "MGA").map(i => ({
//     nom: ({ CA_EXPORT: "CA export", CHARGES: "Charges", FRAIS_EXPORT: "Frais export", MASSE_SALARIALE: "Salaires", RESULTAT: "Résultat" })[i.code] || i.libelle,
//     annee1: Number(i.valeur1) / 1e9, annee2: Number(i.valeur2) / 1e9,
//   }))
//   const marge = indicateurs.find(i => i.code === "MARGE")
//   const resultatOp = indicateurs.find(i => i.code === "RESULTAT")

//   return <div className="space-y-5">
//     <Card>
//       <CardHeader><CardTitle className="text-lg">Sélection des exercices</CardTitle><CardDescription>Choisissez deux budgets annuels à comparer.</CardDescription></CardHeader>
//       <CardContent className="space-y-3">
//         <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
//           {[{ label: "Exercice de référence", value: annee1, setter: setAnnee1 }, { label: "Exercice comparé", value: annee2, setter: setAnnee2 }].map(field =>
//             <label key={field.label} className="space-y-2 text-sm font-medium">{field.label}
//               <select value={field.value} onChange={e => { field.setter(e.target.value); setResultat(null) }} className="block h-10 w-full rounded-md border bg-background px-3 font-normal" disabled={initialisation}>
//                 <option value="">Choisir une année</option>
//                 {annees.map(a => <option key={a} value={a}>{a}</option>)}
//               </select>
//             </label>
//           )}
//           <Button onClick={comparer} disabled={loading || initialisation || !annee1 || !annee2 || annee1 === annee2}>
//             {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowLeftRight className="mr-2 h-4 w-4" />}Comparer
//           </Button>
//         </div>
//         {annees.length < 2 && !initialisation && !error && <p className="text-sm text-muted-foreground">Au moins deux exercices avec budget sont nécessaires.</p>}
//         {annee1 && annee1 === annee2 && <p className="text-sm text-amber-700">Choisissez deux années différentes.</p>}
//         {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
//       </CardContent>
//     </Card>
//     {resultat && <>
//       <div className="grid gap-4 md:grid-cols-2">
//         {[{ label: "Résultat opérationnel", item: resultatOp, points: false }, { label: "Marge opérationnelle", item: marge, points: true }].map(({ label, item, points }) => item &&
//           <Card key={label}><CardContent className="p-5"><p className="text-sm text-muted-foreground">{label} — évolution</p>
//             <div className="mt-2 flex items-center gap-2 text-2xl font-semibold">
//               {Number(item.evolutionPourcentage) > 0 ? <TrendingUp className="h-5 w-5 text-emerald-600" /> : Number(item.evolutionPourcentage) < 0 ? <TrendingDown className="h-5 w-5 text-rose-600" /> : <Minus className="h-5 w-5" />}
//               {item.evolutionPourcentage == null ? "Non calculable" : `${Number(item.evolutionPourcentage) > 0 ? "+" : ""}${number(item.evolutionPourcentage, 2)} ${points ? "%" : "%"}`}
//             </div></CardContent></Card>
//         )}
//       </div>
//       <Card><CardHeader><CardTitle className="text-lg">Tableau comparatif</CardTitle><CardDescription>Écarts entre {resultat.annee1} et {resultat.annee2} — montants en MGA.</CardDescription></CardHeader>
//         <CardContent><div className="overflow-x-auto"><table className="w-full text-sm">
//           <thead><tr className="border-b bg-muted/40 text-left"><th className="p-3">Indicateur</th><th className="p-3 text-right">{resultat.annee1}</th><th className="p-3 text-right">{resultat.annee2}</th><th className="p-3 text-right">Écart</th><th className="p-3 text-right">Évolution</th></tr></thead>
//           <tbody>{indicateurs.map(i => { const point = i.unite === "POINT"; const f = point ? 100 : 1; return <tr key={i.code} className="border-b hover:bg-muted/30">
//             <td className="p-3 font-medium">{i.libelle}</td><td className="p-3 text-right whitespace-nowrap">{number(Number(i.valeur1) * f, point ? 2 : 0)}{point ? " %" : ""}</td>
//             <td className="p-3 text-right whitespace-nowrap">{number(Number(i.valeur2) * f, point ? 2 : 0)}{point ? " %" : ""}</td>
//             <td className="p-3 text-right whitespace-nowrap">{number(Number(i.ecart) * f, point ? 2 : 0)}{point ? " %" : ""}</td>
//             <td className="p-3 text-right whitespace-nowrap">{i.evolutionPourcentage == null ? "—" : `${Number(i.evolutionPourcentage) > 0 ? "+" : ""}${number(i.evolutionPourcentage, 2)} ${point ? "%" : "%"}`}</td>
//           </tr> })}</tbody>
//         </table>
//         </div>
//         {/* <p className="mt-3 text-xs text-muted-foreground">Une augmentation des charges n'est pas nécessairement favorable. Les marges sont comparées en points de pourcentage.</p> */}
//         </CardContent>
//       </Card>
//       <Card><CardHeader><CardTitle className="text-lg">Visualisation annuelle</CardTitle><CardDescription>Montants en milliards MGA</CardDescription></CardHeader>
//         <CardContent><div className="h-[360px] w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={graphique} margin={{ bottom: 55, left: 8, right: 10 }}>
//           <CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="nom" angle={-25} textAnchor="end" interval={0} height={75} fontSize={11} /><YAxis fontSize={11} />
//           <Tooltip formatter={v => `${number(v, 2)} Md MGA`} /><Legend /><Bar dataKey="annee1" name={String(resultat.annee1)} fill="#94a3b8" radius={[4,4,0,0]} /><Bar dataKey="annee2" name={String(resultat.annee2)} fill="#7c9fcd" radius={[4,4,0,0]} />
//         </BarChart></ResponsiveContainer></div></CardContent>
//       </Card>
//       <Card><CardHeader><CardTitle className="text-lg">Interprétation automatique</CardTitle></CardHeader><CardContent className="space-y-2">
//         {(resultat.interpretations || []).map((s, i) => <p key={i} className="rounded-md bg-muted/40 p-3 text-sm">{s}</p>)}
//       </CardContent></Card>
//     </>}
//   </div>
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
  getExercicesComparaison,
  getComparaisonHistorique,
} from "@/services/comparaison-service"

import {
  getBudgetDetails,
  getExercices,
} from "@/services/budget-details-service"

// ======================================================
// FORMATAGE
// ======================================================

const nombre = (value) => {
  if (value === null || value === undefined || value === "") {
    return 0
  }

  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

const number = (value, digits = 0) =>
  new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: digits,
  }).format(nombre(value))

// ======================================================
// AMORTISSEMENTS
// ======================================================

function calculerTotalAmortissements(lignes) {
  if (!Array.isArray(lignes)) {
    return 0
  }

  return lignes.reduce(
    (total, ligne) => total + nombre(ligne.montant),
    0
  )
}

function trouverExerciceId(exercices, annee) {
  const exercice = exercices.find(
    (e) =>
      String(e.annee_exercice ?? e.annee) ===
      String(annee)
  )

  return exercice?.id_exercice ?? exercice?.id ?? null
}

function creerIndicateurAmortissements(valeur1, valeur2) {
  const ecart = valeur2 - valeur1

  const evolutionPourcentage =
    valeur1 !== 0
      ? (ecart / Math.abs(valeur1)) * 100
      : null

  return {
    code: "AMORTISSEMENTS",
    libelle: "Dotations aux amortissements",
    unite: "MGA",
    valeur1,
    valeur2,
    ecart,
    evolutionPourcentage,
  }
}

// ======================================================
// COMPOSANT
// ======================================================

export default function ComparaisonHistorique() {
  const [annees, setAnnees] = useState([])
  const [exercices, setExercices] = useState([])

  const [annee1, setAnnee1] = useState("")
  const [annee2, setAnnee2] = useState("")

  const [resultat, setResultat] = useState(null)

  const [loading, setLoading] = useState(false)
  const [initialisation, setInitialisation] = useState(true)

  const [error, setError] = useState("")

  // ======================================================
  // CHARGEMENT DES EXERCICES
  // ======================================================

  useEffect(() => {
    let actif = true

    async function chargerExercices() {
      try {
        setInitialisation(true)
        setError("")

        const [
          anneesDisponibles,
          exercicesDisponibles,
        ] = await Promise.all([
          getExercicesComparaison(),
          getExercices(),
        ])

        if (!actif) return

        const liste = (
          Array.isArray(anneesDisponibles)
            ? anneesDisponibles
            : []
        )
          .map(Number)
          .filter(Number.isFinite)
          .sort((a, b) => a - b)
          .map(String)

        setAnnees(liste)

        setExercices(
          Array.isArray(exercicesDisponibles)
            ? exercicesDisponibles
            : []
        )

        if (liste.length >= 2) {
          setAnnee1(liste[liste.length - 2])
          setAnnee2(liste[liste.length - 1])
        }
      } catch (err) {
        if (!actif) return

        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les exercices."
        )
      } finally {
        if (actif) {
          setInitialisation(false)
        }
      }
    }

    void chargerExercices()

    return () => {
      actif = false
    }
  }, [])

  // ======================================================
  // COMPARAISON HISTORIQUE
  // ======================================================

  async function comparer() {
    if (
      !annee1 ||
      !annee2 ||
      annee1 === annee2 ||
      loading
    ) {
      return
    }

    setLoading(true)
    setError("")
    setResultat(null)

    try {
      // 1. Comparaison historique existante
      const comparaison = await getComparaisonHistorique(
        annee1,
        annee2
      )

      if (!comparaison) {
        throw new Error(
          "Aucun résultat de comparaison disponible."
        )
      }

      // 2. Identification des exercices
      const exerciceId1 = trouverExerciceId(
        exercices,
        annee1
      )

      const exerciceId2 = trouverExerciceId(
        exercices,
        annee2
      )

      if (exerciceId1 == null || exerciceId2 == null) {
        throw new Error(
          "Impossible de retrouver les identifiants des exercices."
        )
      }

      // 3. Chargement des amortissements
      const [
        amortissementsAnnee1,
        amortissementsAnnee2,
      ] = await Promise.all([
        getBudgetDetails(
          "amortissements",
          exerciceId1
        ),
        getBudgetDetails(
          "amortissements",
          exerciceId2
        ),
      ])

      // 4. Normalisation
      const lignes1 = Array.isArray(amortissementsAnnee1)
        ? amortissementsAnnee1
        : []

      const lignes2 = Array.isArray(amortissementsAnnee2)
        ? amortissementsAnnee2
        : []

      // 5. Totaux annuels
      const total1 = calculerTotalAmortissements(lignes1)
      const total2 = calculerTotalAmortissements(lignes2)

      // 6. Vérifier la présence de données
      const amortissementsDisponibles =
        lignes1.length > 0 || lignes2.length > 0

      // 7. Indicateurs déjà calculés par Spring Boot
      const indicateurs = Array.isArray(
        comparaison.indicateurs
      )
        ? [...comparaison.indicateurs]
        : []

      // 8. Ajouter ou mettre à jour les amortissements
      if (amortissementsDisponibles) {
        const nouvelIndicateur =
          creerIndicateurAmortissements(total1, total2)

        const indexExistant = indicateurs.findIndex(
          (i) => i.code === "AMORTISSEMENTS"
        )

        if (indexExistant >= 0) {
          indicateurs[indexExistant] = nouvelIndicateur
        } else {
          // Insertion avant le résultat opérationnel
          const indexResultat = indicateurs.findIndex(
            (i) => i.code === "RESULTAT"
          )

          if (indexResultat >= 0) {
            indicateurs.splice(
              indexResultat,
              0,
              nouvelIndicateur
            )
          } else {
            indicateurs.push(nouvelIndicateur)
          }
        }
      } else {
        // Aucun amortissement pour les deux années
        const index = indicateurs.findIndex(
          (i) => i.code === "AMORTISSEMENTS"
        )

        if (index >= 0) {
          indicateurs.splice(index, 1)
        }
      }

      // 9. Résultat final
      setResultat({
        ...comparaison,
        indicateurs,
      })
    } catch (err) {
      console.error(
        "Erreur comparaison historique :",
        err
      )

      setError(
        err instanceof Error
          ? err.message
          : "Impossible de comparer les exercices."
      )
    } finally {
      setLoading(false)
    }
  }

  // ======================================================
  // INDICATEURS
  // ======================================================

  const indicateurs = resultat?.indicateurs || []

  const marge = indicateurs.find(
    (i) => i.code === "MARGE"
  )

  const resultatOp = indicateurs.find(
    (i) => i.code === "RESULTAT"
  )

  const amortissements = indicateurs.find(
    (i) => i.code === "AMORTISSEMENTS"
  )

  // ======================================================
  // GRAPHIQUE
  // ======================================================

  const graphique = indicateurs
    .filter((i) => i.unite === "MGA")
    .map((i) => ({
      nom:
        ({
          CA_EXPORT: "CA export",
          CHARGES: "Charges",
          FRAIS_EXPORT: "Frais export",
          MASSE_SALARIALE: "Salaires",
          AMORTISSEMENTS: "Amortissements",
          RESULTAT: "Résultat",
        })[i.code] || i.libelle,

      annee1: nombre(i.valeur1) / 1e9,
      annee2: nombre(i.valeur2) / 1e9,
    }))

  // ======================================================
  // CARTE EVOLUTION
  // ======================================================

  const cartesEvolution = [
    {
      label: "Résultat opérationnel",
      item: resultatOp,
    },
    {
      label: "Marge opérationnelle",
      item: marge,
    },
    ...(amortissements
      ? [{
          label: "Amortissements",
          item: amortissements,
        }]
      : []),
  ]

  // ======================================================
  // INTERFACE
  // ======================================================

  return (
    <div className="space-y-5">

      {/* SELECTION DES EXERCICES */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Sélection des exercices
          </CardTitle>

          <CardDescription>
            Choisissez deux budgets annuels à comparer.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">

            {[
              {
                label: "Exercice de référence",
                value: annee1,
                setter: setAnnee1,
              },
              {
                label: "Exercice comparé",
                value: annee2,
                setter: setAnnee2,
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
                  <option value="">
                    Choisir une année
                  </option>

                  {annees.map((a) => (
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
                !annee1 ||
                !annee2 ||
                annee1 === annee2
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

          {annees.length < 2 &&
            !initialisation &&
            !error && (
              <p className="text-sm text-muted-foreground">
                Au moins deux exercices avec budget
                sont nécessaires.
              </p>
            )}

          {annee1 && annee1 === annee2 && (
            <p className="text-sm text-amber-700">
              Choisissez deux années différentes.
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

      {/* RESULTATS */}
      {resultat && (
        <>

          {/* CARTES EVOLUTION */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cartesEvolution.map(
              ({ label, item }) => {
                if (!item) return null

                const evolution =
                  item.evolutionPourcentage

                const valeur = nombre(evolution)

                return (
                  <Card key={label}>
                    <CardContent className="p-5">
                      <p className="text-sm text-muted-foreground">
                        {label} — évolution
                      </p>

                      <div className="mt-2 flex items-center gap-2 text-2xl font-semibold">
                        {evolution == null ? (
                          <Minus className="h-5 w-5" />
                        ) : valeur > 0 ? (
                          <TrendingUp className="h-5 w-5 text-emerald-600" />
                        ) : valeur < 0 ? (
                          <TrendingDown className="h-5 w-5 text-rose-600" />
                        ) : (
                          <Minus className="h-5 w-5" />
                        )}

                        {evolution == null
                          ? "Non calculable"
                          : `${
                              valeur > 0 ? "+" : ""
                            }${number(valeur, 2)} %`}
                      </div>
                    </CardContent>
                  </Card>
                )
              }
            )}
          </div>

          {/* TABLEAU COMPARATIF */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Tableau comparatif
              </CardTitle>

              <CardDescription>
                Écarts entre {resultat.annee1} et{" "}
                {resultat.annee2} — montants en MGA.
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
                        {resultat.annee1}
                      </th>

                      <th className="p-3 text-right">
                        {resultat.annee2}
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
                      const point =
                        i.unite === "POINT"

                      const facteur = point ? 100 : 1

                      const evolution =
                        i.evolutionPourcentage

                      const estAmortissement =
                        i.code === "AMORTISSEMENTS"

                      return (
                        <tr
                          key={i.code}
                          className={
                            estAmortissement
                              ? "border-b bg-amber-50/50 hover:bg-amber-50 dark:bg-amber-950/10"
                              : "border-b hover:bg-muted/30"
                          }
                        >
                          <td className="p-3 font-medium">
                            {i.libelle}
                          </td>

                          <td className="whitespace-nowrap p-3 text-right">
                            {number(
                              nombre(i.valeur1) * facteur,
                              point ? 2 : 0
                            )}
                            {point ? " %" : ""}
                          </td>

                          <td className="whitespace-nowrap p-3 text-right">
                            {number(
                              nombre(i.valeur2) * facteur,
                              point ? 2 : 0
                            )}
                            {point ? " %" : ""}
                          </td>

                          <td className="whitespace-nowrap p-3 text-right">
                            {number(
                              nombre(i.ecart) * facteur,
                              point ? 2 : 0
                            )}
                            {point ? " %" : ""}
                          </td>

                          <td className="whitespace-nowrap p-3 text-right">
                            {evolution == null
                              ? "—"
                              : `${
                                  nombre(evolution) > 0
                                    ? "+"
                                    : ""
                                }${number(
                                  evolution,
                                  2
                                )} %`}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* GRAPHIQUE ANNUEL */}
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
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
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
                      dataKey="annee1"
                      name={String(resultat.annee1)}
                      fill="#94a3b8"
                      radius={[4, 4, 0, 0]}
                    />

                    <Bar
                      dataKey="annee2"
                      name={String(resultat.annee2)}
                      fill="#7c9fcd"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* INTERPRETATION AUTOMATIQUE */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Interprétation automatique
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-2">
              {(resultat.interpretations || []).map(
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
                <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/20 dark:text-amber-200">
                  Les dotations aux amortissements
                  passent de{" "}
                  <strong>
                    {number(amortissements.valeur1)} MGA
                  </strong>{" "}
                  à{" "}
                  <strong>
                    {number(amortissements.valeur2)} MGA
                  </strong>.
                  {" "}
                  {amortissements.evolutionPourcentage == null
                    ? "Le taux d'évolution n'est pas calculable car la valeur de référence est nulle."
                    : nombre(amortissements.ecart) > 0
                      ? "Les dotations augmentent sur l'exercice comparé."
                      : nombre(amortissements.ecart) < 0
                        ? "Les dotations diminuent sur l'exercice comparé."
                        : "Les dotations restent stables entre les deux exercices."}
                </p>
              )}
            </CardContent>
          </Card>

        </>
      )}
    </div>
  )
}
