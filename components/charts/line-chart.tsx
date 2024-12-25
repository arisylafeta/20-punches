"use client"

import { useEffect, useState } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { ChartDataPoint } from "@/utils/types"
import { calculatePortfolioHistory } from '@/lib/db/trades'
import { usePortfolio } from '@/contexts/portfolio-context'

// Helper function to format numbers with k/M suffixes
const formatNumber = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}k`
  }
  return `$${value.toFixed(0)}`
}

interface LineChartProps {
  title?: string
  subtitle?: string
  timeRange?: "1M" | "6M" | "1Y"
  onTimeRangeChange?: (range: "1M" | "6M" | "1Y") => void
}

export function LineChartComponent({ 
  title = "Portfolio Value", 
  subtitle = "Historical value progression",
  timeRange: externalTimeRange,
  onTimeRangeChange
}: LineChartProps) {
  const [data, setData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [internalTimeRange, setInternalTimeRange] = useState<"1M" | "6M" | "1Y">("1M")
  const { lastUpdate } = usePortfolio()

  // Use external timeRange if provided, otherwise use internal
  const timeRange = externalTimeRange || internalTimeRange

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const history = await calculatePortfolioHistory(undefined, new Date(), timeRange)
        
        if (!history || history.length === 0) return

        const lineData: ChartDataPoint[] = history.map((day, index) => {
          const previousDay = index > 0 ? history[index - 1] : null;
          const deposit = previousDay 
            ? Object.entries(day.positions).reduce((sum, [symbol, position]) => {
                const prevPosition = previousDay.positions[symbol];
                if (!prevPosition) return sum + position.value;
                const shareChange = position.shares - prevPosition.shares;
                return sum + (shareChange > 0 ? shareChange * position.avgPrice : 0);
              }, 0)
            : 0;

          return {
            timestamp: day.timestamp,
            value: day.totalValue,
            deposit: deposit
          };
        });

        setData(lineData)
      } catch (error) {
        console.error('Error fetching line chart data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [timeRange, lastUpdate])

  const handleTimeRangeChange = (range: "1M" | "6M" | "1Y") => {
    if (onTimeRangeChange) {
      onTimeRangeChange(range)
    } else {
      setInternalTimeRange(range)
    }
  }

  if (!data?.length) {
    return null
  }

  // Calculate change values based on the entire period
  const currentValue = data[data.length - 1]?.value || 0
  const firstValue = data.find(d => d.value > 0)?.value || currentValue
  const periodChange = currentValue - firstValue
  const periodChangePercent = (periodChange / firstValue) * 100

  console.log({
    timeRange,
    dataLength: data.length,
    currentValue,
    firstValue,
    periodChange,
    periodChangePercent,
    firstDate: new Date(data[0]?.timestamp).toLocaleDateString(),
    lastDate: new Date(data[data.length - 1]?.timestamp).toLocaleDateString(),
    data: data.map(d => ({ timestamp: new Date(d.timestamp).toLocaleDateString(), value: d.value }))
  })

  // Get period label based on timeRange
  const getPeriodLabel = () => {
    switch (timeRange) {
      case "1M":
        return "1 Month"
      case "6M":
        return "6 Months"
      case "1Y":
        return "1 Year"
      default:
        return "Period"
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </div>
        <div className="flex">
          {["1M", "6M", "1Y"].map((range) => (
            <button
              key={range}
              data-active={range === timeRange}
              className="relative z-30 flex flex-1 items-center justify-center gap-1 border-t px-6 py-4 text-center even:border-l hover:bg-muted/50 data-[active=true]:bg-muted/75 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
              onClick={() => handleTimeRangeChange(range as "1M" | "6M" | "1Y")}
            >
              <span className="text-lg font-bold leading-none sm:text-xl">
                {range}
              </span>
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="timestamp"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={formatNumber}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const dataPoint = payload[0].payload
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-2">
                        <div className="font-medium">
                          {new Date(dataPoint.timestamp).toLocaleDateString()}
                        </div>
                        <div className="text-sm">
                          Value: {formatNumber(dataPoint.value)}
                        </div>
                        {dataPoint.deposit > 0 && (
                          <div className="text-sm text-muted-foreground">
                            Deposit: {formatNumber(dataPoint.deposit)}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              strokeWidth={2}
              activeDot={{
                r: 4,
                style: { fill: "hsl(var(--primary))" },
              }}
              style={{
                stroke: "hsl(var(--primary))",
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          {periodChange >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          {formatNumber(Math.abs(periodChange))} ({periodChangePercent.toFixed(2)}%) over {getPeriodLabel().toLowerCase()}
        </div>
        <div className="leading-none text-muted-foreground">
          From {new Date(data[0]?.timestamp).toLocaleDateString()} to{" "}
          {new Date(data[data.length - 1]?.timestamp).toLocaleDateString()}
        </div>
      </CardFooter>
    </Card>
  )
}

