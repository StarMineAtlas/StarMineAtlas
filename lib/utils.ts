import { Loadout } from '@/models/Loadout'
import { MiningLaserWithPrices } from '@/models/MiningLaser'
import { ModuleGadgetWithPrices } from '@/models/ModuleGadget'
import { User, WorkOrderData, WorkOrderExportData } from '@/models/WorkOrder'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

type ShareableData = WorkOrderData | Loadout

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const prepareExportData = (data: WorkOrderData, userList: User[]): WorkOrderExportData => {
  return {
    profitShares: data.profitShares.map(share => {
      return { username: userList.find(user => user.id === share.userId)?.username || "Unknown", share: share.share }
    }),
    expensesList: data.expensesList.map(expense => {
      return { name: expense.name, amount: expense.amount, username: userList.find(user => user.id === expense.userId)?.username || "Unknown" }
    }),
    finalPrice: data.finalPrice,
    selectedPrice: data.selectedPrice,
    selectedSellingTerminalName: data.selectedSellingTerminalName || '',
    mineralsList: data.mineralsList.map(mineral => {
      return { name: mineral.name, quantity: mineral.quantity, yield: mineral.yield, quality: mineral.quality }
    }),
    selectedMethod: data.selectedMethod?.name || '',
    selectedRefinery: data.selectedRefinery?.terminal_name || '',
    timestamp: data.timestamp ? data.timestamp : Date.now(),
  }
}

type CompactLocation = [string, number]

type CompactMiningLaser = [
  number,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  CompactLocation[],
]

type CompactModuleGadget = [
  number,
  string,
  string,
  string | undefined,
  string | undefined,
  string | undefined,
  string | undefined,
  string | undefined,
  string | undefined,
  string | undefined,
  string | undefined,
  string | undefined,
  string | undefined,
  string | undefined,
  string | undefined,
  CompactLocation[],
]

type CompactActiveItem = [number | null, 0 | 1]

type LegacyCompactLoadout = {
  v: 1
  t: 'loadout'
  s: [string, string, number, 0 | 1, string[], 0 | 1]
  l: CompactMiningLaser[]
  m: CompactModuleGadget[]
  b: [number | null, 0 | 1, CompactActiveItem[]][]
  g: (CompactActiveItem | null)[]
  n?: string
  i?: 0 | 1
}

export type LoadoutSharePreset = {
  v: 2
  t: 'loadout'
  s: string
  b: [number | null, 0 | 1, CompactActiveItem[]][]
  g: (CompactActiveItem | null)[]
  n?: string
}

const parseEncodedJson = (value: string): unknown | null => {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

const serializeLocations = (locations: { terminal_name: string; price: number }[] = []): CompactLocation[] => {
  return locations.map(({ terminal_name, price }) => [terminal_name, price])
}

const deserializeLocations = (locations: CompactLocation[]): { terminal_name: string; price: number }[] => {
  return locations.map(([terminal_name, price]) => ({ terminal_name, price }))
}

const serializeMiningLaser = (laser: MiningLaserWithPrices): CompactMiningLaser => {
  return [
    laser.id,
    laser.name,
    laser.size,
    laser.slots,
    laser.optimal_range,
    laser.max_range,
    laser.min_power,
    laser.max_power,
    laser.extract_power,
    laser.resistance,
    laser.instability,
    laser.optimal_charge_rate,
    laser.optimal_charge_window,
    laser.inert_materials,
    serializeLocations(laser.locations),
  ]
}

const deserializeMiningLaser = (laser: CompactMiningLaser): MiningLaserWithPrices => {
  return {
    id: laser[0],
    name: laser[1],
    size: laser[2],
    slots: laser[3],
    optimal_range: laser[4],
    max_range: laser[5],
    min_power: laser[6],
    max_power: laser[7],
    extract_power: laser[8],
    resistance: laser[9],
    instability: laser[10],
    optimal_charge_rate: laser[11],
    optimal_charge_window: laser[12],
    inert_materials: laser[13],
    locations: deserializeLocations(laser[14]),
  }
}

const serializeModuleGadget = (item: ModuleGadgetWithPrices): CompactModuleGadget => {
  return [
    item.id,
    item.name,
    item.itemType,
    item.laserPowerMod,
    item.resistance,
    item.instability,
    item.optimalChargeRate,
    item.optimalChargeWindow,
    item.inertMaterials,
    item.overchargeRate,
    item.clustering,
    item.shatterDamage,
    item.extractionPowerMod,
    item.uses,
    item.duration,
    serializeLocations(item.locations),
  ]
}

const deserializeModuleGadget = (item: CompactModuleGadget): ModuleGadgetWithPrices => {
  return {
    id: item[0],
    name: item[1],
    itemType: item[2],
    laserPowerMod: item[3],
    resistance: item[4],
    instability: item[5],
    optimalChargeRate: item[6],
    optimalChargeWindow: item[7],
    inertMaterials: item[8],
    overchargeRate: item[9],
    clustering: item[10],
    shatterDamage: item[11],
    extractionPowerMod: item[12],
    uses: item[13],
    duration: item[14],
    locations: deserializeLocations(item[15]),
  }
}

const isLoadoutData = (data: ShareableData): data is Loadout => {
  return 'ship' in data && 'bloc' in data && 'gadgets' in data
}

const compactLoadout = (loadout: Loadout): LoadoutSharePreset => {
  return {
    v: 2,
    t: 'loadout',
    s: loadout.ship.name,
    b: loadout.bloc.map((bloc) => [
      bloc.miningLaser?.id ?? null,
      bloc.isLaserActive ? 1 : 0,
      bloc.modules.map((item) => [item?.id ?? null, item?.isActive ? 1 : 0]),
    ]),
    g: loadout.gadgets.map((item) => (item ? [item.id, item.isActive ? 1 : 0] : null)),
    n: loadout.name || undefined,
  }
}

const expandLoadout = (compactLoadoutData: LegacyCompactLoadout): Loadout => {
  const lasers = compactLoadoutData.l.map(deserializeMiningLaser)
  const items = compactLoadoutData.m.map(deserializeModuleGadget)

  return {
    ship: {
      name: compactLoadoutData.s[0],
      baseLaser: compactLoadoutData.s[1],
      numberOfLasers: compactLoadoutData.s[2],
      canChangeLasers: Boolean(compactLoadoutData.s[3]),
      laserSizes: compactLoadoutData.s[4],
      isLaserEditable: Boolean(compactLoadoutData.s[5]),
    },
    bloc: compactLoadoutData.b.map(([laserIndex, isLaserActive, modules]) => ({
      miningLaser: laserIndex === null ? null : lasers[laserIndex] || null,
      isLaserActive: Boolean(isLaserActive),
      modules: modules.map(([itemIndex, isActive]) => {
        if (itemIndex === null) {
          return null
        }

        return {
          ...items[itemIndex],
          isActive: Boolean(isActive),
        }
      }),
    })),
    gadgets: compactLoadoutData.g.map((item) => {
      if (!item || item[0] === null) {
        return null
      }

      return {
        ...items[item[0]],
        isActive: Boolean(item[1]),
      }
    }),
    isSaved: Boolean(compactLoadoutData.i),
    name: compactLoadoutData.n || '',
  }
}

const isLegacyCompactLoadout = (data: unknown): data is LegacyCompactLoadout => {
  if (!data || typeof data !== 'object') {
    return false
  }

  const candidate = data as Partial<LegacyCompactLoadout>
  return candidate.v === 1 && candidate.t === 'loadout' && Array.isArray(candidate.s) && Array.isArray(candidate.b)
}

export const isLoadoutSharePreset = (data: unknown): data is LoadoutSharePreset => {
  if (!data || typeof data !== 'object') {
    return false
  }

  const candidate = data as Partial<LoadoutSharePreset>
  return candidate.v === 2 && candidate.t === 'loadout' && typeof candidate.s === 'string' && Array.isArray(candidate.b) && Array.isArray(candidate.g)
}

export const encodeUrlParams = (data: ShareableData): string => {
  const payload = isLoadoutData(data) ? compactLoadout(data) : data
  return encodeURIComponent(JSON.stringify(payload))
}

export const decodeUrlParams = <T>(encodedData: string): T | null => {
  const parsed = parseEncodedJson(encodedData) ?? parseEncodedJson(decodeURIComponent(encodedData))

  if (!parsed) {
    return null
  }

  if (isLegacyCompactLoadout(parsed)) {
    return expandLoadout(parsed) as T
  }

  if (isLoadoutSharePreset(parsed)) {
    return parsed as T
  }

  return parsed as T
}