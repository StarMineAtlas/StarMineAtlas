import { User, WorkOrderData, WorkOrderExportData } from '@/models/WorkOrder'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

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