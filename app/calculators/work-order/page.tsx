"use client"

import { Header } from "@/components/Header/Header"
import { Loader } from "@/components/Loader"
import MineralsListing from "@/components/WorkOrder/MineralsListing"
import { MineralToSell } from "@/models/Mineral"
import { set } from "date-fns"
import { ClipboardList, Construction } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

export default function WorkOrderPage() {
  const { t } = useTranslation()

  const [loading, setLoading] = useState(true)

  const [mineralsList, setMineralsList] = useState<MineralToSell[]>([])

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-6 flex items-center gap-3">
            <ClipboardList className="h-10 w-10 text-cyan-400" />
            <h1 className="text-3xl font-bold tracking-tight text-cyan-50 sm:text-4xl" suppressHydrationWarning>
              {t("workOrder.title")}
            </h1>
          </div>

          <p className="mb-8 max-w-2xl text-lg text-slate-400" suppressHydrationWarning>
            {t("workOrder.description")}
          </p>

          {loading ? (
            <Loader loaderText={"Loading Data"} />
          ) : (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl flex flex-col border border-slate-800 bg-slate-900/50">
                <h2 className="text-lg text-cyan-400 py-4 border-b w-full border-slate-800" suppressHydrationWarning>{t("workOrder.refinerySection.title")}</h2>
                <div className="flex flex-col gap-4 p-4">
                  <MineralsListing updateMineralsList={setMineralsList}></MineralsListing>
                  <div>
                    SELECT REFINERY / METHOD
                  </div>
                  <div>
                    TIMER
                  </div>
                </div>
              </div>
              <div className="rounded-xl flex flex-col border border-slate-800 bg-slate-900/50">
                <h2 className="text-lg text-cyan-400 py-4 border-b w-full border-slate-800" suppressHydrationWarning>{t("workOrder.sellingSection.title")}</h2>
                <div className="flex flex-col gap-4 p-4">
                  <div>
                    SELECT SELLING LOCATION
                  </div>
                  <div>
                    FINAL SELL PRICE
                  </div>
                  <div>
                    EXPENSES
                  </div>
                  <div>
                    PROFIT SHARES
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
