"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ReactNode } from "react"
import Link from "next/link"

interface ChartWrapperProps {
  children: ReactNode;
  message?: string;
}

function PremiumChartWrapper({ children, message = "Upgrade to Premium to access advanced portfolio analytics" }: ChartWrapperProps) {
  return (
    <Card className="relative h-full">
      <CardContent className="p-0 opacity-10 h-full">
        {children}
      </CardContent>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60">
        <p className="text-muted-foreground mb-4 text-center px-4">{message}</p>
        <Link 
          href="/pricing" 
          className="text-primary hover:underline"
        >
          Upgrade to Premium →
        </Link>
      </div>
    </Card>
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
    <Card className="bg-background border-none w-full">
      <CardContent className="space-y-6 w-full p-0">
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
