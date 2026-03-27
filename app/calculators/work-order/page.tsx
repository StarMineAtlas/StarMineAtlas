"use client"

import { Header } from "@/components/Header/Header"
import { Loader } from "@/components/Loader"
import MineralsListing from "@/components/WorkOrder/MineralsListing"
import RefinerySelectors from "@/components/WorkOrder/RefinerySelectors"
import Timer from "@/components/WorkOrder/Timer"
import { API_BASE_URL, API_ENDPOINTS, API_UEX_BASE_URL, UEX_API_ENDPOINTS } from "@/lib/api-endpoints"
import { Mineral, MineralToSell } from "@/models/Mineral"
import { RefineryMethod, RefineryMethodsPourcentages, RefineryWithLocationAndBonuses, RefineryYield } from "@/models/Refinery"
import { ClipboardList } from "lucide-react"
import { use, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

export default function WorkOrderPage() {
  const { t } = useTranslation()

  const [minerals, setMinerals] = useState<Mineral[]>([])

  const [refineryYield, setRefineryYield] = useState<RefineryYield[]>([])
  const [refineryMethod, setRefineryMethod] = useState<RefineryMethod[]>([])
  const [selectedRefinery, setSelectedRefinery] = useState<RefineryWithLocationAndBonuses | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<RefineryMethod | null>(null)

  const [loading, setLoading] = useState(true)

  const [mineralsList, setMineralsList] = useState<MineralToSell[]>([])
  const [needToUpdateMineralsList, setNeedToUpdateMineralsList] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(API_UEX_BASE_URL + UEX_API_ENDPOINTS.refineriesYields)
        .then(response => response.json())
        .then(json => setRefineryYield(json?.data)),
      fetch(API_UEX_BASE_URL + UEX_API_ENDPOINTS.refineriesMethods)
        .then(response => response.json())
        .then(json => setRefineryMethod(json?.data)),
      fetch(API_BASE_URL + API_ENDPOINTS.minerals)
        .then(response => response.json())
        .then(data => setMinerals(data))
    ]).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    console.log("Refinery:", refineryYield)
  }, [refineryYield])

  useEffect(() => {
    if (needToUpdateMineralsList) {
      updateMineralsListYield()
      setNeedToUpdateMineralsList(false)
    }
  }, [needToUpdateMineralsList])

  useEffect(() => {
    updateMineralsListYield()
  }, [selectedMethod, selectedRefinery])

  const handleRefineryMethodChange = (method: RefineryMethod | null) => {
    setSelectedMethod(method)
  }

  const handleRefineryChange = (refinery: RefineryWithLocationAndBonuses | null) => {
    setSelectedRefinery(refinery)
  }

  const handleUpdateMineralsList = (newList: MineralToSell[]) => {
    setMineralsList(newList)
    setNeedToUpdateMineralsList(true)
  }

  const updateMineralsListYield = () => {
    if (!selectedMethod) {
      const resetList = mineralsList.map(mineral => ({
        ...mineral,
        quantity: mineral.quantity,
        yield: mineral.quantity
      }))
      setMineralsList(resetList)
      return
    }

    const newMineralsList = mineralsList.map(mineral => {
      const bonus = (selectedRefinery?.bonuses.find(b => b.mineral.replace(/\s*\(Raw\)|\s*\(Ore\)|\s*Raw|\s*Ore|\s*Pressurized/gi, "").trim() === mineral.name.replace(/\s*\(Raw\)|\s*\(Ore\)|\s*Raw|\s*Ore|\s*Pressurized/gi, "").trim())?.value || 0) / 100
      const methodYieldBonus = RefineryMethodsPourcentages[selectedMethod.rating_yield as keyof typeof RefineryMethodsPourcentages] || 0
      let refinedQuantity = mineral.quantity * methodYieldBonus
      if (bonus) {
        refinedQuantity += refinedQuantity * bonus
      }
      return {
        ...mineral,
        yield: parseFloat((refinedQuantity).toFixed(2))
      }
    })
    setMineralsList(newMineralsList)
  }

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
                  <MineralsListing minerals={minerals} mineralsList={mineralsList} updateMineralsList={handleUpdateMineralsList}></MineralsListing>
                  <RefinerySelectors
                    refineryYield={refineryYield}
                    refineryMethod={refineryMethod}
                    updateSelectedRefinery={handleRefineryChange}
                    updateSelectedMethod={handleRefineryMethodChange}
                  ></RefinerySelectors>
                  <Timer></Timer>
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
