"use client"

import { useEffect, useMemo, useState } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  getAmortissementsPrevisionnels,
  getChargesCategoriesPrevisionnelles,
} from "@/services/prediction-details-service"

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
  mensuel: {
    mois_id: number
    mois: string
    montant: number
  }[]
}

type ChargesCategoriesResponse = {
  annee: number
  budget_id: number
  type_budget: string
  total_annuel: number
  categories: {
    categorie: string
    total_annuel: number
  }[]
  mensuel: {
    mois_id: number
    mois: string
    total: number
  }[]
  details: {
    mois_id: number
    categorie: string
    montant_prevu: number
  }[]
}

type Props = {
  prediction: Prediction
}

type LigneTableau = {
  code: string
  libelle: string
  format: "montant" | "nombre" | "pourcentage"
  detail?: boolean
  valeurs: (number | null | undefined)[]
}

const NOMS_MOIS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
]

const GROUPES_CHARGES = [
  {
    code: "ACHATS_CONSOMMES",
    libelle: "Achats consommés",
    categories: ["ACHAT PRODUITS"],
  },
  {
    code: "SERVICES_EXTERIEURS",
    libelle: "Services extérieurs",
    categories: ["ADMINISTRATION", "FINANCE", "LOGISTIQUE"],
  },
  {
    code: "IMPOTS_TAXES",
    libelle: "Impôts et taxes",
    categories: ["FISCAL"],
  },
]

const normaliser = (valeur: string | null | undefined) =>
  String(valeur ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[_'’.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()

const nombre = (valeur: unknown) => {
  const n = Number(valeur)
  return Number.isFinite(n) ? n : 0
}

const formatMontant = (valeur: number | null | undefined) => {
  if (valeur === null || valeur === undefined) return "-"

  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(nombre(valeur))
}

const formatNombre = (valeur: number | null | undefined) => {
  if (valeur === null || valeur === undefined) return "-"

  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(nombre(valeur))
}

const formatPourcentage = (valeur: number | null | undefined) => {
  if (valeur === null || valeur === undefined) return "-"

  const n = nombre(valeur)
  const pourcentage = Math.abs(n) <= 1 ? n * 100 : n

  return `${new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(pourcentage)} %`
}

export default function PredictionDetails({ prediction }: Props) {
  const [amortissements, setAmortissements] =
    useState<AmortissementsResponse | null>(null)

  const [chargesCategories, setChargesCategories] =
    useState<ChargesCategoriesResponse | null>(null)

  const [loadingDetails, setLoadingDetails] = useState(true)
  const [erreurDetails, setErreurDetails] = useState("")

  // CHARGEMENT DES DEUX API
  useEffect(() => {
    let actif = true

    async function chargerDetails() {
      setLoadingDetails(true)
      setErreurDetails("")
      setAmortissements(null)
      setChargesCategories(null)

      const resultats = await Promise.allSettled([
        getAmortissementsPrevisionnels(prediction.annee),
        getChargesCategoriesPrevisionnelles(prediction.annee),
      ])

      if (!actif) return

      const [resultatAmort, resultatCharges] = resultats

      if (resultatAmort.status === "fulfilled") {
        setAmortissements(resultatAmort.value)
      }

      if (resultatCharges.status === "fulfilled") {
        setChargesCategories(resultatCharges.value)
      }

      if (
        resultatAmort.status === "rejected" ||
        resultatCharges.status === "rejected"
      ) {
        setErreurDetails(
          "Certaines données financières détaillées n'ont pas pu être chargées."
        )
      }

      setLoadingDetails(false)
    }

    chargerDetails()

    return () => {
      actif = false
    }
  }, [prediction.annee, prediction.id])

  // MOIS TRIES
  const mois = useMemo(
    () =>
      [...(prediction.mois || [])].sort(
        (a, b) => Number(a.mois_id) - Number(b.mois_id)
      ),
    [prediction.mois]
  )

  // REGROUPEMENT DES CHARGES
  const groupes = useMemo(() => {
    const categoriesDisponibles = new Set(
      (chargesCategories?.details || []).map(
        (ligne) => normaliser(ligne.categorie)
      )
    )

    const categoriesConnues = new Set(
      GROUPES_CHARGES.flatMap((g) =>
        g.categories.map(normaliser)
      )
    )

    const autres = [...categoriesDisponibles].filter(
      (categorie) =>
        categorie &&
        !categoriesConnues.has(categorie) &&
        !["FRAIS EXPORT", "FRAIS EXPORTATION", "FRAIS D EXPORTATION"]
          .includes(categorie)
    )

    return [
      ...GROUPES_CHARGES,
      ...(autres.length > 0
        ? [
            {
              code: "AUTRES_CHARGES",
              libelle: "Autres charges",
              categories: autres,
            },
          ]
        : []),
    ]
  }, [chargesCategories])

  // CALCUL DES RUBRIQUES MENSUELLES
  const montantGroupe = (code: string, moisId: number) => {
    if (!chargesCategories) return null

    const groupe = groupes.find((g) => g.code === code)
    if (!groupe) return null

    const ensemble = new Set(
      groupe.categories.map(normaliser)
    )

    const totalCategories = (chargesCategories.details || [])
      .filter(
        (ligne) =>
          Number(ligne.mois_id) === moisId &&
          ensemble.has(normaliser(ligne.categorie))
      )
      .reduce(
        (somme, ligne) =>
          somme + nombre(ligne.montant_prevu),
        0
      )

    // LES FRAIS EXPORT FONT PARTIE DES SERVICES EXTERIEURS
    if (code === "SERVICES_EXTERIEURS") {
      const ligneMensuelle = mois.find(
        (m) => Number(m.mois_id) === moisId
      )

      return totalCategories + nombre(ligneMensuelle?.frais_export)
    }

    return totalCategories
  }

  // AMORTISSEMENTS MENSUELS
  const amortissementMensuel = (ligne: PredictionMensuelle) => {
    const detail = amortissements?.mensuel?.find(
      (item) =>
        Number(item.mois_id) === Number(ligne.mois_id)
    )

    return detail?.montant ?? ligne.amortissements ?? null
  }

  const amortissementAnnuel =
    amortissements?.total_annuel ??
    prediction.amortissements ??
    null

  // CHARGES D'EXPLOITATION AVEC FRAIS EXPORT
  const chargesAnnuelles =
    nombre(prediction.charges_exploitation) +
    nombre(prediction.frais_export)

  // LIGNES DU TABLEAU MENSUEL
  const lignesTableau: LigneTableau[] = [
    {
      code: "VENTES",
      libelle: "Ventes",
      format: "nombre",
      valeurs: mois.map((m) => m.ventes),
    },
    {
      code: "PRODUCTION",
      libelle: "Production",
      format: "nombre",
      valeurs: mois.map((m) => m.production),
    },
    {
      code: "CA_EXPORT",
      libelle: "CA export",
      format: "montant",
      valeurs: mois.map((m) => m.ca_export),
    },
    {
      code: "CHARGES",
      libelle: "Charges d'exploitation",
      format: "montant",
      valeurs: mois.map(
        (m) =>
          nombre(m.charges_exploitation) +
          nombre(m.frais_export)
      ),
    },
    ...groupes.map((g) => ({
      code: g.code,
      libelle: g.libelle,
      format: "montant" as const,
      detail: true,
      valeurs: mois.map((m) =>
        montantGroupe(g.code, Number(m.mois_id))
      ),
    })),
    {
      code: "MASSE_SALARIALE",
      libelle: "Masse salariale",
      format: "montant",
      valeurs: mois.map((m) => m.masse_salariale),
    },
    {
      code: "AMORTISSEMENTS",
      libelle: "Amortissements",
      format: "montant",
      valeurs: mois.map(amortissementMensuel),
    },
    {
      code: "RESULTAT",
      libelle: "Résultat opérationnel",
      format: "montant",
      valeurs: mois.map((m) => m.resultat_operationnel),
    },
    {
      code: "MARGE",
      libelle: "Marge opérationnelle",
      format: "pourcentage",
      valeurs: mois.map((m) => m.marge_operationnelle),
    },
  ]

  const afficherValeur = (
    valeur: number | null | undefined,
    format: LigneTableau["format"]
  ) => {
    if (format === "nombre") return formatNombre(valeur)
    if (format === "pourcentage") return formatPourcentage(valeur)
    return formatMontant(valeur)
  }

  return (
    <div className="space-y-6">
      {/* INFORMATIONS GENERALES */}
      <Card>
        <CardHeader>
          <CardTitle>
            Prévision budgétaire {prediction.annee}
          </CardTitle>
          <CardDescription>
            Budget prévisionnel généré à partir de l'exercice{" "}
            {prediction.annee_reference}.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Info
              titre="Année prévisionnelle"
              valeur={prediction.annee}
            />
            <Info
              titre="Année de référence"
              valeur={prediction.annee_reference}
            />
            <Info
              titre="Type"
              valeur={prediction.type_budget}
            />
            <Info
              titre="Statut"
              valeur={prediction.statut}
            />
          </div>
        </CardContent>
      </Card>

      {/* PREDICTION ANNUELLE */}
      <Card>
        <CardHeader>
          <CardTitle>Prédiction annuelle</CardTitle>
          <CardDescription>
            Synthèse du budget prévisionnel pour l'année{" "}
            {prediction.annee}.
          </CardDescription>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="px-3 py-3 font-medium">
                  CA export
                </th>
                <th className="px-3 py-3 font-medium">
                  Charges exploitation
                </th>
                <th className="px-3 py-3 font-medium">
                  Masse salariale
                </th>
                <th className="px-3 py-3 font-medium">
                  Amortissements
                </th>
                <th className="px-3 py-3 font-medium">
                  Résultat opérationnel
                </th>
                <th className="px-3 py-3 font-medium">
                  Marge
                </th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="px-3 py-4">
                  {formatMontant(prediction.ca_export)} MGA
                </td>

                <td className="px-3 py-4">
                  {formatMontant(chargesAnnuelles)} MGA
                </td>

                <td className="px-3 py-4">
                  {formatMontant(prediction.masse_salariale)} MGA
                </td>

                <td className="px-3 py-4">
                  {formatMontant(amortissementAnnuel)} MGA
                </td>

                <td className="px-3 py-4 font-medium">
                  {formatMontant(prediction.resultat_operationnel)} MGA
                </td>

                <td className="px-3 py-4 font-medium">
                  {formatPourcentage(prediction.marge_operationnelle)}
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* CHARGEMENT DES DETAILS */}
      {loadingDetails && (
        <p className="text-sm text-muted-foreground">
          Chargement des détails financiers...
        </p>
      )}

      {erreurDetails && (
        <p
          role="alert"
          className="text-sm text-destructive"
        >
          {erreurDetails}
        </p>
      )}

      {/* PREDICTION MENSUELLE */}
      <Card>
        <CardHeader>
          <CardTitle>Prédiction mensuelle</CardTitle>
          <CardDescription>
            Détail des prévisions de janvier à décembre{" "}
            {prediction.annee}. Montants en MGA.
          </CardDescription>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          {mois.length > 0 ? (
            <table className="w-full min-w-[1500px] text-sm">
              <thead>
                <tr className="border-b">
                  <th className="sticky left-0 z-10 bg-background px-4 py-3 text-left font-medium">
                    Indicateur
                  </th>

                  {mois.map((m) => (
                    <th
                      key={m.mois_id}
                      className="px-4 py-3 text-right font-medium"
                    >
                      {m.mois ||
                        NOMS_MOIS[Number(m.mois_id) - 1]}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {lignesTableau.map((ligne) => (
                  <tr
                    key={ligne.code}
                    className={`border-b last:border-0 ${
                      ligne.detail
                        ? "bg-muted/20 text-muted-foreground"
                        : ligne.code === "CHARGES"
                          ? "bg-muted/40 font-semibold"
                          : ""
                    }`}
                  >
                    <td
                      className={`sticky left-0 bg-background px-4 py-3 ${
                        ligne.detail
                          ? "pl-8 text-muted-foreground"
                          : "font-medium"
                      }`}
                    >
                      {ligne.libelle}
                    </td>

                    {ligne.valeurs.map((valeur, index) => (
                      <td
                        key={`${ligne.code}-${mois[index].mois_id}`}
                        className="whitespace-nowrap px-4 py-3 text-right"
                      >
                        {afficherValeur(valeur, ligne.format)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Aucune prédiction mensuelle disponible.
            </div>
          )}
        </CardContent>
      </Card>

      {/* COMPOSITION DES RUBRIQUES */}
      <Card>
        <CardHeader>
          <CardTitle>
            Composition des charges d'exploitation
          </CardTitle>
          <CardDescription>
            Répartition des catégories de charges par rubrique comptable.
          </CardDescription>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="px-3 py-3 font-medium">
                  Rubrique
                </th>
                <th className="px-3 py-3 font-medium">
                  Catégories
                </th>
              </tr>
            </thead>

            <tbody>
              {groupes.map((g) => (
                <tr
                  key={g.code}
                  className="border-b last:border-0"
                >
                  <td className="px-3 py-3 font-medium">
                    {g.libelle}
                  </td>

                  <td className="px-3 py-3">
                    {[
                      ...g.categories,
                      ...(g.code === "SERVICES_EXTERIEURS"
                        ? ["FRAIS EXPORT"]
                        : []),
                    ].join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* RESUME DE L'ANALYSE */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé de l'analyse</CardTitle>
          <CardDescription>
            Interprétation automatique des résultats de la prévision{" "}
            {prediction.annee}.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {prediction.resume ? (
            <div className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
              {prediction.resume}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Aucun résumé disponible.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Info({
  titre,
  valeur,
}: {
  titre: string
  valeur: string | number
}) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs text-muted-foreground">
        {titre}
      </p>

      <p className="mt-1 text-lg font-semibold">
        {valeur}
      </p>
    </div>
  )
}
