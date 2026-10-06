"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type PredictionMensuelle = {
  mois_id: number
  mois: string
  ventes: number
  production: number
  ca_export: number
  charges_exploitation: number
  frais_export: number
  masse_salariale: number
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
  resultat_operationnel: number
  marge_operationnelle: number
  date_generation?: string
  resume?: string
  mois: PredictionMensuelle[]
}

type Props = {
  prediction: Prediction
}

const formatMontant = (valeur: number | null | undefined) => {
  if (valeur === null || valeur === undefined) return "-"
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(Number(valeur))
}

const formatNombre = (valeur: number | null | undefined) => {
  if (valeur === null || valeur === undefined) return "-"
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(valeur))
}

const formatPourcentage = (valeur: number | null | undefined) => {
  if (valeur === null || valeur === undefined) return "-"
  const nombre = Number(valeur)
  const pourcentage = Math.abs(nombre) <= 1 ? nombre * 100 : nombre

  return `${new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(pourcentage)} %`
}

export default function PredictionDetails({ prediction }: Props) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Prévision budgétaire {prediction.annee}</CardTitle>
          <CardDescription>
            Budget prévisionnel généré à partir de l&apos;exercice {prediction.annee_reference}.
          </CardDescription>
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
          <CardDescription>
            Synthèse du budget prévisionnel pour l&apos;année {prediction.annee}.
          </CardDescription>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="px-3 py-3 font-medium">CA export</th>
                <th className="px-3 py-3 font-medium">Charges exploitation</th>
                <th className="px-3 py-3 font-medium">Frais export</th>
                <th className="px-3 py-3 font-medium">Masse salariale</th>
                <th className="px-3 py-3 font-medium">Résultat opérationnel</th>
                <th className="px-3 py-3 font-medium">Marge</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="px-3 py-4">
                  {formatMontant(prediction.ca_export)} MGA
                </td>
                <td className="px-3 py-4">
                  {formatMontant(prediction.charges_exploitation)} MGA
                </td>
                <td className="px-3 py-4">
                  {formatMontant(prediction.frais_export)} MGA
                </td>
                <td className="px-3 py-4">
                  {formatMontant(prediction.masse_salariale)} MGA
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

      {/* <Card>
        <CardHeader>
          <CardTitle>Prédiction mensuelle</CardTitle>
          <CardDescription>
            Détail des prévisions de janvier à décembre {prediction.annee}.
          </CardDescription>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[1300px] text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="px-3 py-3 font-medium">Mois</th>
                <th className="px-3 py-3 font-medium">Ventes</th>
                <th className="px-3 py-3 font-medium">Production</th>
                <th className="px-3 py-3 font-medium">CA export</th>
                <th className="px-3 py-3 font-medium">Charges</th>
                <th className="px-3 py-3 font-medium">Frais export</th>
                <th className="px-3 py-3 font-medium">Masse salariale</th>
                <th className="px-3 py-3 font-medium">Résultat</th>
                <th className="px-3 py-3 font-medium">Marge</th>
              </tr>
            </thead>

            <tbody>
              {prediction.mois?.map((ligne) => (
                <tr
                  key={ligne.mois_id}
                  className="border-b last:border-0"
                >
                  <td className="px-3 py-3 font-medium">
                    {ligne.mois}
                  </td>

                  <td className="px-3 py-3">
                    {formatNombre(ligne.ventes)}
                  </td>

                  <td className="px-3 py-3">
                    {formatNombre(ligne.production)}
                  </td>

                  <td className="px-3 py-3">
                    {formatMontant(ligne.ca_export)} MGA
                  </td>

                  <td className="px-3 py-3">
                    {formatMontant(ligne.charges_exploitation)} MGA
                  </td>

                  <td className="px-3 py-3">
                    {formatMontant(ligne.frais_export)} MGA
                  </td>

                  <td className="px-3 py-3">
                    {formatMontant(ligne.masse_salariale)} MGA
                  </td>

                  <td className="px-3 py-3 font-medium">
                    {formatMontant(ligne.resultat_operationnel)} MGA
                  </td>

                  <td className="px-3 py-3">
                    {formatPourcentage(ligne.marge_operationnelle)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(!prediction.mois || prediction.mois.length === 0) && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Aucune prédiction mensuelle disponible.
            </div>
          )}
        </CardContent>
      </Card> */}


      <Card>
  <CardHeader>
    <CardTitle>Prédiction mensuelle</CardTitle>
    <CardDescription>
      Détail des prévisions de janvier à décembre {prediction.annee}.
    </CardDescription>
  </CardHeader>

  <CardContent className="overflow-x-auto">
    {prediction.mois && prediction.mois.length > 0 ? (
      <table className="w-full min-w-[1500px] text-sm">
        <thead>
          <tr className="border-b">
            <th className="sticky left-0 z-10 bg-background px-4 py-3 text-left font-medium">
              Indicateur
            </th>

            {prediction.mois.map((ligne) => (
              <th
                key={ligne.mois_id}
                className="px-4 py-3 text-right font-medium"
              >
                {ligne.mois}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          <tr className="border-b">
            <td className="sticky left-0 bg-background px-4 py-3 font-medium">
              Ventes
            </td>

            {prediction.mois.map((ligne) => (
              <td
                key={ligne.mois_id}
                className="px-4 py-3 text-right"
              >
                {formatNombre(ligne.ventes)}
              </td>
            ))}
          </tr>

          <tr className="border-b">
            <td className="sticky left-0 bg-background px-4 py-3 font-medium">
              Production
            </td>

            {prediction.mois.map((ligne) => (
              <td
                key={ligne.mois_id}
                className="px-4 py-3 text-right"
              >
                {formatNombre(ligne.production)}
              </td>
            ))}
          </tr>

          <tr className="border-b">
            <td className="sticky left-0 bg-background px-4 py-3 font-medium">
              CA export
            </td>

            {prediction.mois.map((ligne) => (
              <td
                key={ligne.mois_id}
                className="px-4 py-3 text-right"
              >
                {formatMontant(ligne.ca_export)}
              </td>
            ))}
          </tr>

          <tr className="border-b">
            <td className="sticky left-0 bg-background px-4 py-3 font-medium">
              Charges d&apos;exploitation
            </td>

            {prediction.mois.map((ligne) => (
              <td
                key={ligne.mois_id}
                className="px-4 py-3 text-right"
              >
                {formatMontant(ligne.charges_exploitation)}
              </td>
            ))}
          </tr>

          <tr className="border-b">
            <td className="sticky left-0 bg-background px-4 py-3 font-medium">
              Frais export
            </td>

            {prediction.mois.map((ligne) => (
              <td
                key={ligne.mois_id}
                className="px-4 py-3 text-right"
              >
                {formatMontant(ligne.frais_export)}
              </td>
            ))}
          </tr>

          <tr className="border-b">
            <td className="sticky left-0 bg-background px-4 py-3 font-medium">
              Masse salariale
            </td>

            {prediction.mois.map((ligne) => (
              <td
                key={ligne.mois_id}
                className="px-4 py-3 text-right"
              >
                {formatMontant(ligne.masse_salariale)}
              </td>
            ))}
          </tr>

          <tr className="border-b">
            <td className="sticky left-0 bg-background px-4 py-3 font-medium">
              Résultat opérationnel
            </td>

            {prediction.mois.map((ligne) => (
              <td
                key={ligne.mois_id}
                className="px-4 py-3 text-right font-medium"
              >
                {formatMontant(ligne.resultat_operationnel)}
              </td>
            ))}
          </tr>

          <tr>
            <td className="sticky left-0 bg-background px-4 py-3 font-medium">
              Marge opérationnelle
            </td>

            {prediction.mois.map((ligne) => (
              <td
                key={ligne.mois_id}
                className="px-4 py-3 text-right font-medium"
              >
                {formatPourcentage(ligne.marge_operationnelle)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    ) : (
      <div className="py-8 text-center text-sm text-muted-foreground">
        Aucune prédiction mensuelle disponible.
      </div>
    )}
  </CardContent>
</Card>

      <Card>
        <CardHeader>
          <CardTitle>Résumé de l&apos;analyse</CardTitle>
          <CardDescription>
            Interprétation automatique des résultats de la prévision {prediction.annee}.
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