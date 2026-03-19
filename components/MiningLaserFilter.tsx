import React from "react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";

interface MiningLaserFilterProps {
    laserNames: string[];
    sizes: string[];
    locations: string[];
    selectedName: string;
    selectedSize: string;
    selectedLocation: string;
    onNameChange: (name: string) => void;
    onSizeChange: (size: string) => void;
    onLocationChange: (location: string) => void;
}

const sizeToShipName: Record<string, string> = {
    "0": "Roc",
    "1": "Prospector",
    "2": "Mole",
};

export const MiningLaserFilter: React.FC<MiningLaserFilterProps> = ({
    laserNames,
    sizes,
    locations,
    selectedName,
    selectedSize,
    selectedLocation,
    onNameChange,
    onSizeChange,
    onLocationChange,
}) => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
            <div>
                <label className="block text-xs font-medium text-cyan-200 ms-2 mb-1" suppressHydrationWarning>{t("miningLasers.filters.laser")}</label>
                <Select
                    value={selectedName === "" ? "all" : selectedName}
                    onValueChange={val => onNameChange(val === "all" ? "" : val)}
                >
                    <SelectTrigger className="w-[180px] border-slate-800 bg-slate-900/50 text-cyan-50 focus:border-cyan-700 focus:ring-cyan-700/20">
                        <SelectValue placeholder={t("miningLasers.filters.allLasers")} />
                    </SelectTrigger>
                    <SelectContent className="border-slate-800 bg-slate-900">
                        <SelectItem value="all" className="text-cyan-50 focus:bg-slate-800 focus:text-cyan-300">{t("miningLasers.filters.allLasers")}</SelectItem>
                        {laserNames.map(name => (
                            <SelectItem key={name} value={name} className="text-cyan-50 focus:bg-slate-800 focus:text-cyan-300">{name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <label className="block text-xs font-medium text-cyan-200 ms-2 mb-1" suppressHydrationWarning>{t("miningLasers.filters.size")}</label>
                <Select
                    value={selectedSize === "" ? "all" : selectedSize}
                    onValueChange={val => onSizeChange(val === "all" ? "" : val)}
                >
                    <SelectTrigger className="w-[180px] border-slate-800 bg-slate-900/50 text-cyan-50 focus:border-cyan-700 focus:ring-cyan-700/20">
                        <SelectValue placeholder={t("miningLasers.filters.allSizes")} />
                    </SelectTrigger>
                    <SelectContent className="border-slate-800 bg-slate-900">
                        <SelectItem value="all" className="text-cyan-50 focus:bg-slate-800 focus:text-cyan-300">{t("miningLasers.filters.allSizes")}</SelectItem>
                        {sizes.map(size => (
                            <SelectItem key={size} value={size} className="text-cyan-50 focus:bg-slate-800 focus:text-cyan-300">{sizeToShipName[size]}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <label className="block text-xs font-medium text-cyan-200 ms-2 mb-1" suppressHydrationWarning>{t("miningLasers.filters.location")}</label>
                <Select
                    value={selectedLocation === "" ? "all" : selectedLocation}
                    onValueChange={val => onLocationChange(val === "all" ? "" : val)}
                >
                    <SelectTrigger className="w-[180px] border-slate-800 bg-slate-900/50 text-cyan-50 focus:border-cyan-700 focus:ring-cyan-700/20">
                        <SelectValue placeholder={t("miningLasers.filters.allLocations")} />
                    </SelectTrigger>
                    <SelectContent className="border-slate-800 bg-slate-900">
                        <SelectItem value="all" className="text-cyan-50 focus:bg-slate-800 focus:text-cyan-300">{t("miningLasers.filters.allLocations")}</SelectItem>
                        {locations.map(location => (
                            <SelectItem key={location} value={location} className="text-cyan-50 focus:bg-slate-800 focus:text-cyan-300">{location}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
};
