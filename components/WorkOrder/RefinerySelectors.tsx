import { RefineryMethod, RefineryRatingCost, RefineryRatingSpeed, RefineryRatingYield, RefineryWithLocationAndBonuses, RefineryYield } from "@/models/Refinery"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

interface RefinerySelectorsProps {
    refineryYield: RefineryYield[];
    refineryMethod: RefineryMethod[];
    updateSelectedRefinery: (refinery: RefineryWithLocationAndBonuses | null) => void;
    updateSelectedMethod: (method: RefineryMethod | null) => void;
}

const getSystemColor = (system: string): string => {
    switch (system.toLowerCase()) {
        case "stanton":
            return "text-yellow-400"
        case "pyro":
            return "text-red-400"
        case "nyx":
            return "text-blue-400"
        default:
            return "text-slate-300"
    }
}

export default function RefinerySelectors({ refineryYield, refineryMethod, updateSelectedRefinery, updateSelectedMethod }: RefinerySelectorsProps) {
    const { t } = useTranslation()

    const [uniqueRefinery, setUniqueRefinery] = useState<RefineryWithLocationAndBonuses[]>([])

    const [selectedRefinery, setSelectedRefinery] = useState<RefineryWithLocationAndBonuses | null>(null)
    const [selectedMethod, setSelectedMethod] = useState<RefineryMethod | null>(null)

    useEffect(() => {
        let uniqueRefineries = refineryYield.reduce((acc: RefineryWithLocationAndBonuses[], current) => {
            const bonus = {
                mineral: current.commodity_name,
                value: current.value
            }
            const existing = acc.find(r => r.terminal_name === current.terminal_name && r.star_system_name === current.star_system_name);
            if (!existing) {
                acc.push({
                    terminal_name: current.terminal_name || "Unknown Terminal",
                    space_station_name: current.space_station_name || "Unknown Space Station",
                    star_system_name: current.star_system_name || "Unknown Star System",
                    bonuses: [bonus]
                });
            } else {
                existing.bonuses.push(bonus);
            }
            return acc;
        }, []);
        uniqueRefineries = uniqueRefineries.sort((a, b) => {
            // Sort by star system name first
            if (a.star_system_name < b.star_system_name) return -1;
            if (a.star_system_name > b.star_system_name) return 1;
            // If star system names are the same, sort by space station name
            if (a.space_station_name < b.space_station_name) return -1;
            if (a.space_station_name > b.space_station_name) return 1;
            // If space station names are the same, sort by terminal name
            if (a.terminal_name < b.terminal_name) return -1;
            if (a.terminal_name > b.terminal_name) return 1;
            return 0;
        })
        setUniqueRefinery(uniqueRefineries)
    }, [refineryYield])

    useEffect(() => {
        console.log("Unique Refineries with Location:", uniqueRefinery)
    }, [uniqueRefinery])

    const handleRefineryChange = (value: string) => {
        const refinery = uniqueRefinery.find(r => r.terminal_name === value)
        setSelectedRefinery(refinery || null)
        updateSelectedRefinery(refinery || null)
    }

    const handleMethodChange = (value: string) => {
        const method = refineryMethod.find(m => m.name === value)
        setSelectedMethod(method || null)
        updateSelectedMethod(method || null)
    }

    return (
        <div className="flex flex-col w-full border-t border-slate-800 pt-4 gap-4">
            <Select
                value={selectedRefinery?.terminal_name || ""}
                onValueChange={handleRefineryChange}
            >
                <SelectTrigger className="w-full border-slate-800 bg-slate-900/50 text-cyan-50 focus:border-cyan-700 focus:ring-cyan-700/20">
                    <SelectValue placeholder={t("workOrder.refinerySection.refinerySelectors.refinery")} />
                </SelectTrigger>
                <SelectContent className="border-slate-800 bg-slate-900">
                    {/* Regroupement par système stellaire avec titres */}
                    {Object.entries(
                        uniqueRefinery.reduce((acc, refinery) => {
                            if (!acc[refinery.star_system_name]) acc[refinery.star_system_name] = [];
                            acc[refinery.star_system_name].push(refinery);
                            return acc;
                        }, {} as Record<string, RefineryWithLocationAndBonuses[]>)
                    ).map(([system, refineries]) => (
                        <div key={system}>
                            <div className={`px-2 py-1 text-xs font-bold ${getSystemColor(system)} uppercase tracking-wide select-none`}>
                                {system}
                            </div>
                            {refineries.map((refinery, idx) => (
                                <SelectItem key={refinery.terminal_name + idx} value={refinery.terminal_name} className="text-cyan-50 focus:bg-slate-800 focus:text-cyan-300">
                                    {refinery.space_station_name}
                                </SelectItem>
                            ))}
                        </div>
                    ))}
                </SelectContent>
            </Select>
            <Select
                value={selectedMethod?.name || ""}
                onValueChange={handleMethodChange}
            >
                <SelectTrigger className="w-full border-slate-800 bg-slate-900/50 text-cyan-50 focus:border-cyan-700 focus:ring-cyan-700/20">
                    <SelectValue placeholder={t("workOrder.refinerySection.refinerySelectors.method")}
                    >
                        {selectedMethod ? selectedMethod.name : null}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent className="border-slate-800 bg-slate-900">
                    {Object.entries(refineryMethod).map(
                        ([index, method]) => (
                            <SelectItem key={index} value={method.name} className="text-cyan-50 focus:bg-slate-800 focus:text-cyan-300 flex flex-col items-start">
                                <span className="font-semibold">{method.name}</span>
                                <div className="text-xs text-slate-400 flex flex-row gap-2">
                                    <span className="border-r border-slate-600 pr-2">{t("workOrder.refinerySection.refinerySelectors.yield")} - {t(RefineryRatingYield[method.rating_yield as keyof typeof RefineryRatingYield])}</span>
                                    <span className="border-r border-slate-600 pr-2">{t("workOrder.refinerySection.refinerySelectors.cost")} - {t(RefineryRatingCost[method.rating_cost as keyof typeof RefineryRatingCost])}</span>
                                    <span>{t("workOrder.refinerySection.refinerySelectors.speed")} - {t(RefineryRatingSpeed[method.rating_speed as keyof typeof RefineryRatingSpeed])}</span>
                                </div>
                            </SelectItem>
                        )
                    )}
                </SelectContent>
            </Select>
        </div>
    )
}