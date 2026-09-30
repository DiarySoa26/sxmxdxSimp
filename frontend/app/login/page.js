"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import {
  login,
} from "@/services/auth-service"

import {
  getSession,
  saveSession,
} from "@/lib/session"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] =
    useState("")

  const [password, setPassword] =
    useState("")

  const [erreur, setErreur] =
    useState("")

  const [chargement, setChargement] =
    useState(false)



  useEffect(() => {

    const utilisateur =
      getSession()

    if (utilisateur) {
      router.replace("/dashboard")
    }

    console.log(
      "Utilisateur connecté :",
      utilisateur
    )

  }, [router])


 

  async function handleSubmit(event) {

    event.preventDefault()

    setErreur("")
    setChargement(true)

    try {

      const data =
        await login(
          email,
          password
        )


      saveSession({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
      })


      router.push("/dashboard")

    } catch (error) {

      console.error(
        "Erreur connexion :",
        error
      )

      setErreur(
        error.message ||
          "Impossible de se connecter."
      )

    } finally {

      setChargement(false)

    }
  }


  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-4">

      <div className="w-full max-w-md rounded-xl border bg-background p-8 shadow-sm">

        <div className="mb-8 text-center">

          <h1 className="text-3xl font-bold">
            SXMXDX
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Budgétisation et planification annuelle
          </p>

        </div>


        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

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
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="admin.sxmxdx@gmail.com"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />

          </div>


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
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              placeholder="••••••••"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />

          </div>


          {erreur && (

            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">

              {erreur}

            </div>

          )}


          <button
            type="submit"
            disabled={chargement}
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >

            {chargement
              ? "Connexion..."
              : "Se connecter"}

          </button>

        </form>

      </div>

    </main>
  )
}