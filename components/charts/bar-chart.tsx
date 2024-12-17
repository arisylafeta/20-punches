"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { ArrowUpDown } from "lucide-react"
import { ChartDataPoint } from "@/utils/types"
import { calculatePortfolioHistory } from '@/lib/db/trades'
import { usePortfolio } from '@/contexts/portfolio-context'

// Helper function to get chart colors
const getChartColor = (index: number): string => {
  return `hsl(var(--chart-${(index % 5) + 1}))`
}

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

interface NormalizedDataPoint extends ChartDataPoint {
  [symbol: string]: string | number | undefined;
}

interface BarChartProps {
  title?: string
  subtitle?: string
  timeRange?: "1M" | "6M" | "1Y"
  onTimeRangeChange?: (range: "1M" | "6M" | "1Y") => void
}

export function BarChartComponent({ 
  title = "Position Values", 
  subtitle = "Value distribution by position",
  timeRange: externalTimeRange,
  onTimeRangeChange
}: BarChartProps) {
  const [data, setData] = useState<NormalizedDataPoint[]>([])
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

        // Convert portfolio history to bar chart data format
        const barData = history.map(day => {
          const dataPoint: NormalizedDataPoint = {
            timestamp: day.timestamp,
            value: day.totalValue,
            deposit: 0  // Required by ChartDataPoint type
          }
          // Add position values as dynamic properties
          Object.entries(day.positions).forEach(([symbol, position]) => {
            dataPoint[symbol] = position.value
          })
          return dataPoint
        })

        setData(barData)
      } catch (error) {
        console.error('Error fetching bar chart data:', error)
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

  // Get all symbols from all data points (excluding the timestamp key)
  const symbols = Array.from(new Set(
    data.flatMap(point => Object.keys(point))
  )).filter(key => key !== 'timestamp' && key !== 'value' && key !== 'deposit')

  // Fill in missing values with 0
  const normalizedData = data.map(point => {
    const newPoint: NormalizedDataPoint = { ...point }
    symbols.forEach(symbol => {
      if (!(symbol in newPoint)) {
        newPoint[symbol] = 0
      }
    })
    return newPoint
  })

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </div>
        <div className="flex">
          {["1M", "6M", "1Y"].map((range) => {
            const timeRange = range as "1M" | "6M" | "1Y"
            return (
              <button
                key={range}
                data-active={timeRange === externalTimeRange || (externalTimeRange === undefined && timeRange === internalTimeRange)}
                className="relative z-30 flex flex-1 items-center justify-center gap-1 border-t px-6 py-4 text-center even:border-l hover:bg-muted/50 data-[active=true]:bg-muted/75 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => handleTimeRangeChange(timeRange)}
              >
                <span className="text-lg font-bold leading-none sm:text-xl">
                  {range}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={normalizedData}>
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
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid gap-1">
                          <div className="font-medium">
                            {new Date(payload[0].payload.timestamp).toLocaleDateString()}
                          </div>
                          {payload.map((entry, index) => (
                            entry.value !== undefined && (
                              <div key={entry.dataKey} className="text-sm">
                                <span className="inline-block w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: getChartColor(index) }}></span>
                                {entry.dataKey}: {formatNumber(Number(entry.value))}
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              {symbols.map((symbol, index) => (
                <Bar
                  key={symbol}
                  dataKey={symbol}
                  stackId="a"
                  fill={getChartColor(index)}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          <ArrowUpDown className="h-4 w-4" /> {symbols.length} Active Positions
        </div>
        <div className="leading-none text-muted-foreground">
          From {new Date(data[0]?.timestamp).toLocaleDateString()} to {new Date(data[data.length - 1]?.timestamp).toLocaleDateString()}
        </div>
      </CardFooter>
    </Card>
  )
}
