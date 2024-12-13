"use client"

import { Activity, LineChart, Sigma, TrendingDown, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { calculateMetrics } from "@/utils/ratios"
import { ChartDataPoint } from "@/utils/types"

interface PortfolioSummaryProps {
  data?: ChartDataPoint[]
  marketData?: ChartDataPoint[]
}

export function PortfolioSummaryComponent({ data = [], marketData = [] }: PortfolioSummaryProps) {
  const currentDate = new Date().toLocaleDateString()
  const currentValue = data[data.length - 1]?.value || 0
  const previousValue = data.length > 1 ? data[data.length - 2]?.value : currentValue
  const dayChange = currentValue - previousValue
  const dayChangePercent = previousValue !== 0 ? (dayChange / previousValue) * 100 : 0

  // Calculate all metrics using the ratios utility
  const metrics = calculateMetrics(data, marketData)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Summary</CardTitle>
        <CardDescription>Portfolio overview</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-row lg:flex-col gap-8 h-full">
          {/* Main metrics */}
          <div className="space-y-6 flex-1">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Current Value
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {currentDate}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-3xl font-bold">
                  ${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className={cn(
                  "text-lg flex items-center gap-1",
                  dayChangePercent > 0 ? "text-green-500" : "text-red-500"
                )}>
                  ${Math.abs(dayChange).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({dayChangePercent > 0 ? "+" : ""}{dayChangePercent.toFixed(1)}%)
                  {dayChangePercent > 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                </div>
              </div>
            </div>
          </div>

          {/* Risk metrics */}
          <div className="grid grid-cols-3 gap-6 flex-1 lg:mt-8 lg:w-11/12">
            {/* Volatility */}
            <div className="flex flex-col justify-between h-28">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <p className="text-base font-medium truncate">Volatility</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-sm flex justify-between">
                  <span className="text-muted-foreground">1D:</span>
                  <span className="font-medium">{metrics.volatility.daily.toFixed(1)}%</span>
                </p>
                <p className="text-sm flex justify-between">
                  <span className="text-muted-foreground">1W:</span>
                  <span className="font-medium">{metrics.volatility.weekly.toFixed(1)}%</span>
                </p>
              </div>
            </div>

            {/* Sharpe Ratio */}
            <div className="flex flex-col justify-between h-28">
              <div className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <p className="text-base font-medium truncate">Sharpe Ratio</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-sm flex justify-between">
                  <span className="text-muted-foreground">3M:</span>
                  <span className="font-medium">{metrics.sharpeRatio.threeMonth.toFixed(1)}</span>
                </p>
                <p className="text-sm flex justify-between">
                  <span className="text-muted-foreground">6M:</span>
                  <span className="font-medium">{metrics.sharpeRatio.sixMonth.toFixed(1)}</span>
                </p>
              </div>
            </div>

            {/* Treynor Ratio */}
            <div className="flex flex-col justify-between h-28">
              <div className="flex items-center gap-2">
                <Sigma className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <p className="text-base font-medium truncate">Treynor Ratio</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-sm flex justify-between">
                  <span className="text-muted-foreground">3M:</span>
                  <span className="font-medium">{metrics.treynorRatio.threeMonth.toFixed(1)}</span>
                </p>
                <p className="text-sm flex justify-between">
                  <span className="text-muted-foreground">6M:</span>
                  <span className="font-medium">{metrics.treynorRatio.sixMonth.toFixed(1)}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
