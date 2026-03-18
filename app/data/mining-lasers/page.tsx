"use client"

import { Header } from "@/components/Header";
import { API_UEX_BASE_URL, UEX_API_ENDPOINTS, UEX_API_ITEM_CATEGORIES } from "@/lib/api-endpoints";
import { MiningLaser, MiningLaserAttributes, miningLaserAttributeType, MiningLaserPrices, MiningLaserRawData } from "@/models/MiningLaser";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function MiningLasersPage() {
    const { t } = useTranslation();

    const [miningLasersRawData, setMiningLasersRawData] = useState<MiningLaserRawData[]>([]);
    const [formattedMiningLasers, setFormattedMiningLasers] = useState<any[]>([]);

    const [allColumns, setAllColumns] = useState<string[]>([]);

    useEffect(() => {
        fetch(API_UEX_BASE_URL + UEX_API_ENDPOINTS.itemsCategory + UEX_API_ITEM_CATEGORIES.miningLasers)
            .then(res => res.json())
            .then(result => {
                console.log("Mining Lasers Data from UEX API:", result);
                setMiningLasersRawData(result.data || []);
            })
    }, []);

    useEffect(() => {
        if (miningLasersRawData.length > 0) {
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
                setFormattedMiningLasers(lasers.sort((a, b) => a.name.localeCompare(b.name)));
            });
        }
    }, [miningLasersRawData]);

    useEffect(() => {
        // noms des colonnes du tableau
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
        ]
        // ajout des données de localisations
        const uniqueLocations = new Set<string>();
        formattedMiningLasers.forEach(laser => {
            laser.locations.forEach((location: string) => uniqueLocations.add(location));
        });
        const locationColumns = Array.from(uniqueLocations).map(location => location);
        const allColumns = [...columns, ...locationColumns];
        setAllColumns(allColumns);
    }, [formattedMiningLasers]);

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
                        <h1 className="text-3xl font-bold tracking-tight text-cyan-50 sm:text-4xl" suppressHydrationWarning>
                            {t("miningLasers.title")}
                        </h1>
                    </div>
                    <div
                        className="mt-6 rounded-xl w-full border border-cyan-800 bg-gradient-to-br from-slate-900/80 to-cyan-950/80 p-5 shadow-lg flex items-center gap-3"
                        style={{ backdropFilter: 'blur(4px)' }}
                    >
                        <span className="text-cyan-100 text-xs font-medium tracking-wide" suppressHydrationWarning>{t("miningLasers.description")}</span>
                    </div>

                    <div className="w-full mt-8 flex flex-col gap-4">
                        <div className="overflow-x-auto w-full mx-auto rounded-xl shadow-lg border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-md mb-8">
                            <table className="w-full table-auto border-collapse text-left">
                                <thead>
                                    <tr className="bg-slate-900/80">
                                        {allColumns.map((col, index) =>
                                            index === 0 ? (
                                                <th
                                                    key={index}
                                                    className="px-6 py-4 text-cyan-300 font-semibold text-xs md:text-sm border border-slate-700 bg-slate-900 sticky left-0 z-10"
                                                    style={{ minWidth: '10rem', maxWidth: '16rem', width: '10rem' }}
                                                >
                                                    {col}
                                                </th>
                                            ) : (
                                                <th
                                                    key={index}
                                                    className="px-6 py-4 text-cyan-300 font-semibold md:text-sm border border-slate-700 bg-slate-900 text-center"
                                                    style={{
                                                        minWidth: col.length / 2 + 'rem',
                                                        maxWidth: col.length * 2 + 'rem',
                                                        width: col.length + 'rem',
                                                        fontSize: '0.65rem'
                                                    }}
                                                >
                                                    {col}
                                                </th>
                                            )
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {formattedMiningLasers.map((laser, idx) => (
                                        <tr key={idx} className={`transition-colors duration-200 ${idx % 2 === 0 ? "bg-slate-950/70" : "bg-slate-900/60"} hover:bg-cyan-950/40 hover:shadow-md`}>
                                            <td className="px-6 py-4 border border-slate-700 font-medium text-cyan-100 text-xs md:text-sm bg-slate-950 sticky left-0 z-10" style={{ minWidth: '8rem', maxWidth: '12rem', width: '10rem', backgroundColor: '#0f172a' }}>{laser.name}</td>
                                            <td className="px-6 py-4 border border-slate-700 font-semibold text-xs md:text-sm text-center text-cyan-200">{laser.size}</td>
                                            <td className="px-6 py-4 border border-slate-700 font-semibold text-xs md:text-sm text-center text-cyan-200">{laser.slots}</td>
                                            <td className="px-6 py-4 border border-slate-700 font-semibold text-xs md:text-sm text-center text-cyan-200">{laser.optimal_range}</td>
                                            <td className="px-6 py-4 border border-slate-700 font-semibold text-xs md:text-sm text-center text-cyan-200">{laser.max_range}</td>
                                            <td className="px-6 py-4 border border-slate-700 font-semibold text-xs md:text-sm text-center text-cyan-200">{laser.min_power}</td>
                                            <td className="px-6 py-4 border border-slate-700 font-semibold text-xs md:text-sm text-center text-cyan-200">{laser.max_power}</td>
                                            <td className="px-6 py-4 border border-slate-700 font-semibold text-xs md:text-sm text-center text-cyan-200">{laser.extract_power}</td>
                                            <td className="px-6 py-4 border border-slate-700 font-semibold text-xs md:text-sm text-center text-cyan-200">{laser.resistance}</td>
                                            <td className="px-6 py-4 border border-slate-700 font-semibold text-xs md:text-sm text-center text-cyan-200">{laser.instability}</td>
                                            <td className="px-6 py-4 border border-slate-700 font-semibold text-xs md:text-sm text-center text-cyan-200">{laser.optimal_charge_rate}</td>
                                            <td className="px-6 py-4 border border-slate-700 font-semibold text-xs md:text-sm text-center text-cyan-200">{laser.optimal_charge_window}</td>
                                            <td className="px-6 py-4 border border-slate-700 font-semibold text-xs md:text-sm text-center text-cyan-200">{laser.inert_materials}</td>
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
                    </div>
                </div>
            </main>
        </div>
    );
}
