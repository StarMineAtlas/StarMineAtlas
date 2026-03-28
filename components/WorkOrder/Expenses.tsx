import { Expense, User } from "@/models/WorkOrder"
import { PlusCircle, Trash } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "../ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "../ui/select"
import { Switch } from "../ui/switch"

interface ExpensesProps {
    expensesList: Expense[]
    usersList?: User[]
    profitShares?: { userId: number, part: number, share: number }[]
    updateExpenseList: (expenses: Expense[]) => void
}

type LocalInput = {
    name: string
    amount: number
    userId: number
}

export default function Expenses({
    expensesList,
    usersList,
    profitShares,
    updateExpenseList
}: ExpensesProps) {
    const { t } = useTranslation()

    const [localInputs, setLocalInputs] = useState<Record<number, LocalInput>>({})

    const [includeTransferFee, setIncludeTransferFee] = useState(false)

    const debounceTimeouts = useRef<Record<string, NodeJS.Timeout>>({})

    useEffect(() => {
        // Synchronise toujours localInputs avec expensesList
        const next: Record<number, LocalInput> = {}
        expensesList.forEach(e => {
            next[e.id] = {
                name: e.name,
                amount: e.amount,
                userId: e.userId
            }
        })
        setLocalInputs(next)
    }, [expensesList])

    const debounceUpdate = (key: string, callback: () => void) => {
        if (debounceTimeouts.current[key]) {
            clearTimeout(debounceTimeouts.current[key])
        }

        debounceTimeouts.current[key] = setTimeout(callback, 600)
    }

    const handleAddExpense = () => {
        const newExpense: Expense = {
            id:
                expensesList.length > 0
                    ? Math.max(...expensesList.map(e => e.id)) + 1
                    : 1,
            name: "",
            amount: 0,
            userId: usersList?.[0]?.id ?? 0
        }

        updateExpenseList([...expensesList, newExpense])
    }

    const handleCleanAll = () => {
        updateExpenseList([])
    }

    const handleDeleteExpense = (id: number) => {
        updateExpenseList(expensesList.filter(e => e.id !== id))
    }

    const handleUpdateExpense = (
        id: number,
        field: keyof Expense,
        value: string | number
    ) => {
        setLocalInputs(prev => {
            const updated = {
                ...prev,
                [id]: {
                    ...prev[id],
                    [field]: value
                }
            }

            debounceUpdate(`${field}-${id}`, () => {
                updateExpenseList(
                    expensesList.map(e =>
                        e.id === id ? { ...e, ...updated[id] } : e
                    )
                )
            })

            return updated
        })
    }

    useEffect(() => {
        if (!includeTransferFee) return;
        const transferFeeIndex = expensesList.findIndex(e =>
            e.name.toLowerCase().includes("transfer fee")
        );
        const expectedAmount = calculateTransferFee();
        if (transferFeeIndex !== -1) {
            const current = expensesList[transferFeeIndex];
            if (current.amount !== expectedAmount) {
                const updatedExpense = {
                    ...current,
                    amount: expectedAmount
                };
                const newExpenses = [
                    ...expensesList.slice(0, transferFeeIndex),
                    updatedExpense,
                    ...expensesList.slice(transferFeeIndex + 1)
                ];
                updateExpenseList(newExpenses);
            }
        }
    }, [profitShares]);

    const handleIncludeTransferFeeChange = (checked: boolean) => {
        setIncludeTransferFee(checked)

        const transferFeeIndex = expensesList.findIndex(e =>
            e.name.toLowerCase().includes("transfer fee")
        )

        if (checked) {
            if (transferFeeIndex === -1) {
                const newExpense: Expense = {
                    id:
                        expensesList.length > 0
                            ? Math.max(...expensesList.map(e => e.id)) + 1
                            : 1,
                    name: "Transfer fee",
                    amount: calculateTransferFee(),
                    userId: usersList?.[0]?.id ?? 0
                }
                updateExpenseList([...expensesList, newExpense])
            }
        } else {
            if (transferFeeIndex !== -1) {
                updateExpenseList(
                    expensesList.filter((_, index) => index !== transferFeeIndex)
                )
            }
        }
    }

    const calculateTransferFee = () => {
        const totalTransferPrice = profitShares ? profitShares.filter(share => share.userId !== 0).reduce((sum, share) => sum + share.share, 0) : 0;
        console.log("Total transfer price:", totalTransferPrice);
        return parseFloat((totalTransferPrice * (0.5 / 100)).toFixed(0));
    }

    return (
        <div className="flex flex-col gap-4 border-t border-slate-800 pt-4">
            {/* ACTIONS */}
            <div className="flex items-center gap-4">
                <span className="text-sm text-slate-200">
                    {t("workOrder.sellingSection.expenses.includeTransferFee")}
                </span>
                <Switch
                    id="include-transfer-fee-switch"
                    checked={includeTransferFee}
                    onCheckedChange={handleIncludeTransferFeeChange}
                    className="data-[state=checked]:bg-cyan-400 data-[state=unchecked]:bg-slate-700 border-slate-600"
                />
            </div>
            <div
                className={`flex justify-between flex-col gap-4 ${expensesList.length >= 20
                    ? "md:flex-row-reverse"
                    : "md:flex-row"
                    }`}
            >
                {expensesList.length < 20 && (
                    <Button
                        onClick={handleAddExpense}
                        className="self-start bg-cyan-400 text-white hover:bg-cyan-500 flex items-center gap-2 px-6 py-3 font-semibold rounded-lg"
                    >
                        <PlusCircle className="w-5 h-5" />
                        {t("workOrder.sellingSection.expenses.addExpense")}
                    </Button>
                )}

                {expensesList.length > 0 && (
                    <Button
                        onClick={handleCleanAll}
                        className="self-start bg-red-500 text-white hover:bg-red-600 flex items-center gap-2 px-6 py-3 font-semibold rounded-lg"
                    >
                        <Trash className="w-5 h-5" />
                        {t("workOrder.sellingSection.expenses.cleanAll")}
                    </Button>
                )}
            </div>

            {/* LIST */}
            {expensesList.length > 0 && (
                <div className="flex flex-col gap-2">
                    {expensesList.map(expense => {
                        const local = localInputs[expense.id] ?? expense

                        const user = usersList?.find(
                            u => u.id === local.userId
                        )

                        return (
                            <div
                                key={expense.id}
                                className="flex flex-col md:flex-row md:items-center justify-between gap-2 border border-slate-700 rounded-lg px-4 py-2"
                            >
                                <div className="flex flex-col md:flex-row md:items-center gap-2 flex-1">
                                    {/* USER SELECT */}
                                    <Select
                                        value={String(local.userId)}
                                        onValueChange={val =>
                                            handleUpdateExpense(
                                                expense.id,
                                                "userId",
                                                Number(val)
                                            )
                                        }
                                    >
                                        <SelectTrigger className="w-32 bg-slate-900/50 text-cyan-50">
                                            <SelectValue>
                                                {user?.username ?? ""}
                                            </SelectValue>
                                        </SelectTrigger>

                                        <SelectContent className="bg-slate-900">
                                            {usersList?.map(u => (
                                                <SelectItem
                                                    key={u.id}
                                                    value={String(u.id)}
                                                >
                                                    {u.username}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {/* NAME */}
                                    <input
                                        type="text"
                                        value={local.name}
                                        onChange={e =>
                                            handleUpdateExpense(
                                                expense.id,
                                                "name",
                                                e.target.value
                                            )
                                        }
                                        placeholder={t(
                                            "workOrder.sellingSection.expenses.namePlaceholder"
                                        )}
                                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm w-32"
                                    />

                                    {/* AMOUNT */}
                                    <input
                                        type="number"
                                        value={local.amount}
                                        onChange={e =>
                                            handleUpdateExpense(
                                                expense.id,
                                                "amount",
                                                Number(e.target.value)
                                            )
                                        }
                                        min={0}
                                        step={1}
                                        placeholder={t(
                                            "workOrder.sellingSection.expenses.amountPlaceholder"
                                        )}
                                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm w-24"
                                    />

                                    <span className="text-xs text-slate-400">
                                        aUEC
                                    </span>
                                </div>

                                {/* DELETE */}
                                <button
                                    onClick={() =>
                                        handleDeleteExpense(expense.id)
                                    }
                                    className="text-red-500 hover:text-red-700 p-1"
                                >
                                    <Trash className="w-5 h-5" />
                                </button>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}