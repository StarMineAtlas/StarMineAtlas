import { useTranslation } from "react-i18next"
import { useEffect, useState } from "react"

interface FinalSellingPriceProps {
    price: number,
    updatePrice: (price: number) => void
}

export default function FinalSellingPrice({ price, updatePrice }: FinalSellingPriceProps) {
    const { t } = useTranslation()
    const [inputValue, setInputValue] = useState(price)

    // Reset input value when price prop changes
    useEffect(() => {
        setInputValue(price)
        updatePrice(price)
    }, [price])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = Number(e.target.value)
        setInputValue(newValue)
        updatePrice(newValue)
    }

    return (
        <div className="w-full flex flex-col gap-2 border-t border-slate-800 pt-4">
            <h3 className="text-sm text-slate-400">{t("workOrder.sellingSection.finalSellingPrice")}</h3>
            <div className="relative w-full">
                <input
                    type="number"
                    className="text-lg text-end font-bold pr-14 pl-2 py-1 rounded border border-slate-700 bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                    value={inputValue}
                    onChange={handleInputChange}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 device-font pointer-events-none">aUEC</span>
            </div>
        </div>
    )
}