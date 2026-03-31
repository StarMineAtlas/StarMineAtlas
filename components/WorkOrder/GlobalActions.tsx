import { useTranslation } from "react-i18next";
import { WorkOrderData, WorkOrderExportData } from "@/models/WorkOrder";
import WorkOrderListModal from "./WorkOrderListModal";
import { useState } from "react";
import { prepareExportData } from "@/lib/utils";

interface GlobalActionsProps {
    allDatas: WorkOrderData | null
}

const LOCAL_STORAGE_KEY = "sma-work-orders"

export default function GlobalActions({ allDatas }: GlobalActionsProps) {
    const { t } = useTranslation()

    const [openListModal, setOpenListModal] = useState(false)

    const handleExport = () => {
        // export the data as a JSON file
        if (!allDatas) {
            return
        } else {
            const exportData = prepareExportData(allDatas, allDatas.usersList)
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData))
            const downloadAnchorNode = document.createElement('a')
            downloadAnchorNode.setAttribute("href", dataStr)
            downloadAnchorNode.setAttribute("download", "work_order_data.json")
            document.body.appendChild(downloadAnchorNode) // required for firefox
            downloadAnchorNode.click()
            downloadAnchorNode.remove()
        }
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
    }

    const handleShowListModal = () => {
        setOpenListModal(true)
    }

    return (
        <>
            <div className="w-full flex items-center justify-end gap-4 p-4 border-t border-slate-800 mt-4">
                <button
                    onClick={handleShowListModal}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded">
                    {t("workOrder.globalActions.list")}
                </button>
                <button
                    onClick={handleExport}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded">
                    {t("workOrder.globalActions.export")}
                </button>
                <button
                    onClick={handleSave}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded">
                    {t("workOrder.globalActions.save")}
                </button>
            </div>
            <WorkOrderListModal open={openListModal} onClose={() => setOpenListModal(false)} />
        </>
    )
}