import { MiningLaserWithPrices } from "./MiningLaser";
import { ModuleGadgetWithPrices } from "./ModuleGadget";

export interface ShipConfiguration {
    name: string;
    baseLaser: string;
    numberOfLasers: number;
    canChangeLasers: boolean;
}

export interface LoadoutBlocConfig {
    miningLaser: MiningLaserWithPrices | null;
    modules: (ModuleGadgetWithPrices | null)[];
}

export interface Loadout {
    ship: ShipConfiguration;
    bloc: LoadoutBlocConfig[];
    gadgets: (ModuleGadgetWithPrices | null)[];
    isSaved?: boolean;
    name?: string;
}

export interface LoadoutResumeModel {
    min_power: string;
    max_power: string;
    optimal_range: string;
    max_range: string;
    resistance: string;
    instability: string;
    overcharge: string;
    clustering: string;
    inert_material: string;
    optimal_charge_rate: string;
    optimal_charge_window: string;
    shatter_damage: string;
    extraction_power: string;
}
