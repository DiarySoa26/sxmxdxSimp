// "use client"

// import { useMemo, type RefObject } from "react"
// import {
//   Bar, BarChart, CartesianGrid, Legend, Line,
//   LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis
// } from "recharts"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import type { Prediction } from "@/components/prediction/PredictionDetails"

// type Props = {
//   prediction: Prediction
//   trajectoireRef?: RefObject<HTMLDivElement | null>
//   depensesRef?: RefObject<HTMLDivElement | null>
// }

// const MOIS = [
//   "", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
//   "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
// ]

// function nombre(value: unknown) {
//   const n = Number(value)
//   return Number.isFinite(n) ? n : 0
// }

// function formatMGA(value: unknown) {
//   return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(nombre(value))
// }

// function formatCompact(value: unknown) {
//   const n = nombre(value)
//   if (Math.abs(n) >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)} Md`
//   if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(2)} M`
//   if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(2)} k`
//   return n.toFixed(0)
// }

// export default function PredictionCharts({ prediction, trajectoireRef, depensesRef }: Props) {
//   const graphiqueMensuel = useMemo(() => {
//     return (prediction.mois || []).map(item => ({
//       moisLabel: item.mois || MOIS[nombre(item.mois_id)] || `Mois ${item.mois_id}`,
//       ordre: nombre(item.mois_id),
//       ca_export: nombre(item.ca_export),
//       resultat_operationnel: nombre(item.resultat_operationnel),
//       charges_exploitation: nombre(item.charges_exploitation),
//       frais_export: nombre(item.frais_export),
//       masse_salariale: nombre(item.masse_salariale)
//     })).sort((a, b) => a.ordre - b.ordre)
//   }, [prediction])

//   return (
//     <div className="space-y-6">
//       <Card>
//         <CardHeader>
//           <CardTitle>Trajectoire budgétaire prévisionnelle</CardTitle>
//           <CardDescription>
//             Évolution mensuelle du chiffre d&apos;affaires export et du résultat opérationnel — {prediction.annee}
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           {graphiqueMensuel.length > 0 ? (
//             <div ref={trajectoireRef} className="h-[400px] w-full bg-white p-2">
//               <ResponsiveContainer width="100%" height="100%">
//                 <LineChart data={graphiqueMensuel} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="moisLabel" tickFormatter={value => String(value).substring(0, 3)} />
//                   <YAxis tickFormatter={formatCompact} />
//                   <Tooltip formatter={value => [`${formatMGA(value)} MGA`]} />
//                   <Legend />
//                   <Line
//                     type="monotone" dataKey="ca_export" name="CA export"
//                     stroke="#7da6c7" strokeWidth={3}
//                     dot={{ r: 4 }} activeDot={{ r: 6 }}
//                     isAnimationActive={false}
//                   />
//                   <Line
//                     type="monotone" dataKey="resultat_operationnel" name="Résultat opérationnel"
//                     stroke="#76a995" strokeWidth={3}
//                     dot={{ r: 4 }} activeDot={{ r: 6 }}
//                     isAnimationActive={false}
//                   />
//                 </LineChart>
//               </ResponsiveContainer>
//             </div>
//           ) : (
//             <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
//               Aucune donnée mensuelle disponible.
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle>Évolution des dépenses prévisionnelles</CardTitle>
//           <CardDescription>
//             Charges d&apos;exploitation, frais d&apos;export et masse salariale — {prediction.annee}
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           {graphiqueMensuel.length > 0 ? (
//             <div ref={depensesRef} className="h-[380px] w-full bg-white p-2">
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={graphiqueMensuel} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="moisLabel" tickFormatter={value => String(value).substring(0, 3)} />
//                   <YAxis tickFormatter={formatCompact} />
//                   <Tooltip formatter={value => [`${formatMGA(value)} MGA`]} />
//                   <Legend />
//                   <Bar dataKey="charges_exploitation" name="Charges exploitation" fill="#c998a4" radius={[4, 4, 0, 0]} isAnimationActive={false} />
//                   <Bar dataKey="frais_export" name="Frais export" fill="#9e91bd" radius={[4, 4, 0, 0]} isAnimationActive={false} />
//                   <Bar dataKey="masse_salariale" name="Masse salariale" fill="#83adb1" radius={[4, 4, 0, 0]} isAnimationActive={false} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           ) : (
//             <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
//               Aucune donnée mensuelle disponible.
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   )
// }







// "use client"

// import { useMemo, type RefObject } from "react"
// import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import type { Prediction } from "@/components/prediction/PredictionDetails"

// type Props = {
//   prediction: Prediction
//   trajectoireRef?: RefObject<HTMLDivElement | null>
//   depensesRef?: RefObject<HTMLDivElement | null>
// }

// const MOIS = ["", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]
// const nombre = (v: unknown) => v == null || v === "" || !Number.isFinite(Number(v)) ? 0 : Number(v)
// const formatMGA = (v: unknown) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(nombre(v))
// const formatCompact = (v: unknown) => {
//   const n = nombre(v), a = Math.abs(n)
//   return a >= 1e9 ? `${(n / 1e9).toFixed(2)} Md` : a >= 1e6 ? `${(n / 1e6).toFixed(2)} M` : a >= 1e3 ? `${(n / 1e3).toFixed(2)} k` : n.toFixed(0)
// }

// export default function PredictionCharts({ prediction, trajectoireRef, depensesRef }: Props) {
//   const graphiqueMensuel = useMemo(() => (prediction.mois || []).map(item => {
//     const charges = nombre(item.charges_exploitation)
//     const masse = nombre(item.masse_salariale)
//     const amortissements = nombre((item as typeof item & { amortissements?: number | string | null }).amortissements)
//     return {
//       moisLabel: item.mois || MOIS[nombre(item.mois_id)] || `Mois ${item.mois_id}`,
//       ordre: nombre(item.mois_id),
//       ca_export: nombre(item.ca_export),
//       resultat_operationnel: nombre(item.resultat_operationnel),
//       charges_exploitation: charges,
//       frais_export: nombre(item.frais_export),
//       masse_salariale: masse,
//       amortissements,
//       charges_totales: charges + amortissements + masse
//     }
//   }).sort((a, b) => a.ordre - b.ordre), [prediction])

//   return (
//     <div className="space-y-6">
//       <Card>
//         <CardHeader>
//           <CardTitle>Trajectoire budgétaire prévisionnelle</CardTitle>
//           <CardDescription>
//             Évolution mensuelle du chiffre d&apos;affaires export, des charges totales et du résultat opérationnel — {prediction.annee}
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           {graphiqueMensuel.length ? (
//             <div ref={trajectoireRef} className="h-[400px] w-full bg-white p-2">
//               <ResponsiveContainer width="100%" height="100%">
//                 <LineChart data={graphiqueMensuel} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="moisLabel" tickFormatter={v => String(v).substring(0, 3)} />
//                   <YAxis tickFormatter={formatCompact} />
//                   <Tooltip formatter={v => [`${formatMGA(v)} MGA`]} />
//                   <Legend />
//                   <Line type="monotone" dataKey="ca_export" name="CA export" stroke="#7da6c7" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} isAnimationActive={false} />
//                   <Line type="monotone" dataKey="charges_totales" name="Charges totales" stroke="#d6a65c" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} isAnimationActive={false} />
//                   <Line type="monotone" dataKey="resultat_operationnel" name="Résultat opérationnel" stroke="#76a995" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} isAnimationActive={false} />
//                 </LineChart>
//               </ResponsiveContainer>
//             </div>
//           ) : <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">Aucune donnée mensuelle disponible.</div>}
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle>Évolution des dépenses prévisionnelles</CardTitle>
//           <CardDescription>
//             Charges d&apos;exploitation, frais d&apos;export, masse salariale et amortissements — {prediction.annee}
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           {graphiqueMensuel.length ? (
//             <div ref={depensesRef} className="h-[380px] w-full bg-white p-2">
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={graphiqueMensuel} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="moisLabel" tickFormatter={v => String(v).substring(0, 3)} />
//                   <YAxis tickFormatter={formatCompact} />
//                   <Tooltip formatter={v => [`${formatMGA(v)} MGA`]} />
//                   <Legend />
//                   <Bar dataKey="charges_exploitation" name="Charges exploitation" fill="#c998a4" radius={[4, 4, 0, 0]} isAnimationActive={false} />
//                   <Bar dataKey="frais_export" name="Frais export" fill="#9e91bd" radius={[4, 4, 0, 0]} isAnimationActive={false} />
//                   <Bar dataKey="masse_salariale" name="Masse salariale" fill="#83adb1" radius={[4, 4, 0, 0]} isAnimationActive={false} />
//                   <Bar dataKey="amortissements" name="Amortissements" fill="#a6a0cb" radius={[4, 4, 0, 0]} isAnimationActive={false} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           ) : <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">Aucune donnée mensuelle disponible.</div>}
//         </CardContent>
//       </Card>
//     </div>
//   )
// }








"use client"

import { useEffect, useMemo, useState, type RefObject } from "react"
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getAmortissementsPrevisionnels, getChargesCategoriesPrevisionnelles } from "@/services/prediction-details-service"
import type { Prediction } from "@/components/prediction/PredictionDetails"

type Props = {
  prediction: Prediction
  trajectoireRef?: RefObject<HTMLDivElement | null>
  depensesRef?: RefObject<HTMLDivElement | null>
}

type DetailCharge = { mois_id: number; categorie: string; montant_prevu: number }
type DetailAmortissement = { mois_id: number; montant: number }

const MOIS = ["", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]
const nombre = (v: unknown) => v == null || v === "" || !Number.isFinite(Number(v)) ? 0 : Number(v)
const normaliser = (v: unknown) => String(v ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[_'’.-]/g, " ").replace(/\s+/g, " ").trim()
const formatMGA = (v: unknown) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(nombre(v))
const formatCompact = (v: unknown) => {
  const n = nombre(v), a = Math.abs(n)
  return a >= 1e9 ? `${(n / 1e9).toFixed(2)} Md` : a >= 1e6 ? `${(n / 1e6).toFixed(2)} M` : a >= 1e3 ? `${(n / 1e3).toFixed(2)} k` : n.toFixed(0)
}

const ACHATS = ["ACHAT PRODUITS"]
const SERVICES = ["ADMINISTRATION", "FINANCE", "LOGISTIQUE"]
const IMPOTS = ["FISCAL"]
const FRAIS_EXPORT = ["FRAIS EXPORT", "FRAIS EXPORTATION", "FRAIS D EXPORTATION"]

export default function PredictionCharts({ prediction, trajectoireRef, depensesRef }: Props) {
  const [detailsCharges, setDetailsCharges] = useState<DetailCharge[]>([])
  const [detailsAmortissements, setDetailsAmortissements] = useState<DetailAmortissement[]>([])
  const [chargesChargees, setChargesChargees] = useState(false)
  const [amortissementsCharges, setAmortissementsCharges] = useState(false)

  useEffect(() => {
    let actif = true
    setDetailsCharges([])
    setDetailsAmortissements([])
    setChargesChargees(false)
    setAmortissementsCharges(false)

    async function charger() {
      const [charges, amortissements] = await Promise.allSettled([
        getChargesCategoriesPrevisionnelles(prediction.annee),
        getAmortissementsPrevisionnels(prediction.annee)
      ])
      if (!actif) return
      if (charges.status === "fulfilled") {
        setDetailsCharges(charges.value?.details || [])
        setChargesChargees(true)
      }
      if (amortissements.status === "fulfilled") {
        setDetailsAmortissements(amortissements.value?.mensuel || [])
        setAmortissementsCharges(true)
      }
    }

    void charger()
    return () => { actif = false }
  }, [prediction.annee, prediction.id])

  const graphiqueMensuel = useMemo(() => (prediction.mois || []).map(item => {
    const id = nombre(item.mois_id)
    const lignes = detailsCharges.filter(l => nombre(l.mois_id) === id)
    const somme = (categories: string[]) => lignes.filter(l => categories.includes(normaliser(l.categorie))).reduce((s, l) => s + nombre(l.montant_prevu), 0)

    const achats = somme(ACHATS)
    const impots = somme(IMPOTS)
    const servicesBase = somme(SERVICES)
    const categoriesConnues = [...ACHATS, ...SERVICES, ...IMPOTS, ...FRAIS_EXPORT]
    const autres = lignes.filter(l => !categoriesConnues.includes(normaliser(l.categorie))).reduce((s, l) => s + nombre(l.montant_prevu), 0)
    const fraisExport = nombre(item.frais_export)
    const services = servicesBase + autres + fraisExport
    const masse = nombre(item.masse_salariale)
    const amortissementDetail = detailsAmortissements.find(l => nombre(l.mois_id) === id)
    const amortissements = nombre(amortissementDetail?.montant ?? item.amortissements)
    const chargesExploitation = nombre(item.charges_exploitation) + fraisExport

    return {
      moisLabel: item.mois || MOIS[id] || `Mois ${id}`,
      ordre: id,
      ca_export: nombre(item.ca_export),
      resultat_operationnel: nombre(item.resultat_operationnel),
      charges_totales: chargesExploitation + amortissements + masse,
      achats_consommes: achats,
      services_exterieurs: services,
      impots_taxes: impots,
      masse_salariale: masse,
      amortissements
    }
  }).sort((a, b) => a.ordre - b.ordre), [prediction, detailsCharges, detailsAmortissements])

  const pret = chargesChargees && amortissementsCharges
  const barres = [
    { key: "achats_consommes", label: "Achats consommés", color: "#c998a4" },
    { key: "services_exterieurs", label: "Services extérieurs", color: "#9e91bd" },
    { key: "impots_taxes", label: "Impôts et taxes", color: "#d6a65c" },
    { key: "masse_salariale", label: "Masse salariale", color: "#83adb1" },
    { key: "amortissements", label: "Amortissements", color: "#a6a0cb" }
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Trajectoire budgétaire prévisionnelle</CardTitle>
          <CardDescription>
            Évolution mensuelle du chiffre d&apos;affaires export, des charges totales et du résultat opérationnel — {prediction.annee}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!pret ? (
            <div className="flex h-[400px] items-center justify-center text-sm text-muted-foreground">Chargement des données financières...</div>
          ) : graphiqueMensuel.length ? (
            <div ref={trajectoireRef} className="h-[400px] w-full bg-white p-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={graphiqueMensuel} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="moisLabel" tickFormatter={v => String(v).substring(0, 3)} />
                  <YAxis tickFormatter={formatCompact} />
                  <Tooltip formatter={v => [`${formatMGA(v)} MGA`]} />
                  <Legend />
                  <Line type="monotone" dataKey="ca_export" name="CA export" stroke="#7da6c7" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} isAnimationActive={false} />
                  <Line type="monotone" dataKey="charges_totales" name="Charges totales" stroke="#d6a65c" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} isAnimationActive={false} />
                  <Line type="monotone" dataKey="resultat_operationnel" name="Résultat opérationnel" stroke="#76a995" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">Aucune donnée mensuelle disponible.</div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Évolution des dépenses prévisionnelles</CardTitle>
          <CardDescription>
            Achats consommés, services extérieurs, impôts et taxes, masse salariale et amortissements — {prediction.annee}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!pret ? (
            <div className="flex h-[380px] items-center justify-center text-sm text-muted-foreground">Chargement des données financières...</div>
          ) : graphiqueMensuel.length ? (
            <div ref={depensesRef} className="h-[380px] w-full bg-white p-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={graphiqueMensuel} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="moisLabel" tickFormatter={v => String(v).substring(0, 3)} />
                  <YAxis tickFormatter={formatCompact} />
                  <Tooltip formatter={v => [`${formatMGA(v)} MGA`]} />
                  <Legend />
                  {barres.map(b => <Bar key={b.key} dataKey={b.key} name={b.label} fill={b.color} radius={[4, 4, 0, 0]} isAnimationActive={false} />)}
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">Aucune donnée mensuelle disponible.</div>}
        </CardContent>
      </Card>
    </div>
  )
}
