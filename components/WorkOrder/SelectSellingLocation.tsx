import { API_UEX_BASE_URL, UEX_API_ENDPOINTS } from "@/lib/api-endpoints"
import { Commodity, ComodityPriceSum } from "@/models/Commodity"
import { MineralToSell } from "@/models/Mineral"
import { Terminal } from "@/models/Terminal"
import { useEffect, useRef, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useTranslation } from "react-i18next"

interface SelectSellingLocationProps {
    pricingAll: Commodity[]
    mineralsList: MineralToSell[]
    preserveRestoredSelection?: boolean
    selectedTerminalName?: string | null
    updateSelectedPrice?: (price: number) => void
    updateSelectedTerminalName?: (terminalName: string | null, isUserAction?: boolean) => void
}

export default function SelectSellingLocation({
    pricingAll,
    mineralsList,
    preserveRestoredSelection,
    selectedTerminalName,
    updateSelectedPrice,
    updateSelectedTerminalName
}: SelectSellingLocationProps) {
    const { t } = useTranslation()

    const [filteredLocations, setFilteredLocations] = useState<Commodity[]>([])
    const [comodityPriceSums, setComodityPriceSums] = useState<ComodityPriceSum[]>([])
    const [selectedComodity, setSelectedComodity] = useState<ComodityPriceSum | null>(null)
    const hasAppliedSavedSelection = useRef(false)

    useEffect(() => {
        filterLocations()
    }, [pricingAll, mineralsList])

    const filterLocations = () => {
        const locations = pricingAll.filter(p => {
            if (p.price_sell <= 0) return false
            return mineralsList.some(m => {
                return p.commodity_name.toLowerCase().includes(m.name.toLowerCase())
            })
        })
        setFilteredLocations(locations)
    }

    useEffect(() => {
        const computeSums = async () => {
            const sums: ComodityPriceSum[] = []
            await Promise.all(filteredLocations.map(async location => {
                const mineral = mineralsList.find(m => location.commodity_name.toLowerCase().includes(m.name.toLowerCase()))
                if (!mineral) return
                const fullname = await fetch(API_UEX_BASE_URL + UEX_API_ENDPOINTS.terminals + location.terminal_name)
                    .then(response => response.json())
                    .then(json => getFullName(json?.data?.[0] as Terminal)) || location.terminal_name
                const existingSum = sums.find(s => s.terminal_name === location.terminal_name)
                if (existingSum) {
                    existingSum.price_sell_sum += parseFloat((location.price_sell * (mineral.yield / 1000)!).toFixed(0))
                    if (!existingSum.minerals.some(m => m.name.toLowerCase() === location.commodity_name.toLowerCase())) {
                        existingSum.minerals.push(mineral)
                    }
                } else {
                    sums.push({
                        full_name: fullname,
                        terminal_name: location.terminal_name,
                        price_sell_sum: parseFloat((location.price_sell * (mineral.yield / 1000)!).toFixed(0)),
                        minerals: [mineral]
                    })
                }
            }))
            const sortedSums = sums.sort((a, b) => b.price_sell_sum - a.price_sell_sum)
            setComodityPriceSums(sortedSums)

            if (sortedSums.length === 0) {
                setSelectedComodity(null)
                updateSelectedTerminalName?.(null)
                if (!preserveRestoredSelection && updateSelectedPrice) {
                    updateSelectedPrice(0)
                }
                hasAppliedSavedSelection.current = true
                return
            }

            const matchingSelection = selectedTerminalName
                ? sortedSums.find(c => c.terminal_name === selectedTerminalName) || null
                : null
            const restoredSelection = !hasAppliedSavedSelection.current ? matchingSelection : null
            const nextSelection = matchingSelection || sortedSums[0]

            setSelectedComodity(nextSelection)
            updateSelectedTerminalName?.(nextSelection.terminal_name)

            if (!preserveRestoredSelection && !restoredSelection && updateSelectedPrice) {
                updateSelectedPrice(nextSelection.price_sell_sum)
            }

            hasAppliedSavedSelection.current = true
        }
        computeSums()
    }, [filteredLocations, mineralsList, preserveRestoredSelection, selectedTerminalName, updateSelectedPrice, updateSelectedTerminalName])

    const getFullName = async (terminal: Terminal) => {
        return `${terminal.star_system_name ? terminal.star_system_name + ' - ' : ''} ${terminal.planet_name ? terminal.planet_name + ' - ' : ''} ${terminal.moon_name ? terminal.moon_name + ' - ' : ''} ${terminal.space_station_name || terminal.outpost_name || terminal.poi_name || terminal.city_name || terminal.faction_name || terminal.company_name || terminal.name}`
    }

    const handleComodityChange = (terminal_name: string) => {
        const found = comodityPriceSums.find(c => c.terminal_name === terminal_name)
        setSelectedComodity(found || null)
        updateSelectedTerminalName?.(found?.terminal_name || null, true)
        if (updateSelectedPrice) {
            updateSelectedPrice(found ? found.price_sell_sum : 0)
        }
    }

    return (
        <div className="w-full flex flex-col gap-2">
            <h3 className="text-sm text-slate-400">{t("workOrder.sellingSection.selectSellingLocation")}</h3>
            {comodityPriceSums.length > 0 && (
                <Select
                    value={selectedComodity?.terminal_name || ''}
                    onValueChange={handleComodityChange}
                >
                    <SelectTrigger className="w-full border-slate-800 bg-slate-900/50 text-cyan-50 focus:border-cyan-700 focus:ring-cyan-700/20">
                        <SelectValue placeholder={t("workOrder.sellingSection.selectLocation")}>
                            <span className="text-xs">
                                {selectedComodity ? `${selectedComodity.full_name} - ${selectedComodity.price_sell_sum.toLocaleString()}` : ''}
                                {selectedComodity && <span className="device-font"> aUEC</span>}
                            </span>
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="border-slate-800 bg-slate-900">
                        {comodityPriceSums.map((comodity, idx) => (
                            <SelectItem key={comodity.terminal_name + idx} value={comodity.terminal_name} className="text-cyan-50 focus:bg-slate-800 focus:text-cyan-300">
                                <div className="flex flex-col items-start">
                                    <span className="font-semibold">{comodity.full_name}</span>
                                    <span className="text-xs text-slate-400">
                                        {comodity.price_sell_sum.toLocaleString()}
                                        <span className="device-font"> aUEC</span>
                                    </span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        </div>
    )
}