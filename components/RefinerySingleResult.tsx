import { FC } from "react";
import { useTranslation } from "react-i18next";

interface RefinerySingleResultProps {
    mineral: string;
    location: string;
    value: number | null;
}

export const RefinerySingleResult: FC<RefinerySingleResultProps> = ({ mineral, location, value }) => {
    const { t } = useTranslation();

    const getColorForValue = (val: number | null) => {
        if (val === null) return "text-gray-400";
        if (val > 0) return "text-green-400";
        if (val < 0) return "text-red-400";
        return "text-gray-400";
    }

    return (
        <div className="flex flex-col items-center justify-center w-full px-12">
            <div className="rounded-2xl border border-cyan-700 bg-gradient-to-br from-slate-900/90 to-cyan-950/80 shadow-xl px-8 py-10 max-w-md w-full text-center">
                <div className="mb-4 text-cyan-300 text-xs font-semibold uppercase tracking-widest">{t("refinery.methodTable.filters.oneResult")}</div>
                <div className="mb-2 text-lg text-cyan-100 font-bold">{mineral}</div>
                <div className="mb-4 text-cyan-200 text-sm">{location}</div>
                <div className={`text-4xl font-extrabold ${getColorForValue(value)}`}>
                    {value !== null ? value + '%' : "-"}
                </div>
            </div>
        </div>
    );
};
