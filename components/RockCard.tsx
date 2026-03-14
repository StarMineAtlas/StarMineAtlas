"use client"

import { useTranslation } from "react-i18next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gem, Layers, CircleDot, Globe, MapPin, Activity } from "lucide-react"

interface Rock {
  name: string
  system: string
  body: string
  primary: string
  secondary: string[]
  min: number
  max: number
  med: number
}

interface RockCardProps {
  rock: Rock
  secondaries: { mineral: string; min: number; max: number; med: number }[]
}

function getQualityColor(min: number, max: number): string {
  const avg = (min + max) / 2
  if (avg < 300) return "bg-red-500"
  if (avg < 600) return "bg-yellow-500"
  return "bg-green-500"
}

function getQualityTextColor(min: number, max: number): string {
  const avg = (min + max) / 2
  if (avg < 300) return "text-red-400"
  if (avg < 600) return "text-yellow-400"
  return "text-green-400"
}


export function RockCard({ rock, secondaries }: RockCardProps) {
  const { t } = useTranslation()
  const [minPrimary, maxPrimary, medPrimary] = [rock.min, rock.max, rock.med]
  const minPrimaryPercent = (minPrimary / 1000) * 100
  const maxPrimaryPercent = (maxPrimary / 1000) * 100
  const medPrimaryPercent = (medPrimary / 1000) * 100

  return (
    <Card className="group relative overflow-hidden border-slate-800 bg-slate-900/50 transition-all duration-300 hover:border-cyan-700/50 hover:bg-slate-900 hover:shadow-lg hover:shadow-cyan-900/20">
      {/* Scanner line effect */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base text-cyan-50">
          <Gem className="h-4 w-4 text-cyan-400" />
          <span className="truncate w-4/5">{rock.name}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 text-sm">
        {/* Ressources (primaire + secondaires) */}
        <div className="flex flex-col gap-3">
          {/* Primaire */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <CircleDot className="h-3.5 w-3.5 text-cyan-500" />
              <span className="text-slate-400" suppressHydrationWarning>{t("rockCard.primary")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="border-cyan-700/50 bg-cyan-950/50 text-cyan-300 font-semibold"
              >
                {rock.primary}
              </Badge>
              <span className={`ml-2 font-mono text-xs ${getQualityTextColor(minPrimary, maxPrimary)}`}>{minPrimary} – {maxPrimary}</span>
            </div>
            <div className="relative h-2 w-full max-w-xs overflow-hidden rounded-full bg-slate-800 mt-2">
              <div
                id={`${rock.name}-primary-quality`}
                className={`absolute rounded-xl left-0 top-0 h-full transition-all duration-500 ${getQualityColor(minPrimary, maxPrimary)}`}
                style={{ left: `${minPrimaryPercent}%`, width: `${maxPrimaryPercent - minPrimaryPercent}%` }}
              />
              <div
                id={`${rock.name}-primary-median`}
                className={`absolute rounded-xl left-0 top-0 h-full transition-all duration-500 bg-white`}
                style={{ left: `${medPrimaryPercent}%`, width: `4px` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 px-1 mb-1 max-w-xs w-full">
              <span>0</span>
              <span>1000</span>
            </div>
          </div>

          {/* Secondaires */}
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <Layers className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-slate-400" suppressHydrationWarning>{t("rockCard.secondary")}</span>
              {secondaries.length === 0 && (
                <span className="text-slate-500" suppressHydrationWarning>{t("rockCard.none")}</span>
              )}
            </div>
            {secondaries.map((sec: { mineral: string; min: number; max: number; med: number }) => {
              const { min: minSec, max: maxSec, med: medSec } = sec
              const minSecPercent = (minSec / 1000) * 100
              const maxSecPercent = (maxSec / 1000) * 100
              const medSecPercent = (medSec / 1000) * 100
              return (
                <div key={sec.mineral} className="flex flex-col gap-0.5 w-full">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="border-slate-700 text-slate-300 font-medium"
                    >
                      {sec.mineral}
                    </Badge>
                    <span className={`font-mono text-xs ${getQualityTextColor(minSec, maxSec)}`}>{minSec} – {maxSec}</span>
                  </div>
                  <div className="relative h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-slate-800 mt-2">
                    <div
                      id={`${sec.mineral}-secondary-quality`}
                      className={`absolute rounded-xl left-0 top-0 h-full transition-all duration-500 ${getQualityColor(minSec, maxSec)}`}
                      style={{ left: `${minSecPercent}%`, width: `${maxSecPercent - minSecPercent}%` }}
                    />
                    <div
                      id={`${sec.mineral}-secondary-median`}
                      className={`absolute rounded-xl left-0 top-0 h-full transition-all duration-500 bg-white`}
                      style={{ left: `${medSecPercent}%`, width: `4px` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 px-1 mb-1 max-w-xs w-full">
                    <span>0</span>
                    <span>1000</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Location Info */}
        <div className="border-t border-slate-800 pt-3 space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-slate-400" suppressHydrationWarning>{t("rockCard.celestialBody")}</span>
            <span className="text-cyan-200" suppressHydrationWarning>{rock.body}</span>
          </div>

          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-slate-400" suppressHydrationWarning>{t("rockCard.system")}</span>
            <span className="text-cyan-200" suppressHydrationWarning>{rock.system}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
