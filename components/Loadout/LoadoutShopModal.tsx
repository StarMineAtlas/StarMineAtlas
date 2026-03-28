
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { API_UEX_BASE_URL, UEX_API_ENDPOINTS } from "@/lib/api-endpoints";
import { Loadout } from "@/models/Loadout";
import { MiningLaserPrices } from "@/models/MiningLaser";
import { ModuleGadgetPrices } from "@/models/ModuleGadget";
import { Store } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface LoadoutShopModalProps {
    open: boolean;
    loadout: Loadout;
    onClose: () => void;
}

export function LoadoutShopModal({ open, loadout, onClose }: LoadoutShopModalProps) {
    const { t } = useTranslation();

    const [touched, setTouched] = useState(false);
    const [loading, setLoading] = useState(false);


    const [uniqueLasers, setUniqueLasers] = useState<number[]>([]);
    const [uniqueModules, setUniqueModules] = useState<number[]>([]);
    const [uniqueGadgets, setUniqueGadgets] = useState<number[]>([]);

    // Add counting of quantities by id
    const [itemCounts, setItemCounts] = useState<{
        lasers: Record<number, number>;
        modules: Record<number, number>;
        gadgets: Record<number, number>;
    }>({
        lasers: {},
        modules: {},
        gadgets: {}
    });

    //prices for all unique items in the loadout, grouped by type (laser, module, gadget) and unique id
    const [itemPrices, setItemPrices] = useState<{
        lasers: Record<number, (MiningLaserPrices | ModuleGadgetPrices)[]>;
        modules: Record<number, (MiningLaserPrices | ModuleGadgetPrices)[]>;
        gadgets: Record<number, (MiningLaserPrices | ModuleGadgetPrices)[]>;
    }>({
        lasers: {},
        modules: {},
        gadgets: {}
    });

    useEffect(() => {
        if (open) {
            setTouched(false);
        }
    }, [open]);


    useEffect(() => {
        if (!open || touched) return;
        setLoading(true);
        extractUniqueItemsAndCounts();
    }, [loadout, open]);

    useEffect(() => {
        setLoading(true);
        fetchItemPrices().then(() => {
            setLoading(false);
        });
    }, [uniqueLasers, uniqueModules, uniqueGadgets]);

    useEffect(() => {
        if (!open) return;
    }, [itemPrices, open]);


    // New function that extracts unique ids AND counts quantities by id
    const extractUniqueItemsAndCounts = () => {
        const lasers = new Set<number>();
        const modules = new Set<number>();
        const gadgets = new Set<number>();

        const laserCounts: Record<number, number> = {};
        const moduleCounts: Record<number, number> = {};
        const gadgetCounts: Record<number, number> = {};

        loadout?.bloc?.forEach(b => {
            if (b.miningLaser) {
                lasers.add(b.miningLaser.id);
                laserCounts[b.miningLaser.id] = (laserCounts[b.miningLaser.id] || 0) + 1;
            }
            b.modules.forEach(m => {
                if (m) {
                    modules.add(m.id);
                    moduleCounts[m.id] = (moduleCounts[m.id] || 0) + 1;
                }
            });
        });

        loadout?.gadgets?.forEach(g => {
            if (g) {
                gadgets.add(g.id);
                gadgetCounts[g.id] = (gadgetCounts[g.id] || 0) + 1;
            }
        });

        setUniqueLasers(Array.from(lasers).filter(id => id !== null && id !== undefined) as number[]);
        setUniqueModules(Array.from(modules).filter(id => id !== null && id !== undefined) as number[]);
        setUniqueGadgets(Array.from(gadgets).filter(id => id !== null && id !== undefined) as number[]);
        setItemCounts({
            lasers: laserCounts,
            modules: moduleCounts,
            gadgets: gadgetCounts
        });
    };

    const fetchItemPrices = async () => {
        //fetch prices for all unique items in the loadout, grouped by type (laser, module, gadget) and unique id
        const laserPrices: Record<number, (MiningLaserPrices | ModuleGadgetPrices)[]> = {};
        const modulePrices: Record<number, (MiningLaserPrices | ModuleGadgetPrices)[]> = {};
        const gadgetPrices: Record<number, (MiningLaserPrices | ModuleGadgetPrices)[]> = {};

        //fetch laser prices
        await Promise.all(uniqueLasers.map(async (id) => {
            if (id === null || id === undefined) return;
            const prices = await fetch(API_UEX_BASE_URL + UEX_API_ENDPOINTS.itemsPrices + id)
            const json = prices ? await prices.json() : [];
            laserPrices[id] = json && json.data.sort((a: MiningLaserPrices | ModuleGadgetPrices, b: MiningLaserPrices | ModuleGadgetPrices) => a.price_buy - b.price_buy) ? json.data : [];
        }));

        //fetch module prices
        await Promise.all(uniqueModules.map(async (id) => {
            if (id === null || id === undefined) return;
            const prices = await fetch(API_UEX_BASE_URL + UEX_API_ENDPOINTS.itemsPrices + id)
            const json = prices ? await prices.json() : [];
            modulePrices[id] = json && json.data.sort((a: MiningLaserPrices | ModuleGadgetPrices, b: MiningLaserPrices | ModuleGadgetPrices) => a.price_buy - b.price_buy) ? json.data : [];
        }));

        //fetch gadget prices
        await Promise.all(uniqueGadgets.map(async (id) => {
            if (id === null || id === undefined) return;
            const prices = await fetch(API_UEX_BASE_URL + UEX_API_ENDPOINTS.itemsPrices + id)
            const json = prices ? await prices.json() : [];
            gadgetPrices[id] = json && json.data.sort((a: MiningLaserPrices | ModuleGadgetPrices, b: MiningLaserPrices | ModuleGadgetPrices) => a.price_buy - b.price_buy) ? json.data : [];
        }));

        setItemPrices({
            lasers: laserPrices,
            modules: modulePrices,
            gadgets: gadgetPrices
        });
    };

    const handleClose = () => {
        setTouched(false);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={v => { if (!v) handleClose(); }}>
            <DialogContent className="bg-slate-950 border border-slate-800 rounded-none md:rounded-xl shadow-xl p-6 dialog-xl max-h-[60vh] overflow-y-scroll">
                <DialogHeader>
                    <DialogTitle className="text-cyan-200 text-2xl font-bold mb-2">{t("loadout.shopLoadout.title")}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-6 mt-2">
                    <p className="text-sm text-cyan-200">{t("loadout.shopLoadout.description")}</p>
                    {
                        loading && Object.keys(itemPrices.lasers).length === 0 && Object.keys(itemPrices.modules).length === 0 && Object.keys(itemPrices.gadgets).length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-lg border border-slate-800 bg-slate-900/30 py-16 w-full mt-8">
                                <Store className="mb-4 h-12 w-12 text-slate-700 animate-spin" />
                                <p className="text-lg text-slate-400" suppressHydrationWarning>{t("loadout.shopLoadout.loading")}</p>
                            </div>
                        ) : (
                            <>
                                {
                                    uniqueLasers.length !== 0 && (
                                        <>
                                            <h3 className="text-cyan-200 text-lg font-semibold mt-4">{t("loadout.shopLoadout.lasers")}</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
                                                {
                                                    uniqueLasers.map(id => (
                                                        <div className="flex flex-col" key={id}>
                                                            <span className="text-slate-200 mb-2">
                                                                {itemPrices.lasers[id]?.[0]?.item_name}
                                                                {itemCounts.lasers[id] ? (
                                                                    <span className="ml-2 text-xs text-cyan-400">x{itemCounts.lasers[id]}</span>
                                                                ) : null}
                                                            </span>
                                                            <div style={{ maxHeight: '15rem', overflowY: 'scroll' }}>
                                                                <div className="overflow-x-auto rounded-xl shadow-lg border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-md w-full">
                                                                    <table className="w-full table-auto border-collapse text-left">
                                                                        <thead>
                                                                            <tr className="bg-slate-900/80">
                                                                                <th className="px-6 py-4 text-cyan-300 font-semibold text-xs md:text-sm border border-slate-700" style={{ minWidth: '10rem', maxWidth: '10rem', width: '10rem' }}>{t('loadout.shopLoadout.location') || 'Location'}</th>
                                                                                <th className="px-6 py-4 text-cyan-300 font-semibold text-xs md:text-sm border border-slate-700 text-center" style={{ minWidth: '10rem', maxWidth: '10rem', width: '10rem' }}>{t('loadout.shopLoadout.price') || 'Price'}</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {
                                                                                itemPrices.lasers[id]?.length === 0 ? (
                                                                                    <tr className="bg-slate-950/70 hover:bg-cyan-950/40 hover:shadow-md transition-colors duration-200">
                                                                                        <td className="px-6 py-4 border border-slate-700 font-medium text-cyan-100 text-xs md:text-sm" colSpan={2}>{t("loadout.shopLoadout.noOffers")}</td>
                                                                                    </tr>
                                                                                ) : (
                                                                                    itemPrices.lasers[id]?.length > 0 && itemPrices.lasers[id]?.map((offer, index) => (
                                                                                        <tr key={offer.item_name + index} className="bg-slate-950/70 hover:bg-cyan-950/40 hover:shadow-md transition-colors duration-200">
                                                                                            <td className="px-6 py-4 border border-slate-700 font-medium text-cyan-100 text-xs md:text-sm">{offer.terminal_name}</td>
                                                                                            <td className="px-6 py-4 border border-slate-700 font-semibold text-xs md:text-sm text-center text-cyan-200">
                                                                                                <span>{offer.price_buy}</span>
                                                                                                <span className="device-font"> aUEC</span>
                                                                                            </td>
                                                                                        </tr>
                                                                                    ))
                                                                                )
                                                                            }
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </>
                                    )
                                }
                                {
                                    uniqueModules.length !== 0 && (
                                        <>
                                            <hr className="mt-4 border-slate-700" />
                                            <h3 className="text-cyan-200 text-lg font-semibold mt-4">{t("loadout.shopLoadout.modules")}</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
                                                {
                                                    uniqueModules.map(id => (
                                                        <div className="flex flex-col" key={id}>
                                                            <span className="text-slate-200 mb-2">
                                                                {itemPrices.modules[id]?.[0]?.item_name}
                                                                {itemCounts.modules[id] ? (
                                                                    <span className="ml-2 text-xs text-cyan-400">x{itemCounts.modules[id]}</span>
                                                                ) : null}
                                                            </span>
                                                            <div style={{ maxHeight: '15rem', overflowY: 'scroll' }}>
                                                                <div className="overflow-x-auto rounded-xl shadow-lg border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-md w-full">
                                                                    <table className="w-full table-auto border-collapse text-left">
                                                                        <thead>
                                                                            <tr className="bg-slate-900/80">
                                                                                <th className="px-6 py-4 text-cyan-300 font-semibold text-xs md:text-sm border border-slate-700" style={{ minWidth: '10rem', maxWidth: '10rem', width: '10rem' }}>{t('loadout.shopLoadout.location') || 'Location'}</th>
                                                                                <th className="px-6 py-4 text-cyan-300 font-semibold text-xs md:text-sm border border-slate-700 text-center" style={{ minWidth: '10rem', maxWidth: '10rem', width: '10rem' }}>{t('loadout.shopLoadout.price') || 'Price'}</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {
                                                                                itemPrices.modules[id]?.length === 0 ? (
                                                                                    <tr className="bg-slate-950/70 hover:bg-cyan-950/40 hover:shadow-md transition-colors duration-200">
                                                                                        <td className="px-6 py-4 border border-slate-700 font-medium text-cyan-100 text-xs md:text-sm" colSpan={2}>{t("loadout.shopLoadout.noOffers")}</td>
                                                                                    </tr>
                                                                                ) : (
                                                                                    itemPrices.modules[id]?.length > 0 && itemPrices.modules[id]?.map((offer, index) => (
                                                                                        <tr key={offer.item_name + index} className="bg-slate-950/70 hover:bg-cyan-950/40 hover:shadow-md transition-colors duration-200">
                                                                                            <td className="px-6 py-4 border border-slate-700 font-medium text-cyan-100 text-xs md:text-sm">{offer.terminal_name}</td>
                                                                                            <td className="px-6 py-4 border border-slate-700 font-semibold text-xs md:text-sm text-center text-cyan-200">
                                                                                                <span>{offer.price_buy}</span>
                                                                                                <span className="device-font"> aUEC</span>
                                                                                            </td>
                                                                                        </tr>
                                                                                    ))
                                                                                )
                                                                            }
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        </div>

                                                    ))
                                                }
                                            </div>
                                        </>
                                    )
                                }
                                {
                                    uniqueGadgets.length !== 0 && (
                                        <>
                                            <hr className="mt-4 border-slate-700" />
                                            <h3 className="text-cyan-200 text-lg font-semibold mt-4">{t("loadout.shopLoadout.gadgets")}</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
                                                {
                                                    uniqueGadgets.map(id => (
                                                        <div className="flex flex-col" key={id}>
                                                            <span className="text-slate-200 mb-2">
                                                                {itemPrices.gadgets[id]?.[0]?.item_name}
                                                                {itemCounts.gadgets[id] ? (
                                                                    <span className="ml-2 text-xs text-cyan-400">x{itemCounts.gadgets[id]}</span>
                                                                ) : null}
                                                            </span>
                                                            <div style={{ maxHeight: '15rem', overflowY: 'scroll' }}>
                                                                <div className="overflow-x-auto rounded-xl shadow-lg border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-md w-full">
                                                                    <table className="w-full table-auto border-collapse text-left">
                                                                        <thead>
                                                                            <tr className="bg-slate-900/80">
                                                                                <th className="px-6 py-4 text-cyan-300 font-semibold text-xs md:text-sm border border-slate-700" style={{ minWidth: '10rem', maxWidth: '10rem', width: '10rem' }}>{t('loadout.shopLoadout.location') || 'Location'}</th>
                                                                                <th className="px-6 py-4 text-cyan-300 font-semibold text-xs md:text-sm border border-slate-700 text-center" style={{ minWidth: '10rem', maxWidth: '10rem', width: '10rem' }}>{t('loadout.shopLoadout.price') || 'Price'}</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {
                                                                                itemPrices.gadgets[id]?.length === 0 ? (
                                                                                    <tr className="bg-slate-950/70 hover:bg-cyan-950/40 hover:shadow-md transition-colors duration-200">
                                                                                        <td className="px-6 py-4 border border-slate-700 font-medium text-cyan-100 text-xs md:text-sm" colSpan={2}>{t("loadout.shopLoadout.noOffers")}</td>
                                                                                    </tr>
                                                                                ) : (
                                                                                    itemPrices.gadgets[id]?.length > 0 && itemPrices.gadgets[id]?.map((offer, index) => (
                                                                                        <tr key={offer.item_name + index} className="bg-slate-950/70 hover:bg-cyan-950/40 hover:shadow-md transition-colors duration-200">
                                                                                            <td className="px-6 py-4 border border-slate-700 font-medium text-cyan-100 text-xs md:text-sm">{offer.terminal_name}</td>
                                                                                            <td className="px-6 py-4 border border-slate-700 font-semibold text-xs md:text-sm text-center text-cyan-200">
                                                                                                <span>{offer.price_buy}</span>
                                                                                                <span className="device-font"> aUEC</span>
                                                                                            </td>
                                                                                        </tr>
                                                                                    ))
                                                                                )
                                                                            }
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        </div>

                                                    ))
                                                }
                                            </div>
                                        </>
                                    )
                                }
                            </>
                        )}
                </div>
                <DialogFooter className="flex flex-row justify-end gap-2">
                    <Button variant="secondary" onClick={handleClose} className="bg-slate-800 text-slate-200 hover:bg-slate-700 focus:ring-cyan-700/30 rounded-md px-4 py-2">{t("loadout.shopLoadout.closeButton")}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    );
}
