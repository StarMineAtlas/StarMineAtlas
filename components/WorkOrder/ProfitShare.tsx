import { Expense, User } from "@/models/WorkOrder"
import { PlusCircle, Trash } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "../ui/button"

interface ProfitShareProps {
    usersList?: User[]
    expensesList?: Expense[]
    finalPrice?: number
    updateUsersList?: (users: User[]) => void
}

export default function ProfitShare({ usersList, expensesList, finalPrice, updateUsersList }: ProfitShareProps) {

    const { t } = useTranslation()

    const [profitShares, setProfitShares] = useState<{ userId: number, part: number, share: number }[]>([])
    const [newUsername, setNewUsername] = useState("")

    useEffect(() => {
        if (usersList && usersList.length > 0) {
            // initial share: equal distribution
            const n = usersList.length;
            const initialProfitShares = usersList.map(user => ({
                userId: user.id,
                part: 1,
                share: finalPrice ? (finalPrice / n) : 0
            }));

            // Expenses repartition: each expense is taken from the other users
            expensesList?.forEach(expense => {
                if (n <= 1) return;
                const amountPerOther = expense.amount / n;
                let totalRetire = 0;
                initialProfitShares.forEach(share => {
                    if (share.userId !== expense.userId) {
                        share.share -= amountPerOther;
                        totalRetire += amountPerOther;
                    }
                });
                // Add the total amount retired to the payer
                const payer = initialProfitShares.find(share => share.userId === expense.userId);
                if (payer) {
                    payer.share += totalRetire;
                }
            });

            // Round the shares after all expenses
            let roundedShares = initialProfitShares.map(share => ({ ...share, share: Math.round(share.share) }));

            // Adjust the last share to ensure the total equals finalPrice
            if (finalPrice && roundedShares.length > 0) {
                const total = roundedShares.reduce((sum, s) => sum + s.share, 0);
                const diff = finalPrice - total;
                // Adjust the last user's share to avoid distorting the distribution
                roundedShares[roundedShares.length - 1].share += diff;
            }

            setProfitShares(roundedShares);
        }
    }, [usersList, finalPrice, expensesList])

    const handleAddUser = (username: string) => {
        if (!username.trim()) return;
        const newUser: User = {
            id: usersList ? usersList.length : 0,
            username: username.trim()
        }

        const newProfitShare = {
            userId: newUser.id,
            part: 1,
            share: finalPrice ? Math.round((1 / (usersList ? usersList.length + 1 : 1)) * finalPrice) : 0
        }

        setProfitShares(prev => [...prev, newProfitShare])
        if (updateUsersList) {
            updateUsersList(usersList ? [...usersList, newUser] : [newUser])
        }
        setNewUsername("")
    }

    const handleCleanAll = () => {
        setProfitShares([])
        if (updateUsersList) {
            updateUsersList([usersList ? usersList[0] : { id: 0, username: "You" }])
        }

    }

    return (
        <div className="w-full flex flex-col gap-2 border-t border-slate-800 pt-4">
            {/* ACTIONS */}
            <div
                className={`flex justify-between flex-col gap-4 ${profitShares.length >= 20
                    ? "md:flex-row-reverse"
                    : "md:flex-row"
                    }`}
            >

                {profitShares.length < 20 && (
                    <form
                        onSubmit={e => {
                            e.preventDefault();
                            handleAddUser(newUsername);
                        }}
                        className="flex gap-2 items-center"
                    >
                        <input
                            type="text"
                            value={newUsername}
                            onChange={e => setNewUsername(e.target.value)}
                            placeholder={t("workOrder.sellingSection.profitShare.addUser")}
                            className="self-start border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        />
                        <Button
                            type="submit"
                            className="bg-cyan-400 text-white hover:bg-cyan-500 flex items-center gap-2 px-4 py-2 font-semibold rounded-lg"
                            disabled={!newUsername.trim()}
                        >
                            <PlusCircle className="w-5 h-5" />
                        </Button>
                    </form>
                )}

                {profitShares.length > 0 && (
                    <Button
                        onClick={handleCleanAll}
                        className="self-start bg-red-500 text-white hover:bg-red-600 flex items-center gap-2 px-6 py-3 font-semibold rounded-lg"
                    >
                        <Trash className="w-5 h-5" />
                        {t("workOrder.sellingSection.profitShare.cleanAll")}
                    </Button>
                )}
            </div>

            {/* LIST */}
            {profitShares.length > 0 && (
                <div className="flex flex-col gap-2">
                    {profitShares.map((share, index) => {
                        const user = usersList?.find(u => u.id === share.userId)
                        return (
                            <div key={index} className="flex justify-between items-center border border-slate-800 rounded-lg p-4">
                                <span>{user ? user.username : "Unknown User"}</span>
                                <span>{share.share} aUEC</span>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}