import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { WorkOrderData } from "@/models/WorkOrder";
import { Download, Trash } from "lucide-react";
import WorkOrderExportModal from "./WorkOrderExportModal";

interface WorkOrderListModalProps {
    open: boolean;
    onClose?: () => void;
}

export default function WorkOrderListModal({ open, onClose }: WorkOrderListModalProps) {
    const { t } = useTranslation()

    const [savedWorkOrders, setSavedWorkOrders] = useState<WorkOrderData[]>([])
    const [selectedWorkOrderForExport, setSelectedWorkOrderForExport] = useState<WorkOrderData | null>(null)
    const [openExportModal, setOpenExportModal] = useState(false)

    const formatTimestamp = (timestamp?: number) => {
        if (timestamp === undefined) {
            return "-"
        }

        return new Date(timestamp).toLocaleString()
    }

    useEffect(() => {
        if (open) {
            const existingData = localStorage.getItem("sma-work-orders")
            if (existingData) {
                setSavedWorkOrders(JSON.parse(existingData))
            } else {
                setSavedWorkOrders([])
            }
        }
    }, [open])

    const handleClose = () => {
        if (onClose) {
            onClose();
        }
    }

    const getUserNameById = (workOrder: WorkOrderData, userId: number): string => {
        return workOrder.usersList.find(user => user.id === userId)?.username || "Unknown"
    }

    const handleExport = (workOrder: WorkOrderData) => {
        if (!workOrder) {
            return
        }

        setSelectedWorkOrderForExport(workOrder)
        setOpenExportModal(true)
    }

    const handleDelete = (indexToDelete: number) => {
        if (!savedWorkOrders || savedWorkOrders.length === 0) {
            return
        } else {
            const existingData = localStorage.getItem("sma-work-orders")
            if (confirm(t("workOrder.listModal.deleteConfirmation"))) {
                if (existingData) {
                    const updatedData = JSON.parse(existingData).filter((_: WorkOrderData, i: number) => i !== indexToDelete)
                    localStorage.setItem("sma-work-orders", JSON.stringify(updatedData))
                    setSavedWorkOrders(updatedData)
                }
            }
        }
    }

    const handleCloseExportModal = () => {
        setOpenExportModal(false)
        setSelectedWorkOrderForExport(null)
    }


    return (
        <Dialog open={open} onOpenChange={v => { if (!v) handleClose(); }}>
            <DialogContent className="max-h-[85vh] overflow-hidden bg-slate-950 border border-slate-800 rounded-none md:rounded-xl shadow-xl p-6 dialog-xl">
                <DialogHeader>
                    <DialogTitle className="text-cyan-200 text-2xl font-bold mb-2">{t("workOrder.listModal.title")}</DialogTitle>
                </DialogHeader>
                <div className="mt-2 max-h-[65vh] overflow-y-auto pr-1">
                    {savedWorkOrders.length > 0 ? (
                        <div className="flex flex-col gap-12">
                            {savedWorkOrders.map((workOrder, index) => (
                                <div
                                    key={index}
                                    className="overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/30 shadow-lg shadow-cyan-950/10"
                                >
                                    {/* Card Header */}
                                    <div className="border-b border-slate-800 bg-slate-900/80 px-5 py-4 relative">
                                        <p className="text-xs font-medium uppercase tracking-[0.24em] text-cyan-500/80">
                                            {t("workOrder.listModal.workOrder")} #{index + 1}
                                        </p>
                                        <h3 className="mt-1 text-lg font-semibold text-cyan-100">
                                            {formatTimestamp(workOrder.timestamp)}
                                        </h3>
                                        <div className="flex flex-col md:flex-row gap-6 md:gap-0 justify-between mt-4 md:mt-8">
                                            <div className="flex flex-wrap">
                                                <span className="text-cyan-400 text-xs whitespace-nowrap pe-8 me-8 border-e border-slate-800">{workOrder.selectedRefinery?.terminal_name}</span>
                                                <span className="text-cyan-400 text-xs whitespace-nowrap">{workOrder.selectedMethod?.name}</span>
                                            </div>
                                            <div className="flex flex-wrap">
                                                <span className="text-cyan-400 text-xs whitespace-nowrap pe-8 me-8 border-e border-slate-800">{workOrder.selectedSellingTerminalName}</span>
                                                <span className="text-cyan-400 text-xs whitespace-nowrap">
                                                    {workOrder.finalPrice}
                                                    <span className="device-font"> aUEC</span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="relative md:absolute md:top-4 md:right-4 flex flex-row gap-4 mt-8 md:mt-0">
                                            <button
                                                onClick={() => handleExport(workOrder)}
                                                className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold py-2 px-4 rounded flex items-center">
                                                <Download className="inline-block w-4 h-4 me-2" />
                                                {t("workOrder.globalActions.export")}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(index)}
                                                className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold py-2 px-4 rounded flex items-center">
                                                <Trash className="w-4 h-4 me-2" />
                                                {t("workOrder.globalActions.delete")}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 xl:grid-cols-2">
                                        {/* Minerals Table */}
                                        <div className="p-5 col-span-1 xl:col-span-2">
                                            <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
                                                {t("workOrder.listModal.mineralsTable.title")}
                                            </h4>
                                            {workOrder.mineralsList.length > 0 ? (
                                                <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/60">
                                                    <table className="w-full min-w-[34rem] table-auto border-collapse text-left">
                                                        <thead>
                                                            <tr className="bg-slate-900/90">
                                                                <th className="border-b border-slate-800 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                                                                    {t("workOrder.listModal.mineralsTable.name")}
                                                                </th>
                                                                <th className="border-b border-slate-800 px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                                                                    {t("workOrder.listModal.mineralsTable.quality")}
                                                                </th>
                                                                <th className="border-b border-slate-800 px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                                                                    {t("workOrder.listModal.mineralsTable.quantity")}
                                                                </th>
                                                                <th className="border-b border-slate-800 px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                                                                    {t("workOrder.listModal.mineralsTable.yield")}
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {workOrder.mineralsList.map((mineral, mineralIndex) => (
                                                                <tr
                                                                    key={`${workOrder.timestamp ?? index}-${mineral.name}-${mineralIndex}`}
                                                                    className={mineralIndex % 2 === 0 ? "bg-slate-950/70" : "bg-slate-900/40"}
                                                                >
                                                                    <td className="border-b border-slate-800/80 px-4 py-3 text-xs font-medium text-cyan-50">
                                                                        {mineral.name}
                                                                    </td>
                                                                    <td className="border-b border-slate-800/80 px-4 py-3 text-center text-xs font-semibold text-slate-200">
                                                                        {mineral.quality}
                                                                    </td>
                                                                    <td className="border-b border-slate-800/80 px-4 py-3 text-center text-xs font-semibold text-slate-200">
                                                                        {mineral.quantity.toLocaleString()}
                                                                    </td>
                                                                    <td className="border-b border-slate-800/80 px-4 py-3 text-center text-xs font-semibold text-emerald-300">
                                                                        {mineral.yield}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="rounded-lg border border-dashed border-slate-800 bg-slate-950/50 px-4 py-6 text-sm text-slate-400">
                                                    {t("workOrder.listModal.noWorkOrders")}
                                                </div>
                                            )}
                                        </div>

                                        {/* Profit Table */}
                                        <div className="p-5">
                                            <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
                                                {t("workOrder.listModal.profitSharesTable.title")}
                                            </h4>
                                            {workOrder.profitShares.length > 0 ? (
                                                <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/60">
                                                    <table className="w-full min-w-[34rem] table-auto border-collapse text-left">
                                                        <thead>
                                                            <tr className="bg-slate-900/90">
                                                                <th className="border-b border-slate-800 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                                                                    {t("workOrder.listModal.profitSharesTable.user")}
                                                                </th>
                                                                <th className="border-b border-slate-800 px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                                                                    {t("workOrder.listModal.profitSharesTable.payment")}
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {workOrder.profitShares.map((profitShare, profitShareIndex) => (
                                                                <tr
                                                                    key={`${workOrder.timestamp ?? index}-${profitShare.userId}-${profitShareIndex}`}
                                                                    className={profitShareIndex % 2 === 0 ? "bg-slate-950/70" : "bg-slate-900/40"}
                                                                >
                                                                    <td className="border-b border-slate-800/80 px-4 py-3 text-xs font-medium text-cyan-50">
                                                                        {getUserNameById(workOrder, profitShare.userId)}
                                                                    </td>
                                                                    <td className="border-b border-slate-800/80 px-4 py-3 text-center text-xs font-semibold text-slate-200">
                                                                        {profitShare.share}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="rounded-lg border border-dashed border-slate-800 bg-slate-950/50 px-4 py-6 text-sm text-slate-400">
                                                    {t("workOrder.listModal.noProfitShares")}
                                                </div>
                                            )}
                                        </div>

                                        {/* Expenses Table */}
                                        <div className="p-5">
                                            <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
                                                {t("workOrder.listModal.expensesTable.title")}
                                            </h4>
                                            {workOrder.expensesList.length > 0 ? (
                                                <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/60">
                                                    <table className="w-full min-w-[34rem] table-auto border-collapse text-left">
                                                        <thead>
                                                            <tr className="bg-slate-900/90">
                                                                <th className="border-b border-slate-800 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                                                                    {t("workOrder.listModal.expensesTable.user")}
                                                                </th>
                                                                <th className="border-b border-slate-800 px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                                                                    {t("workOrder.listModal.expensesTable.amount")}
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {workOrder.expensesList.map((expense, expenseIndex) => (
                                                                <tr
                                                                    key={`${workOrder.timestamp ?? index}-${expense.userId}-${expenseIndex}`}
                                                                    className={expenseIndex % 2 === 0 ? "bg-slate-950/70" : "bg-slate-900/40"}
                                                                >
                                                                    <td className="border-b border-slate-800/80 px-4 py-3 text-xs font-medium text-cyan-50">
                                                                        {getUserNameById(workOrder, expense.userId)}
                                                                    </td>
                                                                    <td className="border-b border-slate-800/80 px-4 py-3 text-center text-xs font-semibold text-slate-200">
                                                                        {expense.amount}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="rounded-lg border border-dashed border-slate-800 bg-slate-950/50 px-4 py-6 text-sm text-slate-400">
                                                    {t("workOrder.listModal.noExpenses")}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="rounded-lg border border-dashed border-slate-800 bg-slate-900/40 px-4 py-6 text-center text-slate-400">{t("workOrder.listModal.noWorkOrders")}</p>
                    )}
                </div>
                <DialogFooter className="flex flex-row justify-end gap-2">
                    <Button variant="secondary" onClick={handleClose} className="bg-slate-800 text-slate-200 hover:bg-slate-700 focus:ring-cyan-700/30 rounded-md px-4 py-2">{t("workOrder.listModal.closeButton")}</Button>
                </DialogFooter>
            </DialogContent>
            <WorkOrderExportModal open={openExportModal} allDatas={selectedWorkOrderForExport} onClose={handleCloseExportModal} />
        </Dialog >
    );
}
