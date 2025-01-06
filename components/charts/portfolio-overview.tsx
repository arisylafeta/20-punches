"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ReactNode } from "react"

interface ChartWrapperProps {
  children: ReactNode;
  message?: string;
}

function PremiumChartWrapper({ children, message = "Upgrade to Premium to access advanced portfolio analytics" }: ChartWrapperProps) {
  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center rounded-lg">
        <p className="text-muted-foreground text-center px-4">
          {message}
        </p>
      </div>
    </div>
  )
}

interface PortfolioOverviewProps {
  topLeftComponent: ReactNode
  topRightComponent: ReactNode
  bottomLeftComponent: ReactNode
  bottomRightComponent: ReactNode
  isPremium?: boolean
}

export function PortfolioOverviewComponent({ 
  topLeftComponent, 
  topRightComponent,
  bottomLeftComponent,
  bottomRightComponent,
  isPremium = false,
}: PortfolioOverviewProps) {
  return (
    <Card className="bg-background border-none">
      <CardContent className="p-4 space-y-6">
        {/* First row */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/3">
            {isPremium ? topLeftComponent : (
              <PremiumChartWrapper>
                {topLeftComponent}
              </PremiumChartWrapper>
            )}
          </div>
          <div className="w-full lg:w-2/3">
            {isPremium ? topRightComponent : (
              <PremiumChartWrapper>
                {topRightComponent}
              </PremiumChartWrapper>
            )}
          </div>
        </div>
        {/* Second row - mirrored */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-2/3">
            {isPremium ? bottomLeftComponent : (
              <PremiumChartWrapper>
                {bottomLeftComponent}
              </PremiumChartWrapper>
            )}
          </div>
          <div className="w-full lg:w-1/3">
            {isPremium ? bottomRightComponent : (
              <PremiumChartWrapper>
                {bottomRightComponent}
              </PremiumChartWrapper>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
