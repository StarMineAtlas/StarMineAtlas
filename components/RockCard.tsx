"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mineral, MineralType } from "@/models/Mineral"
import { Rock, RockSecondaries } from "@/models/Rock"
import { CircleDot, Gem, Globe, Layers, Pickaxe, Radar, Rocket } from "lucide-react"
import { useTranslation } from "react-i18next"

interface RockCardProps {
  rock: Rock
  secondaries: RockSecondaries[]
  mineral: Mineral | null
  showData?: boolean
}

const getQualityColor = (min: number, max: number): string => {
  const avg = (min + max) / 2
  if (avg < 300) return "bg-red-500"
  if (avg < 600) return "bg-yellow-500"
  return "bg-green-500"
}

const getQualityTextColor = (min: number, max: number): string => {
  const avg = (min + max) / 2
  if (avg < 300) return "text-red-400"
  if (avg < 600) return "text-yellow-400"
  return "text-green-400"
}

const getSystemColor = (system: string): string => {
  switch (system.toLowerCase()) {
    case "stanton":
      return "text-yellow-400"
    case "pyro":
      return "text-red-400"
    case "nyx":
      return "text-blue-400"
    default:
      return "text-slate-300"
  }
}


export function RockCard({ rock, secondaries, showData, mineral }: RockCardProps) {
  const { t } = useTranslation()
  const [minPrimary, maxPrimary, medPrimary] = [rock.min, rock.max, rock.median]
  const minPrimaryPercent = (minPrimary / 1000) * 100
  const maxPrimaryPercent = (maxPrimary / 1000) * 100
  const medPrimaryPercent = (medPrimary / 1000) * 100

  return (
    <Card className="group gap-2 relative overflow-hidden border-slate-800 bg-slate-900/50 transition-all duration-300 hover:border-cyan-700/50 hover:bg-slate-900 hover:shadow-lg hover:shadow-cyan-900/20">
      {/* Scanner line effect */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-cyan-50">
          {mineral?.type === MineralType.FPS && <Pickaxe className="h-4 w-4 text-purple-400" />}
          {mineral?.type === MineralType.SHIP && <Rocket className="h-4 w-4 text-blue-400" />}
          {mineral?.type === null && <Gem className="h-4 w-4 text-cyan-400" />}
          <span className="truncate w-4/5">{rock.name}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 text-sm">
        {/* Location Info */}
        <div className="border-t border-b border-slate-800 py-4 space-y-2">
          {/* <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-slate-400" suppressHydrationWarning>{t("home.rockCard.celestialBody")}</span>
            <span className="text-cyan-200" suppressHydrationWarning>{rock.body}</span>
          </div> */}

          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-slate-400" suppressHydrationWarning>{t("home.rockCard.system")}</span>
            <span className={`${getSystemColor(rock.system)}`} suppressHydrationWarning>{rock.system}</span>
          </div>

          {mineral && mineral.radarValue && (
            <div className="flex items-center gap-2">
              <Radar className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-slate-400" suppressHydrationWarning>{t("home.rockCard.radar")}</span>
              <span className={`text-yellow-100`} suppressHydrationWarning>{mineral.radarValue}</span>
            </div>
          )}
        </div>
        {/* Ressources (primaire + secondaires) */}
        <div className="flex flex-col gap-3">
          {/* Primaire */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <CircleDot className="h-3.5 w-3.5 text-cyan-500" />
              <span className="text-slate-400" suppressHydrationWarning>{t("home.rockCard.primary")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="border-cyan-700/50 bg-cyan-950/50 text-cyan-300 font-semibold"
              >
                {rock.primary}
              </Badge>
              {rock.max > 0 && showData && (
                <span className={`ml-2 font-mono text-xs ${getQualityTextColor(minPrimary, maxPrimary)}`}>{minPrimary} – {maxPrimary}</span>
              )}
            </div>
            {rock.max > 0 && showData ? (
              <>
                <div className="relative h-2 w-full max-w-xs overflow-visible rounded-full bg-slate-800 mt-2">
                  <div className="relative h-full w-full">
                    <div
                      id={`${rock.name}-primary-quality`}
                      className={`absolute rounded-xl left-0 top-0 h-full transition-all duration-500 ${getQualityColor(minPrimary, maxPrimary)} group/qualitybar`}
                      style={{ left: `${minPrimaryPercent}%`, width: `${maxPrimaryPercent - minPrimaryPercent}%` }}
                    >
                      {/* Tooltip for median, only on bar hover */}
                      <div
                        className="pointer-events-none absolute left-1/2 bottom-0 z-20 translate-y-full -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-xs text-cyan-200 opacity-0 shadow transition-opacity duration-200 group-hover/qualitybar:opacity-100"
                        style={{ minWidth: '80px' }}
                      >
                        {t("home.rockCard.median")} <span className="font-mono">{medPrimary}</span>
                      </div>
                    </div>
                    <div
                      id={`${rock.name}-primary-median`}
                      className={`absolute rounded-xl left-0 top-0 h-full transition-all duration-500 bg-white`}
                      style={{ left: `${medPrimaryPercent}%`, width: `4px` }} />
                  </div>
                </div><div className="flex justify-between text-[10px] text-slate-500 px-1 mb-1 max-w-xs w-full">
                  <span>0</span>
                  <span className="text-white flex md:hidden">{t("home.rockCard.median")} {medPrimary}</span>
                  <span>1000</span>
                </div>
              </>
            ) : showData && (
              <div className="rounded bg-slate-800/70 px-2 py-1 text-[11px] text-slate-400 max-w-xs w-fit border border-slate-700 mt-2">
                {t("home.rockCard.notEnoughData")}
              </div>
            )}
          </div>

          {/* Secondaires */}
          {secondaries.length > 0 && (
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Layers className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-slate-400" suppressHydrationWarning>{t("home.rockCard.secondary")}</span>
                {secondaries.length === 0 && (
                  <span className="text-slate-500" suppressHydrationWarning>{t("home.rockCard.none")}</span>
                )}
              </div>
              <div className={`flex w-full ${showData ? "flex-col gap-0.5" : "flex-row gap-2"}`}>
                {secondaries.map((sec: { mineral: string; min: number; max: number; median: number }) => {
                  const { min: minSec, max: maxSec, median: medSec } = sec
                  const minSecPercent = (minSec / 1000) * 100
                  const maxSecPercent = (maxSec / 1000) * 100
                  const medSecPercent = (medSec / 1000) * 100
                  return (
                    <div key={sec.mineral} className={`flex flex-col gap-0.5 ${showData ? "w-full" : "w-auto"}`}>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="border-slate-700 text-slate-300 font-medium"
                        >
                          {sec.mineral}
                        </Badge>
                        {sec.max > 0 && showData && (
                          <span className={`font-mono text-xs ${getQualityTextColor(minSec, maxSec)}`}>{minSec} – {maxSec}</span>
                        )}
                      </div>
                      {sec.max > 0 && showData ? (
                        <>
                          <div className="relative h-1.5 w-full max-w-xs overflow-visible rounded-full bg-slate-800 mt-2">
                            <div className="relative h-full w-full">
                              <div
                                id={`${sec.mineral}-secondary-quality`}
                                className={`absolute rounded-xl left-0 top-0 h-full transition-all duration-500 ${getQualityColor(minSec, maxSec)} group/qualitybar-secondary`}
                                style={{ left: `${minSecPercent}%`, width: `${maxSecPercent - minSecPercent}%` }}
                              >
                                {/* Tooltip for median, only on bar hover */}
                                <div
                                  className="pointer-events-none absolute left-1/2 bottom-0 z-20 translate-y-full -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-xs text-cyan-200 opacity-0 shadow transition-opacity duration-200 group-hover/qualitybar-secondary:opacity-100"
                                  style={{ minWidth: '80px' }}
                                >
                                  {t("home.rockCard.median")} <span className="font-mono">{medSec}</span>
                                </div>
                              </div>
                              <div
                                id={`${sec.mineral}-secondary-median`}
                                className={`absolute rounded-xl left-0 top-0 h-full transition-all duration-500 bg-white`}
                                style={{ left: `${medSecPercent}%`, width: `4px` }}
                              />
                            </div>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500 px-1 mb-1 max-w-xs w-full">
                            <span>0</span>
                            <span className="text-white flex md:hidden">{t("home.rockCard.median")} {medSec}</span>
                            <span>1000</span>
                          </div>
                        </>
                      ) : showData && (
                        <div className="rounded bg-slate-800/70 px-2 py-1 text-[11px] text-slate-400 max-w-xs w-fit border border-slate-700 mt-2 mb-2">
                          {t("home.rockCard.notEnoughData")}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
