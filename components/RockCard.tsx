import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Rock } from "@/data/rocks"
import { Gem, Layers, CircleDot, Globe, MapPin, Activity } from "lucide-react"

interface RockCardProps {
  rock: Rock
}

function getQualityColor(quality: number): string {
  if (quality < 300) return "bg-red-500"
  if (quality < 600) return "bg-yellow-500"
  return "bg-green-500"
}

function getQualityTextColor(quality: number): string {
  if (quality < 300) return "text-red-400"
  if (quality < 600) return "text-yellow-400"
  return "text-green-400"
}

export function RockCard({ rock }: RockCardProps) {
  const qualityPercent = (rock.quality / 1000) * 100

  return (
    <Card className="group relative overflow-hidden border-slate-800 bg-slate-900/50 transition-all duration-300 hover:border-cyan-700/50 hover:bg-slate-900 hover:shadow-lg hover:shadow-cyan-900/20">
      {/* Scanner line effect */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base text-cyan-50">
          <Gem className="h-4 w-4 text-cyan-400" />
          <span className="truncate">{rock.name} - {rock.body}</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3 text-sm">
        {/* Primary Mineral */}
        <div className="flex items-center gap-2">
          <CircleDot className="h-3.5 w-3.5 text-cyan-500" />
          <span className="text-slate-400">Primary:</span>
          <Badge
            variant="secondary"
            className="border-cyan-700/50 bg-cyan-950/50 text-cyan-300"
          >
            {rock.primary}
          </Badge>
        </div>

        {/* Secondary Minerals */}
        <div className="flex flex-wrap items-center gap-2">
          <Layers className="h-3.5 w-3.5 text-slate-500" />
          <span className="text-slate-400">Secondary:</span>
          {rock.secondary.length > 0 ? (
            rock.secondary.map((mineral) => (
              <Badge
                key={mineral}
                variant="outline"
                className="border-slate-700 text-slate-300"
              >
                {mineral}
              </Badge>
            ))
          ) : (
            <span className="text-slate-500">None</span>
          )}
        </div>

        {/* Inert Material */}
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              rock.inert ? "bg-amber-500" : "bg-slate-600"
            }`}
          />
          <span className="text-slate-400">Inert Material:</span>
          <span className={rock.inert ? "text-amber-400" : "text-slate-500"}>
            {rock.inert ? "Yes" : "No"}
          </span>
        </div>

        {/* Location Info */}
        <div className="border-t border-slate-800 pt-3 space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-slate-400">Celestial Body:</span>
            <span className="text-cyan-200">{rock.body}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-slate-400">System:</span>
            <span className="text-cyan-200">{rock.system}</span>
          </div>
        </div>

        {/* Quality Section */}
        <div className="border-t border-slate-800 pt-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-slate-400">Quality:</span>
            </div>
            <span className={`font-mono font-semibold ${getQualityTextColor(rock.quality)}`}>
              {rock.quality}
            </span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full transition-all duration-500 ${getQualityColor(rock.quality)}`}
              style={{ width: `${qualityPercent}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-xs text-slate-600">
            <span>0</span>
            <span>1000</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
