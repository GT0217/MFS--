"use client"

import { useEffect } from "react"

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch((error) => {
          if (process.env.NODE_ENV !== "production") {
            console.warn("[MFS] Service worker registration failed", error)
          }
        })
    }
  }, [])
  return null
}
