"use client"

import { useTranslation } from "react-i18next"
import { Header } from "@/components/Header"
import { TrendingUp, Construction } from "lucide-react"

export default function MiningProfitPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-6 flex items-center gap-3">
            <TrendingUp className="h-10 w-10 text-cyan-400" />
            <h1 className="text-3xl font-bold tracking-tight text-cyan-50 sm:text-4xl">
              {t("miningProfit.title")}
            </h1>
          </div>

          <p className="mb-8 max-w-2xl text-lg text-slate-400">
            {t("miningProfit.description")}
          </p>

          <div className="flex items-center gap-2 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3">
            <Construction className="h-5 w-5 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">
              {t("utils.wip")}
            </span>
          </div>
        </div>
      </main>
    </div>
  )
}
