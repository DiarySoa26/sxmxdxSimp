"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getAmortissementsPrevisionnels, getChargesCategoriesPrevisionnelles } from "@/services/prediction-details-service"

type PredictionMensuelle = {
  mois_id: number
  mois: string
  ventes: number
  production: number
  ca_export: number
  charges_exploitation: number
  frais_export: number
  masse_salariale: number
  amortissements?: number
  resultat_operationnel: number
  marge_operationnelle: number
}

export type Prediction = {
  id: number
  annee: number
  annee_reference: number
  type_budget: string
  statut: string
  modele: string
  version_modele?: string
  ca_export: number
  charges_exploitation: number
  frais_export: number
  masse_salariale: number
  amortissements?: number
  resultat_operationnel: number
  marge_operationnelle: number
  date_generation?: string
  resume?: string
  mois: PredictionMensuelle[]
}

type AmortissementsResponse = {
  annee: number
  budget_id: number
  type_budget: string
  total_annuel: number
  mensuel: { mois_id: number; mois: string; montant: number }[]
}

type ChargesCategoriesResponse = {
  annee: number
  budget_id: number
  type_budget: string
  total_annuel: number
  categories: { categorie: string; total_annuel: number }[]
  mensuel: { mois_id: number; mois: string; total: number }[]
  details: { mois_id: number; categorie: string; montant_prevu: number }[]
}

type LigneTableau = {
  code: string
  libelle: string
  format: "montant" | "nombre" | "pourcentage"
  detail?: boolean
  valeurs: (number | null | undefined)[]
}

const NOMS_MOIS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]

const GROUPES_CHARGES = [
  { code: "ACHATS_CONSOMMES", libelle: "Achats consommés", categories: ["ACHAT PRODUITS"] },
  { code: "SERVICES_EXTERIEURS", libelle: "Services extérieurs", categories: ["ADMINISTRATION", "FINANCE", "LOGISTIQUE"] },
  { code: "IMPOTS_TAXES", libelle: "Impôts et taxes", categories: ["FISCAL"] }
]

const normaliser = (v: string | null | undefined) => String(v ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[_'’.-]/g, " ").replace(/\s+/g, " ").trim()
const nombre = (v: unknown) => v == null || v === "" || !Number.isFinite(Number(v)) ? 0 : Number(v)
const formatMontant = (v: number | null | undefined) => v == null ? "-" : new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(nombre(v))
const formatNombre = (v: number | null | undefined) => v == null ? "-" : new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(nombre(v))
const formatPourcentage = (v: number | null | undefined) => {
  if (v == null) return "-"
  const n = nombre(v)
  return `${new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(n) <= 1 ? n * 100 : n)} %`
}

export default function PredictionDetails({ prediction }: { prediction: Prediction }) {
  const [amortissements, setAmortissements] = useState<AmortissementsResponse | null>(null)
  const [chargesCategories, setChargesCategories] = useState<ChargesCategoriesResponse | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(true)
  const [erreurDetails, setErreurDetails] = useState("")

  useEffect(() => {
    let actif = true
    async function charger() {
      setLoadingDetails(true)
      setErreurDetails("")
      setAmortissements(null)
      setChargesCategories(null)
      const [a, c] = await Promise.allSettled([
        getAmortissementsPrevisionnels(prediction.annee),
        getChargesCategoriesPrevisionnelles(prediction.annee)
      ])
      if (!actif) return
      if (a.status === "fulfilled") setAmortissements(a.value)
      if (c.status === "fulfilled") setChargesCategories(c.value)
      if (a.status === "rejected" || c.status === "rejected") setErreurDetails("Certaines données financières détaillées n'ont pas pu être chargées.")
      setLoadingDetails(false)
    }
    void charger()
    return () => { actif = false }
  }, [prediction.annee, prediction.id])

  const mois = useMemo(() => [...(prediction.mois || [])].sort((a, b) => Number(a.mois_id) - Number(b.mois_id)), [prediction.mois])

  const groupes = useMemo(() => {
    const details = chargesCategories?.details || []
    const connues = new Set(GROUPES_CHARGES.flatMap(g => g.categories.map(normaliser)))
    const exclusions = new Set(["FRAIS EXPORT", "FRAIS EXPORTATION", "FRAIS D EXPORTATION"])
    const autres = [...new Set(details.map(l => normaliser(l.categorie)))].filter(c => c && !connues.has(c) && !exclusions.has(c))
    return GROUPES_CHARGES.map(g => g.code === "SERVICES_EXTERIEURS" ? { ...g, categories: [...g.categories, ...autres] } : g)
  }, [chargesCategories])

  const montantGroupe = (code: string, moisId: number) => {
    if (!chargesCategories) return null
    const groupe = groupes.find(g => g.code === code)
    if (!groupe) return null
    const categories = new Set(groupe.categories.map(normaliser))
    const total = (chargesCategories.details || [])
      .filter(l => Number(l.mois_id) === moisId && categories.has(normaliser(l.categorie)))
      .reduce((s, l) => s + nombre(l.montant_prevu), 0)
    if (code === "SERVICES_EXTERIEURS") {
      const m = mois.find(l => Number(l.mois_id) === moisId)
      return total + nombre(m?.frais_export)
    }
    return total
  }

  const amortissementMensuel = (m: PredictionMensuelle) =>
    amortissements?.mensuel?.find(a => Number(a.mois_id) === Number(m.mois_id))?.montant ?? m.amortissements ?? null

  const amortissementAnnuel = amortissements?.total_annuel ?? prediction.amortissements ?? null
  const chargesAnnuelles = nombre(prediction.charges_exploitation) + nombre(prediction.frais_export)

  const lignesTableau: LigneTableau[] = [
    { code: "VENTES", libelle: "Ventes", format: "nombre", valeurs: mois.map(m => m.ventes) },
    { code: "PRODUCTION", libelle: "Production", format: "nombre", valeurs: mois.map(m => m.production) },
    { code: "CA_EXPORT", libelle: "CA export", format: "montant", valeurs: mois.map(m => m.ca_export) },
    { code: "CHARGES", libelle: "Charges d'exploitation", format: "montant", valeurs: mois.map(m => nombre(m.charges_exploitation) + nombre(m.frais_export)) },
    ...groupes.map(g => ({
      code: g.code, libelle: g.libelle, format: "montant" as const, detail: true,
      valeurs: mois.map(m => montantGroupe(g.code, Number(m.mois_id)))
    })),
    { code: "MASSE_SALARIALE", libelle: "Masse salariale", format: "montant", valeurs: mois.map(m => m.masse_salariale) },
    { code: "AMORTISSEMENTS", libelle: "Amortissements", format: "montant", valeurs: mois.map(amortissementMensuel) },
    { code: "RESULTAT", libelle: "Résultat opérationnel", format: "montant", valeurs: mois.map(m => m.resultat_operationnel) },
    { code: "MARGE", libelle: "Marge opérationnelle", format: "pourcentage", valeurs: mois.map(m => m.marge_operationnelle) }
  ]

  const afficherValeur = (v: number | null | undefined, format: LigneTableau["format"]) =>
    format === "nombre" ? formatNombre(v) : format === "pourcentage" ? formatPourcentage(v) : formatMontant(v)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Prévision budgétaire {prediction.annee}</CardTitle>
          <CardDescription>Budget prévisionnel généré à partir de l&apos;exercice {prediction.annee_reference}.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Info titre="Année prévisionnelle" valeur={prediction.annee} />
            <Info titre="Année de référence" valeur={prediction.annee_reference} />
            <Info titre="Type" valeur={prediction.type_budget} />
            <Info titre="Statut" valeur={prediction.statut} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prédiction annuelle</CardTitle>
          <CardDescription>Synthèse du budget prévisionnel pour l&apos;année {prediction.annee}.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm">
            <thead>
              <tr className="border-b text-left">
                {["CA export", "Charges exploitation", "Masse salariale", "Amortissements", "Résultat opérationnel", "Marge"].map(t => <th key={t} className="px-3 py-3 font-medium">{t}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-3 py-4">{formatMontant(prediction.ca_export)} MGA</td>
                <td className="px-3 py-4">{formatMontant(chargesAnnuelles)} MGA</td>
                <td className="px-3 py-4">{formatMontant(prediction.masse_salariale)} MGA</td>
                <td className="px-3 py-4">{formatMontant(amortissementAnnuel)} MGA</td>
                <td className="px-3 py-4 font-medium">{formatMontant(prediction.resultat_operationnel)} MGA</td>
                <td className="px-3 py-4 font-medium">{formatPourcentage(prediction.marge_operationnelle)}</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      {loadingDetails && <p className="text-sm text-muted-foreground">Chargement des détails financiers...</p>}
      {erreurDetails && <p role="alert" className="text-sm text-destructive">{erreurDetails}</p>}

      <Card>
        <CardHeader>
          <CardTitle>Prédiction mensuelle</CardTitle>
          <CardDescription>Détail des prévisions de janvier à décembre {prediction.annee}. Montants en MGA.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {mois.length ? (
            <table className="w-full min-w-[1500px] text-sm">
              <thead>
                <tr className="border-b">
                  <th className="sticky left-0 z-10 bg-background px-4 py-3 text-left font-medium">Indicateur</th>
                  {mois.map(m => <th key={m.mois_id} className="px-4 py-3 text-right font-medium">{m.mois || NOMS_MOIS[Number(m.mois_id) - 1]}</th>)}
                </tr>
              </thead>
              <tbody>
                {lignesTableau.map(ligne => (
                  <tr key={ligne.code} className={`border-b last:border-0 ${ligne.detail ? "bg-muted/20 text-muted-foreground" : ligne.code === "CHARGES" ? "bg-muted/40 font-semibold" : ""}`}>
                    <td className={`sticky left-0 bg-background px-4 py-3 ${ligne.detail ? "pl-8 text-muted-foreground" : "font-medium"}`}>{ligne.libelle}</td>
                    {ligne.valeurs.map((v, i) => <td key={`${ligne.code}-${mois[i].mois_id}`} className="whitespace-nowrap px-4 py-3 text-right">{afficherValeur(v, ligne.format)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <div className="py-8 text-center text-sm text-muted-foreground">Aucune prédiction mensuelle disponible.</div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Composition des charges d&apos;exploitation</CardTitle>
          <CardDescription>Répartition des catégories de charges par rubrique comptable.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="px-3 py-3 font-medium">Rubrique</th>
                <th className="px-3 py-3 font-medium">Catégories</th>
              </tr>
            </thead>
            <tbody>
              {groupes.map(g => (
                <tr key={g.code} className="border-b last:border-0">
                  <td className="px-3 py-3 font-medium">{g.libelle}</td>
                  <td className="px-3 py-3">{[...g.categories, ...(g.code === "SERVICES_EXTERIEURS" ? ["FRAIS EXPORT"] : [])].join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Résumé de l&apos;analyse</CardTitle>
          <CardDescription>Interprétation automatique des résultats de la prévision {prediction.annee}.</CardDescription>
        </CardHeader>
        <CardContent>
          {prediction.resume
            ? <div className="whitespace-pre-line text-sm leading-7 text-muted-foreground">{prediction.resume}</div>
            : <p className="text-sm text-muted-foreground">Aucun résumé disponible.</p>}
        </CardContent>
      </Card>
    </div>
  )
}

function Info({ titre, valeur }: { titre: string; valeur: string | number }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs text-muted-foreground">{titre}</p>
      <p className="mt-1 text-lg font-semibold">{valeur}</p>
    </div>
  )
}
