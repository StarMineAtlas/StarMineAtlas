import { Mineral } from "./Mineral";

export interface Commodity {
    id: number;
    id_commodity: number;
    id_terminal: number;
    price_buy: number;
    price_buy_avg: number;
    price_sell: number;
    price_sell_avg: number;
    scu_buy: number;
    scu_buy_avg: number;
    scu_sell_stock: number;
    scu_sell_stock_avg: number;
    scu_sell: number;
    scu_sell_avg: number;
    status_buy: number;
    status_sell: number;
    container_sizes: string; // "1,2,4,8,16,24,32"
    date_added: number; // timestamp
    date_modified: number; // timestamp
    commodity_name: string; // "Aluminum"
    terminal_name: string; // "TDD Area 18" 
}

export interface FormattedCommodityMaxPrice {
    id: number;
    name: string;
    raw: {
        price_sell: number;
    };
    refined: {
        price_sell: number;
    };
}

export interface ComodityPriceSum {
    full_name: string;
    terminal_name: string;
    price_sell_sum: number;
    minerals: Mineral[];
}

// Ids to exclude from display because they are minerals that are not sold on the market or that cause problems
export const excludedIds = [35, 119, 21, 45, 172];