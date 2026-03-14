"use client"

import { useTranslation } from "react-i18next"
import { minerals } from "@/data/minerals"
import { systems } from "@/data/systems"
import { bodies } from "@/data/bodies"
import type { System } from "@/data/systems"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Filter, Search, Globe, MapPin, Gem } from "lucide-react"

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

  // Get available bodies based on selected system
  const availableBodies =
    selectedSystem === "all"
      ? Object.values(bodies).flat()
      : bodies[selectedSystem as System] || []

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <Input
          type="text"
          placeholder={t("filters.searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="border-slate-800 bg-slate-900/50 pl-10 text-cyan-50 placeholder:text-slate-500 focus:border-cyan-700 focus:ring-cyan-700/20"
        />
      </div>

      {/* Filter Row */}
      <div className="flex flex-col md:flex-row flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-slate-400">
          <Filter className="h-4 w-4" />
          <span className="text-sm">{t("filters.filters")}</span>
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
              {systems.map((system) => (
                <SelectItem
                  key={system}
                  value={system}
                  className="text-cyan-50 focus:bg-slate-800 focus:text-cyan-300"
                >
                  {system}
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
              {availableBodies.map((body) => (
                <SelectItem
                  key={body}
                  value={body}
                  className="text-cyan-50 focus:bg-slate-800 focus:text-cyan-300"
                >
                  {body}
                </SelectItem>
              ))}
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
              {minerals.map((mineral) => (
                <SelectItem
                  key={mineral}
                  value={mineral}
                  className="text-cyan-50 focus:bg-slate-800 focus:text-cyan-300"
                >
                  {mineral}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
