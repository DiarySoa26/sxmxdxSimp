// "use client"

// import { useEffect, useMemo, useRef, useState } from "react"
// import type { ElementType } from "react"
// import { Activity, Banknote, CircleDollarSign, FileText, Layers3, Loader2, TrendingUp, WalletCards } from "lucide-react"
// import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
// import { getBudgetDetails, getBudgetMensuel, getExercices } from "@/services/budget-details-service"
// import { exporterAnalysePDF } from "@/services/analyse-export-service"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// // ================= TYPES =================

// type Valeur = number | string | null | undefined
// type Exercice = { id_exercice: number; annee_exercice: number }
// type Budget = {
//   id?: number; budget_id?: number; id_budget?: number
//   ca_export?: Valeur; charges_exploitation?: Valeur; frais_export?: Valeur
//   masse_salariale?: Valeur; resultat_operationnel?: Valeur; marge_operationnelle?: Valeur
// }
// type BudgetMensuel = Budget & {
//   mois?: number | string; nom_mois?: string; mois_nom?: string; mois_id?: number
// }
// type LigneMensuelle = {
//   mois?: number | string; mois_id?: number; numero_mois?: number
//   nom_mois?: string; mois_nom?: string; montant?: Valeur
// }
// type Amortissement = LigneMensuelle
// type LigneCharge = LigneMensuelle & { categorie?: string }
// type LigneFraisExport = LigneMensuelle & {
//   total?: Valeur; transport_local?: Valeur; transit?: Valeur
//   manutention?: Valeur; fret?: Valeur; assurance?: Valeur; frais_bancaires?: Valeur
// }
// type LigneGraphique = {
//   id?: number; moisLabel: string; ordre: number
//   ca_export: number; charges_exploitation: number; frais_export: number
//   masse_salariale: number; resultat_operationnel: number; marge_operationnelle: number
//   amortissements: number; achats_consommes: number; services_exterieurs: number; impots_taxes: number
// }

// // ================= CONSTANTES =================

// const MOIS = ["", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]
// const fmt = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 })

// const CATEGORIES = {
//   achats: ["ACHAT PRODUITS", "PRODUCTION"],
//   services: ["ADMINISTRATION", "FINANCE", "LOGISTIQUE", "SECURITE"],
//   impots: ["FISCAL"],
// }

// // ================= UTILITAIRES =================

// const nombre = (v: unknown) => v == null || v === "" || !Number.isFinite(Number(v)) ? 0 : Number(v)
// const formatMGA = (v: unknown) => fmt.format(nombre(v))
// const formatCompact = (v: unknown) => {
//   const n = nombre(v), a = Math.abs(n)
//   return a >= 1e9 ? `${(n / 1e9).toFixed(2)} Md` : a >= 1e6 ? `${(n / 1e6).toFixed(2)} M` : a >= 1e3 ? `${(n / 1e3).toFixed(2)} k` : n.toFixed(0)
// }
// const formatPourcentage = (v: unknown) => {
//   const n = nombre(v)
//   return `${(Math.abs(n) <= 1 ? n * 100 : n).toFixed(2)} %`
// }
// const normaliserTexte = (v: unknown) => String(v ?? "").trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
// const numeroMois = (v: unknown) => {
//   const n = Number(v)
//   if (Number.isInteger(n) && n >= 1 && n <= 12) return n
//   const index = MOIS.findIndex(m => normaliserTexte(m) === normaliserTexte(v))
//   return index > 0 ? index : 0
// }
// const moisLigne = (l: LigneMensuelle) => numeroMois(l.mois_id ?? l.mois ?? l.numero_mois ?? l.nom_mois ?? l.mois_nom)

// // ================= CALCULS DES CHARGES =================

// function calculerCharges(data: LigneCharge[], categories: string[]) {
//   const result = Array<number>(13).fill(0), filtres = new Set(categories.map(normaliserTexte))
//   data.forEach(l => {
//     const m = moisLigne(l)
//     if (m && filtres.has(normaliserTexte(l.categorie))) result[m] += nombre(l.montant)
//   })
//   return result
// }

// function calculerFraisExport(data: LigneFraisExport[]) {
//   const result = Array<number>(13).fill(0)
//   data.forEach(l => {
//     const m = moisLigne(l)
//     if (!m) return
//     const montant = l.total ?? l.montant ?? (
//       nombre(l.transport_local) + nombre(l.transit) + nombre(l.manutention) +
//       nombre(l.fret) + nombre(l.assurance) + nombre(l.frais_bancaires)
//     )
//     result[m] += nombre(montant)
//   })
//   return result
// }

// const addition = (a: number[], b: number[]) => Array.from({ length: 13 }, (_, i) => (a[i] ?? 0) + (b[i] ?? 0))

// // ================= COMPOSANTS =================

// function KpiCard({ titre, valeur, description, icon: Icon, className, iconClassName }: {
//   titre: string; valeur: string; description: string; icon: ElementType
//   className: string; iconClassName: string
// }) {
//   return (
//     <Card className={`relative overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${className}`}>
//       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//         <CardTitle className="text-sm font-medium">{titre}</CardTitle>
//         <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClassName}`}><Icon className="h-5 w-5" /></div>
//       </CardHeader>
//       <CardContent>
//         <div className="text-2xl font-bold tracking-tight">{valeur}</div>
//         <p className="mt-1 text-xs text-muted-foreground">{description}</p>
//       </CardContent>
//     </Card>
//   )
// }

// const COULEURS = [
//   ["sky", "border-sky-100 bg-sky-50/40 dark:border-sky-900/40 dark:bg-sky-950/10", "bg-sky-100/70 text-sky-600"],
//   ["rose", "border-rose-100 bg-rose-50/40 dark:border-rose-900/40 dark:bg-rose-950/10", "bg-rose-100/70 text-rose-600"],
//   ["violet", "border-violet-100 bg-violet-50/40 dark:border-violet-900/40 dark:bg-violet-950/10", "bg-violet-100/70 text-violet-600"],
//   ["amber", "border-amber-100 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/10", "bg-amber-100/70 text-amber-600"],
//   ["emerald", "border-emerald-100 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/10", "bg-emerald-100/70 text-emerald-600"],
//   ["cyan", "border-cyan-100 bg-cyan-50/40 dark:border-cyan-900/40 dark:bg-cyan-950/10", "bg-cyan-100/70 text-cyan-600"],
// ]

// // ================= PAGE PRINCIPALE =================

// export default function AnalyseBudgetaire() {
//   const [exercices, setExercices] = useState<Exercice[]>([])
//   const [exerciceId, setExerciceId] = useState("")
//   const [exerciceCharge, setExerciceCharge] = useState("")
//   const [budget, setBudget] = useState<Budget | null>(null)
//   const [mensuel, setMensuel] = useState<BudgetMensuel[]>([])
//   const [amortissements, setAmortissements] = useState<Amortissement[]>([])
//   const [donneesCharges, setDonneesCharges] = useState<LigneCharge[]>([])
//   const [donneesFraisExport, setDonneesFraisExport] = useState<LigneFraisExport[]>([])
//   const [loadingExercices, setLoadingExercices] = useState(true)
//   const [loadingAnalyse, setLoadingAnalyse] = useState(false)
//   const [exportEnCours, setExportEnCours] = useState(false)
//   const [error, setError] = useState("")
//   const trajectoireRef = useRef<HTMLDivElement>(null)
//   const depensesRef = useRef<HTMLDivElement>(null)

//   // ================= CHARGEMENT EXERCICES =================

//   useEffect(() => {
//     let actif = true
//     async function charger() {
//       try {
//         const data = await getExercices()
//         if (!actif) return
//         const liste = Array.isArray(data) ? data : []
//         setExercices(liste)
//         if (liste.length) setExerciceId(String(liste[0].id_exercice))
//       } catch (e) {
//         if (actif) setError(e instanceof Error ? e.message : "Impossible de charger les exercices.")
//       } finally {
//         if (actif) setLoadingExercices(false)
//       }
//     }
//     void charger()
//     return () => { actif = false }
//   }, [])

//   const exerciceSelectionne = useMemo(() => exercices.find(e => String(e.id_exercice) === exerciceId), [exercices, exerciceId])
//   const exerciceAffiche = useMemo(() => exercices.find(e => String(e.id_exercice) === exerciceCharge), [exercices, exerciceCharge])

//   // ================= CHARGEMENT BUDGET =================

//   useEffect(() => {
//     if (!exerciceId) return
//     let actif = true
//     async function charger() {
//       setLoadingAnalyse(true)
//       setError("")
//       try {
//         const id = Number(exerciceId)
//         const budgets = await getBudgetDetails("budget", id)
//         if (!actif) return
//         if (!Array.isArray(budgets) || !budgets.length) throw new Error("Aucun budget disponible pour cet exercice.")

//         const b: Budget = budgets[0], budgetId = b.id ?? b.id_budget ?? b.budget_id
//         if (budgetId == null) throw new Error("L'identifiant du budget est introuvable.")

//         const [m, a, c, f] = await Promise.all([
//           getBudgetMensuel(budgetId),
//           getBudgetDetails("amortissements", id),
//           getBudgetDetails("charges", id),
//           getBudgetDetails("frais-export", id),
//         ])
//         if (!actif) return

//         setBudget(b)
//         setMensuel(Array.isArray(m) ? m : [])
//         setAmortissements(Array.isArray(a) ? a : [])
//         setDonneesCharges(Array.isArray(c) ? c : [])
//         setDonneesFraisExport(Array.isArray(f) ? f : [])
//         setExerciceCharge(exerciceId)
//       } catch (e) {
//         if (actif) setError(e instanceof Error ? e.message : "Impossible de charger l'analyse.")
//       } finally {
//         if (actif) setLoadingAnalyse(false)
//       }
//     }
//     void charger()
//     return () => { actif = false }
//   }, [exerciceId])

//   // ================= CALCULS MENSUELS =================

//   const amortissementsParMois = useMemo(() => {
//     const result = Array<number>(13).fill(0)
//     amortissements.forEach(l => { const m = moisLigne(l); if (m) result[m] += nombre(l.montant) })
//     return result
//   }, [amortissements])

//   const totalAmortissements = amortissementsParMois.slice(1).reduce((a, b) => a + b, 0)
//   const afficherAmortissements = amortissements.length > 0

//   const achats = useMemo(() => calculerCharges(donneesCharges, CATEGORIES.achats), [donneesCharges])
//   const servicesCharges = useMemo(() => calculerCharges(donneesCharges, CATEGORIES.services), [donneesCharges])
//   const services = useMemo(() => addition(servicesCharges, calculerFraisExport(donneesFraisExport)), [servicesCharges, donneesFraisExport])
//   const impots = useMemo(() => calculerCharges(donneesCharges, CATEGORIES.impots), [donneesCharges])

//   // ================= GRAPHIQUES =================

//   const graphiqueMensuel = useMemo<LigneGraphique[]>(() => mensuel.map(item => {
//     const m = moisLigne(item)
//     return {
//       id: item.id, moisLabel: MOIS[m] || item.nom_mois || item.mois_nom || "Mois inconnu", ordre: m,
//       ca_export: nombre(item.ca_export), charges_exploitation: nombre(item.charges_exploitation),
//       frais_export: nombre(item.frais_export), masse_salariale: nombre(item.masse_salariale),
//       resultat_operationnel: nombre(item.resultat_operationnel), marge_operationnelle: nombre(item.marge_operationnelle),
//       amortissements: amortissementsParMois[m] ?? 0, achats_consommes: achats[m] ?? 0,
//       services_exterieurs: services[m] ?? 0, impots_taxes: impots[m] ?? 0,
//     }
//   }).sort((a, b) => a.ordre - b.ordre), [mensuel, amortissementsParMois, achats, services, impots])

//   // ================= EXPORT PDF =================

//   async function exporterPDF() {
//     if (!budget || !exerciceSelectionne || loadingAnalyse || exportEnCours || exerciceCharge !== exerciceId) return
//     try {
//       setExportEnCours(true)
//       setError("")
//       await exporterAnalysePDF({
//         annee: exerciceSelectionne.annee_exercice, budget, mensuel,
//         amortissements: afficherAmortissements ? amortissements : [],
//         graphiqueTrajectoire: trajectoireRef.current, graphiqueDepenses: depensesRef.current,
//       })
//     } catch (e) {
//       setError(e instanceof Error ? e.message : "Impossible d'exporter les analyses.")
//     } finally { setExportEnCours(false) }
//   }

//   function changerExercice(value: string) {
//     if (!value || value === exerciceId || exportEnCours || loadingAnalyse) return
//     setLoadingAnalyse(true)
//     setError("")
//     setExerciceId(value)
//   }

//   // ================= LOADER INITIAL =================

//   if (loadingExercices) return (
//     <div className="flex min-h-[500px] flex-col items-center justify-center gap-4 text-muted-foreground">
//       <Loader2 className="h-8 w-8 animate-spin text-primary" />
//       <p className="text-sm">Chargement des analyses...</p>
//     </div>
//   )

//   // ================= CONFIGURATION KPI =================

//   const kpis = budget ? [
//     { titre: "CA export", valeur: `${formatCompact(budget.ca_export)} MGA`, description: "Chiffre d'affaires annuel", icon: CircleDollarSign, couleur: 0 },
//     { titre: "Charges d'exploitation", valeur: `${formatCompact(budget.charges_exploitation)} MGA`, description: "Charges annuelles", icon: WalletCards, couleur: 1 },
//     { titre: "Frais export", valeur: `${formatCompact(budget.frais_export)} MGA`, description: "Frais d'exportation", icon: Banknote, couleur: 2 },
//     ...(afficherAmortissements ? [{ titre: "Amortissements", valeur: `${formatCompact(totalAmortissements)} MGA`, description: "Dotations annuelles aux amortissements", icon: Layers3, couleur: 3 }] : []),
//     { titre: "Résultat opérationnel", valeur: `${formatCompact(budget.resultat_operationnel)} MGA`, description: "Résultat annuel", icon: TrendingUp, couleur: 4 },
//     { titre: "Marge opérationnelle", valeur: formatPourcentage(budget.marge_operationnelle), description: "Performance opérationnelle", icon: Activity, couleur: 5 },
//   ] : []

//   const colonnes = [
//     { key: "ca_export", label: "CA export" },
//     { key: "charges_exploitation", label: "Charges" },
//     { key: "frais_export", label: "Frais export" },
//     { key: "masse_salariale", label: "Masse salariale" },
//     ...(afficherAmortissements ? [{ key: "amortissements", label: "Amortissements" }] : []),
//     { key: "resultat_operationnel", label: "Résultat" },
//     { key: "marge_operationnelle", label: "Marge" },
//   ] as const

//   const barres = [
//     { key: "achats_consommes", label: "Achats consommés", color: "#c998a4" },
//     { key: "services_exterieurs", label: "Services extérieurs", color: "#9e91bd" },
//     { key: "impots_taxes", label: "Impôts et taxes", color: "#d6a65c" },
//     { key: "masse_salariale", label: "Masse salariale", color: "#83adb1" },
//     ...(afficherAmortissements ? [{ key: "amortissements", label: "Amortissements", color: "#a6a0cb" }] : []),
//   ]

//   // ================= INTERFACE =================

//   return (
//     <div className="relative min-h-screen space-y-6">
//       {/* EN-TETE */}
//       <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Analyses budgétaires</h1>
//           <p className="mt-1 text-muted-foreground">Analysez les trajectoires budgétaires et l&apos;évolution des principaux indicateurs financiers.</p>
//         </div>
//         <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
//           <div className="space-y-2">
//             <p className="text-sm font-medium">Exercice à analyser</p>
//             <p className="text-xs text-muted-foreground">Choisissez une année pour afficher ses trajectoires budgétaires.</p>
//             <Select value={exerciceId} onValueChange={changerExercice} disabled={exportEnCours || loadingAnalyse}>
//               <SelectTrigger className="w-full sm:w-[240px]">
//                 <span>{exerciceSelectionne?.annee_exercice ?? "Sélectionner une année"}</span>
//               </SelectTrigger>
//               <SelectContent>
//                 {exercices.map(e => <SelectItem key={e.id_exercice} value={String(e.id_exercice)}>{e.annee_exercice}</SelectItem>)}
//               </SelectContent>
//             </Select>
//           </div>
//           <Button variant="outline" disabled={!budget || loadingAnalyse || exportEnCours || exerciceCharge !== exerciceId || !graphiqueMensuel.length} onClick={exporterPDF}>
//             {exportEnCours ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
//             {exportEnCours ? "Exportation en cours..." : "Exporter PDF"}
//           </Button>
//         </div>
//       </div>

//       {/* ERREUR */}
//       {error && <Card className="border-rose-200 bg-rose-50/40 dark:border-rose-900/50 dark:bg-rose-950/10">
//         <CardContent className="pt-6"><p className="text-sm text-rose-700 dark:text-rose-300">{error}</p></CardContent>
//       </Card>}

//       {budget && <>
//         {/* KPI */}
//         <div className={`grid gap-4 md:grid-cols-2 ${afficherAmortissements ? "xl:grid-cols-3" : "xl:grid-cols-5"}`}>
//           {kpis.map(k => <KpiCard key={k.titre} titre={k.titre} valeur={k.valeur} description={k.description}
//             icon={k.icon} className={COULEURS[k.couleur][1]} iconClassName={COULEURS[k.couleur][2]} />)}
//         </div>

//         {/* TRAJECTOIRE BUDGETAIRE */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Trajectoire budgétaire</CardTitle>
//             <CardDescription>Évolution mensuelle du chiffre d&apos;affaires export et du résultat opérationnel — {exerciceAffiche?.annee_exercice}</CardDescription>
//           </CardHeader>
//           <CardContent>
//             {graphiqueMensuel.length ? (
//               <div ref={trajectoireRef} className="h-[400px] w-full bg-white p-2">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <LineChart data={graphiqueMensuel} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="moisLabel" tickFormatter={v => String(v).substring(0, 3)} />
//                     <YAxis tickFormatter={formatCompact} />
//                     <Tooltip formatter={v => [`${formatMGA(v)} MGA`]} />
//                     <Legend />
//                     <Line type="monotone" dataKey="ca_export" name="CA export" stroke="#7da6c7" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} isAnimationActive={false} />
//                     <Line type="monotone" dataKey="resultat_operationnel" name="Résultat opérationnel" stroke="#76a995" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} isAnimationActive={false} />
//                   </LineChart>
//                 </ResponsiveContainer>
//               </div>
//             ) : <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">Aucune donnée mensuelle disponible.</div>}
//           </CardContent>
//         </Card>

//         {/* EVOLUTION DES DEPENSES */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Évolution des dépenses</CardTitle>
//             <CardDescription>Achats consommés, services extérieurs, impôts et taxes, masse salariale{afficherAmortissements ? " et amortissements" : ""} — {exerciceAffiche?.annee_exercice}</CardDescription>
//           </CardHeader>
//           <CardContent>
//             {graphiqueMensuel.length ? (
//               <div ref={depensesRef} className="h-[420px] w-full bg-white p-2">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart data={graphiqueMensuel} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="moisLabel" tickFormatter={v => String(v).substring(0, 3)} />
//                     <YAxis tickFormatter={formatCompact} />
//                     <Tooltip formatter={v => [`${formatMGA(v)} MGA`]} />
//                     <Legend />
//                     {barres.map(b => <Bar key={b.key} dataKey={b.key} name={b.label} fill={b.color} radius={[4, 4, 0, 0]} isAnimationActive={false} />)}
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>
//             ) : <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">Aucune donnée mensuelle disponible.</div>}
//           </CardContent>
//         </Card>

//         {/* DETAIL MENSUEL */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Détail mensuel</CardTitle>
//             <CardDescription>Données budgétaires détaillées de l&apos;exercice {exerciceAffiche?.annee_exercice}</CardDescription>
//           </CardHeader>
//           <CardContent>
//             {graphiqueMensuel.length ? (
//               <div className="overflow-x-auto rounded-md border">
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>Mois</TableHead>
//                       {colonnes.map(c => <TableHead key={c.key} className="text-right">{c.label}</TableHead>)}
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {graphiqueMensuel.map((item, index) => (
//                       <TableRow key={item.id ?? `${item.moisLabel}-${index}`}>
//                         <TableCell className="font-medium">{item.moisLabel}</TableCell>
//                         {colonnes.map(c => <TableCell key={c.key} className={`text-right ${c.key === "resultat_operationnel" ? "font-medium text-emerald-700 dark:text-emerald-400" : ""}`}>
//                           {c.key === "marge_operationnelle" ? formatPourcentage(item[c.key]) : formatMGA(item[c.key])}
//                         </TableCell>)}
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </div>
//             ) : <div className="flex h-[150px] items-center justify-center text-sm text-muted-foreground">Aucune donnée mensuelle disponible.</div>}
//           </CardContent>
//         </Card>
//       </>}

//       {/* LOADER GLOBAL */}
//       {loadingAnalyse && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/30 backdrop-blur-[1px]" role="status" aria-live="polite">
//           <div className="flex flex-col items-center gap-5 rounded-2xl border border-border/20 bg-background/20 px-10 py-8 shadow-sm backdrop-blur-[2px]">
//             <div className="flex size-16 items-center justify-center rounded-full bg-primary/10"><Loader2 className="size-9 animate-spin text-primary" /></div>
//             <div className="space-y-2 text-center">
//               <h3 className="text-base font-semibold">Chargement des analyses budgétaires</h3>
//               <p className="text-sm text-muted-foreground">Actualisation des données{exerciceSelectionne ? ` de l'exercice ${exerciceSelectionne.annee_exercice}` : ""}...</p>
//             </div>
//             <div className="flex items-center gap-2">
//               {[0, 200, 400].map(d => <span key={d} className="size-2 animate-pulse rounded-full bg-primary" style={{ animationDelay: `${d}ms` }} />)}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }








"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import type { ElementType } from "react"
import { Activity, Banknote, CircleDollarSign, FileText, Layers3, Loader2, TrendingUp, WalletCards } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { getBudgetDetails, getBudgetMensuel, getExercices } from "@/services/budget-details-service"
import { exporterAnalysePDF } from "@/services/analyse-export-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Valeur = number | string | null | undefined
type Exercice = { id_exercice: number; annee_exercice: number }
type Budget = {
  id?: number; budget_id?: number; id_budget?: number
  ca_export?: Valeur; charges_exploitation?: Valeur; frais_export?: Valeur
  masse_salariale?: Valeur; resultat_operationnel?: Valeur; marge_operationnelle?: Valeur
}
type BudgetMensuel = Budget & { mois?: number | string; nom_mois?: string; mois_nom?: string; mois_id?: number }
type LigneMensuelle = {
  mois?: number | string; mois_id?: number; numero_mois?: number
  nom_mois?: string; mois_nom?: string; montant?: Valeur
}
type Amortissement = LigneMensuelle
type LigneCharge = LigneMensuelle & { categorie?: string }
type LigneFraisExport = LigneMensuelle & {
  total?: Valeur; transport_local?: Valeur; transit?: Valeur
  manutention?: Valeur; fret?: Valeur; assurance?: Valeur; frais_bancaires?: Valeur
}
type LigneGraphique = {
  id?: number; moisLabel: string; ordre: number
  ca_export: number; charges_exploitation: number; charges_totales: number; frais_export: number
  masse_salariale: number; resultat_operationnel: number; marge_operationnelle: number
  amortissements: number; achats_consommes: number; services_exterieurs: number; impots_taxes: number
}

const MOIS = ["", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]
const fmt = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 })
const CATEGORIES = {
  achats: ["ACHAT PRODUITS", "PRODUCTION"],
  services: ["ADMINISTRATION", "FINANCE", "LOGISTIQUE", "SECURITE"],
  impots: ["FISCAL"],
}
const nombre = (v: unknown) => v == null || v === "" || !Number.isFinite(Number(v)) ? 0 : Number(v)
const formatMGA = (v: unknown) => fmt.format(nombre(v))
const formatCompact = (v: unknown) => {
  const n = nombre(v), a = Math.abs(n)
  return a >= 1e9 ? `${(n / 1e9).toFixed(2)} Md` : a >= 1e6 ? `${(n / 1e6).toFixed(2)} M` : a >= 1e3 ? `${(n / 1e3).toFixed(2)} k` : n.toFixed(0)
}
const formatPourcentage = (v: unknown) => {
  const n = nombre(v)
  return `${(Math.abs(n) <= 1 ? n * 100 : n).toFixed(2)} %`
}
const normaliserTexte = (v: unknown) => String(v ?? "").trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[_’'.-]/g, " ").replace(/\s+/g, " ").trim()
const numeroMois = (v: unknown) => {
  const n = Number(v)
  if (Number.isInteger(n) && n >= 1 && n <= 12) return n
  const index = MOIS.findIndex(m => normaliserTexte(m) === normaliserTexte(v))
  return index > 0 ? index : 0
}
const moisLigne = (l: LigneMensuelle) => numeroMois(l.mois_id ?? l.mois ?? l.numero_mois ?? l.nom_mois ?? l.mois_nom)
const addition = (a: number[], b: number[]) => Array.from({ length: 13 }, (_, i) => (a[i] ?? 0) + (b[i] ?? 0))

function calculerCharges(data: LigneCharge[], categories: string[]) {
  const result = Array<number>(13).fill(0), filtres = new Set(categories.map(normaliserTexte))
  data.forEach(l => {
    const m = moisLigne(l)
    if (m && filtres.has(normaliserTexte(l.categorie))) result[m] += nombre(l.montant)
  })
  return result
}

function calculerFraisExport(data: LigneFraisExport[]) {
  const result = Array<number>(13).fill(0)
  data.forEach(l => {
    const m = moisLigne(l)
    if (!m) return
    const montant = l.total ?? l.montant ?? (
      nombre(l.transport_local) + nombre(l.transit) + nombre(l.manutention) +
      nombre(l.fret) + nombre(l.assurance) + nombre(l.frais_bancaires)
    )
    result[m] += nombre(montant)
  })
  return result
}

function KpiCard({ titre, valeur, description, icon: Icon, className, iconClassName }: {
  titre: string; valeur: string; description: string; icon: ElementType
  className: string; iconClassName: string
}) {
  return (
    <Card className={`relative overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{titre}</CardTitle>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClassName}`}><Icon className="h-5 w-5" /></div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{valeur}</div>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

const COULEURS = [
  ["sky", "border-sky-100 bg-sky-50/40 dark:border-sky-900/40 dark:bg-sky-950/10", "bg-sky-100/70 text-sky-600"],
  ["rose", "border-rose-100 bg-rose-50/40 dark:border-rose-900/40 dark:bg-rose-950/10", "bg-rose-100/70 text-rose-600"],
  ["violet", "border-violet-100 bg-violet-50/40 dark:border-violet-900/40 dark:bg-violet-950/10", "bg-violet-100/70 text-violet-600"],
  ["amber", "border-amber-100 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/10", "bg-amber-100/70 text-amber-600"],
  ["emerald", "border-emerald-100 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/10", "bg-emerald-100/70 text-emerald-600"],
  ["cyan", "border-cyan-100 bg-cyan-50/40 dark:border-cyan-900/40 dark:bg-cyan-950/10", "bg-cyan-100/70 text-cyan-600"],
]

export default function AnalyseBudgetaire() {
  const [exercices, setExercices] = useState<Exercice[]>([])
  const [exerciceId, setExerciceId] = useState("")
  const [exerciceCharge, setExerciceCharge] = useState("")
  const [budget, setBudget] = useState<Budget | null>(null)
  const [mensuel, setMensuel] = useState<BudgetMensuel[]>([])
  const [amortissements, setAmortissements] = useState<Amortissement[]>([])
  const [donneesCharges, setDonneesCharges] = useState<LigneCharge[]>([])
  const [donneesFraisExport, setDonneesFraisExport] = useState<LigneFraisExport[]>([])
  const [loadingExercices, setLoadingExercices] = useState(true)
  const [loadingAnalyse, setLoadingAnalyse] = useState(false)
  const [exportEnCours, setExportEnCours] = useState(false)
  const [error, setError] = useState("")
  const trajectoireRef = useRef<HTMLDivElement>(null)
  const depensesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let actif = true
    async function charger() {
      try {
        const data = await getExercices()
        if (!actif) return
        const liste = Array.isArray(data) ? data : []
        setExercices(liste)
        if (liste.length) setExerciceId(String(liste[0].id_exercice))
      } catch (e) {
        if (actif) setError(e instanceof Error ? e.message : "Impossible de charger les exercices.")
      } finally {
        if (actif) setLoadingExercices(false)
      }
    }
    void charger()
    return () => { actif = false }
  }, [])

  const exerciceSelectionne = useMemo(() => exercices.find(e => String(e.id_exercice) === exerciceId), [exercices, exerciceId])
  const exerciceAffiche = useMemo(() => exercices.find(e => String(e.id_exercice) === exerciceCharge), [exercices, exerciceCharge])

  useEffect(() => {
    if (!exerciceId) return
    let actif = true
    async function charger() {
      setLoadingAnalyse(true)
      setError("")
      try {
        const id = Number(exerciceId)
        const budgets = await getBudgetDetails("budget", id)
        if (!actif) return
        if (!Array.isArray(budgets) || !budgets.length) throw new Error("Aucun budget disponible pour cet exercice.")
        const b: Budget = budgets[0], budgetId = b.id ?? b.id_budget ?? b.budget_id
        if (budgetId == null) throw new Error("L'identifiant du budget est introuvable.")
        const [m, a, c, f] = await Promise.all([
          getBudgetMensuel(budgetId),
          getBudgetDetails("amortissements", id),
          getBudgetDetails("charges", id),
          getBudgetDetails("frais-export", id),
        ])
        if (!actif) return
        setBudget(b)
        setMensuel(Array.isArray(m) ? m : [])
        setAmortissements(Array.isArray(a) ? a : [])
        setDonneesCharges(Array.isArray(c) ? c : [])
        setDonneesFraisExport(Array.isArray(f) ? f : [])
        setExerciceCharge(exerciceId)
      } catch (e) {
        if (actif) setError(e instanceof Error ? e.message : "Impossible de charger l'analyse.")
      } finally {
        if (actif) setLoadingAnalyse(false)
      }
    }
    void charger()
    return () => { actif = false }
  }, [exerciceId])

  const amortissementsParMois = useMemo(() => {
    const result = Array<number>(13).fill(0)
    amortissements.forEach(l => { const m = moisLigne(l); if (m) result[m] += nombre(l.montant) })
    return result
  }, [amortissements])

  const totalAmortissements = amortissementsParMois.slice(1).reduce((a, b) => a + b, 0)
  const afficherAmortissements = amortissements.length > 0
  const achats = useMemo(() => calculerCharges(donneesCharges, CATEGORIES.achats), [donneesCharges])
  const servicesCharges = useMemo(() => calculerCharges(donneesCharges, CATEGORIES.services), [donneesCharges])
  const autresCharges = useMemo(() => {
    const connues = new Set(Object.values(CATEGORIES).flat().map(normaliserTexte))
    const frais = new Set(["FRAIS EXPORT", "FRAIS EXPORTATION", "FRAIS D EXPORTATION"])
    const result = Array<number>(13).fill(0)
    donneesCharges.forEach(l => {
      const m = moisLigne(l), categorie = normaliserTexte(l.categorie)
      if (m && categorie && !connues.has(categorie) && !frais.has(categorie)) result[m] += nombre(l.montant)
    })
    return result
  }, [donneesCharges])
  const services = useMemo(() => addition(addition(servicesCharges, autresCharges), calculerFraisExport(donneesFraisExport)), [servicesCharges, autresCharges, donneesFraisExport])
  const impots = useMemo(() => calculerCharges(donneesCharges, CATEGORIES.impots), [donneesCharges])

  const graphiqueMensuel = useMemo<LigneGraphique[]>(() => mensuel.map(item => {
    const m = moisLigne(item), achatsConsommes = achats[m] ?? 0, servicesExterieurs = services[m] ?? 0
    const impotsTaxes = impots[m] ?? 0, masseSalariale = nombre(item.masse_salariale), amortissement = amortissementsParMois[m] ?? 0
    return {
      id: item.id, moisLabel: MOIS[m] || item.nom_mois || item.mois_nom || "Mois inconnu", ordre: m,
      ca_export: nombre(item.ca_export), charges_exploitation: nombre(item.charges_exploitation),
      charges_totales: achatsConsommes + servicesExterieurs + impotsTaxes + masseSalariale + amortissement,
      frais_export: nombre(item.frais_export), masse_salariale: masseSalariale,
      resultat_operationnel: nombre(item.resultat_operationnel), marge_operationnelle: nombre(item.marge_operationnelle),
      amortissements: amortissement, achats_consommes: achatsConsommes, services_exterieurs: servicesExterieurs, impots_taxes: impotsTaxes,
    }
  }).sort((a, b) => a.ordre - b.ordre), [mensuel, amortissementsParMois, achats, services, impots])

  async function exporterPDF() {
    if (!budget || !exerciceSelectionne || loadingAnalyse || exportEnCours || exerciceCharge !== exerciceId) return
    try {
      setExportEnCours(true)
      setError("")
      await exporterAnalysePDF({
        annee: exerciceSelectionne.annee_exercice, budget, mensuel,
        amortissements: afficherAmortissements ? amortissements : [],
        graphiqueTrajectoire: trajectoireRef.current, graphiqueDepenses: depensesRef.current,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible d'exporter les analyses.")
    } finally { setExportEnCours(false) }
  }

  function changerExercice(value: string) {
    if (!value || value === exerciceId || exportEnCours || loadingAnalyse) return
    setLoadingAnalyse(true)
    setError("")
    setExerciceId(value)
  }

  if (loadingExercices) return (
    <div className="flex min-h-[500px] flex-col items-center justify-center gap-4 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm">Chargement des analyses...</p>
    </div>
  )

  const kpis = budget ? [
    { titre: "CA export", valeur: `${formatCompact(budget.ca_export)} MGA`, description: "Chiffre d'affaires annuel", icon: CircleDollarSign, couleur: 0 },
    { titre: "Charges d'exploitation", valeur: `${formatCompact(budget.charges_exploitation)} MGA`, description: "Charges annuelles", icon: WalletCards, couleur: 1 },
    { titre: "Frais export", valeur: `${formatCompact(budget.frais_export)} MGA`, description: "Frais d'exportation", icon: Banknote, couleur: 2 },
    ...(afficherAmortissements ? [{ titre: "Amortissements", valeur: `${formatCompact(totalAmortissements)} MGA`, description: "Dotations annuelles aux amortissements", icon: Layers3, couleur: 3 }] : []),
    { titre: "Résultat opérationnel", valeur: `${formatCompact(budget.resultat_operationnel)} MGA`, description: "Résultat annuel", icon: TrendingUp, couleur: 4 },
    { titre: "Marge opérationnelle", valeur: formatPourcentage(budget.marge_operationnelle), description: "Performance opérationnelle", icon: Activity, couleur: 5 },
  ] : []

  const colonnes = [
    { key: "ca_export", label: "CA export" },
    { key: "charges_exploitation", label: "Charges" },
    { key: "frais_export", label: "Frais export" },
    { key: "masse_salariale", label: "Masse salariale" },
    ...(afficherAmortissements ? [{ key: "amortissements", label: "Amortissements" }] : []),
    { key: "resultat_operationnel", label: "Résultat" },
    { key: "marge_operationnelle", label: "Marge" },
  ] as const

  const barres = [
    { key: "achats_consommes", label: "Achats consommés", color: "#c998a4" },
    { key: "services_exterieurs", label: "Services extérieurs", color: "#9e91bd" },
    { key: "impots_taxes", label: "Impôts et taxes", color: "#d6a65c" },
    { key: "masse_salariale", label: "Masse salariale", color: "#83adb1" },
    ...(afficherAmortissements ? [{ key: "amortissements", label: "Amortissements", color: "#a6a0cb" }] : []),
  ]

  return (
    <div className="relative min-h-screen space-y-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analyses budgétaires</h1>
          <p className="mt-1 text-muted-foreground">Analysez les trajectoires budgétaires et l&apos;évolution des principaux indicateurs financiers.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="space-y-2">
            <p className="text-sm font-medium">Exercice à analyser</p>
            <p className="text-xs text-muted-foreground">Choisissez une année pour afficher ses trajectoires budgétaires.</p>
            <Select value={exerciceId} onValueChange={changerExercice} disabled={exportEnCours || loadingAnalyse}>
              <SelectTrigger className="w-full sm:w-[240px]">
                <span>{exerciceSelectionne?.annee_exercice ?? "Sélectionner une année"}</span>
              </SelectTrigger>
              <SelectContent>
                {exercices.map(e => <SelectItem key={e.id_exercice} value={String(e.id_exercice)}>{e.annee_exercice}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" disabled={!budget || loadingAnalyse || exportEnCours || exerciceCharge !== exerciceId || !graphiqueMensuel.length} onClick={exporterPDF}>
            {exportEnCours ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
            {exportEnCours ? "Exportation en cours..." : "Exporter PDF"}
          </Button>
        </div>
      </div>

      {error && <Card className="border-rose-200 bg-rose-50/40 dark:border-rose-900/50 dark:bg-rose-950/10">
        <CardContent className="pt-6"><p className="text-sm text-rose-700 dark:text-rose-300">{error}</p></CardContent>
      </Card>}

      {budget && <>
        <div className={`grid gap-4 md:grid-cols-2 ${afficherAmortissements ? "xl:grid-cols-3" : "xl:grid-cols-5"}`}>
          {kpis.map(k => <KpiCard key={k.titre} titre={k.titre} valeur={k.valeur} description={k.description}
            icon={k.icon} className={COULEURS[k.couleur][1]} iconClassName={COULEURS[k.couleur][2]} />)}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Trajectoire budgétaire</CardTitle>
            <CardDescription>Évolution mensuelle du chiffre d&apos;affaires export, des charges totales et du résultat opérationnel — {exerciceAffiche?.annee_exercice}</CardDescription>
          </CardHeader>
          <CardContent>
            {graphiqueMensuel.length ? (
              <div ref={trajectoireRef} className="h-[400px] w-full bg-white p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={graphiqueMensuel} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="moisLabel" tickFormatter={v => String(v).substring(0, 3)} />
                    <YAxis tickFormatter={formatCompact} />
                    <Tooltip formatter={v => [`${formatMGA(v)} MGA`]} />
                    <Legend />
                    <Line type="monotone" dataKey="ca_export" name="CA export" stroke="#7da6c7" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} isAnimationActive={false} />
                    <Line type="monotone" dataKey="charges_totales" name="Charges totales" stroke="#d6a65c" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} isAnimationActive={false} />
                    <Line type="monotone" dataKey="resultat_operationnel" name="Résultat opérationnel" stroke="#76a995" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">Aucune donnée mensuelle disponible.</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Évolution des dépenses</CardTitle>
            <CardDescription>Achats consommés, services extérieurs, impôts et taxes, masse salariale{afficherAmortissements ? " et amortissements" : ""} — {exerciceAffiche?.annee_exercice}</CardDescription>
          </CardHeader>
          <CardContent>
            {graphiqueMensuel.length ? (
              <div ref={depensesRef} className="h-[420px] w-full bg-white p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={graphiqueMensuel} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="moisLabel" tickFormatter={v => String(v).substring(0, 3)} />
                    <YAxis tickFormatter={formatCompact} />
                    <Tooltip formatter={v => [`${formatMGA(v)} MGA`]} />
                    <Legend />
                    {barres.map(b => <Bar key={b.key} dataKey={b.key} name={b.label} fill={b.color} radius={[4, 4, 0, 0]} isAnimationActive={false} />)}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">Aucune donnée mensuelle disponible.</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Détail mensuel</CardTitle>
            <CardDescription>Données budgétaires détaillées de l&apos;exercice {exerciceAffiche?.annee_exercice}</CardDescription>
          </CardHeader>
          <CardContent>
            {graphiqueMensuel.length ? (
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mois</TableHead>
                      {colonnes.map(c => <TableHead key={c.key} className="text-right">{c.label}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {graphiqueMensuel.map((item, index) => (
                      <TableRow key={item.id ?? `${item.moisLabel}-${index}`}>
                        <TableCell className="font-medium">{item.moisLabel}</TableCell>
                        {colonnes.map(c => <TableCell key={c.key} className={`text-right ${c.key === "resultat_operationnel" ? "font-medium text-emerald-700 dark:text-emerald-400" : ""}`}>
                          {c.key === "marge_operationnelle" ? formatPourcentage(item[c.key]) : formatMGA(item[c.key])}
                        </TableCell>)}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : <div className="flex h-[150px] items-center justify-center text-sm text-muted-foreground">Aucune donnée mensuelle disponible.</div>}
          </CardContent>
        </Card>
      </>}

      {loadingAnalyse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/30 backdrop-blur-[1px]" role="status" aria-live="polite">
          <div className="flex flex-col items-center gap-5 rounded-2xl border border-border/20 bg-background/20 px-10 py-8 shadow-sm backdrop-blur-[2px]">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10"><Loader2 className="size-9 animate-spin text-primary" /></div>
            <div className="space-y-2 text-center">
              <h3 className="text-base font-semibold">Chargement des analyses budgétaires</h3>
              <p className="text-sm text-muted-foreground">Actualisation des données{exerciceSelectionne ? ` de l'exercice ${exerciceSelectionne.annee_exercice}` : ""}...</p>
            </div>
            <div className="flex items-center gap-2">
              {[0, 200, 400].map(d => <span key={d} className="size-2 animate-pulse rounded-full bg-primary" style={{ animationDelay: `${d}ms` }} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
