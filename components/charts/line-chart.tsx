"use client"

import * as React from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { ChartDataPoint } from "@/utils/types"

interface LineChartProps {
  data: ChartDataPoint[]
  title?: string
  subtitle?: string
}

export function LineChartComponent({ 
  data, 
  title = "Portfolio Value", 
  subtitle = "Historical value progression"
}: LineChartProps) {
  if (!data?.length) {
    return null
  }

  // Calculate the maximum value for proper Y-axis scaling
  const maxValue = Math.max(...data.map(d => d.value))
  const roundedMax = Math.ceil(maxValue / 50000) * 50000

  // Calculate percentage change from first day
  const lastValue = data[data.length - 1]?.value || 0
  const firstDayValue = data.find(d => d.value > 0)?.value || lastValue
  const percentageChange = firstDayValue ? ((lastValue - firstDayValue) / firstDayValue) * 100 : 0

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false}
            />
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
              ticks={[0, 50000, 100000, roundedMax]}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              interval={0}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const date = new Date(label)
                  const value = payload[0].value as number
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
                          <span className="text-sm font-bold text-muted-foreground">
                            ${value.toLocaleString()}
                          </span>
                        </div>
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
              dot={false}
              style={{
                stroke: "hsl(var(--primary))",
                opacity: 0.8,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          {percentageChange >= 0 ? (
            <>
              Up {percentageChange.toFixed(1)}% overall <TrendingUp className="h-4 w-4 text-green-500" />
            </>
          ) : (
            <>
              Down {Math.abs(percentageChange).toFixed(1)}% overall <TrendingDown className="h-4 w-4 text-red-500" />
            </>
          )}
        </div>
        <div className="leading-none text-muted-foreground">
          From {new Date(data[0]?.timestamp).toLocaleDateString()} to {new Date(data[data.length - 1]?.timestamp).toLocaleDateString()}
        </div>
      </CardFooter>
    </Card>
  )
}
