"use client"

import { useEffect, useState } from "react"
import { BrainCircuit, AlertCircle, Loader2, TrendingUp, TrendingDown, CheckCircle2, BarChart3, Minus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { getExercicesEvaluables, evaluerPrediction } from "@/services/evaluation-prediction-service"
import { getBudgetDetails, getExercices } from "@/services/budget-details-service"
import { getAmortissementsPrevisionnels, getChargesCategoriesPrevisionnelles } from "@/services/prediction-details-service"

type Valeur = number | string | null
type Indicateur = { code: string; libelle: string; unite: string; constate: number | null; prevision: number | null; ecart: number | null; erreurAbsolue: number | null; erreurPourcentage: number | null; diagnostic: string }
type Evaluation = { annee: number; budgetGenereId: number; budgetPrevisionnelId: number; indicateurs: Indicateur[]; interpretations: string[]; autresCategories?: string[]; avertissements?: string[] }
type Exercice = { id?: number; id_exercice?: number; annee?: number; annee_exercice?: number }
type Charge = { categorie?: string | null; montant?: Valeur }
type FraisExport = { total?: Valeur }
type Amortissement = { montant?: Valeur }
type ChargesPrevisionnelles = { total_annuel?: Valeur; details?: { mois_id: number; categorie: string; montant_prevu: Valeur }[] }
type AmortissementsPrevisionnels = { total_annuel?: Valeur; mensuel?: { mois_id: number; mois: string; montant: Valeur }[] }
type Groupe = { code: string; libelle: string; categories: string[] }
type GraphData = { nom: string; Constaté: number | null; Prévision: number | null }

const GROUPES: Groupe[] = [
  { code: "ACHATS_CONSOMMES", libelle: "Achats consommés", categories: ["ACHAT PRODUITS", "PRODUCTION"] },
  { code: "SERVICES_EXTERIEURS", libelle: "Services extérieurs", categories: ["ADMINISTRATION", "FINANCE", "LOGISTIQUE", "SECURITE"] },
  { code: "IMPOTS_TAXES", libelle: "Impôts et taxes", categories: ["FISCAL"] },
]

const CODES_DETAILS = new Set(GROUPES.map(g => g.code))
const FRAIS_EXPORT = new Set(["FRAIS EXPORT", "FRAIS EXPORTATION", "FRAIS D EXPORTATION"])
const nombre = (v: unknown) => v == null || v === "" ? 0 : Number.isFinite(Number(v)) ? Number(v) : 0
const normaliser = (v: unknown) => String(v ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[_'’.-]/g, " ").replace(/\s+/g, " ").trim()
const liste = <T,>(v: T[] | null | undefined): T[] => Array.isArray(v) ? v : []
const format = (v: number | null, d = 0) => v == null ? "—" : new Intl.NumberFormat("fr-FR", { maximumFractionDigits: d }).format(v)
const pourcentage = (v: number | null) => v == null ? "Non calculable" : `${new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v)} %`
const formatValeur = (v: number | null, unite: string) => v == null ? "—" : unite === "POINT" ? `${format(v * 100, 2)} %` : `${format(v)} MGA`
const somme = <T,>(lignes: T[], lire: (ligne: T) => unknown) => liste(lignes).reduce((s, l) => s + nombre(lire(l)), 0)
const estFraisExport = (i: Indicateur) => FRAIS_EXPORT.has(normaliser(i.code)) || FRAIS_EXPORT.has(normaliser(i.libelle))
const estAutres = (i: Indicateur) => normaliser(i.code) === "AUTRES CHARGES" || normaliser(i.libelle) === "AUTRES CHARGES"

function creerIndicateur(code: string, libelle: string, constate: number | null, prevision: number | null): Indicateur {
  if (constate == null || prevision == null) return { code, libelle, unite: "MGA", constate, prevision, ecart: null, erreurAbsolue: null, erreurPourcentage: null, diagnostic: "NON_DISPONIBLE" }
  const ecart = prevision - constate, erreurAbsolue = Math.abs(ecart)
  return { code, libelle, unite: "MGA", constate, prevision, ecart, erreurAbsolue, erreurPourcentage: constate ? erreurAbsolue / Math.abs(constate) * 100 : null, diagnostic: Math.abs(ecart) < 0.01 ? "CONFORME" : ecart > 0 ? "SURESTIMATION" : "SOUS_ESTIMATION" }
}

function calculerDetails<T>(lignes: T[], categorie: (l: T) => unknown, montant: (l: T) => unknown, frais: number, autresBackend: Valeur = null) {
  const connues = new Set(GROUPES.flatMap(g => g.categories.map(normaliser)))
  const autres = somme(liste(lignes).filter(l => {
    const c = normaliser(categorie(l))
    return c && !connues.has(c) && !FRAIS_EXPORT.has(c)
  }), montant)

  return GROUPES.map(g => ({
    code: g.code,
    libelle: g.libelle,
    montant: somme(liste(lignes).filter(l => g.categories.some(c => normaliser(c) === normaliser(categorie(l)))), montant)
      + (g.code === "SERVICES_EXTERIEURS" ? frais + (autresBackend == null ? autres : nombre(autresBackend)) : 0),
  }))
}

function totalAmortissements(data: AmortissementsPrevisionnels | null): number | null {
  if (!data) return null
  if (data.total_annuel != null) return nombre(data.total_annuel)
  return Array.isArray(data.mensuel) ? somme(data.mensuel, x => x.montant) : null
}

function GraphiqueEvaluation({ titre, description, data }: { titre: string; description: string; data: GraphData[] }) {
  if (!data.length) return null
  return (
    <Card>
      <CardHeader><CardTitle>{titre}</CardTitle><CardDescription>{description}</CardDescription></CardHeader>
      <CardContent>
        <div className="h-[360px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="nom" angle={-25} textAnchor="end" interval={0} height={100} tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={v => `${(v / 1e9).toFixed(1)} Md`} width={65} />
              <Tooltip formatter={v => v == null ? "Non disponible" : `${format(Number(v))} MGA`} />
              <Legend />
              <Bar dataKey="Constaté" fill="#64748b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Prévision" fill="#93c5fd" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export default function EvaluationPrediction() {
  const [annees, setAnnees] = useState<number[]>([])
  const [exercices, setExercices] = useState<Exercice[]>([])
  const [annee, setAnnee] = useState("")
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingAnnees, setLoadingAnnees] = useState(true)
  const [erreur, setErreur] = useState("")

  useEffect(() => {
    let actif = true
    async function charger() {
      try {
        const [a, e] = await Promise.all([getExercicesEvaluables(), getExercices()])
        if (!actif) return
        const disponibles = [...new Set(liste(a as number[]).map(Number).filter(Number.isFinite))].sort((x, y) => y - x)
        setAnnees(disponibles)
        setExercices(liste(e as Exercice[]))
        if (disponibles.length) setAnnee(String(disponibles[0]))
      } catch (e) {
        if (actif) setErreur(e instanceof Error ? e.message : "Impossible de récupérer les exercices.")
      } finally {
        if (actif) setLoadingAnnees(false)
      }
    }
    void charger()
    return () => { actif = false }
  }, [])

  async function lancerEvaluation() {
    if (!annee || loading) return
    setLoading(true)
    setErreur("")
    setEvaluation(null)

    try {
      const anneeSelectionnee = Number(annee)
      const data: Evaluation = await evaluerPrediction(anneeSelectionnee)
      if (!data) throw new Error("Aucune évaluation disponible.")

      const exercice = exercices.find(e => Number(e.annee_exercice ?? e.annee) === anneeSelectionnee)
      const exerciceId = exercice?.id_exercice ?? exercice?.id
      if (exerciceId == null) throw new Error("Identifiant de l'exercice introuvable.")

      const [chargesConstatees, fraisConstates, amortissementsConstates] = await Promise.all([
        getBudgetDetails("charges", exerciceId),
        getBudgetDetails("frais-export", exerciceId),
        getBudgetDetails("amortissements", exerciceId),
      ])

      const [rCharges, rAmortissements] = await Promise.allSettled([
        getChargesCategoriesPrevisionnelles(anneeSelectionnee),
        getAmortissementsPrevisionnels(anneeSelectionnee),
      ])

      const chargesP: ChargesPrevisionnelles | null = rCharges.status === "fulfilled" ? rCharges.value : null
      const amortP: AmortissementsPrevisionnels | null = rAmortissements.status === "fulfilled" ? rAmortissements.value : null
      const avertissements: string[] = []

      if (!chargesP) avertissements.push("Les détails des charges prévisionnelles ne sont pas disponibles.")
      if (!amortP) avertissements.push("Les amortissements prévisionnels ne sont pas disponibles.")

      const backend = liste(data.indicateurs)
      const autresBackend = backend.find(estAutres)
      const fraisBackend = backend.find(estFraisExport)
      const fraisPrevision = fraisBackend?.prevision == null ? null : nombre(fraisBackend.prevision)

      if (fraisPrevision == null) avertissements.push("Les frais export prévisionnels sont indisponibles. Les services extérieurs prévisionnels ne peuvent pas être calculés complètement.")

      const chargesC = liste(chargesConstatees as Charge[])
      const fraisC = liste(fraisConstates as FraisExport[])
      const amortC = liste(amortissementsConstates as Amortissement[])
      const detailsC = calculerDetails(chargesC, x => x.categorie, x => x.montant, somme(fraisC, x => x.total), autresBackend?.constate)
      const detailsP = chargesP && fraisPrevision != null
        ? calculerDetails(liste(chargesP.details), x => x.categorie, x => x.montant_prevu, fraisPrevision, autresBackend?.prevision)
        : []

      const connues = new Set(GROUPES.flatMap(g => g.categories.map(normaliser)))
      const autresCategories = [...new Set([
        ...chargesC.map(x => normaliser(x.categorie)),
        ...liste(chargesP?.details).map(x => normaliser(x.categorie)),
      ])].filter(c => c && !connues.has(c) && !FRAIS_EXPORT.has(c))

      const indicateurs = backend.filter(i => !CODES_DETAILS.has(i.code) && !estAutres(i) && !estFraisExport(i) && i.code !== "AMORTISSEMENTS").map(i => ({ ...i }))

      function inserer(i: Indicateur, apres: string | null = null) {
        const index = indicateurs.findIndex(x => x.code === i.code)
        if (index >= 0) indicateurs[index] = i
        else {
          const position = apres ? indicateurs.findIndex(x => x.code === apres) : -1
          indicateurs.splice(position >= 0 ? position + 1 : indicateurs.length, 0, i)
        }
      }

      const disponibleC = Array.isArray(chargesConstatees) && Array.isArray(fraisConstates)
      const disponibleP = Array.isArray(chargesP?.details) && fraisPrevision != null
      const totalC = disponibleC ? somme(detailsC, x => x.montant) : null
      const totalP = disponibleP ? somme(detailsP, x => x.montant) : null

      inserer(creerIndicateur("CHARGES", "Charges d'exploitation", totalC, totalP))
      const indexCharges = indicateurs.findIndex(i => i.code === "CHARGES")

      indicateurs.splice(indexCharges + 1, 0, ...detailsC.map((d, index) =>
        creerIndicateur(d.code, d.libelle, disponibleC ? d.montant : null, disponibleP ? detailsP[index]?.montant ?? null : null)
      ))

      inserer(creerIndicateur(
        "AMORTISSEMENTS", "Dotations aux amortissements",
        Array.isArray(amortissementsConstates) ? somme(amortC, x => x.montant) : null,
        totalAmortissements(amortP)
      ), "MASSE_SALARIALE")

      setEvaluation({ ...data, indicateurs, autresCategories, avertissements })
    } catch (e) {
      console.error("Erreur évaluation des prévisions :", e)
      setErreur(e instanceof Error ? e.message : "Impossible d'évaluer les prévisions.")
    } finally {
      setLoading(false)
    }
  }

  const indicateurs = liste(evaluation?.indicateurs).filter(i => !estAutres(i) && !estFraisExport(i))
  const trouver = (code: string) => indicateurs.find(i => i.code === code)
  const resultat = trouver("RESULTAT"), marge = trouver("MARGE"), amortissements = trouver("AMORTISSEMENTS")
  const convertir = (i: Indicateur): GraphData => ({ nom: i.libelle, Constaté: i.constate, Prévision: i.prevision })
  const graphiques = indicateurs.filter(i => i.unite === "MGA" && !CODES_DETAILS.has(i.code)).map(convertir)
  const graphiquesCharges = indicateurs.filter(i => CODES_DETAILS.has(i.code)).map(convertir)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Évaluation des prévisions</h2>
        <p className="mt-1 text-sm text-muted-foreground">Comparaison des budgets constatés et prévisionnels pour un même exercice.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {/* <BrainCircuit className="h-5 w-5" /> */}
          Sélection de l'exercice</CardTitle>
          <CardDescription>Choisissez une année possédant un budget généré et un budget prévisionnel.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="w-full sm:w-64">
              <Select value={annee} onValueChange={v => { setAnnee(v); setEvaluation(null); setErreur("") }} disabled={loadingAnnees || loading || !annees.length}>
                <SelectTrigger><SelectValue placeholder="Choisir une année" /></SelectTrigger>
                <SelectContent>{annees.map(a => <SelectItem key={a} value={String(a)}>{a}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button onClick={lancerEvaluation} disabled={!annee || loading || loadingAnnees}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ""}
              Comparer les prévisions
            </Button>
          </div>
        </CardContent>
      </Card>

      {erreur && (
        <Card><CardContent className="pt-6"><div className="flex gap-3 text-destructive"><AlertCircle className="h-5 w-5 shrink-0" /><p className="text-sm">{erreur}</p></div></CardContent></Card>
      )}

      {!loadingAnnees && !annees.length && !erreur && (
        <Card><CardContent className="py-12">
          <div className="flex flex-col items-center gap-3 text-center">
            <BrainCircuit className="h-10 w-10 text-muted-foreground" />
            <h3 className="font-semibold">Aucune évaluation disponible</h3>
            <p className="max-w-lg text-sm text-muted-foreground">Aucun exercice ne possède actuellement à la fois un budget généré et un budget prévisionnel.</p>
          </div>
        </CardContent></Card>
      )}

      {evaluation && <>
        {evaluation.avertissements?.map((message, index) => (
          <p key={index} className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/20 dark:text-amber-200">{message}</p>
        ))}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[resultat, marge, amortissements].filter((x): x is Indicateur => x !== undefined).map(item => (
            <Card key={item.code}>
              <CardHeader>
                <CardDescription>{item.libelle}</CardDescription>
                <CardTitle className="text-xl">{pourcentage(item.erreurPourcentage)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">Erreur relative absolue</p>
                <p className="text-sm">Écart : <span className="font-medium">{formatValeur(item.ecart, item.unite)}</span></p>
                <p className="text-sm">{item.diagnostic === "CONFORME" ? "Prévision conforme" : item.diagnostic === "SURESTIMATION" ? "Prévision supérieure au constaté" : item.diagnostic === "SOUS_ESTIMATION" ? "Prévision inférieure au constaté" : "Données indisponibles"}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Comparaison des indicateurs</CardTitle>
            <CardDescription>Exercice {evaluation.annee} — Budget constaté et prévision</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left">Indicateur</th>
                    {["Constaté", "Prévision", "Écart", "Erreur (%)"].map(x => <th key={x} className="p-3 text-right">{x}</th>)}
                    <th className="p-3 text-left">Diagnostic</th>
                  </tr>
                </thead>
                <tbody>
                  {indicateurs.map(item => {
                    const detail = CODES_DETAILS.has(item.code)
                    return (
                      <tr key={item.code} className={`border-b ${item.code === "CHARGES" ? "bg-muted/70 font-semibold" : detail ? "bg-muted/20" : ""}`}>
                        <td className={`p-3 ${detail ? "pl-8 text-muted-foreground" : "font-medium"}`}>{item.libelle}</td>
                        {[item.constate, item.prevision, item.ecart].map((v, index) => (
                          <td key={index} className="whitespace-nowrap p-3 text-right">{formatValeur(v, item.unite)}</td>
                        ))}
                        <td className="p-3 text-right">{pourcentage(item.erreurPourcentage)}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1">
                            {item.diagnostic === "CONFORME" ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> :
                              item.diagnostic === "SURESTIMATION" ? <TrendingUp className="h-4 w-4 text-blue-600" /> :
                              item.diagnostic === "SOUS_ESTIMATION" ? <TrendingDown className="h-4 w-4 text-slate-500" /> : <Minus className="h-4 w-4" />}
                            {item.diagnostic.replaceAll("_", " ")}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <GraphiqueEvaluation titre="Visualisation des écarts budgétaires annuels" description="Comparaison des montants constatés et prévisionnels en MGA." data={graphiques} />
        <GraphiqueEvaluation titre="Détail des charges d'exploitation" description="Achats consommés, Services extérieurs (autres charges et frais export inclus) et Impôts et taxes." data={graphiquesCharges} />

        <Card>
          <CardHeader>
            <CardTitle>Composition des charges d'exploitation</CardTitle>
            <CardDescription>Catégories utilisées pour les deux budgets.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left"><th className="p-3">Rubrique</th><th className="p-3">Catégories</th></tr></thead>
                <tbody>
                  {GROUPES.map(g => (
                    <tr key={g.code} className="border-b last:border-0">
                      <td className="p-3 font-medium">{g.libelle}</td>
                      <td className="p-3">
                        {[...g.categories, ...(g.code === "SERVICES_EXTERIEURS" ? [...(evaluation.autresCategories ?? []), "FRAIS EXPORT"] : [])].join(", ") || "Aucune catégorie"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interprétation des résultats</CardTitle>
            <CardDescription>Analyse automatique des écarts entre les prévisions et les données constatées.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {liste(evaluation.interpretations).map((texte, index) => (
              <div key={index} className="rounded-lg border p-4 text-sm leading-relaxed">{texte}</div>
            ))}
            {amortissements && (
              <p className="rounded-lg border p-4 text-sm">
                Dotations aux amortissements constatées : <strong>{formatValeur(amortissements.constate, "MGA")}</strong>.
                {" "}Dotations prévisionnelles : <strong>{formatValeur(amortissements.prevision, "MGA")}</strong>.
                {" "}Erreur relative : <strong>{pourcentage(amortissements.erreurPourcentage)}</strong>.
              </p>
            )}
          </CardContent>
        </Card>
      </>}
    </div>
  )
}
