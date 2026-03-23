"use client"

import { Header } from "@/components/Header"
import { LoadoutBloc } from "@/components/LoadoutBloc"
import { LoadoutInventory } from "@/components/LoadoutInventory"
import { LoadoutResume } from "@/components/LoadoutResume"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { API_UEX_BASE_URL, UEX_API_ENDPOINTS, UEX_API_ITEM_CATEGORIES } from "@/lib/api-endpoints"
import { Loadout, ModuleGadgetWithActive, ShipConfiguration } from "@/models/Loadout"
import { miningLaserAttributeType, MiningLaserRawData, MiningLaserWithPrices } from "@/models/MiningLaser"
import { gadgetAttributeType, moduleAttributeType, ModuleGadgetRawData, ModuleGadgetWithPrices } from "@/models/ModuleGadget"
import { RotateCcw, Save, Store, Toolbox } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

export default function LoadoutPage() {
  const { t } = useTranslation()

  const [loading, setLoading] = useState(true);
  const [mergedRawData, setMergedRawData] = useState<{ miningLasers: MiningLaserRawData[], gadgets: ModuleGadgetRawData[], modules: ModuleGadgetRawData[] }>({} as any);

  // data formatted for lasers, gadgets and modules
  const [formattedLasers, setFormattedLasers] = useState<MiningLaserWithPrices[]>([]);
  const [formattedGadgets, setFormattedGadgets] = useState<ModuleGadgetWithPrices[]>([]);
  const [formattedModules, setFormattedModules] = useState<ModuleGadgetWithPrices[]>([]);

  // Ship configuration
  const ships: ShipConfiguration[] = [
    {
      name: "Prospector",
      baseLaser: 'Arbor MH1',
      numberOfLasers: 1,
      canChangeLasers: true,
    },
    {
      name: "Golem",
      baseLaser: 'Pitman',
      numberOfLasers: 1,
      canChangeLasers: false,
    },
    {
      name: "Mole",
      baseLaser: 'Arbor MH2',
      numberOfLasers: 3,
      canChangeLasers: true,
    }
  ]

  const [selectedShip, setSelectedShip] = useState<ShipConfiguration>(ships[0]);
  const [loadout, setLoadout] = useState<Loadout | null>(null);

  useEffect(() => {
    setLoading(true);
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
      })();
    }
  }, [mergedRawData]);

  useEffect(() => {
    setLoading(true);
    if (selectedShip) {
      const baseLaser = formattedLasers.find(laser => laser.name === selectedShip.baseLaser) || null;
      const initialLoadout: Loadout = {
        ship: selectedShip,
        bloc: Array.from({ length: selectedShip.numberOfLasers }).map(() => ({
          miningLaser: baseLaser,
          isLaserActive: !!baseLaser,
          modules: Array.from({ length: parseInt(baseLaser?.slots || "0") }).map(() => ({})) as ModuleGadgetWithActive[]
        })),
        gadgets: Array.from({ length: 1 }).map(() => null) as (ModuleGadgetWithActive | null)[],
        isSaved: false,
        name: ""
      };
      setLoadout(initialLoadout);
      setLoading(false);
    }
  }, [selectedShip, formattedLasers, formattedModules, formattedGadgets]);

  const getMinMaxPower = (miningLaser: MiningLaserWithPrices) => {
    const sliptedValue = miningLaser?.min_power?.split('-');
    const minPower = sliptedValue ? sliptedValue[0] : "";
    const maxPower = sliptedValue ? sliptedValue[1] : "";
    return { newMin: minPower, newMax: maxPower };
  };

  const handleBlocChange = (updatedBloc: any, index: number) => {
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
    const baseLaser = formattedLasers.find(laser => laser.name === loadout.ship.baseLaser) || null;
    const resetedLoadout: Loadout = {
      ship: loadout.ship,
      bloc: Array.from({ length: loadout.ship.numberOfLasers }).map(() => ({
        miningLaser: baseLaser,
        isLaserActive: !!baseLaser,
        modules: Array.from({ length: parseInt(baseLaser?.slots || "0") }).map(() => ({})) as ModuleGadgetWithActive[]
      })),
      gadgets: Array.from({ length: 1 }).map(() => null) as (ModuleGadgetWithActive | null)[],
      isSaved: false,
      name: ""
    };
    setLoadout(resetedLoadout);
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
          {
            loading ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-slate-800 bg-slate-900/30 py-16 w-full max-w-3xl mx-auto mt-8">
                <Toolbox className="mb-4 h-12 w-12 text-slate-700 animate-spin" />
                <p className="text-lg text-slate-400" suppressHydrationWarning>{t("loadout.loading")}</p>
              </div>
            ) : (
              <div className="w-full">
                <div className="flex flex-col my-4">
                  <label className="block text-xs font-medium text-cyan-200 ms-2 mb-1" suppressHydrationWarning>
                    {t("loadout.selectShip", "Select your ship")}
                  </label>
                  <Select value={selectedShip.name} onValueChange={(value) => setSelectedShip(ships.find(ship => ship.name === value)!)}>
                    <SelectTrigger className="w-[180px] border-slate-800 bg-slate-900/50 text-cyan-50 focus:border-cyan-700 focus:ring-cyan-700/20">
                      <SelectValue placeholder={t("loadout.select_ship", "Select your ship")} />
                    </SelectTrigger>
                    <SelectContent className="border-slate-800 bg-slate-900">
                      {ships.map((ship) => (
                        <SelectItem key={ship.name} value={ship.name} className="text-cyan-50 focus:bg-slate-800 focus:text-cyan-300">
                          {ship.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 w-full">
                  {loadout && Array.from({ length: selectedShip.numberOfLasers }).map((_, idx) => (
                    <LoadoutBloc key={idx} index={idx} bloc={loadout.bloc[idx]} lasers={formattedLasers} modules={formattedModules} onChange={(updatedBloc) => handleBlocChange(updatedBloc, idx)} />
                  ))}
                  <LoadoutInventory gadgetList={loadout?.gadgets || []} gadgets={formattedGadgets} onChange={(updatedGadgetList) => handleGadgetChange(updatedGadgetList)} />
                  <LoadoutResume loadout={loadout!} />
                </div>
              </div>
            )
          }
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center w-full mt-2">
          <button onClick={resetActualLoadout} className="mt-6 inline-flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
            <RotateCcw className="h-4 w-4" />
            {t("loadout.reset", "Reset Loadout")}
          </button>
          <div className="mt-6 flex gap-3">
            <button disabled className="inline-flex items-center gap-2 rounded bg-cyan-700/50 px-4 py-2 text-sm font-medium text-white opacity-60 cursor-not-allowed">
              <Save className="h-4 w-4" />
              {t("loadout.save", "Save")}
            </button>
            <button disabled className="inline-flex items-center gap-2 rounded bg-emerald-700/50 px-4 py-2 text-sm font-medium text-white opacity-60 cursor-not-allowed">
              <Store className="h-4 w-4" />
              {t("loadout.shop", "Shop")}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
