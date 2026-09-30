"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function SessionGuard({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  const [verification, setVerification] =
    useState(true)

  useEffect(() => {
    const session =
      sessionStorage.getItem(
        "sxmxdx_user"
      )

    if (!session) {
      router.replace("/login")
      return
    }

    try {
      JSON.parse(session)

      setVerification(false)

    } catch {
      sessionStorage.removeItem(
        "sxmxdx_user"
      )

      router.replace("/login")
    }

  }, [router])

  if (verification) {
    return (
      <div className="flex min-h-screen items-center justify-center">

        <p className="text-sm text-muted-foreground">
          Vérification de la session...
        </p>

      </div>
    )
  }

  return <>{children}</>
}