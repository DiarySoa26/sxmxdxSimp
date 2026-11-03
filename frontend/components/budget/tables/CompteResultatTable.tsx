"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type CompteResultatLigne = {
  code: string
  rubrique: string
  mensuel: (number | string | null)[]
  totalAnnuel: number | string | null
  type: string
  format: string
}

type Charge = {
  categorie?: string | null
  sous_categorie?: string | null
  nom_mois?: string | null
  montant?: number | string | null
}

type FraisExport = {
  nom_mois?: string | null
  mois?: string | number | null
  total?: number | string | null
}

type Props = {
  data: CompteResultatLigne[]
  charges: Charge[]
  fraisExport?: FraisExport[]
}

const mois = [
  "Janvier", "Février", "Mars", "Avril",
  "Mai", "Juin", "Juillet", "Août",
  "Septembre", "Octobre", "Novembre", "Décembre",
]

const nombre = (v: unknown): number => {
  if (v === null || v === undefined || v === "") return 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const normaliser = (v: unknown): string =>
  String(v ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[_'’.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()

const liste = <T,>(v: T[] | null | undefined): T[] =>
  Array.isArray(v) ? v : []

const addition = (a: number[], b: number[]): number[] =>
  a.map((v, i) => v + b[i])

const soustraction = (a: number[], b: number[]): number[] =>
  a.map((v, i) => v - b[i])

const totalAnnuel = (a: number[]): number =>
  a.reduce((s, v) => s + v, 0)

// =====================================================
// IDENTIFICATION DES MOIS
// =====================================================

function indiceMois(v: unknown): number {
  const texte = normaliser(v)
  const numero = Number(texte)

  if (
    texte &&
    Number.isInteger(numero) &&
    numero >= 1 &&
    numero <= 12
  ) {
    return numero - 1
  }

  return mois.findIndex(m => normaliser(m) === texte)
}

// =====================================================
// IDENTIFICATION DES RUBRIQUES
// =====================================================

function correspond(
  ligne: CompteResultatLigne,
  codes: string[],
  rubriques: string[]
): boolean {
  const code = normaliser(ligne.code)
  const rubrique = normaliser(ligne.rubrique)

  return (
    codes.some(c => normaliser(c) === code) ||
    rubriques.some(r => normaliser(r) === rubrique)
  )
}

function chercher(
  data: CompteResultatLigne[],
  codes: string[],
  rubriques: string[]
): CompteResultatLigne | undefined {
  return data.find(ligne =>
    correspond(ligne, codes, rubriques)
  )
}

function montantsLigne(
  ligne?: CompteResultatLigne
): number[] {
  return Array.from(
    { length: 12 },
    (_, i) => nombre(ligne?.mensuel?.[i])
  )
}

// =====================================================
// CALCUL DES CHARGES
// =====================================================

function calculerCharges(
  charges: Charge[],
  categories: string[]
): number[] {
  const mensuel = Array(12).fill(0) as number[]
  const noms = new Set(categories.map(normaliser))

  for (const charge of charges) {
    if (!noms.has(normaliser(charge.categorie))) continue

    const index = indiceMois(charge.nom_mois)

    if (index >= 0) {
      mensuel[index] += nombre(charge.montant)
    }
  }

  return mensuel
}

// =====================================================
// CALCUL DES FRAIS EXPORT
// =====================================================

function calculerFraisExport(
  fraisExport: FraisExport[]
): number[] {
  const mensuel = Array(12).fill(0) as number[]

  for (const frais of fraisExport) {
    const index = indiceMois(
      frais.nom_mois ?? frais.mois
    )

    if (index >= 0) {
      mensuel[index] += nombre(frais.total)
    }
  }

  return mensuel
}

// =====================================================
// FORMATAGE
// =====================================================

function formatMontant(
  v: number | string | null | undefined
): string {
  if (v === null || v === undefined || v === "") {
    return "-"
  }

  return `${nombre(v).toLocaleString("fr-FR", {
    maximumFractionDigits: 2,
  })} MGA`
}

function formatPourcentage(
  v: number | string | null | undefined
): string {
  if (v === null || v === undefined || v === "") {
    return "-"
  }

  return `${nombre(v).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} %`
}

// =====================================================
// COMPOSANT PRINCIPAL
// =====================================================

export default function CompteResultatTable({
  data,
  charges,
  fraisExport = [],
}: Props) {

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex min-h-[150px] items-center justify-center rounded-md border border-dashed">
        <p className="text-sm text-muted-foreground">
          Aucun compte de résultat disponible.
        </p>
      </div>
    )
  }

  const donneesCharges = liste(charges)
  const donneesFraisExport = liste(fraisExport)

  // =====================================================
  // ACHATS CONSOMMÉS
  // =====================================================

  const achats = calculerCharges(
    donneesCharges,
    ["ACHAT PRODUITS", "PRODUCTION"]
  )

  // =====================================================
  // SERVICES EXTÉRIEURS
  // Administration + Finance + Logistique + Frais export
  // =====================================================

  const servicesCharges = calculerCharges(
    donneesCharges,
    ["ADMINISTRATION", "FINANCE", "LOGISTIQUE", "SECURITE"]
  )

  const services = addition(
    servicesCharges,
    calculerFraisExport(donneesFraisExport)
  )

  // =====================================================
  // IMPÔTS ET TAXES
  // =====================================================

  const impots = calculerCharges(
    donneesCharges,
    ["FISCAL"]
  )

  // =====================================================
  // CONSOMMATION DE L'EXERCICE
  // =====================================================

  const consommation = addition(
    achats,
    services
  )

  // =====================================================
  // PRODUCTION DE L'EXERCICE
  // =====================================================

  const production = montantsLigne(
    chercher(
      data,
      ["I"],
      [
        "I PRODUCTION DE L EXERCICE",
        "PRODUCTION DE L EXERCICE",
      ]
    )
  )

  // =====================================================
  // VALEUR AJOUTÉE
  // =====================================================

  const valeurAjoutee = soustraction(
    production,
    consommation
  )

  // =====================================================
  // SUBVENTIONS D'EXPLOITATION
  // =====================================================

  const subventions = montantsLigne(
    chercher(
      data,
      ["SUBVENTIONS_EXPLOITATION", "SUBVENTIONS"],
      [
        "SUBVENTIONS D EXPLOITATION",
        "SUBVENTION D EXPLOITATION",
      ]
    )
  )

  // =====================================================
  // CHARGES DE PERSONNEL
  // =====================================================

  const personnel = montantsLigne(
    chercher(
      data,
      ["CHARGES_PERSONNEL", "MASSE_SALARIALE"],
      [
        "CHARGES DE PERSONNEL",
        "CHARGES DU PERSONNEL",
        "MASSE SALARIALE",
      ]
    )
  )

  // =====================================================
  // EXCÉDENT BRUT D'EXPLOITATION
  // =====================================================

  const ebe = soustraction(
    soustraction(
      addition(valeurAjoutee, subventions),
      impots
    ),
    personnel
  )

  // =====================================================
  // PRODUITS OPÉRATIONNELS
  // =====================================================

  const produitsOperationnels = montantsLigne(
    chercher(
      data,
      [
        "PRODUITS_OPERATIONNELS",
        "AUTRES_PRODUITS_OPERATIONNELS",
      ],
      [
        "PRODUITS OPERATIONNELS",
        "AUTRES PRODUITS OPERATIONNELS",
      ]
    )
  )

  // =====================================================
  // CHARGES OPÉRATIONNELLES
  // =====================================================

  const chargesOperationnelles = montantsLigne(
    chercher(
      data,
      [
        "CHARGES_OPERATIONNELLES",
        "AUTRES_CHARGES_OPERATIONNELLES",
      ],
      [
        "CHARGES OPERATIONNELLES",
        "AUTRES CHARGES OPERATIONNELLES",
      ]
    )
  )

  // =====================================================
  // DOTATIONS AUX AMORTISSEMENTS
  // =====================================================

  const amortissements = montantsLigne(
    chercher(
      data,
      ["DOTATIONS_AMORTISSEMENTS", "AMORTISSEMENTS"],
      [
        "DOTATIONS AUX AMORTISSEMENTS",
        "DOTATIONS AUX AMORTISSEMENTS ET PROVISIONS",
      ]
    )
  )

  // =====================================================
  // REPRISES SUR PROVISIONS
  // =====================================================

  const reprises = montantsLigne(
    chercher(
      data,
      [
        "REPRISES_PROVISIONS",
        "REPRISES_SUR_PROVISIONS",
      ],
      [
        "REPRISES SUR PROVISIONS",
        "REPRISES SUR PERTES DE VALEUR ET PROVISIONS",
      ]
    )
  )

  // =====================================================
  // RÉSULTAT OPÉRATIONNEL
  // =====================================================

  const resultatOperationnel = addition(
    soustraction(
      soustraction(
        addition(ebe, produitsOperationnels),
        chargesOperationnelles
      ),
      amortissements
    ),
    reprises
  )

  // =====================================================
  // PRODUITS FINANCIERS
  // =====================================================

  const produitsFinanciers = montantsLigne(
    chercher(
      data,
      [
        "PRODUITS_FINANCIERS",
        "PRODUIT_FINANCIER",
      ],
      [
        "PRODUITS FINANCIERS",
        "PRODUIT FINANCIER",
      ]
    )
  )

  // =====================================================
  // CHARGES FINANCIÈRES
  // =====================================================

  const chargesFinancieres = calculerCharges(
    donneesCharges,
    ["FINANCIERE"]
  )

  // =====================================================
  // RÉSULTAT FINANCIER
  // =====================================================

  const resultatFinancier = soustraction(
    produitsFinanciers,
    chargesFinancieres
  )

  // =====================================================
  // RÉSULTAT AVANT IMPÔT
  // =====================================================

  const resultatAvantImpot = addition(
    resultatOperationnel,
    resultatFinancier
  )

  // =====================================================
  // IMPÔT EXIGIBLE SUR LE RÉSULTAT
  // =====================================================

  const impotExigible = montantsLigne(
    chercher(
      data,
      [
        "IMPOT_EXIGIBLE",
        "IMPOT_EXIGIBLE_RESULTAT",
      ],
      [
        "IMPOT EXIGIBLE SUR LE RESULTAT",
        "IMPOT EXIGIBLE",
      ]
    )
  )

  // =====================================================
  // IMPÔTS DIFFÉRÉS
  // =====================================================

  const impotsDifferes = montantsLigne(
    chercher(
      data,
      [
        "IMPOTS_DIFFERES",
        "IMPOT_DIFFERE",
      ],
      [
        "IMPOTS DIFFERES",
        "IMPOT DIFFERE",
      ]
    )
  )

  // =====================================================
  // VIII. RÉSULTAT NET ORDINAIRE
  // =====================================================

  const resultatNetOrdinaire = soustraction(
    soustraction(
      resultatAvantImpot,
      impotExigible
    ),
    impotsDifferes
  )

  // =====================================================
  // X. RÉSULTAT NET DE L'EXERCICE
  // STRICTEMENT IDENTIQUE AU RÉSULTAT NET ORDINAIRE
  // =====================================================

  const resultatNetExercice = [...resultatNetOrdinaire]

  // =====================================================
  // CHIFFRE D'AFFAIRES
  // =====================================================

  const chiffreAffaires = montantsLigne(
    chercher(
      data,
      [
        "CA_EXPORT",
        "CHIFFRE_AFFAIRES",
        "VENTES",
      ],
      [
        "CHIFFRE D AFFAIRES",
        "CHIFFRE D AFFAIRES EXPORT",
        "VENTES",
      ]
    )
  )

  // =====================================================
  // MARGE NETTE MENSUELLE
  // =====================================================

  const margeNette = resultatNetExercice.map(
    (resultat, index) => {
      const ca = chiffreAffaires[index]

      return ca !== 0
        ? (resultat / ca) * 100
        : 0
    }
  )

  // =====================================================
  // MARGE NETTE ANNUELLE
  // =====================================================

  const caAnnuel = totalAnnuel(chiffreAffaires)

  const margeNetteAnnuelle = caAnnuel !== 0
    ? (totalAnnuel(resultatNetExercice) / caAnnuel) * 100
    : 0

  // =====================================================
  // REMPLACEMENT DES VALEURS CALCULÉES
  // =====================================================

  const lignes = data.map(ligne => {
    let mensuel: number[] | null = null

    if (correspond(
      ligne,
      ["ACHATS_CONSOMMES"],
      ["ACHATS CONSOMMES", "ACHAT CONSOMME"]
    )) {
      mensuel = achats
    }

    else if (correspond(
      ligne,
      ["SERVICES_EXTERIEURS"],
      [
        "SERVICES EXTERIEURS",
        "SERVICE EXTERIEUR",
        "SERVICES EXTERNES",
      ]
    )) {
      mensuel = services
    }

    else if (correspond(
      ligne,
      ["IMPOTS_TAXES"],
      ["IMPOTS ET TAXES", "IMPOT ET TAXE"]
    )) {
      mensuel = impots
    }

    else if (correspond(
      ligne,
      ["II"],
      [
        "II CONSOMMATION DE L EXERCICE",
        "CONSOMMATION DE L EXERCICE",
      ]
    )) {
      mensuel = consommation
    }

    else if (correspond(
      ligne,
      ["III"],
      [
        "III VALEUR AJOUTEE",
        "VALEUR AJOUTEE",
      ]
    )) {
      mensuel = valeurAjoutee
    }

    else if (correspond(
      ligne,
      ["IV", "EBE"],
      [
        "IV EXCEDENT BRUT D EXPLOITATION",
        "EXCEDENT BRUT D EXPLOITATION",
        "EXCEDENT BRUT D EXPLOITATION EBE",
      ]
    )) {
      mensuel = ebe
    }

    else if (correspond(
      ligne,
      ["V", "RESULTAT_OPERATIONNEL"],
      [
        "V RESULTAT OPERATIONNEL",
        "RESULTAT OPERATIONNEL",
      ]
    )) {
      mensuel = resultatOperationnel
    }

    else if (correspond(
      ligne,
      ["CHARGES_FINANCIERES"],
      [
        "CHARGES FINANCIERES",
        "CHARGES FINANCIERE",
      ]
    )) {
      mensuel = chargesFinancieres
    }

    else if (correspond(
      ligne,
      ["VI", "RESULTAT_FINANCIER"],
      [
        "VI RESULTAT FINANCIER",
        "RESULTAT FINANCIER",
      ]
    )) {
      mensuel = resultatFinancier
    }

    else if (correspond(
      ligne,
      [
        "VII",
        "RESULTAT_AVANT_IMPOT",
        "RESULTAT_AVANT_IMPOTS",
      ],
      [
        "VII RESULTAT AVANT IMPOT",
        "VII RESULTAT AVANT IMPOTS",
        "RESULTAT AVANT IMPOT",
        "RESULTAT AVANT IMPOTS",
      ]
    )) {
      mensuel = resultatAvantImpot
    }

    // =================================================
    // VIII. RÉSULTAT NET ORDINAIRE
    // =================================================

    else if (correspond(
      ligne,
      [
        "VIII",
        "RESULTAT_NET_ORDINAIRE",
      ],
      [
        "VIII RESULTAT NET ORDINAIRE",
        "RESULTAT NET ORDINAIRE",
      ]
    )) {
      mensuel = resultatNetOrdinaire
    }

    // =================================================
    // X. RÉSULTAT NET DE L'EXERCICE
    // CORRECTION : RECONNAISSANCE DU PRÉFIXE X.
    // =================================================

    else if (correspond(
      ligne,
      [
        "X",
        "RESULTAT_NET_EXERCICE",
        "RESULTAT_NET_DE_L_EXERCICE",
        "RESULTAT_NET_DE_EXERCICE",
      ],
      [
        "X RESULTAT NET DE L EXERCICE",
        "RESULTAT NET DE L EXERCICE",
        "RESULTAT NET EXERCICE",
      ]
    )) {
      // Reprend exactement le résultat net ordinaire
      mensuel = resultatNetOrdinaire
    }

    // =================================================
    // MARGE NETTE
    // =================================================

    else if (correspond(
      ligne,
      [
        "MARGE_NETTE",
        "MARGE_NET",
      ],
      [
        "MARGE NETTE",
        "TAUX DE MARGE NETTE",
      ]
    )) {
      return {
        ...ligne,
        mensuel: margeNette,
        totalAnnuel: margeNetteAnnuelle,
        format: "pourcentage",
      }
    }

    // =================================================
    // TOTAL ANNUEL DES RUBRIQUES RECALCULÉES
    // =================================================

    return mensuel
      ? {
          ...ligne,
          mensuel: [...mensuel],
          totalAnnuel: totalAnnuel(mensuel),
        }
      : ligne
  })

  // =====================================================
  // AFFICHAGE DU TABLEAU
  // =====================================================

  return (
    <div className="w-full space-y-4">
      <div>
        <h3 className="text-lg font-semibold">
          Compte de résultat
        </h3>

        <p className="text-sm text-muted-foreground">
          Résultats mensuels et annuels de l'exercice
        </p>
      </div>

      <div className="w-full overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[340px]">
                Rubrique
              </TableHead>

              {mois.map(m => (
                <TableHead
                  key={m}
                  className="min-w-[150px] text-right"
                >
                  {m}
                </TableHead>
              ))}

              <TableHead className="min-w-[180px] text-right">
                Total annuel
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {lignes.map((ligne, index) => {
              const estSousTotal = ligne.type === "sous-total"
              const estFinal = ligne.type === "resultat-final"
              const estPourcentage = ligne.format === "pourcentage"

              const style = estFinal
                ? "bg-emerald-700 text-white hover:bg-emerald-700"
                : estSousTotal
                  ? "bg-muted/70 font-semibold hover:bg-muted/70"
                  : ""

              return (
                <TableRow
                  key={`${ligne.code}-${index}`}
                  className={style}
                >
                  <TableCell
                    className={
                      estSousTotal || estFinal
                        ? "font-bold"
                        : "font-medium"
                    }
                  >
                    {ligne.rubrique}
                  </TableCell>

                  {mois.map((_, i) => (
                    <TableCell
                      key={i}
                      className="text-right tabular-nums"
                    >
                      {estPourcentage
                        ? formatPourcentage(ligne.mensuel?.[i])
                        : formatMontant(ligne.mensuel?.[i])}
                    </TableCell>
                  ))}

                  <TableCell className="text-right font-semibold tabular-nums">
                    {estPourcentage
                      ? formatPourcentage(ligne.totalAnnuel)
                      : formatMontant(ligne.totalAnnuel)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
