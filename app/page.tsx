"use client"

import { useState, useMemo, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Header } from "@/components/Header"
import { RockCard } from "@/components/RockCard"
import { MineralFilter } from "@/components/MineralFilter"
import { Mountain } from "lucide-react"
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api-endpoints"
import { Rock } from "@/models/Rock"

export default function Home() {
  const { t } = useTranslation()
  const [selectedMineral, setSelectedMineral] = useState("all")
  const [selectedSystem, setSelectedSystem] = useState("all")
  const [selectedBody, setSelectedBody] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const [rocks, setRocks] = useState<Rock[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const filteredRocks = useMemo(() => {
    if (isLoading) return [];
    return rocks.filter((rock) => {
      const matchesMineral =
        selectedMineral === "all" ||
        rock.primary === selectedMineral ||
        rock.secondary.some(sec => sec === selectedMineral)
      const matchesSystem =
        selectedSystem === "all" || rock.system === selectedSystem
      const matchesBody =
        selectedBody === "all" || rock.body === selectedBody
      const matchesSearch =
        searchQuery === "" ||
        rock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rock.primary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rock.secondary.some((mineral) =>
          mineral.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        rock.system.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rock.body.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesMineral && matchesSystem && matchesBody && matchesSearch
    }).sort((a, b) => {
      const aIsPrimary = a.primary === selectedMineral
      const bIsPrimary = b.primary === selectedMineral
      if (aIsPrimary && !bIsPrimary) return -1
      if (!aIsPrimary && bIsPrimary) return 1

      const aIsSecondary = a.secondary.some(sec => sec === selectedMineral)
      const bIsSecondary = b.secondary.some(sec => sec === selectedMineral)
      if (aIsSecondary && !bIsSecondary) return -1
      if (!aIsSecondary && bIsSecondary) return 1

      // if name exists, sort by name
      if (a.name && b.name) {
        return a.name.localeCompare(b.name)
      }

      return 0
    }).filter(rock => !rock.isHidden)
  }, [rocks, selectedMineral, selectedSystem, selectedBody, searchQuery, isLoading])

  useEffect(() => {
    setIsLoading(true);
    fetch(API_BASE_URL + API_ENDPOINTS.rocks)
      .then(res => res.json())
      .then(data => {
        const rocksData = data.map((item: any) => ({
          name: item.name,
          system: item.system,
          body: item.body,
          primary: item.primary,
          secondary: item.secondary ? item.secondary.split(",").map((s: string) => s.trim()) : [],
          min: parseInt(item.min, 10),
          max: parseInt(item.max, 10),
          median: parseInt(item.median, 10),
          isHidden: item.isHidden === "TRUE" || item.isHidden === true,
        }))
        setRocks(rocksData);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  function getSecondaryQualityStat(secondaries: string[], body: string): { mineral: string, min: number, max: number, median: number }[] {
    if (secondaries.length === 0) return [];
    return secondaries.map((mineral) => ({
      mineral,
      min: rocks.find(r => r.body === body && (r.primary === mineral))?.min || 0,
      max: rocks.find(r => r.body === body && (r.primary === mineral))?.max || 0,
      median: rocks.find(r => r.body === body && (r.primary === mineral))?.median || 0,
    }))
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Mountain className="h-8 w-8 text-cyan-400" />
            <h1 className="text-3xl font-bold tracking-tight text-cyan-50" suppressHydrationWarning>
              {t("home.title")}
            </h1>
          </div>
          <p className="text-slate-400" suppressHydrationWarning>
            {t("home.description")}
          </p>
          {/* Info zone stylisée */}
          <div
            className="mt-6 rounded-xl border border-cyan-800 bg-gradient-to-br from-slate-900/80 to-cyan-950/80 p-5 shadow-lg flex items-center gap-3"
            style={{ backdropFilter: 'blur(4px)' }}
          >
            <span className="text-cyan-100 text-xs font-medium tracking-wide" suppressHydrationWarning>{t("home.infoZone")}</span>
          </div>
        </div>

        <div className="mb-8">
          <MineralFilter
            selectedMineral={selectedMineral}
            onMineralChange={setSelectedMineral}
            selectedSystem={selectedSystem}
            onSystemChange={setSelectedSystem}
            selectedBody={selectedBody}
            onBodyChange={setSelectedBody}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        <div className="mb-4 text-sm text-slate-500" suppressHydrationWarning>
          {isLoading
            ? t("home.loading")
            : t("home.showing", { count: filteredRocks.length, total: rocks.length })}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-slate-800 bg-slate-900/30 py-16">
            <Mountain className="mb-4 h-12 w-12 text-slate-700 animate-spin" />
            <p className="text-lg text-slate-400" suppressHydrationWarning>{t("home.loading")}</p>
          </div>
        ) : rocks.length > 0 && filteredRocks.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRocks.map((rock, index) => (
              <RockCard key={`${rock.name}-${rock.system}-${index}`} rock={rock} secondaries={getSecondaryQualityStat(rock.secondary, rock.body)} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-slate-800 bg-slate-900/30 py-16">
            <Mountain className="mb-4 h-12 w-12 text-slate-700" />
            <p className="text-lg text-slate-400" suppressHydrationWarning>{t("home.noRocksFound")}</p>
            <p className="text-sm text-slate-500" suppressHydrationWarning>
              {t("home.noRocksHint")}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
