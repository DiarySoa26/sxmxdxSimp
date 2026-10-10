"use client"

import { useRouter } from "next/navigation"

export function LogoutButton() {
  const router = useRouter()

  function deconnexion() {
    sessionStorage.removeItem(
      "sxmxdx_user"
    )

    router.replace("/login")
  }

  return (
    <button
      type="button"
      onClick={deconnexion}
      className="rounded-md border px-4 py-2 text-sm"
    >
      Se déconnecter
    </button>
  )
}