
export interface ModuleGadgetRawData {
    id: number;
    id_parent: string;
    id_category: string;
    id_company: string;
    id_vehicle: string;
    name: string;
    date_added: number;
    date_modified: number;
    section: string;
    category: string;
    company_name: string;
    vehicle_name: string | null;
    slug: string;
    size: string | null;
    uuid: string;
    color: string | null;
    color2: string | null;
    url_store: string;
    quality: number;
    is_exclusive_pledge: number;
    is_exclusive_subscriber: number;
    is_exclusive_concierge: number;
    is_commodity: number;
    is_harvestable: number;
    screenshot: string;
    game_version: string;
    notification: string | null;
}

export interface ModuleGadget {
    id: number;
    name: string;
    itemType: string;
    laserPowerMod?: string;
    resistance?: string;
    instability?: string;
    optimalChargeRate?: string;
    optimalChargeWindow?: string;
    inertMaterials?: string;
    overchargeRate?: string;
    clustering?: string;
    shatterDamage?: string;
    extractionPowerMod?: string;
    uses?: string;
    duration?: string;
    locations: string[];
}

export interface ModuleGadgetWithPrices {
    id: number;
    name: string;
    itemType: string;
    laserPowerMod?: string;
    resistance?: string;
    instability?: string;
    optimalChargeRate?: string;
    optimalChargeWindow?: string;
    inertMaterials?: string;
    overchargeRate?: string;
    clustering?: string;
    shatterDamage?: string;
    extractionPowerMod?: string;
    uses?: string;
    duration?: string;
    locations: { terminal_name: string; price: number }[];
}

export interface ModuleGadgetPrices {
    id: number;
    id_item: number;
    id_parent: number;
    id_category: number;
    id_vehicle: number;
    id_star_system: number;
    id_planet: number;
    id_orbit: number;
    id_moon: number;
    id_city: number;
    id_outpost: number;
    id_poi: number;
    id_terminal: number;
    price_buy: number;
    price_buy_min: number;
    price_buy_min_week: number;
    price_buy_min_month: number;
    price_buy_max: number;
    price_buy_max_week: number;
    price_buy_max_month: number;
    price_buy_avg: number;
    price_buy_avg_week: number;
    price_buy_avg_month: number;
    price_sell: number;
    price_sell_min: number;
    price_sell_min_week: number;
    price_sell_min_month: number;
    price_sell_max: number;
    price_sell_max_week: number;
    price_sell_max_month: number;
    price_sell_avg: number;
    price_sell_avg_week: number;
    price_sell_avg_month: number;
    durability: number;
    durability_min: number;
    durability_min_week: number;
    durability_min_month: number;
    durability_max: number;
    durability_max_week: number;
    durability_max_month: number;
    durability_avg: number;
    durability_avg_week: number;
    durability_avg_month: number;
    faction_affinity: number;
    game_version: string;
    date_added: number;
    date_modified: number;
    item_name: string;
    star_system_name: string | null;
    planet_name: string | null;
    orbit_name: string | null;
    moon_name: string | null;
    space_station_name: string | null;
    outpost_name: string | null;
    city_name: string | null;
    terminal_name: string | null;
    terminal_code: string | null;
    terminal_is_player_owned: number;
}

export interface ModuleGadgetAttributes {
    id: number;
    id_item: number;
    id_category: number;
    id_category_attribute: number;
    category_name: string;
    item_name: string;
    item_uuid: string;
    attribute_name: string;
    value: string;
    unit: string;
    date_added: number;
    date_modified: number;
}

export const moduleAttributeType = {
    itemType: "Item Type",
    laserPowerMod: "Mining Laser Power",
    resistance: "Resistance",
    instability: "Laser Instability",
    optimalChargeRate: "Optimal Charge Rate",
    optimalChargeWindow: "Optimal Charge Window Size",
    inertMaterials: "Inert Material Level",
    overchargeRate: "Catastrophic Charge Rate",
    clustering: "Cluster Modifier",
    shatterDamage: "Shatter Damage",
    extractionPowerMod: "Extraction Laser Power",
    uses: "Uses",
    duration: "Duration"
}

export const gadgetAttributeType = {
    itemType: "Item Type",
    laserPowerMod: "Mining Laser Power",
    resistance: "Resistance",
    optimalChargeRate: "Optimal Charge Window Rate",
    optimalChargeWindow: "Optimal Charge Window Size",
    inertMaterials: "Inert Material Level",
    overchargeRate: "Catastrophic Charge Rate",
    clustering: "Cluster Modifier",
    shatterDamage: "Shatter Damage",
    extractionPowerMod: "Extraction Laser Power",
    uses: "Uses",
    duration: "Duration"
}
