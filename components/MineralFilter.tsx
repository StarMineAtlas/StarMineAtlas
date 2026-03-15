"use client"

import { useTranslation } from "react-i18next"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Filter, Search, Globe, MapPin, Gem } from "lucide-react"

import { useEffect, useState } from "react"
import { set } from "date-fns"
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api-endpoints"

interface MineralFilterProps {
  selectedMineral: string
  onMineralChange: (mineral: string) => void
  selectedSystem: string
  onSystemChange: (system: string) => void
  selectedBody: string
  onBodyChange: (body: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function MineralFilter({
  selectedMineral,
  onMineralChange,
  selectedSystem,
  onSystemChange,
  selectedBody,
  onBodyChange,
  searchQuery,
  onSearchChange,
}: MineralFilterProps) {
  const { t } = useTranslation()

  // State filters
  const [minerals, setMinerals] = useState<{ name: string; type: string }[]>([])
  const [systems, setSystems] = useState<{ name: string }[]>([])
  const [bodies, setBodies] = useState<{ name: string, system: string }[]>([])

  // Debounced search state
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery)

  useEffect(() => {
    const handler = setTimeout(() => {
      if (debouncedSearch !== searchQuery) {
        onSearchChange(debouncedSearch)
      }
    }, 500)
    return () => clearTimeout(handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  // Keep debouncedSearch in sync if searchQuery changes externally
  useEffect(() => {
    setDebouncedSearch(searchQuery)
  }, [searchQuery])

  useEffect(() => {
    fetch(API_BASE_URL + API_ENDPOINTS.minerals)
      .then(res => res.json())
      .then(data => setMinerals(data))

    fetch(API_BASE_URL + API_ENDPOINTS.systems)
      .then(res => res.json())
      .then(data => setSystems(data))

    fetch(API_BASE_URL + API_ENDPOINTS.bodies)
      .then(res => res.json())
      .then(data => setBodies(data))
  }, []);

  // Regroup minerals by type
  const mineralsByType = minerals.reduce<{ [key: string]: { name: string; type: string }[] }>((acc, mineral) => {
    if (!acc[mineral.type]) acc[mineral.type] = [];
    acc[mineral.type].push(mineral);
    return acc;
  }, {});

  // Get available bodies based on selected system
  const availableBodies =
    selectedSystem === "all"
      ? bodies
      : bodies.filter(body => body.system === selectedSystem)

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <Input
          suppressHydrationWarning
          type="text"
          placeholder={t("filters.searchPlaceholder")}
          value={debouncedSearch}
          onChange={(e) => setDebouncedSearch(e.target.value)}
          className="border-slate-800 bg-slate-900/50 pl-10 text-cyan-50 placeholder:text-slate-500 focus:border-cyan-700 focus:ring-cyan-700/20"
        />
      </div>

      {/* Filter Row */}
      <div className="flex flex-col md:flex-row flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-slate-400">
          <Filter className="h-4 w-4" />
          <span className="text-sm" suppressHydrationWarning>{t("filters.filters")}</span>
        </div>

        {/* System Filter */}
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-slate-500" />
          <Select value={selectedSystem} onValueChange={(value) => {
            onSystemChange(value)
            // Reset body filter when system changes
            if (value !== selectedSystem) {
              onBodyChange("all")
            }
          }}>
            <SelectTrigger className="w-[160px] border-slate-800 bg-slate-900/50 text-cyan-50 focus:border-cyan-700 focus:ring-cyan-700/20">
              <SelectValue placeholder="System" />
            </SelectTrigger>
            <SelectContent className="border-slate-800 bg-slate-900">
              <SelectItem
                value="all"
                className="text-cyan-50 focus:bg-slate-800 focus:text-cyan-300"
              >
                {t("filters.allSystems")}
              </SelectItem>
              {systems && systems.length > 0 && systems.map((system) => (
                <SelectItem
                  key={system.name}
                  value={system.name}
                  className="text-cyan-50 focus:bg-slate-800 focus:text-cyan-300"
                >
                  {system.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Body Filter */}
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-slate-500" />
          <Select value={selectedBody} onValueChange={onBodyChange}>
            <SelectTrigger className="w-[180px] border-slate-800 bg-slate-900/50 text-cyan-50 focus:border-cyan-700 focus:ring-cyan-700/20">
              <SelectValue placeholder="Celestial Body" />
            </SelectTrigger>
            <SelectContent className="border-slate-800 bg-slate-900">
              <SelectItem
                value="all"
                className="text-cyan-50 focus:bg-slate-800 focus:text-cyan-300"
              >
                {t("filters.allBodies")}
              </SelectItem>
              {/* Group bodies by system */}
              {(() => {
                const bodiesBySystem = availableBodies.reduce<{ [key: string]: { name: string; system: string }[] }>((acc, body) => {
                  if (!acc[body.system]) acc[body.system] = [];
                  acc[body.system].push(body);
                  return acc;
                }, {});
                return Object.entries(bodiesBySystem).map(([system, bodiesList]) => (
                  <div key={system}>
                    <div className="px-2 py-1 text-xs font-semibold text-cyan-300/80 uppercase select-none">
                      {system}
                    </div>
                    {bodiesList.map((body) => (
                      <SelectItem
                        key={body.name}
                        value={body.name}
                        className="text-cyan-50 focus:bg-slate-800 focus:text-cyan-300"
                      >
                        {body.name}
                      </SelectItem>
                    ))}
                  </div>
                ));
              })()}
            </SelectContent>
          </Select>
        </div>

        {/* Mineral Filter */}
        <div className="flex items-center gap-2">
          <Gem className="h-4 w-4 text-slate-500" />
          <Select value={selectedMineral} onValueChange={onMineralChange}>
            <SelectTrigger className="w-[180px] border-slate-800 bg-slate-900/50 text-cyan-50 focus:border-cyan-700 focus:ring-cyan-700/20">
              <SelectValue placeholder="Mineral" />
            </SelectTrigger>
            <SelectContent className="border-slate-800 bg-slate-900">
              <SelectItem
                value="all"
                className="text-cyan-50 focus:bg-slate-800 focus:text-cyan-300"
              >
                {t("filters.allMinerals")}
              </SelectItem>
              {/* Group minerals by type */}
              {Object.entries(mineralsByType).map(([type, mineralsList]) => (
                <div key={type}>
                  <div className="px-2 py-1 text-xs font-semibold text-cyan-300/80 uppercase select-none">
                    {type}
                  </div>
                  {mineralsList.map((mineral) => (
                    <SelectItem
                      key={mineral.name}
                      value={mineral.name}
                      className="text-cyan-50 focus:bg-slate-800 focus:text-cyan-300"
                    >
                      {mineral.name}
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
