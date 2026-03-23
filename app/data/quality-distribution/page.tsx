"use client"

import { Header } from "@/components/Header/Header"
import { QualityChart } from "@/components/QualityChart"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api-endpoints"
import { QualityDistributionData } from "@/models/QualityDistribution"
import { BarChart3, Info } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

export default function QualityDistributionPage() {
    const { t } = useTranslation()

    const [data, setData] = useState<QualityDistributionData>({} as QualityDistributionData)
    const [isLoading, setIsLoading] = useState(false)


    useEffect(() => {
        setIsLoading(true);

        fetch(API_BASE_URL + API_ENDPOINTS.graph)
            .then(res => res.json())
            .then(data => {
                const transformedData = {
                    ranges: data.map((item: any) => item.quality),
                    systems: {
                        Stanton: data.map((item: any) => parseInt(item.stanton)),
                        Pyro: data.map((item: any) => parseInt(item.pyro)),
                        Nyx: data.map((item: any) => parseInt(item.nyx)),
                    }
                }
                setData(transformedData);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-slate-950">
            <Header />
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <BarChart3 className="h-8 w-8 text-cyan-400" />
                        <h1 className="text-3xl font-bold tracking-tight text-cyan-50" suppressHydrationWarning>
                            {t("qualityDistribution.title")}
                        </h1>
                    </div>
                    <p className="text-slate-400" suppressHydrationWarning>
                        {t("qualityDistribution.description")}
                    </p>
                </div>

                <Card className="border-cyan-900/50 bg-slate-900/50 backdrop-blur-sm">
                    <CardHeader className="border-b border-cyan-900/30 pb-4">
                        <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-slate-400" suppressHydrationWarning>
                                {t("qualityDistribution.legend")}
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center rounded-lg border border-slate-800 bg-slate-900/30 py-16">
                                <BarChart3 className="mb-4 h-12 w-12 text-slate-700 animate-spin" />
                                <p className="text-lg text-center text-slate-400" suppressHydrationWarning>{t("qualityDistribution.loading")}</p>
                            </div>
                        ) : (
                            <>
                                {data.ranges && data.systems ? (
                                    <QualityChart data={data} />
                                ) : (
                                    <div className="flex flex-col items-center justify-center rounded-lg border border-slate-800 bg-slate-900/30 py-16">
                                        <p className="text-lg text-center text-slate-400" suppressHydrationWarning>{t("qualityDistribution.noData")}</p>
                                    </div>
                                )
                                }
                            </>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
