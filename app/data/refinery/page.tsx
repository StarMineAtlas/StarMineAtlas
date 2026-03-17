"use client"

import { Header } from "@/components/Header"
import { useTranslation } from "react-i18next"
import { Construction, Factory } from "lucide-react"
import { useEffect, useState } from "react"
import { API_UEX_BASE_URL, UEX_API_ENDPOINTS } from "@/lib/api-endpoints"
import { RefineryMethod, RefineryRatingCost, RefineryRatingSpeed, RefineryRatingYield } from "@/models/Refinery"

export default function refinery() {
    const { t } = useTranslation()

    const [refineriesMethods, setRefineriesMethods] = useState<RefineryMethod[]>([] as RefineryMethod[]);

    useEffect(() => {
        fetch(API_UEX_BASE_URL + UEX_API_ENDPOINTS.refineriesMethods)
            .then(res => res.json())
            .then(json => {
                console.log('ICI', json.data)
                setRefineriesMethods(json.data);
            })
    }, [])

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50">
            <Header />
            <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="mb-6 flex items-center gap-3">
                        <Factory className="h-10 w-10 text-cyan-400" />
                        <h1 className="text-3xl font-bold tracking-tight text-cyan-50 sm:text-4xl" suppressHydrationWarning>
                            {t("refinery.title")}
                        </h1>
                    </div>
                    <p className="text-slate-400 mb-8" suppressHydrationWarning>
                        {t("refinery.description")}
                    </p>
                    <div className="flex items-center gap-2 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3">
                        <Construction className="h-5 w-5 text-amber-400" />
                        <span className="text-sm font-medium text-amber-400" suppressHydrationWarning>
                            {t("utils.wip")}
                        </span>
                    </div>
                    <div>
                        <table className="mt-8 w-full table-auto border-collapse text-left">
                            <thead>
                                <tr>
                                    <th className="border-b border-slate-700 px-4 py-2" suppressHydrationWarning>{t("refinery.methodName")}</th>
                                    <th className="border-b border-slate-700 px-4 py-2" suppressHydrationWarning>{t("refinery.yield.name")}</th>
                                    <th className="border-b border-slate-700 px-4 py-2" suppressHydrationWarning>{t("refinery.cost.name")}</th>
                                    <th className="border-b border-slate-700 px-4 py-2" suppressHydrationWarning>{t("refinery.speed.name")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {refineriesMethods && refineriesMethods.map((method: RefineryMethod) => (
                                    <tr key={method.id}>
                                        <td className="border-b border-slate-700 px-4 py-2">{method.name}</td>
                                        <td className="border-b border-slate-700 px-4 py-2" suppressHydrationWarning>{t(RefineryRatingYield[method.rating_yield as keyof typeof RefineryRatingYield])}</td>
                                        <td className="border-b border-slate-700 px-4 py-2" suppressHydrationWarning>{t(RefineryRatingCost[method.rating_cost as keyof typeof RefineryRatingCost])}</td>
                                        <td className="border-b border-slate-700 px-4 py-2" suppressHydrationWarning>{t(RefineryRatingSpeed[method.rating_speed as keyof typeof RefineryRatingSpeed])}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    )
}