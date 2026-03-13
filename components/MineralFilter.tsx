"use client"

import { minerals } from "@/data/minerals"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Filter, Search } from "lucide-react"

interface MineralFilterProps {
  selectedMineral: string
  onMineralChange: (mineral: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function MineralFilter({
  selectedMineral,
  onMineralChange,
  searchQuery,
  onSearchChange,
}: MineralFilterProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <Input
          type="text"
          placeholder="Search rocks..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="border-slate-800 bg-slate-900/50 pl-10 text-cyan-50 placeholder:text-slate-500 focus:border-cyan-700 focus:ring-cyan-700/20"
        />
      </div>
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-slate-400" />
        <Select value={selectedMineral} onValueChange={onMineralChange}>
          <SelectTrigger className="w-[200px] border-slate-800 bg-slate-900/50 text-cyan-50 focus:border-cyan-700 focus:ring-cyan-700/20">
            <SelectValue placeholder="Filter by mineral" />
          </SelectTrigger>
          <SelectContent className="border-slate-800 bg-slate-900">
            <SelectItem value="all" className="text-cyan-50 focus:bg-slate-800 focus:text-cyan-300">
              All Minerals
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
  )
}
