// import { getBudgetDetails, getBudgetMensuel } from "@/services/budget-details-service"

// const MOIS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]

// const SECTIONS = [
//   { key: "charges", title: "Charges" },
//   { key: "exportations", title: "Exportations" },
//   { key: "frais-export", title: "Frais export" },
//   { key: "production", title: "Production" },
//   { key: "employes", title: "Employés" },
//   { key: "budget", title: "Budget annuel" }
// ]

// const FRAIS = [
//   ["transport_local", "Transport local"],
//   ["transit", "Transit"],
//   ["manutention", "Manutention"],
//   ["fret", "Fret"],
//   ["assurance", "Assurance"],
//   ["frais_bancaires", "Frais bancaires"],
//   ["total", "Total"]
// ]

// const INDICATEURS = [
//   ["ca_export", "CA export", "montant"],
//   ["charges_exploitation", "Charges d'exploitation", "montant"],
//   ["frais_export", "Frais export", "montant"],
//   ["masse_salariale", "Masse salariale", "montant"],
//   ["resultat_operationnel", "Résultat opérationnel", "montant"],
//   ["marge_operationnelle", "Marge opérationnelle", "pourcentage"]
// ]

// const TEXTE = v => v == null || v === "" ? "-" : String(v)

// const NOMBRE = v => {
//   const n = Number(
//     typeof v === "string"
//       ? v.replace(/[\s\u00a0\u202f]/g, "").replace(",", ".")
//       : v
//   )
//   return Number.isFinite(n) ? n : 0
// }

// const FORMATER = (v, pourcentage = false) => {
//   const n = Number(v) || 0

//   const parties = n.toFixed(2).split(".")
//   const entier = parties[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ")

//   const resultat = Number(parties[1]) === 0
//     ? entier
//     : `${entier},${parties[1]}`

//   return resultat + (pourcentage ? " %" : "")
// }

// const NORMALISER = v =>
//   String(v ?? "").trim().toLowerCase()
//     .normalize("NFD").replace(/[\u0300-\u036f]/g, "")

// function indexMois(v) {
//   const n = Number(v)
//   if (Number.isInteger(n) && n >= 1 && n <= 12) return n - 1

//   const s = NORMALISER(v)
//   return MOIS.findIndex(m =>
//     NORMALISER(m) === s || NORMALISER(m).slice(0, 3) === s
//   )
// }

// function moisDe(row) {
//   return indexMois(
//     row.nom_mois ?? row.mois ?? row.numero_mois ?? row.mois_id
//   )
// }

// function groupeMensuel(rows, dimensions, indicateur) {
//   const map = new Map()

//   for (const r of rows) {
//     const m = moisDe(r)
//     if (m < 0) continue

//     const valeurs = dimensions.map(k => TEXTE(r[k]))
//     const cle = JSON.stringify(valeurs)

//     if (!map.has(cle)) {
//       map.set(cle, { valeurs, mois: Array(12).fill(0) })
//     }

//     map.get(cle).mois[m] += NOMBRE(r[indicateur])
//   }

//   return [...map.values()].sort((a, b) =>
//     a.valeurs.join("|").localeCompare(b.valeurs.join("|"), "fr")
//   )
// }

// function tableauMensuel(titre, entetes, lignes, options = {}) {
//   const {
//     total = true,
//     pourcentage = false,
//     regroupement = null,
//     unite = "MGA",
//     sousTotal = true
//   } = options

//   const head = [...entetes, ...MOIS, ...(total ? ["Total"] : [])]
//   const body = []
//   let groupeActuel = null
//   let totauxGroupe = Array(12).fill(0)

//   const ajouterTotal = () => {
//     if (groupeActuel === null || !sousTotal) return

//     body.push({
//       cellules: [
//         `Total ${groupeActuel}`,
//         ...Array(entetes.length - 1).fill(""),
//         ...totauxGroupe,
//         ...(total ? [totauxGroupe.reduce((a, b) => a + b, 0)] : [])
//       ],
//       total: true
//     })

//     totauxGroupe = Array(12).fill(0)
//   }

//   for (const ligne of lignes) {
//     if (regroupement !== null) {
//       const groupe = ligne.valeurs[regroupement]

//       if (groupe !== groupeActuel) {
//         ajouterTotal()
//         groupeActuel = groupe
//         body.push({ cellules: [groupe], groupe: true })
//       }
//     }

//     const nums = ligne.mois.map(NOMBRE)
//     nums.forEach((n, i) => { totauxGroupe[i] += n })

//     body.push({
//       cellules: [
//         ...ligne.valeurs,
//         ...nums,
//         ...(total ? [nums.reduce((a, b) => a + b, 0)] : [])
//       ]
//     })
//   }

//   if (regroupement !== null) ajouterTotal()

//   return {
//     titre, head, body,
//     dimensions: entetes.length,
//     total, pourcentage, unite,
//     mensuel: true
//   }
// }

// function tableauSimple(titre, entetes, rows, unite = "MGA") {
//   return {
//     titre,
//     head: entetes.map(e => e[1]),
//     body: rows.map(r => ({
//       cellules: entetes.map(e => r[e[0]] ?? "")
//     })),
//     mensuel: false,
//     unite
//   }
// }

// function construireTableaux(donnees) {
//   const d = Object.fromEntries(donnees.map(s => [s.key, s.rows]))
//   const tableaux = []

//   // CHARGES : catégorie / sous-catégorie / site / unité
//   const charges = d.charges || []

//   if (charges.length) {
//     tableaux.push(
//       tableauMensuel(
//         "Charges par catégorie",
//         ["Catégorie", "Sous-catégorie", "Site", "Unité"],
//         groupeMensuel(
//           charges,
//           ["categorie", "sous_categorie", "site", "unite"],
//           "montant"
//         ),
//         { regroupement: 0 }
//       )
//     )
//   }

//   // EXPORTATIONS : pays / représentant / produit / devise
//   const exp = d.exportations || []

//   if (exp.length) {
//     const configurations = [
//       ["quantite", "Quantités exportées", "Tonnes / unités"],
//       ["ca_devise", "CA en devise", "Devises (voir colonne)"],
//       ["ca_mga", "CA en MGA", "MGA"]
//     ]

//     for (const [champ, titre, unite] of configurations) {
//       tableaux.push(
//         tableauMensuel(
//           `Exportations — ${titre} par pays`,
//           ["Pays", "Représentant", "Produit", "Devise"],
//           groupeMensuel(
//             exp,
//             ["pays", "representant", "produit", "devise"],
//             champ
//           ),
//           {
//             regroupement: 0,
//             unite,
//             sousTotal: champ !== "ca_devise"
//           }
//         )
//       )
//     }
//   }

//   // FRAIS EXPORT : pays / représentant / type de frais
//   const frais = d["frais-export"] || []

//   if (frais.length) {
//     const lignes = []

//     for (const [champ, label] of FRAIS) {
//       for (const ligne of groupeMensuel(
//         frais,
//         ["pays", "representant"],
//         champ
//       )) {
//         lignes.push({
//           valeurs: [...ligne.valeurs, label],
//           mois: ligne.mois
//         })
//       }
//     }

//     lignes.sort((a, b) =>
//       a.valeurs.join("|").localeCompare(b.valeurs.join("|"), "fr")
//     )

//     tableaux.push(
//       tableauMensuel(
//         "Frais export par pays et représentant",
//         ["Pays", "Représentant", "Type de frais"],
//         lignes,
//         { regroupement: 0, sousTotal: false }
//       )
//     )
//   }

//   // PRODUCTION : site / produit / unité
//   const production = d.production || []

//   if (production.length) {
//     tableaux.push(
//       tableauMensuel(
//         "Production par site et produit",
//         ["Site", "Produit", "Unité"],
//         groupeMensuel(
//           production,
//           ["site", "produit", "unite"],
//           "production_reelle"
//         ),
//         {
//           regroupement: 0,
//           unite: "Unités de production"
//         }
//       )
//     )
//   }

//   // EMPLOYÉS
//   const employes = d.employes || []

//   if (employes.length) {
//     tableaux.push(
//       tableauSimple(
//         "Employés",
//         [
//           ["nom", "Nom"],
//           ["salaire_base", "Salaire de base"],
//           ["prime", "Prime"],
//           ["charges_patronales", "Charges patronales"],
//           ["cout_total", "Coût total"]
//         ],
//         employes
//       )
//     )
//   }

//   // BUDGET ANNUEL
//   const budget = d.budget || []

//   if (budget.length) {
//     tableaux.push(
//       tableauSimple(
//         "Budget annuel",
//         [
//           ["type_budget", "Type"],
//           ["statut", "Statut"],
//           ...INDICATEURS.map(([k, label]) => [k, label]),
//           ["date_generation", "Date de génération"]
//         ],
//         budget
//       )
//     )
//   }

//   // BUDGET MENSUEL : indicateurs en lignes, mois en colonnes
//   const mensuel = d.budget_mensuel || []

//   if (mensuel.length) {
//     const lignes = INDICATEURS.map(([key, label, type]) => {
//       const mois = Array(12).fill(0)

//       for (const r of mensuel) {
//         const i = moisDe(r)
//         if (i >= 0) mois[i] += NOMBRE(r[key])
//       }

//       return { valeurs: [label], mois, type }
//     })

//     const montants = lignes.filter(l => l.type !== "pourcentage")

//     tableaux.push(
//       tableauMensuel(
//         "Budget mensuel",
//         ["Indicateur"],
//         montants,
//         { total: true }
//       )
//     )

//     // Les pourcentages ne doivent pas être additionnés.
//     const marge = lignes.find(l => l.type === "pourcentage")

//     if (marge) {
//       tableaux.push(
//         tableauMensuel(
//           "Marge opérationnelle mensuelle",
//           ["Indicateur"],
//           [marge],
//           {
//             total: false,
//             pourcentage: true,
//             unite: "%"
//           }
//         )
//       )
//     }
//   }

//   return tableaux
// }

// async function chargerDonnees(exerciceId) {
//   const donnees = await Promise.all(
//     SECTIONS.map(async s => {
//       const rows = await getBudgetDetails(s.key, exerciceId)

//       return {
//         ...s,
//         rows: Array.isArray(rows) ? rows : []
//       }
//     })
//   )

//   const budget = donnees.find(s => s.key === "budget")?.rows || []
//   const budgetId =
//     budget[0]?.id ??
//     budget[0]?.id_budget ??
//     budget[0]?.budget_id

//   let mensuel = []

//   if (budget.length && budgetId == null) {
//     throw new Error(
//       "Budget annuel trouvé, mais identifiant introuvable : impossible de charger le budget mensuel."
//     )
//   }

//   if (budgetId != null) {
//     const resultat = await getBudgetMensuel(budgetId)
//     mensuel = Array.isArray(resultat) ? resultat : []
//   }

//   donnees.push({
//     key: "budget_mensuel",
//     title: "Budget mensuel",
//     rows: mensuel
//   })

//   if (donnees.every(s => !s.rows.length)) {
//     throw new Error("Aucune donnée disponible pour cet exercice.")
//   }

//   return donnees
// }

// function telecharger(blob, nom) {
//   const url = URL.createObjectURL(blob)
//   const a = document.createElement("a")

//   a.href = url
//   a.download = nom
//   document.body.appendChild(a)
//   a.click()
//   a.remove()

//   setTimeout(() => URL.revokeObjectURL(url), 1000)
// }

// function celluleAffichee(t, ligne, i) {
//   const v = ligne.cellules[i]
//   if (typeof v !== "number") return TEXTE(v)
//   return FORMATER(v, t.pourcentage)
// }

// // EXPORT PDF
// async function exporterPDF(tableaux, annee) {
//   const { jsPDF } = await import("jspdf")
//   const { default: autoTable } = await import("jspdf-autotable")

//   const doc = new jsPDF({
//     orientation: "landscape",
//     unit: "mm",
//     format: "a3"
//   })

//   const largeur = doc.internal.pageSize.getWidth()
//   const hauteur = doc.internal.pageSize.getHeight()

//   doc.setFillColor(51, 78, 104)
//   doc.rect(0, 0, largeur, 38, "F")

//   doc.setTextColor(255)
//   doc.setFontSize(19)
//   doc.text("SOMIDA - RAPPORT BUDGETAIRE", 12, 17)
//   doc.setFontSize(11)
//   doc.text(`Exercice ${annee}`, 12, 27)

//   let y = 46

//   for (let index = 0; index < tableaux.length; index++) {
//     const t = tableaux[index]

//     if (index > 0) {
//       doc.addPage()
//       y = 20
//     }

//     doc.setTextColor(30, 41, 59)
//     doc.setFont("helvetica", "bold")
//     doc.setFontSize(12)
//     doc.text(`${t.titre} (${t.unite})`, 10, y)

//     autoTable(doc, {
//       startY: y + 5,
//       head: [t.head],

//       body: t.body.map(l =>
//         l.groupe
//           ? [l.cellules[0], ...Array(t.head.length - 1).fill("")]
//           : t.head.map((_, i) => celluleAffichee(t, l, i))
//       ),

//       theme: "grid",
//       showHead: "everyPage",
//       pageBreak: "auto",
//       rowPageBreak: "avoid",

//       styles: {
//         fontSize: t.mensuel ? 6.1 : 8,
//         cellPadding: 1.6,
//         overflow: "linebreak",
//         valign: "middle"
//       },

//       headStyles: {
//         fillColor: [79, 109, 138],
//         textColor: 255
//       },

//       didParseCell: data => {
//         if (data.section !== "body") return

//         const ligne = t.body[data.row.index]

//         if (ligne?.groupe || ligne?.total) {
//           data.cell.styles.fillColor = ligne.groupe
//             ? [216, 226, 237]
//             : [232, 239, 246]

//           data.cell.styles.fontStyle = "bold"
//         }

//         if (t.mensuel && data.column.index >= t.dimensions) {
//           data.cell.styles.halign = "right"
//         }
//       },

//       margin: {
//         left: 9,
//         right: 9,
//         top: 18,
//         bottom: 18
//       }
//     })

//     y = (doc.lastAutoTable?.finalY ?? y) + 14
//   }

//   const pages = doc.getNumberOfPages()

//   for (let p = 1; p <= pages; p++) {
//     doc.setPage(p)
//     doc.setFontSize(9)
//     doc.setTextColor(110, 120, 130)

//     doc.text(
//       `Simplifie - SXMXDX | Page ${p}/${pages}`,
//       largeur - 10,
//       hauteur - 8,
//       { align: "right" }
//     )
//   }

//   doc.save(`SOMIDA_Rapport_Budget_${annee}.pdf`)
// }

// // EXPORT EXCEL
// async function exporterExcel(tableaux, annee) {
//   const ExcelJS = (await import("exceljs")).default
//   const workbook = new ExcelJS.Workbook()

//   workbook.creator = "Simplifié - SXMXDX"

//   for (let n = 0; n < tableaux.length; n++) {
//     const t = tableaux[n]

//     const nomFeuille = `${n + 1} ${t.titre}`
//       .replace(/[\[\]\*\?\/\\:]/g, "-")
//       .slice(0, 31)

//     const sheet = workbook.addWorksheet(nomFeuille)

//     sheet.mergeCells(1, 1, 1, t.head.length)

//     const title = sheet.getCell(1, 1)
//     title.value = `SOMIDA — ${t.titre} — ${annee} (${t.unite})`
//     title.font = {
//       bold: true,
//       size: 15,
//       color: { argb: "FFFFFFFF" }
//     }
//     title.fill = {
//       type: "pattern",
//       pattern: "solid",
//       fgColor: { argb: "FF334E68" }
//     }

//     sheet.getRow(1).height = 30
//     sheet.addRow([])

//     const headers = sheet.addRow(t.head)

//     headers.eachCell(cell => {
//       cell.font = {
//         bold: true,
//         color: { argb: "FFFFFFFF" }
//       }
//       cell.fill = {
//         type: "pattern",
//         pattern: "solid",
//         fgColor: { argb: "FF617F9B" }
//       }
//     })

//     for (const l of t.body) {
//       const row = sheet.addRow(
//         l.groupe ? [l.cellules[0]] : l.cellules
//       )

//       if (l.groupe || l.total) {
//         row.eachCell(cell => {
//           cell.font = { bold: true }
//           cell.fill = {
//             type: "pattern",
//             pattern: "solid",
//             fgColor: {
//               argb: l.groupe ? "FFD8E2ED" : "FFE8EFF6"
//             }
//           }
//         })
//       }
//     }

//     sheet.getColumn(1).width = 32

//     for (let i = 2; i <= t.head.length; i++) {
//       sheet.getColumn(i).width =
//         t.mensuel && i > t.dimensions ? 16 : 20
//     }

//     if (t.mensuel) {
//       for (let i = t.dimensions + 1; i <= t.head.length; i++) {
//         sheet.getColumn(i).numFmt = t.pourcentage
//           ? '0.00" %"'
//           : "#,##0.00"
//       }
//     }

//     sheet.views = [{
//       state: "frozen",
//       ySplit: 3,
//       xSplit: t.mensuel ? t.dimensions : 0
//     }]

//     sheet.pageSetup = {
//       orientation: "landscape",
//       paperSize: 8,
//       fitToPage: true,
//       fitToWidth: 1,
//       fitToHeight: 0
//     }
//   }

//   const buffer = await workbook.xlsx.writeBuffer()

//   telecharger(
//     new Blob([buffer], {
//       type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     }),
//     `SOMIDA_Budget_${annee}.xlsx`
//   )
// }

// // FONCTION APPELÉE PAR BUDGET-DETAILS.TSX
// export async function exporterBudget(exerciceId, annee, format) {
//   if (!["pdf", "excel"].includes(format)) {
//     throw new Error("Format d'exportation invalide.")
//   }

//   if (!exerciceId || !annee) {
//     throw new Error("Veuillez sélectionner un exercice.")
//   }

//   const donnees = await chargerDonnees(exerciceId)
//   const tableaux = construireTableaux(donnees)

//   if (!tableaux.length) {
//     throw new Error("Aucune donnée à exporter.")
//   }

//   if (format === "pdf") {
//     await exporterPDF(tableaux, annee)
//   } else {
//     await exporterExcel(tableaux, annee)
//   }
// }











import {
  getBudgetDetails,
  getBudgetMensuel,
} from "@/services/budget-details-service"

const MOIS = [
  "Janvier", "Février", "Mars", "Avril",
  "Mai", "Juin", "Juillet", "Août",
  "Septembre", "Octobre", "Novembre", "Décembre",
]

const SECTIONS = [
  { key: "charges", title: "Charges" },
  { key: "exportations", title: "Exportations" },
  { key: "frais-export", title: "Frais export" },
  { key: "production", title: "Production" },
  { key: "employes", title: "Employés" },
  { key: "budget", title: "Budget annuel" },
  { key: "amortissements", title: "Amortissements" },
  { key: "compte-resultat", title: "Compte de résultat" },
]

const FRAIS = [
  ["transport_local", "Transport local"],
  ["transit", "Transit"],
  ["manutention", "Manutention"],
  ["fret", "Fret"],
  ["assurance", "Assurance"],
  ["frais_bancaires", "Frais bancaires"],
  ["total", "Total"],
]

const INDICATEURS = [
  ["ca_export", "CA export", "montant"],
  ["charges_exploitation", "Charges d'exploitation", "montant"],
  ["frais_export", "Frais export", "montant"],
  ["masse_salariale", "Masse salariale", "montant"],
  ["resultat_operationnel", "Résultat opérationnel", "montant"],
  ["marge_operationnelle", "Marge opérationnelle", "pourcentage"],
]

// ======================================================
// UTILITAIRES
// ======================================================

const TEXTE = (v) =>
  v == null || v === "" ? "-" : String(v)

const NOMBRE = (v) => {
  const n = Number(
    typeof v === "string"
      ? v.replace(/[\s\u00a0\u202f]/g, "").replace(",", ".")
      : v
  )
  return Number.isFinite(n) ? n : 0
}

const FORMATER = (v, pourcentage = false) => {
  const n = NOMBRE(v)
  const parties = n.toFixed(2).split(".")
  const entier = parties[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  const resultat = Number(parties[1]) === 0
    ? entier
    : `${entier},${parties[1]}`

  return resultat + (pourcentage ? " %" : "")
}

const NORMALISER = (v) =>
  String(v ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")

function indexMois(v) {
  const n = Number(v)

  if (Number.isInteger(n) && n >= 1 && n <= 12) {
    return n - 1
  }

  const s = NORMALISER(v)

  return MOIS.findIndex(
    (m) =>
      NORMALISER(m) === s ||
      NORMALISER(m).slice(0, 3) === s
  )
}

function moisDe(row) {
  return indexMois(
    row.nom_mois ??
    row.mois ??
    row.numero_mois ??
    row.mois_id
  )
}

function groupeMensuel(rows, dimensions, indicateur) {
  const map = new Map()

  for (const r of rows) {
    const m = moisDe(r)
    if (m < 0) continue

    const valeurs = dimensions.map((k) => TEXTE(r[k]))
    const cle = JSON.stringify(valeurs)

    if (!map.has(cle)) {
      map.set(cle, {
        valeurs,
        mois: Array(12).fill(0),
      })
    }

    map.get(cle).mois[m] += NOMBRE(r[indicateur])
  }

  return [...map.values()].sort((a, b) =>
    a.valeurs.join("|").localeCompare(
      b.valeurs.join("|"), "fr"
    )
  )
}

// ======================================================
// CONSTRUCTION DES TABLEAUX
// ======================================================

function tableauMensuel(titre, entetes, lignes, options = {}) {
  const {
    total = true,
    pourcentage = false,
    regroupement = null,
    unite = "MGA",
    sousTotal = true,
  } = options

  const head = [
    ...entetes,
    ...MOIS,
    ...(total ? ["Total"] : []),
  ]

  const body = []
  let groupeActuel = null
  let totauxGroupe = Array(12).fill(0)

  const ajouterTotal = () => {
    if (groupeActuel === null || !sousTotal) return

    body.push({
      cellules: [
        `Total ${groupeActuel}`,
        ...Array(entetes.length - 1).fill(""),
        ...totauxGroupe,
        ...(total
          ? [totauxGroupe.reduce((a, b) => a + b, 0)]
          : []),
      ],
      total: true,
    })

    totauxGroupe = Array(12).fill(0)
  }

  for (const ligne of lignes) {
    if (regroupement !== null) {
      const groupe = ligne.valeurs[regroupement]

      if (groupe !== groupeActuel) {
        ajouterTotal()
        groupeActuel = groupe

        body.push({
          cellules: [groupe],
          groupe: true,
        })
      }
    }

    const nums = ligne.mois.map(NOMBRE)

    nums.forEach((n, i) => {
      totauxGroupe[i] += n
    })

    body.push({
      cellules: [
        ...ligne.valeurs,
        ...nums,
        ...(total
          ? [nums.reduce((a, b) => a + b, 0)]
          : []),
      ],
    })
  }

  if (regroupement !== null) ajouterTotal()

  return {
    titre,
    head,
    body,
    dimensions: entetes.length,
    total,
    pourcentage,
    unite,
    mensuel: true,
  }
}

function tableauSimple(titre, entetes, rows, unite = "MGA") {
  return {
    titre,
    head: entetes.map((e) => e[1]),
    body: rows.map((r) => ({
      cellules: entetes.map((e) => r[e[0]] ?? ""),
    })),
    mensuel: false,
    unite,
  }
}

// ======================================================
// COMPTE DE RESULTAT
// ======================================================

function tableauCompteResultat(rows) {
  const body = rows.map((ligne) => {
    const mensuel = Array.from(
      { length: 12 },
      (_, i) => NOMBRE(ligne.mensuel?.[i])
    )

    return {
      cellules: [
        ligne.rubrique ?? ligne.code ?? "-",
        ...mensuel,
        NOMBRE(ligne.totalAnnuel),
      ],
      sousTotal: ligne.type === "sous-total",
      resultatFinal: ligne.type === "resultat-final",
      pourcentage: ligne.format === "pourcentage",
      code: ligne.code,
    }
  })

  return {
    titre: "Compte de résultat",
    head: ["Rubrique", ...MOIS, "Total annuel"],
    body,
    dimensions: 1,
    total: true,
    pourcentage: false,
    unite: "MGA / %",
    mensuel: true,
    compteResultat: true,
  }
}

// ======================================================
// AMORTISSEMENTS
// ======================================================

function tableauAmortissements(rows) {
  const lignes = groupeMensuel(
    rows,
    [
      "categorie",
      "nature",
      "perimetre_general",
      "unite",
    ],
    "montant"
  )

  const tableau = tableauMensuel(
    "Dotations aux amortissements",
    [
      "Catégorie",
      "Nature",
      "Périmètre général",
      "Unité",
    ],
    lignes,
    { regroupement: 0 }
  )

  // Total général annuel et mensuel
  const totaux = Array(12).fill(0)

  for (const ligne of lignes) {
    ligne.mois.forEach((montant, i) => {
      totaux[i] += NOMBRE(montant)
    })
  }

  tableau.body.push({
    cellules: [
      "TOTAL AMORTISSEMENTS",
      "",
      "",
      "",
      ...totaux,
      totaux.reduce((a, b) => a + b, 0),
    ],
    total: true,
    resultatFinal: true,
  })

  return tableau
}

// ======================================================
// TABLEAUX DES SECTIONS
// ======================================================

function construireTableaux(donnees) {
  const d = Object.fromEntries(
    donnees.map((s) => [s.key, s.rows])
  )

  const tableaux = []

  // CHARGES
  const charges = d.charges || []

  if (charges.length) {
    tableaux.push(
      tableauMensuel(
        "Charges par catégorie",
        ["Catégorie", "Sous-catégorie", "Site", "Unité"],
        groupeMensuel(
          charges,
          ["categorie", "sous_categorie", "site", "unite"],
          "montant"
        ),
        { regroupement: 0 }
      )
    )
  }

  // EXPORTATIONS
  const exp = d.exportations || []

  if (exp.length) {
    const configurations = [
      ["quantite", "Quantités exportées", "Tonnes / unités"],
      ["ca_devise", "CA en devise", "Devises (voir colonne)"],
      ["ca_mga", "CA en MGA", "MGA"],
    ]

    for (const [champ, titre, unite] of configurations) {
      tableaux.push(
        tableauMensuel(
          `Exportations — ${titre} par pays`,
          ["Pays", "Représentant", "Produit", "Devise"],
          groupeMensuel(
            exp,
            ["pays", "representant", "produit", "devise"],
            champ
          ),
          {
            regroupement: 0,
            unite,
            sousTotal: champ !== "ca_devise",
          }
        )
      )
    }
  }

  // FRAIS EXPORT
  const frais = d["frais-export"] || []

  if (frais.length) {
    const lignes = []

    for (const [champ, label] of FRAIS) {
      for (const ligne of groupeMensuel(
        frais,
        ["pays", "representant"],
        champ
      )) {
        lignes.push({
          valeurs: [...ligne.valeurs, label],
          mois: ligne.mois,
        })
      }
    }

    lignes.sort((a, b) =>
      a.valeurs.join("|").localeCompare(
        b.valeurs.join("|"), "fr"
      )
    )

    tableaux.push(
      tableauMensuel(
        "Frais export par pays et représentant",
        ["Pays", "Représentant", "Type de frais"],
        lignes,
        { regroupement: 0, sousTotal: false }
      )
    )
  }

  // PRODUCTION
  const production = d.production || []

  if (production.length) {
    tableaux.push(
      tableauMensuel(
        "Production par site et produit",
        ["Site", "Produit", "Unité"],
        groupeMensuel(
          production,
          ["site", "produit", "unite"],
          "production_reelle"
        ),
        {
          regroupement: 0,
          unite: "Unités de production",
        }
      )
    )
  }

  // EMPLOYÉS
  const employes = d.employes || []

  if (employes.length) {
    tableaux.push(
      tableauSimple(
        "Employés",
        [
          ["nom", "Nom"],
          ["salaire_base", "Salaire de base"],
          ["prime", "Prime"],
          ["charges_patronales", "Charges patronales"],
          ["cout_total", "Coût total"],
        ],
        employes
      )
    )
  }

  // BUDGET ANNUEL
  const budget = d.budget || []

  if (budget.length) {
    tableaux.push(
      tableauSimple(
        "Budget annuel",
        [
          ["type_budget", "Type"],
          ["statut", "Statut"],
          ...INDICATEURS.map(([k, label]) => [k, label]),
          ["date_generation", "Date de génération"],
        ],
        budget
      )
    )
  }

  // BUDGET MENSUEL
  const mensuel = d.budget_mensuel || []

  if (mensuel.length) {
    const lignes = INDICATEURS.map(([key, label, type]) => {
      const valeurs = Array(12).fill(0)

      for (const r of mensuel) {
        const i = moisDe(r)

        if (i >= 0) {
          valeurs[i] += NOMBRE(r[key])
        }
      }

      return {
        valeurs: [label],
        mois: valeurs,
        type,
      }
    })

    tableaux.push(
      tableauMensuel(
        "Budget mensuel",
        ["Indicateur"],
        lignes.filter((l) => l.type !== "pourcentage")
      )
    )

    const marge = lignes.find(
      (l) => l.type === "pourcentage"
    )

    if (marge) {
      tableaux.push(
        tableauMensuel(
          "Marge opérationnelle mensuelle",
          ["Indicateur"],
          [marge],
          {
            total: false,
            pourcentage: true,
            unite: "%",
          }
        )
      )
    }
  }

  // AMORTISSEMENTS
  const amortissements = d.amortissements || []

  if (amortissements.length) {
    tableaux.push(
      tableauAmortissements(amortissements)
    )
  }

  // COMPTE DE RÉSULTAT
  const compteResultat = d["compte-resultat"] || []

  if (compteResultat.length) {
    tableaux.push(
      tableauCompteResultat(compteResultat)
    )
  }

  return tableaux
}

// ======================================================
// CHARGEMENT DES DONNÉES
// ======================================================

async function chargerDonnees(exerciceId) {
  const donnees = await Promise.all(
    SECTIONS.map(async (s) => {
      const rows = await getBudgetDetails(
        s.key,
        exerciceId
      )

      return {
        ...s,
        rows: Array.isArray(rows) ? rows : [],
      }
    })
  )

  const budget =
    donnees.find((s) => s.key === "budget")?.rows || []

  const budgetId =
    budget[0]?.id ??
    budget[0]?.id_budget ??
    budget[0]?.budget_id

  let mensuel = []

  if (budget.length && budgetId == null) {
    throw new Error(
      "Budget annuel trouvé, mais identifiant introuvable."
    )
  }

  if (budgetId != null) {
    const resultat = await getBudgetMensuel(budgetId)

    mensuel = Array.isArray(resultat)
      ? resultat
      : []
  }

  donnees.push({
    key: "budget_mensuel",
    title: "Budget mensuel",
    rows: mensuel,
  })

  if (donnees.every((s) => !s.rows.length)) {
    throw new Error(
      "Aucune donnée disponible pour cet exercice."
    )
  }

  return donnees
}

// ======================================================
// TÉLÉCHARGEMENT
// ======================================================

function telecharger(blob, nom) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")

  a.href = url
  a.download = nom

  document.body.appendChild(a)
  a.click()
  a.remove()

  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function celluleAffichee(t, ligne, i) {
  const v = ligne.cellules[i]

  if (typeof v !== "number") {
    return TEXTE(v)
  }

  const estPourcentage =
    ligne.pourcentage ?? t.pourcentage

  return FORMATER(v, estPourcentage)
}

// ======================================================
// EXPORT PDF
// ======================================================

async function exporterPDF(tableaux, annee) {
  const { jsPDF } = await import("jspdf")
  const { default: autoTable } = await import("jspdf-autotable")

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a3",
  })

  const largeur = doc.internal.pageSize.getWidth()
  const hauteur = doc.internal.pageSize.getHeight()

  doc.setFillColor(51, 78, 104)
  doc.rect(0, 0, largeur, 38, "F")

  doc.setTextColor(255)
  doc.setFontSize(19)
  doc.text("SOMIDA - RAPPORT BUDGETAIRE", 12, 17)

  doc.setFontSize(11)
  doc.text(`Exercice ${annee}`, 12, 27)

  let y = 46

  for (let index = 0; index < tableaux.length; index++) {
    const t = tableaux[index]

    if (index > 0) {
      doc.addPage()
      y = 20
    }

    doc.setTextColor(30, 41, 59)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)

    doc.text(`${t.titre} (${t.unite})`, 10, y)

    autoTable(doc, {
      startY: y + 5,
      head: [t.head],

      body: t.body.map((l) =>
        l.groupe
          ? [
              l.cellules[0],
              ...Array(t.head.length - 1).fill(""),
            ]
          : t.head.map((_, i) =>
              celluleAffichee(t, l, i)
            )
      ),

      theme: "grid",
      showHead: "everyPage",
      pageBreak: "auto",
      rowPageBreak: "avoid",

      styles: {
        fontSize: t.mensuel ? 6.1 : 8,
        cellPadding: 1.6,
        overflow: "linebreak",
        valign: "middle",
      },

      headStyles: {
        fillColor: [79, 109, 138],
        textColor: 255,
      },

      didParseCell: (data) => {
        if (data.section !== "body") return

        const ligne = t.body[data.row.index]

        if (ligne?.groupe || ligne?.total || ligne?.sousTotal) {
          data.cell.styles.fillColor = ligne.groupe
            ? [216, 226, 237]
            : [232, 239, 246]

          data.cell.styles.fontStyle = "bold"
        }

        if (ligne?.resultatFinal) {
          data.cell.styles.fillColor = [30, 110, 85]
          data.cell.styles.textColor = [255, 255, 255]
          data.cell.styles.fontStyle = "bold"
        }

        if (
          t.mensuel &&
          data.column.index >= t.dimensions
        ) {
          data.cell.styles.halign = "right"
        }
      },

      margin: {
        left: 9,
        right: 9,
        top: 18,
        bottom: 18,
      },
    })

    y = (doc.lastAutoTable?.finalY ?? y) + 14
  }

  const pages = doc.getNumberOfPages()

  for (let p = 1; p <= pages; p++) {
    doc.setPage(p)
    doc.setFontSize(9)
    doc.setTextColor(110, 120, 130)

    doc.text(
      `Simplifie - SXMXDX | Page ${p}/${pages}`,
      largeur - 10,
      hauteur - 8,
      { align: "right" }
    )
  }

  doc.save(`SOMIDA_Rapport_Budget_${annee}.pdf`)
}

// ======================================================
// EXPORT EXCEL
// ======================================================

async function exporterExcel(tableaux, annee) {
  const ExcelJS = (await import("exceljs")).default
  const workbook = new ExcelJS.Workbook()

  workbook.creator = "Simplifié - SXMXDX"

  for (let n = 0; n < tableaux.length; n++) {
    const t = tableaux[n]

    const nomFeuille = `${n + 1} ${t.titre}`
      .replace(/[\[\]*?\/\\:]/g, "-")
      .slice(0, 31)

    const sheet = workbook.addWorksheet(nomFeuille)

    sheet.mergeCells(1, 1, 1, t.head.length)

    const title = sheet.getCell(1, 1)

    title.value =
      `SOMIDA — ${t.titre} — ${annee} (${t.unite})`

    title.font = {
      bold: true,
      size: 15,
      color: { argb: "FFFFFFFF" },
    }

    title.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF334E68" },
    }

    sheet.getRow(1).height = 30
    sheet.addRow([])

    const headers = sheet.addRow(t.head)

    headers.eachCell((cell) => {
      cell.font = {
        bold: true,
        color: { argb: "FFFFFFFF" },
      }

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF617F9B" },
      }
    })

    for (const l of t.body) {
      const row = sheet.addRow(
        l.groupe ? [l.cellules[0]] : l.cellules
      )

      if (
        l.groupe ||
        l.total ||
        l.sousTotal ||
        l.resultatFinal
      ) {
        row.eachCell((cell) => {
          cell.font = {
            bold: true,
            color: l.resultatFinal
              ? { argb: "FFFFFFFF" }
              : { argb: "FF000000" },
          }

          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
              argb: l.resultatFinal
                ? "FF1E6E55"
                : l.groupe
                  ? "FFD8E2ED"
                  : "FFE8EFF6",
            },
          }
        })
      }

      if (t.compteResultat) {
        for (let i = 2; i <= t.head.length; i++) {
          const cell = row.getCell(i)

          cell.numFmt = l.pourcentage
            ? '0.00" %"'
            : "#,##0.00"
        }
      }
    }

    sheet.getColumn(1).width = t.compteResultat
      ? 45
      : 32

    for (let i = 2; i <= t.head.length; i++) {
      sheet.getColumn(i).width =
        t.mensuel && i > t.dimensions
          ? 16
          : 20
    }

    if (t.mensuel && !t.compteResultat) {
      for (
        let i = t.dimensions + 1;
        i <= t.head.length;
        i++
      ) {
        sheet.getColumn(i).numFmt = t.pourcentage
          ? '0.00" %"'
          : "#,##0.00"
      }
    }

    sheet.views = [{
      state: "frozen",
      ySplit: 3,
      xSplit: t.mensuel ? t.dimensions : 0,
    }]

    sheet.pageSetup = {
      orientation: "landscape",
      paperSize: 8,
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
    }
  }

  const buffer = await workbook.xlsx.writeBuffer()

  telecharger(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `SOMIDA_Budget_${annee}.xlsx`
  )
}

// ======================================================
// FONCTION APPELÉE PAR BUDGET-DETAILS.TSX
// ======================================================

export async function exporterBudget(
  exerciceId,
  annee,
  format
) {
  if (!["pdf", "excel"].includes(format)) {
    throw new Error(
      "Format d'exportation invalide."
    )
  }

  if (!exerciceId || !annee) {
    throw new Error(
      "Veuillez sélectionner un exercice."
    )
  }

  const donnees = await chargerDonnees(exerciceId)
  const tableaux = construireTableaux(donnees)

  if (!tableaux.length) {
    throw new Error(
      "Aucune donnée à exporter."
    )
  }

  if (format === "pdf") {
    await exporterPDF(tableaux, annee)
  } else {
    await exporterExcel(tableaux, annee)
  }
}
