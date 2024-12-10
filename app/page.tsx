'use client'

import {
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import TradingviewChart from '@/components/charts/tradingview-chart'
import { Card } from "@/components/ui/card"
import { BarChartComponent } from "@/components/charts/bar-chart"
import { PieChartComponent } from "@/components/charts/pie-chart"
import { LineChartComponent } from "@/components/charts/line-chart"
import { RadialChartComponent } from "@/components/charts/radial-chart"
import { HalfRadialChartComponent } from "@/components/charts/half-radial-chart"
import { StackedBarChartComponent } from "@/components/charts/stacked-bar-chart"
import { RadarChartComponent } from "@/components/charts/radar-chart"
import { TickerCarousel } from "@/components/ticker-carousel"


const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-4">
      <div className="w-full max-w-7xl">
        <TickerCarousel />
      </div>
      {/* Grid layout */}
      <div className="w-full max-w-7xl grid grid-cols-2 gap-2">
        <BarChartComponent/>
        <PieChartComponent/>
      </div>
      <div className="w-full max-w-7xl grid gap-2">
        <LineChartComponent/>
      </div>
      <div className="w-full max-w-7xl grid grid-cols-2 gap-2">
        <RadialChartComponent/>
        <HalfRadialChartComponent/>
      </div>
      <div className="w-full max-w-7xl grid grid-cols-2 gap-2">
        <StackedBarChartComponent/>
        <RadarChartComponent/>
      </div>
      {/* Chart container */}
      <div className="w-full max-w-7xl h-[80vh] border border-gray-200 dark:border-white/20 rounded-lg">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel>
            <TradingviewChart/>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}

export default Home