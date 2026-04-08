import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Download } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { downloadJsonFile, prepareExportData } from "@/lib/utils";
import { WorkOrderData, WORK_ORDER_EXPORT_FORMATS, type WorkOrderExportFormat } from "@/models/WorkOrder";

interface WorkOrderExportModalProps {
    open: boolean;
    allDatas: WorkOrderData | null;
    onClose?: () => void;
}

export default function WorkOrderExportModal({ open, allDatas, onClose }: WorkOrderExportModalProps) {
    const { t } = useTranslation();
    const [selectedFormat, setSelectedFormat] = useState<WorkOrderExportFormat>("all");

    useEffect(() => {
        if (open) {
            setSelectedFormat("all");
        }
    }, [open]);

    const handleClose = () => {
        if (onClose) {
            onClose();
        }
    };

    const handleExport = () => {
        if (!allDatas) {
            return;
        }

        const exportData = prepareExportData(allDatas, allDatas.usersList, selectedFormat);
        downloadJsonFile(exportData, "work_order_data.json");
        handleClose();
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
            <DialogContent className="border border-slate-800 bg-slate-950 text-slate-50 shadow-xl sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-cyan-200 text-2xl font-bold">
                        {t("workOrder.exportModal.title")}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        {t("workOrder.exportModal.description")}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-3">
                    <label className="text-sm font-medium text-cyan-100" htmlFor="work-order-export-format">
                        {t("workOrder.exportModal.formatLabel")}
                    </label>
                    <Select value={selectedFormat} onValueChange={(value) => setSelectedFormat(value as WorkOrderExportFormat)}>
                        <SelectTrigger
                            id="work-order-export-format"
                            className="w-full border-slate-800 bg-slate-900/50 text-cyan-50 focus:border-cyan-700 focus:ring-cyan-700/20"
                        >
                            <SelectValue placeholder={t("workOrder.exportModal.formatPlaceholder")} />
                        </SelectTrigger>
                        <SelectContent className="border-slate-800 bg-slate-900">
                            {WORK_ORDER_EXPORT_FORMATS.map((format) => (
                                <SelectItem
                                    key={format}
                                    value={format}
                                    className="text-cyan-50 focus:bg-slate-800 focus:text-cyan-300"
                                >
                                    {t(`workOrder.exportModal.formats.${format}`)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" className="border-slate-800 bg-slate-900 text-slate-100 hover:bg-slate-800" onClick={handleClose}>
                        {t("workOrder.exportModal.cancel")}
                    </Button>
                    <Button type="button" className="bg-orange-500 text-white hover:bg-orange-600" onClick={handleExport} disabled={!allDatas}>
                        <Download className="w-4 h-4" />
                        {t("workOrder.globalActions.export")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}