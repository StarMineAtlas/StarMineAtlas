import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Mineral, MineralToSell, MineralType } from "@/models/Mineral"
import { PlusCircle, Trash } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

interface MineralsListingProps {
    minerals: Mineral[];
    mineralsList?: MineralToSell[]
    updateMineralsList?: (minerals: MineralToSell[]) => void
}

const getTypeColor = (type: MineralType | null) => {
    switch (type) {
        case MineralType.FPS:
            return "text-purple-400"
        case MineralType.SHIP:
            return "text-blue-400"
        default:
            return "text-cyan-400"
    }
}

export default function MineralsListing({ minerals, mineralsList = [], updateMineralsList }: MineralsListingProps) {
    const { t } = useTranslation()

    // Regroupement des minerais par type pour le selecteur
    const mineralsByType = minerals.reduce<{ [key: string]: Mineral[] }>((acc, m) => {
        if (!acc[m.type]) acc[m.type] = [];
        acc[m.type].push(m);
        return acc;
    }, {});

    // Handlers qui utilisent updateMineralsList
    const handleAddMineral = (mineral: Mineral) => {
        if (!updateMineralsList) return
        if (mineralsList.length >= 20) return
        const mineralToSell: MineralToSell = {
            ...mineral,
            quantity: 0,
            yield: 0,
            quality: 0,
        }
        updateMineralsList([...mineralsList, mineralToSell])
    }

    const handleRemoveMineral = (index: number) => {
        if (!updateMineralsList) return
        updateMineralsList(mineralsList.filter((_, i) => i !== index))
    }

    const handleCleanAll = () => {
        if (!updateMineralsList) return
        updateMineralsList([])
    }

    const handleSelectMineral = (index: number, mineral: Mineral) => {
        if (!updateMineralsList) return
        updateMineralsList(mineralsList.map((m, i) => i === index ? { ...m, ...mineral } : m))
    }

    // State local pour les valeurs d'input
    const [localInputs, setLocalInputs] = useState<{ [key: number]: { quality: number; quantity: number } }>(() => {
        const initial: { [key: number]: { quality: number; quantity: number } } = {};
        mineralsList.forEach((m, i) => {
            initial[i] = { quality: m.quality, quantity: m.quantity };
        });
        return initial;
    });

    // Synchronise localInputs si mineralsList change (ex: ajout/suppression)
    useEffect(() => {
        setLocalInputs(prev => {
            const next: { [key: number]: { quality: number; quantity: number } } = {};
            mineralsList.forEach((m, i) => {
                next[i] = prev[i] || { quality: m.quality, quantity: m.quantity };
            });
            return next;
        });
    }, [mineralsList]);

    // Debounce pour updateMineralsList
    const debounceTimeouts = useState<{ [key: string]: NodeJS.Timeout }>({})[0];

    const handleMineralQualityChange = (index: number, quality: number) => {
        if (quality < 0) quality = 0;
        if (quality > 1000) quality = 1000;
        setLocalInputs(prev => ({
            ...prev,
            [index]: { ...prev[index], quality }
        }));
        if (!updateMineralsList) return;
        const key = `quality-${index}`;
        if (debounceTimeouts[key]) clearTimeout(debounceTimeouts[key]);
        debounceTimeouts[key] = setTimeout(() => {
            updateMineralsList(
                mineralsList.map((m, i) =>
                    i === index ? { ...m, quality: quality } : m
                )
            );
        }, 600);
    };

    const handleMineralQuantityChange = (index: number, quantity: number) => {
        if (quantity < 0) quantity = 0;
        if (quantity > 9999) quantity = 9999;
        setLocalInputs(prev => ({
            ...prev,
            [index]: { ...prev[index], quantity }
        }));
        if (!updateMineralsList) return;
        const key = `quantity-${index}`;
        if (debounceTimeouts[key]) clearTimeout(debounceTimeouts[key]);
        debounceTimeouts[key] = setTimeout(() => {
            updateMineralsList(
                mineralsList.map((m, i) =>
                    i === index ? { ...m, quantity: quantity } : m
                )
            );
        }, 600);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className={`flex justify-between ${mineralsList.length >= 20 ? "flex-row-reverse" : "flex-row"}`}>
                {mineralsList.length < 20 && (
                    <Button
                        variant="default"
                        className="self-start bg-cyan-400 text-white shadow-lg hover:bg-cyan-500 hover:cursor-pointer transition-all flex items-center gap-2 px-6 py-3 text-base font-semibold rounded-lg"
                        onClick={() => handleAddMineral(minerals[0])}
                    >
                        <PlusCircle className="w-5 h-5" />
                        {t("workOrder.refinerySection.mineralsListing.addMineral")}
                    </Button>
                )}
                {mineralsList.length > 0 && (
                    <Button
                        variant="default"
                        className="self-start bg-red-500 text-white shadow-lg hover:bg-red-600 hover:cursor-pointer transition-all flex items-center gap-2 px-6 py-3 text-base font-semibold rounded-lg"
                        onClick={handleCleanAll}
                    >
                        <Trash className="w-5 h-5" />
                        {t("workOrder.refinerySection.mineralsListing.cleanAll")}
                    </Button>
                )}
            </div>

            {mineralsList.map((mineral, index) => {
                return (
                    <div
                        key={index}
                        className="flex items-end flex-wrap relative gap-4 p-4 border border-slate-800 rounded-lg bg-slate-900/70 shadow-md"
                    >
                        {/* Sélecteur de minerai (design MineralFilter) */}
                        <div className="flex flex-col items-start w-3/4 lg:w-3/12 xl:w-4/12">
                            <label className="text-xs text-slate-400 mb-1" htmlFor={`mineral-${index}`}>{t("workOrder.refinerySection.mineralsListing.mineral")}</label>
                            <Select
                                value={mineral.name}
                                onValueChange={value => {
                                    const selected = minerals.find(m => m.name === value)
                                    if (!selected) return
                                    handleSelectMineral(index, selected)
                                }}
                            >
                                <SelectTrigger className="w-full border-slate-800 bg-slate-900/50 text-cyan-50 focus:border-cyan-700 focus:ring-cyan-700/20">
                                    <SelectValue placeholder={t("workOrder.refinerySection.mineralsListing.mineral")} />
                                </SelectTrigger>
                                <SelectContent className="border-slate-800 bg-slate-900">
                                    {Object.entries(mineralsByType).map(([type, mineralsList]) => (
                                        <div key={type}>
                                            <div className={`px-2 py-1 text-xs font-semibold uppercase select-none ${getTypeColor(type as MineralType)}`}>
                                                {type}
                                            </div>
                                            {mineralsList.map((m) => (
                                                <SelectItem
                                                    key={m.name}
                                                    value={m.name}
                                                    className="text-cyan-50 focus:bg-slate-800 focus:text-cyan-300"
                                                >
                                                    {m.name}
                                                </SelectItem>
                                            ))}
                                        </div>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Supprimer le minéral - mobile*/}
                        <div className="flex lg:hidden justify-end items-end self-center absolute top-4 right-4 w-6">
                            <Trash className="text-red-500 hover:text-red-600 hover:cursor-pointer" onClick={() => handleRemoveMineral(index)}></Trash>
                        </div>

                        {/* Input qualité */}
                        <div className="flex flex-col items-start w-1/4 lg:w-2/12">
                            <label className="text-xs text-slate-400 mb-1" htmlFor={`quality-${index}`}>{t("workOrder.refinerySection.mineralsListing.quality")}</label>
                            <input
                                id={`quality-${index}`}
                                type="number"
                                min={0}
                                max={100}
                                className="w-full px-2 py-1 rounded bg-slate-800 text-slate-50 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                                value={localInputs[index]?.quality ?? mineral.quality}
                                onChange={e => {
                                    const value = Number(e.target.value)
                                    handleMineralQualityChange(index, value)
                                }}
                            />
                        </div>

                        {/* Input quantité */}
                        <div className="flex flex-col items-start w-1/4 lg:w-2/12">
                            <label className="text-xs text-slate-400 mb-1" htmlFor={`quantity-${index}`}>{t("workOrder.refinerySection.mineralsListing.quantity")}</label>
                            <input
                                id={`quantity-${index}`}
                                type="number"
                                min={0}
                                className="w-full px-2 py-1 rounded bg-slate-800 text-slate-50 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                                value={localInputs[index]?.quantity ?? mineral.quantity}
                                onChange={e => {
                                    const value = Number(e.target.value)
                                    handleMineralQuantityChange(index, value)
                                }}
                            />
                        </div>

                        {/* Affichage du yield */}
                        <div className="flex flex-col items-start w-1/4 lg:w-2/12">
                            <span className="text-xs text-slate-400 mb-1">{t("workOrder.refinerySection.mineralsListing.yield")}</span>
                            <span className="px-3 py-1 w-full rounded bg-cyan-600/20 text-cyan-400 font-semibold border border-cyan-700">
                                {mineral.yield}
                            </span>
                        </div>

                        {/* Supprimer le minéral - desktop */}
                        <div className="hidden lg:flex justify-center items-center self-center w-6">
                            <Trash className="text-red-500 hover:text-red-600 hover:cursor-pointer" onClick={() => handleRemoveMineral(index)}></Trash>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}