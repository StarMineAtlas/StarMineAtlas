"use client"

import { Header } from "@/components/Header"
import { useTranslation } from "react-i18next"
import { Construction, TrendingUp } from "lucide-react"

export default function marketPrices() {
    const { t } = useTranslation()
    return (
        <div className="min-h-screen bg-slate-950 text-slate-50">
            <Header />
            <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="mb-6 flex items-center gap-3">
                        <TrendingUp className="h-10 w-10 text-cyan-400" />
                        <h1 className="text-3xl font-bold tracking-tight text-cyan-50 sm:text-4xl" suppressHydrationWarning>
                            {t("header.marketPrices")}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3">
                        <Construction className="h-5 w-5 text-amber-400" />
                        <span className="text-sm font-medium text-amber-400" suppressHydrationWarning>
                            {t("utils.wip")}
                        </span>
                    </div>
                </div>
            </main>
        </div>
    )
}