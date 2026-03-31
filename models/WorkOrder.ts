import { MineralToSell } from "./Mineral";
import { RefineryMethod, RefineryWithLocationAndBonuses } from "./Refinery";

export interface User {
    id: number,
    username: string,
}

export interface Expense {
    id: number,
    name: string,
    amount: number,
    userId: number,
}

export interface ProfitShare {
    userId: number,
    part: number,
    share: number,
}

export interface WorkOrderData {
    profitShares: ProfitShare[];
    expensesList: Expense[];
    finalPrice: number;
    usersList: User[];
    selectedPrice: number;
    selectedSellingTerminalName: string | null;
    mineralsList: MineralToSell[];
    selectedMethod: RefineryMethod | null;
    selectedRefinery: RefineryWithLocationAndBonuses | null;
    timestamp?: number; // Optional timestamp to identify when the data was saved
}

export interface WorkOrderExportData {
    profitShares: Partial<ProfitShare>[];
    expensesList: Partial<Expense>[];
    finalPrice: number;
    selectedPrice: number;
    selectedSellingTerminalName: string;
    mineralsList: Partial<MineralToSell>[];
    selectedMethod: string;
    selectedRefinery: string;
    timestamp?: number; // Optional timestamp to identify when the data was saved
}