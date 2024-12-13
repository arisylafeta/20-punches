"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ReactNode } from "react"

interface PortfolioChartsProps {
  leftComponent: ReactNode
  rightComponent: ReactNode
}

export function PortfolioChartsComponent({ 
  leftComponent, 
  rightComponent,
}: PortfolioChartsProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-6">
          <div className="w-1/3">
            {leftComponent}
          </div>
          <div className="w-2/3">
            {rightComponent}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
