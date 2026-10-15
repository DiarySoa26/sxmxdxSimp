
"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  History, RefreshCw, Search, CheckCircle2, XCircle,
  Users, Activity, ChevronLeft, ChevronRight,
  CalendarClock, ShieldCheck, ShieldAlert
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  getJournalConnexions,
  getJournalActions
} from "@/services/tracabilite-service"

type Onglet = "actions" | "connexions"
type FiltreStatut = "TOUS" | "SUCCES" | "ECHEC"

// type JournalAction = {
//   id: number
//   utilisateurId: number | null
//   action: string
//   module: string
//   description: string | null
//   entiteType: string | null
//   entiteId: string | null
//   statut: "SUCCES" | "ECHEC"
//   dateAction: string
// }


type JournalAction = {
  id: number
  utilisateurId: number | null
  nom: string | null
  prenom: string | null
  email: string | null
  role: string | null
  action: string
  module: string
  description: string | null
  entiteType: string | null
  entiteId: string | null
  statut: "SUCCES" | "ECHEC"
  dateAction: string
}

type JournalConnexion = {
  journalId: number
  utilisateurId: number
  nom: string
  prenom: string | null
  email: string
  role: string | null
  dateConnexion: string
  succes: boolean
}

const PAGE_SIZE = 10

const selectClass =
  "h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"

const dateFR = (valeur?: string | null) => {
  if (!valeur) return "-"
  const date = new Date(valeur)
  if (Number.isNaN(date.getTime())) return valeur

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC"
  }).format(date)
}

function Statut({ succes }: { succes: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
      succes
        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
        : "bg-rose-500/10 text-rose-700 dark:text-rose-400"
    }`}>
      {succes
        ? <CheckCircle2 className="size-3.5" />
        : <XCircle className="size-3.5" />}
      {succes ? "Succès" : "Échec"}
    </span>
  )
}

export default function TracabilitePage() {
  const [onglet, setOnglet] = useState<Onglet>("actions")
  const [connexions, setConnexions] = useState<JournalConnexion[]>([])
  const [actions, setActions] = useState<JournalAction[]>([])
  const [recherche, setRecherche] = useState("")
  const [statut, setStatut] = useState<FiltreStatut>("TOUS")
  const [module, setModule] = useState("TOUS")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState("")
  const requeteId = useRef(0)

  const charger = useCallback(async () => {
    const id = ++requeteId.current
    setLoading(true)
    setErreur("")

    const resultats = await Promise.allSettled([
      getJournalActions(),
      getJournalConnexions()
    ])

    if (id !== requeteId.current) return

    const [resActions, resConnexions] = resultats
    const erreurs: string[] = []

    if (resActions.status === "fulfilled") {
      setActions(
        Array.isArray(resActions.value) ? resActions.value : []
      )
    } else {
      setActions([])
      erreurs.push("Impossible de charger les actions.")
    }

    if (resConnexions.status === "fulfilled") {
      setConnexions(
        Array.isArray(resConnexions.value) ? resConnexions.value : []
      )
    } else {
      setConnexions([])
      erreurs.push("Impossible de charger les connexions.")
    }

    setErreur(erreurs.join(" "))
    setLoading(false)
  }, [])

  useEffect(() => {
    void charger()
    return () => { requeteId.current++ }
  }, [charger])

  const changerOnglet = (valeur: Onglet) => {
    setOnglet(valeur)
    setRecherche("")
    setStatut("TOUS")
    setModule("TOUS")
    setPage(1)
  }

  const modules = useMemo(
    () => [...new Set(actions.map(a => a.module).filter(Boolean))].sort(),
    [actions]
  )

  const filtres = useMemo(() => {
    const terme = recherche.trim().toLowerCase()

    if (onglet === "actions") {
      return actions.filter(a => {
        const texte = [
          a.action, a.module, a.description,
          a.entiteType, a.entiteId, a.utilisateurId
        ].filter(v => v != null).join(" ").toLowerCase()

        return texte.includes(terme) &&
          (statut === "TOUS" || a.statut === statut) &&
          (module === "TOUS" || a.module === module)
      })
    }

    return connexions.filter(c => {
      const texte = [
        c.nom, c.prenom, c.email, c.role, c.utilisateurId
      ].filter(v => v != null).join(" ").toLowerCase()

      return texte.includes(terme) &&
        (statut === "TOUS" ||
          (statut === "SUCCES" ? c.succes : !c.succes))
    })
  }, [onglet, actions, connexions, recherche, statut, module])

  const donnees = onglet === "actions" ? actions : connexions

  const reussites = onglet === "actions"
    ? actions.filter(a => a.statut === "SUCCES").length
    : connexions.filter(c => c.succes).length

  const echecs = donnees.length - reussites
  const totalPages = Math.max(1, Math.ceil(filtres.length / PAGE_SIZE))
  const pageCourante = Math.min(page, totalPages)
  const debut = (pageCourante - 1) * PAGE_SIZE

  const actionsPage = onglet === "actions"
    ? (filtres as JournalAction[]).slice(debut, debut + PAGE_SIZE)
    : []

  const connexionsPage = onglet === "connexions"
    ? (filtres as JournalConnexion[]).slice(debut, debut + PAGE_SIZE)
    : []

  const statistiques = [
    {
      titre: "Total des événements",
      valeur: donnees.length,
      icon: CalendarClock,
      couleur: "text-sky-600",
      fond: "bg-sky-500/10"
    },
    {
      titre: "Opérations réussies",
      valeur: reussites,
      icon: ShieldCheck,
      couleur: "text-emerald-600",
      fond: "bg-emerald-500/10"
    },
    {
      titre: "Opérations échouées",
      valeur: echecs,
      icon: ShieldAlert,
      couleur: "text-rose-600",
      fond: "bg-rose-500/10"
    }
  ]

  return (
    <div className="space-y-6 p-4 md:p-6">

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <History className="size-6" />
            Traçabilité
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Historique des connexions et des actions effectuées dans SXMXDX.
          </p>
        </div>

        <Button
          variant="outline"
          disabled={loading}
          onClick={() => void charger()}
        >
          <RefreshCw className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      <div className="flex w-fit flex-wrap gap-1 rounded-lg bg-muted p-1">
        {([
          { id: "actions" as const, label: "Journal des actions", icon: Activity },
          { id: "connexions" as const, label: "Journal des connexions", icon: Users }
        ]).map(item => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => changerOnglet(item.id)}
              className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm transition-colors ${
                onglet === item.id
                  ? "bg-background font-medium shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {item.label}
            </button>
          )
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {statistiques.map(item => {
          const Icon = item.icon
          return (
            <div
              key={item.titre}
              className="rounded-xl border bg-card p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {item.titre}
                </p>
                <div className={`flex size-10 items-center justify-center rounded-lg ${item.fond}`}>
                  <Icon className={`size-5 ${item.couleur}`} />
                </div>
              </div>
              <p className="mt-3 text-3xl font-semibold tabular-nums">
                {item.valeur}
              </p>
            </div>
          )
        })}
      </div>

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-52 flex-1">
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <input
              className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder={onglet === "actions"
                ? "Rechercher une action..."
                : "Rechercher un utilisateur..."}
              value={recherche}
              onChange={e => {
                setRecherche(e.target.value)
                setPage(1)
              }}
            />
          </div>

          <select
            className={selectClass}
            value={statut}
            onChange={e => {
              setStatut(e.target.value as FiltreStatut)
              setPage(1)
            }}
          >
            <option value="TOUS">Tous les statuts</option>
            <option value="SUCCES">Succès</option>
            <option value="ECHEC">Échec</option>
          </select>

          {onglet === "actions" && (
            <select
              className={selectClass}
              value={module}
              onChange={e => {
                setModule(e.target.value)
                setPage(1)
              }}
            >
              <option value="TOUS">Tous les modules</option>
              {modules.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {erreur && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {erreur}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b p-4">
          <div>
            <h2 className="font-semibold">
              {onglet === "actions"
                ? "Historique des actions"
                : "Historique des connexions"}
            </h2>
            <p className="text-xs text-muted-foreground">
              Consultation des événements enregistrés dans la base de données.
            </p>
          </div>
          <span className="text-sm text-muted-foreground">
            {filtres.length} résultat(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          {onglet === "actions" ? (
            <table key="actions" className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Auteur</th>
                  <th className="p-4 font-medium">Module</th>
                  <th className="p-4 font-medium">Action</th>
                  <th className="p-4 font-medium">Description</th>
                  <th className="p-4 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {loading || actionsPage.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-muted-foreground">
                      {loading ? "Chargement des actions..." : "Aucune action trouvée."}
                    </td>
                  </tr>
                ) : actionsPage.map(a => (
                  <tr key={`action-${a.id}`} className="border-t hover:bg-muted/30">
                    <td className="whitespace-nowrap p-4">{dateFR(a.dateAction)}</td>
                    {/* <td className="p-4">
                      {a.utilisateurId
                        ? `Utilisateur #${a.utilisateurId}`
                        : "Non identifié"}
                    </td> */}

                    <td className="p-4">
                    {a.nom
                        ? [a.prenom, a.nom].filter(Boolean).join(" ")
                        : "Non identifié"}
                    </td>
                    <td className="p-4">
                      <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
                        {a.module}
                      </span>
                    </td>
                    <td className="p-4 font-medium">
                      {a.action?.replaceAll("_", " ")}
                    </td>
                    <td className="max-w-xs p-4 text-muted-foreground">
                      {a.description || "-"}
                    </td>
                    <td className="p-4">
                      <Statut succes={a.statut === "SUCCES"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table key="connexions" className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Utilisateur</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Rôle</th>
                  <th className="p-4 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {loading || connexionsPage.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-muted-foreground">
                      {loading ? "Chargement des connexions..." : "Aucune connexion trouvée."}
                    </td>
                  </tr>
                ) : connexionsPage.map(c => (
                  <tr key={`connexion-${c.journalId}`} className="border-t hover:bg-muted/30">
                    <td className="whitespace-nowrap p-4">
                      {dateFR(c.dateConnexion)}
                    </td>
                    <td className="p-4 font-medium">
                      {[c.prenom, c.nom].filter(Boolean).join(" ")}
                    </td>
                    <td className="p-4">{c.email}</td>
                    <td className="p-4">
                      <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
                        {c.role || "-"}
                      </span>
                    </td>
                    <td className="p-4">
                      <Statut succes={c.succes} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t p-4">
          <span className="text-sm text-muted-foreground">
            Page {pageCourante} sur {totalPages}
            {filtres.length > 0 &&
              ` · ${debut + 1}–${Math.min(debut + PAGE_SIZE, filtres.length)} sur ${filtres.length}`}
          </span>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pageCourante <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft className="mr-1 size-4" />
              Précédent
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={pageCourante >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              Suivant
              <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
