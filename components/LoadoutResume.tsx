"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Loadout, LoadoutResumeModel } from "@/models/Loadout";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface LoadoutBlocProps {
    loadout: Loadout;
}

// Function to get color class based on value (positive = green, negative = red, zero or non-numeric = gray), with optional inverse coloring
const getColorForValue = (val: string | number | null | undefined, isInverse: boolean = false) => {
    if (val === null || val === undefined || val === "") return "text-gray-400";
    const num = typeof val === "string" ? parseFloat(val.replace(/[^-\d.]/g, "")) : val;
    if (isNaN(num)) return "text-gray-400";
    if (num > 0) return isInverse ? "text-red-400" : "text-green-400";
    if (num < 0) return isInverse ? "text-green-400" : "text-red-400";
    return "text-cyan-200";
};

// Function to add a "+" sign before positive numbers and keep negative numbers as they are.
const formatValueWithSign = (val: string | undefined) => {
    if (val?.includes('-')) return val;
    return val ? `+${val}` : val;
};

export const LoadoutResume: React.FC<LoadoutBlocProps> = ({
    loadout
}) => {
    const { t } = useTranslation();

    const [resume, setResume] = useState<LoadoutResumeModel>();
    const [minPourcentageEvolution, setMinPourcentageEvolution] = useState<number>(0);
    const [maxPourcentageEvolution, setMaxPourcentageEvolution] = useState<number>(0);
    const [extractionPowerPourcentageEvolution, setExtractionPowerPourcentageEvolution] = useState<number>(0);

    useEffect(() => {
        const resumeData: LoadoutResumeModel = {
            min_power: "0",
            max_power: "0",
            optimal_range: "0",
            max_range: "0",
            resistance: loadout.bloc[0].miningLaser?.resistance || "0",
            instability: loadout.bloc[0].miningLaser?.instability || "0",
            overcharge: loadout.bloc[0].modules[0]?.overchargeRate || "0",
            clustering: loadout.bloc[0].modules[0]?.clustering || "0",
            inert_material: loadout.bloc[0].miningLaser?.inert_materials || "0",
            optimal_charge_rate: loadout.bloc[0].miningLaser?.optimal_charge_rate || "0",
            optimal_charge_window: loadout.bloc[0].miningLaser?.optimal_charge_window || "0",
            shatter_damage: loadout.bloc[0].modules[0]?.shatterDamage || "0",
            extraction_power: "0"
        };
        loadout.bloc.forEach((bloc) => {
            if (bloc.miningLaser && bloc.isLaserActive) {
                const pourcentagePowerMod = bloc.modules.filter((module) => module?.isActive).map((module) => parseFloat(module?.laserPowerMod || "0")).reduce((acc, val) => acc + val, 0);
                resumeData.min_power = (parseFloat(resumeData.min_power || "0") + (parseFloat(bloc.miningLaser.min_power || "0")) * (1 + pourcentagePowerMod / 100)).toString();
                resumeData.max_power = (parseFloat(resumeData.max_power || "0") + (parseFloat(bloc.miningLaser.max_power || "0")) * (1 + pourcentagePowerMod / 100)).toString();
                resumeData.optimal_range = (parseFloat(resumeData.optimal_range || "0") + parseFloat(bloc.miningLaser.optimal_range || "0")).toString()
                resumeData.max_range = (parseFloat(resumeData.max_range || "0") + parseFloat(bloc.miningLaser.max_range || "0")).toString();
                const pourcentageExtractionPowerMod = bloc.modules.filter((module) => module?.isActive).map((module) => parseFloat(module?.extractionPowerMod || "0")).reduce((acc, val) => acc + val, 0);
                resumeData.extraction_power = (parseFloat(resumeData.extraction_power || "0") + (parseFloat(bloc.miningLaser.extract_power || "0")) * (1 + pourcentageExtractionPowerMod / 100)).toString();
            }
        });

        // calculate ranges per laser
        resumeData.optimal_range = (parseFloat(resumeData.optimal_range || "0") / (loadout.bloc.filter((bloc) => bloc.isLaserActive).length > 0 ? loadout.bloc.filter((bloc) => bloc.isLaserActive).length : 1)).toString() + "m";
        resumeData.max_range = (parseFloat(resumeData.max_range || "0") / (loadout.bloc.filter((bloc) => bloc.isLaserActive).length > 0 ? loadout.bloc.filter((bloc) => bloc.isLaserActive).length : 1)).toString() + "m";

        // calculate pourcentages
        const pourcentagesResistance = loadout.bloc.map((bloc) => {
            const laserResistance = bloc.isLaserActive ? parseFloat(bloc.miningLaser?.resistance || "0") : 0;
            const modulesResistance = bloc.modules.filter((module) => module?.isActive).map((module) => parseFloat(module?.resistance || "0")).reduce((acc, val) => acc + val, 0);
            return [laserResistance, modulesResistance];
        });
        pourcentagesResistance.push(loadout.gadgets.filter((gadget) => gadget?.isActive).map((gadget) => parseFloat(gadget?.resistance || "0")));
        resumeData.resistance = calcultateAdditionalPourcentage(pourcentagesResistance.flat()) + "%";

        const pourcentagesOvercharge = loadout.bloc.map((bloc) => {
            const modulesOvercharge = bloc.modules.filter((module) => module?.isActive).map((module) => parseFloat(module?.overchargeRate || "0")).reduce((acc, val) => acc + val, 0);
            return [modulesOvercharge];
        });
        pourcentagesOvercharge.push(loadout.gadgets.filter((gadget) => gadget?.isActive).map((gadget) => parseFloat(gadget?.overchargeRate || "0")));
        resumeData.overcharge = calcultateAdditionalPourcentage(pourcentagesOvercharge.flat()) + "%";

        const pourcentagesClustering = loadout.bloc.map((bloc) => {
            const modulesClustering = bloc.modules.filter((module) => module?.isActive).map((module) => parseFloat(module?.clustering || "0")).reduce((acc, val) => acc + val, 0);
            return [modulesClustering];
        });
        pourcentagesClustering.push(loadout.gadgets.filter((gadget) => gadget?.isActive).map((gadget) => parseFloat(gadget?.clustering || "0")));
        resumeData.clustering = calcultateAdditionalPourcentage(pourcentagesClustering.flat()) + "%";

        const pourcentagesInstability = loadout.bloc.map((bloc) => {
            const laserInstability = bloc.isLaserActive ? parseFloat(bloc.miningLaser?.instability || "0") : 0;
            const modulesInstability = bloc.modules.filter((module) => module?.isActive).map((module) => parseFloat(module?.instability || "0")).reduce((acc, val) => acc + val, 0);
            return [laserInstability, modulesInstability];
        });
        pourcentagesInstability.push(loadout.gadgets.filter((gadget) => gadget?.isActive).map((gadget) => parseFloat(gadget?.instability || "0")));
        resumeData.instability = calcultateAdditionalPourcentage(pourcentagesInstability.flat()) + "%";

        const pourcentagesInertMaterial = loadout.bloc.map((bloc) => {
            const laserInertMaterial = bloc.isLaserActive ? parseFloat(bloc.miningLaser?.inert_materials || "0") : 0;
            const modulesInertMaterial = bloc.modules.filter((module) => module?.isActive).map((module) => parseFloat(module?.inertMaterials || "0")).reduce((acc, val) => acc + val, 0);
            return [laserInertMaterial, modulesInertMaterial];
        });
        pourcentagesInertMaterial.push(loadout.gadgets.filter((gadget) => gadget?.isActive).map((gadget) => parseFloat(gadget?.inertMaterials || "0")));
        resumeData.inert_material = calcultateAdditionalPourcentage(pourcentagesInertMaterial.flat()) + "%";

        const pourcentagesOptimalChargeRate = loadout.bloc.map((bloc) => {
            const laserOptimalChargeRate = bloc.isLaserActive ? parseFloat(bloc.miningLaser?.optimal_charge_rate || "0") : 0;
            const modulesOptimalChargeRate = bloc.modules.filter((module) => module?.isActive).map((module) => parseFloat(module?.optimalChargeRate || "0")).reduce((acc, val) => acc + val, 0);
            return [laserOptimalChargeRate, modulesOptimalChargeRate];
        });
        pourcentagesOptimalChargeRate.push(loadout.gadgets.filter((gadget) => gadget?.isActive).map((gadget) => parseFloat(gadget?.optimalChargeRate || "0")));
        resumeData.optimal_charge_rate = calcultateAdditionalPourcentage(pourcentagesOptimalChargeRate.flat()) + "%";

        const pourcentagesOptimalChargeWindow = loadout.bloc.map((bloc) => {
            const laserOptimalChargeWindow = bloc.isLaserActive ? parseFloat(bloc.miningLaser?.optimal_charge_window || "0") : 0;
            const modulesOptimalChargeWindow = bloc.modules.filter((module) => module?.isActive).map((module) => parseFloat(module?.optimalChargeWindow || "0")).reduce((acc, val) => acc + val, 0);
            return [laserOptimalChargeWindow, modulesOptimalChargeWindow];
        });
        pourcentagesOptimalChargeWindow.push(loadout.gadgets.filter((gadget) => gadget?.isActive).map((gadget) => parseFloat(gadget?.optimalChargeWindow || "0")));
        resumeData.optimal_charge_window = calcultateAdditionalPourcentage(pourcentagesOptimalChargeWindow.flat()) + "%";

        const pourcentagesShatterDamage = loadout.bloc.map((bloc) => {
            const modulesShatterDamage = bloc.modules.filter((module) => module?.isActive).map((module) => parseFloat(module?.shatterDamage || "0")).reduce((acc, val) => acc + val, 0);
            return [modulesShatterDamage];
        });
        pourcentagesShatterDamage.push(loadout.gadgets.filter((gadget) => gadget?.isActive).map((gadget) => parseFloat(gadget?.shatterDamage || "0")));
        resumeData.shatter_damage = calcultateAdditionalPourcentage(pourcentagesShatterDamage.flat()) + "%";

        setResume(resumeData);

        // calculate pourcentage evolutions
        const baseMinPower = loadout.bloc.reduce((acc, bloc) => acc + (bloc.isLaserActive ? parseFloat(bloc.miningLaser?.min_power || "0") : 0), 0);
        const baseMaxPower = loadout.bloc.reduce((acc, bloc) => acc + (bloc.isLaserActive ? parseFloat(bloc.miningLaser?.max_power || "0") : 0), 0);
        const baseExtractionPower = loadout.bloc.reduce((acc, bloc) => acc + (bloc.isLaserActive ? parseFloat(bloc.miningLaser?.extract_power || "0") : 0), 0);
        setMinPourcentageEvolution(baseMinPower > 0 ? ((parseFloat(resumeData.min_power || "0") - baseMinPower) / baseMinPower) * 100 : 0);
        setMaxPourcentageEvolution(baseMaxPower > 0 ? ((parseFloat(resumeData.max_power || "0") - baseMaxPower) / baseMaxPower) * 100 : 0);
        setExtractionPowerPourcentageEvolution(baseExtractionPower > 0 ? ((parseFloat(resumeData.extraction_power || "0") - baseExtractionPower) / baseExtractionPower) * 100 : 0);
    }, [loadout]);

    const calcultateAdditionalPourcentage = (pourcentages: number[]) => {
        const base = 100;
        let result = base;
        pourcentages.forEach((p) => {
            result = result * (1 + p / 100);
        });
        const total = result - base;
        return total.toFixed(1) === "0.0" ? 0 : parseFloat(total.toFixed(1));
    }


    return (
        <div className="p-4 w-full bg-slate-900 rounded-xl text-cyan-200 col-span-1 md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex flex-col items-center">
                        <span className={`text-sm ${getColorForValue(minPourcentageEvolution)}`}>{resume?.min_power}</span>
                        {minPourcentageEvolution !== 0 && (
                            <span className={`text-resume-pourcentage ${getColorForValue(minPourcentageEvolution)}`}>
                                {'(' + (minPourcentageEvolution > 0 ? '+' : '') + minPourcentageEvolution.toFixed(1) + '%)'}
                            </span>
                        )}
                        <span className={`text-xs ${getColorForValue(minPourcentageEvolution)}`}>MIN PWR</span>
                    </div>
                </TooltipTrigger>
                <TooltipContent>{t("loadout.tooltips.minPower")}</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex flex-col items-center">
                        <span className={`text-sm ${getColorForValue(maxPourcentageEvolution)}`}>{resume?.max_power}</span>
                        {maxPourcentageEvolution !== 0 && (
                            <span className={`text-resume-pourcentage ${getColorForValue(maxPourcentageEvolution)}`}>
                                {'(' + (maxPourcentageEvolution > 0 ? '+' : '') + maxPourcentageEvolution.toFixed(1) + '%)'}
                            </span>
                        )}
                        <span className={`text-xs ${getColorForValue(maxPourcentageEvolution)}`}>MAX PWR</span>
                    </div>
                </TooltipTrigger>
                <TooltipContent>{t("loadout.tooltips.maxPower")}</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex flex-col items-center">
                        <span className="text-sm">{resume?.optimal_range}</span>
                        <span className="text-xs">OPT RNG</span>
                    </div>
                </TooltipTrigger>
                <TooltipContent>{t("loadout.tooltips.optimalRange")}</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex flex-col items-center">
                        <span className="text-sm">{resume?.max_range}</span>
                        <span className="text-xs">MAX RNG</span>
                    </div>
                </TooltipTrigger>
                <TooltipContent>{t("loadout.tooltips.maxRange")}</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex flex-col items-center">
                        <span className={`text-sm ${getColorForValue(resume?.resistance, true)}`}>{formatValueWithSign(resume?.resistance)}</span>
                        <span className={`text-xs ${getColorForValue(resume?.resistance, true)}`}>RESISTANCE</span>
                    </div>
                </TooltipTrigger>
                <TooltipContent>{t("loadout.tooltips.resistance")}</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex flex-col items-center">
                        <span className={`text-sm ${getColorForValue(resume?.instability, true)}`}>{formatValueWithSign(resume?.instability)}</span>
                        <span className={`text-xs ${getColorForValue(resume?.instability, true)}`}>INSTABILITY</span>
                    </div>
                </TooltipTrigger>
                <TooltipContent>{t("loadout.tooltips.instability")}</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex flex-col items-center">
                        <span className={`text-sm ${getColorForValue(resume?.overcharge, true)}`}>{formatValueWithSign(resume?.overcharge)}</span>
                        <span className={`text-xs ${getColorForValue(resume?.overcharge, true)}`}>OVERCHARGE</span>
                    </div>
                </TooltipTrigger>
                <TooltipContent>{t("loadout.tooltips.overchargeRate")}</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex flex-col items-center">
                        <span className={`text-sm ${getColorForValue(resume?.clustering)}`}>{formatValueWithSign(resume?.clustering)}</span>
                        <span className={`text-xs ${getColorForValue(resume?.clustering)}`}>CLUSTER</span>
                    </div>
                </TooltipTrigger>
                <TooltipContent>{t("loadout.tooltips.clustering")}</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex flex-col items-center">
                        <span className={`text-sm ${getColorForValue(resume?.inert_material, true)}`}>{formatValueWithSign(resume?.inert_material)}</span>
                        <span className={`text-xs ${getColorForValue(resume?.inert_material, true)}`}>INERT</span>
                    </div>
                </TooltipTrigger>
                <TooltipContent>{t("loadout.tooltips.inertMaterials")}</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex flex-col items-center">
                        <span className={`text-sm ${getColorForValue(resume?.optimal_charge_rate)}`}>{formatValueWithSign(resume?.optimal_charge_rate)}</span>
                        <span className={`text-xs ${getColorForValue(resume?.optimal_charge_rate)}`}>OPT CHRG RATE</span>
                    </div>
                </TooltipTrigger>
                <TooltipContent>{t("loadout.tooltips.optimalChargeRate")}</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex flex-col items-center">
                        <span className={`text-sm ${getColorForValue(resume?.optimal_charge_window)}`}>{formatValueWithSign(resume?.optimal_charge_window)}</span>
                        <span className={`text-xs ${getColorForValue(resume?.optimal_charge_window)}`}>OPT CHRG WIN</span>
                    </div>
                </TooltipTrigger>
                <TooltipContent>{t("loadout.tooltips.optimalChargeWindow")}</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex flex-col items-center">
                        <span className={`text-sm ${getColorForValue(resume?.shatter_damage, true)}`}>{formatValueWithSign(resume?.shatter_damage)}</span>
                        <span className={`text-xs ${getColorForValue(resume?.shatter_damage, true)}`}>SHATTER</span>
                    </div>
                </TooltipTrigger>
                <TooltipContent>{t("loadout.tooltips.shatterDamage")}</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex flex-col items-center">
                        <span className={`text-sm ${getColorForValue(extractionPowerPourcentageEvolution)}`}>{resume?.extraction_power}</span>
                        {extractionPowerPourcentageEvolution !== 0 && (
                            <span className={`text-resume-pourcentage ${getColorForValue(extractionPowerPourcentageEvolution)}`}>
                                {'(' + (extractionPowerPourcentageEvolution > 0 ? '+' : '') + extractionPowerPourcentageEvolution.toFixed(1) + '%)'}
                            </span>
                        )}
                        <span className={`text-xs ${getColorForValue(extractionPowerPourcentageEvolution)}`}>EXTR PWR</span>
                    </div>
                </TooltipTrigger>
                <TooltipContent>{t("loadout.tooltips.extractionPower")}</TooltipContent>
            </Tooltip>
        </div>
    );
};
