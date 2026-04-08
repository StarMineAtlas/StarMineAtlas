import { useTranslation } from "react-i18next";
import { WorkOrderData } from "@/models/WorkOrder";
import WorkOrderListModal from "./WorkOrderListModal";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { encodeUrlParams } from "@/lib/utils";
import { ClipboardList, Download, Save, Share2 } from "lucide-react";
import WorkOrderExportModal from "./WorkOrderExportModal";

interface GlobalActionsProps {
    allDatas: WorkOrderData | null
}

const LOCAL_STORAGE_KEY = "sma-work-orders"

export default function GlobalActions({ allDatas }: GlobalActionsProps) {
    const { t } = useTranslation()

    const [openListModal, setOpenListModal] = useState(false)
    const [openExportModal, setOpenExportModal] = useState(false)

    const handleExport = () => {
        if (!allDatas) {
            return
        }

        setOpenExportModal(true)
    }

    const handleSave = () => {
        if (!allDatas) {
            return
        }
        const existingData = localStorage.getItem(LOCAL_STORAGE_KEY)
        const newData = allDatas
        newData.timestamp = Date.now() // Add a timestamp to identify when the data was saved
        const updatedData = existingData ? [...JSON.parse(existingData), newData] : [newData]
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedData))
        toast({
            variant: "success",
            duration: 4000,
            title: t("workOrder.globalActions.saveSuccessTitle"),
            description: t("workOrder.globalActions.saveSuccessDescription"),
        })
    }

    const handleShowListModal = () => {
        setOpenListModal(true)
    }

    const handleShare = () => {
        if (!allDatas) {
            return
        }
        const encodedData = encodeUrlParams(allDatas)
        const shareableUrl = `${window.location.origin}${window.location.pathname}?preset=${encodedData}`
        navigator.clipboard.writeText(shareableUrl)
        toast({
            variant: "success",
            duration: 4000,
            title: t("workOrder.globalActions.share"),
            description: t("workOrder.globalActions.shareSuccessDescription"),
        })
    }


    return (
        <>
            <div className="w-full flex items-center justify-end gap-4 p-4 border-t border-slate-800 mt-4">
                <button
                    onClick={handleShare}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded flex items-center">
                    <Share2 className="inline-block w-4 h-4 me-2" />
                    {t("workOrder.globalActions.share")}
                </button>
                <button
                    onClick={handleShowListModal}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded flex items-center">
                    <ClipboardList className="inline-block w-4 h-4 me-2" />
                    {t("workOrder.globalActions.list")}
                </button>
                <button
                    onClick={handleExport}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded flex items-center">
                    <Download className="inline-block w-4 h-4 me-2" />
                    {t("workOrder.globalActions.export")}
                </button>
                <button
                    onClick={handleSave}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded flex items-center">
                    <Save className="inline-block w-4 h-4 me-2" />
                    {t("workOrder.globalActions.save")}
                </button>
            </div>
            <WorkOrderListModal open={openListModal} onClose={() => setOpenListModal(false)} />
            <WorkOrderExportModal open={openExportModal} allDatas={allDatas} onClose={() => setOpenExportModal(false)} />
        </>
    )
}