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