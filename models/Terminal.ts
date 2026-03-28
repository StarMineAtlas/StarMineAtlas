export interface Terminal {
    id: number;
    id_star_system: number;
    id_planet: number;
    id_orbit: number;
    id_moon: number;
    id_space_station: number;
    id_outpost: number;
    id_poi: number;
    id_city: number;
    id_faction: number;
    id_company: number;
    name: string;
    fullname: string;
    nickname: string;
    displayname: string;
    code: string;
    type: string;
    contact_url: string;
    screenshot: string;
    screenshot_full: string;
    screenshot_author: string;
    mcs: number;
    is_available: number;
    is_available_live: number;
    is_visible: number;
    is_default_system: number;
    is_affinity_influenceable: number;
    is_habitation: number;
    is_refinery: number;
    is_cargo_center: number;
    is_medical: number;
    is_food: number;
    is_shop_fps: number;
    is_shop_vehicle: number;
    is_refuel: number;
    is_repair: number;
    is_nqa: number;
    is_jump_point: number;
    is_player_owned: number;
    is_auto_load: number;
    has_loading_dock: number;
    has_docking_port: number;
    has_freight_elevator: number;
    game_version: string;
    date_added: number; // timestamp
    date_modified: number; // timestamp
    star_system_name: string;
    planet_name: string;
    orbit_name: string;
    moon_name: string;
    space_station_name: string | null;
    outpost_name: string | null;
    poi_name: string | null;
    city_name: string | null;
    faction_name: string | null;
    company_name: string | null;
    max_container_size: number; // in SCU
}