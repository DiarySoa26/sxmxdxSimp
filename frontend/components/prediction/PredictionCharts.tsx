
// "use client"

// import { useMemo } from "react"
// import {
//   Bar, BarChart, CartesianGrid, Legend, Line,
//   LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis
// } from "recharts"
// import {
//   Card, CardContent, CardDescription, CardHeader, CardTitle
// } from "@/components/ui/card"
// import type { Prediction } from "@/components/prediction/PredictionDetails"

// const MOIS = [
//   "", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
//   "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
// ]

// function nombre(value: unknown) {
//   const n = Number(value)
//   return Number.isFinite(n) ? n : 0
// }

// function formatMGA(value: unknown) {
//   return new Intl.NumberFormat("fr-FR", {
//     maximumFractionDigits: 0
//   }).format(nombre(value))
// }

// function formatCompact(value: unknown) {
//   const n = nombre(value)
//   if (Math.abs(n) >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)} Md`
//   if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(2)} M`
//   if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(2)} k`
//   return n.toFixed(0)
// }

// export default function PredictionCharts({ prediction }: { prediction: Prediction }) {
//   const graphiqueMensuel = useMemo(() => {
//     return (prediction.mois || []).map(item => {
//       const moisLabel = item.mois || MOIS[nombre(item.mois_id)] || `Mois ${item.mois_id}`
//       return {
//         moisLabel,
//         ordre: nombre(item.mois_id),
//         ca_export: nombre(item.ca_export),
//         resultat_operationnel: nombre(item.resultat_operationnel),
//         charges_exploitation: nombre(item.charges_exploitation),
//         frais_export: nombre(item.frais_export),
//         masse_salariale: nombre(item.masse_salariale)
//       }
//     }).sort((a, b) => a.ordre - b.ordre)
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
//             <div className="h-[400px] w-full rounded-md bg-white p-2">
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
//             <div className="h-[380px] w-full rounded-md bg-white p-2">
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={graphiqueMensuel} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="moisLabel" tickFormatter={value => String(value).substring(0, 3)} />
//                   <YAxis tickFormatter={formatCompact} />
//                   <Tooltip formatter={value => [`${formatMGA(value)} MGA`]} />
//                   <Legend />
//                   <Bar
//                     dataKey="charges_exploitation" name="Charges exploitation"
//                     fill="#c998a4" radius={[4, 4, 0, 0]}
//                     isAnimationActive={false}
//                   />
//                   <Bar
//                     dataKey="frais_export" name="Frais export"
//                     fill="#9e91bd" radius={[4, 4, 0, 0]}
//                     isAnimationActive={false}
//                   />
//                   <Bar
//                     dataKey="masse_salariale" name="Masse salariale"
//                     fill="#83adb1" radius={[4, 4, 0, 0]}
//                     isAnimationActive={false}
//                   />
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







"use client"

import { useMemo, type RefObject } from "react"
import {
  Bar, BarChart, CartesianGrid, Legend, Line,
  LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Prediction } from "@/components/prediction/PredictionDetails"

type Props = {
  prediction: Prediction
  trajectoireRef?: RefObject<HTMLDivElement | null>
  depensesRef?: RefObject<HTMLDivElement | null>
}

const MOIS = [
  "", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
]

function nombre(value: unknown) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function formatMGA(value: unknown) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(nombre(value))
}

function formatCompact(value: unknown) {
  const n = nombre(value)
  if (Math.abs(n) >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)} Md`
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(2)} M`
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(2)} k`
  return n.toFixed(0)
}

export default function PredictionCharts({ prediction, trajectoireRef, depensesRef }: Props) {
  const graphiqueMensuel = useMemo(() => {
    return (prediction.mois || []).map(item => ({
      moisLabel: item.mois || MOIS[nombre(item.mois_id)] || `Mois ${item.mois_id}`,
      ordre: nombre(item.mois_id),
      ca_export: nombre(item.ca_export),
      resultat_operationnel: nombre(item.resultat_operationnel),
      charges_exploitation: nombre(item.charges_exploitation),
      frais_export: nombre(item.frais_export),
      masse_salariale: nombre(item.masse_salariale)
    })).sort((a, b) => a.ordre - b.ordre)
  }, [prediction])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Trajectoire budgétaire prévisionnelle</CardTitle>
          <CardDescription>
            Évolution mensuelle du chiffre d&apos;affaires export et du résultat opérationnel — {prediction.annee}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {graphiqueMensuel.length > 0 ? (
            <div ref={trajectoireRef} className="h-[400px] w-full bg-white p-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={graphiqueMensuel} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="moisLabel" tickFormatter={value => String(value).substring(0, 3)} />
                  <YAxis tickFormatter={formatCompact} />
                  <Tooltip formatter={value => [`${formatMGA(value)} MGA`]} />
                  <Legend />
                  <Line
                    type="monotone" dataKey="ca_export" name="CA export"
                    stroke="#7da6c7" strokeWidth={3}
                    dot={{ r: 4 }} activeDot={{ r: 6 }}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone" dataKey="resultat_operationnel" name="Résultat opérationnel"
                    stroke="#76a995" strokeWidth={3}
                    dot={{ r: 4 }} activeDot={{ r: 6 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
              Aucune donnée mensuelle disponible.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Évolution des dépenses prévisionnelles</CardTitle>
          <CardDescription>
            Charges d&apos;exploitation, frais d&apos;export et masse salariale — {prediction.annee}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {graphiqueMensuel.length > 0 ? (
            <div ref={depensesRef} className="h-[380px] w-full bg-white p-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={graphiqueMensuel} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="moisLabel" tickFormatter={value => String(value).substring(0, 3)} />
                  <YAxis tickFormatter={formatCompact} />
                  <Tooltip formatter={value => [`${formatMGA(value)} MGA`]} />
                  <Legend />
                  <Bar dataKey="charges_exploitation" name="Charges exploitation" fill="#c998a4" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                  <Bar dataKey="frais_export" name="Frais export" fill="#9e91bd" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                  <Bar dataKey="masse_salariale" name="Masse salariale" fill="#83adb1" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
              Aucune donnée mensuelle disponible.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
