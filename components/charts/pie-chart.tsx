"use client"

import * as React from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Label, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface PieChartProps {
  data: Array<{
    symbol: string
    value: number
  }>
  title?: string
  subtitle?: string
}

// Helper function to format numbers with k/M suffixes
const formatValue = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`
  }
  return `$${value.toFixed(0)}`
}

// Helper function to get chart colors
const getChartColor = (index: number): string => {
  return `hsl(var(--chart-${(index % 5) + 1}))`
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, totalValue }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const percentage = ((data.value / totalValue) * 100).toFixed(1)
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              {data.symbol}
            </span>
            <span className="font-bold">
              {formatValue(data.value)} ({percentage}%)
            </span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

export function PieChartComponent({ 
  data,
  title = "Asset Allocation",
  subtitle = "Distribution by position"
}: PieChartProps) {
  // Calculate total value first, before any conditional returns
  const totalValue = React.useMemo(() => {
    return data?.reduce((acc, curr) => acc + curr.value, 0) || 0
  }, [data])

  if (!data?.length) {
    return null
  }

  // Calculate the month-over-month change (this is a placeholder, replace with actual data)
  const monthChange = 5.2
  
  // Transform data to include colors
  const chartData = data.map((item, index) => ({
    ...item,
    fill: getChartColor(index)
  }))

  return (
    <Card className="h-full flex flex-col border">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <div className="mx-auto aspect-square max-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="symbol"
                innerRadius={60}
                strokeWidth={0}
                paddingAngle={2}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-lg font-bold"
                          >
                            {formatValue(totalValue)}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 20}
                            className="fill-muted-foreground text-sm"
                          >
                            Total Value
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
              <Tooltip 
                content={props => <CustomTooltip {...props} totalValue={totalValue} />}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="grid grid-cols-2 gap-2 w-full">
          {chartData.map((item) => {
            const percentage = ((item.value / totalValue) * 100).toFixed(1)
            return (
              <div key={item.symbol} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                <span className="font-medium">{item.symbol}:</span>
                <span className="text-muted-foreground">{percentage}%</span>
              </div>
            )
          })}
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          {monthChange >= 0 ? (
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span>Up {monthChange}% this month</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-red-500" />
              <span>Down {Math.abs(monthChange)}% this month</span>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
