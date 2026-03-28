export interface RefineryMethod {
    id: number;
    name: string;
    code: string;
    rating_yield: number;
    rating_cost: number;
    rating_speed: number;
    date_added: number;
}

// add object with key to store translations for refinery ratings
export const RefineryRatingYield = {
    1: "refinery.methodTable.yield.low",
    2: "refinery.methodTable.yield.medium",
    3: "refinery.methodTable.yield.high",
}

export const RefineryRatingCost = {
    1: "refinery.methodTable.cost.low",
    2: "refinery.methodTable.cost.medium",
    3: "refinery.methodTable.cost.high",
}

export const RefineryRatingSpeed = {
    1: "refinery.methodTable.speed.low",
    2: "refinery.methodTable.speed.medium",
    3: "refinery.methodTable.speed.high",
}

export const RefineryMethodsPourcentages = {
    1: 0.315,
    2: 0.383,
    3: 0.450,
}

export interface RefineryYield {
    id: number;
    id_commodity: number;
    id_star_system: number;
    id_planet: number;
    id_orbit: number;
    id_moon: number;
    id_space_station: number;
    id_city: number;
    id_outpost: number;
    id_poi: number;
    id_terminal: number;
    id_report: number;
    value: number;
    value_week: number;
    value_month: number;
    date_added: number;
    date_modified: number;
    commodity_name: string;
    star_system_name: string;
    planet_name: string | null;
    orbit_name: string | null;
    moon_name: string | null;
    space_station_name: string | null;
    city_name: string | null;
    outpost_name: string | null;
    poi_name: string | null;
    terminal_name: string | null;
}

export interface RefineryWithLocationAndBonuses {
    terminal_name: string | null;
    space_station_name: string | null;
    star_system_name: string | null;
    bonuses: { mineral: string, value: number }[];
}