import { useTranslation } from "react-i18next";

export default function GlobalActions() {
    const { t } = useTranslation()

    return (
        <div className="w-full flex items-center justify-end gap-4 p-4 border-t border-slate-800 mt-4">
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded">
                {t("workOrder.globalActions.export")}
            </button>
            <button className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded">
                {t("workOrder.globalActions.save")}
            </button>
        </div>
    )
}