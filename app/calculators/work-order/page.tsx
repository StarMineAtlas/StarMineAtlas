"use client"

import { Header } from "@/components/Header/Header"
import { Loader } from "@/components/Loader"
import Expenses from "@/components/WorkOrder/Expenses"
import FinalSellingPrice from "@/components/WorkOrder/FinalSellingPrice"
import GlobalActions from "@/components/WorkOrder/GlobalActions"
import MineralsListing from "@/components/WorkOrder/MineralsListing"
import ProfitShare from "@/components/WorkOrder/ProfitShare"
import RefinerySelectors from "@/components/WorkOrder/RefinerySelectors"
import SelectSellingLocation from "@/components/WorkOrder/SelectSellingLocation"
import Timer from "@/components/WorkOrder/Timer"
import { API_BASE_URL, API_ENDPOINTS, API_UEX_BASE_URL, UEX_API_ENDPOINTS } from "@/lib/api-endpoints"
import { Commodity, excludedIds } from "@/models/Commodity"
import { Mineral, MineralToSell, MineralType } from "@/models/Mineral"
import { RefineryMethod, RefineryMethodsPourcentages, RefineryWithLocationAndBonuses, RefineryYield } from "@/models/Refinery"
import { Expense, User } from "@/models/WorkOrder"
import { ClipboardList } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

export default function WorkOrderPage() {
  const LOCAL_STORAGE_KEY = "sma-current-work-order"
  const { t } = useTranslation()

  const [minerals, setMinerals] = useState<Mineral[]>([])

  const [refineryYield, setRefineryYield] = useState<RefineryYield[]>([])
  const [refineryMethod, setRefineryMethod] = useState<RefineryMethod[]>([])
  const [selectedRefinery, setSelectedRefinery] = useState<RefineryWithLocationAndBonuses | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<RefineryMethod | null>(null)

  const [loading, setLoading] = useState(true)

  const [mineralsList, setMineralsList] = useState<MineralToSell[]>([])
  const [needToUpdateMineralsList, setNeedToUpdateMineralsList] = useState(false)

  const [pricingAll, setPricingAll] = useState<Commodity[]>([])
  const [selectedPrice, setSelectedPrice] = useState<number>(0)
  const [finalPrice, setFinalPrice] = useState<number>(0)

  const [usersList, setUsersList] = useState<User[]>([{ id: 0, username: "You" }])
  const [expensesList, setExpensesList] = useState<Expense[]>([])

  const [profitShares, setProfitShares] = useState<{ userId: number, part: number, share: number }[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(LOCAL_STORAGE_KEY) : null
    if (saved) {
      try {
        const data = JSON.parse(saved)
        if (data) {
          setProfitShares(data.profitShares || [])
          setExpensesList(data.expensesList || [])
          setFinalPrice(data.finalPrice || 0)
          setUsersList(data.usersList || [{ id: 0, username: "You" }])
          setSelectedPrice(data.selectedPrice || 0)
          setMineralsList(data.mineralsList || [])
          setSelectedMethod(data.selectedMethod || null)
          setSelectedRefinery(data.selectedRefinery || null)
        }
      } catch (e) {
        // ignore parse error
      }
    }
    Promise.all([
      fetch(API_UEX_BASE_URL + UEX_API_ENDPOINTS.refineriesYields)
        .then(response => response.json())
        .then(json => setRefineryYield(json?.data)),
      fetch(API_UEX_BASE_URL + UEX_API_ENDPOINTS.refineriesMethods)
        .then(response => response.json())
        .then(json => setRefineryMethod(json?.data)),
      fetch(API_BASE_URL + API_ENDPOINTS.minerals)
        .then(response => response.json())
        .then(data => setMinerals(data)),
      fetch(API_UEX_BASE_URL + UEX_API_ENDPOINTS.commoditiesPricesAll)
        .then(response => response.json())
        .then(json => setPricingAll(removeExcludedIdsFromPricing(json?.data)))
    ]).finally(() => setLoading(false))
  }, [])

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
      if (mineral.type === MineralType.FPS) {
        return {
          ...mineral,
          yield: mineral.quantity
        }
      } else {
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
      }
    })
    setMineralsList(newMineralsList)
  }

  const removeExcludedIdsFromPricing = (commodities: Commodity[]) => {
    return commodities.filter(c => !excludedIds.includes(c.id_commodity))
  }

  // Save to localStorage on any relevant state change
  useEffect(() => {
    const allData = {
      profitShares,
      expensesList,
      finalPrice,
      usersList,
      selectedPrice,
      mineralsList,
      selectedMethod,
      selectedRefinery
    }
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allData))
    }
  }, [profitShares, expensesList, finalPrice, usersList, selectedPrice, mineralsList, selectedMethod, selectedRefinery])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
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
            <div className="w-full grid grid-cols-1 gap-4 mx-4 md:mx-0">
              <div className="rounded-xl flex flex-col border border-slate-800 bg-slate-900/50">
                <h2 className="text-lg text-cyan-400 py-4 border-b w-full border-slate-800" suppressHydrationWarning>{t("workOrder.refinerySection.title")}</h2>
                <div className="flex flex-col justify-start h-full gap-4 p-4">
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
                <div className="flex flex-col justify-start h-full gap-4 p-4">
                  <SelectSellingLocation pricingAll={pricingAll} mineralsList={mineralsList} updateSelectedPrice={setSelectedPrice}></SelectSellingLocation>
                  <FinalSellingPrice price={selectedPrice} updatePrice={setFinalPrice}></FinalSellingPrice>
                  <ProfitShare usersList={usersList} expensesList={expensesList} finalPrice={finalPrice} updatedProfitShares={profitShares} updateUsersList={setUsersList} updateProfitShares={setProfitShares}></ProfitShare>
                  <Expenses expensesList={expensesList} usersList={usersList} profitShares={profitShares} updateExpenseList={setExpensesList} ></Expenses>
                  <GlobalActions></GlobalActions>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
