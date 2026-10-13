
export async function exporterAnalysePDF({
  annee,
  budget,
  mensuel,
  graphiqueTrajectoire,
  graphiqueDepenses
}) {
  if (!budget) throw new Error("Aucun budget disponible.")
  if (!mensuel?.length) throw new Error("Aucune donnée mensuelle disponible.")

  const { jsPDF } = await import("jspdf")
  const { default: autoTable } = await import("jspdf-autotable")
  const { toPng } = await import("html-to-image")

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4"
  })

  const largeur = doc.internal.pageSize.getWidth()
  const hauteur = doc.internal.pageSize.getHeight()

  const nombre = v => {
    const n = Number(v)
    return Number.isFinite(n) ? n : 0
  }

  const formatNombre = v => {
    const n = nombre(v)
    const parties = n.toFixed(2).split(".")
    const entier = parties[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ")
    return Number(parties[1]) === 0
      ? entier
      : `${entier},${parties[1]}`
  }

  const pourcentage = v => {
    let n = nombre(v)
    if (Math.abs(n) <= 1) n *= 100
    return `${formatNombre(n)} %`
  }

  function titre(texte, y = 18) {
    doc.setTextColor(45, 65, 85)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(15)
    doc.text(texte, 14, y)
  }

  async function ajouterGraphique(element, titreGraphique) {
    if (!element) {
      throw new Error(`Graphique introuvable : ${titreGraphique}`)
    }

    const image = await toPng(element, {
      backgroundColor: "#ffffff",
      pixelRatio: 2,
      cacheBust: true
    })

    doc.addPage()
    titre(titreGraphique)

    const marge = 15
    const maxLargeur = largeur - marge * 2
    const maxHauteur = hauteur - 48

    const img = new Image()
    img.src = image
    await img.decode()

    const ratio = Math.min(
      maxLargeur / img.naturalWidth,
      maxHauteur / img.naturalHeight
    )

    const w = img.naturalWidth * ratio
    const h = img.naturalHeight * ratio

    doc.addImage(
      image,
      "PNG",
      (largeur - w) / 2,
      28,
      w,
      h
    )
  }

  // PAGE 1 : SYNTHÈSE FINANCIÈRE
  doc.setFillColor(51, 78, 104)
  doc.rect(0, 0, largeur, 39, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(19)
  doc.text("SOMIDA - ANALYSE BUDGETAIRE", 14, 18)

  doc.setFontSize(11)
  doc.text(`Exercice ${annee}`, 14, 29)

  titre("Synthèse des indicateurs annuels", 52)

  const indicateurs = [
    ["CA export", formatNombre(budget.ca_export), "MGA"],
    ["Charges d'exploitation", formatNombre(budget.charges_exploitation), "MGA"],
    ["Frais export", formatNombre(budget.frais_export), "MGA"],
    ["Masse salariale", formatNombre(budget.masse_salariale), "MGA"],
    ["Résultat opérationnel", formatNombre(budget.resultat_operationnel), "MGA"],
    ["Marge opérationnelle", pourcentage(budget.marge_operationnelle), ""]
  ]

  autoTable(doc, {
    startY: 60,
    head: [["Indicateur", "Valeur", "Unité"]],
    body: indicateurs,
    theme: "striped",
    styles: { fontSize: 11, cellPadding: 4 },
    headStyles: { fillColor: [79, 109, 138] },
    columnStyles: {
      0: { cellWidth: 115 },
      1: { halign: "right" }
    },
    margin: { left: 14, right: 14 }
  })

  // PAGE 2 : TRAJECTOIRE BUDGÉTAIRE
  await ajouterGraphique(
    graphiqueTrajectoire,
    "Trajectoire budgétaire - CA export et résultat"
  )

  // PAGE 3 : ÉVOLUTION DES DÉPENSES
  await ajouterGraphique(
    graphiqueDepenses,
    "Évolution mensuelle des dépenses"
  )

  // PAGE 4 : TABLEAU MENSUEL
  doc.addPage()
  titre("Détail mensuel des indicateurs financiers")

  const MOIS = [
    "Janvier", "Février", "Mars", "Avril",
    "Mai", "Juin", "Juillet", "Août",
    "Septembre", "Octobre", "Novembre", "Décembre"
  ]

  const normaliser = v => String(v ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")

  const numeroMois = item => {
    const candidat = item.mois_id ?? item.mois ?? item.nom_mois ?? item.mois_nom
    const n = Number(candidat)
    if (Number.isInteger(n) && n >= 1 && n <= 12) return n

    const texte = normaliser(candidat)
    const index = MOIS.findIndex(m =>
      normaliser(m) === texte ||
      normaliser(m).slice(0, 3) === texte
    )

    return index + 1
  }

  const lignes = [...mensuel].sort(
    (a, b) => numeroMois(a) - numeroMois(b)
  )

  autoTable(doc, {
    startY: 26,
    head: [[
      "Mois", "CA export", "Charges",
      "Frais export", "Masse salariale",
      "Résultat", "Marge"
    ]],
    body: lignes.map(item => [
      MOIS[numeroMois(item) - 1] ?? "-",
      formatNombre(item.ca_export),
      formatNombre(item.charges_exploitation),
      formatNombre(item.frais_export),
      formatNombre(item.masse_salariale),
      formatNombre(item.resultat_operationnel),
      pourcentage(item.marge_operationnelle)
    ]),
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      overflow: "linebreak"
    },
    headStyles: { fillColor: [79, 109, 138] },
    margin: { left: 10, right: 10, bottom: 18 },
    showHead: "everyPage"
  })

  // PIED DE PAGE
  const totalPages = doc.getNumberOfPages()

  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    doc.setFontSize(9)
    doc.setTextColor(110, 120, 130)
    doc.text(
      `Simplifie - SXMXDX | Page ${p}/${totalPages}`,
      largeur - 14,
      hauteur - 8,
      { align: "right" }
    )
  }

  doc.save(`SOMIDA_Analyse_Budgetaire_${annee}.pdf`)
}
