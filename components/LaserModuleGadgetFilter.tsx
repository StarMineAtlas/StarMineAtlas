import React from "react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";


interface MiningLaserFilterProps {
    laserNames: string[];
    itemTypes?: string[];
    sizes?: string[];
    locations: string[];
    selectedName: string;
    selectedItemType?: string;
    selectedSize?: string;
    selectedLocation: string;
    onNameChange: (name: string) => void;
    onItemTypeChange?: (itemType: string) => void;
    onSizeChange?: (size: string) => void;
    onLocationChange: (location: string) => void;
};

const sizeToShipName: Record<string, string> = {
    "0": "Roc",
    "1": "Prospector",
    "2": "Mole",
};

export const LaserModuleGadgetFilter: React.FC<MiningLaserFilterProps> = ({
    laserNames,
    itemTypes,
    sizes,
    locations,
    selectedName,
    selectedItemType,
    selectedSize,
    selectedLocation,
    onNameChange,
    onItemTypeChange,
    onSizeChange,
    onLocationChange,
}) => {
    const { t } = useTranslation();
    const urlParam = window.location.pathname.includes("mining-lasers") ? "laser" : "moduleGadget";

    return (
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
            <div>
                <label className="block text-xs font-medium text-cyan-200 ms-2 mb-1" suppressHydrationWarning>{t(`laserModuleGadgetFilters.${urlParam}`)}</label>
                <Select
                    value={selectedName === "" ? "all" : selectedName}
                    onValueChange={val => onNameChange(val === "all" ? "" : val)}
                >
                    <SelectTrigger className="w-[180px] border-slate-800 bg-slate-900/50 text-cyan-50 focus:border-cyan-700 focus:ring-cyan-700/20">
                        <SelectValue placeholder={t(`laserModuleGadgetFilters.all${urlParam.charAt(0).toUpperCase() + urlParam.slice(1)}s`)} />
                    </SelectTrigger>
                    <SelectContent className="border-slate-800 bg-slate-900">
                        <SelectItem value="all" className="text-cyan-50 focus:bg-slate-800 focus:text-cyan-300">{t(`laserModuleGadgetFilters.all${urlParam.charAt(0).toUpperCase() + urlParam.slice(1)}s`)}</SelectItem>
                        {laserNames.map(name => (
                            <SelectItem key={name} value={name} className="text-cyan-50 focus:bg-slate-800 focus:text-cyan-300">{name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {sizes && sizes.length > 0 && onSizeChange && (
                <div>
                    <label className="block text-xs font-medium text-cyan-200 ms-2 mb-1" suppressHydrationWarning>{t("laserModuleGadgetFilters.size")}</label>
                    <Select
                        value={selectedSize === undefined || selectedSize === "" ? "all" : selectedSize}
                        onValueChange={val => onSizeChange(val === "all" ? "" : val)}
                    >
                        <SelectTrigger className="w-[180px] border-slate-800 bg-slate-900/50 text-cyan-50 focus:border-cyan-700 focus:ring-cyan-700/20">
                            <SelectValue placeholder={t("laserModuleGadgetFilters.allSizes") || "All Sizes"} />
                        </SelectTrigger>
                        <SelectContent className="border-slate-800 bg-slate-900">
                            <SelectItem value="all" className="text-cyan-50 focus:bg-slate-800 focus:text-cyan-300">{t("laserModuleGadgetFilters.allSizes") || "All Sizes"}</SelectItem>
                            {sizes.map(size => (
                                <SelectItem key={size} value={size} className="text-cyan-50 focus:bg-slate-800 focus:text-cyan-300">{sizeToShipName[size] || size}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
            {itemTypes && itemTypes.length > 0 && onItemTypeChange && (
                <div>
                    <label className="block text-xs font-medium text-cyan-200 ms-2 mb-1" suppressHydrationWarning>{t("laserModuleGadgetFilters.itemType")}</label>
                    <Select
                        value={selectedItemType === undefined || selectedItemType === "" ? "all" : selectedItemType}
                        onValueChange={val => onItemTypeChange(val === "all" ? "" : val)}
                    >
                        <SelectTrigger className="w-[180px] border-slate-800 bg-slate-900/50 text-cyan-50 focus:border-cyan-700 focus:ring-cyan-700/20">
                            <SelectValue placeholder={t("laserModuleGadgetFilters.allItemTypes") || "All Types"} />
                        </SelectTrigger>
                        <SelectContent className="border-slate-800 bg-slate-900">
                            <SelectItem value="all" className="text-cyan-50 focus:bg-slate-800 focus:text-cyan-300">{t("laserModuleGadgetFilters.allItemTypes") || "All Types"}</SelectItem>
                            {itemTypes.map(type => (
                                <SelectItem key={type} value={type} className="text-cyan-50 focus:bg-slate-800 focus:text-cyan-300">{type}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
            <div>
                <label className="block text-xs font-medium text-cyan-200 ms-2 mb-1" suppressHydrationWarning>{t("laserModuleGadgetFilters.location")}</label>
                <Select
                    value={selectedLocation === "" ? "all" : selectedLocation}
                    onValueChange={val => onLocationChange(val === "all" ? "" : val)}
                >
                    <SelectTrigger className="w-[180px] border-slate-800 bg-slate-900/50 text-cyan-50 focus:border-cyan-700 focus:ring-cyan-700/20">
                        <SelectValue placeholder={t("laserModuleGadgetFilters.allLocations")} />
                    </SelectTrigger>
                    <SelectContent className="border-slate-800 bg-slate-900">
                        <SelectItem value="all" className="text-cyan-50 focus:bg-slate-800 focus:text-cyan-300">{t("laserModuleGadgetFilters.allLocations")}</SelectItem>
                        {locations.map(location => (
                            <SelectItem key={location} value={location} className="text-cyan-50 focus:bg-slate-800 focus:text-cyan-300">{location}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
};
