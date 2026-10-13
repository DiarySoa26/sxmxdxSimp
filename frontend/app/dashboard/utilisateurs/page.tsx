
"use client"

import { useState, useEffect, useCallback } from "react"
import type { FormEvent } from "react"
import {
  Users, UserPlus, Pencil, Loader2,
  X, CheckCircle2, Power, PowerOff
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  creerUtilisateur,
  getUtilisateurs,
  modifierUtilisateur,
  changerStatutUtilisateur
} from "@/services/utilisateur-service"

type Utilisateur = {
  id: number
  nom: string
  prenom: string
  email: string
  role: string
  actif: boolean
}

type Formulaire = {
  nom: string
  prenom: string
  email: string
  motDePasse: string
  role: string
}

const initial: Formulaire = {
  nom: "",
  prenom: "",
  email: "",
  motDePasse: "",
  role: "COMPTABLE"
}

const roles = [
  { value: "ADMIN", label: "Administrateur" },
  { value: "DAF", label: "Directeur administratif et financier" },
  { value: "COMPTABLE", label: "Comptable" },
  { value: "LECTEUR", label: "Lecteur" }
]

const inputClass =
  "h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"

export default function UtilisateursPage() {
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([])
  const [form, setForm] = useState<Formulaire>(initial)
  const [mode, setMode] = useState<"ajout" | "modification" | null>(null)
  const [selection, setSelection] = useState<Utilisateur | null>(null)
  const [confirmation, setConfirmation] = useState<Utilisateur | null>(null)
  const [loading, setLoading] = useState(false)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState("")
  const [message, setMessage] = useState("")

  const charger = useCallback(async () => {
    setChargement(true)
    try {
      const data = await getUtilisateurs()
      setUtilisateurs(data)
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Chargement impossible.")
    } finally {
      setChargement(false)
    }
  }, [])

  useEffect(() => {
    charger()
  }, [charger])

  const ouvrirAjout = () => {
    setForm({ ...initial })
    setSelection(null)
    setErreur("")
    setMessage("")
    setMode("ajout")
  }

  const ouvrirModification = (u: Utilisateur) => {
    setForm({
      nom: u.nom,
      prenom: u.prenom || "",
      email: u.email,
      motDePasse: "",
      role: u.role
    })
    setSelection(u)
    setErreur("")
    setMessage("")
    setMode("modification")
  }

  const fermer = () => {
    setMode(null)
    setSelection(null)
    setForm({ ...initial })
    setErreur("")
  }

  const changer = (champ: keyof Formulaire, valeur: string) => {
    setForm(prev => ({ ...prev, [champ]: valeur }))
  }

  const enregistrer = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (loading) return

    setLoading(true)
    setErreur("")
    setMessage("")

    try {
      if (mode === "modification" && selection) {
        await modifierUtilisateur(selection.id, form)
        setMessage("Utilisateur modifié avec succès.")
      } else {
        await creerUtilisateur(form)
        setMessage("Utilisateur créé avec succès.")
      }

      fermer()
      await charger()
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Enregistrement impossible.")
    } finally {
      setLoading(false)
    }
  }

  const appliquerStatut = async () => {
    if (!confirmation || loading) return

    setLoading(true)
    setErreur("")
    setMessage("")

    try {
      const actif = !confirmation.actif
      await changerStatutUtilisateur(confirmation.id, actif)
      setConfirmation(null)
      setMessage(`Compte ${actif ? "activé" : "désactivé"} avec succès.`)
      await charger()
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Changement de statut impossible.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Gestion des utilisateurs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gérez les comptes, les rôles et les statuts des utilisateurs.
          </p>
        </div>

        {!mode && (
          <Button onClick={ouvrirAjout}>
            <UserPlus className="mr-2 size-4" />
            Ajouter un utilisateur
          </Button>
        )}
      </div>

      {message && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle2 className="size-5" />
          {message}
        </div>
      )}

      {erreur && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {erreur}
        </div>
      )}

      {mode && (
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                {mode === "ajout" ? "Nouvel utilisateur" : "Modifier l'utilisateur"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {mode === "ajout"
                  ? "Renseignez les informations du nouveau compte."
                  : "Modifiez les informations et le rôle attribué."}
              </p>
            </div>

            <Button type="button" variant="ghost" size="icon" onClick={fermer}>
              <X className="size-4" />
            </Button>
          </div>

          <form onSubmit={enregistrer} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="nom" className="text-sm font-medium">Nom *</label>
                <input id="nom" required maxLength={100} value={form.nom}
                  onChange={e => changer("nom", e.target.value)}
                  className={inputClass} />
              </div>

              <div className="space-y-2">
                <label htmlFor="prenom" className="text-sm font-medium">Prénom</label>
                <input id="prenom" maxLength={100} value={form.prenom}
                  onChange={e => changer("prenom", e.target.value)}
                  className={inputClass} />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email *</label>
              <input id="email" type="email" required maxLength={150}
                value={form.email}
                onChange={e => changer("email", e.target.value)}
                placeholder="utilisateur@somida.com"
                className={inputClass} />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                {mode === "ajout" ? "Mot de passe *" : "Nouveau mot de passe"}
              </label>
              <input id="password" type="password"
                required={mode === "ajout"} 
                // minLength={12}
                autoComplete="new-password"
                value={form.motDePasse}
                onChange={e => changer("motDePasse", e.target.value)}
                // placeholder={mode === "ajout"
                //   ? "12 caractères minimum"
                //   : "Laisser vide pour conserver le mot de passe"}
                className={inputClass} />
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">Rôle *</label>
              <select id="role" required value={form.role}
                onChange={e => changer("role", e.target.value)}
                className={inputClass}>
                {roles.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
              <Button type="button" variant="outline" onClick={fermer}>
                Annuler
              </Button>
              {/* <Button type="submit" disabled={loading}>
                {loading
                  ? <Loader2 className="mr-2 size-4 animate-spin" />
                  : <CheckCircle2 className="mr-2 size-4" />}
                {loading ? "Enregistrement..."
                  : mode === "ajout" ? "Créer l'utilisateur"
                  : "Enregistrer les modifications"}
              </Button> */}

              <Button type="submit" disabled={loading}>
  <span className="inline-flex items-center gap-2">
    <Loader2
      className={`size-4 animate-spin ${loading ? "" : "hidden"}`}
    />
    <CheckCircle2
      className={`size-4 ${loading ? "hidden" : ""}`}
    />
    <span>
      {loading
        ? "Enregistrement..."
        : mode === "ajout"
          ? "Créer l'utilisateur"
          : "Enregistrer les modifications"}
    </span>
  </span>
</Button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex items-center gap-3 border-b p-5">
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
            <Users className="size-5" />
          </div>
          <div>
            <h2 className="font-semibold">Liste des utilisateurs</h2>
            <p className="text-sm text-muted-foreground">
              {utilisateurs.length} utilisateur(s) enregistré(s)
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-5 py-3 font-medium">Nom complet</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Rôle</th>
                <th className="px-5 py-3 font-medium">Statut</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {chargement ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
                  </td>
                </tr>
              ) : utilisateurs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    Aucun utilisateur enregistré.
                  </td>
                </tr>
              ) : utilisateurs.map(u => (
                <tr key={u.id} className="hover:bg-muted/30">
                  <td className="px-5 py-4 font-medium">
                    {[u.prenom, u.nom].filter(Boolean).join(" ")}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{u.email}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      u.actif
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {u.actif ? "Actif" : "Désactivé"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline"
                        onClick={() => ouvrirModification(u)}>
                        <Pencil className="mr-1 size-3.5" />
                        Modifier
                      </Button>

                      <Button size="sm" variant="outline"
                        disabled={loading}
                        onClick={() => setConfirmation(u)}
                        className={u.actif
                          ? "text-destructive hover:text-destructive"
                          : "text-green-700"}>
                        {u.actif
                          ? <PowerOff className="mr-1 size-3.5" />
                          : <Power className="mr-1 size-3.5" />}
                        {u.actif ? "Désactiver" : "Activer"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {confirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="titre-statut"
            className="w-full max-w-md rounded-xl border bg-background p-6 shadow-xl">
            <h2 id="titre-statut" className="text-lg font-semibold">
              {confirmation.actif ? "Désactiver le compte ?" : "Activer le compte ?"}
            </h2>

            <p className="mt-3 text-sm text-muted-foreground">
              Voulez-vous vraiment {confirmation.actif ? "désactiver" : "activer"} le compte de{" "}
              <strong>{confirmation.prenom} {confirmation.nom}</strong> ?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" disabled={loading}
                onClick={() => setConfirmation(null)}>
                Annuler
              </Button>

              {/* <Button disabled={loading}
                variant={confirmation.actif ? "destructive" : "default"}
                onClick={appliquerStatut}>
                {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                Confirmer
              </Button> */}

              <Button
  type="button"
  disabled={loading}
  variant={confirmation.actif ? "destructive" : "default"}
  onClick={appliquerStatut}
>
  <span className="inline-flex items-center gap-2">
    <Loader2
      className={`size-4 animate-spin ${loading ? "" : "hidden"}`}
    />
    <span>{loading ? "Traitement..." : "Confirmer"}</span>
  </span>
</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
