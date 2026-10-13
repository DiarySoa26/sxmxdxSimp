
// import { jsPDF } from "jspdf"
// import autoTable from "jspdf-autotable"
// import { toPng } from "html-to-image"

// const format = value => new Intl.NumberFormat("fr-FR", {
//   maximumFractionDigits: 0
// }).format(Number(value || 0))

// const pct = value => {
//   const n = Number(value || 0)
//   return `${(Math.abs(n) <= 1 ? n * 100 : n).toFixed(2)} %`
// }

// export async function exporterPredictionPDF({ prediction, graphiques }) {
//   const pdf = new jsPDF("landscape", "mm", "a4")
//   const largeur = pdf.internal.pageSize.getWidth()
//   const hauteur = pdf.internal.pageSize.getHeight()
//   const marge = 14
//   let y = 18

//   const titre = (texte) => {
//     if (y > hauteur - 35) {
//       pdf.addPage()
//       y = 18
//     }
//     pdf.setFont("helvetica", "bold")
//     pdf.setFontSize(13)
//     pdf.text(texte, marge, y)
//     y += 9
//   }

//   const nouvellePage = () => {
//     pdf.addPage()
//     y = 18
//   }

//   pdf.setFont("helvetica", "bold")
//   pdf.setFontSize(19)
//   pdf.text("Prévision budgétaire", marge, y)
//   y += 10

//   pdf.setFont("helvetica", "normal")
//   pdf.setFontSize(10)
//   pdf.text(`Année prévisionnelle : ${prediction.annee}`, marge, y)
//   y += 6
//   pdf.text(`Année de référence : ${prediction.annee_reference}`, marge, y)
//   y += 6
//   pdf.text(`Modèle : ${prediction.modele || "-"}`, marge, y)
//   y += 12

//   titre("Résultats prévisionnels annuels")

//   autoTable(pdf, {
//     startY: y,
//     head: [["Indicateur", "Valeur"]],
//     body: [
//       ["CA export", `${format(prediction.ca_export)} MGA`],
//       ["Charges d'exploitation", `${format(prediction.charges_exploitation)} MGA`],
//       ["Frais export", `${format(prediction.frais_export)} MGA`],
//       ["Masse salariale", `${format(prediction.masse_salariale)} MGA`],
//       ["Résultat opérationnel", `${format(prediction.resultat_operationnel)} MGA`],
//       ["Marge opérationnelle", pct(prediction.marge_operationnelle)]
//     ],
//     theme: "grid",
//     styles: { fontSize: 9 },
//     headStyles: { fillColor: [100, 120, 160] },
//     margin: { left: marge, right: marge }
//   })

//   y = pdf.lastAutoTable.finalY + 14

//   // Capturer les graphiques existants
//   for (const element of graphiques) {
//     if (!element) continue

//     nouvellePage()
//     const image = await toPng(element, {
//       backgroundColor: "#ffffff",
//       pixelRatio: 2,
//       cacheBust: true
//     })

//     const img = new Image()
//     img.src = image
//     await img.decode()

//     const imgLargeur = largeur - marge * 2
//     const imgHauteur = imgLargeur * img.naturalHeight / img.naturalWidth
//     const hauteurDisponible = hauteur - 36
//     const ratio = Math.min(1, hauteurDisponible / imgHauteur)

//     pdf.addImage(
//       image, "PNG", marge, y,
//       imgLargeur * ratio, imgHauteur * ratio
//     )
//   }

//   nouvellePage()
//   titre("Prévisions mensuelles")

//   const lignes = [...(prediction.mois || [])]
//     .sort((a, b) => Number(a.mois_id) - Number(b.mois_id))

//   autoTable(pdf, {
//     startY: y,
//     head: [[
//       "Mois", "CA export", "Charges", "Frais export",
//       "Masse salariale", "Résultat", "Marge"
//     ]],
//     body: lignes.map(m => [
//       m.mois,
//       format(m.ca_export),
//       format(m.charges_exploitation),
//       format(m.frais_export),
//       format(m.masse_salariale),
//       format(m.resultat_operationnel),
//       pct(m.marge_operationnelle)
//     ]),
//     theme: "grid",
//     styles: { fontSize: 8 },
//     headStyles: { fillColor: [100, 120, 160] },
//     margin: { left: marge, right: marge }
//   })

//   y = pdf.lastAutoTable.finalY + 14

//   if (prediction.resume) {
//     titre("Résumé de l'analyse automatique")
//     pdf.setFont("helvetica", "normal")
//     pdf.setFontSize(9)
    
//     // des caractères non pris en charge.
//     const resume = String(prediction.resume)
//     const lignesResume = pdf.splitTextToSize(resume, largeur - marge * 2)

//     for (const ligne of lignesResume) {
//       if (y > hauteur - 18) nouvellePage()
//       pdf.text(ligne, marge, y)
//       y += 5
//     }
//   }

//   const pages = pdf.getNumberOfPages()
//   for (let i = 1; i <= pages; i++) {
//     pdf.setPage(i)
//     pdf.setFontSize(8)
//     pdf.setTextColor(120)
//     pdf.text(`SXMXDX | Prévision ${prediction.annee}`, marge, hauteur - 8)
//     pdf.text(`${i} / ${pages}`, largeur - marge, hauteur - 8, { align: "right" })
//   }

//   pdf.save(`Prediction_Budgetaire_${prediction.annee}.pdf`)
// }






import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { toPng } from "html-to-image"

const format = value => {
  const n = Number(value ?? 0)
  if (!Number.isFinite(n)) return "0"

  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ")
}

const pct = value => {
  const n = Number(value ?? 0)
  if (!Number.isFinite(n)) return "0.00 %"
  return `${(Math.abs(n) <= 1 ? n * 100 : n).toFixed(2)} %`
}

const MOIS = [
  "", "Janvier", "Février", "Mars", "Avril", "Mai",
  "Juin", "Juillet", "Août", "Septembre",
  "Octobre", "Novembre", "Décembre"
]

const nomMois = m => {
  if (typeof m.mois === "string" && m.mois.trim()) return m.mois
  return MOIS[Number(m.mois_id)] || `Mois ${m.mois_id}`
}

export async function exporterPredictionPDF({
  prediction,
  graphiques = [],
  graphiqueTrajectoire,
  graphiqueDepenses
}) {
  if (!prediction) throw new Error("Aucune prédiction à exporter.")

  const pdf = new jsPDF("landscape", "mm", "a4")
  const largeur = pdf.internal.pageSize.getWidth()
  const hauteur = pdf.internal.pageSize.getHeight()
  const marge = 14
  let y = 18

  const titre = texte => {
    if (y > hauteur - 35) {
      pdf.addPage()
      y = 18
    }

    pdf.setFont("helvetica", "bold")
    pdf.setTextColor(35, 45, 65)
    pdf.setFontSize(13)
    pdf.text(texte, marge, y)
    y += 9
  }

  const nouvellePage = () => {
    pdf.addPage()
    y = 18
  }

  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(35, 45, 65)
  pdf.setFontSize(19)
  pdf.text("Prévision budgétaire", marge, y)
  y += 10

  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(10)
  pdf.text(`Année prévisionnelle : ${prediction.annee}`, marge, y)
  y += 6
  pdf.text(`Année de référence : ${prediction.annee_reference ?? "-"}`, marge, y)
  y += 6
  pdf.text(`Modèle : ${prediction.modele || "-"}`, marge, y)
  y += 12

  titre("Résultats prévisionnels annuels")

  autoTable(pdf, {
    startY: y,
    head: [["Indicateur", "Valeur"]],
    body: [
      ["CA export", `${format(prediction.ca_export)} MGA`],
      ["Charges d'exploitation", `${format(prediction.charges_exploitation)} MGA`],
      ["Frais export", `${format(prediction.frais_export)} MGA`],
      ["Masse salariale", `${format(prediction.masse_salariale)} MGA`],
      ["Résultat opérationnel", `${format(prediction.resultat_operationnel)} MGA`],
      ["Marge opérationnelle", pct(prediction.marge_operationnelle)]
    ],
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [100, 120, 160] },
    columnStyles: {
      0: { cellWidth: 115 },
      1: { halign: "right" }
    },
    margin: { left: marge, right: marge }
  })

  y = pdf.lastAutoTable.finalY + 14

  // Accepte les deux formats d'appel du service.
  const elements = Array.isArray(graphiques)
    ? graphiques
    : []

  const graphiquesPDF = elements.length > 0
    ? elements
    : [graphiqueTrajectoire, graphiqueDepenses]

  const titresGraphiques = [
    "Trajectoire budgétaire prévisionnelle",
    "Évolution des dépenses prévisionnelles"
  ]

  for (const [index, element] of graphiquesPDF.entries()) {
    if (!(element instanceof HTMLElement)) continue

    nouvellePage()
    titre(titresGraphiques[index] || `Graphique ${index + 1}`)

    const image = await toPng(element, {
      backgroundColor: "#ffffff",
      pixelRatio: 2,
      cacheBust: true
    })

    const img = new Image()
    img.src = image
    await img.decode()

    const largeurMax = largeur - marge * 2
    const hauteurMax = hauteur - y - 16
    const ratioImage = img.naturalWidth / img.naturalHeight

    let imgLargeur = largeurMax
    let imgHauteur = imgLargeur / ratioImage

    if (imgHauteur > hauteurMax) {
      imgHauteur = hauteurMax
      imgLargeur = imgHauteur * ratioImage
    }

    pdf.addImage(
      image,
      "PNG",
      (largeur - imgLargeur) / 2,
      y,
      imgLargeur,
      imgHauteur
    )
  }

  nouvellePage()
  titre("Prévisions mensuelles")

  const lignes = [...(prediction.mois || [])]
    .sort((a, b) => Number(a.mois_id) - Number(b.mois_id))

  autoTable(pdf, {
    startY: y,
    head: [[
      "Mois", "CA export", "Charges", "Frais export",
      "Masse salariale", "Résultat", "Marge"
    ]],
    body: lignes.map(m => [
      nomMois(m),
      format(m.ca_export),
      format(m.charges_exploitation),
      format(m.frais_export),
      format(m.masse_salariale),
      format(m.resultat_operationnel),
      pct(m.marge_operationnelle)
    ]),
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      overflow: "linebreak"
    },
    headStyles: { fillColor: [100, 120, 160] },
    columnStyles: {
      0: { cellWidth: 27 },
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right" },
      5: { halign: "right" },
      6: { halign: "right" }
    },
    margin: { left: marge, right: marge }
  })

  y = pdf.lastAutoTable.finalY + 14

  if (prediction.resume) {
    titre("Résumé de l'analyse automatique")

    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(35, 45, 65)
    pdf.setFontSize(9)

    const resume = String(prediction.resume)
      .replace(/[\u202F\u00A0]/g, " ")

    const lignesResume = pdf.splitTextToSize(
      resume,
      largeur - marge * 2
    )

    for (const ligne of lignesResume) {
      if (y > hauteur - 18) nouvellePage()
      pdf.text(ligne, marge, y)
      y += 5
    }
  }

  const pages = pdf.getNumberOfPages()

  for (let i = 1; i <= pages; i++) {
    pdf.setPage(i)
    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(8)
    pdf.setTextColor(120)

    pdf.text(
      `SXMXDX | Prévision ${prediction.annee}`,
      marge,
      hauteur - 8
    )

    pdf.text(
      `${i} / ${pages}`,
      largeur - marge,
      hauteur - 8,
      { align: "right" }
    )
  }

  pdf.save(`Prediction_Budgetaire_${prediction.annee}.pdf`)
}

