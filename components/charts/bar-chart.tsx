"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, TooltipProps } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface BarChartProps {
  data: Array<{
    timestamp: string
    [key: string]: number | string
  }>
}

type BarChartData = {
  timestamp: string
  [key: string]: number | string
}

export function BarChartComponent({ data }: BarChartProps) {
  if (!data?.length) {
    console.log('No data provided to BarChartComponent')
    return null
  }

  console.log('BarChartComponent received data:', JSON.stringify(data, null, 2))

  // Get all symbols from all data points (excluding the timestamp key)
  const symbols = Array.from(new Set(
    data.flatMap(point => Object.keys(point))
  )).filter(key => key !== 'timestamp')
  
  console.log('Extracted symbols:', symbols)

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

  console.log('Normalized data:', JSON.stringify(normalizedData, null, 2))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Position Values</CardTitle>
        <CardDescription>Historical value of each position</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={normalizedData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="timestamp"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
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
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip
                content={({ active, payload, label }: TooltipProps<number, string>) => {
                  if (active && payload && payload.length) {
                    console.log('Tooltip payload:', payload)
                    const date = new Date(label)
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="mb-2">
                          <span className="font-bold">
                            {date.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {payload.map((entry, index) => {
                            const value = entry.value as number
                            console.log('Tooltip entry:', entry)
                            return (
                              <div key={index} className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  {entry.name}
                                </span>
                                <span className="font-bold">
                                  ${value.toLocaleString()}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              {symbols.map((symbol) => {
                console.log('Creating bar for symbol:', symbol)
                return (
                  <Bar
                    key={symbol}
                    dataKey={symbol}
                    stackId="a"
                    fill={`hsl(${(symbols.indexOf(symbol) * 60) % 360}, 70%, 50%)`}
                  />
                )
              })}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
