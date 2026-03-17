"use client"

import { Header } from "@/components/Header"
import { useTranslation } from "react-i18next"
import { Factory } from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import { API_UEX_BASE_URL, UEX_API_ENDPOINTS } from "@/lib/api-endpoints"
import { RefineryMethod, RefineryRatingCost, RefineryRatingSpeed, RefineryRatingYield, RefineryYield } from "@/models/Refinery"

function getRatingColor(rating: number) {
    switch (rating) {
        case 1:
            return "text-red-400";
        case 2:
            return "text-orange-400";
        case 3:
            return "text-green-400";
        default:
            return "";
    }
}

function formatMineralName(name: string) {
    const keywordsToRemove = ["(Ore)", "(Raw)", "Raw", "Ore"];
    keywordsToRemove.forEach(keyword => {
        name = name.replace(keyword, "").trim();
    });
    return name;
}

export default function refinery() {
    const { t } = useTranslation()

    const [refineriesMethods, setRefineriesMethods] = useState<RefineryMethod[]>([] as RefineryMethod[]);
    const [refineriesYields, setRefineriesYields] = useState<RefineryYield[]>([] as RefineryYield[]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetch(API_UEX_BASE_URL + UEX_API_ENDPOINTS.refineriesMethods).then(res => res.json()),
            fetch(API_UEX_BASE_URL + UEX_API_ENDPOINTS.refineriesYields).then(res => res.json())
        ]).then(([methodsJson, yieldsJson]) => {
            setRefineriesMethods(methodsJson.data);
            setRefineriesYields(yieldsJson.data);
        }).finally(() => setLoading(false));
    }, []);

    const formattedYields = useMemo(() => {
        if (!refineriesYields || refineriesYields.length === 0) return [];
        return refineriesYields.map(yieldData => ({
            id: yieldData.id,
            name: yieldData.space_station_name || yieldData.terminal_name || "Unknown",
            mineral: formatMineralName(yieldData.commodity_name),
            yield: yieldData.value,
            system: yieldData.star_system_name,
        }));
    }, [refineriesYields]);

    const uniqueMinerals = useMemo(() => {
        const mineralsSet = new Set<string>();
        refineriesYields.forEach(yieldData => {
            if (yieldData.commodity_name && (yieldData.commodity_name.includes('Ore') || yieldData.commodity_name.includes('Raw'))) {
                mineralsSet.add(formatMineralName(yieldData.commodity_name));
            }
        });
        return Array.from(mineralsSet).sort();
    }, [refineriesYields]);

    const uniqueLocations = useMemo(() => {
        const locationsSet = new Set<string>();
        refineriesYields.forEach(yieldData => {
            const locationName = yieldData.space_station_name || yieldData.terminal_name || "Unknown";
            if (locationName) {
                locationsSet.add(locationName);
            }
        });
        return Array.from(locationsSet).sort();
    }, [refineriesYields]);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50">
            <Header />
            <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="flex flex-col items-start justify-center">
                    <div className="mb-6 flex items-start gap-3">
                        <Factory className="h-10 w-10 text-cyan-400" />
                        <h1 className="text-3xl font-bold tracking-tight text-cyan-50 sm:text-4xl" suppressHydrationWarning>
                            {t("refinery.title")}
                        </h1>
                    </div>
                    <div
                        className="mt-6 rounded-xl w-full border border-cyan-800 bg-gradient-to-br from-slate-900/80 to-cyan-950/80 p-5 shadow-lg flex items-center gap-3"
                        style={{ backdropFilter: 'blur(4px)' }}
                    >
                        <span className="text-cyan-100 text-xs font-medium tracking-wide" suppressHydrationWarning>{t("refinery.infoZone")}</span>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center rounded-lg border border-slate-800 bg-slate-900/30 py-16 w-full max-w-3xl mx-auto mt-8">
                            <Factory className="mb-4 h-12 w-12 text-slate-700 animate-spin" />
                            <p className="text-lg text-slate-400" suppressHydrationWarning>{t("refinery.loading") || "Chargement des données..."}</p>
                        </div>
                    ) : (
                        <>
                            <div className="w-full mt-8 flex flex-col gap-4">
                                <h2 className="text-xl font-bold text-cyan-200 mb-2 text-left w-full" suppressHydrationWarning>{t("refinery.yieldTable.bonusesTitle")}</h2>
                                <p className="text-slate-400 mb-8" suppressHydrationWarning>
                                    {t("refinery.yieldTable.description")}
                                </p>
                                <div className="flex justify-center w-full">
                                    <div className="overflow-x-auto w-full rounded-xl shadow-lg border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-md">
                                        <table className="w-full table-auto border-collapse text-left">
                                            <thead>
                                                <tr className="bg-slate-900/80">
                                                    <th
                                                        className="px-6 py-4 text-cyan-300 font-semibold text-sm border border-slate-700 bg-slate-900 sticky left-0 z-10"
                                                        style={{ minWidth: "10rem", maxWidth: "10rem", width: "10rem" }}
                                                        suppressHydrationWarning
                                                    >
                                                        {t("refinery.yieldTable.mineral")}
                                                    </th>
                                                    {uniqueLocations.length > 0 && uniqueLocations.map((location, idx) => (
                                                        <th
                                                            key={idx}
                                                            className="px-6 py-4 text-cyan-300 font-semibold text-sm border border-slate-700 text-center"
                                                            style={{ minWidth: "10rem", maxWidth: "10rem", width: "10rem" }}
                                                            suppressHydrationWarning
                                                        >
                                                            {location}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {uniqueMinerals.length > 0 && uniqueMinerals.map((mineral, idx) => (
                                                    <tr
                                                        key={mineral}
                                                        className={
                                                            `transition-colors duration-200 ${idx % 2 === 0 ? "bg-slate-950/70" : "bg-slate-900/60"} hover:bg-cyan-950/40 hover:shadow-md`
                                                        }
                                                    >
                                                        <td
                                                            className="px-6 py-4 border border-slate-700 font-medium text-cyan-100 text-sm bg-slate-950 sticky left-0 z-10"
                                                            style={{ minWidth: "10rem", maxWidth: "10rem", width: "10rem", backgroundColor: '#0f172a' }}
                                                        >
                                                            {mineral}
                                                        </td>
                                                        {
                                                            uniqueLocations.length > 0 && uniqueLocations.map((location, locIdx) => {
                                                                const yieldData = formattedYields.find(yieldEntry => {
                                                                    const locationName = yieldEntry.name;
                                                                    return locationName === location && yieldEntry.mineral === mineral;
                                                                });
                                                                let cellColor = "text-slate-600";
                                                                if (yieldData) {
                                                                    if (yieldData.yield < 0) {
                                                                        cellColor = "text-red-400";
                                                                    } else {
                                                                        cellColor = "text-green-400";
                                                                    }
                                                                }
                                                                return (
                                                                    <td key={locIdx} className={`px-6 py-4 border border-slate-700 font-semibold text-sm text-center ${cellColor}`} suppressHydrationWarning>
                                                                        {yieldData ? yieldData.yield : "-"}
                                                                    </td>
                                                                )
                                                            })
                                                        }
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full mt-20 flex flex-col gap-4">
                                <h2 className="text-xl font-bold text-cyan-200 mb-2 text-left w-full" suppressHydrationWarning>{t("refinery.methodTable.methodsTitle")}</h2>
                                <p className="text-slate-400 mb-8" suppressHydrationWarning>
                                    {t("refinery.methodTable.description")}
                                </p>
                                <div className="flex justify-center w-full">
                                    <div className="overflow-x-auto w-full rounded-xl shadow-lg border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-md mt-0 lg:mx-20">
                                        <table className="w-full table-auto border-collapse text-left">
                                            <thead>
                                                <tr className="bg-slate-900/80">
                                                    <th className="px-6 py-4 text-cyan-300 font-semibold text-sm border border-slate-700" suppressHydrationWarning>{t("refinery.methodTable.methodName")}</th>
                                                    <th className="px-6 py-4 text-cyan-300 font-semibold text-sm border border-slate-700 text-center" suppressHydrationWarning>{t("refinery.methodTable.yield.name")}</th>
                                                    <th className="px-6 py-4 text-cyan-300 font-semibold text-sm border border-slate-700 text-center" suppressHydrationWarning>{t("refinery.methodTable.cost.name")}</th>
                                                    <th className="px-6 py-4 text-cyan-300 font-semibold text-sm border border-slate-700 text-center" suppressHydrationWarning>{t("refinery.methodTable.speed.name")}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {refineriesMethods && refineriesMethods.map((method: RefineryMethod, idx: number) => (
                                                    <tr
                                                        key={method.id}
                                                        className={
                                                            `transition-colors duration-200 ${idx % 2 === 0 ? "bg-slate-950/70" : "bg-slate-900/60"} hover:bg-cyan-950/40 hover:shadow-md`
                                                        }
                                                    >
                                                        <td className="px-6 py-4 border border-slate-700 font-medium text-cyan-100 text-sm">{method.name}</td>
                                                        <td className={`px-6 py-4 border border-slate-700 font-semibold text-sm text-center ${getRatingColor(method.rating_yield)}`} suppressHydrationWarning>
                                                            {t(RefineryRatingYield[method.rating_yield as keyof typeof RefineryRatingYield])}
                                                        </td>
                                                        <td className={`px-6 py-4 border border-slate-700 font-semibold text-sm text-center ${getRatingColor(method.rating_cost)}`} suppressHydrationWarning>
                                                            {t(RefineryRatingCost[method.rating_cost as keyof typeof RefineryRatingCost])}
                                                        </td>
                                                        <td className={`px-6 py-4 border border-slate-700 font-semibold text-sm text-center ${getRatingColor(method.rating_speed)}`} suppressHydrationWarning>
                                                            {t(RefineryRatingSpeed[method.rating_speed as keyof typeof RefineryRatingSpeed])}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    )
}