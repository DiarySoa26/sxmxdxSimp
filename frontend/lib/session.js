const SESSION_KEY = "sxmxdx_user"

export function saveSession(user) {
  if (typeof window === "undefined") {
    return
  }

  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify(user)
  )
}


export function getSession() {
  if (typeof window === "undefined") {
    return null
  }

  const session =
    sessionStorage.getItem(
      SESSION_KEY
    )

  if (!session) {
    return null
  }

  try {
    return JSON.parse(session)
  } catch {
    removeSession()

    return null
  }
}


export function removeSession() {
  if (typeof window === "undefined") {
    return
  }

  sessionStorage.removeItem(
    SESSION_KEY
  )
}


export function isAuthenticated() {
  return getSession() !== null
}