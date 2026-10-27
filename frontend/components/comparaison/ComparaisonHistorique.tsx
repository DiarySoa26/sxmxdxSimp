"use client"

import { useEffect, useState } from "react"
import { ArrowLeftRight, Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getExercicesComparaison, getComparaisonHistorique } from "@/services/comparaison-service"
import { getBudgetDetails, getExercices } from "@/services/budget-details-service"

const nombre = v => Number.isFinite(Number(v)) ? Number(v) : 0
const format = (v, d = 0) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: d }).format(nombre(v))
const normaliser = v => String(v ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[_'’.-]/g, " ").replace(/\s+/g, " ").trim()
const liste = v => Array.isArray(v) ? v : []
const total = (lignes, champ) => liste(lignes).reduce((s, l) => s + nombre(l?.[champ]), 0)
const fraisExport = lignes => total(lignes, "total")

const categories = [
  { code: "ACHATS_CONSOMMES", libelle: "Achats consommés", categories: ["ACHAT PRODUITS"] },
  { code: "SERVICES_EXTERIEURS", libelle: "Services extérieurs", categories: ["ADMINISTRATION", "FINANCE", "LOGISTIQUE"] },
  { code: "IMPOTS_TAXES", libelle: "Impôts et taxes", categories: ["FISCAL"] },
]

const codesDetails = new Set(categories.map(c => c.code))
const estFraisExport = i => ["FRAIS EXPORT", "FRAIS EXPORTATION", "FRAIS D EXPORTATION"].includes(normaliser(i?.code)) || ["FRAIS EXPORT", "FRAIS EXPORTATION", "FRAIS D EXPORTATION"].includes(normaliser(i?.libelle))

function creerIndicateur(code, libelle, valeur1, valeur2) {
  const ecart = valeur2 - valeur1
  return { code, libelle, unite: "MGA", valeur1, valeur2, ecart, evolutionPourcentage: valeur1 !== 0 ? ecart / Math.abs(valeur1) * 100 : null }
}

function sommeCategorie(lignes, noms) {
  const ensemble = new Set(noms.map(normaliser))
  return liste(lignes).reduce((s, l) => ensemble.has(normaliser(l.categorie)) ? s + nombre(l.montant) : s, 0)
}

function calculerDetails(charges, frais) {
  return categories.map(c => ({
    code: c.code,
    libelle: c.libelle,
    valeur: sommeCategorie(charges, c.categories) + (c.code === "SERVICES_EXTERIEURS" ? fraisExport(frais) : 0),
  }))
}

function trouverId(exercices, annee) {
  const e = exercices.find(x => String(x.annee_exercice ?? x.annee) === String(annee))
  return e?.id_exercice ?? e?.id ?? null
}

function Graphique({ titre, description, data, annee1, annee2, hauteur = 380 }) {
  if (!data.length) return null
  return (
    <Card>
      <CardHeader><CardTitle className="text-lg">{titre}</CardTitle><CardDescription>{description}</CardDescription></CardHeader>
      <CardContent>
        <div className="w-full" style={{ height: hauteur }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 65 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="nom" angle={-25} textAnchor="end" interval={0} height={90} fontSize={11} />
              <YAxis fontSize={11} tickFormatter={v => format(v, 1)} />
              <Tooltip formatter={(v, name) => [`${format(v, 3)} Md MGA`, name]} />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="annee1" name={String(annee1)} fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={55} />
              <Bar dataKey="annee2" name={String(annee2)} fill="#7c9fcd" radius={[4, 4, 0, 0]} maxBarSize={55} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ComparaisonHistorique() {
  const [annees, setAnnees] = useState([])
  const [exercices, setExercices] = useState([])
  const [annee1, setAnnee1] = useState("")
  const [annee2, setAnnee2] = useState("")
  const [resultat, setResultat] = useState(null)
  const [loading, setLoading] = useState(false)
  const [initialisation, setInitialisation] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let actif = true
    async function charger() {
      try {
        const [a, e] = await Promise.all([getExercicesComparaison(), getExercices()])
        if (!actif) return
        const anneesTriees = liste(a).map(x => Number(x?.annee ?? x)).filter(Number.isFinite).sort((x, y) => x - y).map(String)
        setAnnees(anneesTriees)
        setExercices(liste(e))
        if (anneesTriees.length >= 2) {
          setAnnee1(anneesTriees.at(-2))
          setAnnee2(anneesTriees.at(-1))
        }
      } catch (e) {
        if (actif) setError(e.message || "Impossible de charger les exercices.")
      } finally {
        if (actif) setInitialisation(false)
      }
    }
    charger()
    return () => { actif = false }
  }, [])

  async function comparer() {
    if (!annee1 || !annee2 || annee1 === annee2 || loading) return
    setLoading(true)
    setError("")
    setResultat(null)

    try {
      const comparaison = await getComparaisonHistorique(annee1, annee2)
      if (!comparaison) throw new Error("Aucune comparaison disponible.")

      const id1 = trouverId(exercices, annee1)
      const id2 = trouverId(exercices, annee2)
      if (id1 == null || id2 == null) throw new Error("Identifiants des exercices introuvables.")

      const [amort1, amort2, charges1, charges2, frais1, frais2] = await Promise.all([
        getBudgetDetails("amortissements", id1), getBudgetDetails("amortissements", id2),
        getBudgetDetails("charges", id1), getBudgetDetails("charges", id2),
        getBudgetDetails("frais-export", id1), getBudgetDetails("frais-export", id2),
      ])

      const details1 = calculerDetails(charges1, frais1)
      const details2 = calculerDetails(charges2, frais2)
      const chargesDisponibles = liste(charges1).length || liste(charges2).length || liste(frais1).length || liste(frais2).length
      const amortDisponibles = liste(amort1).length || liste(amort2).length
      const indicateurs = liste(comparaison.indicateurs).filter(i => !estFraisExport(i) && !codesDetails.has(i.code)).map(i => ({ ...i }))

      function inserer(indicateur, apres = null) {
        const index = indicateurs.findIndex(i => i.code === indicateur.code)
        if (index >= 0) indicateurs[index] = indicateur
        else {
          const position = apres ? indicateurs.findIndex(i => i.code === apres) : -1
          if (position >= 0) indicateurs.splice(position + 1, 0, indicateur)
          else indicateurs.push(indicateur)
        }
      }

      if (chargesDisponibles) {
        const total1 = details1.reduce((s, d) => s + d.valeur, 0)
        const total2 = details2.reduce((s, d) => s + d.valeur, 0)
        inserer(creerIndicateur("CHARGES", "Charges d'exploitation", total1, total2))
        const index = indicateurs.findIndex(i => i.code === "CHARGES")
        indicateurs.splice(index + 1, 0, ...details1.map((d, i) => creerIndicateur(d.code, d.libelle, d.valeur, details2[i].valeur)))
      }

      if (amortDisponibles) {
        const amortissement = creerIndicateur("AMORTISSEMENTS", "Dotations aux amortissements", total(amort1, "montant"), total(amort2, "montant"))
        inserer(amortissement, "MASSE_SALARIALE")
      } else {
        const index = indicateurs.findIndex(i => i.code === "AMORTISSEMENTS")
        if (index >= 0) indicateurs.splice(index, 1)
      }

      setResultat({ ...comparaison, annee1, annee2, indicateurs })
    } catch (e) {
      console.error("Erreur comparaison historique :", e)
      setError(e.message || "Impossible de comparer les exercices.")
    } finally {
      setLoading(false)
    }
  }

  const indicateurs = liste(resultat?.indicateurs).filter(i => !estFraisExport(i))
  const trouver = code => indicateurs.find(i => i.code === code)
  const marge = trouver("MARGE")
  const resultatOp = trouver("RESULTAT")
  const amortissements = trouver("AMORTISSEMENTS")

  const libelles = { CA_EXPORT: "CA export", CHARGES: "Charges d'exploitation", MASSE_SALARIALE: "Masse salariale", AMORTISSEMENTS: "Amortissements", RESULTAT: "Résultat opérationnel" }
  const convertirGraphique = i => ({ nom: libelles[i.code] || i.libelle, annee1: nombre(i.valeur1) / 1e9, annee2: nombre(i.valeur2) / 1e9 })
  const graphiquePrincipal = indicateurs.filter(i => i.unite === "MGA" && !codesDetails.has(i.code)).map(convertirGraphique)
  const graphiqueCharges = indicateurs.filter(i => codesDetails.has(i.code)).map(convertirGraphique)

  // Neuf cartes : uniquement les évolutions
  const cartes = [
    { label: "Chiffre d'affaires", item: trouver("CA_EXPORT") },
    { label: "Charges d'exploitation", item: trouver("CHARGES") },
    { label: "Achats consommés", item: trouver("ACHATS_CONSOMMES") },
    { label: "Services extérieurs", item: trouver("SERVICES_EXTERIEURS") },
    { label: "Impôts et taxes", item: trouver("IMPOTS_TAXES") },
    { label: "Masse salariale", item: trouver("MASSE_SALARIALE") },
    { label: "Amortissements", item: amortissements },
    { label: "Résultat opérationnel", item: resultatOp },
    { label: "Marge opérationnelle", item: marge },
  ].filter(c => c.item)

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader><CardTitle className="text-lg">Sélection des exercices</CardTitle><CardDescription>Choisissez deux budgets annuels à comparer.</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
            {[{ label: "Exercice de référence", value: annee1, setter: setAnnee1 }, { label: "Exercice comparé", value: annee2, setter: setAnnee2 }].map(f => (
              <label key={f.label} className="space-y-2 text-sm font-medium">
                {f.label}
                <select value={f.value} onChange={e => { f.setter(e.target.value); setResultat(null) }} className="block h-10 w-full rounded-md border bg-background px-3 font-normal" disabled={initialisation || loading}>
                  <option value="">Choisir une année</option>
                  {annees.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </label>
            ))}
            <Button onClick={comparer} disabled={loading || initialisation || !annee1 || !annee2 || annee1 === annee2}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowLeftRight className="mr-2 h-4 w-4" />}Comparer
            </Button>
          </div>
          {annees.length < 2 && !initialisation && !error && <p className="text-sm text-muted-foreground">Au moins deux exercices sont nécessaires.</p>}
          {annee1 && annee1 === annee2 && <p className="text-sm text-amber-700">Choisissez deux années différentes.</p>}
          {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        </CardContent>
      </Card>

      {resultat && (
        <>
          {/* CARTES : ÉVOLUTIONS UNIQUEMENT */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cartes.map(({ label, item }) => {
              const evolution = item.evolutionPourcentage
              const valeur = nombre(evolution)
              return (
                <Card key={label}>
                  <CardContent className="p-5">
                    <p className="text-sm text-muted-foreground">{label} — évolution</p>
                    <div className="mt-2 flex items-center gap-2 text-2xl font-semibold">
                      {evolution == null ? <Minus className="h-5 w-5" /> : valeur > 0 ? <TrendingUp className="h-5 w-5 text-emerald-600" /> : valeur < 0 ? <TrendingDown className="h-5 w-5 text-rose-600" /> : <Minus className="h-5 w-5" />}
                      {evolution == null ? "Non calculable" : `${valeur > 0 ? "+" : ""}${format(valeur, 2)} %`}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* TABLEAU COMPARATIF */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Tableau comparatif</CardTitle><CardDescription>Écarts entre {annee1} et {annee2} — montants en MGA.</CardDescription></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/40 text-left">
                    <th className="p-3">Indicateur</th><th className="p-3 text-right">{annee1}</th><th className="p-3 text-right">{annee2}</th><th className="p-3 text-right">Écart</th><th className="p-3 text-right">Évolution</th>
                  </tr></thead>
                  <tbody>
                    {indicateurs.map((i, index) => {
                      const point = i.unite === "POINT"
                      const facteur = point ? 100 : 1
                      const detail = codesDetails.has(i.code)
                      return (
                        <tr key={`${i.code}-${index}`} className={`border-b hover:bg-muted/30 ${i.code === "CHARGES" ? "bg-muted/70 font-semibold" : detail ? "bg-muted/20" : i.code === "AMORTISSEMENTS" ? "bg-amber-50/50 dark:bg-amber-950/10" : ""}`}>
                          <td className={`p-3 ${detail ? "pl-8 text-muted-foreground" : "font-medium"}`}>{i.libelle}</td>
                          {[i.valeur1, i.valeur2, i.ecart].map((v, n) => <td key={n} className="whitespace-nowrap p-3 text-right">{format(nombre(v) * facteur, point ? 2 : 0)}{point ? " %" : ""}</td>)}
                          <td className="whitespace-nowrap p-3 text-right">{i.evolutionPourcentage == null ? "—" : `${nombre(i.evolutionPourcentage) > 0 ? "+" : ""}${format(i.evolutionPourcentage, 2)} %`}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* GRAPHIQUES */}
          <Graphique titre="Visualisation annuelle" description="Comparaison des principaux indicateurs en milliards MGA." data={graphiquePrincipal} annee1={annee1} annee2={annee2} hauteur={410} />
          <Graphique titre="Détail des charges d'exploitation" description="Achats consommés, Services extérieurs (frais export inclus) et Impôts et taxes — milliards MGA." data={graphiqueCharges} annee1={annee1} annee2={annee2} hauteur={360} />

          {/* INTERPRÉTATIONS */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Interprétation automatique</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {liste(resultat.interpretations).map((texte, index) => <p key={index} className="rounded-md bg-muted/40 p-3 text-sm">{texte}</p>)}
              {amortissements && <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/20 dark:text-amber-200">Les dotations aux amortissements passent de <strong>{format(amortissements.valeur1)} MGA</strong> à <strong>{format(amortissements.valeur2)} MGA</strong>. {amortissements.evolutionPourcentage == null ? "Le taux d'évolution n'est pas calculable." : nombre(amortissements.ecart) > 0 ? "Les dotations augmentent." : nombre(amortissements.ecart) < 0 ? "Les dotations diminuent." : "Les dotations restent stables."}</p>}
              <p className="text-xs text-muted-foreground">Les résultats et marges provenant du backend peuvent nécessiter une mise à jour pour refléter les frais export intégrés aux charges.</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
