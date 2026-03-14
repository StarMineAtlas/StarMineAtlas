"use client"

import Link from "next/link"
import { Pickaxe } from "lucide-react"
import { useTranslation } from "react-i18next"
import { LanguageSelector } from "./LanguageSelector"

export function Header() {
  const { t } = useTranslation()

  return (
    <header className="sticky top-0 z-50 border-b border-cyan-900/50 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <Pickaxe className="h-6 w-6 text-cyan-400 transition-transform group-hover:rotate-12" />
          <span className="text-xl font-bold tracking-tight text-cyan-50">
            {t("header.siteName")}
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <nav>
            <Link
              href="/"
              className="text-sm font-medium text-slate-400 transition-colors hover:text-cyan-400"
            >
              {t("header.rockTypes")}
            </Link>
          </nav>
          <LanguageSelector />
        </div>
      </div>
    </header>
  )
}
