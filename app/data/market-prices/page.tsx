"use client"

import { Header } from "@/components/Header"
import { useTranslation } from "react-i18next"
import { Construction, TrendingUp } from "lucide-react"
import { use, useEffect, useState } from "react"
import { API_BASE_URL, API_ENDPOINTS, API_UEX_BASE_URL, UEX_API_ENDPOINTS } from "@/lib/api-endpoints"
import { Mineral } from "@/models/Mineral"
import { Commodity, excludedIds, FormattedCommodityMaxPrice } from "@/models/Commodity"

function filteredCommodities(commodities: Commodity[], minerals: Mineral[]) {
    const mineralNames = minerals.map(mineral => mineral.name)
    return commodities.filter(commodity => mineralNames.some(mineralName => commodity.commodity_name.includes(mineralName)))
}

function singleGemPrice(price: number) {
    return Math.round(price / 1000)
}

export default function marketPrices() {
    const { t } = useTranslation()

    const [mineralsShip, setMineralsShip] = useState<Mineral[]>([])
    const [mineralsFPS, setMineralsFPS] = useState<Mineral[]>([])

    const [commoditiesPrices, setCommoditiesPrices] = useState<Commodity[]>([])
    const [commoditiesRawPrices, setCommoditiesRawPrices] = useState<Commodity[]>([])

    const [loading, setLoading] = useState(true)

    const [formattedCommoditiesShip, setFormattedCommoditiesShip] = useState<FormattedCommodityMaxPrice[]>([])
    const [formattedCommoditiesFPS, setFormattedCommoditiesFPS] = useState<FormattedCommodityMaxPrice[]>([])

    function filteredCommoditiesByType(commodities: FormattedCommodityMaxPrice[], type: "Ship" | "FPS") {
        let result = []
        if (type === "Ship") {
            result = commodities.filter(fc => mineralsShip.some(mineral => fc.name.includes(mineral.name)))
        } else {
            result = commodities.filter(fc => mineralsFPS.some(mineral => fc.name.includes(mineral.name)))
        }
        console.log("Before filtering excluded IDs:", result)
        result = result.filter(commodity => !excludedIds.includes(commodity.id))
        return result.sort((a, b) => b.refined.price_sell - a.refined.price_sell)
    }

    useEffect(() => {
        Promise.all([
            fetch(API_BASE_URL + API_ENDPOINTS.minerals).then(res => res.json()),
            fetch(API_UEX_BASE_URL + UEX_API_ENDPOINTS.commoditiesPricesAll).then(res => res.json()),
            fetch(API_UEX_BASE_URL + UEX_API_ENDPOINTS.commoditiesRawPricesAll).then(res => res.json()),
        ]).then(([mineralsData, commoditiesPricesData, commoditiesRawPricesData]) => {
            setMineralsShip(mineralsData.filter((mineral: Mineral) => mineral.type === "Ship"))
            setMineralsFPS(mineralsData.filter((mineral: Mineral) => mineral.type === "FPS"))
            setCommoditiesPrices(filteredCommodities(commoditiesPricesData.data, mineralsData))
            setCommoditiesRawPrices(filteredCommodities(commoditiesRawPricesData.data, mineralsData))
        })
    }, []);

    useEffect(() => {
        if (mineralsShip.length > 0 && mineralsFPS.length > 0 && commoditiesPrices.length > 0 && commoditiesRawPrices.length > 0) {
            // Regroupement par nom de minerai
            const mineralGroups: { [name: string]: { rawPrices: number[], refinedPrices: number[], ids: number[] } } = {};
            commoditiesPrices.forEach(commodity => {
                let name = commodity.commodity_name;
                name = name.replace(/\s*\(Raw\)|\s*\(Ore\)|\s*Raw|\s*Ore|\s*Pressurized/gi, "").trim();
                if (!mineralGroups[name]) {
                    mineralGroups[name] = { rawPrices: [], refinedPrices: [], ids: [] };
                }
                mineralGroups[name].refinedPrices.push(commodity.price_sell);
                mineralGroups[name].ids.push(commodity.id_commodity);
            });
            commoditiesRawPrices.forEach(commodity => {
                let name = commodity.commodity_name;
                name = name.replace(/\s*\(Raw\)|\s*\(Ore\)|\s*Raw|\s*Ore|\s*Pressurized/gi, "").trim();
                if (!mineralGroups[name]) {
                    mineralGroups[name] = { rawPrices: [], refinedPrices: [], ids: [] };
                }
                mineralGroups[name].rawPrices.push(commodity.price_sell);
                mineralGroups[name].ids.push(commodity.id_commodity);
            });

            console.log("Mineral groups before formatting:", mineralGroups)

            const formatted = Object.entries(mineralGroups).map(([name, group]) => {
                return {
                    id: group.ids[0],
                    name,
                    raw: {
                        price_sell: group.rawPrices.length > 0 ? Math.max(...group.rawPrices) : 0,
                    },
                    refined: {
                        price_sell: group.refinedPrices.length > 0 ? Math.max(...group.refinedPrices) : 0,
                    },
                };
            });
            setFormattedCommoditiesShip(filteredCommoditiesByType(formatted, "Ship"));
            setFormattedCommoditiesFPS(filteredCommoditiesByType(formatted, "FPS"));
            setLoading(false);
        }
    }, [mineralsShip, mineralsFPS, commoditiesPrices, commoditiesRawPrices])

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50">
            <Header />
            <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="flex flex-col items-start justify-center">
                    <div className="mb-6 flex items-start gap-3">
                        <TrendingUp className="h-10 w-10 text-cyan-400" />
                        <h1 className="text-3xl font-bold tracking-tight text-cyan-50 sm:text-4xl" suppressHydrationWarning>
                            {t("marketPrices.title")}
                        </h1>
                    </div>
                    <div
                        className="mt-6 rounded-xl w-full border border-cyan-800 bg-gradient-to-br from-slate-900/80 to-cyan-950/80 p-5 shadow-lg flex items-center gap-3"
                        style={{ backdropFilter: 'blur(4px)' }}
                    >
                        <span className="text-cyan-100 text-xs font-medium tracking-wide" suppressHydrationWarning>{t("marketPrices.infoZone")}</span>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center rounded-lg border border-slate-800 bg-slate-900/30 py-16 w-full max-w-3xl mx-auto mt-8">
                            <TrendingUp className="mb-4 h-12 w-12 text-slate-700 animate-spin" />
                            <p className="text-lg text-slate-400" suppressHydrationWarning>{t("marketPrices.loading")}</p>
                        </div>
                    ) : (
                        <>
                            <div className="w-full mt-8 flex flex-col gap-4">
                                <h2 className="text-xl font-bold text-cyan-200 mb-2 text-left w-full">{t("marketPrices.shipMinerals.title")}</h2>
                                <p className="text-slate-400 mb-8" suppressHydrationWarning>
                                    {t("marketPrices.shipMinerals.description")}
                                </p>
                                <div className="overflow-x-auto w-full md:w-1/2 mx-auto rounded-xl shadow-lg border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-md mb-8">
                                    <table className="w-full table-auto border-collapse text-left">
                                        <thead>
                                            <tr className="bg-slate-900/80">
                                                <th className="px-6 py-4 text-cyan-300 font-semibold text-xs md:text-sm border border-slate-700 bg-slate-900 sticky left-0 z-10" style={{ minWidth: '10rem', maxWidth: '10rem', width: '10rem' }}>{t("marketPrices.shipMinerals.mineral")}</th>
                                                <th className="px-6 py-4 text-cyan-300 font-semibold text-xs md:text-sm border border-slate-700 text-center">{t("marketPrices.shipMinerals.maxRawPrice")}</th>
                                                <th className="px-6 py-4 text-cyan-300 font-semibold text-xs md:text-sm border border-slate-700 text-center">{t("marketPrices.shipMinerals.maxRefinedPrice")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formattedCommoditiesShip.map((commodity, idx) => (
                                                <tr key={commodity.id} className={`transition-colors duration-200 ${idx % 2 === 0 ? "bg-slate-950/70" : "bg-slate-900/60"} hover:bg-cyan-950/40 hover:shadow-md`}>
                                                    <td className="px-6 py-4 border border-slate-700 font-medium text-cyan-100 text-xs md:text-sm bg-slate-950 sticky left-0 z-10" style={{ minWidth: '10rem', maxWidth: '10rem', width: '10rem', backgroundColor: '#0f172a' }}>{commodity.name}</td>
                                                    <td className="px-6 py-4 border border-slate-700 font-semibold text-xs md:text-sm text-center text-cyan-200">{commodity.raw.price_sell.toLocaleString()} <span className="device-font">aUEC</span></td>
                                                    <td className="px-6 py-4 border border-slate-700 font-semibold text-xs md:text-sm text-center text-cyan-200">{commodity.refined.price_sell.toLocaleString()} <span className="device-font">aUEC</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <h2 className="text-xl font-bold text-cyan-200 mb-2 text-left w-full">{t("marketPrices.fpsMinerals.title")}</h2>
                                <p className="text-slate-400 mb-8" suppressHydrationWarning>
                                    {t("marketPrices.fpsMinerals.description")}
                                </p>
                                <div className="overflow-x-auto w-full md:w-1/2 mx-auto rounded-xl shadow-lg border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-md">
                                    <table className="w-full table-auto border-collapse text-left">
                                        <thead>
                                            <tr className="bg-slate-900/80">
                                                <th className="px-6 py-4 text-cyan-300 font-semibold text-xs md:text-sm border border-slate-700 bg-slate-900 sticky left-0 z-10" style={{ minWidth: '10rem', maxWidth: '10rem', width: '10rem' }}>{t("marketPrices.fpsMinerals.mineral")}</th>
                                                <th className="px-6 py-4 text-cyan-300 font-semibold text-xs md:text-sm border border-slate-700 text-center">{t("marketPrices.fpsMinerals.singleGemPrice")}</th>
                                                <th className="px-6 py-4 text-cyan-300 font-semibold text-xs md:text-sm border border-slate-700 text-center">{t("marketPrices.fpsMinerals.oneScuPrice")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formattedCommoditiesFPS.map((commodity, idx) => (
                                                <tr key={commodity.id} className={`transition-colors duration-200 ${idx % 2 === 0 ? "bg-slate-950/70" : "bg-slate-900/60"} hover:bg-cyan-950/40 hover:shadow-md`}>
                                                    <td className="px-6 py-4 border border-slate-700 font-medium text-cyan-100 text-xs md:text-sm bg-slate-950 sticky left-0 z-10" style={{ minWidth: '10rem', maxWidth: '10rem', width: '10rem', backgroundColor: '#0f172a' }}>{commodity.name}</td>
                                                    <td className="px-6 py-4 border border-slate-700 font-semibold text-xs md:text-sm text-center text-cyan-200">{singleGemPrice(commodity.refined.price_sell).toLocaleString()} <span className="device-font">aUEC</span></td>
                                                    <td className="px-6 py-4 border border-slate-700 font-semibold text-xs md:text-sm text-center text-cyan-200">{commodity.refined.price_sell.toLocaleString()} <span className="device-font">aUEC</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    )
}