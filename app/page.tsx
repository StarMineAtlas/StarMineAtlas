"use client"

import { useState, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Header } from "@/components/Header"
import { RockCard } from "@/components/RockCard"
import { MineralFilter } from "@/components/MineralFilter"
import { rocks } from "@/data/rocks"
import type { Mineral } from "@/data/minerals"
import { Mountain } from "lucide-react"

export default function Home() {
  const { t } = useTranslation()
  const [selectedMineral, setSelectedMineral] = useState("all")
  const [selectedSystem, setSelectedSystem] = useState("all")
  const [selectedBody, setSelectedBody] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredRocks = useMemo(() => {
    return rocks.filter((rock) => {
      // Filter by mineral (primary OR secondary)
      const matchesMineral =
        selectedMineral === "all" ||
        rock.primary === selectedMineral ||
        rock.secondary.includes(selectedMineral as Mineral)

      // Filter by system
      const matchesSystem =
        selectedSystem === "all" || rock.system === selectedSystem

      // Filter by body
      const matchesBody =
        selectedBody === "all" || rock.body === selectedBody

      // Filter by search query
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
    })
  }, [selectedMineral, selectedSystem, selectedBody, searchQuery])

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
          {t("home.showing", { count: filteredRocks.length, total: rocks.length })}
        </div>

        {filteredRocks.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRocks.map((rock, index) => (
              <RockCard key={`${rock.name}-${rock.system}-${index}`} rock={rock} />
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
