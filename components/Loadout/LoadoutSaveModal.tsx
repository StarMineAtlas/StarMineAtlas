
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface LoadoutSaveModalProps {
    open: boolean;
    initialName: string;
    onClose: () => void;
    onSave: (name: string) => void;
}

export function LoadoutSaveModal({ open, initialName, onClose, onSave }: LoadoutSaveModalProps) {
    const { t } = useTranslation();

    const [name, setName] = useState<string | undefined>(undefined);
    const [touched, setTouched] = useState(false);

    useEffect(() => {
        if (open) {
            setName(undefined);
            setTimeout(() => setName(initialName), 0);
        }
    }, [open, initialName]);

    const handleSave = () => {
        setTouched(true);
        const value = name === undefined ? initialName : name.trim();
        if (value !== "") {
            onSave(value);
            setName(undefined);
            setTouched(false);
        }
    };

    const handleClose = () => {
        setName(undefined);
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
                    <label htmlFor="loadout-name" className="text-xs font-medium text-cyan-200 mb-1">{t("loadout.saveLoadout.nameLabel")}</label>
                    <Input
                        id="loadout-name"
                        value={name === undefined ? initialName : name}
                        onChange={e => setName(e.target.value)}
                        onBlur={() => setTouched(true)}
                        placeholder={t("loadout.saveLoadout.namePlaceholder")}
                        autoFocus
                        required
                        className="bg-slate-900 border border-slate-800 text-cyan-50 focus:border-cyan-700 focus:ring-cyan-700/20 rounded-md px-3 py-2 placeholder:text-slate-500"
                    />
                    {touched && (name === undefined ? initialName.trim() === "" : name.trim() === "") && (
                        <span className="text-xs text-red-500 mt-1">{t("loadout.saveLoadout.nameRequired")}</span>
                    )}
                </div>
                <DialogFooter className="flex flex-row justify-end gap-2 mt-6">
                    <Button variant="secondary" onClick={handleClose} className="bg-slate-800 text-slate-200 hover:bg-slate-700 focus:ring-cyan-700/30 rounded-md px-4 py-2">{t("loadout.saveLoadout.cancelButton")}</Button>
                    <Button onClick={handleSave} disabled={(name === undefined ? initialName.trim() === "" : name.trim() === "")} className="bg-cyan-700 text-white hover:bg-cyan-800 focus:ring-cyan-700/30 rounded-md px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed">{t("loadout.saveLoadout.saveButton")}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
