"use client"

import i18n from "@/lib/i18n"
import { ReactNode, useEffect, useState } from "react"
import { I18nextProvider } from "react-i18next"

export function I18nProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Always render children to avoid hydration mismatch
  // The i18n will use fallback language on server, then switch on client
  return (
    <I18nextProvider i18n={i18n}>
      <div style={{ visibility: mounted ? "visible" : "visible" }}>
        {children}
      </div>
    </I18nextProvider>
  )
}
