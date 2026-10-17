"use client"

import { useEffect, useState } from "react"
import { ArrowLeftRight, Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getExercicesComparaison, getComparaisonHistorique } from "@/services/comparaison-service"

const number = (value, digits = 0) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: digits }).format(Number(value ?? 0))
const compact = (value) => `${number(Number(value) / 1e9, 2)} Md`

export default function ComparaisonHistorique() {
  const [annees, setAnnees] = useState([])
  const [annee1, setAnnee1] = useState("")
  const [annee2, setAnnee2] = useState("")
  const [resultat, setResultat] = useState(null)
  const [loading, setLoading] = useState(false)
  const [initialisation, setInitialisation] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let actif = true
    getExercicesComparaison().then(data => {
      if (!actif) return
      const liste = [...data].sort((a, b) => a - b).map(String)
      setAnnees(liste)
      if (liste.length >= 2) { setAnnee1(liste[liste.length - 2]); setAnnee2(liste[liste.length - 1]) }
    }).catch(err => { if (actif) setError(err.message) }).finally(() => { if (actif) setInitialisation(false) })
    return () => { actif = false }
  }, [])

  async function comparer() {
    if (!annee1 || !annee2 || annee1 === annee2) return
    setLoading(true); setError(""); setResultat(null)
    try { setResultat(await getComparaisonHistorique(annee1, annee2)) }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const indicateurs = resultat?.indicateurs || []
  const graphique = indicateurs.filter(i => i.unite === "MGA").map(i => ({
    nom: ({ CA_EXPORT: "CA export", CHARGES: "Charges", FRAIS_EXPORT: "Frais export", MASSE_SALARIALE: "Salaires", RESULTAT: "Résultat" })[i.code] || i.libelle,
    annee1: Number(i.valeur1) / 1e9, annee2: Number(i.valeur2) / 1e9,
  }))
  const marge = indicateurs.find(i => i.code === "MARGE")
  const resultatOp = indicateurs.find(i => i.code === "RESULTAT")

  return <div className="space-y-5">
    <Card>
      <CardHeader><CardTitle className="text-lg">Sélection des exercices</CardTitle><CardDescription>Choisissez deux budgets annuels à comparer.</CardDescription></CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
          {[{ label: "Exercice de référence", value: annee1, setter: setAnnee1 }, { label: "Exercice comparé", value: annee2, setter: setAnnee2 }].map(field =>
            <label key={field.label} className="space-y-2 text-sm font-medium">{field.label}
              <select value={field.value} onChange={e => { field.setter(e.target.value); setResultat(null) }} className="block h-10 w-full rounded-md border bg-background px-3 font-normal" disabled={initialisation}>
                <option value="">Choisir une année</option>
                {annees.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </label>
          )}
          <Button onClick={comparer} disabled={loading || initialisation || !annee1 || !annee2 || annee1 === annee2}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowLeftRight className="mr-2 h-4 w-4" />}Comparer
          </Button>
        </div>
        {annees.length < 2 && !initialisation && !error && <p className="text-sm text-muted-foreground">Au moins deux exercices avec budget sont nécessaires.</p>}
        {annee1 && annee1 === annee2 && <p className="text-sm text-amber-700">Choisissez deux années différentes.</p>}
        {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      </CardContent>
    </Card>
    {resultat && <>
      <div className="grid gap-4 md:grid-cols-2">
        {[{ label: "Résultat opérationnel", item: resultatOp, points: false }, { label: "Marge opérationnelle", item: marge, points: true }].map(({ label, item, points }) => item &&
          <Card key={label}><CardContent className="p-5"><p className="text-sm text-muted-foreground">{label} — évolution</p>
            <div className="mt-2 flex items-center gap-2 text-2xl font-semibold">
              {Number(item.evolutionPourcentage) > 0 ? <TrendingUp className="h-5 w-5 text-emerald-600" /> : Number(item.evolutionPourcentage) < 0 ? <TrendingDown className="h-5 w-5 text-rose-600" /> : <Minus className="h-5 w-5" />}
              {item.evolutionPourcentage == null ? "Non calculable" : `${Number(item.evolutionPourcentage) > 0 ? "+" : ""}${number(item.evolutionPourcentage, 2)} ${points ? "%" : "%"}`}
            </div></CardContent></Card>
        )}
      </div>
      <Card><CardHeader><CardTitle className="text-lg">Tableau comparatif</CardTitle><CardDescription>Écarts entre {resultat.annee1} et {resultat.annee2} — montants en MGA.</CardDescription></CardHeader>
        <CardContent><div className="overflow-x-auto"><table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/40 text-left"><th className="p-3">Indicateur</th><th className="p-3 text-right">{resultat.annee1}</th><th className="p-3 text-right">{resultat.annee2}</th><th className="p-3 text-right">Écart</th><th className="p-3 text-right">Évolution</th></tr></thead>
          <tbody>{indicateurs.map(i => { const point = i.unite === "POINT"; const f = point ? 100 : 1; return <tr key={i.code} className="border-b hover:bg-muted/30">
            <td className="p-3 font-medium">{i.libelle}</td><td className="p-3 text-right whitespace-nowrap">{number(Number(i.valeur1) * f, point ? 2 : 0)}{point ? " %" : ""}</td>
            <td className="p-3 text-right whitespace-nowrap">{number(Number(i.valeur2) * f, point ? 2 : 0)}{point ? " %" : ""}</td>
            <td className="p-3 text-right whitespace-nowrap">{number(Number(i.ecart) * f, point ? 2 : 0)}</td>
            <td className="p-3 text-right whitespace-nowrap">{i.evolutionPourcentage == null ? "—" : `${Number(i.evolutionPourcentage) > 0 ? "+" : ""}${number(i.evolutionPourcentage, 2)} ${point ? "pts" : "%"}`}</td>
          </tr> })}</tbody>
        </table></div><p className="mt-3 text-xs text-muted-foreground">Une augmentation des charges n'est pas nécessairement favorable. Les marges sont comparées en points de pourcentage.</p></CardContent>
      </Card>
      <Card><CardHeader><CardTitle className="text-lg">Visualisation annuelle</CardTitle><CardDescription>Montants en milliards MGA</CardDescription></CardHeader>
        <CardContent><div className="h-[360px] w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={graphique} margin={{ bottom: 55, left: 8, right: 10 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="nom" angle={-25} textAnchor="end" interval={0} height={75} fontSize={11} /><YAxis fontSize={11} />
          <Tooltip formatter={v => `${number(v, 2)} Md MGA`} /><Legend /><Bar dataKey="annee1" name={String(resultat.annee1)} fill="#94a3b8" radius={[4,4,0,0]} /><Bar dataKey="annee2" name={String(resultat.annee2)} fill="#7c9fcd" radius={[4,4,0,0]} />
        </BarChart></ResponsiveContainer></div></CardContent>
      </Card>
      <Card><CardHeader><CardTitle className="text-lg">Interprétation automatique</CardTitle></CardHeader><CardContent className="space-y-2">
        {(resultat.interpretations || []).map((s, i) => <p key={i} className="rounded-md bg-muted/40 p-3 text-sm">{s}</p>)}
      </CardContent></Card>
    </>}
  </div>
}
