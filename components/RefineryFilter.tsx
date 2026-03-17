import React from "react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";

interface RefineryFilterProps {
    minerals: string[];
    locations: string[];
    selectedMineral: string;
    selectedLocation: string;
    onMineralChange: (mineral: string) => void;
    onLocationChange: (location: string) => void;
}

export const RefineryFilter: React.FC<RefineryFilterProps> = ({
    minerals,
    locations,
    selectedMineral,
    selectedLocation,
    onMineralChange,
    onLocationChange,
}) => {
    const { t } = useTranslation();

    return (
        <div className="flex gap-4 mb-6">
            <div>
                <label className="block text-xs font-medium text-cyan-200 ms-2 mb-1">{t("refinery.methodTable.filters.mineral")}</label>
                <Select
                    value={selectedMineral === "" ? "all" : selectedMineral}
                    onValueChange={val => onMineralChange(val === "all" ? "" : val)}
                >
                    <SelectTrigger className="w-[180px] border-slate-800 bg-slate-900/50 text-cyan-50 focus:border-cyan-700 focus:ring-cyan-700/20">
                        <SelectValue placeholder={t("refinery.methodTable.filters.allMinerals")} />
                    </SelectTrigger>
                    <SelectContent className="border-slate-800 bg-slate-900">
                        <SelectItem value="all" className="text-cyan-50 focus:bg-slate-800 focus:text-cyan-300">{t("refinery.methodTable.filters.allMinerals")}</SelectItem>
                        {minerals.map(mineral => (
                            <SelectItem key={mineral} value={mineral} className="text-cyan-50 focus:bg-slate-800 focus:text-cyan-300">
                                {mineral}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <label className="block text-xs font-medium text-cyan-200 ms-2 mb-1">{t("refinery.methodTable.filters.location")}</label>
                <Select
                    value={selectedLocation === "" ? "all" : selectedLocation}
                    onValueChange={val => onLocationChange(val === "all" ? "" : val)}
                >
                    <SelectTrigger className="w-[180px] border-slate-800 bg-slate-900/50 text-cyan-50 focus:border-cyan-700 focus:ring-cyan-700/20">
                        <SelectValue placeholder={t("refinery.methodTable.filters.allLocations")} />
                    </SelectTrigger>
                    <SelectContent className="border-slate-800 bg-slate-900">
                        <SelectItem value="all" className="text-cyan-50 focus:bg-slate-800 focus:text-cyan-300">{t("refinery.methodTable.filters.allLocations")}</SelectItem>
                        {locations.map(location => (
                            <SelectItem key={location} value={location} className="text-cyan-50 focus:bg-slate-800 focus:text-cyan-300">
                                {location}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
};
