"use client"

import { Header } from "@/components/Header/Header";
import { LaserModuleGadgetFilter } from "@/components/Filters/LaserModuleGadgetFilter";
import { API_UEX_BASE_URL, UEX_API_ENDPOINTS, UEX_API_ITEM_CATEGORIES } from "@/lib/api-endpoints";
import { gadgetAttributeType, moduleAttributeType, type ModuleGadget, type ModuleGadgetAttributes, type ModuleGadgetPrices, type ModuleGadgetRawData } from "@/models/ModuleGadget";
import { LayersPlus, ChevronUp, ChevronDown } from "lucide-react";
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

// Function to get color class based on item type
const getTypeClass = (itemType: string) => {
    switch (itemType) {
        case "Active":
            return "text-yellow-400";
        case "Passive":
            return "text-orange-400";
        case "Gadget":
            return "text-blue-400";
        default:
            return "text-gray-400";
    }
}

export default function ModulesGadgetsPage() {
    const { t, i18n } = useTranslation();

    const [modulesRawData, setModulesRawData] = useState<ModuleGadgetRawData[]>([]);
    const [formattedModules, setFormattedModules] = useState<ModuleGadget[]>([]);
    const [allColumns, setAllColumns] = useState<string[]>([]);
    // Filters
    const [filterName, setFilterName] = useState("");
    const [filterItemType, setFilterItemType] = useState("");
    const [filterLocation, setFilterLocation] = useState("");
    // Tri
    const [sortColumn, setSortColumn] = useState<string>("");
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | 'none'>("none");
    const [initialOrder, setInitialOrder] = useState<ModuleGadget[]>([]);
    // Loader
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetch(API_UEX_BASE_URL + UEX_API_ENDPOINTS.itemsCategory + UEX_API_ITEM_CATEGORIES.gadgets),
            fetch(API_UEX_BASE_URL + UEX_API_ENDPOINTS.itemsCategory + UEX_API_ITEM_CATEGORIES.modules)
        ])
            .then(async ([res28, res30]) => {
                const result28 = await res28.json();
                const result30 = await res30.json();
                const mergedData = [
                    ...((result28.data as ModuleGadgetRawData[]) || []),
                    ...((result30.data as ModuleGadgetRawData[]) || [])
                ];
                setModulesRawData(mergedData);
            });
    }, []);

    useEffect(() => {
        if (modulesRawData.length > 0) {
            setLoading(true);
            const modulesGadgetsPromises = modulesRawData.map(async (module) => {
                const moduleGadget: ModuleGadget = {} as ModuleGadget;
                moduleGadget.id = module.id;
                moduleGadget.name = module.name.replace(/ Module$/, "").replace(/ Gadget$/, "");
                moduleGadget.locations = [];

                // Fetch prices
                const pricesRes = await fetch(API_UEX_BASE_URL + UEX_API_ENDPOINTS.itemsPrices + module.id);
                const pricesResult: { data: ModuleGadgetPrices[] } = await pricesRes.json();
                pricesResult.data.forEach(attr => {
                    moduleGadget.locations.push(attr.terminal_name || "");
                });

                // Fetch attributes
                const attributesRes = await fetch(API_UEX_BASE_URL + UEX_API_ENDPOINTS.itemsAttributes + module.id);
                const attributesResult: { data: ModuleGadgetAttributes[] } = await attributesRes.json();
                const isGadget = attributesResult.data.find(a => a.attribute_name === "Item Type")?.value === "Gadget";
                attributesResult.data.forEach(attr => {
                    if (isGadget) {
                        Object.keys(gadgetAttributeType).forEach(key => {
                            if (attr.attribute_name === gadgetAttributeType[key as keyof typeof gadgetAttributeType]) {
                                (moduleGadget as any)[key] = attr.value + (attr.unit ? `${attr.unit}` : "");
                            }
                        });
                        if (attr.attribute_name === "Laser Instability" || attr.attribute_name === "Instability") {
                            moduleGadget.instability = moduleGadget.instability ? moduleGadget.instability : attr.value + (attr.unit ? `${attr.unit}` : "");
                        }
                    } else {
                        Object.keys(moduleAttributeType).forEach(key => {
                            if (attr.attribute_name === moduleAttributeType[key as keyof typeof moduleAttributeType]) {
                                (moduleGadget as any)[key] = attr.value + (attr.unit ? `${attr.unit}` : "");
                            }
                        });
                    }
                });

                moduleGadget.locations = Array.from(new Set(moduleGadget.locations));
                moduleGadget.laserPowerMod = ((moduleGadget.laserPowerMod ? parseFloat(moduleGadget.laserPowerMod.replace("%", "")) : 0) - 100).toString();
                if (moduleGadget.laserPowerMod && !moduleGadget.laserPowerMod.startsWith("-")) {
                    moduleGadget.laserPowerMod = "+" + moduleGadget.laserPowerMod;
                }
                moduleGadget.laserPowerMod = moduleGadget.laserPowerMod !== '-100' ? moduleGadget.laserPowerMod + "%" : "";
                return moduleGadget;
            });

            Promise.all(modulesGadgetsPromises).then((modules) => {
                const sorted = modules.sort((a, b) => {
                    const itemTypeOrder = ["Active", "Passive", "Gadget"];
                    const aTypeIndex = itemTypeOrder.indexOf(a.itemType || "");
                    const bTypeIndex = itemTypeOrder.indexOf(b.itemType || "");
                    if (aTypeIndex !== bTypeIndex) {
                        return aTypeIndex - bTypeIndex;
                    }
                    return a.name.localeCompare(b.name);
                });
                setFormattedModules(sorted);
                setInitialOrder(sorted);
                setLoading(false);
            });
        }
    }, [modulesRawData]);

    useEffect(() => {
        // cols names with i18n
        const columns = [
            t("modulesGadgets.table.name"),
            t("modulesGadgets.table.itemType"),
            t("modulesGadgets.table.laserPowerMod"),
            t("modulesGadgets.table.resistance"),
            t("modulesGadgets.table.instability"),
            t("modulesGadgets.table.optimalChargeRate"),
            t("modulesGadgets.table.optimalChargeWindow"),
            t("modulesGadgets.table.inertMaterials"),
            t("modulesGadgets.table.overchargeRate"),
            t("modulesGadgets.table.clustering"),
            t("modulesGadgets.table.shatterDamage"),
            t("modulesGadgets.table.extractionPowerMod"),
            t("modulesGadgets.table.uses"),
            t("modulesGadgets.table.duration")
        ];
        // add unique locations as columns
        const uniqueLocations = new Set<string>();
        formattedModules.forEach(item => {
            item.locations.forEach((location: string) => uniqueLocations.add(location));
        });
        const locationColumns = Array.from(uniqueLocations).map(location => location);
        const allColumns = [...columns, ...locationColumns];
        setAllColumns(allColumns);
    }, [formattedModules, i18n.language]);


    // Preparation of unique values for filters
    const moduleNames = Array.from(new Set(formattedModules.map(l => l.name))).sort();
    const itemTypes = Array.from(new Set(formattedModules.map(l => l.itemType).filter((v): v is string => typeof v === 'string'))).sort((a, b) => {
        const itemTypeOrder = ["Active", "Passive", "Gadget"];
        const aTypeIndex = itemTypeOrder.indexOf(a || "");
        const bTypeIndex = itemTypeOrder.indexOf(b || "");
        if (aTypeIndex !== bTypeIndex) {
            return aTypeIndex - bTypeIndex;
        }
        return 0;
    });
    const locations = Array.from(new Set(formattedModules.flatMap(l => l.locations))).sort();


    // Applying filters
    let filteredModules = formattedModules.filter(item => {
        const matchName = !filterName || item.name === filterName;
        const matchType = !filterItemType || item.itemType === filterItemType;
        const matchLocation = !filterLocation || item.locations.includes(filterLocation);
        return matchName && matchType && matchLocation;
    });

    if (sortColumn && sortDirection !== 'none') {
        filteredModules = [...filteredModules].sort((a, b) => {
            if (allColumns.indexOf(sortColumn) > 13) {
                const loc = sortColumn;
                const aHas = a.locations.includes(loc) ? 1 : 0;
                const bHas = b.locations.includes(loc) ? 1 : 0;
                return sortDirection === 'asc' ? aHas - bHas : bHas - aHas;
            }
            const colKeyMap = [
                'name', 'itemType', 'laserPowerMod', 'resistance', 'instability', 'optimalChargeRate', 'optimalChargeWindow',
                'inertMaterials', 'overchargeRate', 'clustering', 'shatterDamage', 'extractionPowerMod', 'uses', 'duration'
            ];
            const idx = allColumns.indexOf(sortColumn);
            const key = colKeyMap[idx] as keyof ModuleGadget || sortColumn;
            return compareValues(a[key], b[key], sortDirection as 'asc' | 'desc');
        });
    } else if (sortDirection === 'none' && initialOrder.length > 0) {
        filteredModules = initialOrder.filter(item => {
            const matchName = !filterName || item.name === filterName;
            const matchType = !filterItemType || item.itemType === filterItemType;
            const matchLocation = !filterLocation || item.locations.includes(filterLocation);
            return matchName && matchType && matchLocation;
        });
    }



    return (
        <div className="min-h-screen bg-slate-950 text-slate-50">
            <Header />
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="flex flex-col items-start justify-center">
                    <div className="mb-6 flex items-start gap-3">
                        <LayersPlus className="h-10 w-10 text-cyan-400" />
                        <h1 className="text-3xl font-bold tracking-tight text-cyan-50 sm:text-4xl" suppressHydrationWarning>
                            {t("modulesGadgets.title")}
                        </h1>
                    </div>
                    <div
                        className="mt-6 rounded-xl w-full border border-cyan-800 bg-gradient-to-br from-slate-900/80 to-cyan-950/80 p-5 shadow-lg flex items-center gap-3"
                        style={{ backdropFilter: 'blur(4px)' }}
                    >
                        <span className="text-cyan-100 text-xs font-medium tracking-wide" suppressHydrationWarning>{t("modulesGadgets.infoZone")}</span>
                    </div>

                    {loading ? (
                        <Loader loaderText={t("modulesGadgets.loading")} />
                    ) : (
                        <div className="w-full mt-8 flex flex-col gap-4">
                            {/* Filters */}
                            <LaserModuleGadgetFilter
                                laserNames={moduleNames}
                                itemTypes={itemTypes}
                                locations={locations}
                                selectedName={filterName}
                                selectedItemType={filterItemType}
                                selectedLocation={filterLocation}
                                onNameChange={setFilterName}
                                onItemTypeChange={setFilterItemType}
                                onLocationChange={setFilterLocation}
                            />
                            {filteredModules.length === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-lg border border-slate-800 bg-slate-900/30 py-12 w-full max-w-3xl mx-auto mb-8">
                                    <p className="text-lg text-slate-400 text-center" suppressHydrationWarning>{t("modulesGadgets.noResultForFilter")}</p>
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
                                                                        minWidth: index > 13 ? '12rem' : '8rem',
                                                                        width: index > 13 ? '12rem' : '8rem',
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
                                            {filteredModules.map((item, idx) => (
                                                <tr key={idx} className="border border-slate-700 hover:bg-slate-800/50 transition-colors">
                                                    <td className="px-6 py-4 border border-slate-700 font-medium text-cyan-100 text-xs md:text-sm bg-slate-950 sticky left-0 z-10" style={{ minWidth: '8rem', maxWidth: '12rem', width: '10rem', backgroundColor: '#0f172a' }}>{item.name}</td>
                                                    <td className={`px-6 py-4 border border-slate-700 text-sm text-center ${getTypeClass(item.itemType)}`}>{item.itemType}</td>
                                                    <td className={`px-6 py-4 border border-slate-700 text-sm text-center ${getColorForValue(item.laserPowerMod)}`}>{item.laserPowerMod}</td>
                                                    <td className={`px-6 py-4 border border-slate-700 text-sm text-center ${getColorForValue(item.resistance, true)}`}>{item.resistance}</td>
                                                    <td className={`px-6 py-4 border border-slate-700 text-sm text-center ${getColorForValue(item.instability, true)}`}>{item.instability}</td>
                                                    <td className={`px-6 py-4 border border-slate-700 text-sm text-center ${getColorForValue(item.optimalChargeRate)}`}>{item.optimalChargeRate}</td>
                                                    <td className={`px-6 py-4 border border-slate-700 text-sm text-center ${getColorForValue(item.optimalChargeWindow)}`}>{item.optimalChargeWindow}</td>
                                                    <td className={`px-6 py-4 border border-slate-700 text-sm text-center ${getColorForValue(item.inertMaterials, true)}`}>{item.inertMaterials}</td>
                                                    <td className={`px-6 py-4 border border-slate-700 text-sm text-center ${getColorForValue(item.overchargeRate, true)}`}>{item.overchargeRate}</td>
                                                    <td className={`px-6 py-4 border border-slate-700 text-sm text-center ${getColorForValue(item.clustering)}`}>{item.clustering}</td>
                                                    <td className={`px-6 py-4 border border-slate-700 text-sm text-center ${getColorForValue(item.shatterDamage, true)}`}>{item.shatterDamage}</td>
                                                    <td className={`px-6 py-4 border border-slate-700 text-sm text-center ${getColorForValue(item.extractionPowerMod)}`}>{item.extractionPowerMod}</td>
                                                    <td className="px-6 py-4 border border-slate-700 text-cyan-200 text-sm text-center">{item.uses}</td>
                                                    <td className="px-6 py-4 border border-slate-700 text-cyan-200 text-sm text-center">{item.duration}</td>
                                                    {allColumns.slice(14).map((location, locIdx) => (
                                                        <td key={locIdx} className="px-6 py-4 border border-slate-700 font-semibold text-xs md:text-sm text-center text-cyan-200">
                                                            {item.locations.includes(location) ? "✓" : ""}
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
            </div>
        </div>
    );
}
