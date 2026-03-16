"use client"

import { useTranslation } from "react-i18next"
import { Header } from "@/components/Header"
import { QualityChart } from "@/components/QualityChart"
import { qualityDistribution } from "@/data/qualityDistribution"
import { BarChart3, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function QualityDistributionPage() {
  const { t } = useTranslation()

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
            <QualityChart data={qualityDistribution} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
