"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { LoadoutBlocConfig, ModuleGadgetWithActive, ShipConfiguration } from "@/models/Loadout";
import { MiningLaserWithPrices } from "@/models/MiningLaser";
import { ModuleGadgetWithPrices } from "@/models/ModuleGadget";
import React, { use, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { Switch } from "@/components/ui/switch";
import { Layers, Trash } from "lucide-react";


interface LoadoutBlocProps {
    shipConfig: ShipConfiguration;
    bloc: LoadoutBlocConfig;
    lasers: MiningLaserWithPrices[];
    modules: ModuleGadgetWithPrices[];
    index: number;
    onChange: (updatedBloc: LoadoutBlocConfig) => void;
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

export const LoadoutBloc: React.FC<LoadoutBlocProps> = ({
    shipConfig,
    bloc,
    lasers,
    modules,
    index,
    onChange,
}) => {
    const { t } = useTranslation();

    const [sortedSizes, setSortedSizes] = React.useState<string[]>([]);

    useEffect(() => {
        if (!shipConfig || !shipConfig.laserSizes) return;
        const sizeOrder = ["2", "1", "S0"]; // Wanted order of sizes
        const newSortedSizes = Object.keys(lasersBySize).sort((a, b) => {
            const ia = sizeOrder.indexOf(a);
            const ib = sizeOrder.indexOf(b);
            if (ia === -1 && ib === -1) return a.localeCompare(b);
            if (ia === -1) return 1;
            if (ib === -1) return -1;
            return ia - ib;
        }).filter(size => shipConfig?.laserSizes?.includes(size)); // Filter sizes based on ship
        setSortedSizes(newSortedSizes);
    }, [lasers, shipConfig, bloc, index]);

    const handleLaserChange = (laserName: string) => {
        const selectedLaser = lasers.find(laser => laser.name === laserName);
        const slots = Number(selectedLaser?.slots) || 0;
        bloc.modules = Array.from({ length: slots }).map(() => null);
        onChange({ ...bloc, miningLaser: selectedLaser ? selectedLaser : null, isLaserActive: !!selectedLaser });
    };

    const handleModuleChange = (moduleName: string, index: number) => {
        const selectedModule = {
            ...modules.find(module => module.name === moduleName),
            isActive: true
        } as ModuleGadgetWithActive | null;
        const updatedModules = [...bloc.modules];
        updatedModules[index] = selectedModule ? selectedModule : null;
        onChange({ ...bloc, modules: updatedModules });
    }

    const handleRemoveModule = (index: number) => {
        const updatedModules = [...bloc.modules];
        updatedModules[index] = null;
        onChange({ ...bloc, modules: updatedModules });
    };

    const handleSwitchLaserChange = (index: number) => {
        const updatedBloc = { ...bloc };
        updatedBloc.isLaserActive = !updatedBloc.isLaserActive;
        updatedBloc.modules = updatedBloc.modules.map(module => module ? { ...module, isActive: updatedBloc.isLaserActive } : null);
        onChange(updatedBloc);
    }

    const handleSwitchModuleChange = (index: number) => {
        const updatedModules = [...bloc.modules];
        if (updatedModules[index]) {
            updatedModules[index] = { ...updatedModules[index], isActive: !updatedModules[index]?.isActive };
        }
        onChange({ ...bloc, modules: updatedModules });
    }

    // Regroupement des lasers par taille
    const lasersBySize = React.useMemo(() => {
        const grouped: { [size: string]: MiningLaserWithPrices[] } = {};
        lasers.forEach(laser => {
            if (!grouped[laser.size]) grouped[laser.size] = [];
            grouped[laser.size].push(laser);
        });
        return grouped;
    }, [lasers]);

    return (
        <div className="p-4 w-full bg-slate-800 rounded-xl text-cyan-200">
            <span className="text-lg font-semibold">Laser {index + 1}</span>
            <div className="flex flex-col items-center gap-4 my-4">
                {bloc && (
                    <>
                        {/* Laser */}
                        <div className="flex items-center w-full gap-2">
                            <Switch
                                checked={bloc.isLaserActive}
                                onCheckedChange={() => handleSwitchLaserChange(index)}
                                className="mr-2"
                            />
                            <Select
                                value={bloc.miningLaser?.name || ""}
                                onValueChange={handleLaserChange}
                                disabled={!shipConfig?.canChangeLasers}
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
                                    {sortedSizes.map(size => (
                                        <React.Fragment key={size}>
                                            <div className="px-2 py-1 text-xs font-bold text-cyan-300 bg-slate-800/80">{t(`loadout.laserSize.${size}`, { defaultValue: size })}</div>
                                            {lasersBySize[size].map((laser) => (
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
                                                            <span className={`text-select-item`}>{laser.min_power ? laser.min_power : "--"} - {laser.max_power ? laser.max_power : "--"}</span>
                                                            <span className={`text-select-item text-slate-500`}>PWR</span>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <span className={`text-select-item`}>{laser.optimal_range ? laser.optimal_range : "--"}</span>
                                                            <span className={`text-select-item text-slate-500`}>OPT RNG</span>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <span className={`text-select-item`}>{laser.max_range ? laser.max_range : "--"}</span>
                                                            <span className={`text-select-item text-slate-500`}>MAX RNG</span>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <span className={`text-select-item ${getColorForValue(laser.resistance, true)}`}>{laser.resistance ? laser.resistance : "--"}</span>
                                                            <span className={`text-select-item ${getColorForValue(laser.resistance, true) === 'text-gray-400' ? 'text-slate-500' : getColorForValue(laser.resistance, true)}`}>RESISTANCE</span>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <span className={`text-select-item ${getColorForValue(laser.instability, true)}`}>{laser.instability ? laser.instability : "--"}</span>
                                                            <span className={`text-select-item ${getColorForValue(laser.instability, true) === 'text-gray-400' ? 'text-slate-500' : getColorForValue(laser.instability, true)}`}>INSTABILITY</span>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <span className={`text-select-item ${getColorForValue(laser.inert_materials, true)}`}>{laser.inert_materials ? laser.inert_materials : "--"}</span>
                                                            <span className={`text-select-item ${getColorForValue(laser.inert_materials, true) === 'text-gray-400' ? 'text-slate-500' : getColorForValue(laser.inert_materials, true)}`}>INERT</span>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <span className={`text-select-item ${getColorForValue(laser.optimal_charge_rate)}`}>{laser.optimal_charge_rate ? laser.optimal_charge_rate : "--"}</span>
                                                            <span className={`text-select-item ${getColorForValue(laser.optimal_charge_rate) === 'text-gray-400' ? 'text-slate-500' : getColorForValue(laser.optimal_charge_rate)}`}>OPT CHRG RT</span>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <span className={`text-select-item ${getColorForValue(laser.optimal_charge_window)}`}>{laser.optimal_charge_window ? laser.optimal_charge_window : "--"}</span>
                                                            <span className={`text-select-item ${getColorForValue(laser.optimal_charge_window) === 'text-gray-400' ? 'text-slate-500' : getColorForValue(laser.optimal_charge_window)}`}>OPT CHRG WIN</span>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <span className={`text-select-item`}>{laser.extract_power ? laser.extract_power : "--"}</span>
                                                            <span className={`text-select-item text-slate-500`}>EXTRACT PWR</span>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Modules */}
                        <div className="flex flex-col items-center w-full gap-2">
                            {Array.from({ length: bloc.modules.length }).map((_, idx) => (
                                <div className="flex items-center w-full gap-2" key={idx}>
                                    {bloc.modules[idx]?.itemType === "Active" && (
                                        <Switch
                                            checked={bloc.modules[idx]?.isActive || false}
                                            onCheckedChange={() => handleSwitchModuleChange(idx)}
                                            className="mr-2"
                                        />
                                    )}
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
                                                        <div className="font-semibold text-select-item w-[60px]">
                                                            <span className={getTypeClass(module.itemType)}>{module.itemType}</span>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <span className={`text-select-item ${getColorForValue(module.laserPowerMod)}`}>{module.laserPowerMod ? module.laserPowerMod : "--"}</span>
                                                            <span className={`text-select-item ${getColorForValue(module.laserPowerMod) === 'text-gray-400' ? 'text-slate-500' : getColorForValue(module.laserPowerMod)}`}>LASER PWR MOD</span>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <span className={`text-select-item ${getColorForValue(module.resistance, true)}`}>{module.resistance ? module.resistance : "--"}</span>
                                                            <span className={`text-select-item ${getColorForValue(module.resistance, true) === 'text-gray-400' ? 'text-slate-500' : getColorForValue(module.resistance, true)}`}>RESISTANCE</span>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <span className={`text-select-item ${getColorForValue(module.instability, true)}`}>{module.instability ? module.instability : "--"}</span>
                                                            <span className={`text-select-item ${getColorForValue(module.instability, true) === 'text-gray-400' ? 'text-slate-500' : getColorForValue(module.instability, true)}`}>INSTABILITY</span>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <span className={`text-select-item ${getColorForValue(module.optimalChargeRate)}`}>{module.optimalChargeRate ? module.optimalChargeRate : "--"}</span>
                                                            <span className={`text-select-item ${getColorForValue(module.optimalChargeRate) === 'text-gray-400' ? 'text-slate-500' : getColorForValue(module.optimalChargeRate)}`}>OPT CHRG RT</span>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <span className={`text-select-item ${getColorForValue(module.optimalChargeWindow)}`}>{module.optimalChargeWindow ? module.optimalChargeWindow : "--"}</span>
                                                            <span className={`text-select-item ${getColorForValue(module.optimalChargeWindow) === 'text-gray-400' ? 'text-slate-500' : getColorForValue(module.optimalChargeWindow)}`}>OPT CHRG WIN</span>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <span className={`text-select-item ${getColorForValue(module.inertMaterials, true)}`}>{module.inertMaterials ? module.inertMaterials : "--"}</span>
                                                            <span className={`text-select-item ${getColorForValue(module.inertMaterials, true) === 'text-gray-400' ? 'text-slate-500' : getColorForValue(module.inertMaterials, true)}`}>INERT</span>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <span className={`text-select-item ${getColorForValue(module.overchargeRate, true)}`}>{module.overchargeRate ? module.overchargeRate : "--"}</span>
                                                            <span className={`text-select-item ${getColorForValue(module.overchargeRate, true) === 'text-gray-400' ? 'text-slate-500' : getColorForValue(module.overchargeRate, true)}`}>OVERCHARGE</span>
                                                        </div>
                                                        {/* <div className="flex flex-col items-center">
                                                            <span className={`text-select-item ${getColorForValue(module.clustering, true)}`}>{module.clustering ? module.clustering : "--"}</span>
                                                            <span className={`text-select-item ${getColorForValue(module.clustering, true) === 'text-gray-400' ? 'text-slate-500' : getColorForValue(module.clustering, true)}`}>CLUSTERING</span>
                                                        </div> */}
                                                        <div className="flex flex-col items-center">
                                                            <span className={`text-select-item ${getColorForValue(module.shatterDamage, true)}`}>{module.shatterDamage ? module.shatterDamage : "--"}</span>
                                                            <span className={`text-select-item ${getColorForValue(module.shatterDamage, true) === 'text-gray-400' ? 'text-slate-500' : getColorForValue(module.shatterDamage, true)}`}>SHATTER DMG</span>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <span className={`text-select-item ${getColorForValue(module.extractionPowerMod, true)}`}>{module.extractionPowerMod ? module.extractionPowerMod : "--"}</span>
                                                            <span className={`text-select-item ${getColorForValue(module.extractionPowerMod, true) === 'text-gray-400' ? 'text-slate-500' : getColorForValue(module.extractionPowerMod, true)}`}>EXTRACT PWR MOD</span>
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
