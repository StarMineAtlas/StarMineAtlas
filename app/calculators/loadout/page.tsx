"use client"

import { Header } from "@/components/Header/Header"
import { Loader } from "@/components/Loader"
import { LoadoutBloc } from "@/components/Loadout/LoadoutBloc"
import { LoadoutInventory } from "@/components/Loadout/LoadoutInventory"
import { LoadoutResume } from "@/components/Loadout/LoadoutResume"
import { LoadoutSaveModal } from "@/components/Loadout/LoadoutSaveModal"
import { LoadoutShopModal } from "@/components/Loadout/LoadoutShopModal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { API_UEX_BASE_URL, UEX_API_ENDPOINTS, UEX_API_ITEM_CATEGORIES } from "@/lib/api-endpoints"
import { decodeUrlParams, encodeUrlParams, isLoadoutSharePreset, type LoadoutSharePreset } from "@/lib/utils"
import { Loadout, LoadoutBlocConfig, ModuleGadgetWithActive, ShipConfiguration } from "@/models/Loadout"
import { miningLaserAttributeType, MiningLaserRawData, MiningLaserWithPrices } from "@/models/MiningLaser"
import { gadgetAttributeType, moduleAttributeType, ModuleGadgetRawData, ModuleGadgetWithPrices } from "@/models/ModuleGadget"
import { RotateCcw, Save, Share2, Store, Toolbox, Trash } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

const SHIPS: ShipConfiguration[] = [
  {
    name: "Prospector",
    baseLaser: 'Arbor MH1',
    numberOfLasers: 1,
    canChangeLasers: true,
    laserSizes: ["1", "S0"],
    isLaserEditable: true,
  },
  {
    name: "Golem",
    baseLaser: 'Pitman',
    numberOfLasers: 1,
    canChangeLasers: false,
    laserSizes: ["S0"],
    isLaserEditable: false,
  },
  {
    name: "Mole",
    baseLaser: 'Arbor MH2',
    numberOfLasers: 3,
    canChangeLasers: true,
    laserSizes: ["2", "1", "S0"],
    isLaserEditable: true,
  }
]

const SAVED_LOADOUTS_STORAGE_KEY = "mining-atlas-loadout-saved"

const getStoredLoadouts = (): Loadout[] => {
  try {
    const existing = localStorage.getItem(SAVED_LOADOUTS_STORAGE_KEY)

    if (!existing) {
      return []
    }

    const parsed = JSON.parse(existing)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function LoadoutPage() {
  const { t } = useTranslation()

  const [loading, setLoading] = useState(true);
  const [mergedRawData, setMergedRawData] = useState<{ miningLasers: MiningLaserRawData[], gadgets: ModuleGadgetRawData[], modules: ModuleGadgetRawData[] }>({} as any);

  // data formatted for lasers, gadgets and modules
  const [formattedLasers, setFormattedLasers] = useState<MiningLaserWithPrices[]>([]);
  const [formattedGadgets, setFormattedGadgets] = useState<ModuleGadgetWithPrices[]>([]);
  const [formattedModules, setFormattedModules] = useState<ModuleGadgetWithPrices[]>([]);

  // Ship configuration
  const [selectedShip, setSelectedShip] = useState<ShipConfiguration>(SHIPS[0]);
  const [loadout, setLoadout] = useState<Loadout | null>(null);
  const [pendingPresetLoadout, setPendingPresetLoadout] = useState<Loadout | LoadoutSharePreset | null>(null);
  const isApplyingPresetRef = useRef(false);

  // Modal state
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [shopModalOpen, setShopModalOpen] = useState(false);

  // Saved Loadouts
  const [savedLoadouts, setSavedLoadouts] = useState<Loadout[]>([]);
  const [selectedSavedLoadout, setSelectedSavedLoadout] = useState<string>("");

  const shipsByName = useMemo(() => new Map(SHIPS.map((ship) => [ship.name, ship])), []);
  const lasersById = useMemo(() => new Map(formattedLasers.map((laser) => [laser.id, laser])), [formattedLasers]);
  const modulesById = useMemo(() => new Map(formattedModules.map((module) => [module.id, module])), [formattedModules]);
  const gadgetsById = useMemo(() => new Map(formattedGadgets.map((gadget) => [gadget.id, gadget])), [formattedGadgets]);

  const createInitialLoadout = (ship: ShipConfiguration): Loadout => {
    const baseLaser = formattedLasers.find(laser => laser.name === ship.baseLaser) || null;

    return {
      ship,
      bloc: Array.from({ length: ship.numberOfLasers }).map(() => ({
        miningLaser: baseLaser,
        isLaserActive: !!baseLaser,
        modules: Array.from({ length: parseInt(baseLaser?.slots || "0") }).map(() => null) as (ModuleGadgetWithActive | null)[]
      })),
      gadgets: [null],
      isSaved: false,
      name: ""
    };
  };

  const rebuildLoadoutFromSharePreset = (preset: LoadoutSharePreset): Loadout => {
    const ship = shipsByName.get(preset.s) || SHIPS[0];
    const initialLoadout = createInitialLoadout(ship);

    const rebuiltBloc = initialLoadout.bloc.map((defaultBloc, blocIndex) => {
      const presetBloc = preset.b[blocIndex];

      if (!presetBloc) {
        return defaultBloc;
      }

      const miningLaser = presetBloc[0] === null
        ? null
        : lasersById.get(presetBloc[0]) || null;

      return {
        miningLaser,
        isLaserActive: Boolean(presetBloc[1]) && !!miningLaser,
        modules: presetBloc[2].map(([moduleId, isActive]) => {
          if (moduleId === null) {
            return null;
          }

          const module = modulesById.get(moduleId);

          if (!module) {
            return null;
          }

          return {
            ...module,
            isActive: Boolean(isActive),
          };
        })
      };
    });

    const rebuiltGadgets = preset.g.map((gadgetEntry) => {
      if (!gadgetEntry || gadgetEntry[0] === null) {
        return null;
      }

      const gadget = gadgetsById.get(gadgetEntry[0]);

      if (!gadget) {
        return null;
      }

      return {
        ...gadget,
        isActive: Boolean(gadgetEntry[1]),
      };
    });

    if (rebuiltGadgets.length === 0 || rebuiltGadgets.every(gadget => gadget !== null)) {
      rebuiltGadgets.push(null);
    }

    return {
      ship,
      bloc: rebuiltBloc,
      gadgets: rebuiltGadgets,
      isSaved: false,
      name: preset.n || "",
    };
  };

  useEffect(() => {
    setLoading(true);
    const urlParams = new URLSearchParams(window.location.search)
    const preset = urlParams.get("preset")
    if (preset) {
      const decodedPreset = decodeUrlParams<Loadout | LoadoutSharePreset>(preset)
      if (decodedPreset) {
        setPendingPresetLoadout(decodedPreset)
      }
    }
    setSavedLoadouts(getStoredLoadouts())
    Promise.all([
      fetch(API_UEX_BASE_URL + UEX_API_ENDPOINTS.itemsCategory + UEX_API_ITEM_CATEGORIES.miningLasers),
      fetch(API_UEX_BASE_URL + UEX_API_ENDPOINTS.itemsCategory + UEX_API_ITEM_CATEGORIES.gadgets),
      fetch(API_UEX_BASE_URL + UEX_API_ENDPOINTS.itemsCategory + UEX_API_ITEM_CATEGORIES.modules)
    ])
      .then(async ([resLaser, resGadget, resModule]) => {
        const resultLaser = await resLaser.json();
        const resultGadget = await resGadget.json();
        const resultModule = await resModule.json();
        setMergedRawData({
          miningLasers: resultLaser.data || [],
          gadgets: resultGadget.data || [],
          modules: resultModule.data || []
        });
      });
  }, []);

  useEffect(() => {
    if (mergedRawData.miningLasers && mergedRawData.gadgets && mergedRawData.modules) {

      // Utility for fetching and formatting an item (laser/module/gadget)
      const fetchAndFormatItem = async (
        item: MiningLaserRawData | ModuleGadgetRawData,
        attributeType: any,
        isLaser: boolean = false
      ) => {
        const toPush: any = {
          id: item.id,
          name: item.name.replace(/ Mining Laser$/, "").replace(/ Module$/, "").replace(/ Gadget$/, ""),
          locations: [],
        };

        // Fetch prices
        const pricesRes = await fetch(API_UEX_BASE_URL + UEX_API_ENDPOINTS.itemsPrices + item.id);
        const pricesResult = await pricesRes.json();
        pricesResult.data.forEach((attr: any) => {
          toPush.locations.push({ terminal_name: attr.terminal_name || "", price: attr.price_buy || 0 });
        });

        // Fetch attributes
        const attributesRes = await fetch(API_UEX_BASE_URL + UEX_API_ENDPOINTS.itemsAttributes + item.id);
        const attributesResult = await attributesRes.json();
        attributesResult.data.forEach((attr: any) => {
          Object.keys(attributeType).forEach(key => {
            if (attr.attribute_name === attributeType[key as keyof typeof attributeType]) {
              toPush[key] = attr.value + (attr.unit ? `${attr.unit}` : "");
            }
          });
          if (attr.attribute_name === "Laser Instability" || attr.attribute_name === "Instability") {
            toPush.instability = toPush.instability ? toPush.instability : attr.value + (attr.unit ? `${attr.unit}` : "");
          }
        });

        if (isLaser) {
          const { newMin, newMax } = getMinMaxPower(toPush as MiningLaserWithPrices);
          toPush.min_power = newMin;
          toPush.max_power = newMax;
        } else {
          if (typeof toPush.laserPowerMod !== 'undefined') {
            toPush.laserPowerMod = ((toPush.laserPowerMod ? parseFloat(toPush.laserPowerMod.replace("%", "")) : 0) - 100).toString();
            if (toPush.laserPowerMod && !toPush.laserPowerMod.startsWith("-")) {
              toPush.laserPowerMod = "+" + toPush.laserPowerMod;
            }
            toPush.laserPowerMod = toPush.laserPowerMod !== '-100' ? toPush.laserPowerMod + "%" : "";
          }
          if (typeof toPush.extractionPowerMod !== 'undefined') {
            toPush.extractionPowerMod = ((toPush.extractionPowerMod ? parseFloat(toPush.extractionPowerMod.replace("%", "")) : 0) - 100).toString();
            if (toPush.extractionPowerMod && !toPush.extractionPowerMod.startsWith("-")) {
              toPush.extractionPowerMod = "+" + toPush.extractionPowerMod;
            }
            toPush.extractionPowerMod = toPush.extractionPowerMod !== '-100' ? toPush.extractionPowerMod + "%" : "";
          }
        }
        return toPush;
      };

      (async () => {
        const [lasersData, modulesData, gadgetsData] = await Promise.all([
          Promise.all(mergedRawData.miningLasers.map(laser => fetchAndFormatItem(laser, miningLaserAttributeType, true))),
          Promise.all(mergedRawData.modules.map(module => fetchAndFormatItem(module, moduleAttributeType, false))),
          Promise.all(mergedRawData.gadgets.map(gadget => fetchAndFormatItem(gadget, gadgetAttributeType, false)))
        ]);
        setFormattedLasers(lasersData.sort((a: MiningLaserWithPrices, b: MiningLaserWithPrices) => {
          if (a.size && b.size) {
            const sizeA = parseInt(a.size.replace("S", ""));
            const sizeB = parseInt(b.size.replace("S", ""));
            if (sizeA !== sizeB) {
              return sizeB - sizeA;
            }
          }
          return a.name.localeCompare(b.name);
        }));
        setFormattedModules(modulesData.sort((a: ModuleGadgetWithPrices, b: ModuleGadgetWithPrices) => {
          if (a.itemType && b.itemType) {
            const typeOrder = ["Active", "Passive"];
            const typeA = typeOrder.indexOf(a.itemType);
            const typeB = typeOrder.indexOf(b.itemType);
            if (typeA !== typeB) {
              return typeA - typeB;
            }
          }
          return a.name.localeCompare(b.name);
        }));
        setFormattedGadgets(gadgetsData.sort((a: ModuleGadgetWithPrices, b: ModuleGadgetWithPrices) => {
          return a.name.localeCompare(b.name);
        }));
        setLoading(false);
      })();
    }
  }, [mergedRawData]);

  useEffect(() => {
    if (selectedShip) {
      if (pendingPresetLoadout) {
        return;
      }

      if (isApplyingPresetRef.current) {
        isApplyingPresetRef.current = false;
        return;
      }

      setLoadout(createInitialLoadout(selectedShip));
    }
  }, [selectedShip, formattedLasers, pendingPresetLoadout]);

  useEffect(() => {
    if (!pendingPresetLoadout || loading) {
      return;
    }

    const resolvedLoadout = isLoadoutSharePreset(pendingPresetLoadout)
      ? rebuildLoadoutFromSharePreset(pendingPresetLoadout)
      : pendingPresetLoadout;

    isApplyingPresetRef.current = true;
    setSelectedSavedLoadout("");
    setSelectedShip(resolvedLoadout.ship);
    setLoadout(resolvedLoadout);
    setPendingPresetLoadout(null);
  }, [gadgetsById, lasersById, loading, modulesById, pendingPresetLoadout, shipsByName]);

  const getMinMaxPower = (miningLaser: MiningLaserWithPrices) => {
    const splitValue = miningLaser?.min_power?.split('-');
    const minPower = splitValue ? splitValue[0] : "";
    const maxPower = splitValue ? splitValue[1] : "";
    return { newMin: minPower, newMax: maxPower };
  };

  const handleBlocChange = (updatedBloc: LoadoutBlocConfig, index: number) => {
    if (!loadout) return;
    const newLoadout = { ...loadout, bloc: [...loadout.bloc] };
    newLoadout.bloc[index] = updatedBloc;
    setLoadout(newLoadout);
  };

  const handleGadgetChange = (updatedGadgetList: (ModuleGadgetWithActive | null)[]) => {
    if (!loadout) return;
    const newLoadout = { ...loadout, bloc: [...loadout.bloc] };
    newLoadout.gadgets = updatedGadgetList;
    setLoadout(newLoadout);
  };

  const resetActualLoadout = () => {
    if (!loadout) return;
    setSelectedSavedLoadout("");
    setLoadout(createInitialLoadout(loadout.ship));
  }


  const handleSaveLoadout = (name: string) => {
    if (!loadout) return;
    const toSave = { ...loadout, name, isSaved: true };
    try {
      const arr = getStoredLoadouts();
      const existingIndex = arr.findIndex((l: Loadout) => l.name === name);
      if (existingIndex !== -1) {
        arr[existingIndex] = toSave;
      } else {
        arr.push(toSave);
      }
      localStorage.setItem(SAVED_LOADOUTS_STORAGE_KEY, JSON.stringify(arr));
    } catch (e) {
      // Optionally handle error
    }
    setSaveModalOpen(false);
    // Refresh saved loadouts from localStorage
    setTimeout(() => {
      const storedLoadouts = getStoredLoadouts();
      setSavedLoadouts(storedLoadouts);
      const selectedIndex = storedLoadouts.findIndex((l: Loadout) => l.name === name);
      setSelectedSavedLoadout(selectedIndex >= 0 ? selectedIndex.toString() : "");
    }, 1000);
  };

  useEffect(() => {
    if (loading || !selectedSavedLoadout) return;
    setLoading(true);
    const idx = parseInt(selectedSavedLoadout);
    if (isNaN(idx) || idx < 0 || idx >= savedLoadouts.length) return;
    const saved = savedLoadouts[idx];

    setSelectedShip(saved.ship);

    setTimeout(() => {
      setLoadout(saved);
      setLoading(false);
    }, 1000);
  }, [selectedSavedLoadout, savedLoadouts]);

  const handleSelectSavedLoadout = (idx: string) => {
    setSelectedSavedLoadout(idx);
  };

  const removeSavedLoadout = (idx: string) => {
    // alert for confirmation
    if (!confirm(t("loadout.confirmRemove"))) return;
    try {
      const arr = getStoredLoadouts();
      const indexToRemove = parseInt(idx);
      if (isNaN(indexToRemove) || indexToRemove < 0 || indexToRemove >= arr.length) return;
      arr.splice(indexToRemove, 1);
      localStorage.setItem(SAVED_LOADOUTS_STORAGE_KEY, JSON.stringify(arr));
      setSavedLoadouts(arr);
      setSelectedSavedLoadout("");
    } catch (e) {
      // Optionally handle error
    }
  };

  const handleSelectShip = (shipName: string) => {
    const ship = shipsByName.get(shipName);
    if (ship) {
      setSelectedShip(ship);
      setSelectedSavedLoadout("");
    }
  };

  const handleShare = async () => {
    if (!loadout) {
      return
    }

    const copyLoadout = { ...loadout };
    copyLoadout.isSaved = false;
    const encodedData = encodeUrlParams(copyLoadout);
    const shareableUrl = `${window.location.origin}${window.location.pathname}?preset=${encodedData}`

    try {
      await navigator.clipboard.writeText(shareableUrl)
      toast({
        variant: "success",
        duration: 4000,
        title: t("loadout.share.shareButton"),
        description: t("loadout.share.shareSuccessDescription"),
      })
    } catch {
      toast({
        variant: "error",
        duration: 4000,
        title: t("loadout.share.shareButton"),
        description: t("loadout.share.shareErrorDescription"),
      })
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-center">
          <div className="mb-6 flex items-start gap-3">
            <Toolbox className="h-10 w-10 text-cyan-400" />
            <h1 className="text-3xl font-bold tracking-tight text-cyan-50 sm:text-4xl" suppressHydrationWarning>
              {t("loadout.title")}
            </h1>
          </div>
          <p className="text-slate-400" suppressHydrationWarning>
            {t("loadout.description")}
          </p>

          {/* Saved Loadouts Selector */}
          {savedLoadouts.length > 0 && (
            <div className="flex flex-col my-4 w-full max-w-xs">
              <label className="block text-xs font-medium text-cyan-200 ms-2 mb-1">{t("loadout.loadLoadout")}</label>
              <div className="flex items-center gap-2">
                <Select value={selectedSavedLoadout} onValueChange={handleSelectSavedLoadout}>
                  <SelectTrigger className="w-full border-slate-800 bg-slate-900/50 text-cyan-50 focus:border-cyan-700 focus:ring-cyan-700/20">
                    <SelectValue placeholder={t("loadout.loadLoadoutPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent className="border-slate-800 bg-slate-900">
                    {savedLoadouts.map((l, idx) => (
                      <SelectItem key={idx} value={String(idx)} className="text-cyan-50 focus:bg-slate-800 focus:text-cyan-300">
                        {l.name || `Loadout ${idx + 1}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {
                  selectedSavedLoadout !== "" && (
                    <Trash className="h-5 w-5 text-red-600 cursor-pointer" onClick={() => removeSavedLoadout(selectedSavedLoadout)} />
                  )
                }
              </div>
            </div>
          )}

          {
            loading ? (
              <Loader loaderText={t("loadout.loading")} />
            ) : (
              <div className="w-full">
                <div className="flex flex-col my-4">
                  <label className="block text-xs font-medium text-cyan-200 ms-2 mb-1" suppressHydrationWarning>
                    {t("loadout.selectShip", "Select your ship")}
                  </label>
                  <Select value={selectedShip.name} onValueChange={handleSelectShip}>
                    <SelectTrigger className="w-[180px] border-slate-800 bg-slate-900/50 text-cyan-50 focus:border-cyan-700 focus:ring-cyan-700/20">
                      <SelectValue placeholder={t("loadout.selectShip", "Select your ship")} />
                    </SelectTrigger>
                    <SelectContent className="border-slate-800 bg-slate-900">
                      {SHIPS.map((ship) => (
                        <SelectItem key={ship.name} value={ship.name} className="text-cyan-50 focus:bg-slate-800 focus:text-cyan-300">
                          {ship.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 w-full">
                  {loadout && Array.from({ length: selectedShip.numberOfLasers }).map((_, idx) => (
                    <LoadoutBloc key={idx} index={idx} shipConfig={selectedShip} bloc={loadout.bloc[idx]} lasers={formattedLasers} modules={formattedModules} onChange={(updatedBloc: LoadoutBlocConfig) => handleBlocChange(updatedBloc, idx)} />
                  ))}
                  <LoadoutInventory gadgetList={loadout?.gadgets || []} gadgets={formattedGadgets} onChange={(updatedGadgetList: (ModuleGadgetWithActive | null)[]) => handleGadgetChange(updatedGadgetList)} />
                  <LoadoutResume loadout={loadout!} />
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center w-full mt-2">
                  <button onClick={resetActualLoadout} className="mt-6 inline-flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                    <RotateCcw className="h-4 w-4" />
                    {t("loadout.resetButton", "Reset Loadout")}
                  </button>
                  <div className="mt-6 flex gap-3">
                    <button
                      className="inline-flex items-center gap-2 rounded bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-700/30"
                      onClick={handleShare}
                    >
                      <Share2 className="h-4 w-4" />
                      {t("loadout.share.shareButton", "Share")}
                    </button>
                    <button
                      className="inline-flex items-center gap-2 rounded bg-cyan-500 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-cyan-700/30"
                      onClick={() => setSaveModalOpen(true)}
                      disabled={!loadout}
                    >
                      <Save className="h-4 w-4" />
                      {t("loadout.saveButton", "Save")}
                    </button>
                    <button
                      className="inline-flex items-center gap-2 rounded bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-emerald-700/30"
                      onClick={() => setShopModalOpen(true)}
                      disabled={!loadout}
                    >
                      <Store className="h-4 w-4" />
                      {t("loadout.shopButton", "Shop")}
                    </button>
                  </div>
                </div>
              </div>
            )
          }
        </div>
      </div>
      <LoadoutSaveModal open={saveModalOpen} initialName={loadout?.name || ""} onClose={() => setSaveModalOpen(false)} onSave={handleSaveLoadout} />
      <LoadoutShopModal open={shopModalOpen} loadout={loadout!} onClose={() => setShopModalOpen(false)} />
    </div>
  )
}
