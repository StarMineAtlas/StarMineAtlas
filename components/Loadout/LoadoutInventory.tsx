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
import React from "react";
import { useTranslation } from "react-i18next";
import { Switch } from "../ui/switch";


interface LoadoutBlocProps {
    gadgetList: (ModuleGadgetWithActive | null)[];
    gadgets: ModuleGadgetWithPrices[];
    onChange: (updatedGadgetList: (ModuleGadgetWithActive | null)[]) => void;
}

export const LoadoutInventory: React.FC<LoadoutBlocProps> = ({
    gadgetList,
    gadgets,
    onChange,
}) => {
    const { t } = useTranslation();

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
                                                    <div className="flex flex-row items-center text-select-item text-slate-400 gap-4">
                                                        <div className="font-semibold text-cyan-100 text-select-item w-[60px]">{gadget.name}</div>
                                                        <div className="font-semibold text-cyan-100 text-select-item w-[60px]">{gadget.itemType}</div>
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-select-item">{gadget.laserPowerMod ? gadget.laserPowerMod : "--"}</span>
                                                            <span className="text-select-item text-slate-500">LASER PWR MOD</span>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-select-item">{gadget.resistance ? gadget.resistance : "--"}</span>
                                                            <span className="text-select-item text-slate-500">RESISTANCE</span>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-select-item">{gadget.instability ? gadget.instability : "--"}</span>
                                                            <span className="text-select-item text-slate-500">INSTABILITY</span>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-select-item">{gadget.optimalChargeRate ? gadget.optimalChargeRate : "--"}</span>
                                                            <span className="text-select-item text-slate-500">OPT CHRG RT</span>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-select-item">{gadget.optimalChargeWindow ? gadget.optimalChargeWindow : "--"}</span>
                                                            <span className="text-select-item text-slate-500">OPT CHRG WIN</span>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-select-item">{gadget.inertMaterials ? gadget.inertMaterials : "--"}</span>
                                                            <span className="text-select-item text-slate-500">INERT</span>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-select-item">{gadget.overchargeRate ? gadget.overchargeRate : "--"}</span>
                                                            <span className="text-select-item text-slate-500">OVERCHARGE</span>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-select-item">{gadget.clustering ? gadget.clustering : "--"}</span>
                                                            <span className="text-select-item text-slate-500">CLUSTERING</span>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-select-item">{gadget.shatterDamage ? gadget.shatterDamage : "--"}</span>
                                                            <span className="text-select-item text-slate-500">SHATTER DMG</span>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-select-item">{gadget.extractionPowerMod ? gadget.extractionPowerMod : "--"}</span>
                                                            <span className="text-select-item text-slate-500">EXTRACT PWR MOD</span>
                                                        </div>
                                                    </div>
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
