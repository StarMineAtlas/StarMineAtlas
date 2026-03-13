import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Rock } from "@/data/rocks"
import { Gem, Layers, CircleDot } from "lucide-react"

interface RockCardProps {
  rock: Rock
}

export function RockCard({ rock }: RockCardProps) {
  return (
    <Card className="group border-slate-800 bg-slate-900/50 transition-all duration-300 hover:border-cyan-700/50 hover:bg-slate-900 hover:shadow-lg hover:shadow-cyan-900/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-cyan-50">
          <Gem className="h-5 w-5 text-cyan-400" />
          {rock.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <CircleDot className="h-4 w-4 text-cyan-500" />
          <span className="text-sm text-slate-400">Primary:</span>
          <Badge
            variant="secondary"
            className="border-cyan-700/50 bg-cyan-950/50 text-cyan-300"
          >
            {rock.primary}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Layers className="h-4 w-4 text-slate-500" />
          <span className="text-sm text-slate-400">Secondary:</span>
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
            <span className="text-sm text-slate-500">None</span>
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-slate-800 pt-3">
          <div
            className={`h-2 w-2 rounded-full ${
              rock.inert ? "bg-amber-500" : "bg-slate-600"
            }`}
          />
          <span className="text-sm text-slate-400">
            Inert Material:{" "}
            <span className={rock.inert ? "text-amber-400" : "text-slate-500"}>
              {rock.inert ? "Yes" : "No"}
            </span>
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
