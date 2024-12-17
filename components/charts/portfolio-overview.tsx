"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ReactNode } from "react"

interface PortfolioOverviewProps {
  topLeftComponent: ReactNode
  topRightComponent: ReactNode
  bottomLeftComponent: ReactNode
  bottomRightComponent: ReactNode
}

export function PortfolioOverviewComponent({ 
  topLeftComponent, 
  topRightComponent,
  bottomLeftComponent,
  bottomRightComponent,
}: PortfolioOverviewProps) {
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
