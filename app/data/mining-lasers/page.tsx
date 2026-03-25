"use client"

import { Header } from "@/components/Header/Header";
import { LaserModuleGadgetFilter } from "@/components/Filters/LaserModuleGadgetFilter";
import { API_UEX_BASE_URL, UEX_API_ENDPOINTS, UEX_API_ITEM_CATEGORIES } from "@/lib/api-endpoints";
import { MiningLaser, MiningLaserAttributes, miningLaserAttributeType, MiningLaserPrices, MiningLaserRawData } from "@/models/MiningLaser";
import { Drill, ChevronUp, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader } from "@/components/Loader";


// Function to get color class based on value (positive = green, negative = red, zero or non-numeric = gray), with optional inverse coloring
const getColorForValue = (val: string | number | null | undefined, isInverse: boolean = false) => {
    if (val === null || val === undefined || val === "") return "text-gray-400";
    const num = typeof val === "string" ? parseFloat(val.replace(/[^-\d.]/g, "")) : val;
    if (isNaN(num)) return "text-gray-400";
    if (num > 0) return isInverse ? "text-red-400" : "text-green-400";
    if (num < 0) return isInverse ? "text-green-400" : "text-red-400";
    return "text-gray-400";
};

// Utilitaire pour comparer deux valeurs (string ou number), en ignorant les vides (toujours à la fin)
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

export default function MiningLasersPage() {
    const { t, i18n } = useTranslation();

    const [miningLasersRawData, setMiningLasersRawData] = useState<MiningLaserRawData[]>([]);
    const [formattedMiningLasers, setFormattedMiningLasers] = useState<any[]>([]);
    const [allColumns, setAllColumns] = useState<string[]>([]);
    // Filters
    const [filterName, setFilterName] = useState("");
    const [filterSize, setFilterSize] = useState("");
    const [filterLocation, setFilterLocation] = useState("");
    // Tri
    const [sortColumn, setSortColumn] = useState<string>("");
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | 'none'>("none");
    const [initialOrder, setInitialOrder] = useState<any[]>([]);
    // Loader
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(API_UEX_BASE_URL + UEX_API_ENDPOINTS.itemsCategory + UEX_API_ITEM_CATEGORIES.miningLasers)
            .then(res => res.json())
            .then(result => {
                setMiningLasersRawData(result.data || []);
            })
    }, []);

    useEffect(() => {
        if (miningLasersRawData.length > 0) {
            setLoading(true);
            const miningLasersPromises = miningLasersRawData.map(async (laser) => {
                const miningLaser: MiningLaser = {} as MiningLaser;
                miningLaser.id = laser.id;
                miningLaser.name = laser.name.replace("Mining Laser", "").trim();
                miningLaser.locations = [];

                // Fetch prices
                const pricesRes = await fetch(API_UEX_BASE_URL + UEX_API_ENDPOINTS.itemsPrices + laser.id);
                const pricesResult: { data: MiningLaserPrices[] } = await pricesRes.json();
                pricesResult.data.forEach(attr => {
                    miningLaser.locations.push(attr.terminal_name || "");
                });

                // Fetch attributes
                const attributesRes = await fetch(API_UEX_BASE_URL + UEX_API_ENDPOINTS.itemsAttributes + laser.id);
                const attributesResult: { data: MiningLaserAttributes[] } = await attributesRes.json();
                attributesResult.data.forEach(attr => {
                    Object.keys(miningLaserAttributeType).forEach(key => {
                        if (attr.attribute_name === miningLaserAttributeType[key as keyof typeof miningLaserAttributeType]) {
                            (miningLaser as any)[key] = attr.value + (attr.unit ? `${attr.unit}` : "");
                        }
                    });
                });

                miningLaser.locations = Array.from(new Set(miningLaser.locations));
                const { newMin, newMax } = getMinMaxPower(miningLaser);
                miningLaser.min_power = newMin;
                miningLaser.max_power = newMax;
                miningLaser.slots = miningLaser.slots || "0";
                miningLaser.size = miningLaser.size === 'S0' ? '0' : miningLaser.size
                return miningLaser;
            });

            Promise.all(miningLasersPromises).then((lasers) => {
                const sorted = lasers.sort((a, b) => a.name.localeCompare(b.name));
                setFormattedMiningLasers(sorted);
                setInitialOrder(sorted);
                setLoading(false);
            });
        }
    }, [miningLasersRawData]);

    useEffect(() => {
        // cols names with i18n
        const columns = [
            t("miningLasers.table.laser"),
            t("miningLasers.table.size"),
            t("miningLasers.table.slots"),
            t("miningLasers.table.optimalRange"),
            t("miningLasers.table.maxRange"),
            t("miningLasers.table.minPower"),
            t("miningLasers.table.maxPower"),
            t("miningLasers.table.extractionPower"),
            t("miningLasers.table.resistance"),
            t("miningLasers.table.instability"),
            t("miningLasers.table.optimalChargeRate"),
            t("miningLasers.table.optimalChargeWindow"),
            t("miningLasers.table.inertMaterials"),
        ];
        // add unique locations as columns
        const uniqueLocations = new Set<string>();
        formattedMiningLasers.forEach(laser => {
            laser.locations.forEach((location: string) => uniqueLocations.add(location));
        });
        const locationColumns = Array.from(uniqueLocations).map(location => location);
        const allColumns = [...columns, ...locationColumns];
        setAllColumns(allColumns);
    }, [formattedMiningLasers, i18n.language]);

    // Preparation of unique values for filters
    const laserNames = Array.from(new Set(formattedMiningLasers.map(l => l.name))).sort();
    const sizes = Array.from(new Set(formattedMiningLasers.map(l => l.size).filter((v): v is string => typeof v === 'string'))).sort();
    const locations = Array.from(new Set(formattedMiningLasers.flatMap(l => l.locations))).sort();


    // Applying filters
    let filteredLasers = formattedMiningLasers.filter(laser => {
        const matchName = !filterName || laser.name === filterName;
        const matchSize = !filterSize || laser.size === filterSize;
        const matchLocation = !filterLocation || laser.locations.includes(filterLocation);
        return matchName && matchSize && matchLocation;
    });

    if (sortColumn && sortDirection !== 'none') {
        filteredLasers = [...filteredLasers].sort((a, b) => {
            if (allColumns.indexOf(sortColumn) > 12) {
                const loc = sortColumn;
                const aHas = a.locations.includes(loc) ? 1 : 0;
                const bHas = b.locations.includes(loc) ? 1 : 0;
                return sortDirection === 'asc' ? aHas - bHas : bHas - aHas;
            }
            const colKeyMap = [
                'name', 'size', 'slots', 'optimal_range', 'max_range', 'min_power', 'max_power',
                'extract_power', 'resistance', 'instability', 'optimal_charge_rate', 'optimal_charge_window', 'inert_materials'
            ];
            const idx = allColumns.indexOf(sortColumn);
            const key = colKeyMap[idx] || sortColumn;
            return compareValues(a[key], b[key], sortDirection as 'asc' | 'desc');
        });
    } else if (sortDirection === 'none' && initialOrder.length > 0) {
        filteredLasers = initialOrder.filter(laser => {
            const matchName = !filterName || laser.name === filterName;
            const matchSize = !filterSize || laser.size === filterSize;
            const matchLocation = !filterLocation || laser.locations.includes(filterLocation);
            return matchName && matchSize && matchLocation;
        });
    }

    const getMinMaxPower = (miningLaser: MiningLaser) => {
        const sliptedValue = miningLaser?.min_power?.split('-');
        const minPower = sliptedValue ? sliptedValue[0] : "";
        const maxPower = sliptedValue ? sliptedValue[1] : "";
        return { newMin: minPower, newMax: maxPower };
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50">
            <Header />
            <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="flex flex-col items-start justify-center">
                    <div className="mb-6 flex items-start gap-3">
                        <Drill className="h-10 w-10 text-cyan-400" />
                        <h1 className="text-3xl font-bold tracking-tight text-cyan-50 sm:text-4xl" suppressHydrationWarning>
                            {t("miningLasers.title")}
                        </h1>
                    </div>
                    <div
                        className="mt-6 rounded-xl w-full border border-cyan-800 bg-gradient-to-br from-slate-900/80 to-cyan-950/80 p-5 shadow-lg flex items-center gap-3"
                        style={{ backdropFilter: 'blur(4px)' }}
                    >
                        <span className="text-cyan-100 text-xs font-medium tracking-wide" suppressHydrationWarning>{t("miningLasers.infoZone")}</span>
                    </div>

                    {loading ? (
                        <Loader loaderText={t("miningLasers.loading")} />
                    ) : (
                        <div className="w-full mt-8 flex flex-col gap-4">
                            {/* Filters */}
                            <LaserModuleGadgetFilter
                                laserNames={laserNames}
                                sizes={sizes}
                                locations={locations}
                                selectedName={filterName}
                                selectedSize={filterSize}
                                selectedLocation={filterLocation}
                                onNameChange={setFilterName}
                                onSizeChange={setFilterSize}
                                onLocationChange={setFilterLocation}
                            />
                            {filteredLasers.length === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-lg border border-slate-800 bg-slate-900/30 py-12 w-full max-w-3xl mx-auto mb-8">
                                    <p className="text-lg text-slate-400 text-center" suppressHydrationWarning>{t("miningLasers.noResultForFilter")}</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto w-full mx-auto rounded-xl shadow-lg border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-md mb-8">
                                    <table className="w-full table-auto border-collapse text-left">
                                        <thead>
                                            <tr className="bg-slate-900/80">
                                                {allColumns.map((col, index) => {
                                                    const isSorted = sortColumn === col;
                                                    return (
                                                        <th
                                                            key={index}
                                                            className={
                                                                index === 0
                                                                    ? "px-6 py-4 text-cyan-300 font-semibold text-xs md:text-sm border border-slate-700 bg-slate-900 sticky left-0 z-10 cursor-pointer select-none"
                                                                    : "px-6 py-4 text-cyan-300 font-semibold md:text-sm border border-slate-700 bg-slate-900 text-center cursor-pointer select-none"
                                                            }
                                                            style={
                                                                index === 0
                                                                    ? { minWidth: '10rem', maxWidth: '16rem', width: '10rem' }
                                                                    : {
                                                                        minWidth: col.length > 10 ? '12rem' : col.length + 'rem',
                                                                        width: col.length > 10 ? '12rem' : col.length + 'rem',
                                                                        fontSize: '0.65rem'
                                                                    }
                                                            }
                                                            onClick={() => {
                                                                if (sortColumn !== col) {
                                                                    setSortColumn(col);
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
                                                                {col}
                                                                {isSorted && sortDirection !== 'none' && (
                                                                    sortDirection === 'asc' ? <ChevronUp className="inline w-4 h-4 text-cyan-400" /> : <ChevronDown className="inline w-4 h-4 text-cyan-400" />
                                                                )}
                                                            </span>
                                                        </th>
                                                    );
                                                })}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredLasers.map((laser, idx) => (
                                                <tr key={idx} className={`transition-colors duration-200 ${idx % 2 === 0 ? "bg-slate-950/70" : "bg-slate-900/60"} hover:bg-cyan-950/40 hover:shadow-md`}>
                                                    <td className={`px-6 py-4 border border-slate-700 font-medium text-cyan-100 text-xs md:text-sm bg-slate-950 sticky left-0 z-10`} style={{ minWidth: '8rem', maxWidth: '12rem', width: '10rem', backgroundColor: '#0f172a' }}>{laser.name}</td>
                                                    <td className={`px-6 py-4 border border-slate-700 font-semibold text-xs md:text-sm text-center text-cyan-200`}>{laser.size}</td>
                                                    <td className={`px-6 py-4 border border-slate-700 font-semibold text-xs md:text-sm text-center text-cyan-200`}>{laser.slots}</td>
                                                    <td className={`px-6 py-4 border border-slate-700 font-semibold text-xs md:text-sm text-center text-cyan-200`}>{laser.optimal_range}</td>
                                                    <td className={`px-6 py-4 border border-slate-700 font-semibold text-xs md:text-sm text-center text-cyan-200`}>{laser.max_range}</td>
                                                    <td className={`px-6 py-4 border border-slate-700 font-semibold text-xs md:text-sm text-center text-cyan-200`}>{laser.min_power}</td>
                                                    <td className={`px-6 py-4 border border-slate-700 font-semibold text-xs md:text-sm text-center text-cyan-200`}>{laser.max_power}</td>
                                                    <td className={`px-6 py-4 border border-slate-700 font-semibold text-xs md:text-sm text-center text-cyan-200`}>{laser.extract_power}</td>
                                                    <td className={`px-6 py-4 border border-slate-700 font-semibold text-xs md:text-sm text-center ${getColorForValue(laser.resistance, true)}`}>{laser.resistance}</td>
                                                    <td className={`px-6 py-4 border border-slate-700 font-semibold text-xs md:text-sm text-center ${getColorForValue(laser.instability, true)}`}>{laser.instability}</td>
                                                    <td className={`px-6 py-4 border border-slate-700 font-semibold text-xs md:text-sm text-center ${getColorForValue(laser.optimal_charge_rate)}`}>{laser.optimal_charge_rate}</td>
                                                    <td className={`px-6 py-4 border border-slate-700 font-semibold text-xs md:text-sm text-center ${getColorForValue(laser.optimal_charge_window)}`}>{laser.optimal_charge_window}</td>
                                                    <td className={`px-6 py-4 border border-slate-700 font-semibold text-xs md:text-sm text-center ${getColorForValue(laser.inert_materials, true)}`}>{laser.inert_materials}</td>
                                                    {allColumns.slice(13).map((location, locIndex) => (
                                                        <td key={locIndex} className="px-6 py-4 border border-slate-700 font-semibold text-xs md:text-sm text-center text-cyan-200">
                                                            {laser.locations.includes(location) ? "✓" : ""}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
