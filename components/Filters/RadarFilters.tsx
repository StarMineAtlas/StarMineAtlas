
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FC } from "react";
import { useTranslation } from "react-i18next";

interface RadarFiltersProps {
    minerals: string[];
    selectedMineral: string;
    onMineralChange: (mineral: string) => void;
    searchValue: string;
    onSearchChange: (val: string) => void;
}

export const RadarFilters: FC<RadarFiltersProps> = ({
    minerals,
    selectedMineral,
    onMineralChange,
    searchValue,
    onSearchChange,
}) => {
    const { t } = useTranslation();
    return (
        <div className="flex items-center gap-4 mb-6">
            <div>
                <label className="block text-xs text-start font-medium text-cyan-200 ms-2 mb-1" suppressHydrationWarning>{t("radar.mineral", "Mineral")}</label>
                <Select
                    value={selectedMineral === "" ? "all" : selectedMineral}
                    onValueChange={val => onMineralChange(val === "all" ? "" : val)}
                >
                    <SelectTrigger className="w-[180px] border-slate-800 bg-slate-900/50 text-cyan-50 focus:border-cyan-700 focus:ring-cyan-700/20">
                        <SelectValue placeholder={t("radar.allMinerals", "All Minerals")} />
                    </SelectTrigger>
                    <SelectContent className="border-slate-800 bg-slate-900">
                        <SelectItem value="all" className="text-cyan-50 focus:bg-slate-800 focus:text-cyan-300">{t("radar.allMinerals", "All Minerals")}</SelectItem>
                        {minerals.map(mineral => (
                            <SelectItem key={mineral} value={mineral} className="text-cyan-50 focus:bg-slate-800 focus:text-cyan-300">
                                {mineral}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <label className="block text-xs text-start font-medium text-cyan-200 ms-2 mb-1" suppressHydrationWarning>{t("radar.searchEcho", "Search Echo Number")}</label>
                <input
                    type="text"
                    value={searchValue}
                    onChange={e => onSearchChange(e.target.value)}
                    placeholder={t("radar.searchEchoPlaceholder", "Search by echo number...")}
                    className="w-[180px] border border-slate-800 bg-slate-900/50 text-cyan-50 rounded px-3 py-2 focus:border-cyan-700 focus:ring-cyan-700/20 outline-none"
                />
            </div>
        </div>
    );
};
