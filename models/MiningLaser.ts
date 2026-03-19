export interface MiningLaserRawData {
    id: number;
    id_parent: number;
    id_category: number; // 29 for mining lasers
    id_company: number;
    id_vehicle: number;
    name: string;
    date_added: number;
    date_modified: number;
    section: string;
    category: string;
    company_name: string;
    vehicle_name: string | null;
    slug: string;
    size: string;
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

export interface MiningLaserPrices {
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

export interface MiningLaserAttributes {
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

export interface MiningLaser {
    id: number;
    name: string;
    size: string;
    slots: string;
    optimal_range: string;
    max_range: string;
    min_power: string;
    max_power: string;
    extract_power: string;
    resistance: string;
    instability: string;
    optimal_charge_rate: string;
    optimal_charge_window: string;
    inert_materials: string;
    locations: string[];
}

export const miningLaserAttributeType = {
    size: "Size",
    slots: "Module Slots",
    optimal_range: "Optimal Range",
    max_range: "Maximum Range",
    min_power: "Mining Laser Power",
    max_power: "Mining Laser Power",
    extract_power: "Extraction Laser Power",
    resistance: "Resistance",
    instability: "Laser Instability",
    optimal_charge_rate: "Optimal Charge Window Rate",
    optimal_charge_window: "Optimal Charge Window Size",
    inert_materials: "Inert Material Level",
}