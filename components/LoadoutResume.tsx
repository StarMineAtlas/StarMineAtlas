"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loadout, LoadoutResumeModel } from "@/models/Loadout";


interface LoadoutBlocProps {
    loadout: Loadout;
}

export const LoadoutResume: React.FC<LoadoutBlocProps> = ({
    loadout
}) => {
    const { t } = useTranslation();

    const [resume, setResume] = useState<LoadoutResumeModel>();

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
            <div className="flex flex-col items-center">
                <span className="text-sm">{resume?.min_power}</span>
                <span className="text-xs">MIN PWR</span>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-sm">{resume?.max_power}</span>
                <span className="text-xs">MAX PWR</span>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-sm">{resume?.optimal_range}</span>
                <span className="text-xs">OPT RNG</span>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-sm">{resume?.max_range}</span>
                <span className="text-xs">MAX RNG</span>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-sm">{resume?.resistance}</span>
                <span className="text-xs">RESISTANCE</span>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-sm">{resume?.instability}</span>
                <span className="text-xs">INSTABILITY</span>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-sm">{resume?.overcharge}</span>
                <span className="text-xs">OVERCHARGE</span>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-sm">{resume?.clustering}</span>
                <span className="text-xs">CLUSTER</span>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-sm">{resume?.inert_material}</span>
                <span className="text-xs">INERT</span>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-sm">{resume?.optimal_charge_rate}</span>
                <span className="text-xs">OPT CHRG RATE</span>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-sm">{resume?.optimal_charge_window}</span>
                <span className="text-xs">OPT CHRG WIN</span>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-sm">{resume?.shatter_damage}</span>
                <span className="text-xs">SHATTER</span>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-sm">{resume?.extraction_power}</span>
                <span className="text-xs">EXTR PWR</span>
            </div>
        </div>
    );
};
