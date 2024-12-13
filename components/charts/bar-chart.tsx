"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { ArrowUpDown } from "lucide-react"

// Helper function to get chart colors
const getChartColor = (index: number): string => {
  return `hsl(var(--chart-${(index % 5) + 1}))`
}

interface BarChartProps {
  data: Array<{
    timestamp: string
    [key: string]: number | string
  }>
  title?: string
  subtitle?: string
}

export function BarChartComponent({ 
  data, 
  title = "Position Values", 
  subtitle = "Value distribution by position"
}: BarChartProps) {
  if (!data?.length) {
    return null
  }

  // Get all symbols from all data points (excluding the timestamp key)
  const symbols = Array.from(new Set(
    data.flatMap(point => Object.keys(point))
  )).filter(key => key !== 'timestamp')

  // Fill in missing values with 0
  const normalizedData = data.map(point => {
    const newPoint = { ...point }
    symbols.forEach(symbol => {
      if (!(symbol in newPoint)) {
        newPoint[symbol] = 0
      }
    })
    return newPoint
  })

  // Calculate the maximum value for proper Y-axis scaling
  const maxValue = Math.max(...normalizedData.map(d => {
    const values = Object.entries(d)
      .filter(([key, value]) => key !== 'timestamp' && typeof value === 'number')
      .map(([_, value]) => value as number)
    return Math.max(...values)
  }))
  
  // Round to nearest 50k
  const roundedMax = Math.ceil(maxValue / 50000) * 50000
  
  // Create ticks array based on rounded max
  const tickStep = 50000
  const ticks = Array.from(
    { length: Math.floor(roundedMax / tickStep) + 1 },
    (_, i) => i * tickStep
  )

  // Calculate total positions
  const totalPositions = symbols.length

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={normalizedData}
            margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="timestamp"
              tickLine={false}
              axisLine={false}
              tickMargin={2}
              minTickGap={32}
              tick={{ fontSize: 11 }}
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
              tickMargin={2}
              axisLine={false}
              tick={{ fontSize: 11 }}
              domain={[0, roundedMax]}
              ticks={ticks}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              interval={0}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const date = new Date(label)
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-1">
                        <div className="flex flex-col">
                          <span className="text-[0.65rem] uppercase text-muted-foreground">
                            {date.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          {payload.map((item: any, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                              <div
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: getChartColor(index) }}
                              />
                              <span className="text-[0.65rem] uppercase text-muted-foreground">
                                {item.name}:
                              </span>
                              <span className="text-sm font-bold text-muted-foreground">
                                ${item.value.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
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
                radius={[4, 4, 0, 0]}
                opacity={0.8}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          <ArrowUpDown className="h-4 w-4" /> {totalPositions} Active Positions
        </div>
        <div className="leading-none text-muted-foreground">
          From {new Date(data[0]?.timestamp).toLocaleDateString()} to {new Date(data[data.length - 1]?.timestamp).toLocaleDateString()}
        </div>
      </CardFooter>
    </Card>
  )
}
