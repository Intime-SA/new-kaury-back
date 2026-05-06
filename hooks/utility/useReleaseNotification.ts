"use client"

import { useEffect, useState } from "react"

/**
 * Hook que controla si el usuario ya vio la última release de novedades.
 * La key incluye la versión: cuando salga "v3", cambiamos el constant y
 * todos los usuarios vuelven a ver el indicador rojo.
 */
const STORAGE_KEY = "kaury_novedades_seen_v2"

export function useReleaseNotification() {
  const [seen, setSeen] = useState<boolean>(true) // SSR-safe default
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
    try {
      setSeen(localStorage.getItem(STORAGE_KEY) === "1")
    } catch {
      setSeen(false)
    }
  }, [])

  const markSeen = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1")
    } catch {}
    setSeen(true)
    // Dispatch para sincronizar pestañas / otros componentes que lean lo mismo
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("kaury-novedades-seen"))
    }
  }

  const markUnseen = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
    setSeen(false)
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("kaury-novedades-seen"))
    }
  }

  // Listener cross-component
  useEffect(() => {
    if (typeof window === "undefined") return
    const handler = () => {
      try {
        setSeen(localStorage.getItem(STORAGE_KEY) === "1")
      } catch {}
    }
    window.addEventListener("kaury-novedades-seen", handler)
    window.addEventListener("storage", handler)
    return () => {
      window.removeEventListener("kaury-novedades-seen", handler)
      window.removeEventListener("storage", handler)
    }
  }, [])

  return {
    /** true = ya vio. false = hay novedades pendientes */
    seen,
    /** ocultar el dot indicador */
    markSeen,
    /** forzar volver a mostrar (debug / admin) */
    markUnseen,
    /** evita flash en SSR — true cuando ya leyó el localStorage */
    hydrated,
  }
}
