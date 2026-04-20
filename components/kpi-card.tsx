import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface KPICardProps {
  label: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: React.ComponentType<{ className?: string }>
}

export function KPICard({ label, value, change, changeLabel, icon: Icon }: KPICardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1">
                {change > 0 ? (
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                ) : change < 0 ? (
                  <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                ) : (
                  <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                <span
                  className={cn(
                    "text-xs font-medium",
                    change > 0 && "text-emerald-600",
                    change < 0 && "text-red-500",
                    change === 0 && "text-muted-foreground"
                  )}
                >
                  {change > 0 ? "+" : ""}
                  {change}% {changeLabel || ""}
                </span>
              </div>
            )}
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
