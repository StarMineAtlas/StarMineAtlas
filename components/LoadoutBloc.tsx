"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { LoadoutBlocConfig } from "@/models/Loadout";
import { MiningLaserWithPrices } from "@/models/MiningLaser";
import { ModuleGadgetWithPrices } from "@/models/ModuleGadget";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Layers, Trash } from "lucide-react";


interface LoadoutBlocProps {
    bloc: LoadoutBlocConfig;
    lasers: MiningLaserWithPrices[];
    modules: ModuleGadgetWithPrices[];
    index: number;
    onChange: (updatedBloc: LoadoutBlocConfig) => void;
}

export const LoadoutBloc: React.FC<LoadoutBlocProps> = ({
    bloc,
    lasers,
    modules,
    index,
    onChange,
}) => {
    const { t } = useTranslation();

    const handleLaserChange = (laserName: string) => {
        const selectedLaser = lasers.find(laser => laser.name === laserName);
        const slots = Number(selectedLaser?.slots) || 0;
        bloc.modules = Array.from({ length: slots }).map(() => null);
        onChange({ ...bloc, miningLaser: selectedLaser ? selectedLaser : null });
    };

    const handleModuleChange = (moduleName: string, index: number) => {
        const selectedModule = modules.find(module => module.name === moduleName);
        const updatedModules = [...bloc.modules];
        updatedModules[index] = selectedModule ? selectedModule : null;
        onChange({ ...bloc, modules: updatedModules });
    }

    const handleRemoveModule = (index: number) => {
        const updatedModules = [...bloc.modules];
        updatedModules[index] = null;
        onChange({ ...bloc, modules: updatedModules });
    };

    return (
        <div className="p-4 w-full bg-slate-800 rounded-xl text-cyan-200">
            <span className="text-lg font-semibold">Laser {index + 1}</span>
            <div className="flex flex-col items-center gap-4 my-4">
                {bloc && (
                    <>
                        {/* Laser */}
                        <div className="flex items-center w-full gap-2">
                            <Select
                                value={bloc.miningLaser?.name || ""}
                                onValueChange={handleLaserChange}
                            >
                                <SelectTrigger className="w-full border-slate-800 bg-slate-900/50 text-cyan-50 focus:border-cyan-700 focus:ring-cyan-700/20">
                                    {/* Display only the name of the selected laser */}
                                    {bloc.miningLaser ? (
                                        <span>{bloc.miningLaser.name}</span>
                                    ) : (
                                        <SelectValue placeholder={t("loadout.laserPlaceholder") || "Laser"} />
                                    )}
                                </SelectTrigger>
                                <SelectContent className="border-slate-800 bg-slate-900">
                                    {lasers.map((laser) => (
                                        <SelectItem
                                            key={laser.name}
                                            value={laser.name}
                                            className="text-cyan-50 focus:bg-slate-800 focus:text-cyan-300"
                                        >
                                            <div className="flex flex-row items-center text-select-item text-slate-400 gap-4">
                                                <div className="font-semibold text-cyan-100 text-select-item w-[100px]">{laser.name}</div>
                                                <div className="flex gap-1 w-[40px]">
                                                    <Layers className="text-cyan-400"></Layers> {laser.slots ? laser.slots : "0"}
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-select-item">{laser.min_power} - {laser.max_power}</span>
                                                    <span className="text-select-item text-slate-500">PWR</span>
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-select-item">{laser.optimal_range ? laser.optimal_range : "--"}</span>
                                                    <span className="text-select-item text-slate-500">OPT RNG</span>
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-select-item">{laser.max_range ? laser.max_range : "--"}</span>
                                                    <span className="text-select-item text-slate-500">MAX RNG</span>
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-select-item">{laser.resistance ? laser.resistance : "--"}</span>
                                                    <span className="text-select-item text-slate-500">RESISTANCE</span>
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-select-item">{laser.instability ? laser.instability : "--"}</span>
                                                    <span className="text-select-item text-slate-500">INSTABILITY</span>
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-select-item">{laser.inert_materials ? laser.inert_materials : "--"}</span>
                                                    <span className="text-select-item text-slate-500">INERT</span>
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-select-item">{laser.optimal_charge_rate ? laser.optimal_charge_rate : "--"}</span>
                                                    <span className="text-select-item text-slate-500">OPT CHRG RT</span>
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-select-item">{laser.optimal_charge_window ? laser.optimal_charge_window : "--"}</span>
                                                    <span className="text-select-item text-slate-500">OPT CHRG WIN</span>
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-select-item">{laser.extract_power ? laser.extract_power : "--"}</span>
                                                    <span className="text-select-item text-slate-500">EXTRACT PWR</span>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Modules */}
                        <div className="flex flex-col items-center w-full gap-2">
                            {Array.from({ length: bloc.modules.length }).map((_, idx) => (
                                <div className="flex items-center w-full gap-2" key={idx}>
                                    <Select
                                        value={bloc.modules[idx]?.name || ""}
                                        onValueChange={(value) => handleModuleChange(value, idx)}
                                    >
                                        <SelectTrigger className="w-full border-slate-800 bg-slate-900/50 text-cyan-50 focus:border-cyan-700 focus:ring-cyan-700/20">
                                            {/* Display only the name of the selected module */}
                                            {bloc.modules[idx] && bloc.modules[idx].name ? (
                                                <span>{bloc.modules[idx].name}</span>
                                            ) : (
                                                <SelectValue placeholder={t("loadout.modulePlaceholder") || "Module"} />
                                            )}
                                        </SelectTrigger>
                                        <SelectContent className="border-slate-800 bg-slate-900">
                                            {modules.map((module) => (
                                                <SelectItem
                                                    key={module.name}
                                                    value={module.name}
                                                    className="text-cyan-50 focus:bg-slate-800 focus:text-cyan-300"
                                                >
                                                    <div className="flex flex-row items-center text-select-item text-slate-400 gap-4">
                                                        <div className="font-semibold text-cyan-100 text-select-item w-[60px]">{module.name}</div>
                                                        <div className="font-semibold text-cyan-100 text-select-item w-[60px]">{module.itemType}</div>
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-select-item">{module.laserPowerMod ? module.laserPowerMod : "--"}</span>
                                                            <span className="text-select-item text-slate-500">LASER PWR MOD</span>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-select-item">{module.resistance ? module.resistance : "--"}</span>
                                                            <span className="text-select-item text-slate-500">RESISTANCE</span>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-select-item">{module.instability ? module.instability : "--"}</span>
                                                            <span className="text-select-item text-slate-500">INSTABILITY</span>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-select-item">{module.optimalChargeRate ? module.optimalChargeRate : "--"}</span>
                                                            <span className="text-select-item text-slate-500">OPT CHRG RT</span>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-select-item">{module.optimalChargeWindow ? module.optimalChargeWindow : "--"}</span>
                                                            <span className="text-select-item text-slate-500">OPT CHRG WIN</span>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-select-item">{module.inertMaterials ? module.inertMaterials : "--"}</span>
                                                            <span className="text-select-item text-slate-500">INERT</span>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-select-item">{module.overchargeRate ? module.overchargeRate : "--"}</span>
                                                            <span className="text-select-item text-slate-500">OVERCHARGE</span>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-select-item">{module.clustering ? module.clustering : "--"}</span>
                                                            <span className="text-select-item text-slate-500">CLUSTERING</span>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-select-item">{module.shatterDamage ? module.shatterDamage : "--"}</span>
                                                            <span className="text-select-item text-slate-500">SHATTER DMG</span>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-select-item">{module.extractionPowerMod ? module.extractionPowerMod : "--"}</span>
                                                            <span className="text-select-item text-slate-500">EXTRACT PWR MOD</span>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {
                                        bloc.modules[idx] && bloc.modules[idx].name && (
                                            <Trash className="hover:cursor-pointer text-red-500" onClick={() => handleRemoveModule(idx)}></Trash>
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
