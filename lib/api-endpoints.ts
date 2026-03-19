const GOOGLE_SHEET_ID = "1PNafLL179gh80ipoLP1AUhy47_bWTXVBOx2j1kJWd2I";
const OPENSHEET_BASE_URL = 'https://opensheet.elk.sh/';

export const API_BASE_URL = OPENSHEET_BASE_URL + GOOGLE_SHEET_ID + "/";
export const API_UEX_BASE_URL = "https://api.uexcorp.space/2.0/";

export const API_ENDPOINTS = {
    minerals: "minerals",
    systems: "systems",
    bodies: "bodies",
    rocks: "rocks",
    graph: "graph",
};

export const UEX_API_ENDPOINTS = {
    refineriesMethods: "refineries_methods",
    refineriesYields: "refineries_yields",
    commoditiesPricesAll: "commodities_prices_all",
    commoditiesRawPricesAll: "commodities_raw_prices_all",
    itemsCategory: "items?id_category=",
    itemsPrices: "items_prices?id_item=",
    itemsAttributes: "items_attributes?id_item=",
};

export const UEX_API_ITEM_CATEGORIES = {
    miningLasers: 29,
};