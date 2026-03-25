"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ModuleGadgetWithActive } from "@/models/Loadout";
import { ModuleGadgetWithPrices } from "@/models/ModuleGadget";
import { Trash } from "lucide-react";
import { FC } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";
import { Switch } from "../ui/switch";


interface LoadoutBlocProps {
    gadgetList: (ModuleGadgetWithActive | null)[];
    gadgets: ModuleGadgetWithPrices[];
    onChange: (updatedGadgetList: (ModuleGadgetWithActive | null)[]) => void;
}

// Function to get color class based on value (positive: green, negative: red, zero/null/undefined: gray)
const getColorForValue = (val: string | number | null | undefined, isInverse: boolean = false) => {
    if (val === null || val === undefined || val === "") return "text-gray-400";
    const num = typeof val === "string" ? parseFloat(val.replace(/[^-\d.]/g, "")) : val;
    if (isNaN(num)) return "text-gray-400";
    if (num > 0) return isInverse ? "text-red-400" : "text-green-400";
    if (num < 0) return isInverse ? "text-green-400" : "text-red-400";
    return "text-gray-400";
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
};

export const LoadoutInventory: FC<LoadoutBlocProps> = ({
    gadgetList,
    gadgets,
    onChange,
}) => {
    const { t } = useTranslation();

    const isMobile = useIsMobile();

    const handleGadgetChange = (gadgetName: string, index: number) => {
        // If the value is an empty string, treat as null (unselected)
        const selectedGadget = {
            ...gadgets.find((g) => g.name === gadgetName) || null,
            isActive: true
        } as ModuleGadgetWithActive | null;
        // Force the type to (ModuleGadgetWithActive | null)[]
        const updatedGadgetList = gadgetList.slice() as (ModuleGadgetWithActive | null)[];
        updatedGadgetList[index] = selectedGadget;
        if (updatedGadgetList.every((g) => g !== null)) {
            (updatedGadgetList as (ModuleGadgetWithActive | null)[]).push(null);
        }
        onChange(updatedGadgetList);
    };

    const handleRemoveGadget = (index: number) => {
        const updatedGadgetList = gadgetList.slice() as (ModuleGadgetWithActive | null)[];
        updatedGadgetList.splice(index, 1);
        if (updatedGadgetList.length === 0) {
            (updatedGadgetList as (ModuleGadgetWithActive | null)[]).push(null);
        }
        onChange(updatedGadgetList);
    }

    const handleSwitchGadgetChange = (index: number) => {
        const updatedGadgetList = gadgetList.slice() as (ModuleGadgetWithActive | null)[];
        const gadget = updatedGadgetList[index];
        if (gadget) {
            updatedGadgetList[index] = { ...gadget, isActive: !gadget.isActive };
            onChange(updatedGadgetList);
        }
    }

    return (
        <div className="p-4 w-full bg-slate-800 rounded-xl text-cyan-200">
            <span className="text-lg font-semibold">{t("loadout.inventory")}</span>
            <div className="flex flex-col items-center gap-4 my-4">
                {gadgetList && (
                    <>
                        {/* Gadget */}
                        <div className="flex flex-col items-center w-full gap-2">
                            {Array.from({ length: gadgetList.length }).map((_, idx) => (
                                <div className="flex items-center w-full gap-2" key={idx}>
                                    {
                                        gadgetList[idx] && gadgetList[idx]?.name && (
                                            <Switch
                                                checked={gadgetList[idx]?.isActive || false}
                                                onCheckedChange={() => handleSwitchGadgetChange(idx)}
                                                className="mr-2"
                                            />
                                        )
                                    }
                                    <Select
                                        value={gadgetList[idx]?.name ?? ""}
                                        onValueChange={(value) => handleGadgetChange(value, idx)}
                                    >
                                        <SelectTrigger className="w-full border-slate-800 bg-slate-900/50 text-cyan-50 focus:border-cyan-700 focus:ring-cyan-700/20">
                                            {/* Display only the name of the selected gadget */}
                                            {gadgetList[idx] && gadgetList[idx]?.name ? (
                                                <span>{gadgetList[idx]?.name}</span>
                                            ) : (
                                                <SelectValue placeholder={t("loadout.gadgetPlaceholder") || "Gadget"} />
                                            )}
                                        </SelectTrigger>
                                        <SelectContent className="border-slate-800 bg-slate-900">
                                            {gadgets.map((gadget) => (
                                                <SelectItem
                                                    key={gadget.name}
                                                    value={gadget.name}
                                                    className="text-cyan-50 focus:bg-slate-800 focus:text-cyan-300"
                                                >
                                                    {isMobile ? (
                                                        <div className="flex flex-col w-full">
                                                            <div className="flex flex-row items-center gap-2 w-full">
                                                                <span className="font-semibold text-cyan-100 text-select-item truncate w-[60px]">{gadget.name}</span>
                                                                <span className={"font-semibold text-select-item w-[60px] " + getTypeClass(gadget.itemType)}>{gadget.itemType}</span>
                                                                <span className="text-xs text-slate-400">RES: <span className={getColorForValue(gadget.resistance)}>{gadget.resistance ?? "--"}</span></span>
                                                                <span className="text-xs text-slate-400">INST: <span className={getColorForValue(gadget.instability)}>{gadget.instability ?? "--"}</span></span>
                                                            </div>
                                                            <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-slate-400 pl-2 pt-0.5">
                                                                <span>OPT RT: <span className={getColorForValue(gadget.optimalChargeRate)}>{gadget.optimalChargeRate ?? "--"}</span></span>
                                                                <span>OPT WIN: <span className={getColorForValue(gadget.optimalChargeWindow)}>{gadget.optimalChargeWindow ?? "--"}</span></span>
                                                                <span>CLUST: <span className={getColorForValue(gadget.clustering)}>{gadget.clustering ?? "--"}</span></span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-row items-center text-select-item gap-4">
                                                            <div className="font-semibold text-cyan-100 text-select-item w-[60px]">{gadget.name}</div>
                                                            <div className="font-semibold text-select-item w-[60px]">
                                                                <span className={getTypeClass(gadget.itemType)}>{gadget.itemType}</span>
                                                            </div>
                                                            <div className="flex flex-col items-center">
                                                                <span className={`text-select-item ${getColorForValue(gadget.resistance)}`}>{gadget.resistance ? gadget.resistance : "--"}</span>
                                                                <span className={`text-select-item ${getColorForValue(gadget.resistance) === 'text-gray-400' ? 'text-slate-500' : getColorForValue(gadget.resistance)}`}>RESISTANCE</span>
                                                            </div>
                                                            <div className="flex flex-col items-center">
                                                                <span className={`text-select-item ${getColorForValue(gadget.instability)}`}>{gadget.instability ? gadget.instability : "--"}</span>
                                                                <span className={`text-select-item ${getColorForValue(gadget.instability) === 'text-gray-400' ? 'text-slate-500' : getColorForValue(gadget.instability)}`}>INSTABILITY</span>
                                                            </div>
                                                            <div className="flex flex-col items-center">
                                                                <span className={`text-select-item ${getColorForValue(gadget.optimalChargeRate)}`}>{gadget.optimalChargeRate ? gadget.optimalChargeRate : "--"}</span>
                                                                <span className={`text-select-item ${getColorForValue(gadget.optimalChargeRate) === 'text-gray-400' ? 'text-slate-500' : getColorForValue(gadget.optimalChargeRate)}`}>OPT CHRG RT</span>
                                                            </div>
                                                            <div className="flex flex-col items-center">
                                                                <span className={`text-select-item ${getColorForValue(gadget.optimalChargeWindow)}`}>{gadget.optimalChargeWindow ? gadget.optimalChargeWindow : "--"}</span>
                                                                <span className={`text-select-item ${getColorForValue(gadget.optimalChargeWindow) === 'text-gray-400' ? 'text-slate-500' : getColorForValue(gadget.optimalChargeWindow)}`}>OPT CHRG WIN</span>
                                                            </div>
                                                            <div className="flex flex-col items-center">
                                                                <span className={`text-select-item ${getColorForValue(gadget.clustering)}`}>{gadget.clustering ? gadget.clustering : "--"}</span>
                                                                <span className={`text-select-item ${getColorForValue(gadget.clustering) === 'text-gray-400' ? 'text-slate-500' : getColorForValue(gadget.clustering)}`}>CLUSTERING</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {
                                        gadgetList[idx] && gadgetList[idx]?.name && (
                                            <Trash className="hover:cursor-pointer text-red-500" onClick={() => handleRemoveGadget(idx)}></Trash>
                                        )
                                    }
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
