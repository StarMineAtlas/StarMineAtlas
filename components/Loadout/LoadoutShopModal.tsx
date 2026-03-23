
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface LoadoutShopModalProps {
    open: boolean;
    onClose: () => void;
}

export function LoadoutShopModal({ open, onClose }: LoadoutShopModalProps) {
    const { t } = useTranslation();

    const [touched, setTouched] = useState(false);

    useEffect(() => {
        if (open) {
            setTouched(false);
        }
    }, [open]);

    const handleClose = () => {
        setTouched(false);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={v => { if (!v) handleClose(); }}>
            <DialogContent className="bg-slate-950 border border-slate-800 rounded-xl shadow-xl p-6 max-w-md w-full">
                <DialogHeader>
                    <DialogTitle className="text-cyan-200 text-2xl font-bold mb-2">{t("loadout.saveLoadout.title")}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-3 mt-2">
                    <p className="text-sm text-cyan-200">TEST</p>
                </div>
                <DialogFooter className="flex flex-row justify-end gap-2 mt-6">
                    <Button variant="secondary" onClick={handleClose} className="bg-slate-800 text-slate-200 hover:bg-slate-700 focus:ring-cyan-700/30 rounded-md px-4 py-2">{t("loadout.saveLoadout.cancelButton")}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
