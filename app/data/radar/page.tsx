"use client"

import { Header } from "@/components/Header/Header";
import { Loader } from "@/components/Loader";
import { API_RADAR_BASE_URL } from "@/lib/api-endpoints";
import { RadarData } from "@/models/Radar";
import { Radar } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { RadarFilters } from "@/components/Filters/RadarFilters";
import { useTranslation } from "react-i18next";

export default function RadarPage() {

    const { t } = useTranslation()

    const [loading, setLoading] = useState(true);
    const [sortColumn, setSortColumn] = useState<string>("");
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | 'none'>("none");
    const [initialOrder, setInitialOrder] = useState<RadarData[]>([]);

    const [radarData, setRadarData] = useState<RadarData[]>([])
    const [selectedMineral, setSelectedMineral] = useState("");
    const [searchEcho, setSearchEcho] = useState("");


    useEffect(() => {
        setLoading(true)
        fetch(API_RADAR_BASE_URL)
            .then(response => response.json())
            .then(json => {
                setRadarData(json);
                setInitialOrder(json);
            })
            .finally(() => setLoading(false))
    }, [])


    // Fonction de comparaison pour le tri
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

    // Filtres
    const uniqueMinerals = useMemo(() => {
        const set = new Set<string>();
        radarData.forEach(row => set.add(row.name));
        return Array.from(set).sort();
    }, [radarData]);

    // Application des filtres
    const filteredRadarData = useMemo(() => {
        let data = radarData;
        if (selectedMineral) {
            data = data.filter(row => row.name === selectedMineral);
        }
        if (searchEcho.trim() !== "") {
            const search = searchEcho.trim().toLowerCase();
            data = data.filter(row =>
                Object.keys(row)
                    .filter(key => !isNaN(Number(key)))
                    .some(key => String(row[key as keyof RadarData]).toLowerCase().includes(search))
            );
        }
        return data;
    }, [radarData, selectedMineral, searchEcho]);

    // Données triées selon la colonne et la direction
    const sortedRadarData = useMemo(() => {
        if (!sortColumn || sortDirection === 'none') return filteredRadarData;
        return [...filteredRadarData].sort((a, b) => {
            if (sortColumn === 'name') {
                return compareValues(a.name, b.name, sortDirection);
            } else {
                return compareValues(a[sortColumn as keyof RadarData], b[sortColumn as keyof RadarData], sortDirection);
            }
        });
    }, [filteredRadarData, sortColumn, sortDirection]);

    // Colonnes radar (1 à 12)
    const radarColumns = useMemo(() => Array.from({ length: 12 }, (_, i) => (i + 1).toString()), []);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50">
            <Header />
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="mb-6 flex items-center gap-3">
                        <Radar className="h-10 w-10 text-cyan-400" />
                        <h1 className="text-3xl font-bold tracking-tight text-cyan-50 sm:text-4xl" suppressHydrationWarning>
                            {t("radar.title")}
                        </h1>
                    </div>

                    <p className="mb-8 max-w-2xl text-lg text-slate-400" suppressHydrationWarning>
                        {t("radar.description")}
                    </p>

                    {loading ? (
                        <Loader loaderText={t("radar.loading")} />
                    ) : (
                        <div className="w-full mt-8 flex flex-col gap-4">
                            <RadarFilters
                                minerals={uniqueMinerals}
                                selectedMineral={selectedMineral}
                                onMineralChange={setSelectedMineral}
                                searchValue={searchEcho}
                                onSearchChange={setSearchEcho}
                            />
                            <div className="overflow-x-auto rounded-xl shadow-lg border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-md w-full">
                                <table className="w-full table-auto border-collapse text-left">
                                    <thead>
                                        <tr className="bg-slate-900/80">
                                            <th
                                                className="px-6 py-4 text-cyan-300 font-semibold text-xs md:text-sm border border-slate-700 bg-slate-900 sticky left-0 z-10 cursor-pointer select-none"
                                                style={{ minWidth: "10rem", maxWidth: "10rem", width: "10rem" }}
                                                onClick={() => {
                                                    if (sortColumn !== 'name') {
                                                        setSortColumn('name');
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
                                                    {t("radar.mineral", "Mineral")}
                                                    {sortColumn === 'name' && sortDirection !== 'none' && (
                                                        sortDirection === 'asc' ? (
                                                            <svg className="inline w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                                                        ) : (
                                                            <svg className="inline w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                                        )
                                                    )}
                                                </span>
                                            </th>
                                            {radarColumns.map((col) => (
                                                <th
                                                    key={col}
                                                    className="px-4 py-4 text-cyan-300 font-semibold text-xs md:text-sm border border-slate-700 text-center cursor-pointer select-none"
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
                                                        {sortColumn === col && sortDirection !== 'none' && (
                                                            sortDirection === 'asc' ? (
                                                                <svg className="inline w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                                                            ) : (
                                                                <svg className="inline w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                                            )
                                                        )}
                                                    </span>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedRadarData.length > 0 ? sortedRadarData.map((row, idx) => (
                                            <tr key={row.name} className={`transition-colors duration-200 ${idx % 2 === 0 ? "bg-slate-950/70" : "bg-slate-900/60"} hover:bg-cyan-950/40 hover:shadow-md`}>
                                                <td className="px-6 py-4 border border-slate-700 font-medium text-cyan-100 text-xs md:text-sm bg-slate-950 sticky left-0 z-10" style={{ minWidth: "10rem", maxWidth: "10rem", width: "10rem", backgroundColor: '#0f172a' }}>
                                                    {row.name}
                                                </td>
                                                {radarColumns.map((col) => (
                                                    <td key={col} className="px-4 py-4 border border-slate-700 font-semibold text-xs md:text-sm text-center text-cyan-200">
                                                        {row[col as keyof RadarData] ?? "-"}
                                                    </td>
                                                ))}
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={radarColumns.length + 1} className="px-6 py-8 text-center text-slate-400">
                                                    {t("radar.noData", "No radar data available.")}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}