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
import { type Expense, type ProfitShare as WorkOrderProfitShare, type User, type WorkOrderData, type WorkOrderTimerState } from "@/models/WorkOrder"
import { ClipboardList } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

export default function WorkOrderPage() {
  const LOCAL_STORAGE_KEY = "sma-current-work-order"
  const LEGACY_TIMER_LOCAL_STORAGE_KEY = "sma-current-work-order-timer"
  const { t } = useTranslation()

  const [minerals, setMinerals] = useState<Mineral[]>([])

  const [refineryYield, setRefineryYield] = useState<RefineryYield[]>([])
  const [refineryMethod, setRefineryMethod] = useState<RefineryMethod[]>([])
  const [selectedRefinery, setSelectedRefinery] = useState<RefineryWithLocationAndBonuses | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<RefineryMethod | null>(null)

  const [loading, setLoading] = useState(true)
  const [hasRestoredLocalStorage, setHasRestoredLocalStorage] = useState(false)

  const [mineralsList, setMineralsList] = useState<MineralToSell[]>([])
  const [needToUpdateMineralsList, setNeedToUpdateMineralsList] = useState(false)

  const [pricingAll, setPricingAll] = useState<Commodity[]>([])
  const [selectedSellingTerminalName, setSelectedSellingTerminalName] = useState<string | null>(null)
  const [selectedPrice, setSelectedPrice] = useState<number>(0)
  const [finalPrice, setFinalPrice] = useState<number>(0)

  const [usersList, setUsersList] = useState<User[]>([{ id: 0, username: "You" }])
  const [expensesList, setExpensesList] = useState<Expense[]>([])

  const [profitShares, setProfitShares] = useState<WorkOrderProfitShare[]>([])
  const [preserveRestoredSellingState, setPreserveRestoredSellingState] = useState(false)
  const [timer, setTimer] = useState<WorkOrderTimerState>({ endTimestamp: null, wasStarted: false })

  const [allDatas, setAllDatas] = useState<WorkOrderData | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {

      const urlParams = new URLSearchParams(window.location.search)
      const preset = urlParams.get("preset")
      if (preset) {
        localStorage.setItem(LOCAL_STORAGE_KEY, decodeURIComponent(preset))
        const newUrl = window.location.origin + window.location.pathname
        window.history.replaceState({}, document.title, newUrl)
      }

      const saved = localStorage.getItem(LOCAL_STORAGE_KEY)

      if (saved) {
        try {
          const data = JSON.parse(saved)
          let restoredTimer: WorkOrderTimerState = { endTimestamp: null, wasStarted: false }

          if (data?.timer) {
            restoredTimer = {
              endTimestamp: typeof data.timer.endTimestamp === "number" ? data.timer.endTimestamp : null,
              wasStarted: Boolean(data.timer.wasStarted)
            }
          } else {
            const savedLegacyTimer = localStorage.getItem(LEGACY_TIMER_LOCAL_STORAGE_KEY)

            if (savedLegacyTimer) {
              try {
                const legacyTimer = JSON.parse(savedLegacyTimer)
                restoredTimer = {
                  endTimestamp: typeof legacyTimer?.endTimestamp === "number" ? legacyTimer.endTimestamp : null,
                  wasStarted: Boolean(legacyTimer?.wasStarted)
                }
                localStorage.removeItem(LEGACY_TIMER_LOCAL_STORAGE_KEY)
              } catch (error) {
                console.error("Failed to parse saved timer state:", error)
              }
            }
          }

          if (data) {
            setProfitShares(data.profitShares || [])
            setExpensesList(data.expensesList || [])
            setFinalPrice(data.finalPrice || 0)
            setUsersList(data.usersList || [{ id: 0, username: "You" }])
            setSelectedPrice(data.selectedPrice || 0)
            setSelectedSellingTerminalName(data.selectedSellingTerminalName || null)
            setMineralsList(data.mineralsList || [])
            setSelectedMethod(data.selectedMethod || null)
            setSelectedRefinery(data.selectedRefinery || null)
            setTimer(restoredTimer)
            setPreserveRestoredSellingState(true)
          }
        } catch (error) {
          console.error("Failed to parse saved work order data:", error)
        }
      }
    }

    setHasRestoredLocalStorage(true)

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
    ]).finally(() => {
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (needToUpdateMineralsList) {
      updateMineralsListYield()
      setNeedToUpdateMineralsList(false)
    }
  }, [needToUpdateMineralsList])

  useEffect(() => {
    if (!hasRestoredLocalStorage) {
      return
    }

    updateMineralsListYield()
  }, [hasRestoredLocalStorage, selectedMethod, selectedRefinery])

  useEffect(() => {
    if (!hasRestoredLocalStorage) {
      return
    }

    if (preserveRestoredSellingState) {
      return
    }

    setFinalPrice(selectedPrice)
  }, [hasRestoredLocalStorage, preserveRestoredSellingState, selectedPrice])

  const handleRefineryMethodChange = (method: RefineryMethod | null) => {
    setPreserveRestoredSellingState(false)
    setSelectedMethod(method)
  }

  const handleRefineryMethodSelection = (method: RefineryMethod | null, isUserAction?: boolean) => {
    if (isUserAction) {
      setPreserveRestoredSellingState(false)
    }

    setSelectedMethod(method)
  }

  const handleRefineryChange = (refinery: RefineryWithLocationAndBonuses | null) => {
    setPreserveRestoredSellingState(false)
    setSelectedRefinery(refinery)
  }

  const handleRefinerySelection = (refinery: RefineryWithLocationAndBonuses | null, isUserAction?: boolean) => {
    if (isUserAction) {
      setPreserveRestoredSellingState(false)
    }

    setSelectedRefinery(refinery)
  }

  const handleUpdateMineralsList = (newList: MineralToSell[]) => {
    setPreserveRestoredSellingState(false)
    setMineralsList(newList)
    setNeedToUpdateMineralsList(true)
  }

  const handleSelectedPriceChange = (price: number) => {
    setSelectedPrice(price)
  }

  const handleSelectedTerminalChange = (terminalName: string | null, isUserAction?: boolean) => {
    if (isUserAction) {
      setPreserveRestoredSellingState(false)
    }

    setSelectedSellingTerminalName(terminalName)
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
    if (!hasRestoredLocalStorage || typeof window === "undefined") {
      return
    }

    const allData = {
      profitShares,
      expensesList,
      finalPrice,
      usersList,
      selectedPrice,
      selectedSellingTerminalName,
      mineralsList,
      selectedMethod,
      selectedRefinery,
      timer
    }

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allData))
    setAllDatas(allData)
  }, [hasRestoredLocalStorage, profitShares, expensesList, finalPrice, usersList, selectedPrice, selectedSellingTerminalName, mineralsList, selectedMethod, selectedRefinery, timer])

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
                    selectedRefinery={selectedRefinery}
                    selectedMethod={selectedMethod}
                    updateSelectedRefinery={handleRefinerySelection}
                    updateSelectedMethod={handleRefineryMethodSelection}
                  ></RefinerySelectors>
                  <Timer timerState={timer} updateTimerState={setTimer}></Timer>
                </div>
              </div>
              <div className="rounded-xl flex flex-col border border-slate-800 bg-slate-900/50">
                <h2 className="text-lg text-cyan-400 py-4 border-b w-full border-slate-800" suppressHydrationWarning>{t("workOrder.sellingSection.title")}</h2>
                <div className="flex flex-col justify-start h-full gap-4 p-4">
                  <SelectSellingLocation
                    pricingAll={pricingAll}
                    mineralsList={mineralsList}
                    preserveRestoredSelection={preserveRestoredSellingState}
                    selectedTerminalName={selectedSellingTerminalName}
                    updateSelectedPrice={handleSelectedPriceChange}
                    updateSelectedTerminalName={handleSelectedTerminalChange}
                  ></SelectSellingLocation>
                  <FinalSellingPrice price={finalPrice} updatePrice={setFinalPrice}></FinalSellingPrice>
                  <ProfitShare usersList={usersList} expensesList={expensesList} finalPrice={finalPrice} updatedProfitShares={profitShares} updateUsersList={setUsersList} updateProfitShares={setProfitShares}></ProfitShare>
                  <Expenses expensesList={expensesList} usersList={usersList} profitShares={profitShares} updateExpenseList={setExpensesList} ></Expenses>
                  <GlobalActions allDatas={allDatas}></GlobalActions>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
