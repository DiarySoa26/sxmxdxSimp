"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

import { Loader2, LogIn } from "lucide-react"

import { login } from "@/services/auth-service"

import {
  getSession,
  saveSession
} from "@/lib/session"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [erreur, setErreur] = useState("")
  const [chargement, setChargement] = useState(false)
  const [verification, setVerification] = useState(true)

  useEffect(() => {
    const utilisateur = getSession()

    if (utilisateur) {
      router.replace("/dashboard/exercices")
    } else {
      setVerification(false)
    }
  }, [router])

  async function handleSubmit(event) {
    event.preventDefault()

    if (chargement) return

    setErreur("")
    setChargement(true)

    try {
      const data = await login(email, password)

      saveSession({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role
      })

      router.replace("/dashboard/exercices")

    } catch (error) {
      console.error("Erreur connexion :", error)

      setErreur(
        error instanceof Error
          ? error.message
          : "Impossible de se connecter."
      )

      setChargement(false)
    }
  }

  if (verification) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />

          <p className="text-sm text-muted-foreground">
            Vérification de la session...
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-4 py-8">

      <div className="w-full max-w-md rounded-xl border bg-background p-8 shadow-sm">

        <div className="mb-8 flex flex-col items-center text-center">

          <div className="mb-4 flex items-center justify-center">
            <Image
              src="/images/LogoSomida2.png"
              alt="Logo SXMXDX"
              width={110}
              height={110}
              priority
              className="h-auto max-h-28 w-auto object-contain"
            />
          </div>

          <p className="text-sm text-muted-foreground">
            Budgétisation et planification annuelle
          </p>

        </div>

        {/* FORMULAIRE */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* EMAIL */}
          <div className="space-y-2">

            <label
              htmlFor="email"
              className="text-sm font-medium"
            >
              Adresse e-mail
            </label>

            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              disabled={chargement}
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder="admin.sxmxdx@gmail.com"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />

          </div>

          {/* MOT DE PASSE */}
          <div className="space-y-2">

            <label
              htmlFor="password"
              className="text-sm font-medium"
            >
              Mot de passe
            </label>

            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              disabled={chargement}
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder="••••••••"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />

          </div>

          {/* MESSAGE D'ERREUR */}
          {erreur && (
            <div
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            >
              {erreur}
            </div>
          )}

          {/* BOUTON DE CONNEXION */}
          <button
            type="submit"
            disabled={chargement}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >

            {chargement ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Connexion en cours...
              </>
            ) : (
              <>
                <LogIn className="size-5" />
                Se connecter
              </>
            )}

          </button>

        </form>

      </div>

    </main>
  )
}
