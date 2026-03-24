"use client"

import { Header } from "@/components/Header/Header"
import { RefineryFilter } from "@/components/Filters/RefineryFilter"
import { RefinerySingleResult } from "@/components/RefinerySingleResult"
import { API_UEX_BASE_URL, UEX_API_ENDPOINTS } from "@/lib/api-endpoints"
import { RefineryMethod, RefineryRatingCost, RefineryRatingSpeed, RefineryRatingYield, RefineryYield } from "@/models/Refinery"
import { Factory, ChevronUp, ChevronDown } from "lucide-react"

const compareValues = (a: any, b: any, direction: 'asc' | 'desc') => {
    const isEmpty = (v: any) => v === undefined || v === null || v === '';
    if (isEmpty(a) && isEmpty(b)) return 0;
    if (isEmpty(a)) return 1;
    if (isEmpty(b)) return -1;
    if (!isNaN(Number(a)) && !isNaN(Number(b))) {
        return direction === 'asc' ? Number(a) - Number(b) : Number(b) - Number(a);
    }
    return direction === 'asc'
        ? String(a).localeCompare(String(b))
        : String(b).localeCompare(String(a));
};
import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { Loader } from "@/components/Loader"

// Function to get color class based on rating (1 = red, 2 = orange, 3 = green)
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

function mustBeFormatted(name: string) {
    return name.includes("(Ore)") || name.includes("(Raw)") || name.includes("Raw") || name.includes("Ore");
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
        // if mustBeFormatted === false, dont add the data
        return refineriesYields.map(yieldData => {
            if (!mustBeFormatted(yieldData.commodity_name)) return null;
            return {
                id: yieldData.id,
                name: yieldData.space_station_name || yieldData.terminal_name || "Unknown",
                mineral: formatMineralName(yieldData.commodity_name),
                yield: yieldData.value,
                system: yieldData.star_system_name,
            };
        }).filter(Boolean);
    }, [refineriesYields]);

    // State for filters
    const [selectedMineral, setSelectedMineral] = useState("");
    const [selectedLocation, setSelectedLocation] = useState("");

    const [sortColumn, setSortColumn] = useState<string>("");
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | 'none'>("none");
    const [initialOrder, setInitialOrder] = useState<any[]>([]);

    const filteredYields = useMemo(() => {
        let yields = formattedYields.filter(yieldData => {
            const mineralMatch = selectedMineral ? yieldData!.mineral === selectedMineral : true;
            const locationMatch = selectedLocation ? yieldData!.name === selectedLocation : true;
            return mineralMatch && locationMatch;
        });
        if (sortColumn && sortDirection !== 'none') {
            yields = [...yields].sort((a, b) => {
                if (sortColumn === 'mineral') {
                    return compareValues(a?.mineral, b?.mineral, sortDirection as 'asc' | 'desc');
                } else {
                    const aVal = a?.name === sortColumn ? a?.yield : null;
                    const bVal = b?.name === sortColumn ? b?.yield : null;
                    return compareValues(aVal, bVal, sortDirection as 'asc' | 'desc');
                }
            });
        } else if (sortDirection === 'none' && initialOrder.length > 0) {
            yields = initialOrder.filter(yieldData => {
                const mineralMatch = selectedMineral ? yieldData!.mineral === selectedMineral : true;
                const locationMatch = selectedLocation ? yieldData!.name === selectedLocation : true;
                return mineralMatch && locationMatch;
            });
        }
        return yields;
    }, [formattedYields, selectedMineral, selectedLocation, sortColumn, sortDirection, initialOrder]);

    useEffect(() => {
        setInitialOrder(formattedYields);
    }, [formattedYields]);


    // For the table, we want the unique minerals and locations filtered (after declaring the uniques)
    const uniqueMinerals = useMemo(() => {
        const mineralsSet = new Set<string>();
        refineriesYields.forEach(yieldData => {
            if (yieldData.commodity_name && mustBeFormatted(yieldData.commodity_name)) {
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

    const filteredMinerals = useMemo(() => {
        const mineralsSet = new Set<string>();
        filteredYields.forEach(yieldData => mineralsSet.add(yieldData!.mineral));
        let mineralsArr = Array.from(mineralsSet);
        if (sortColumn && sortDirection !== 'none') {
            mineralsArr = [...mineralsArr].sort((a, b) => {
                if (sortColumn === 'mineral') {
                    return compareValues(a, b, sortDirection as 'asc' | 'desc');
                } else {
                    const aYield = filteredYields.find(y => y!.mineral === a && y!.name === sortColumn)?.yield;
                    const bYield = filteredYields.find(y => y!.mineral === b && y!.name === sortColumn)?.yield;
                    return compareValues(aYield, bYield, sortDirection as 'asc' | 'desc');
                }
            });
        } else if (sortDirection === 'none' && initialOrder.length > 0) {
            const initialMinerals = [] as string[];
            initialOrder.forEach(yieldData => {
                if (
                    (!selectedMineral || yieldData!.mineral === selectedMineral) &&
                    (!selectedLocation || yieldData!.name === selectedLocation)
                ) {
                    if (!initialMinerals.includes(yieldData!.mineral)) {
                        initialMinerals.push(yieldData!.mineral);
                    }
                }
            });
            mineralsArr = initialMinerals;
        } else {
            mineralsArr = mineralsArr.sort();
        }
        return mineralsArr;
    }, [filteredYields, sortColumn, sortDirection, initialOrder, selectedMineral, selectedLocation]);

    const filteredLocations = useMemo(() => {
        const locationsSet = new Set<string>();
        filteredYields.forEach(yieldData => locationsSet.add(yieldData!.name));
        return Array.from(locationsSet).sort();
    }, [filteredYields]);



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
                        <Loader loaderText={t("refinery.loading")} />
                    ) : (
                        <>
                            <div className="w-full mt-8 flex flex-col gap-4">
                                <h2 className="text-xl font-bold text-cyan-200 mb-2 text-left w-full" suppressHydrationWarning>{t("refinery.yieldTable.bonusesTitle")}</h2>
                                <p className="text-slate-400 mb-8" suppressHydrationWarning>
                                    {t("refinery.yieldTable.description")}
                                </p>
                                <RefineryFilter
                                    minerals={uniqueMinerals}
                                    locations={uniqueLocations}
                                    selectedMineral={selectedMineral}
                                    selectedLocation={selectedLocation}
                                    onMineralChange={setSelectedMineral}
                                    onLocationChange={setSelectedLocation}
                                />
                                {(selectedMineral && selectedLocation && filteredYields.length === 0) ? (
                                    <RefinerySingleResult mineral={selectedMineral} location={selectedLocation} value={0} />
                                ) : filteredMinerals.length === 1 && filteredLocations.length === 1 ? (
                                    (() => {
                                        const yieldData = filteredYields.find(y => y!.mineral === selectedMineral && y!.name === selectedLocation);
                                        const value = yieldData ? yieldData.yield : null;
                                        return <RefinerySingleResult mineral={selectedMineral} location={selectedLocation} value={value} />;
                                    })()
                                ) : (
                                    <div className={`overflow-x-auto rounded-xl shadow-lg border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-md ${filteredLocations.length === 1 ? 'w-full md:w-1/2 mx-auto' : 'w-full'}`}>
                                        <table className="w-full table-auto border-collapse text-left">
                                            <thead>
                                                <tr className="bg-slate-900/80">
                                                    <th
                                                        className="px-6 py-4 text-cyan-300 font-semibold text-xs md:text-sm border border-slate-700 bg-slate-900 sticky left-0 z-10 cursor-pointer select-none"
                                                        style={{ minWidth: "10rem", maxWidth: "10rem", width: "10rem" }}
                                                        onClick={() => {
                                                            if (sortColumn !== 'mineral') {
                                                                setSortColumn('mineral');
                                                                setSortDirection('asc');
                                                            } else if (sortDirection === 'asc') {
                                                                setSortDirection('desc');
                                                            } else if (sortDirection === 'desc') {
                                                                setSortDirection('none');
                                                                setSortColumn("");
                                                            } else {
                                                                setSortDirection('asc');
                                                            }
                                                        }}
                                                        suppressHydrationWarning
                                                    >
                                                        <span className="flex items-center gap-1 justify-center">
                                                            {t("refinery.yieldTable.mineral")}
                                                            {sortColumn === 'mineral' && sortDirection !== 'none' && (
                                                                sortDirection === 'asc' ? <ChevronUp className="inline w-4 h-4 text-cyan-400" /> : <ChevronDown className="inline w-4 h-4 text-cyan-400" />
                                                            )}
                                                        </span>
                                                    </th>
                                                    {filteredLocations.length > 0 && filteredLocations.map((location, idx) => (
                                                        <th
                                                            key={idx}
                                                            className="px-6 py-4 text-cyan-300 font-semibold text-xs md:text-sm border border-slate-700 text-center cursor-pointer select-none"
                                                            style={{ minWidth: "10rem", maxWidth: "10rem", width: "10rem" }}
                                                            onClick={() => {
                                                                if (sortColumn !== location) {
                                                                    setSortColumn(location);
                                                                    setSortDirection('asc');
                                                                } else if (sortDirection === 'asc') {
                                                                    setSortDirection('desc');
                                                                } else if (sortDirection === 'desc') {
                                                                    setSortDirection('none');
                                                                    setSortColumn("");
                                                                } else {
                                                                    setSortDirection('asc');
                                                                }
                                                            }}
                                                            suppressHydrationWarning
                                                        >
                                                            <span className="flex items-center gap-1 justify-center">
                                                                {location}
                                                                {sortColumn === location && sortDirection !== 'none' && (
                                                                    sortDirection === 'asc' ? <ChevronUp className="inline w-4 h-4 text-cyan-400" /> : <ChevronDown className="inline w-4 h-4 text-cyan-400" />
                                                                )}
                                                            </span>
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredMinerals.length > 0 && filteredMinerals.map((mineral, idx) => (
                                                    <tr
                                                        key={mineral}
                                                        className={
                                                            `transition-colors duration-200 ${idx % 2 === 0 ? "bg-slate-950/70" : "bg-slate-900/60"} hover:bg-cyan-950/40 hover:shadow-md`
                                                        }
                                                    >
                                                        <td
                                                            className="px-6 py-4 border border-slate-700 font-medium text-cyan-100 text-xs md:text-sm bg-slate-950 sticky left-0 z-10"
                                                            style={{ minWidth: "10rem", maxWidth: "10rem", width: "10rem", backgroundColor: '#0f172a' }}
                                                        >
                                                            {mineral}
                                                        </td>
                                                        {
                                                            filteredLocations.length > 0 && filteredLocations.map((location, locIdx) => {
                                                                const yieldData = filteredYields.find(yieldEntry => {
                                                                    const locationName = yieldEntry!.name;
                                                                    return locationName === location && yieldEntry!.mineral === mineral;
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
                                                                    <td key={locIdx} className={`px-6 py-4 border border-slate-700 font-semibold text-xs md:text-sm text-center ${cellColor}`} suppressHydrationWarning>
                                                                        {yieldData ? yieldData.yield + '%' : "-"}
                                                                    </td>
                                                                )
                                                            })
                                                        }
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
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
                                                    <th className="px-6 py-4 text-cyan-300 font-semibold text-xs md:text-sm border border-slate-700" suppressHydrationWarning>{t("refinery.methodTable.methodName")}</th>
                                                    <th className="px-6 py-4 text-cyan-300 font-semibold text-xs md:text-sm border border-slate-700 text-center" suppressHydrationWarning>{t("refinery.methodTable.yield.name")}</th>
                                                    <th className="px-6 py-4 text-cyan-300 font-semibold text-xs md:text-sm border border-slate-700 text-center" suppressHydrationWarning>{t("refinery.methodTable.cost.name")}</th>
                                                    <th className="px-6 py-4 text-cyan-300 font-semibold text-xs md:text-sm border border-slate-700 text-center" suppressHydrationWarning>{t("refinery.methodTable.speed.name")}</th>
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
                                                        <td className="px-6 py-4 border border-slate-700 font-medium text-cyan-100 text-xs md:text-sm">{method.name}</td>
                                                        <td className={`px-6 py-4 border border-slate-700 font-semibold text-xs md:text-sm text-center ${getRatingColor(method.rating_yield)}`} suppressHydrationWarning>
                                                            {t(RefineryRatingYield[method.rating_yield as keyof typeof RefineryRatingYield])}
                                                        </td>
                                                        <td className={`px-6 py-4 border border-slate-700 font-semibold text-xs md:text-sm text-center ${getRatingColor(method.rating_cost)}`} suppressHydrationWarning>
                                                            {t(RefineryRatingCost[method.rating_cost as keyof typeof RefineryRatingCost])}
                                                        </td>
                                                        <td className={`px-6 py-4 border border-slate-700 font-semibold text-xs md:text-sm text-center ${getRatingColor(method.rating_speed)}`} suppressHydrationWarning>
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