"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ReactNode } from "react"

interface PortfolioOverviewProps {
  topLeftComponent: ReactNode
  topRightComponent: ReactNode
  bottomLeftComponent: ReactNode
  bottomRightComponent: ReactNode
  data: any // Keep this for the summary calculations
}

export function PortfolioOverviewComponent({ 
  topLeftComponent, 
  topRightComponent,
  bottomLeftComponent,
  bottomRightComponent,
  data 
}: PortfolioOverviewProps) {
  // Calculate summary data
  const currentValue = data[data.length - 1]?.value || 0
  const previousValue = data[data.length - 2]?.value || currentValue
  const dayChange = currentValue - previousValue
  const dayChangePercent = (dayChange / previousValue) * 100

  return (
    <Card className="bg-background border-none">
      <CardContent className="p-6 space-y-6">
        {/* First row */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/3">
            {topLeftComponent}
          </div>
          <div className="w-full lg:w-2/3">
            {topRightComponent}
          </div>
        </div>
        {/* Second row - mirrored */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-2/3">
            {bottomLeftComponent}
          </div>
          <div className="w-full lg:w-1/3">
            {bottomRightComponent}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
