"use client"

import { useEffect, useState } from "react"
import { ArrowLeftRight, Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getBudgetsProspectifs, getPrevisionsProspectives, comparerProspective } from "@/services/comparaison-prospective-service"
import { getBudgetDetails, getExercices } from "@/services/budget-details-service"
import { getAmortissementsPrevisionnels, getChargesCategoriesPrevisionnelles } from "@/services/prediction-details-service"

type Valeur = number | string | null
type Indicateur = { code: string; libelle: string; unite: string; valeur1: Valeur; valeur2: Valeur; ecart: Valeur; evolutionPourcentage: Valeur }
type Comparaison = { anneeBudget: number; anneePrevision: number; indicateurs: Indicateur[]; interpretations: string[]; budgetId: number; previsionId: number; autresCategories?: string[]; avertissements?: string[] }
type Exercice = { id?: number; id_exercice?: number; annee?: number; annee_exercice?: number }
type Charge = { categorie?: string | null; montant?: Valeur }
type FraisExport = { total?: Valeur }
type Amortissement = { montant?: Valeur }
type ChargesPrevisionnelles = { total_annuel?: Valeur; details?: { mois_id: number; categorie: string; montant_prevu: Valeur }[] }
type AmortissementsPrevisionnels = { total_annuel?: Valeur; mensuel?: { mois_id: number; mois: string; montant: Valeur }[] }
type Groupe = { code: string; libelle: string; categories: string[] }
type GraphData = { nom: string; budget: number | null; prevision: number | null }

const GROUPES: Groupe[] = [
  { code: "ACHATS_CONSOMMES", libelle: "Achats consommés", categories: ["ACHAT PRODUITS", "PRODUCTION"] },
  { code: "SERVICES_EXTERIEURS", libelle: "Services extérieurs", categories: ["ADMINISTRATION", "FINANCE", "LOGISTIQUE", "SECURITE"] },
  { code: "IMPOTS_TAXES", libelle: "Impôts et taxes", categories: ["FISCAL"] },
]

const CODES_DETAILS = new Set(GROUPES.map(g => g.code))
const FRAIS_EXPORT = new Set(["FRAIS EXPORT", "FRAIS EXPORTATION", "FRAIS D EXPORTATION"])
const nombre = (v: unknown) => Number.isFinite(Number(v)) ? Number(v) : 0
const normaliser = (v: unknown) => String(v ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[_'’.-]/g, " ").replace(/\s+/g, " ").trim()
const liste = <T,>(v: T[] | null | undefined): T[] => Array.isArray(v) ? v : []
const format = (v: unknown, d = 0) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: d }).format(nombre(v))
const valeur = (v: Valeur, point = false) => v == null ? "—" : `${format(nombre(v) * (point ? 100 : 1), point ? 2 : 0)}${point ? " %" : ""}`
const evolution = (i: Indicateur) => i.evolutionPourcentage == null ? "Non calculable" : `${nombre(i.evolutionPourcentage) > 0 ? "+" : ""}${format(i.evolutionPourcentage, 2)} %`
const somme = <T,>(lignes: T[], lire: (ligne: T) => unknown) => liste(lignes).reduce((s, l) => s + nombre(lire(l)), 0)
const estFraisExport = (i: Indicateur) => FRAIS_EXPORT.has(normaliser(i.code)) || FRAIS_EXPORT.has(normaliser(i.libelle))
const estAutres = (i: Indicateur) => normaliser(i.code) === "AUTRES CHARGES" || normaliser(i.libelle) === "AUTRES CHARGES"

function creerIndicateur(code: string, libelle: string, budget: number | null, prevision: number | null): Indicateur {
  const ecart = budget == null || prevision == null ? null : prevision - budget
  return { code, libelle, unite: "MGA", valeur1: budget, valeur2: prevision, ecart, evolutionPourcentage: ecart == null || !budget ? null : ecart / Math.abs(budget) * 100 }
}

function trouverExerciceId(exercices: Exercice[], annee: string) {
  const e = exercices.find(x => String(x.annee_exercice ?? x.annee) === annee)
  return e?.id_exercice ?? e?.id ?? null
}

function calculerDetails<T>(lignes: T[], lireCategorie: (l: T) => unknown, lireMontant: (l: T) => unknown, frais: number, autresBackend: Valeur = null) {
  const connues = new Set(GROUPES.flatMap(g => g.categories.map(normaliser)))
  const autres = somme(liste(lignes).filter(l => {
    const c = normaliser(lireCategorie(l))
    return c && !connues.has(c) && !FRAIS_EXPORT.has(c)
  }), lireMontant)

  return GROUPES.map(g => ({
    code: g.code,
    libelle: g.libelle,
    montant: somme(liste(lignes).filter(l => g.categories.some(c => normaliser(c) === normaliser(lireCategorie(l)))), lireMontant)
      + (g.code === "SERVICES_EXTERIEURS" ? frais + (autresBackend == null ? autres : nombre(autresBackend)) : 0),
  }))
}

function totalAmortissements(data: AmortissementsPrevisionnels | null): number | null {
  if (!data) return null
  if (data.total_annuel != null) return nombre(data.total_annuel)
  return Array.isArray(data.mensuel) ? somme(data.mensuel, x => x.montant) : null
}

function Graphique({ titre, description, data, anneeBudget, anneePrevision, hauteur = 380 }: {
  titre: string; description: string; data: GraphData[]; anneeBudget: number; anneePrevision: number; hauteur?: number
}) {
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
              <Tooltip formatter={(v, name) => [v == null ? "Non disponible" : `${format(v, 3)} Md MGA`, name]} />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="budget" name={`Budget ${anneeBudget}`} fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={55} />
              <Bar dataKey="prevision" name={`Prévision ${anneePrevision}`} fill="#7c9fcd" radius={[4, 4, 0, 0]} maxBarSize={55} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ComparaisonProspective() {
  const [budgets, setBudgets] = useState<string[]>([])
  const [previsions, setPrevisions] = useState<string[]>([])
  const [exercices, setExercices] = useState<Exercice[]>([])
  const [anneeBudget, setAnneeBudget] = useState("")
  const [anneePrevision, setAnneePrevision] = useState("")
  const [resultat, setResultat] = useState<Comparaison | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialisation, setInitialisation] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let actif = true
    async function charger() {
      try {
        const [b, p, e] = await Promise.all([getBudgetsProspectifs(), getPrevisionsProspectives(), getExercices()])
        if (!actif) return
        const bs = liste(b as (string | number)[]).map(String).sort((a, b) => Number(a) - Number(b))
        const ps = liste(p as (string | number)[]).map(String).sort((a, b) => Number(a) - Number(b))
        const paire = [...bs].reverse().flatMap(budget => ps.filter(prevision => Number(prevision) > Number(budget)).map(prevision => ({ budget, prevision })))[0]
        setBudgets(bs)
        setPrevisions(ps)
        setExercices(liste(e as Exercice[]))
        setAnneeBudget(paire?.budget ?? bs[bs.length - 1] ?? "")
        setAnneePrevision(paire?.prevision ?? ps[0] ?? "")
      } catch (e) {
        if (actif) setError(e instanceof Error ? e.message : "Erreur de chargement")
      } finally {
        if (actif) setInitialisation(false)
      }
    }
    void charger()
    return () => { actif = false }
  }, [])

  async function comparer() {
    if (loading || !anneeBudget || !anneePrevision || Number(anneePrevision) <= Number(anneeBudget)) return
    setLoading(true)
    setError("")
    setResultat(null)

    try {
      const data: Comparaison = await comparerProspective(Number(anneeBudget), Number(anneePrevision))
      if (!data) throw new Error("Aucun résultat de comparaison disponible.")

      const exerciceId = trouverExerciceId(exercices, anneeBudget)
      if (exerciceId == null) throw new Error("Identifiant de l'exercice de référence introuvable.")

      const [chargesBudget, fraisBudget, amortissementsBudget] = await Promise.all([
        getBudgetDetails("charges", exerciceId),
        getBudgetDetails("frais-export", exerciceId),
        getBudgetDetails("amortissements", exerciceId),
      ])

      const [reponseCharges, reponseAmortissements] = await Promise.allSettled([
        getChargesCategoriesPrevisionnelles(Number(anneePrevision)),
        getAmortissementsPrevisionnels(Number(anneePrevision)),
      ])

      const chargesPrevision: ChargesPrevisionnelles | null = reponseCharges.status === "fulfilled" ? reponseCharges.value : null
      const amortissementsPrevision: AmortissementsPrevisionnels | null = reponseAmortissements.status === "fulfilled" ? reponseAmortissements.value : null
      const avertissements: string[] = []

      if (!chargesPrevision) avertissements.push("Les catégories de charges prévisionnelles ne sont pas disponibles.")
      if (!amortissementsPrevision) avertissements.push("Les amortissements prévisionnels ne sont pas disponibles.")

      const indicateursBackend = liste(data.indicateurs)
      const autresBackend = indicateursBackend.find(estAutres)
      const fraisBackend = indicateursBackend.find(estFraisExport)
      const fraisPrevision = fraisBackend?.valeur2 == null ? null : nombre(fraisBackend.valeur2)

      if (fraisPrevision == null) avertissements.push("Les frais export prévisionnels ne sont pas disponibles séparément. Le détail des services extérieurs peut être incomplet.")

      const chargesB = liste(chargesBudget as Charge[])
      const fraisB = liste(fraisBudget as FraisExport[])
      const amortB = liste(amortissementsBudget as Amortissement[])
      const detailsB = calculerDetails(chargesB, x => x.categorie, x => x.montant, somme(fraisB, x => x.total), autresBackend?.valeur1)
      const detailsP = chargesPrevision && fraisPrevision != null
        ? calculerDetails(liste(chargesPrevision.details), x => x.categorie, x => x.montant_prevu, fraisPrevision, autresBackend?.valeur2)
        : []

      const connues = new Set(GROUPES.flatMap(g => g.categories.map(normaliser)))
      const autresCategories = [...new Set([
        ...chargesB.map(x => normaliser(x.categorie)),
        ...liste(chargesPrevision?.details).map(x => normaliser(x.categorie)),
      ])].filter(c => c && !connues.has(c) && !FRAIS_EXPORT.has(c))

      const indicateurs = indicateursBackend.filter(i => !estFraisExport(i) && !estAutres(i) && !CODES_DETAILS.has(i.code) && i.code !== "AMORTISSEMENTS").map(i => ({ ...i }))

      function inserer(i: Indicateur, apres: string | null = null) {
        const index = indicateurs.findIndex(x => x.code === i.code)
        if (index >= 0) indicateurs[index] = i
        else {
          const position = apres ? indicateurs.findIndex(x => x.code === apres) : -1
          indicateurs.splice(position >= 0 ? position + 1 : indicateurs.length, 0, i)
        }
      }

      const disponibleB = Array.isArray(chargesBudget) && Array.isArray(fraisBudget)
      const disponibleP = Array.isArray(chargesPrevision?.details) && fraisPrevision != null
      const totalB = disponibleB ? somme(detailsB, x => x.montant) : null
      const totalP = disponibleP ? somme(detailsP, x => x.montant) : null

      inserer(creerIndicateur("CHARGES", "Charges d'exploitation", totalB, totalP))
      const indexCharges = indicateurs.findIndex(i => i.code === "CHARGES")
      indicateurs.splice(indexCharges + 1, 0, ...detailsB.map((d, index) =>
        creerIndicateur(d.code, d.libelle, disponibleB ? d.montant : null, disponibleP ? detailsP[index]?.montant ?? null : null)
      ))

      inserer(creerIndicateur(
        "AMORTISSEMENTS", "Dotations aux amortissements",
        Array.isArray(amortissementsBudget) ? somme(amortB, x => x.montant) : null,
        totalAmortissements(amortissementsPrevision)
      ), "MASSE_SALARIALE")

      setResultat({ ...data, indicateurs, autresCategories, avertissements })
    } catch (e) {
      console.error("Erreur comparaison prospective :", e)
      setError(e instanceof Error ? e.message : "Comparaison impossible")
    } finally {
      setLoading(false)
    }
  }

  const indicateurs = liste(resultat?.indicateurs).filter(i => !estAutres(i) && !estFraisExport(i))
  const trouver = (code: string) => indicateurs.find(i => i.code === code)
  const amortissements = trouver("AMORTISSEMENTS")
  const principaux = [
    ["Chiffre d'affaires", "CA_EXPORT"], ["Charges d'exploitation", "CHARGES"],
    ["Achats consommés", "ACHATS_CONSOMMES"], ["Services extérieurs", "SERVICES_EXTERIEURS"],
    ["Impôts et taxes", "IMPOTS_TAXES"], ["Masse salariale", "MASSE_SALARIALE"],
    ["Amortissements", "AMORTISSEMENTS"], ["Résultat opérationnel", "RESULTAT"],
    ["Marge opérationnelle", "MARGE"],
  ].map(([label, code]) => ({ label, item: trouver(code) })).filter((x): x is { label: string; item: Indicateur } => x.item !== undefined)

  const libelles: Record<string, string> = {
    CA_EXPORT: "CA export", CHARGES: "Charges d'exploitation", MASSE_SALARIALE: "Masse salariale",
    AMORTISSEMENTS: "Amortissements", RESULTAT: "Résultat opérationnel",
  }
  const convertirGraphique = (i: Indicateur): GraphData => ({
    nom: libelles[i.code] || i.libelle,
    budget: i.valeur1 == null ? null : nombre(i.valeur1) / 1e9,
    prevision: i.valeur2 == null ? null : nombre(i.valeur2) / 1e9,
  })
  const graphiquePrincipal = indicateurs.filter(i => i.unite === "MGA" && !CODES_DETAILS.has(i.code)).map(convertirGraphique)
  const graphiqueCharges = indicateurs.filter(i => CODES_DETAILS.has(i.code)).map(convertirGraphique)

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sélection des exercices</CardTitle>
          <CardDescription>Choisissez un budget généré et une prévision budgétaire d'une année ultérieure.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
            {[
              { label: "Budget de référence", value: anneeBudget, setter: setAnneeBudget, options: budgets },
              { label: "Année prévisionnelle", value: anneePrevision, setter: setAnneePrevision, options: previsions },
            ].map(f => (
              <label key={f.label} className="space-y-2 text-sm font-medium">
                {f.label}
                <select value={f.value} onChange={e => { f.setter(e.target.value); setResultat(null) }}
                  className="block h-10 w-full rounded-md border bg-background px-3 font-normal" disabled={initialisation || loading}>
                  <option value="">Choisir une année</option>
                  {f.options.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </label>
            ))}
            <Button onClick={comparer} disabled={loading || initialisation || !anneeBudget || !anneePrevision || Number(anneePrevision) <= Number(anneeBudget)}>
              {/* {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowLeftRight className="mr-2 h-4 w-4" />} */}
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ""}

              Comparer
            </Button>
          </div>
          {!initialisation && (!budgets.length || !previsions.length) && !error && <p className="text-sm text-muted-foreground">Un budget généré et une prévision sont nécessaires.</p>}
          {anneeBudget && anneePrevision && Number(anneePrevision) <= Number(anneeBudget) && <p className="text-sm text-amber-700">La prévision doit porter sur une année ultérieure à celle du budget.</p>}
          {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        </CardContent>
      </Card>

      {resultat && <>
        {resultat.avertissements?.map((message, index) => (
          <p key={index} className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/20 dark:text-amber-200">{message}</p>
        ))}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {principaux.map(({ label, item }) => (
            <Card key={label}>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">{label} — évolution</p>
                <div className="mt-2 flex items-center gap-2 text-2xl font-semibold">
                  {item.evolutionPourcentage == null ? <Minus className="h-5 w-5" /> :
                    nombre(item.evolutionPourcentage) > 0 ? <TrendingUp className="h-5 w-5 text-emerald-600" /> :
                    nombre(item.evolutionPourcentage) < 0 ? <TrendingDown className="h-5 w-5 text-rose-600" /> : <Minus className="h-5 w-5" />}
                  {evolution(item)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tableau comparatif</CardTitle>
            <CardDescription>Budget {resultat.anneeBudget} et prévision {resultat.anneePrevision} — montants en MGA.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left">
                    <th className="p-3">Indicateur</th>
                    {[
                      `Budget ${resultat.anneeBudget}`, `Prévision ${resultat.anneePrevision}`, "Écart", "Évolution",
                    ].map(x => <th key={x} className="p-3 text-right">{x}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {indicateurs.map((i, index) => {
                    const point = i.unite === "POINT", detail = CODES_DETAILS.has(i.code)
                    return (
                      <tr key={`${i.code}-${index}`} className={`border-b hover:bg-muted/30 ${i.code === "CHARGES" ? "bg-muted/70 font-semibold" : detail ? "bg-muted/20" : ""}`}>
                        <td className={`p-3 ${detail ? "pl-8 text-muted-foreground" : "font-medium"}`}>{i.libelle}</td>
                        {[i.valeur1, i.valeur2, i.ecart].map((v, n) => (
                          <td key={n} className="whitespace-nowrap p-3 text-right">{valeur(v, point)}</td>
                        ))}
                        <td className="whitespace-nowrap p-3 text-right">{evolution(i)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Les frais export et les autres charges sont intégrés aux services extérieurs. Les amortissements et la masse salariale restent séparés des charges d'exploitation. Les valeurs indisponibles ne sont pas assimilées à zéro.
            </p>
          </CardContent>
        </Card>

        <Graphique titre="Visualisation annuelle" description="Comparaison des principaux indicateurs en milliards MGA."
          data={graphiquePrincipal} anneeBudget={resultat.anneeBudget} anneePrevision={resultat.anneePrevision} hauteur={410} />

        <Graphique titre="Détail des charges d'exploitation"
          description="Achats consommés, Services extérieurs (autres charges et frais export inclus) et Impôts et taxes — milliards MGA."
          data={graphiqueCharges} anneeBudget={resultat.anneeBudget} anneePrevision={resultat.anneePrevision} hauteur={360} />

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Composition des charges d'exploitation</CardTitle>
            <CardDescription>Catégories prises en compte dans chaque rubrique.</CardDescription>
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
                        {[...g.categories, ...(g.code === "SERVICES_EXTERIEURS" ? [...(resultat.autresCategories ?? []), "FRAIS EXPORT"] : [])].join(", ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Interprétation automatique</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {liste(resultat.interpretations).map((texte, index) => (
              <p key={index} className="rounded-md bg-muted/40 p-3 text-sm">{texte}</p>
            ))}
            {amortissements && (
              <p className="rounded-md bg-muted/40 p-3 text-sm">
                Les dotations aux amortissements du budget de référence s'élèvent à{" "}
                <strong>{valeur(amortissements.valeur1)} MGA</strong>.{" "}
                {amortissements.valeur2 == null
                  ? "Les amortissements prévisionnels ne sont pas disponibles."
                  : `Les dotations prévisionnelles s'élèvent à ${valeur(amortissements.valeur2)} MGA, soit une évolution de ${evolution(amortissements)}.`}
              </p>
            )}
          </CardContent>
        </Card>
      </>}
    </div>
  )
}


